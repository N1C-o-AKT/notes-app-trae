'use client'

import { useContext } from 'react'
import { createContext } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

// Re-export the context and hook from ThemeProvider
export { useTheme } from '@/components/providers/ThemeProvider'