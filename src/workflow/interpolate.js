export function interpolateString(text, ctx) {
  if (typeof text !== 'string' || !text.includes('{{')) return text
  const form = ctx.form && typeof ctx.form === 'object' ? ctx.form : {}
  return text.replace(/\{\{\s*form\.([^}]+?)\s*\}\}/g, (_, rawKey) => {
    const key = String(rawKey).trim()
    if (!(key in form)) return `{{form.${key}}}`
    const v = form[key]
    return v == null ? '' : String(v)
  })
}

export function interpolateConfig(config, ctx) {
  /** @type {Record<string, unknown>} */
  const out = {}
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === 'string') out[k] = interpolateString(v, ctx)
    else out[k] = v
  }
  return out
}

export function interpolateFormValue(s, ctx) {
  return interpolateString(String(s ?? ''), ctx)
}
