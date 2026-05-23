import { interpolateConfig } from '../workflow/interpolate.js'

export async function runSlackMessage(config, ctx = {}) {
  const c = interpolateConfig(config, ctx)
  const webhookUrl = String(c.webhookUrl || '').trim()
  if (!webhookUrl) return { ok: false, message: 'Add a Slack webhook URL.' }

  const text = String(c.text || '').trim()
  if (!text) return { ok: false, message: 'Add message text.' }

  await delay(220)
  return {
    ok: true,
    message: 'Slack incoming webhook (mock)',
    detail: { webhookUrl, payload: { text } },
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export const slackMessageAction = {
  type: 'slackMessage',
  label: 'Slack message',
  defaultConfig: { webhookUrl: '', text: 'New event: {{form.email}}' },
  fieldDefs: [
    { key: 'webhookUrl', label: 'Webhook URL', input: 'text', placeholder: 'https://hooks.slack.com/…' },
    { key: 'text', label: 'Message', input: 'textarea', placeholder: 'Plain text or {{form.field}}' },
  ],
}
