import { useState, useEffect } from 'react'
import './App.css'
import { InspectorWorkflow } from './components/InspectorWorkflow.jsx'
import { loadWorkflowFromStorage, saveWorkflowToStorage } from './workflow/model.js'

const INSPECTOR_WIDTH_KEY = 'inspector-width'
const MIN_WIDTH = 300
const MAX_WIDTH = 700
const DEFAULT_WIDTH = 420

export default function App() {
  const button = { id: 'button1', name: 'button1', label: 'Click me' }

  const [selected, setSelected] = useState<string | null>(null)
  const [workflow, setWorkflow] = useState(() => loadWorkflowFromStorage(button.id))
  const [inspectorWidth, setInspectorWidth] = useState<number>(() => {
    const saved = parseInt(localStorage.getItem(INSPECTOR_WIDTH_KEY) ?? '', 10)
    return Number.isFinite(saved) ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, saved)) : DEFAULT_WIDTH
  })

  useEffect(() => {
    saveWorkflowToStorage(button.id, workflow)
  }, [button.id, workflow])

  function onResizeMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const startX = e.clientX
    const startWidth = inspectorWidth
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    const onMove = (moveE: MouseEvent) => {
      const dx = startX - moveE.clientX
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + dx))
      setInspectorWidth(next)
    }

    const onUp = () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setInspectorWidth((w) => {
        localStorage.setItem(INSPECTOR_WIDTH_KEY, String(w))
        return w
      })
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

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
        <aside className="inspector" style={{ width: inspectorWidth }}>
          <div className="inspector-resize-handle" onMouseDown={onResizeMouseDown} title="Drag to resize" />
          <header className="inspector-header">
            <span className="inspector-title">{button.name}</span>
            <button className="inspector-close" onClick={() => setSelected(null)} aria-label="Close inspector">
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
