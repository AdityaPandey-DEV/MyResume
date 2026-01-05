export async function getHero() {
  const res = await fetch(
    `${process.env.AUTH_URL}/api/hero`,
    {
      next: {
        revalidate: 3600, // 1 hour cache
      },
    }
  )

  if (!res.ok) return null
  return res.json()
}