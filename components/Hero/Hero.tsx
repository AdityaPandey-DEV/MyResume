'use client'

import Image from 'next/image'
import Link from 'next/link'

type HeroProps = {
  hero: {
    name: string
    title: string
    description: string
    imageUrl: string
    linkedinUrl?: string | null
    githubUrl?: string | null
    email?: string | null
    leetcodeUrl?: string | null
  }
}

export default function HeroClient({ hero }: HeroProps) {

  return (
    <div className="gradient-bg text-white py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl flex font-bold mb-4">
              Hi, I&apos;m <span className="text-yellow-300">{hero.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-6">
              {hero.title}
            </h2>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition duration-300 shadow-lg inline-flex items-center"
              >
                <span>View My Work</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium transition duration-300 inline-flex items-center"
              >
                <span>Contact Me</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </Link>
            </div>

            <div className="mt-8 flex space-x-4">
              {hero.linkedinUrl && (
                <a
                  href={hero.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-yellow-300 transition-colors duration-300"
                >
                  <i className="fab fa-linkedin-in text-xl"></i>
                </a>
              )}
              {hero.githubUrl && (
                <a
                  href={hero.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-yellow-300 transition-colors duration-300"
                >
                  <i className="fab fa-github text-xl"></i>
                </a>
              )}
              {hero.email && (
                <a
                  href={`mailto:${hero.email}`}
                  className="text-white hover:text-yellow-300 transition-colors duration-300"
                >
                  <i className="fas fa-envelope text-xl"></i>
                </a>
              )}
              {hero.leetcodeUrl && (
                <a
                  href={hero.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-yellow-300 transition-colors duration-300"
                >
                  <i className="fas fa-code text-xl"></i>
                </a>
              )}
            </div>
          </div>

          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center animate-fade-in delay-200">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-xl transform scale-110"></div>
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src={hero.imageUrl}
                  alt={hero.name}
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

