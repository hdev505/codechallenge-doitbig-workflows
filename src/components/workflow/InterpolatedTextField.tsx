import { useRef, useState } from 'react'
import { DataPicker } from './DataPicker.jsx'
import { interpolateString } from '../../workflow/interpolate.js'
import type { RunContext } from '../../workflow/model.js'

interface InterpolatedTextFieldProps {
  id: string
  label: string
  multiline?: boolean
  rows?: number
  placeholder?: string
  value: string
  onChange: (value: string) => void
  formKeys: string[]
  sampleCtx?: RunContext
}

interface AcState {
  filter: string
  startPos: number
}

function checkTokenValidity(value: string, formKeys: string[]): 'ok' | 'warn' | null {
  if (!value.includes('{{')) return null
  const regex = /\{\{form\.([^}]+?)\s*\}\}/g
  let hasAny = false
  let m: RegExpExecArray | null
  while ((m = regex.exec(value)) !== null) {
    hasAny = true
    if (!formKeys.includes(m[1].trim())) return 'warn'
  }
  return hasAny ? 'ok' : null
}

export function InterpolatedTextField({
  id,
  label,
  multiline,
  rows = 3,
  placeholder,
  value,
  onChange,
  formKeys,
  sampleCtx,
}: InterpolatedTextFieldProps) {
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const [acState, setAcState] = useState<AcState | null>(null)

  function insertSnippet(snippet: string) {
    const el = inputRef.current
    if (el && 'selectionStart' in el) {
      const start = el.selectionStart ?? value.length
      const end = el.selectionEnd ?? value.length
      const next = value.slice(0, start) + snippet + value.slice(end)
      onChange(next)
      const pos = start + snippet.length
      requestAnimationFrame(() => {
        el.focus()
        try { el.setSelectionRange(pos, pos) } catch { /* ignore */ }
      })
      return
    }
    onChange(value + snippet)
  }

  function handleChange(newVal: string) {
    onChange(newVal)
    const el = inputRef.current
    if (!el) return
    const cursor = el.selectionStart ?? newVal.length
    const before = newVal.slice(0, cursor)
    const match = before.match(/\{\{([^}]*)$/)
    if (match) {
      setAcState({ filter: match[1], startPos: cursor - match[0].length })
    } else {
      setAcState(null)
    }
  }

  function pickAcKey(key: string) {
    if (!acState) return
    const snippet = `{{form.${key}}}`
    const el = inputRef.current
    const cursor = el ? (el.selectionStart ?? value.length) : value.length
    const next = value.slice(0, acState.startPos) + snippet + value.slice(cursor)
    onChange(next)
    setAcState(null)
    const pos = acState.startPos + snippet.length
    requestAnimationFrame(() => {
      el?.focus()
      try { el?.setSelectionRange(pos, pos) } catch { /* ignore */ }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape' && acState) {
      setAcState(null)
      e.preventDefault()
    }
  }

  const filteredKeys = acState
    ? formKeys.filter((k) => k.toLowerCase().startsWith(acState.filter.toLowerCase()))
    : []

  const tokenValidity = checkTokenValidity(value, formKeys)
  const resolvedPreview =
    sampleCtx && tokenValidity === 'ok' && value.includes('{{')
      ? interpolateString(value, sampleCtx)
      : null

  const sharedProps = {
    id,
    placeholder,
    value,
    spellCheck: false as const,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: () => setAcState(null),
  }

  return (
    <div className="interp-field">
      <div className="interp-field-head">
        <label className="field-label interp-field-label" htmlFor={id}>
          {label}
        </label>
        <DataPicker formKeys={formKeys} onInsert={insertSnippet} />
      </div>
      <div className="interp-input-wrap">
        {multiline ? (
          <textarea ref={inputRef} {...sharedProps} className="field-input field-textarea" rows={rows} />
        ) : (
          <input ref={inputRef} {...sharedProps} className="field-input" type="text" />
        )}
        {acState && filteredKeys.length > 0 && (
          <ul className="ac-list" role="listbox" aria-label="Form field suggestions">
            {filteredKeys.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  className="ac-item"
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    pickAcKey(k)
                  }}
                >
                  {k}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {tokenValidity === 'warn' && (
        <p className="interp-validity interp-validity-warn">Unknown field name — check your sample form data.</p>
      )}
      {tokenValidity === 'ok' && resolvedPreview && resolvedPreview !== value && (
        <p className="interp-validity interp-validity-ok">→ {resolvedPreview}</p>
      )}
    </div>
  )
}
