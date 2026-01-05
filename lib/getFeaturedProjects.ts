export async function getFeaturedProjects() {
  try {
    const res = await fetch(
      `${process.env.AUTH_URL}/api/featured-projects`,
      {
        next: {
          revalidate: 3600, // 1 hour cache
        },
      }
    )

    if (!res.ok) return []

    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return []
  }
}