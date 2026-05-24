import { Database, GitBranch, Globe, Mail, MessageSquare, Trash2 } from 'lucide-react'

export const ACTION_TYPE_ICON: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  httpRequest: Globe,
  saveRecord: Database,
  deleteRecord: Trash2,
  sendEmail: Mail,
  slackMessage: MessageSquare,
  condition: GitBranch,
}

export const ACTION_TYPE_DESC: Record<string, string> = {
  httpRequest: 'GET/POST JSON to an external URL',
  saveRecord: 'Create or update a row in a table',
  deleteRecord: 'Remove rows matching a filter',
  sendEmail: 'Send a templated email',
  slackMessage: 'Post to Slack via webhook',
  condition: 'Run the next step only when a form answer matches',
}

export const ACTION_PICKER_CATEGORIES = [
  { id: 'logic', label: 'Logic', types: ['condition'] },
  { id: 'data', label: 'Data', types: ['saveRecord', 'deleteRecord'] },
  { id: 'messages', label: 'Messages', types: ['sendEmail', 'slackMessage'] },
  { id: 'integrations', label: 'Integrations', types: ['httpRequest'] },
]

export const ACTION_FEATURED_TYPES = ['condition', 'saveRecord']
