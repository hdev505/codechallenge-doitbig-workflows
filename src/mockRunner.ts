import { getActionDefinition } from './actions/index.js'
import type { Workflow } from './workflow/model.js'

export interface StepRunResult {
  stepId: string
  type: string
  label: string
  ok: boolean
  message: string
  ms: number
  detail?: unknown
  skipped?: boolean
}

export interface RunReport {
  ok: boolean
  results: StepRunResult[]
  stoppedAt?: number
}

function conditionPassFromDetail(detail: unknown): boolean | undefined {
  if (!detail || typeof detail !== 'object') return undefined
  const p = (detail as Record<string, unknown>).pass
  return typeof p === 'boolean' ? p : undefined
}

export async function runWorkflow(workflow: Workflow, options: { form?: Record<string, string> } = {}): Promise<RunReport> {
  const results: StepRunResult[] = []
  const form = normalizeForm(options.form)

  if (!workflow.steps.length) {
    return { ok: true, results }
  }

  const ctx = { form }

  let skipNext = false
  let index = 0
  for (const step of workflow.steps) {
    const def = getActionDefinition(step.type)
    const label = def?.label || step.type

    if (skipNext) {
      skipNext = false
      results.push({
        stepId: step.id,
        type: step.type,
        label,
        ok: true,
        skipped: true,
        message: 'Skipped (condition was false).',
        ms: 0,
      })
      index += 1
      continue
    }

    const t0 = performance.now()
    if (!def || typeof def.run !== 'function') {
      results.push({
        stepId: step.id,
        type: step.type,
        label,
        ok: false,
        message: 'Unknown action type.',
        ms: Math.round(performance.now() - t0),
      })
      return { ok: false, results, stoppedAt: index }
    }

    try {
      const out = await def.run(step.config || {}, ctx)
      const ms = Math.round(performance.now() - t0)
      results.push({
        stepId: step.id,
        type: step.type,
        label,
        ok: !!out.ok,
        message: out.message,
        ms,
        detail: out.detail,
      })

      if (step.type === 'condition' && out.ok) {
        const pass = conditionPassFromDetail(out.detail)
        if (pass === false) skipNext = true
      }

      const stepContinue = step.continueOnError === true
      const workflowContinue = workflow.continueOnError === true
      const continueAfterError = stepContinue || workflowContinue

      if (!out.ok && !continueAfterError) {
        return { ok: false, results, stoppedAt: index }
      }
    } catch (e) {
      const ms = Math.round(performance.now() - t0)
      results.push({
        stepId: step.id,
        type: step.type,
        label,
        ok: false,
        message: e instanceof Error ? e.message : 'Step failed.',
        ms,
      })
      const stepContinue = step.continueOnError === true
      const workflowContinue = workflow.continueOnError === true
      if (!stepContinue && !workflowContinue) {
        return { ok: false, results, stoppedAt: index }
      }
    }
    index += 1
  }

  const anyFailed = results.some((r) => !r.ok && !r.skipped)
  return { ok: !anyFailed, results }
}

function normalizeForm(form: Record<string, string> | undefined): Record<string, string> {
  if (!form || typeof form !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(form)) {
    out[k] = v == null ? '' : String(v)
  }
  return out
}
