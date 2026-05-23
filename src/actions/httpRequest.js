import { interpolateConfig } from '../workflow/interpolate.js'

export async function runHttpRequest(config, ctx = {}) {
  const c = interpolateConfig(config, ctx)
  const method = String(c.method || 'GET').toUpperCase()
  const url = String(c.url || '').trim()
  if (!url) return { ok: false, message: 'Add a URL.' }

  let headers = {}
  try {
    const h = c.headers
    if (typeof h === 'string' && h.trim()) headers = JSON.parse(h)
    else if (h && typeof h === 'object') headers = h
  } catch {
    return { ok: false, message: 'Headers must be JSON.' }
  }

  let bodyPreview = null
  if (method !== 'GET' && method !== 'HEAD') {
    const b = c.body
    if (typeof b === 'string' && b.trim()) {
      try {
        bodyPreview = JSON.parse(b)
      } catch {
        return { ok: false, message: 'Body must be JSON.' }
      }
    }
  }

  await delay(240)
  return {
    ok: true,
    message: `${method} ${url}`,
    detail: { headers, body: bodyPreview },
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export const httpRequestAction = {
  type: 'httpRequest',
  label: 'Call API',
  defaultConfig: { method: 'POST', url: '', headers: '{}', body: '{}' },
  fieldDefs: [
    { key: 'method', label: 'Method', input: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
    { key: 'url', label: 'URL', input: 'text', placeholder: 'https://…' },
    { key: 'headers', label: 'Headers', input: 'textarea', placeholder: '{ }' },
    { key: 'body', label: 'Body', input: 'textarea', placeholder: '{ }' },
  ],
}
