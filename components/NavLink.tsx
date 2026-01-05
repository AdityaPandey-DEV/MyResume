'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string | ((props: { isActive: boolean }) => string)
  activeClassName?: string
  exact?: boolean
  onClick?: () => void
}

export default function NavLink({
  href,
  children,
  className,
  activeClassName,
  exact = false,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname()

  // Determine if link is active
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  const getClassName = () => {
    if (typeof className === 'function') {
      return className({ isActive })
    }

    const baseClass = className || ''
    const activeClass = activeClassName || 'text-blue-600 font-semibold'
    const inactiveClass = 'text-gray-600 hover:text-blue-600'

    return `${baseClass} transition duration-300 ${
      isActive ? activeClass : inactiveClass
    }`
  }

  return (
    <Link href={href} className={getClassName()} onClick={onClick}>
      {children}
    </Link>
  )
}

