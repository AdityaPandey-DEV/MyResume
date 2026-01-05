// lib/getAbout.ts
export async function getAbout() {
  const res = await fetch(
    `${process.env.AUTH_URL}/api/about`,
    {
      next: {
        revalidate: 3600, // 1 hour cache
      },
    }
  )

  if (!res.ok) return null
  return res.json()
}