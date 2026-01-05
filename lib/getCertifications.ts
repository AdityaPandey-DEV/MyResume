export async function getCertifications() {
  try {
    const res = await fetch(
      `${process.env.AUTH_URL}/api/certifications`,
      {
        next: {
          revalidate: 3600,
        },
      }
    )

    if (!res.ok) {
      console.error('Failed to fetch certifications:', res.status)
      return []            // ✅ ALWAYS return array
    }

    const data = await res.json()

    // 🔒 Safety guard
    if (!Array.isArray(data)) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return []              // ✅ ALWAYS return array
  }
}