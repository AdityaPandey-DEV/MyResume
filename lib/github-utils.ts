
export async function fetchGithubReadme(repoUrl: string): Promise<string | null> {
    try {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return null;

        const owner = match[1];
        const repo = match[2].replace('.git', '');
        const token = process.env.GITHUB_TOKEN;

        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3.raw', // Request raw content
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        // Try main branches
        const branches = ['main', 'master'];

        for (const branch of branches) {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
                headers
            });

            if (response.ok) {
                return await response.text();
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching README:', error);
        return null;
    }
}

export async function fetchRepoFileTree(repoUrl: string): Promise<string[]> {
    try {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return [];

        const owner = match[1];
        const repo = match[2].replace('.git', '');
        const token = process.env.GITHUB_TOKEN;

        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        // Get default branch SHA
        let defaultBranch = 'main';
        try {
            const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
            if (repoRes.ok) {
                const repoInfo = await repoRes.json();
                defaultBranch = repoInfo.default_branch || 'main';
            } else {
                console.warn(`Failed to fetch repo info for ${repo}: ${repoRes.status} ${repoRes.statusText}`);
                // If rate limited, we can't guess branch, but 'main' or 'master' are good bets.
            }
        } catch (e) {
            console.warn("Repo Info fetch error:", e);
        }

        // Get Tree Recursively - Attempt 1 (Detected/Default Branch)
        let treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
        let response = await fetch(treeUrl, { headers });

        // Fallback: If 'main' failed (404), try 'master'
        if (!response.ok && defaultBranch === 'main') {
            console.log("Main branch failed, trying master...");
            treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
            response = await fetch(treeUrl, { headers });
        }

        if (!response.ok) {
            console.error(`Tree fetch failed for ${repo}: ${response.status}`);
            return [];
        }

        const data = await response.json();
        if (!data.tree) return [];

        // Filter and format: Limit to top 500 files to allow broad search, avoid node_modules, .git etc.
        const files = data.tree
            .filter((item: any) => item.type === 'blob' || item.type === 'tree')
            .filter((item: any) => !item.path.includes('node_modules') && !item.path.includes('.git') && !item.path.startsWith('dist/') && !item.path.startsWith('build/') && !item.path.includes('package-lock.json'))
            .map((item: any) => item.path);

        return files; // Return array of paths

    } catch (error) {
        console.error('Error fetching File Tree:', error);
        return [];
    }
}
