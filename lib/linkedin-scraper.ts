
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'scraper.log');

function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
    console.log(message);
}

export async function scrapeLinkedInProfile(username: string, cookie: string) {
    let browser;
    try {
        logToFile('Attempting to connect to existing Chrome instance...');
        try {
            browser = await puppeteer.connect({
                browserURL: 'http://127.0.0.1:9222',
                defaultViewport: null,
            });
            logToFile('Successfully connected to existing Chrome!');
        } catch (e) {
            logToFile('Could not connect to existing Chrome. Falling back to launch... (This may fail due to bot detection)');
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920,1080'
                ]
            });
        }

        const page = await browser.newPage();

        // If connected to existing, we don't need to set cookies if the user is already logged in.
        // But if we launched, we need cookies.
        // We'll check if we are on linkedin.com.

        // 1. Set Cookie (Only if needed/safe - usually safe to overwrite or add)
        if (cookie) {
            console.log(`Setting cookie (Length: ${cookie.length})...`);
            await page.setCookie({
                name: 'li_at',
                value: cookie,
                domain: '.linkedin.com',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            });
        }

        // Optimize: Block images/fonts to speed up loading and avoid timeouts
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // 1. Set Cookie
        console.log(`Setting cookie (Length: ${cookie.length})...`);
        await page.setCookie({
            name: 'li_at',
            value: cookie,
            domain: '.linkedin.com', // Changed from .www.linkedin.com to cover root
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        // 2. Set Headers to look real
        await page.setViewport({ width: 1920, height: 1080 }); // Standard desktop
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        });

        // 3. Navigate to Feed first to validate session
        logToFile('Navigating to LinkedIn Feed to validate session...');
        try {
            await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
            logToFile(`Current URL after Feed: ${page.url()}`);
        } catch (e: any) {
            logToFile(`Feed navigation error: ${e.message}`);
        }

        // 3.5 Navigate to Profile
        // Remove trailing slash which sometimes causes redirects
        const profileUrl = `https://www.linkedin.com/in/${username.replace(/\/$/, '')}`;
        logToFile(`Navigating to Profile: ${profileUrl}`);

        try {
            await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (e: any) {
            logToFile(`Navigation timeout/error: ${e.message}.`);
            // Snapshot for debugging
            fs.writeFileSync(path.join(process.cwd(), 'scraper_dump.html'), await page.content());
        }

        logToFile('Waiting for profile content to load...');
        try {
            await page.waitForSelector('h1', { timeout: 30000 });
            logToFile('Profile h1 found.');
        } catch (e) {
            logToFile('Warning: Profile h1 not found. Snapshotting...');
            fs.writeFileSync(path.join(process.cwd(), 'scraper_dump.html'), await page.content());
        }

        // 4. Get Content
        const content = await page.content();
        fs.writeFileSync(path.join(process.cwd(), 'scraper_dump.html'), content);
        logToFile('Snapshot saved to scraper_dump.html');
        const $ = cheerio.load(content);

        // Basic Metadata
        const name = $('meta[property="og:title"]').attr('content') || '';
        const description = $('meta[property="og:description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';

        console.log('Scraped Metadata:', { name, description: description.substring(0, 20) });

        let education: any[] = [];
        let experience: any[] = [];

        // JSON-LD Parsing
        const jsonLd = $('script[type="application/ld+json"]');
        jsonLd.each((i, el) => {
            try {
                const data = JSON.parse($(el).html() || '{}');
                // Support both array and single object
                const items = Array.isArray(data) ? data : [data];

                for (const item of items) {
                    if (item['@type'] === 'Person') {
                        if (item.worksFor) {
                            const works = Array.isArray(item.worksFor) ? item.worksFor : [item.worksFor];
                            experience = works.map((w: any) => ({
                                company: w.name,
                                position: w.jobTitle || 'Employee',
                                duration: '',
                            }));
                        }
                        if (item.alumniOf) {
                            const edus = Array.isArray(item.alumniOf) ? item.alumniOf : [item.alumniOf];
                            education = edus.map((e: any) => ({
                                institution: e.name,
                                degree: '',
                            }));
                        }
                    }
                }
            } catch (e) { }
        });

        // DOM Fallback for Education
        try {
            if (education.length === 0) {
                const eduParams = $('h2.pvs-header__title:contains("Education")');
                if (eduParams.length > 0) {
                    const section = eduParams.closest('section');
                    const items = section.find('li.artdeco-list__item');

                    items.each((i, el) => {
                        const school = $(el).find('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]').first().text().trim();
                        const degree = $(el).find('span.t-14.t-normal span[aria-hidden="true"]').first().text().trim();
                        const dateText = $(el).find('span.t-14.t-black--light span[aria-hidden="true"]').first().text().trim();

                        if (school) {
                            education.push({
                                institution: school,
                                degree: degree || '',
                                duration: dateText || ''
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.log('DOM scrape error for Education:', e);
        }

        // DOM Fallback: Scan all sections for Education and Certifications
        let certifications: any[] = [];
        try {
            const sections = $('section');
            logToFile(`Scraper Debug: Found ${sections.length} sections.`);
            sections.each((i, section) => {
                const headerText = $(section).find('.pvs-header__title, .artdeco-card__header').text().trim();
                logToFile(`Scraper Debug: Section ${i} Header: "${headerText}"`);

                // Education Section
                if (headerText.includes('Education')) {
                    const items = $(section).find('li.artdeco-list__item');
                    items.each((j, el) => {
                        const school = $(el).find('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]').first().text().trim();
                        if (school && !education.some(e => e.institution === school)) {
                            const degree = $(el).find('span.t-14.t-normal span[aria-hidden="true"]').first().text().trim();
                            const dateText = $(el).find('span.t-14.t-black--light span[aria-hidden="true"]').first().text().trim();
                            education.push({
                                institution: school,
                                degree: degree || '',
                                duration: dateText || ''
                            });
                        }
                    });
                }

                // Certifications Section
                if (headerText.includes('Licenses') || headerText.includes('Certifications')) {
                    const items = $(section).find('li.artdeco-list__item');
                    items.each((j, el) => {
                        const title = $(el).find('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]').first().text().trim();
                        if (title && !certifications.some(c => c.title === title)) {
                            const org = $(el).find('span.t-14.t-normal span[aria-hidden="true"]').first().text().trim();
                            const dateText = $(el).find('span.t-14.t-black--light span[aria-hidden="true"]').first().text().trim();
                            const url = $(el).find('a.app-aware-link').attr('href');
                            const img = $(el).find('img').attr('src');

                            certifications.push({
                                title: title,
                                organization: org || 'Unknown',
                                date: dateText || '',
                                url: url || null,
                                imageUrl: img || null
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.log('DOM Scanning error:', e);
        }

        return {
            name,
            about: description,
            imageUrl: image,
            education,
            experience,
            certifications
        };


    } catch (error: any) {
        console.error('LinkedIn Scrape Error:', error);
        throw new Error(`Scraping failed: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}
