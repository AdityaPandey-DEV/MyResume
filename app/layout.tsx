import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aditya Pandey',
  description: 'B.Tech CSE Student & Full Stack Developer',
  verification: {
    google: 'UR_Y_1at0EsezO21DXKn0x9NwST0G1mKMjh4fm1Qxdc',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

