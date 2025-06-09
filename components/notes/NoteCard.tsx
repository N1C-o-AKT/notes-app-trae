'use client'

import { Note } from '@/hooks/useNotes'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  Star, 
  Archive, 
  MoreVertical, 
  Heart, 
  Trash2, 
  Edit, 
  Share, 
  Lock,
  Paperclip
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { useState } from 'react'

interface NoteCardProps {
  note: Note
  viewMode: 'list' | 'grid'
  onClick: () => void
  onDelete: () => Promise<void>
  onToggleFavorite?: () => Promise<void>
  onToggleArchive?: () => Promise<void>
  onShare?: () => void
}

export function NoteCard({ 
  note, 
  viewMode, 
  onClick, 
  onDelete,
  onToggleFavorite,
  onToggleArchive,
  onShare
}: NoteCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Personnel': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Travail': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Projets': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Idées': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const contentPreview = viewMode === 'grid' 
    ? truncateContent(note.content, 100)
    : truncateContent(note.content, 200)

  return (
    <div 
      className={`
        group relative bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-secondary-300 dark:hover:border-secondary-600
        ${viewMode === 'grid' ? 'h-64' : 'min-h-[120px]'}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">
            {note.title || 'Note sans titre'}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
              {note.category}
            </span>
            {note.isProtected && (
              <Lock className="w-3 h-3 text-secondary-400" />
            )}
            {note.attachments.length > 0 && (
              <div className="flex items-center text-secondary-400">
                <Paperclip className="w-3 h-3" />
                <span className="text-xs ml-1">{note.attachments.length}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {note.isFavorite && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
          {note.isArchived && (
            <Archive className="w-4 h-4 text-secondary-400" />
          )}
          
          <DropdownMenu
            trigger={
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            }
            items={[
              {
                label: (
                  <div className="flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </div>
                ),
                onClick: (e) => {
                  e?.stopPropagation()
                  onClick()
                },
              },
              {
                label: (
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>{note.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                  </div>
                ),
                onClick: (e) => {
                  e?.stopPropagation()
                  onToggleFavorite?.()
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
                  e?.stopPropagation()
                  onToggleArchive?.()
                },
              },
              {
                label: (
                  <div className="flex items-center space-x-2">
                    <Share className="w-4 h-4" />
                    <span>Partager</span>
                  </div>
                ),
                onClick: (e) => {
                  e?.stopPropagation()
                  onShare?.()
                },
              },
              { type: 'divider' as const },
              {
                label: (
                  <div className="flex items-center space-x-2 text-red-600">
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </div>
                ),
                onClick: (e) => {
                  e?.stopPropagation()
                  onDelete()
                },
              },
            ]}
          />
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-3 flex-1">
        <p className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed">
          {contentPreview || 'Aucun contenu'}
        </p>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, viewMode === 'grid' ? 2 : 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > (viewMode === 'grid' ? 2 : 4) && (
              <span className="text-xs text-secondary-400">
                +{note.tags.length - (viewMode === 'grid' ? 2 : 4)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-secondary-500">
        <div className="flex items-center space-x-2">
          <span>Modifié le {format(note.updatedAt, 'dd MMM yyyy', { locale: fr })}</span>
          {note.createdAt.getTime() !== note.updatedAt.getTime() && (
            <span className="text-secondary-400">•</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {note.isFavorite && (
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
          )}
          {note.isArchived && (
            <Archive className="w-3 h-3 text-secondary-400" />
          )}
        </div>
      </div>

      {/* Hover overlay for grid view */}
      {viewMode === 'grid' && (
        <div className="absolute inset-0 bg-primary-500 bg-opacity-0 hover:bg-opacity-5 rounded-lg transition-all duration-200 pointer-events-none" />
      )}
    </div>
  )
}