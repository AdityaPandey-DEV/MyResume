// components/Hero/index.tsx  (SERVER)
import { getHero } from '@/lib/getHero'
import HeroClient from './Hero'

export default async function Hero() {
  const hero = await getHero()
  if (!hero) return null

  return <HeroClient hero={hero} />
}