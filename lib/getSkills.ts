export async function getSkills() {
  try {
    const res = await fetch(
      `${process.env.AUTH_URL}/api/skills`,
      {
        next: {
          revalidate: 3600, // 1 hour cache
        },
      }
    )

    if (!res.ok) return null

    const data = await res.json()
    return data ?? null
  } catch (error) {
    console.error('Error fetching skills:', error)
    return null
  }
}