import { getEducation } from '@/lib/getEducation'
import EducationClient from './EducationClient'

export default async function Education() {
  const education = await getEducation()

  if (!education || education.length === 0) {
    return null
  }

  return <EducationClient education={education} />
}