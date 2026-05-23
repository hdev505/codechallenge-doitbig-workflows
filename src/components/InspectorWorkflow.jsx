import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Bell,
  ChevronDown,
  ChevronRight,
  Copy,
  FlaskConical,
  Globe,
  LayoutTemplate,
  ListOrdered,
  Plus,
  SlidersHorizontal,
  Split,
  Trash2,
  UserPlus,
  Zap,
} from 'lucide-react'
import { ACTION_LIST, getActionDefinition } from '../actions/index.js'
import { TEMPLATES, newStepId } from '../workflow/model.js'
import { runWorkflow } from '../mockRunner.js'
import { ACTION_TYPE_ICON } from '../workflow/actionUiMeta.js'
import { ActionPickerModal } from './workflow/ActionPickerModal.jsx'
import { InterpolatedTextField } from './workflow/InterpolatedTextField.jsx'
import { SampleFormTestData } from './workflow/SampleFormTestData.jsx'
import {
  DEFAULT_SAMPLE_FORM_JSON,
  objectToRows,
  parseSampleFormJson,
  rowsToObject,
  sortedKeysFromJsonString,
  sortedKeysFromRows,
} from './workflow/sampleFormTestUtils.js'

const TEMPLATE_CHIPS = [
  { key: 'sendToApi', label: 'API', Icon: Globe },
  { key: 'saveLead', label: 'Save lead', Icon: UserPlus },
  { key: 'notifyTeam', label: 'Notify', Icon: Bell },
  { key: 'conditionalUpsell', label: 'If Pro → Slack', Icon: Split },
  { key: 'deleteStale', label: 'Delete + save', Icon: Trash2 },
]

export function InspectorWorkflow({ workflow, onWorkflowChange }) {
  const [expandedId, setExpandedId] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  const [lastRun, setLastRun] = useState(null)
  const [testDataMode, setTestDataMode] = useState(/** @type {'simple' | 'advanced'} */ ('simple'))
  const [simpleRows, setSimpleRows] = useState(() => {
    const r = parseSampleFormJson(DEFAULT_SAMPLE_FORM_JSON)
    return r.ok ? objectToRows(r.data) : [{ id: newStepId(), key: '', value: '' }]
  })
  const [sampleFormJson, setSampleFormJson] = useState(DEFAULT_SAMPLE_FORM_JSON)
  const [sampleFormError, setSampleFormError] = useState(null)

  const formKeys = useMemo(() => {
    if (testDataMode === 'simple') {
      const k = sortedKeysFromRows(simpleRows)
      if (k.length) return k
      return sortedKeysFromJsonString(DEFAULT_SAMPLE_FORM_JSON)
    }
    const k = sortedKeysFromJsonString(sampleFormJson)
    if (k.length) return k
    return sortedKeysFromJsonString(DEFAULT_SAMPLE_FORM_JSON)
  }, [testDataMode, simpleRows, sampleFormJson])

  function applyTemplate(templateKey) {
    const build = TEMPLATES[templateKey]
    if (!build) return
    onWorkflowChange(build())
    setExpandedId(null)
  }

  function addStep(type) {
    const def = getActionDefinition(type)
    if (!def) return
    const step = { id: newStepId(), type, config: { ...def.defaultConfig } }
    onWorkflowChange({ ...workflow, steps: [...workflow.steps, step] })
    setExpandedId(step.id)
  }

  function updateStepConfig(id, config) {
    onWorkflowChange({
      ...workflow,
      steps: workflow.steps.map((s) => (s.id === id ? { ...s, config } : s)),
    })
  }

  function updateStepType(id, newType) {
    const def = getActionDefinition(newType)
    if (!def) return
    onWorkflowChange({
      ...workflow,
      steps: workflow.steps.map((s) =>
        s.id === id
          ? { ...s, type: newType, config: { ...def.defaultConfig }, continueOnError: s.continueOnError }
          : s,
      ),
    })
  }

  function updateStepContinueOnError(id, checked) {
    onWorkflowChange({
      ...workflow,
      steps: workflow.steps.map((s) => {
        if (s.id !== id) return s
        if (!checked) {
          const { continueOnError: _drop, ...rest } = s
          return rest
        }
        return { ...s, continueOnError: true }
      }),
    })
  }

  function removeStep(id) {
    onWorkflowChange({ ...workflow, steps: workflow.steps.filter((s) => s.id !== id) })
    if (expandedId === id) setExpandedId(null)
  }

  function moveStep(index, dir) {
    const j = index + dir
    if (j < 0 || j >= workflow.steps.length) return
    const steps = [...workflow.steps]
    const [removed] = steps.splice(index, 1)
    steps.splice(j, 0, removed)
    onWorkflowChange({ ...workflow, steps })
  }

  function duplicateStep(id) {
    const idx = workflow.steps.findIndex((s) => s.id === id)
    if (idx < 0) return
    const orig = workflow.steps[idx]
    const newStep = {
      id: newStepId(),
      type: orig.type,
      config: JSON.parse(JSON.stringify(orig.config)),
      ...(orig.continueOnError ? { continueOnError: true } : {}),
    }
    const steps = [...workflow.steps]
    steps.splice(idx + 1, 0, newStep)
    onWorkflowChange({ ...workflow, steps })
    setExpandedId(newStep.id)
  }

  async function handleTestRun() {
    setSampleFormError(null)
    let form = {}
    if (testDataMode === 'simple') {
      form = rowsToObject(simpleRows)
    } else {
      const r = parseSampleFormJson(sampleFormJson)
      if (!r.ok) {
        setSampleFormError(r.error)
        return
      }
      form = r.data
    }

    setTesting(true)
    try {
      const report = await runWorkflow(workflow, { form })
      setLastRun(report)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="inspector-workflow">
      <div className="iw-hero">
        <span className="iw-hero-icon" aria-hidden>
          <Zap size={18} strokeWidth={2.25} />
        </span>
        <div className="iw-hero-copy">
          <p className="inspector-lede iw-hero-lede">Runs on the server after submit.</p>
          <span className="trigger-pill">
            <span className="trigger-pill-dot" aria-hidden />
            On submit
          </span>
        </div>
      </div>

      <div className="iw-card iw-card-muted">
        <p className="inspector-hint iw-hint-tight">
          <code>{'{{form.email}}'}</code> style placeholders; use the <strong className="iw-brace-mark">{'{{ }}'}</strong>{' '}
          button to insert keys. Test run uses <strong>Sample form data</strong> below.
        </p>
      </div>

      <section className="iw-card">
        <div className="iw-card-header">
          <span className="iw-card-icon" aria-hidden>
            <LayoutTemplate size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="iw-card-title">Quick start</h2>
            <p className="iw-card-desc">Replaces your current steps.</p>
          </div>
        </div>
        <div className="template-row template-row-wrap">
          {TEMPLATE_CHIPS.map(({ key, label, Icon }) => (
            <button key={key} type="button" className="chip chip-with-icon" onClick={() => applyTemplate(key)}>
              <Icon size={15} strokeWidth={2.25} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="iw-card">
        <div className="iw-card-header">
          <span className="iw-card-icon" aria-hidden>
            <SlidersHorizontal size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="iw-card-title">Workflow options</h2>
            <p className="iw-card-desc">Default for all steps; each step can override.</p>
          </div>
        </div>
        <label className="checkbox-row iw-checkbox">
          <input
            type="checkbox"
            checked={workflow.continueOnError === true}
            onChange={(e) => onWorkflowChange({ ...workflow, continueOnError: e.target.checked })}
          />
          <span>Continue after a step fails (log errors but keep going)</span>
        </label>
        <p className="iw-footnote">You can also enable this on a single step inside its card.</p>
      </section>

      <section className="iw-card">
        <div className="iw-card-header iw-card-header-actions">
          <div className="iw-card-header-left">
            <span className="iw-card-icon" aria-hidden>
              <ListOrdered size={16} strokeWidth={2.25} />
            </span>
            <div>
              <h2 className="iw-card-title">Actions</h2>
              <p className="iw-card-desc">
                Order is top to bottom. <strong>If condition</strong> gates the next step only.
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-add-step" onClick={() => setPickerOpen(true)}>
            <Plus size={16} strokeWidth={2.5} aria-hidden />
            Add step
          </button>
        </div>

        {workflow.steps.length === 0 ? (
          <div className="empty-steps empty-steps-rich">
            <span className="empty-steps-icon" aria-hidden>
              <ListOrdered size={28} strokeWidth={1.75} />
            </span>
            <p className="empty-steps-title">No server steps yet</p>
            <p className="empty-steps-text">Add HTTP, save, email, Slack, or a condition.</p>
            <button type="button" className="btn btn-primary" onClick={() => setPickerOpen(true)}>
              <Plus size={16} strokeWidth={2.5} aria-hidden />
              Add your first step
            </button>
          </div>
        ) : (
          <ul className="step-list">
            {workflow.steps.map((step, index) => {
              const def = getActionDefinition(step.type)
              const expanded = expandedId === step.id
              const StepIcon = ACTION_TYPE_ICON[step.type] || ListOrdered
              return (
                <li key={step.id} className={`step-card${expanded ? ' is-expanded' : ''}`}>
                  <div className="step-card-top">
                    <span className="step-index">{index + 1}</span>
                    <button
                      type="button"
                      className="step-summary"
                      aria-expanded={expanded}
                      onClick={() => setExpandedId(expanded ? null : step.id)}
                    >
                      <span className="step-summary-main">
                        <span className="step-type-icon" aria-hidden>
                          <StepIcon size={18} strokeWidth={2} />
                        </span>
                        <span className="step-label">{def?.label || step.type}</span>
                      </span>
                      <span className="step-chev" aria-hidden>
                        {expanded ? <ChevronDown size={18} strokeWidth={2} /> : <ChevronRight size={18} strokeWidth={2} />}
                      </span>
                    </button>
                  </div>
                  {expanded && (
                    <div className="step-card-body">
                      <div className="step-field-stack">
                        <div>
                          <label className="field-label" htmlFor={`type-${step.id}`}>
                            Step type
                          </label>
                          <select
                            id={`type-${step.id}`}
                            className="field-input"
                            value={step.type}
                            onChange={(e) => updateStepType(step.id, e.target.value)}
                          >
                            {ACTION_LIST.map((a) => (
                              <option key={a.type} value={a.type}>
                                {a.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {step.type === 'condition' && (
                          <p className="step-branch-note">When false, the following step is skipped.</p>
                        )}
                        {def?.fieldDefs?.map((f) =>
                          f.input === 'select' ? (
                            <div key={f.key} className="interp-field">
                              <label className="field-label" htmlFor={`${step.id}-${f.key}`}>
                                {f.label}
                              </label>
                              <select
                                id={`${step.id}-${f.key}`}
                                className="field-input"
                                value={String(step.config[f.key] ?? f.options?.[0] ?? '')}
                                onChange={(e) =>
                                  updateStepConfig(step.id, { ...step.config, [f.key]: e.target.value })
                                }
                              >
                                {(f.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <InterpolatedTextField
                              key={f.key}
                              id={`${step.id}-${f.key}`}
                              label={f.label}
                              multiline={f.input === 'textarea'}
                              rows={f.key === 'body' || f.key === 'fieldsText' || f.key === 'filterText' ? 4 : 2}
                              placeholder={f.placeholder}
                              value={String(step.config[f.key] ?? '')}
                              onChange={(v) => updateStepConfig(step.id, { ...step.config, [f.key]: v })}
                              formKeys={formKeys}
                            />
                          ),
                        )}
                        <label className="checkbox-row checkbox-row-tight">
                          <input
                            type="checkbox"
                            checked={step.continueOnError === true}
                            onChange={(e) => updateStepContinueOnError(step.id, e.target.checked)}
                          />
                          <span>Don’t stop the workflow if this step fails</span>
                        </label>
                        <div className="step-toolbar">
                          <button
                            type="button"
                            className="icon-text-btn"
                            disabled={index === 0}
                            title="Move up"
                            onClick={() => moveStep(index, -1)}
                          >
                            <ArrowUp size={15} aria-hidden />
                            Up
                          </button>
                          <button
                            type="button"
                            className="icon-text-btn"
                            disabled={index === workflow.steps.length - 1}
                            title="Move down"
                            onClick={() => moveStep(index, 1)}
                          >
                            <ArrowDown size={15} aria-hidden />
                            Down
                          </button>
                          <button type="button" className="icon-text-btn" title="Duplicate" onClick={() => duplicateStep(step.id)}>
                            <Copy size={15} aria-hidden />
                            Copy
                          </button>
                          <button
                            type="button"
                            className="icon-text-btn danger"
                            title="Remove step"
                            onClick={() => removeStep(step.id)}
                          >
                            <Trash2 size={15} aria-hidden />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {workflow.steps.length > 0 && (
          <button type="button" className="btn btn-secondary btn-add-another" onClick={() => setPickerOpen(true)}>
            <Plus size={16} strokeWidth={2.5} aria-hidden />
            Add another step
          </button>
        )}
      </section>

      <section className="iw-card iw-card-last">
        <div className="iw-card-header">
          <span className="iw-card-icon" aria-hidden>
            <FlaskConical size={16} strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="iw-card-title">Test run</h2>
            <p className="iw-card-desc">Preview results using pretend form answers (no server needed).</p>
          </div>
        </div>
        <SampleFormTestData
          mode={testDataMode}
          onModeChange={setTestDataMode}
          simpleRows={simpleRows}
          onSimpleRowsChange={setSimpleRows}
          sampleFormJson={sampleFormJson}
          onSampleFormJsonChange={setSampleFormJson}
          error={sampleFormError}
          onClearError={() => setSampleFormError(null)}
          onReportError={(msg) => setSampleFormError(msg)}
          onRun={handleTestRun}
          testing={testing}
        />
        {lastRun && (
          <div className={`inspector-run run-panel${lastRun.ok ? ' is-ok' : ' is-error'}`} role="status">
            <div className="run-panel-header">
              <span className="run-panel-title">
                {lastRun.ok
                  ? 'OK'
                  : lastRun.results.length === workflow.steps.length &&
                      lastRun.results.some((r) => !r.ok && !r.skipped)
                    ? 'Finished with errors'
                    : 'Stopped'}
              </span>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setLastRun(null)}>
                Clear
              </button>
            </div>
            {lastRun.results.length === 0 ? (
              <p className="run-empty">No actions configured.</p>
            ) : (
              <ol className="run-timeline">
                {lastRun.results.map((r) => (
                  <li
                    key={r.stepId}
                    className={`run-timeline-item${r.skipped ? ' is-skipped' : ''}${r.ok ? '' : ' is-fail'}`}
                  >
                    <span className="run-dot" aria-hidden />
                    <div className="run-timeline-body">
                      <div className="run-timeline-title">
                        <strong>{r.label}</strong>
                        <span className="run-ms">{r.skipped ? 'skipped' : `${r.ms} ms`}</span>
                      </div>
                      <p className="run-message">{r.message}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </section>

      <ActionPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={addStep} />
    </div>
  )
}
