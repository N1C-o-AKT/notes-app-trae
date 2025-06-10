'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  label?: React.ReactNode
  onClick?: (e?: React.MouseEvent) => void
  active?: boolean
  disabled?: boolean
  type?: 'item' | 'divider' | 'header'
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function DropdownMenu({ trigger, items, align = 'right', className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownItem, e: React.MouseEvent) => {
    if (item.disabled) return
    
    if (item.onClick) {
      item.onClick(e)
    }
    
    if (item.type !== 'header') {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          <div
            ref={dropdownRef}
            className={cn(
              'absolute z-50 mt-2 w-56 rounded-lg bg-white dark:bg-secondary-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="py-1">
              {items.map((item, index) => {
                if (item.type === 'divider') {
                  return (
                    <div
                      key={index}
                      className="my-1 h-px bg-secondary-200 dark:bg-secondary-700"
                    />
                  )
                }

                if (item.type === 'header') {
                  return (
                    <div
                      key={index}
                      className="px-4 py-2 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider"
                    >
                      {item.label}
                    </div>
                  )
                }

                return (
                  <button
                    key={index}
                    onClick={(e) => handleItemClick(item, e)}
                    disabled={item.disabled}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      item.disabled
                        ? 'text-secondary-400 dark:text-secondary-600 cursor-not-allowed'
                        : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:text-secondary-900 dark:hover:text-secondary-100',
                      item.active && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}