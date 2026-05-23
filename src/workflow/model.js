/** @typedef {{ id: string, type: string, config: Record<string, unknown>, continueOnError?: boolean }} WorkflowStep */
/** @typedef {{ version: number, trigger: 'submit', continueOnError?: boolean, steps: WorkflowStep[] }} Workflow */

export const WORKFLOW_VERSION = 2

export function newStepId() {
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** @returns {Workflow} */
export function createEmptyWorkflow() {
  return { version: WORKFLOW_VERSION, trigger: 'submit', continueOnError: false, steps: [] }
}

/** @param {Workflow} workflow */
export function cloneWorkflow(workflow) {
  return JSON.parse(JSON.stringify(workflow))
}

export function storageKeyForButton(buttonId) {
  return `workflow:${buttonId}`
}

/** @param {unknown} parsed */
function migrateWorkflow(parsed) {
  if (!parsed || typeof parsed !== 'object') return createEmptyWorkflow()
  const p = /** @type {Record<string, unknown>} */ (parsed)
  if (p.trigger !== 'submit' || !Array.isArray(p.steps)) return createEmptyWorkflow()

  const version = Number(p.version) || 1
  if (version > WORKFLOW_VERSION) return createEmptyWorkflow()

  /** @type {Workflow} */
  const base = {
    version: WORKFLOW_VERSION,
    trigger: 'submit',
    continueOnError: typeof p.continueOnError === 'boolean' ? p.continueOnError : false,
    steps: /** @type {WorkflowStep[]} */ (p.steps),
  }

  if (version === 1) {
    base.continueOnError = false
  }

  for (const step of base.steps) {
    if (!step || typeof step !== 'object' || typeof step.id !== 'string' || typeof step.type !== 'string') {
      return createEmptyWorkflow()
    }
    if (!step.config || typeof step.config !== 'object') step.config = {}
    if (typeof step.continueOnError !== 'boolean') delete step.continueOnError
  }

  return base
}

/** @param {string} buttonId */
export function loadWorkflowFromStorage(buttonId) {
  try {
    const raw = localStorage.getItem(storageKeyForButton(buttonId))
    if (!raw) return createEmptyWorkflow()
    const parsed = JSON.parse(raw)
    return migrateWorkflow(parsed)
  } catch {
    return createEmptyWorkflow()
  }
}

/** @param {string} buttonId @param {Workflow} workflow */
export function saveWorkflowToStorage(buttonId, workflow) {
  localStorage.setItem(storageKeyForButton(buttonId), JSON.stringify(workflow))
}

/** @type {Record<string, () => Workflow>} */
export const TEMPLATES = {
  sendToApi: () => ({
    version: WORKFLOW_VERSION,
    trigger: 'submit',
    continueOnError: false,
    steps: [
      {
        id: newStepId(),
        type: 'httpRequest',
        config: { method: 'POST', url: 'https://api.example.com/leads', headers: '{}', body: '{"source":"landing-page"}' },
      },
    ],
  }),
  saveLead: () => ({
    version: WORKFLOW_VERSION,
    trigger: 'submit',
    continueOnError: false,
    steps: [
      {
        id: newStepId(),
        type: 'saveRecord',
        config: { table: 'leads', mode: 'create', fieldsText: 'email: {{form.email}}\nname: {{form.name}}\nsource: web-form' },
      },
    ],
  }),
  notifyTeam: () => ({
    version: WORKFLOW_VERSION,
    trigger: 'submit',
    continueOnError: false,
    steps: [
      {
        id: newStepId(),
        type: 'sendEmail',
        config: { to: 'team@example.com', subject: 'New submission', body: 'A user submitted the form.' },
      },
      {
        id: newStepId(),
        type: 'httpRequest',
        config: { method: 'POST', url: 'https://hooks.example.com/notify', headers: '{}', body: '{"text":"New submission"}' },
      },
    ],
  }),
  conditionalUpsell: () => ({
    version: WORKFLOW_VERSION,
    trigger: 'submit',
    continueOnError: false,
    steps: [
      {
        id: newStepId(),
        type: 'saveRecord',
        config: { table: 'leads', mode: 'upsert', fieldsText: 'email: {{form.email}}\nplan: {{form.plan}}' },
      },
      {
        id: newStepId(),
        type: 'condition',
        config: { fieldKey: 'plan', op: 'equals', value: 'pro' },
      },
      {
        id: newStepId(),
        type: 'slackMessage',
        config: { webhookUrl: 'https://hooks.slack.com/services/EXAMPLE', text: 'New Pro signup: {{form.email}}' },
      },
    ],
  }),
  deleteStale: () => ({
    version: WORKFLOW_VERSION,
    trigger: 'submit',
    continueOnError: true,
    steps: [
      {
        id: newStepId(),
        type: 'deleteRecord',
        config: { table: 'drafts', filterText: 'session_id: {{form.session_id}}' },
      },
      {
        id: newStepId(),
        type: 'saveRecord',
        config: { table: 'orders', mode: 'create', fieldsText: 'email: {{form.email}}\namount: {{form.amount}}' },
      },
    ],
  }),
}
