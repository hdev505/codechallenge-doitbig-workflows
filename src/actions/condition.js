import { interpolateFormValue } from '../workflow/interpolate.js'

export async function runCondition(config, ctx = {}) {
  const fieldKey = String(config.fieldKey || '').trim()
  if (!fieldKey) return { ok: false, message: 'Choose which form field to check.' }

  const op = String(config.op || 'equals')
  const rawValue = String(config.value ?? '')
  const value = interpolateFormValue(rawValue, ctx)

  const form = ctx.form && typeof ctx.form === 'object' ? ctx.form : {}
  const actual = form[fieldKey] == null ? '' : String(form[fieldKey])

  const pass = evaluateCondition(actual, op, value)

  await delay(40)
  return {
    ok: true,
    message: pass ? `Condition true (${fieldKey})` : `Condition false (${fieldKey})`,
    detail: { fieldKey, op, actual, comparedTo: value, pass },
  }
}

function evaluateCondition(actual, op, value) {
  switch (op) {
    case 'is_empty':
      return actual.trim() === ''
    case 'is_not_empty':
      return actual.trim() !== ''
    case 'equals':
      return actual === value
    case 'not_equals':
      return actual !== value
    case 'contains':
      return actual.toLowerCase().includes(value.toLowerCase())
    default:
      return actual === value
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export const conditionAction = {
  type: 'condition',
  label: 'If condition',
  defaultConfig: { fieldKey: 'plan', op: 'equals', value: 'pro' },
  fieldDefs: [
    {
      key: 'fieldKey',
      label: 'Form field',
      input: 'text',
      placeholder: 'e.g. plan, email, country',
    },
    {
      key: 'op',
      label: 'Operator',
      input: 'select',
      options: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty'],
    },
    {
      key: 'value',
      label: 'Compare to (optional for empty checks)',
      input: 'text',
      placeholder: 'Literal or {{form.other}}',
    },
  ],
}
