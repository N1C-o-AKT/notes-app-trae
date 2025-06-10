import { supabase } from './supabase'
import { Note, Category, Attachment } from '@/hooks/useNotes'
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

// Helper function to convert database row to Note interface
function dbNoteToNote(dbNote: Tables<'notes'>, category?: Tables<'categories'>, attachments: Tables<'attachments'>[] = []): Note {
  return {
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content || '',
    tags: dbNote.tags || [],
    category: category?.name || 'Personnel',
    isFavorite: dbNote.is_favorite || false,
    isArchived: dbNote.is_archived || false,
    isProtected: dbNote.is_protected || false,
    password: dbNote.password_hash || undefined,
    createdAt: new Date(dbNote.created_at || new Date()),
    updatedAt: new Date(dbNote.updated_at || new Date()),
    attachments: attachments.map(att => ({
      id: att.id,
      name: att.name,
      type: att.type,
      size: att.size,
      url: att.url
    }))
  }
}

// Helper function to convert Note to database insert
function noteToDbInsert(note: Partial<Note>, categoryId?: string): TablesInsert<'notes'> {
  return {
    id: note.id,
    title: note.title || 'Nouvelle note',
    content: note.content || '',
    tags: note.tags || [],
    category_id: categoryId || null,
    is_favorite: note.isFavorite || false,
    is_archived: note.isArchived || false,
    is_protected: note.isProtected || false,
    password_hash: note.password || null
  }
}

// Helper function to convert Note to database update
function noteToDbUpdate(note: Partial<Note>, categoryId?: string): TablesUpdate<'notes'> {
  const update: TablesUpdate<'notes'> = {}
  
  if (note.title !== undefined) update.title = note.title
  if (note.content !== undefined) update.content = note.content
  if (note.tags !== undefined) update.tags = note.tags
  if (categoryId !== undefined) update.category_id = categoryId
  if (note.isFavorite !== undefined) update.is_favorite = note.isFavorite
  if (note.isArchived !== undefined) update.is_archived = note.isArchived
  if (note.isProtected !== undefined) update.is_protected = note.isProtected
  if (note.password !== undefined) update.password_hash = note.password
  
  return update
}

// Categories operations
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    
    if (error) throw error
    
    return data.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      parentId: cat.parent_id || undefined
    }))
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        color: category.color,
        parent_id: category.parentId || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      color: data.color,
      parentId: data.parent_id || undefined
    }
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const updateData: TablesUpdate<'categories'> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.parentId !== undefined) updateData.parent_id = updates.parentId || null
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      color: data.color,
      parentId: data.parent_id || undefined
    }
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}

// Notes operations
export const notesService = {
  async getAll(): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        categories(id, name, color),
        attachments(*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    
    return data.map(note => dbNoteToNote(
      note,
      note.categories || undefined,
      note.attachments || []
    ))
  },

  async getById(id: string): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        categories(id, name, color),
        attachments(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    
    return dbNoteToNote(
      data,
      data.categories || undefined,
      data.attachments || []
    )
  },

  async create(note: Partial<Note>): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Get category ID if category name is provided
    let categoryId: string | undefined
    if (note.category) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('name', note.category)
        .eq('user_id', user.id)
        .single()
      
      categoryId = categories?.id
    }
    
    const { data, error } = await supabase
      .from('notes')
      .insert(noteToDbInsert(note, categoryId))
      .select(`
        *,
        categories(id, name, color),
        attachments(*)
      `)
      .single()
    
    if (error) throw error
    
    return dbNoteToNote(
      data,
      data.categories || undefined,
      data.attachments || []
    )
  },

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Get category ID if category name is provided
    let categoryId: string | undefined
    if (updates.category) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('name', updates.category)
        .eq('user_id', user.id)
        .single()
      
      categoryId = categories?.id
    }
    
    const { data, error } = await supabase
      .from('notes')
      .update(noteToDbUpdate(updates, categoryId))
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        categories(id, name, color),
        attachments(*)
      `)
      .single()
    
    if (error) throw error
    
    return dbNoteToNote(
      data,
      data.categories || undefined,
      data.attachments || []
    )
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  },

  async search(query: string): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        categories(id, name, color),
        attachments(*)
      `)
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    
    return data.map(note => dbNoteToNote(
      note,
      note.categories || undefined,
      note.attachments || []
    ))
  }
}

// Attachments operations
export const attachmentsService = {
  async create(attachment: Omit<Attachment, 'id'> & { noteId: string }): Promise<Attachment> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        note_id: attachment.noteId,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        url: attachment.url
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      size: data.size,
      url: data.url
    }
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}

// Migration helper to transfer localStorage data to Supabase
export const migrationService = {
  async migrateFromLocalStorage(): Promise<{ success: boolean; message: string }> {
    try {
      // Get data from localStorage
      const savedNotes = localStorage.getItem('notes')
      const savedCategories = localStorage.getItem('categories')
      
      if (!savedNotes && !savedCategories) {
        return { success: true, message: 'Aucune donnée à migrer' }
      }
      
      let migratedNotes = 0
      let migratedCategories = 0
      
      // Migrate categories first
      if (savedCategories) {
        const localCategories = JSON.parse(savedCategories)
        for (const category of localCategories) {
          try {
            // Check if category already exists
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')
            
            const { data: existing } = await supabase
              .from('categories')
              .select('id')
              .eq('name', category.name)
              .eq('user_id', user.id)
              .single()
            
            if (!existing) {
              await categoriesService.create({
                name: category.name,
                color: category.color,
                parentId: category.parentId
              })
              migratedCategories++
            }
          } catch (error) {
            console.warn(`Erreur lors de la migration de la catégorie ${category.name}:`, error)
          }
        }
      }
      
      // Migrate notes
      if (savedNotes) {
        const localNotes = JSON.parse(savedNotes)
        for (const note of localNotes) {
          try {
            // Check if note already exists
            const existing = await notesService.getById(note.id)
            
            if (!existing) {
              await notesService.create({
                id: note.id,
                title: note.title,
                content: note.content,
                tags: note.tags || [],
                category: note.category,
                isFavorite: note.isFavorite || false,
                isArchived: note.isArchived || false,
                isProtected: note.isProtected || false,
                password: note.password
              })
              migratedNotes++
            }
          } catch (error) {
            console.warn(`Erreur lors de la migration de la note ${note.title}:`, error)
          }
        }
      }
      
      return {
        success: true,
        message: `Migration réussie: ${migratedCategories} catégories et ${migratedNotes} notes migrées`
      }
    } catch (error) {
      console.error('Erreur lors de la migration:', error)
      return {
        success: false,
        message: `Erreur lors de la migration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  },
  
  async clearLocalStorage(): Promise<void> {
    localStorage.removeItem('notes')
    localStorage.removeItem('categories')
  }
}