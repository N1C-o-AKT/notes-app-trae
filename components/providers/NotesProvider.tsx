'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { notesService, categoriesService } from '@/lib/database'
import { useAuth } from './AuthProvider'
import { format as formatDate } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { v4 as uuidv4 } from 'uuid'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  isFavorite: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  attachments: Attachment[]
  isProtected: boolean
  password?: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface Category {
  id: string
  name: string
  color: string
  parentId?: string
}

export type SortBy = 'date' | 'title' | 'category' | 'updated'
export type SortOrder = 'asc' | 'desc'

interface NotesContextType {
  notes: Note[]
  categories: Category[]
  selectedNote: Note | null
  sortBy: SortBy
  sortOrder: SortOrder
  isLoading: boolean
  error: string | null
  createNote: () => Promise<void>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (note: Note | null) => void
  toggleFavorite: (id: string) => Promise<void>
  toggleArchive: (id: string) => Promise<void>
  addCategory: (name: string, color: string, parentId?: string) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  setSorting: (sortBy: SortBy, sortOrder: SortOrder) => void
  exportNote: (id: string, format: 'pdf' | 'txt' | 'md') => void
  importNotes: (files: FileList) => void
  searchNotes: (query: string) => Promise<Note[]>
  getFilteredNotes: (filters: {
    category?: string
    tags?: string[]
    isFavorite?: boolean
    isArchived?: boolean
  }) => Note[]
  loadData: () => Promise<void>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

const defaultCategories: Category[] = [
  { id: '1', name: 'Personnel', color: '#3B82F6' },
  { id: '2', name: 'Travail', color: '#10B981' },
  { id: '3', name: 'Projets', color: '#F59E0B' },
  { id: '4', name: 'Idées', color: '#8B5CF6' },
]

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      loadData()
    } else if (!authLoading && !user) {
      // Clear data when user logs out
      setNotes([])
      setCategories(defaultCategories)
      setSelectedNote(null)
      setError(null)
    }
  }, [user, authLoading])

  // Note: localStorage sync removed - now using Supabase only

  const createNote = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newNote: Partial<Note> = {
        id: uuidv4(),
        title: 'Nouvelle note',
        content: '',
        tags: [],
        category: 'Personnel',
        isFavorite: false,
        isArchived: false,
        attachments: [],
        isProtected: false,
      }
      
      const createdNote = await notesService.create(newNote)
      setNotes(prev => [createdNote, ...prev])
      setSelectedNote(createdNote)
    } catch (err) {
      console.error('Erreur lors de la création de la note:', err)
      setError('Impossible de créer la note')
    } finally {
      setIsLoading(false)
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const updatedNote = await notesService.update(id, updates)
      
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ))
      
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNote)
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la note:', err)
      setError('Impossible de mettre à jour la note')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await notesService.delete(id)
      
      setNotes(prev => prev.filter(note => note.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la note:', err)
      setError('Impossible de supprimer la note')
    } finally {
      setIsLoading(false)
    }
  }

  const selectNote = (note: Note | null) => {
    setSelectedNote(note)
  }

  const toggleFavorite = async (id: string) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      await updateNote(id, { isFavorite: !note.isFavorite })
    }
  }

  const toggleArchive = async (id: string) => {
    const note = notes.find(n => n.id === id)
    if (note) {
      await updateNote(id, { isArchived: !note.isArchived })
    }
  }

  const addCategory = async (name: string, color: string, parentId?: string): Promise<void> => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      color,
      parentId,
    }
    setCategories(prev => [...prev, newCategory])
  }

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ))
  }

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories(prev => prev.filter(cat => cat.id !== id))
    // Update notes that use this category
    setNotes(prev => prev.map(note => 
      note.category === categories.find(c => c.id === id)?.name
        ? { ...note, category: 'Personnel' }
        : note
    ))
  }

  const setSorting = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const exportNote = (id: string, format: 'pdf' | 'txt' | 'md') => {
    const note = notes.find(n => n.id === id)
    if (!note) return

    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'txt':
        content = `${note.title}\n\n${note.content}`
        filename = `${note.title}.txt`
        mimeType = 'text/plain'
        break
      case 'md':
        content = `# ${note.title}\n\n${note.content}\n\n---\n\nTags: ${note.tags.join(', ')}\nCatégorie: ${note.category}\nCréé le: ${formatDate(note.createdAt, 'dd/MM/yyyy à HH:mm')}`
        filename = `${note.title}.md`
        mimeType = 'text/markdown'
        break
      default:
        return
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const importNotes = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const newNote: Note = {
          id: uuidv4(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          content,
          tags: [],
          category: 'Personnel',
          isFavorite: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          attachments: [],
          isProtected: false,
        }
        setNotes(prev => [newNote, ...prev])
      }
      reader.readAsText(file)
    })
  }

  const searchNotes = async (query: string): Promise<Note[]> => {
    if (!query.trim()) return notes
    
    try {
      return await notesService.search(query)
    } catch (err) {
      console.error('Erreur lors de la recherche:', err)
      // Fallback to local search
      const lowercaseQuery = query.toLowerCase()
      return notes.filter(note => 
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        note.category.toLowerCase().includes(lowercaseQuery)
      )
    }
  }

  const getFilteredNotes = (filters: {
    category?: string
    tags?: string[]
    isFavorite?: boolean
    isArchived?: boolean
  }): Note[] => {
    return notes.filter(note => {
      if (filters.category && note.category !== filters.category) return false
      if (filters.tags && !filters.tags.every(tag => note.tags.includes(tag))) return false
      if (filters.isFavorite !== undefined && note.isFavorite !== filters.isFavorite) return false
      if (filters.isArchived !== undefined && note.isArchived !== filters.isArchived) return false
      return true
    })
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load categories from Supabase
      let loadedCategories = await categoriesService.getAll()
      
      // Si l'utilisateur n'a pas de catégories, créer les catégories par défaut
      if (!loadedCategories || loadedCategories.length === 0) {
        console.log('Création des catégories par défaut pour le nouvel utilisateur')
        for (const category of defaultCategories) {
          try {
            await categoriesService.create(category)
          } catch (error) {
            console.warn('Erreur lors de la création de la catégorie:', category.name, error)
          }
        }
        // Recharger les catégories après création
        loadedCategories = await categoriesService.getAll()
      }
      
      setCategories(loadedCategories || defaultCategories)
      
      // Load notes from Supabase
      const loadedNotes = await notesService.getAll()
      setNotes(loadedNotes || [])
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError('Impossible de charger les données depuis Supabase')
      // En cas d'erreur, garder un tableau vide pour éviter les crashes
      setNotes([])
      setCategories(defaultCategories)
    } finally {
      setIsLoading(false)
    }
  }

  // Sort notes based on current sorting - ensure notes is always an array
  const sortedNotes = [...(notes || [])].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
      case 'date':
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'updated':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <NotesContext.Provider value={{
      notes: sortedNotes,
      categories,
      selectedNote,
      sortBy,
      sortOrder,
      isLoading,
      error,
      createNote,
      updateNote,
      deleteNote,
      selectNote,
      toggleFavorite,
      toggleArchive,
      addCategory,
      updateCategory,
      deleteCategory,
      setSorting,
      exportNote,
      importNotes,
      searchNotes,
      getFilteredNotes,
      loadData,
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}