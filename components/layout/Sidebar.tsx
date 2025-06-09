'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Star, 
  Archive, 
  Folder, 
  Tag, 
  Grid, 
  List, 
  ChevronDown, 
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Heart
} from 'lucide-react'
import { Note, Category } from '@/hooks/useNotes'
import { Button } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { NoteCard } from '@/components/notes/NoteCard'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  notes: Note[]
  selectedNote: Note | null
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  viewMode: 'list' | 'grid'
  onViewModeChange: (mode: 'list' | 'grid') => void
}

export function Sidebar({
  isOpen,
  onToggle,
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  viewMode,
  onViewModeChange
}: SidebarProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'archived'>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))
  const [searchQuery, setSearchQuery] = useState('')

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const filteredNotes = notes.filter(note => {
    // Filter by search query
    if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by active filter
    switch (activeFilter) {
      case 'favorites':
        return note.isFavorite && !note.isArchived
      case 'archived':
        return note.isArchived
      default:
        return !note.isArchived
    }
  })

  const categories = Array.from(new Set(notes.map(note => note.category)))

  const filterButtons = [
    { id: 'all', label: 'Toutes', icon: List, count: notes.filter(n => !n.isArchived).length },
    { id: 'favorites', label: 'Favoris', icon: Star, count: notes.filter(n => n.isFavorite && !n.isArchived).length },
    { id: 'archived', label: 'Archivées', icon: Archive, count: notes.filter(n => n.isArchived).length },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                Mes Notes
              </h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Create Note Button */}
            <Button
              onClick={onCreateNote}
              className="w-full mb-4"
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle note
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-secondary-100 placeholder-secondary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
            <div className="space-y-1">
              {filterButtons.map((filter) => {
                const Icon = filter.icon
                const isActive = activeFilter === filter.id
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as any)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors
                      ${isActive 
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{filter.label}</span>
                    </div>
                    <span className="text-xs bg-secondary-200 dark:bg-secondary-600 px-2 py-1 rounded-full">
                      {filter.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Catégories
              </h3>
              <Button variant="ghost" size="sm">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {categories.map((category) => {
                const categoryNotes = filteredNotes.filter(note => note.category === category)
                const isExpanded = expandedCategories.has(category)
                
                return (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded text-left text-sm text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        <Folder className="w-3 h-3" />
                        <span>{category}</span>
                      </div>
                      <span className="text-xs">{categoryNotes.length}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-secondary-400" />
                  </div>
                  <p className="text-secondary-500 dark:text-secondary-400">
                    {searchQuery ? 'Aucune note trouvée' : 'Aucune note dans cette catégorie'}
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm
                      ${selectedNote?.id === note.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:border-secondary-300 dark:hover:border-secondary-600'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-secondary-900 dark:text-secondary-100 truncate flex-1">
                        {note.title || 'Note sans titre'}
                      </h4>
                      <div className="flex items-center space-x-1 ml-2">
                        {note.isFavorite && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="sm" className="p-1">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          }
                          items={[
                            {
                              label: (
                                <div className="flex items-center space-x-2">
                                  <Heart className="w-4 h-4" />
                                  <span>{note.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                                </div>
                              ),
                              onClick: (e) => {
                                e.stopPropagation()
                                // toggleFavorite(note.id)
                              },
                            },
                            {
                              label: (
                                <div className="flex items-center space-x-2">
                                  <Archive className="w-4 h-4" />
                                  <span>{note.isArchived ? 'Désarchiver' : 'Archiver'}</span>
                                </div>
                              ),
                              onClick: (e) => {
                                e.stopPropagation()
                                // toggleArchive(note.id)
                              },
                            },
                            {
                              label: (
                                <div className="flex items-center space-x-2 text-red-600">
                                  <Trash2 className="w-4 h-4" />
                                  <span>Supprimer</span>
                                </div>
                              ),
                              onClick: (e) => {
                                e.stopPropagation()
                                onDeleteNote(note.id)
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2 mb-2">
                      {note.content || 'Aucun contenu'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-secondary-500">
                      <span>{format(note.updatedAt, 'dd MMM yyyy', { locale: fr })}</span>
                      <div className="flex items-center space-x-1">
                        {note.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary-100 dark:bg-secondary-700 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-secondary-400">+{note.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}