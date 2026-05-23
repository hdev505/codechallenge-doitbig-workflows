import { useEffect, useRef, useState } from 'react'
import { Braces, ChevronRight } from 'lucide-react'

export function DataPicker({ formKeys, disabled, onInsert }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
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
        title="Insert form field as {{form…}}"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <Braces size={14} strokeWidth={2.25} aria-hidden />
        <span className="sr-only">Insert dynamic value</span>
      </button>
      {open && (
        <div className="data-picker-panel" role="listbox">
          <div className="data-picker-head">Form fields</div>
          <p className="data-picker-hint">Inserts <code>{'{{form.field}}'}</code> — filled at run time.</p>
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
                  <code className="data-picker-code">{`form.${k}`}</code>
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
