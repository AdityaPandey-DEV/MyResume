import Header from '@/components/Header'
import About from '@/components/AboutMe/index'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata:Metadata={
  title:"About Me"
}

export default function AboutPage() {
  return (
    <div className="App">
      <Header />
      <About />
      <Footer />
    </div>
  )
}

