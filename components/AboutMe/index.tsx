import { getAbout } from '@/lib/getAbout'
import AboutClient from './About'

export default async function About() {
  const about = await getAbout()

  if (!about) return null

  return <AboutClient about={about} />
}