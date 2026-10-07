import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'right' | 'left'
  className?: string
  title?: string
}

function Drawer({ open, onOpenChange, children, side = 'right', className, title }: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'absolute top-0 h-full w-full max-w-md bg-surface border border-[#E7E5E4] overflow-y-auto transition-transform',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-surface">
          {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
          <button
            onClick={() => onOpenChange(false)}
            className="ml-auto p-1 rounded-btn hover:bg-surface-2 text-ink-muted hover:text-ink"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}

function DrawerContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>
}

function DrawerHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>
}

function DrawerTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-ink", className)}>{children}</h3>
}

function DrawerDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-ink-muted", className)}>{children}</p>
}

function DrawerClose({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <button onClick={onClick} className={cn("ml-auto p-1 rounded-btn hover:bg-surface-2 text-ink-muted hover:text-ink", className)}>{children}</button>
}

function DrawerFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-end gap-2 pt-4 border-t border-border", className)}>{children}</div>
}

export { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter }
