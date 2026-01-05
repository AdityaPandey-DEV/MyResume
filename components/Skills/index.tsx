import { getSkills } from '@/lib/getSkills'
import SkillsClient from './SkillsClient'

export default async function Skills() {
  const skills = await getSkills()

  if (!skills) {
    return null
  }

  return <SkillsClient skills={skills} />
}