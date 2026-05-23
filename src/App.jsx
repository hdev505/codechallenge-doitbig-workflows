import { useState, useEffect } from 'react'
import './App.css'
import { InspectorWorkflow } from './components/InspectorWorkflow.jsx'
import { loadWorkflowFromStorage, saveWorkflowToStorage } from './workflow/model.js'

export default function App() {
  const button = { id: 'button1', name: 'button1', label: 'Click me' }

  const [selected, setSelected] = useState(null)
  const [workflow, setWorkflow] = useState(() => loadWorkflowFromStorage(button.id))

  useEffect(() => {
    saveWorkflowToStorage(button.id, workflow)
  }, [button.id, workflow])

  return (
    <div className="layout">
      <main className="main">
        <button
          className={`canvas-button${selected === button.id ? ' is-selected' : ''}`}
          onClick={() => setSelected(button.id)}
        >
          {button.label}
        </button>
      </main>

      {selected === button.id && (
        <aside className="inspector">
          <header className="inspector-header">
            <span className="inspector-title">{button.name}</span>
            <button
              className="inspector-close"
              onClick={() => setSelected(null)}
              aria-label="Close inspector"
            >
              ×
            </button>
          </header>
          <div className="inspector-body">
            <InspectorWorkflow workflow={workflow} onWorkflowChange={setWorkflow} />
          </div>
        </aside>
      )}
    </div>
  )
}
