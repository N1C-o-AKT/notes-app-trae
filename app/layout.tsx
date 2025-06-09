import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { NotesProvider } from '@/components/providers/NotesProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Notes App - Prise de Notes Intelligente',
  description: 'Application de prise de notes moderne avec synchronisation cloud et fonctionnalités avancées',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <NotesProvider>
              {children}
            </NotesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}