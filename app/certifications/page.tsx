import Header from '@/components/Header'
import Certifications from '@/components/Certifications/index'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Certifications',
}
export default function CertificationsPage() {
  return (
    <div className="App">
      <Header />
      <Certifications/>
      <Footer />
    </div>
  )
}

