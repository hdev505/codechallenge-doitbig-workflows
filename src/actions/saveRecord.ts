import { interpolateConfig } from '../workflow/interpolate.js'
import type { RunContext, RunResult, ActionDefinition } from '../workflow/model.js'

export async function runSaveRecord(config: Record<string, unknown>, ctx: RunContext = {}): Promise<RunResult> {
  const c = interpolateConfig(config, ctx)
  const table = String(c.table || '').trim()
  if (!table) return { ok: false, message: 'Add a table name.' }

  const mode = String(c.mode || 'create').toLowerCase()
  const fieldsText = String(c.fieldsText ?? '')
  const fields = parseFieldsText(fieldsText)
  if (!Object.keys(fields).length) {
    return { ok: false, message: 'Add one field per line (name: value).' }
  }

  await delay(200)
  const modeLabel = mode === 'upsert' ? 'Upsert' : 'Create'
  return {
    ok: true,
    message: `${modeLabel} → ${table}`,
    detail: { table, mode: mode === 'upsert' ? 'upsert' : 'create', fields },
  }
}

function parseFieldsText(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    if (key) out[key] = val
  }
  return out
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export const saveRecordAction: ActionDefinition = {
  type: 'saveRecord',
  label: 'Save record',
  defaultConfig: { table: 'records', mode: 'create', fieldsText: 'status: new' },
  run: runSaveRecord,
  fieldDefs: [
    { key: 'table', label: 'Table', input: 'text', placeholder: 'leads' },
    { key: 'mode', label: 'Mode', input: 'select', options: ['create', 'upsert'] },
    {
      key: 'fieldsText',
      label: 'Fields',
      input: 'textarea',
      placeholder: 'email: {{form.email}}',
    },
  ],
}
