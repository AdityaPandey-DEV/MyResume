import { MetadataRoute } from 'next'
import lastUpdated from '@/lib/last-updated.json'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://adityapandeydev.vercel.app'
    const lastModified = new Date(lastUpdated.lastModified)

    return [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/experience`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/skills`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        // Add other routes if necessary
    ]
}
