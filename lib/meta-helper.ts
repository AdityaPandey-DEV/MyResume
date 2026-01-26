
import axios from 'axios';

export async function getOgImage(url: string): Promise<string | null> {
    try {
        console.log(`Fetching OG image for: ${url}`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 8000
        });

        // 1. Try standard og:image
        let match = data.match(/<meta property="og:image" content="([^"]+)"/i);
        if (match && match[1]) return resolveUrl(url, match[1]);

        // 2. Try twitter:image
        match = data.match(/<meta name="twitter:image" content="([^"]+)"/i);
        if (match && match[1]) return resolveUrl(url, match[1]);

        // 3. Try link rel="image_src"
        match = data.match(/<link rel="image_src" href="([^"]+)"/i);
        if (match && match[1]) return resolveUrl(url, match[1]);

        // 4. Try finding the first img tag that looks like a simplified screenshot or hero
        // This is risky but often better than nothing for a portfolio
        // const firstImg = data.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
        // if (firstImg && firstImg[1]) return resolveUrl(url, firstImg[1]);

        console.log('No OG image found.');
        return null;
    } catch (error: any) {
        console.error(`Failed to fetch OG image for ${url}:`, error.message);
        return null;
    }
}

// Helper to getting a screenshot URL
export function getScreenshotUrl(url: string): string {
    // Using a more direct service for img tags
    // We'll try the Microlink direct screenshot redirect or a similar public service
    return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
    // Note: If this still fails, 11ty or other services are alternatives.
}

function resolveUrl(baseUrl: string, relativeUrl: string): string {
    if (relativeUrl.startsWith('http')) return relativeUrl;
    try {
        const base = new URL(baseUrl);
        return new URL(relativeUrl, base.origin).href;
    } catch {
        return relativeUrl;
    }
}
