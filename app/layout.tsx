import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import RegisterServiceWorker from '@/components/register-sw'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Holi App - Aim for Excellence',
  description: 'Your personal life optimization platform — track finances, health, and habits to aim for excellence every day.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Holi App',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  themeColor: '#0d0d12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <RegisterServiceWorker />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}