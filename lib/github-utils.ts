
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
