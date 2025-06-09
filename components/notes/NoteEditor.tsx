'use client'

import { useState, useEffect, useRef } from 'react'
import { Note } from '@/hooks/useNotes'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image, 
  Save, 
  X, 
  Eye, 
  Edit3, 
  Tag, 
  Folder, 
  Star, 
  Archive, 
  Lock, 
  Unlock,
  Paperclip,
  Download,
  Share
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface NoteEditorProps {
  note: Note
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>
  onClose: () => void
}

export function NoteEditor({ note, onUpdateNote, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState(note.tags)
  const [category, setCategory] = useState(note.category)
  const [isPreview, setIsPreview] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Categories available
  const categories = ['Personnel', 'Travail', 'Projets', 'Idées']

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [title, content, tags, category, hasUnsavedChanges])

  // Track changes
  useEffect(() => {
    const hasChanges = 
      title !== note.title || 
      content !== note.content || 
      JSON.stringify(tags) !== JSON.stringify(note.tags) ||
      category !== note.category
    
    setHasUnsavedChanges(hasChanges)
  }, [title, content, tags, category, note])

  const handleSave = async () => {
    setIsAutoSaving(true)
    
    try {
      await onUpdateNote(note.id, {
        title: title.trim() || 'Note sans titre',
        content,
        tags,
        category,
      })
      
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
    
    setTimeout(() => {
      setIsAutoSaving(false)
    }, 500)
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    setContent(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      addTag()
    }
  }

  const formatButtons = [
    { icon: Bold, action: () => insertText('**', '**'), tooltip: 'Gras (Ctrl+B)' },
    { icon: Italic, action: () => insertText('*', '*'), tooltip: 'Italique (Ctrl+I)' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), tooltip: 'Souligné' },
    { icon: Code, action: () => insertText('`', '`'), tooltip: 'Code inline' },
    { icon: Quote, action: () => insertText('> '), tooltip: 'Citation' },
    { icon: List, action: () => insertText('- '), tooltip: 'Liste à puces' },
    { icon: ListOrdered, action: () => insertText('1. '), tooltip: 'Liste numérotée' },
    { icon: Link, action: () => insertText('[', '](url)'), tooltip: 'Lien' },
  ]

  return (
    <div className="h-full flex flex-col bg-white dark:bg-secondary-900">
      {/* Header */}
      <div className="border-b border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={!isPreview ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setIsPreview(false)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Éditer
              </Button>
              <Button
                variant={isPreview ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setIsPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-save indicator */}
            {isAutoSaving && (
              <span className="text-sm text-secondary-500 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Sauvegarde...
              </span>
            )}
            
            {hasUnsavedChanges && !isAutoSaving && (
              <span className="text-sm text-orange-500 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                Non sauvegardé
              </span>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>

            {/* More actions */}
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm">
                  <Star className={`w-4 h-4 ${note.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                </Button>
              }
              items={[
                {
                  label: (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>{note.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                    </div>
                  ),
                  onClick: () => onUpdateNote(note.id, { isFavorite: !note.isFavorite }),
                },
                {
                  label: (
                    <div className="flex items-center space-x-2">
                      <Archive className="w-4 h-4" />
                      <span>{note.isArchived ? 'Désarchiver' : 'Archiver'}</span>
                    </div>
                  ),
                  onClick: () => onUpdateNote(note.id, { isArchived: !note.isArchived }),
                },
                {
                  label: (
                    <div className="flex items-center space-x-2">
                      {note.isProtected ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>{note.isProtected ? 'Déverrouiller' : 'Protéger'}</span>
                    </div>
                  ),
                  onClick: () => onUpdateNote(note.id, { isProtected: !note.isProtected }),
                },
                { type: 'divider' as const },
                {
                  label: (
                    <div className="flex items-center space-x-2">
                      <Share className="w-4 h-4" />
                      <span>Partager</span>
                    </div>
                  ),
                  onClick: () => {},
                },
                {
                  label: (
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Exporter</span>
                    </div>
                  ),
                  onClick: () => {},
                },
              ]}
            />
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la note..."
          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-secondary-900 dark:text-secondary-100 placeholder-secondary-500"
        />

        {/* Metadata */}
        <div className="flex items-center space-x-4 mt-4 text-sm text-secondary-500">
          <span>Créé le {format(note.createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
          <span>•</span>
          <span>Modifié le {format(note.updatedAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
        </div>
      </div>

      {/* Toolbar */}
      {!isPreview && (
        <div className="border-b border-secondary-200 dark:border-secondary-700 p-2">
          <div className="flex items-center space-x-1">
            {formatButtons.map((button, index) => {
              const Icon = button.icon
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.tooltip}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {!isPreview && (
          <div className="flex-1 p-4">
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Commencez à écrire votre note..."
              className="w-full h-full resize-none bg-transparent border-none outline-none text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 leading-relaxed"
            />
          </div>
        )}

        {/* Preview */}
        {isPreview && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*Aucun contenu à afficher*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-secondary-200 dark:border-secondary-700 p-4 overflow-y-auto">
        {/* Category */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            <Folder className="w-4 h-4 inline mr-2" />
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Tags
          </label>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-primary-500 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ajouter un tag..."
              className="flex-1 p-2 border border-secondary-300 dark:border-secondary-600 rounded-l-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
            />
            <Button
              onClick={addTag}
              variant="primary"
              className="rounded-l-none"
              disabled={!newTag.trim()}
            >
              Ajouter
            </Button>
          </div>
        </div>

        {/* Attachments */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            <Paperclip className="w-4 h-4 inline mr-2" />
            Pièces jointes
          </label>
          
          {note.attachments.length === 0 ? (
            <p className="text-sm text-secondary-500">Aucune pièce jointe</p>
          ) : (
            <div className="space-y-2">
              {note.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-700 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button variant="ghost" className="w-full mt-2">
            <Paperclip className="w-4 h-4 mr-2" />
            Ajouter un fichier
          </Button>
        </div>

        {/* Statistics */}
        <div className="text-xs text-secondary-500 space-y-1">
          <p>Caractères: {content.length}</p>
          <p>Mots: {content.split(/\s+/).filter(word => word.length > 0).length}</p>
          <p>Lignes: {content.split('\n').length}</p>
        </div>
      </div>
    </div>
  )
}