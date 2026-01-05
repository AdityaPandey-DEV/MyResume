'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `transition duration-300 ${
      pathname === path
        ? 'text-blue-600 font-semibold'
        : 'text-gray-600 hover:text-blue-600'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md py-4 print:hidden">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold gradient-text">
          Aditya Pandey
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/#about" className={linkClass('/#about')}>
            About
          </Link>
          <Link href="/#skills" className={linkClass('/#skills')}>
            Skills
          </Link>
          <Link href="/#projects" className={linkClass('/#projects')}>
            Projects
          </Link>
          <Link href="/#education" className={linkClass('/#education')}>
            Education
          </Link>
          <Link
            href="/#certifications"
            className={linkClass('/#certifications')}
          >
            Certifications
          </Link>
          <Link href="/#contact" className={linkClass('/#contact')}>
            Contact
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 z-20">
          <nav className="flex flex-col space-y-4 px-6 py-4">
            <Link
              href="/#about"
              className={linkClass('/#about')}
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              href="/#skills"
              className={linkClass('/#skills')}
              onClick={() => setOpen(false)}
            >
              Skills
            </Link>
            <Link
              href="/#projects"
              className={linkClass('/#projects')}
              onClick={() => setOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/#education"
              className={linkClass('/#education')}
              onClick={() => setOpen(false)}
            >
              Education
            </Link>
            <Link
              href="/#certifications"
              className={linkClass('/#certifications')}
              onClick={() => setOpen(false)}
            >
              Certifications
            </Link>
            <Link
              href="/#contact"
              className={linkClass('/#contact')}
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

