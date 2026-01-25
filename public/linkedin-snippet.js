
// ==========================================
// LINKEDIN PROFILE EXTRACTOR SNIPPET
// ==========================================
// 1. Go to your LinkedIn Profile Page.
// 2. Open Console (F12 -> Console).
// 3. Paste this entire script and hit Enter.
// 4. Copy the JSON output string.

(function () {
    function getSection(titleKeywords) {
        const sections = Array.from(document.querySelectorAll('section'));
        return sections.find(sec => {
            const header = sec.querySelector('.pvs-header__title, .artdeco-card__header');
            if (!header) return false;
            const text = header.innerText.toLowerCase();
            return titleKeywords.some(keyword => text.includes(keyword));
        });
    }

    function extractEducation() {
        const section = getSection(['education']);
        if (!section) return [];

        const items = Array.from(section.querySelectorAll('li.artdeco-list__item'));
        return items.map(item => {
            const titleEl = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
            const subTitleEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
            const dateEl = item.querySelector('span.t-14.t-black--light span[aria-hidden="true"]');

            return {
                institution: titleEl ? titleEl.innerText.trim() : '',
                degree: subTitleEl ? subTitleEl.innerText.trim() : '',
                duration: dateEl ? dateEl.innerText.trim() : ''
            };
        }).filter(item => item.institution);
    }

    function extractCertifications() {
        // Look for "Licenses & certifications" or just "Certifications"
        const section = getSection(['licenses', 'certifications']);
        if (!section) return [];

        const items = Array.from(section.querySelectorAll('li.artdeco-list__item'));
        return items.map(item => {
            const titleEl = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
            const issuerEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
            const dateEl = item.querySelector('span.t-14.t-black--light span[aria-hidden="true"]');

            // Try to find the credential URL
            const anchor = item.querySelector('a.app-aware-link');
            const url = anchor ? anchor.href : '';

            // Try to find image
            const img = item.querySelector('img');

            return {
                title: titleEl ? titleEl.innerText.trim() : '',
                organization: issuerEl ? issuerEl.innerText.trim() : '',
                date: dateEl ? dateEl.innerText.trim() : '',
                url: url,
                imageUrl: img ? img.src : ''
            };
        }).filter(item => item.title);
    }

    const data = {
        education: extractEducation(),
        certifications: extractCertifications()
    };

    console.clear();
    console.log("✅ DATA EXTRACTED SUCCESSFULLY!");
    console.log("👇 COPY THE TEXT BELOW (BETWEEN THE DASHES) 👇");
    console.log("---------------------------------------------------");
    console.log(JSON.stringify(data));
    console.log("---------------------------------------------------");
    return data;
})();
