import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectCtx {
  value?: string
  onValueChange: (v: string) => void
  disabled?: boolean
  open: boolean
  setOpen: (o: boolean) => void
  registerItem: (value: string, label: string, disabled?: boolean) => void
  unregisterItem: (value: string) => void
  getItems: () => Array<{ value: string; label: string; disabled?: boolean }>
}

const SelectCtx = React.createContext<SelectCtx | null>(null)

function useSC() {
  const c = React.useContext(SelectCtx)
  if (!c) throw new Error('Select parts must be within Select')
  return c
}

interface SelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  children?: React.ReactNode
}

function Select({ value, onValueChange, className, disabled, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const itemsRef = React.useRef<Map<string, { label: string; disabled?: boolean }>>(new Map())

  const registerItem = (val: string, label: string, dis?: boolean) => itemsRef.current.set(val, { label, disabled: dis })
  const unregisterItem = (val: string) => itemsRef.current.delete(val)
  const getItems = () => Array.from(itemsRef.current.entries()).map(([v, { label, disabled }]) => ({ value: v, label, disabled }))

  const ctx: SelectCtx = { value, onValueChange, disabled, open, setOpen, registerItem, unregisterItem, getItems }

  return (
    <SelectCtx.Provider value={ctx}>
      <div className={cn('relative', className)}>{children}</div>
    </SelectCtx.Provider>
  )
}

function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { open, setOpen, disabled, value, getItems } = useSC()
  const items = getItems()
  const selected = items.find((o) => o.value === value)
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-btn border border-border bg-surface px-3 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink',
        !selected && !value ? 'text-ink-muted' : '',
        className
      )}
    >
      {children}
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSC()
  return <span className={!value ? 'text-ink-muted' : ''}>{value || placeholder}</span>
}

function SelectContent({ className, children: _children }: { className?: string; children?: React.ReactNode }) {
  const { value, onValueChange, disabled, open, setOpen, getItems } = useSC()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open, setOpen])

  if (!open) return null
  const items = getItems()
  return (
    <div ref={ref} className={cn('absolute z-20 mt-1 w-full rounded-card border border-[#E7E5E4] bg-surface p-1 min-w-[8rem]', className)}>
      {items.map((option) => (
        <div
          key={option.value}
          role="option"
          onClick={() => { if (!option.disabled && !disabled) { onValueChange(option.value); setOpen(false) } }}
          className={cn(
            'flex items-center justify-between rounded-btn px-3 py-2 text-sm cursor-pointer',
            option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-2 text-ink',
            value === option.value && 'bg-surface-2'
          )}
        >
          <span>{option.label}</span>
          {value === option.value && <Check size={14} strokeWidth={1.5} />}
        </div>
      ))}
    </div>
  )
}

function SelectItem({ value, disabled, children }: { value: string; disabled?: boolean; children?: React.ReactNode }) {
  const { registerItem, unregisterItem } = useSC()
  const label = typeof children === 'string' ? children : value
  React.useEffect(() => {
    registerItem(value, label, disabled)
    return () => unregisterItem(value)
  }, [value, label, disabled])
  return null
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
