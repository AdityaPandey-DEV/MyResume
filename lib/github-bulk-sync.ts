
import { syncProjectFromGithub } from '@/lib/github-sync';
import { prisma } from '@/lib/prisma';

export async function bulkSyncGithubProjects(username: string) {
    try {
        // Fetch all public repos
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);

        if (!res.ok) throw new Error(`Failed to fetch repos for ${username}: ${res.statusText}`);

        const repos = await res.json();

        const results = [];

        for (const repo of repos) {
            try {
                // Check if project exists by repoUrl
                const repoUrl = repo.html_url;

                // Try to find existing project by githubUrl (repoUrl)
                const existing = await prisma.project.findFirst({
                    where: {
                        OR: [
                            { repoUrl: repoUrl },
                            { githubUrl: repoUrl }
                        ]
                    }
                });

                if (existing) {
                    // Update existing
                    const updated = await syncProjectFromGithub(existing.id, repoUrl);
                    results.push({ title: updated.title, status: 'updated' });
                } else {
                    // Create new (Hidden by default)
                    const newProject = await prisma.project.create({
                        data: {
                            title: repo.name,
                            description: repo.description || '',
                            githubUrl: repoUrl,
                            repoUrl: repoUrl,
                            isVisible: false, // Inactive by default
                            syncEnabled: true,
                            technologies: [],
                        }
                    });

                    const synced = await syncProjectFromGithub(newProject.id, repoUrl);
                    results.push({ title: synced.title, status: 'created' });
                }
            } catch (err: any) {
                console.error(`Failed to sync repo ${repo.name}:`, err);
                results.push({ title: repo.name, status: 'error', error: err.message });
            }
        }

        return results;

    } catch (error) {
        console.error('Bulk Sync Error:', error);
        throw error;
    }
}
