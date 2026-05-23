import { interpolateConfig } from '../workflow/interpolate.js'

export async function runSendEmail(config, ctx = {}) {
  const c = interpolateConfig(config, ctx)
  const to = String(c.to || '').trim()
  const subject = String(c.subject || '').trim()
  if (!to) return { ok: false, message: 'Add a recipient.' }
  if (!subject) return { ok: false, message: 'Add a subject.' }

  await delay(180)
  return {
    ok: true,
    message: `Email → ${to}`,
    detail: { to, subject, body: String(c.body || '') },
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export const sendEmailAction = {
  type: 'sendEmail',
  label: 'Send email',
  defaultConfig: { to: '', subject: '', body: '' },
  fieldDefs: [
    { key: 'to', label: 'To', input: 'text', placeholder: 'name@…' },
    { key: 'subject', label: 'Subject', input: 'text', placeholder: '…' },
    { key: 'body', label: 'Body', input: 'textarea', placeholder: '…' },
  ],
}
