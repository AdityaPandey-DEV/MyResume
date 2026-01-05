import Header from '@/components/Header'
import Education from '@/components/Education/index'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Education',
}

export default function EducationPage() {
  return (
    <div className="App">
      <Header />
      <Education />
      <Footer />
    </div>
  )
}

