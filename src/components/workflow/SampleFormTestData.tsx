import { Plus, Trash2 } from 'lucide-react'
import { newStepId } from '../../workflow/model.js'
import {
  DEFAULT_SAMPLE_FORM_JSON,
  objectToRows,
  parseSampleFormJson,
  rowsToObject,
  type FormRow,
} from '../../workflow/sampleFormTestUtils.js'

interface SampleFormTestDataProps {
  mode: 'simple' | 'advanced'
  onModeChange: (m: 'simple' | 'advanced') => void
  simpleRows: FormRow[]
  onSimpleRowsChange: (rows: FormRow[]) => void
  sampleFormJson: string
  onSampleFormJsonChange: (s: string) => void
  error: string | null
  onClearError: () => void
  onReportError: (message: string) => void
  onRun: () => void
  testing: boolean
}

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
}: SampleFormTestDataProps) {
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

  function updateRow(id: string, patch: Partial<FormRow>) {
    onSimpleRowsChange(simpleRows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function addRow() {
    onSimpleRowsChange([...simpleRows, { id: newStepId(), key: '', value: '' }])
  }

  function removeRow(id: string) {
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
        Pretend values for a form submission — used to preview what each step will do.
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
          JSON
        </button>
      </div>

      {mode === 'simple' ? (
        <div className="sample-form-simple">
          <div className="sample-form-simple-toolbar">
            <button type="button" className="link-btn" onClick={resetExample}>
              Reset example
            </button>
          </div>
          <ul className="sample-form-list">
            {simpleRows.map((row) => (
              <li key={row.id} className="sample-form-card">
                <div className="sample-form-card-fields">
                  <div>
                    <label className="field-label field-label-compact" htmlFor={`sfk-${row.id}`}>
                      Field name
                    </label>
                    <input
                      id={`sfk-${row.id}`}
                      type="text"
                      className="field-input"
                      value={row.key}
                      placeholder="e.g. email"
                      autoComplete="off"
                      onChange={(e) => updateRow(row.id, { key: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label field-label-compact" htmlFor={`sfv-${row.id}`}>
                      Value
                    </label>
                    <input
                      id={`sfv-${row.id}`}
                      type="text"
                      className="field-input"
                      value={row.value}
                      placeholder="e.g. alex@example.com"
                      autoComplete="off"
                      onChange={(e) => updateRow(row.id, { value: e.target.value })}
                    />
                  </div>
                </div>
                <div className="sample-form-card-actions">
                  <button
                    type="button"
                    className="link-btn danger sample-form-remove"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 size={12} aria-hidden /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary btn-add-field" onClick={addRow}>
            <Plus size={14} aria-hidden /> Add field
          </button>
        </div>
      ) : (
        <div className="sample-form-advanced">
          <label className="field-label" htmlFor="sample-form-json">
            JSON object
          </label>
          <textarea
            id="sample-form-json"
            className="field-input field-textarea field-json-editor field-textarea-compact"
            rows={6}
            value={sampleFormJson}
            spellCheck={false}
            onChange={(e) => onSampleFormJsonChange(e.target.value)}
          />
          {error && <p className="field-error">{error}</p>}
          <p className="iw-footnote sample-form-footnote">
            Keys become the field names you can insert as form answers.
          </p>
        </div>
      )}

      {mode === 'simple' && error && <p className="field-error">{error}</p>}

      <button
        type="button"
        className="btn btn-secondary btn-test-run"
        disabled={testing}
        onClick={onRun}
        style={{ width: '100%' }}
      >
        {testing ? 'Running…' : 'Run test'}
      </button>
    </>
  )
}
