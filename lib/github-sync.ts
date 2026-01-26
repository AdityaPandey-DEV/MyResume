
import { prisma } from '@/lib/prisma';
// Dynamic imports for these to avoid circular deps or build issues if any, though standard import is fine here
import { enhanceContent } from '@/lib/gemini-enhancer';
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
        const enhancedDescription = await enhanceContent(data.description || '', 'projects');
        const finalDescription = enhancedDescription || data.description || "No description provided.";

        // Enhance with Icon and Gradient if no image available
        let icon = null;
        let gradient = null;

        if (!imageUrl) {
            try {
                // Generate a suitable icon name from title + description
                const iconName = await enhanceContent(`${data.name} ${data.description || ''}`, 'project-icon');
                icon = iconName.startsWith('fa-') ? `fas ${iconName}` : `fas fa-${iconName}`;

                // Assign a random vibrant gradient
                const gradients = [
                    'from-blue-600 to-indigo-700',
                    'from-purple-600 to-pink-600',
                    'from-rose-500 to-orange-500',
                    'from-emerald-500 to-teal-700',
                    'from-cyan-500 to-blue-600',
                    'from-violet-600 to-purple-800',
                    'from-amber-500 to-red-600'
                ];
                gradient = gradients[Math.floor(Math.random() * gradients.length)];
            } catch (err) {
                console.error("AI Icon generation failed:", err);
            }
        }

        // Update Project in DB
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title: data.name,
                description: finalDescription,
                githubUrl: data.html_url,
                liveDemoUrl: liveDemoUrl,
                ...(imageUrl && { imageUrl }),
                ...(!imageUrl && icon && { icon }),
                ...(!imageUrl && gradient && { gradient }),
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
