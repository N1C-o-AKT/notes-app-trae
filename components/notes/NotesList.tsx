'use client'

import { useNotes, SortBy } from '@/hooks/useNotes'
import { NoteCard } from './NoteCard'
import { useState } from 'react'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/DropdownMenu'

interface NotesListProps {
  viewMode: 'list' | 'grid'
  searchQuery?: string
}

type SortOption = {
  label: string
  value: SortBy
}

export function NotesList({ viewMode, searchQuery = '' }: NotesListProps) {
  const { notes, selectNote, deleteNote, toggleFavorite, toggleArchive, setSorting, sortBy, sortOrder } = useNotes()
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterTags, setFilterTags] = useState<string[]>([])

  const sortOptions: SortOption[] = [
    { label: 'Titre', value: 'title' },
    { label: 'Date de modification', value: 'updated' },
    { label: 'Date de création', value: 'date' },
    { label: 'Catégorie', value: 'category' },
  ]

  const sortedNotes = [...(notes || [])]

  // Get all unique categories and tags for filters
  const categories = Array.from(new Set((notes || []).map(note => note.category)))
  const allTags = Array.from(new Set((notes || []).flatMap(note => note.tags || [])))

  const filteredNotes = sortedNotes.filter(note => {
    // Search filter
    if (searchQuery && !(
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )) return false
    
    // Category filter
    if (filterCategory && note.category !== filterCategory) return false
    
    // Tags filter
    if (filterTags.length > 0 && !filterTags.every(tag => note.tags.includes(tag))) return false
    
    return true
  })

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort Dropdown */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm">
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4 mr-2" />
                ) : (
                  <SortDesc className="w-4 h-4 mr-2" />
                )}
                Trier
              </Button>
            }
            items={[
              ...sortOptions.map(option => ({
                label: (
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {sortBy === option.value && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </div>
                ),
                onClick: () => setSorting(option.value, sortOrder),
                type: 'item' as const,
              })),
              { type: 'divider' as const },
              {
                label: (
                  <div className="flex items-center gap-2">
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    <span>{sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}</span>
                  </div>
                ),
                onClick: () => setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc'),
                type: 'item' as const,
              },
            ]}
          />

          {/* Filter Dropdown */}
          <DropdownMenu
            trigger={
              <Button 
                variant="ghost" 
                size="sm"
                className={filterCategory || filterTags.length > 0 ? 'text-primary-600' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            }
            items={[
              { type: 'header' as const, label: 'Catégories' },
              {
                label: 'Toutes les catégories',
                onClick: () => setFilterCategory(null),
                active: filterCategory === null,
                type: 'item' as const,
              },
              ...categories.map(category => ({
                label: category,
                onClick: () => setFilterCategory(category),
                active: filterCategory === category,
                type: 'item' as const,
              })),
              { type: 'divider' as const },
              { type: 'header' as const, label: 'Tags' },
              ...allTags.map(tag => ({
                label: tag,
                onClick: () => {
                  if (filterTags.includes(tag)) {
                    setFilterTags(filterTags.filter(t => t !== tag))
                  } else {
                    setFilterTags([...filterTags, tag])
                  }
                },
                active: filterTags.includes(tag),
                type: 'item' as const,
              })),
              { type: 'divider' as const },
              {
                label: 'Réinitialiser les filtres',
                onClick: () => {
                  setFilterCategory(null)
                  setFilterTags([])
                },
                type: 'item' as const,
              },
            ]}
          />
        </div>
      </div>

      {/* Notes Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-secondary-400" />
            </div>
            <h3 className="text-xl font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              Aucune note trouvée
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Essayez de modifier vos filtres ou créez une nouvelle note
            </p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'space-y-3'}
          `}>
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                onClick={() => selectNote(note)}
                onDelete={async () => await deleteNote(note.id)}
                onToggleFavorite={async () => await toggleFavorite(note.id)}
                onToggleArchive={async () => await toggleArchive(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}