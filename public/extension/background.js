let userProfileData = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_BACGROUND_SYNC") {
        handleSync(request.tabId);
        sendResponse({ status: "STARTED" });
    }
    return true; // Keep channel open
});

async function handleSync(tabId) {
    try {
        // 1. Scrape Main Profile
        // 1. Scrape Main Profile (with retry to ensure DOM is ready)
        console.log("Scraping Main Profile...");
        let mainData = null;
        let attempts = 0;

        while (attempts < 5) {
            mainData = await sendMessageToTab(tabId, { action: "SCRAPE_MAIN_PAGE" });
            if (mainData && mainData.name && mainData.name !== "LinkedIn") {
                console.log("Got Valid Main Data:", mainData.name);
                break;
            }
            console.log("Waiting for Main Profile DOM... Attempt:", attempts + 1);
            await new Promise(r => setTimeout(r, 1000)); // Wait 1s
            attempts++;
        }

        if (!mainData) {
            // Fallback if it really fails, but normally the loop catches it
            throw new Error("Failed to scrape main profile.");
        }

        userProfileData = mainData;

        // 2. Check for Education "See All" URL
        if (mainData.educationUrl) {
            console.log("Found Education URL, navigating...", mainData.educationUrl);
            await chrome.tabs.update(tabId, { url: mainData.educationUrl });
            await waitForTabLoad(tabId);

            console.log("Scraping Education Page...");
            await chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['content.js'] });

            const eduData = await sendMessageToTab(tabId, { action: "SCRAPE_EDUCATION_PAGE" });
            if (eduData && eduData.education) {
                console.log(`Merged ${eduData.education.length} education items.`);
                userProfileData.education = eduData.education;
            }
        }

        // 3. Check for Certifications "See All" URL
        if (mainData.certificationsUrl) {
            console.log("Found Certifications URL, navigating...", mainData.certificationsUrl);

            // Update Tab
            await chrome.tabs.update(tabId, { url: mainData.certificationsUrl });

            // Wait for load
            await waitForTabLoad(tabId);

            // Scrape Certifications Page
            console.log("Scraping Certifications Page...");
            // Inject script again just in case
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });

            const certsData = await sendMessageToTab(tabId, { action: "SCRAPE_CERTS_PAGE" });

            if (certsData && certsData.certifications) {
                console.log(`Merged ${certsData.certifications.length} certifications.`);
                userProfileData.certifications = certsData.certifications;
            }

            // Navigate back to original profile? Optional.
            // Let's go back so the user feels "anchored"
            // await chrome.tabs.update(tabId, { url: mainData.profileUrl });
        }

        // 4. Check for Skills "See All" URL
        if (mainData.skillsUrl) {
            console.log("Found Skills URL, navigating...", mainData.skillsUrl);

            await chrome.tabs.update(tabId, { url: mainData.skillsUrl });
            await waitForTabLoad(tabId);

            console.log("Scraping Skills Page...");
            await chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['content.js'] });

            const skillsData = await sendMessageToTab(tabId, { action: "SCRAPE_SKILLS_PAGE" });

            if (skillsData && skillsData.skills) {
                console.log(`Merged ${skillsData.skills.length} skills.`);
                userProfileData.skills = skillsData.skills;
            }
        }

        // 5. Post Data
        console.log("Posting to API...", userProfileData);

        let endpoint = 'https://adityapandeydev.vercel.app/api/sync/linkedin';

        // Try local first for development convenience, then fallback to production
        try {
            const localCheck = await fetch('http://localhost:3000/api/sync/linkedin', { method: 'OPTIONS' });
            if (localCheck.ok) endpoint = 'http://localhost:3000/api/sync/linkedin';
        } catch (e) {
            console.log("Local server not reachable, sticking with production.");
        }

        const apiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'json_payload',
                data: userProfileData
            })
        });

        if (apiRes.ok) {
            console.log("Sync Success!");
            chrome.action.setBadgeText({ text: "OK", tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: "#4caf50" }); // Green
        } else {
            console.error("API Error");
            chrome.action.setBadgeText({ text: "ERR", tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: "#f44336" }); // Red
        }

    } catch (e) {
        console.error("Sync Error:", e);
        chrome.action.setBadgeText({ text: "ERR", tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
    }
}

function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            resolve(response);
        });
    });
}

function waitForTabLoad(tabId) {
    return new Promise((resolve) => {
        const listener = (tid, changeInfo, tab) => {
            if (tid === tabId && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                // Small delay to let dynamic content render
                setTimeout(resolve, 3000);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}
