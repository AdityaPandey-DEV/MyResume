'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import NavLink from './NavLink'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md py-4 print:hidden">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold gradient-text">
          Aditya Pandey
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8">
          {/* <NavLink href='/'>Home</NavLink> */}
          <NavLink href="/about">About</NavLink>
          <NavLink href="/skills">Skills</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          <NavLink href="/education">Education</NavLink>
          <NavLink href="/certifications">Certifications</NavLink>
          <NavLink href="/contact">Contact</NavLink>
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
            <NavLink href="/about" onClick={() => setOpen(false)}>
              About
            </NavLink>
            <NavLink href="/skills" onClick={() => setOpen(false)}>
              Skills
            </NavLink>
            <NavLink href="/projects" onClick={() => setOpen(false)}>
              Projects
            </NavLink>
            <NavLink href="/education" onClick={() => setOpen(false)}>
              Education
            </NavLink>
            <NavLink href="/certifications" onClick={() => setOpen(false)}>
              Certifications
            </NavLink>
            <NavLink href="/contact" onClick={() => setOpen(false)}>
              Contact
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}

