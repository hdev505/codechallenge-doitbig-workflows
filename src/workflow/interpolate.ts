import type { RunContext } from './model.js'

export function interpolateString(text: string, ctx: RunContext): string {
  if (!text.includes('{{')) return text
  const form = ctx.form && typeof ctx.form === 'object' ? ctx.form : {}
  return text.replace(/\{\{\s*form\.([^}]+?)\s*\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim()
    if (!(key in form)) return `{{form.${key}}}`
    const v = form[key]
    return v == null ? '' : String(v)
  })
}

export function interpolateConfig(config: Record<string, unknown>, ctx: RunContext): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === 'string') out[k] = interpolateString(v, ctx)
    else out[k] = v
  }
  return out
}

export function interpolateFormValue(s: unknown, ctx: RunContext): string {
  return interpolateString(String(s ?? ''), ctx)
}
