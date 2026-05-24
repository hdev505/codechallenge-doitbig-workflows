export interface WorkflowStep {
  id: string
  type: string
  config: Record<string, unknown>
  continueOnError?: boolean
}

export interface Workflow {
  version: number
  trigger: 'submit'
  continueOnError?: boolean
  steps: WorkflowStep[]
}

export interface RunContext {
  form?: Record<string, string>
}

export interface RunResult {
  ok: boolean
  message: string
  detail?: unknown
}

export type FieldInputType = 'text' | 'textarea' | 'select' | 'formField'

export interface FieldDef {
  key: string
  label: string
  input: FieldInputType
  placeholder?: string
  options?: string[]
}

export interface ActionDefinition {
  type: string
  label: string
  defaultConfig: Record<string, unknown>
  fieldDefs: FieldDef[]
  run: (config: Record<string, unknown>, ctx: RunContext) => Promise<RunResult>
}

export const WORKFLOW_VERSION = 2

export function newStepId(): string {
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyWorkflow(): Workflow {
  return { version: WORKFLOW_VERSION, trigger: 'submit', continueOnError: false, steps: [] }
}

export function cloneWorkflow(workflow: Workflow): Workflow {
  return JSON.parse(JSON.stringify(workflow)) as Workflow
}

export function storageKeyForButton(buttonId: string): string {
  return `workflow:${buttonId}`
}

function migrateWorkflow(parsed: unknown): Workflow {
  if (!parsed || typeof parsed !== 'object') return createEmptyWorkflow()
  const p = parsed as Record<string, unknown>
  if (p.trigger !== 'submit' || !Array.isArray(p.steps)) return createEmptyWorkflow()

  const version = Number(p.version) || 1
  if (version > WORKFLOW_VERSION) return createEmptyWorkflow()

  const base: Workflow = {
    version: WORKFLOW_VERSION,
    trigger: 'submit',
    continueOnError: typeof p.continueOnError === 'boolean' ? p.continueOnError : false,
    steps: p.steps as WorkflowStep[],
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

export function loadWorkflowFromStorage(buttonId: string): Workflow {
  try {
    const raw = localStorage.getItem(storageKeyForButton(buttonId))
    if (!raw) return createEmptyWorkflow()
    const parsed = JSON.parse(raw) as unknown
    return migrateWorkflow(parsed)
  } catch {
    return createEmptyWorkflow()
  }
}

export function saveWorkflowToStorage(buttonId: string, workflow: Workflow): void {
  localStorage.setItem(storageKeyForButton(buttonId), JSON.stringify(workflow))
}

export const TEMPLATES: Record<string, () => Workflow> = {
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
