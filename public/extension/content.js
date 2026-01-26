chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_DATA") {
        // Legacy single-page scrape
        sendResponse(scrapeProfile());
    }
    if (request.action === "SCRAPE_MAIN_PAGE") {
        sendResponse(scrapeMainPage());
    }
    if (request.action === "SCRAPE_CERTS_PAGE") {
        sendResponse(scrapeCertsPage());
    }
    if (request.action === "SCRAPE_EDUCATION_PAGE") {
        sendResponse(scrapeEducationPage());
    }
    if (request.action === "SCRAPE_SKILLS_PAGE") {
        sendResponse(scrapeSkillsPage());
    }
});

function getSection(titleKeywords) {
    const sections = Array.from(document.querySelectorAll('section'));
    return sections.find(sec => {
        const header = sec.querySelector('.pvs-header__title, .artdeco-card__header');
        if (!header) return false;
        const text = header.innerText.toLowerCase();
        return titleKeywords.some(keyword => text.includes(keyword));
    });
}

function extractListItems(rootElement) {
    return Array.from(rootElement.querySelectorAll('li.artdeco-list__item'));
}

function parseEduItem(item) {
    const titleEl = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
    const subTitleEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
    const dateEl = item.querySelector('span.t-14.t-black--light span[aria-hidden="true"]');
    return {
        institution: titleEl ? titleEl.innerText.trim() : '',
        degree: subTitleEl ? subTitleEl.innerText.trim() : '',
        duration: dateEl ? dateEl.innerText.trim() : ''
    };
}

function parseCertItem(item) {
    const titleEl = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
    const issuerEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
    const dateEl = item.querySelector('span.t-14.t-black--light span[aria-hidden="true"]');

    // Try to find the credential URL
    const anchor = item.querySelector('a.app-aware-link');
    const url = anchor ? anchor.href : '';

    // BETTER IMAGE EXTRACTION
    // 1. Look for internal media images (The ACTUAL certificate preview)
    const mediaImg = item.querySelector('.pvs-entity__extra-contents img, .pvs-list__outer-container img, .pvs-media-entity img');

    // 2. Look for company logo (favicon)
    const logoImg = item.querySelector('.ivm-view-model img, .ivm-image-view-model img, img');

    // Prioritize media for imageUrl, use logo for logoUrl
    const imageUrl = mediaImg ? mediaImg.src : '';
    const logoUrl = logoImg ? logoImg.src : '';

    return {
        title: titleEl ? titleEl.innerText.trim() : '',
        organization: issuerEl ? issuerEl.innerText.trim() : '',
        date: dateEl ? dateEl.innerText.trim() : '',
        url: url,
        imageUrl: imageUrl,
        logoUrl: logoUrl
    };
}

function parseSkillItem(item) {
    const titleEl = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
    return titleEl ? titleEl.innerText.trim() : '';
}

function scrapeMainPage() {
    // 1. Basic Metadata
    // Robust selectors for name
    let nameEl = document.querySelector('h1') ||
        document.querySelector('.text-heading-xlarge') ||
        document.querySelector('[data-generated-suggestion-target]');

    let name = nameEl?.innerText.trim();

    // Fallback: Parse from Document Title ("Name | LinkedIn")
    if (!name) {
        const titleParts = document.title.split('|');
        if (titleParts.length > 0 && titleParts[0].trim() !== 'LinkedIn') {
            name = titleParts[0].trim();
        }
    }

    // Fallback: Navbar Image Alt Text (Very Reliable)
    if (!name || name === 'LinkedIn') {
        const navImg = document.querySelector('img.global-nav__me-photo');
        if (navImg) {
            name = navImg.alt.trim();
        }
    }

    // Robust selectors for headline
    const headlineEl = document.querySelector('.text-body-medium.break-words') ||
        document.querySelector('[data-generated-suggestion-target] + div') ||
        document.querySelector('.pv-text-details__left-panel .text-body-medium');
    const headline = headlineEl?.innerText.trim() || '';

    // Robust selectors for location
    const locEl = document.querySelector('.text-body-small.inline.t-black--light.break-words') ||
        document.querySelector('.pv-text-details__left-panel span.text-body-small') ||
        Array.from(document.querySelectorAll('span.text-body-small')).find(el => el.innerText.includes(','));
    const location = locEl?.innerText.trim() || '';

    // Robust selectors for about
    const aboutEl = document.querySelector('.pv-about__summary-text') ||
        document.querySelector('#about ~ .display-flex .inline-show-more-text') ||
        document.querySelector('[id="about"] ~ .display-flex') ||
        document.querySelector('.pv-shared-text-with-see-more');
    const about = aboutEl?.innerText.trim() || '';

    const image = document.querySelector('.pv-top-card-profile-picture__image')?.src || '';

    // 2. Education
    const eduSection = getSection(['education']);
    let education = [];
    let educationUrl = null;

    if (eduSection) {
        // Check for footer "Show all" link
        const footerLink = eduSection.querySelector('.pvs-list__footer-wrapper a');
        if (footerLink) {
            educationUrl = footerLink.href;
        }

        education = extractListItems(eduSection).map(parseEduItem).filter(i => i.institution);
    }

    // 3. Certifications (Main Page Preview)
    const certSection = getSection(['licenses', 'certifications']);
    let certifications = [];
    let certificationsUrl = null;

    if (certSection) {
        // Check for footer "Show all" link
        const footerLink = certSection.querySelector('.pvs-list__footer-wrapper a');
        if (footerLink) {
            certificationsUrl = footerLink.href;
        }

        certifications = extractListItems(certSection).map(parseCertItem).filter(i => i.title);
    }

    // 4. Skills
    const skillSection = getSection(['skills']);
    let skills = [];
    let skillsUrl = null;

    if (skillSection) {
        const footerLink = skillSection.querySelector('.pvs-list__footer-wrapper a');
        if (footerLink) {
            skillsUrl = footerLink.href;
        }
        skills = extractListItems(skillSection).map(parseSkillItem).filter(i => i);
    }

    return {
        name,
        headline,
        location,
        about,
        imageUrl: image,
        education,
        educationUrl,
        certifications,
        certificationsUrl,
        skills,
        skillsUrl,
        profileUrl: window.location.href
    };
}

function scrapeEducationPage() {
    // We assume we are on the /details/education/ page
    const main = document.querySelector('main');
    if (!main) return { education: [] };

    const items = extractListItems(main);
    const education = items.map(parseEduItem).filter(i => i.institution);

    return { education };
}

function scrapeSkillsPage() {
    // We assume we are on the /details/skills/ page
    const main = document.querySelector('main');
    if (!main) return { skills: [] };
    const items = extractListItems(main);
    const skills = items.map(parseSkillItem).filter(i => i);
    return { skills };
}

function scrapeCertsPage() {
    // We assume we are on the /details/certifications/ page
    // The whole main element is likely the list container
    const main = document.querySelector('main');
    if (!main) return { certifications: [] };

    const items = extractListItems(main);
    const certifications = items.map(parseCertItem).filter(i => i.title);

    return { certifications };
}

// Helper for Legacy Call
function scrapeProfile() {
    return scrapeMainPage();
}
