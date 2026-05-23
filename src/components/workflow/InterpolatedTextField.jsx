import { useRef } from 'react'
import { DataPicker } from './DataPicker.jsx'

export function InterpolatedTextField({
  id,
  label,
  multiline,
  rows = 3,
  placeholder,
  value,
  onChange,
  formKeys,
}) {
  const inputRef = useRef(null)

  function insertSnippet(snippet) {
    const el = inputRef.current
    if (el && 'selectionStart' in el) {
      const start = el.selectionStart ?? value.length
      const end = el.selectionEnd ?? value.length
      const next = value.slice(0, start) + snippet + value.slice(end)
      onChange(next)
      const pos = start + snippet.length
      requestAnimationFrame(() => {
        el.focus()
        try {
          el.setSelectionRange(pos, pos)
        } catch {
        }
      })
      return
    }
    onChange(value + snippet)
  }

  return (
    <div className="interp-field">
      <div className="interp-field-head">
        <label className="field-label interp-field-label" htmlFor={id}>
          {label}
        </label>
        <DataPicker formKeys={formKeys} onInsert={insertSnippet} />
      </div>
      {multiline ? (
        <textarea
          ref={inputRef}
          id={id}
          className="field-input field-textarea"
          rows={rows}
          placeholder={placeholder}
          value={value}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          ref={inputRef}
          id={id}
          className="field-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
