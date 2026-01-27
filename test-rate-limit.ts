
import { fetchRepoFileTree } from './lib/github-utils';

async function test() {
    console.log("Testing parallel fetch to check Rate Limits...");
    const repos = [
        "https://github.com/AdityaPandey-DEV/PYQ-GEHU",
        "https://github.com/AdityaPandey-DEV/NOTES-GEHU",
        "https://github.com/AdityaPandey-DEV/Math-Game" // Assuming this exists or similar
    ];

    const results = await Promise.all(repos.map(async (url) => {
        console.log(`Fetching ${url}...`);
        const files = await fetchRepoFileTree(url);
        console.log(`Finished ${url}: ${files.length} files.`);
        return files.length;
    }));

    console.log("Results:", results);
}

test();
