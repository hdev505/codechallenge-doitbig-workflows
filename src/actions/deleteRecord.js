import { interpolateConfig } from '../workflow/interpolate.js'

export async function runDeleteRecord(config, ctx = {}) {
  const c = interpolateConfig(config, ctx)
  const table = String(c.table || '').trim()
  if (!table) return { ok: false, message: 'Add a table name.' }

  const filterText = String(c.filterText ?? '')
  const filters = parseFilterText(filterText)
  if (!Object.keys(filters).length) {
    return { ok: false, message: 'Add one filter per line (column: value).' }
  }

  await delay(200)
  return {
    ok: true,
    message: `Delete from ${table}`,
    detail: { table, filters },
  }
}

function parseFilterText(text) {
  /** @type {Record<string, string>} */
  const out = {}
  for (const line of text.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    if (key) out[key] = val
  }
  return out
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export const deleteRecordAction = {
  type: 'deleteRecord',
  label: 'Delete record',
  defaultConfig: { table: '', filterText: 'id:\n' },
  fieldDefs: [
    { key: 'table', label: 'Table', input: 'text', placeholder: 'drafts' },
    {
      key: 'filterText',
      label: 'Match rows (one per line)',
      input: 'textarea',
      placeholder: 'id: {{form.record_id}}',
    },
  ],
}
