document.getElementById('syncBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = 'Scanning page...';
    status.className = '';

    try {
        // 1. Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.url.includes('linkedin.com/in/')) {
            status.textContent = 'Please go to your LinkedIn Profile page first.';
            status.className = 'error';
            return;
        }

        // 1.5 Inject content script manually to ensure it's there (fixes "Receiving end does not exist")
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        // 2. Trigger Background Sync Process (Handles navigation)
        status.textContent = 'Syncing... (Your tab may move)';

        chrome.runtime.sendMessage({ action: "START_BACGROUND_SYNC", tabId: tab.id }, (response) => {
            if (chrome.runtime.lastError) {
                status.textContent = 'Error: ' + chrome.runtime.lastError.message;
                status.className = 'error';
            } else {
                status.textContent = 'Sync Started in Background! Check the extension badge (OK/ERR) in a few seconds.';
                status.className = 'success';
            }
        });

    } catch (err) {
        console.error(err);
        status.textContent = 'Error: ' + err.message;
        status.className = 'error';
    }
});
