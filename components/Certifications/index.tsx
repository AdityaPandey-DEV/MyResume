import { getCertifications } from '@/lib/getCertifications'
import CertificationsClient from './CertificationsClient'

export default async function Certifications() {
  const certifications = await getCertifications()

  if (!certifications || certifications.length === 0) {
    return null
  }

  return <CertificationsClient certifications={certifications} />
}