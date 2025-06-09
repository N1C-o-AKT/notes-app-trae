'use client'

import { useState } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { NotesList } from '@/components/notes/NotesList'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { Button } from '@/components/ui/Button'
import { PlusCircle, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function HomePage() {
  const { 
    notes, 
    selectedNote, 
    isLoading,
    error,
    createNote, 
    updateNote, 
    deleteNote, 
    selectNote,
    toggleFavorite,
    toggleArchive,
    loadData
  } = useNotes()
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-600 mx-auto mb-4 animate-spin" />
          <p className="text-secondary-600 dark:text-secondary-400">
            Chargement de vos notes...
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-secondary-500 dark:text-secondary-400 mb-6">
            {error}
          </p>
          <Button onClick={loadData} className="inline-flex items-center">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={selectNote}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
         <Header 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedNote={selectedNote}
          />
        
        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {selectedNote ? (
            <NoteEditor 
              note={selectedNote}
              onUpdateNote={updateNote}
              onClose={() => selectNote(null)}
            />
          ) : (
            <div className="h-full">
              {notes.length > 0 ? (
                <NotesList 
                  viewMode={viewMode}
                  searchQuery={searchQuery}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                      Aucune note pour le moment
                    </h2>
                    <p className="text-secondary-500 dark:text-secondary-400 mb-6">
                      Créez votre première note pour commencer
                    </p>
                    <Button onClick={createNote} className="inline-flex items-center">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Créer une note
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}