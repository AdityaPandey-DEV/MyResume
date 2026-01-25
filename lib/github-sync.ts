
import { prisma } from '@/lib/prisma';
// Dynamic imports for these to avoid circular deps or build issues if any, though standard import is fine here
import { generateEnhancedDescription } from '@/lib/gemini';
import { getOgImage, getScreenshotUrl } from '@/lib/meta-helper';

export async function syncProjectFromGithub(projectId: string, repoUrl: string) {
    try {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) throw new Error(`Invalid GitHub URL: ${repoUrl}`);

        const owner = match[1];
        const repo = match[2].replace('.git', '');

        const token = process.env.GITHUB_TOKEN;
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);

        const data = await response.json();

        let imageUrl = null;
        let liveDemoUrl = data.homepage || null;

        if (liveDemoUrl) {
            // User requested live preview screenshot
            imageUrl = getScreenshotUrl(liveDemoUrl);

            // Optional: Backup with OG image if screenshot fails? 
            // Since thum.io always returns an image (placeholder if loading), it's consistent.
            // We can still try to get OG image to see if it's a "Social Card" which is usually better.
            // But for now, let's stick to the user's request for "Live Preview Screenshot".
        }

        // Generate Description using Gemini
        // We pass the existing description or the one from GitHub
        const enhancedDescription = await generateEnhancedDescription(data.description || '', '');
        const finalDescription = enhancedDescription || data.description || "No description provided.";

        // Update Project in DB
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title: data.name,
                description: finalDescription,
                githubUrl: data.html_url,
                liveDemoUrl: liveDemoUrl,
                ...(imageUrl && { imageUrl }),
                repoUrl: repoUrl,
                lastSyncedAt: new Date(),
                syncEnabled: true,
            }
        });

        return updatedProject;
    } catch (error) {
        console.error(`Error syncing project ${projectId} from ${repoUrl}:`, error);
        throw error;
    }
}
