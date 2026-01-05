import Header from '@/components/Header'
import Skills from '@/components/Skills/index'
import Footer from '@/components/Footer'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Skills',
}

export default function SkillsPage() {
  return (
    <div className="App">
      <Header />
      <Skills />
      <Footer />
    </div>
  )
}

