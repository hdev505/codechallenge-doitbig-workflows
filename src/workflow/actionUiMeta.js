import { Database, GitBranch, Globe, Mail, MessageSquare, Trash2 } from 'lucide-react'

export const ACTION_TYPE_ICON = {
  httpRequest: Globe,
  saveRecord: Database,
  deleteRecord: Trash2,
  sendEmail: Mail,
  slackMessage: MessageSquare,
  condition: GitBranch,
}

export const ACTION_TYPE_DESC = {
  httpRequest: 'GET/POST JSON to an external URL',
  saveRecord: 'Create or update a row in a table',
  deleteRecord: 'Remove rows matching a filter',
  sendEmail: 'Send a templated email',
  slackMessage: 'Post to Slack via webhook',
  condition: 'Skip the next step when this is false',
}

export const ACTION_PICKER_CATEGORIES = [
  { id: 'data', label: 'Data', types: ['saveRecord', 'deleteRecord'] },
  { id: 'messages', label: 'Messages', types: ['sendEmail', 'slackMessage'] },
  { id: 'integrations', label: 'Integrations', types: ['httpRequest'] },
  { id: 'logic', label: 'Logic', types: ['condition'] },
]
