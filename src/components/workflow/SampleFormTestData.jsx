import { Plus, Trash2 } from 'lucide-react'
import { newStepId } from '../../workflow/model.js'
import {
  DEFAULT_SAMPLE_FORM_JSON,
  objectToRows,
  parseSampleFormJson,
  rowsToObject,
} from './sampleFormTestUtils.js'

/**
 * @param {{
 *   mode: 'simple' | 'advanced'
 *   onModeChange: (m: 'simple' | 'advanced') => void
 *   simpleRows: { id: string, key: string, value: string }[]
 *   onSimpleRowsChange: (rows: { id: string, key: string, value: string }[]) => void
 *   sampleFormJson: string
 *   onSampleFormJsonChange: (s: string) => void
 *   error: string | null
 *   onClearError: () => void
 *   onReportError: (message: string) => void
 *   onRun: () => void
 *   testing: boolean
 * }} props
 */
export function SampleFormTestData({
  mode,
  onModeChange,
  simpleRows,
  onSimpleRowsChange,
  sampleFormJson,
  onSampleFormJsonChange,
  error,
  onClearError,
  onReportError,
  onRun,
  testing,
}) {
  function switchToAdvanced() {
    onClearError()
    onSampleFormJsonChange(JSON.stringify(rowsToObject(simpleRows), null, 2))
    onModeChange('advanced')
  }

  function switchToSimple() {
    const r = parseSampleFormJson(sampleFormJson)
    if (!r.ok) {
      onReportError(`${r.error} Fix the JSON, then tap Form fields again.`)
      return
    }
    onClearError()
    onSimpleRowsChange(objectToRows(r.data))
    onModeChange('simple')
  }

  function updateRow(id, patch) {
    onSimpleRowsChange(simpleRows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function addRow() {
    onSimpleRowsChange([...simpleRows, { id: newStepId(), key: '', value: '' }])
  }

  function removeRow(id) {
    if (simpleRows.length <= 1) {
      onSimpleRowsChange([{ id: simpleRows[0].id, key: '', value: '' }])
      return
    }
    onSimpleRowsChange(simpleRows.filter((row) => row.id !== id))
  }

  function resetExample() {
    onClearError()
    const r = parseSampleFormJson(DEFAULT_SAMPLE_FORM_JSON)
    if (r.ok) onSimpleRowsChange(objectToRows(r.data))
  }

  return (
    <>
      <p className="iw-card-desc iw-desc-tight">
        Pretend values for a real form submission. Steps use them in placeholders like{' '}
        <code className="iw-inline-code">{'{{form.email}}'}</code>.
      </p>

      <div className="test-data-mode" role="tablist" aria-label="How to edit test data">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'simple'}
          className={`test-data-mode-btn${mode === 'simple' ? ' is-active' : ''}`}
          onClick={() => (mode === 'advanced' ? switchToSimple() : undefined)}
        >
          Form fields
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'advanced'}
          className={`test-data-mode-btn${mode === 'advanced' ? ' is-active' : ''}`}
          onClick={() => (mode === 'simple' ? switchToAdvanced() : undefined)}
        >
          JSON (advanced)
        </button>
      </div>

      {mode === 'simple' ? (
        <div className="sample-form-simple">
          <div className="sample-form-simple-toolbar">
            <button type="button" className="btn btn-ghost btn-small" onClick={resetExample}>
              Reset to example
            </button>
          </div>
          <ul className="sample-form-list">
            {simpleRows.map((row) => (
              <li key={row.id} className="sample-form-card">
                <div className="sample-form-card-fields">
                  <div>
                    <label className="field-label field-label-compact" htmlFor={`sf-key-${row.id}`}>
                      Field name
                    </label>
                    <input
                      id={`sf-key-${row.id}`}
                      className="field-input"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="e.g. email"
                      value={row.key}
                      onChange={(e) => {
                        onClearError()
                        updateRow(row.id, { key: e.target.value })
                      }}
                    />
                  </div>
                  <div>
                    <label className="field-label field-label-compact" htmlFor={`sf-val-${row.id}`}>
                      Value
                    </label>
                    <input
                      id={`sf-val-${row.id}`}
                      className="field-input"
                      type="text"
                      autoComplete="off"
                      value={row.value}
                      onChange={(e) => {
                        onClearError()
                        updateRow(row.id, { value: e.target.value })
                      }}
                    />
                  </div>
                </div>
                <div className="sample-form-card-actions">
                  <button
                    type="button"
                    className="icon-text-btn danger sample-form-remove"
                    title={simpleRows.length <= 1 ? 'Clear row' : 'Remove field'}
                    onClick={() => {
                      onClearError()
                      removeRow(row.id)
                    }}
                  >
                    <Trash2 size={14} aria-hidden />
                    {simpleRows.length <= 1 ? 'Clear' : 'Remove'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary btn-add-field" onClick={addRow}>
            <Plus size={16} strokeWidth={2.5} aria-hidden />
            Add field
          </button>
          <p className="iw-footnote sample-form-footnote">
            Names must match what you use in steps (e.g. <code className="iw-inline-code">email</code> for{' '}
            <code className="iw-inline-code">{'{{form.email}}'}</code>).
          </p>
        </div>
      ) : (
        <div className="sample-form-advanced">
          <label className="field-label" htmlFor="sample-form-json">
            Raw JSON
          </label>
          <textarea
            id="sample-form-json"
            className="field-input field-textarea field-json-editor"
            rows={7}
            spellCheck={false}
            value={sampleFormJson}
            onChange={(e) => {
              onClearError()
              onSampleFormJsonChange(e.target.value)
            }}
          />
          <p className="iw-footnote">
            Switch back to <strong>Form fields</strong> after fixing JSON — invalid JSON cannot be converted.
          </p>
        </div>
      )}

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="button" className="btn btn-primary btn-test-run" disabled={testing} onClick={onRun}>
        {testing ? 'Running…' : 'Run workflow'}
      </button>
    </>
  )
}
