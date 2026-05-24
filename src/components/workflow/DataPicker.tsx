import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Tag } from 'lucide-react'

interface DataPickerProps {
  formKeys: string[]
  disabled?: boolean
  onInsert: (snippet: string) => void
}

export function DataPicker({ formKeys, disabled, onInsert }: DataPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const keys = formKeys.length > 0 ? formKeys : ['email', 'name']

  return (
    <div className="data-picker" ref={rootRef}>
      <button
        type="button"
        className="data-picker-trigger"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Insert form answer"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <Tag size={13} strokeWidth={2.25} aria-hidden />
        <span className="sr-only">Insert form answer</span>
      </button>
      {open && (
        <div className="data-picker-panel" role="listbox">
          <div className="data-picker-head">Form answers</div>
          <ul className="data-picker-list">
            {keys.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  className="data-picker-item"
                  role="option"
                  onClick={() => {
                    onInsert(`{{form.${k}}}`)
                    setOpen(false)
                  }}
                >
                  <span className="data-picker-key">{k}</span>
                  <ChevronRight size={14} className="data-picker-chev" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
