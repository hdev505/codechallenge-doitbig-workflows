import { httpRequestAction, runHttpRequest } from './httpRequest.js'
import { saveRecordAction, runSaveRecord } from './saveRecord.js'
import { sendEmailAction, runSendEmail } from './sendEmail.js'
import { deleteRecordAction, runDeleteRecord } from './deleteRecord.js'
import { slackMessageAction, runSlackMessage } from './slackMessage.js'
import { conditionAction, runCondition } from './condition.js'
import type { ActionDefinition } from '../workflow/model.js'

export type { ActionDefinition }

export const ACTION_REGISTRY: Record<string, ActionDefinition> = {
  [httpRequestAction.type]: { ...httpRequestAction, run: runHttpRequest },
  [saveRecordAction.type]: { ...saveRecordAction, run: runSaveRecord },
  [deleteRecordAction.type]: { ...deleteRecordAction, run: runDeleteRecord },
  [sendEmailAction.type]: { ...sendEmailAction, run: runSendEmail },
  [slackMessageAction.type]: { ...slackMessageAction, run: runSlackMessage },
  [conditionAction.type]: { ...conditionAction, run: runCondition },
}

export const ACTION_LIST = Object.values(ACTION_REGISTRY)

export function getActionDefinition(type: string): ActionDefinition | null {
  return ACTION_REGISTRY[type] ?? null
}
