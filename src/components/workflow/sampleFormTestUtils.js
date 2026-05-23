import { newStepId } from '../../workflow/model.js'

export const DEFAULT_SAMPLE_FORM_JSON = `{
  "email": "alex@example.com",
  "name": "Alex",
  "plan": "free",
  "session_id": "sess_123",
  "amount": "49",
  "record_id": ""
}`

/**
 * @param {string} jsonString
 * @returns {{ ok: true, data: Record<string, string> } | { ok: false, error: string }}
 */
export function parseSampleFormJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Use a single JSON object, e.g. { "email": "…" } — not a list.' }
    }
    /** @type {Record<string, string>} */
    const data = {}
    for (const [k, v] of Object.entries(/** @type {Record<string, unknown>} */ (parsed))) {
      data[k] = v == null ? '' : String(v)
    }
    return { ok: true, data }
  } catch {
    return { ok: false, error: 'Invalid JSON. Check commas, quotes, and matching braces.' }
  }
}

/** @param {Record<string, string>} obj */
export function objectToRows(obj) {
  const entries = Object.entries(obj)
  if (!entries.length) return [{ id: newStepId(), key: '', value: '' }]
  return entries.map(([key, value]) => ({
    id: newStepId(),
    key,
    value: value == null ? '' : String(value),
  }))
}

/** @param {{ id: string, key: string, value: string }[]} rows */
export function rowsToObject(rows) {
  /** @type {Record<string, string>} */
  const out = {}
  for (const r of rows) {
    const k = String(r.key ?? '').trim()
    if (k) out[k] = String(r.value ?? '')
  }
  return out
}

/** @param {{ id: string, key: string, value: string }[]} rows */
export function sortedKeysFromRows(rows) {
  const keys = new Set()
  for (const r of rows) {
    const k = String(r.key ?? '').trim()
    if (k) keys.add(k)
  }
  return [...keys].sort((a, b) => a.localeCompare(b))
}

/** @param {string} jsonString */
export function sortedKeysFromJsonString(jsonString) {
  const r = parseSampleFormJson(jsonString)
  if (!r.ok) return []
  return Object.keys(r.data).sort((a, b) => a.localeCompare(b))
}
