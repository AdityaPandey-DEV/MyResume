export async function getProjects() {
  try {
    const res = await fetch(
      `${process.env.AUTH_URL}/api/projects`,
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
    console.error('Error fetching projects:', error)
    return []
  }
}