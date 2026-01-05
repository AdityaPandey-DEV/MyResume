import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Aditya Pandey</h2>
            <p className="text-gray-400">B.Tech CSE Student & Full Stack Developer</p>
          </div>

          <div className="flex space-x-6">
            <a
              href="https://www.linkedin.com/in/adityapandey-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <i className="fab fa-linkedin-in text-xl"></i>
            </a>
            <a
              href="https://github.com/adityapandey-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <i className="fab fa-github text-xl"></i>
            </a>
            <a
              href="https://leetcode.com/u/adityapandey-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <i className="fas fa-code text-xl"></i>
            </a>
            <a
              href="mailto:adityapandey.dev.in@gmail.com"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <i className="fas fa-envelope text-xl"></i>
            </a>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; 2025 Aditya Pandey. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="text-gray-500 hover:text-white text-sm transition duration-300"
            >
              About
            </Link>
            <Link
              href="/skills"
              className="text-gray-500 hover:text-white text-sm transition duration-300"
            >
              Skills
            </Link>
            <Link
              href="/projects"
              className="text-gray-500 hover:text-white text-sm transition duration-300"
            >
              Projects
            </Link>
            <Link
              href="/education"
              className="text-gray-500 hover:text-white text-sm transition duration-300"
            >
              Education
            </Link>
            <Link
              href="/certifications"
              className="text-gray-500 hover:text-white text-sm transition duration-300"
            >
              Certifications
            </Link>
            <Link
              href="/contact"
              className="text-gray-500 hover:text-white text-sm transition duration-300"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

