import Header from '@/components/Header'
import Hero from '@/components/Hero/HeroServer'
import About from '@/components/AboutMe'
import FeaturedProjects from '@/components/FeaturedProjects/index'
import Projects from '@/components/Projects/index'
import Skills from '@/components/Skills/index'
import Certifications from '@/components/Certifications'
import Education from '@/components/Education/index'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <About />
      <FeaturedProjects />
      <Projects />
      <Skills />
      <Certifications />
      <Education />
      <Contact />
      <Footer />
    </div>
  )
}

