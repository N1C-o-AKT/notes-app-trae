'use client'

import { Search, Menu, Sun, Moon, Monitor, Settings, Download, Upload, User, LogOut } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useNotes, Note } from '@/hooks/useNotes'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { AuthModal } from '@/components/auth/AuthModal'
import { useState, useRef } from 'react'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleSidebar: () => void
  selectedNote: Note | null
}

export function Header({ searchQuery, onSearchChange, onToggleSidebar, selectedNote }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { exportNote, importNotes } = useNotes()
  const { user, signOut } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      importNotes(files)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ]

  return (
    <header className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans les notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 lg:w-96 bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-secondary-100 placeholder-secondary-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Button */}
          {selectedNote && (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              }
              items={[
                {
                  label: 'Exporter en PDF',
                  onClick: () => exportNote(selectedNote.id, 'pdf'),
                },
                {
                  label: 'Exporter en TXT',
                  onClick: () => exportNote(selectedNote.id, 'txt'),
                },
                {
                  label: 'Exporter en Markdown',
                  onClick: () => exportNote(selectedNote.id, 'md'),
                },
              ]}
            />
          )}

          {/* Import Button */}
          <Button variant="ghost" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.markdown"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Theme Toggle */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm">
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            }
            items={themeOptions.map(option => ({
              label: (
                <div className="flex items-center space-x-2">
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full ml-auto" />
                  )}
                </div>
              ),
              onClick: () => setTheme(option.value as any),
            }))}
          />

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Authentication */}
          {user ? (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user.email}
                </Button>
              }
              items={[
                {
                  label: (
                    <div className="flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </div>
                  ),
                  onClick: handleSignOut,
                },
              ]}
            />
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAuthModal(true)}
            >
              <User className="w-4 h-4 mr-2" />
              Se connecter
            </Button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  )
}