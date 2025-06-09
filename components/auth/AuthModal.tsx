'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose()
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Vérifiez votre email pour confirmer votre inscription')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Instructions de réinitialisation envoyées par email')
        }
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'signin' && 'Connexion'}
            {mode === 'signup' && 'Inscription'}
            {mode === 'reset' && 'Réinitialiser le mot de passe'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="votre@email.com"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 dark:text-green-400 text-sm">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Chargement...' : (
              mode === 'signin' ? 'Se connecter' :
              mode === 'signup' ? 'S\'inscrire' :
              'Envoyer'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Pas encore de compte ? S'inscrire
              </button>
              <br />
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Mot de passe oublié ?
              </button>
            </>
          )}

          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Déjà un compte ? Se connecter
            </button>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  )
}