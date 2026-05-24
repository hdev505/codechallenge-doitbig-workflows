import { useEffect } from 'react'
import { Plus, X, Sparkles } from 'lucide-react'
import { ACTION_LIST, getActionDefinition } from '../../actions/index.js'
import { ACTION_PICKER_CATEGORIES, ACTION_TYPE_DESC, ACTION_TYPE_ICON, ACTION_FEATURED_TYPES } from '../../workflow/actionUiMeta.js'

interface ActionPickerModalProps {
  open: boolean
  onClose: () => void
  onPick: (type: string) => void
}

export function ActionPickerModal({ open, onClose, onPick }: ActionPickerModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handlePick(type: string) {
    onPick(type)
    onClose()
  }

  const featuredTypes = ACTION_FEATURED_TYPES.filter((t) => getActionDefinition(t))
  const categoryTypes = new Set(featuredTypes)

  return (
    <div className="action-modal-root" role="dialog" aria-modal="true" aria-labelledby="action-modal-title">
      <button type="button" className="action-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="action-modal-panel">
        <header className="action-modal-header">
          <div className="action-modal-title-wrap">
            <span className="action-modal-icon" aria-hidden>
              <Plus size={18} strokeWidth={2.25} />
            </span>
            <div>
              <h2 id="action-modal-title" className="action-modal-title">
                Add step
              </h2>
              <p className="action-modal-sub">Choose what runs on the server after the previous step.</p>
            </div>
          </div>
          <button type="button" className="action-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="action-modal-body">
          {/* Featured row */}
          <section className="action-modal-cat">
            <h3 className="action-modal-cat-label">
              <Sparkles size={11} strokeWidth={2.5} aria-hidden style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
              Suggested
            </h3>
            <div className="action-modal-tiles">
              {featuredTypes.map((type) => {
                const def = getActionDefinition(type)
                if (!def) return null
                const Icon = ACTION_TYPE_ICON[type] ?? Plus
                return (
                  <button
                    key={type}
                    type="button"
                    className="action-tile action-tile-featured"
                    onClick={() => handlePick(type)}
                  >
                    <span className="action-tile-icon">
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <span className="action-tile-text">
                      <span className="action-tile-name">{def.label}</span>
                      <span className="action-tile-desc">{ACTION_TYPE_DESC[type] ?? ''}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* All categories, deduplicating featured */}
          {ACTION_PICKER_CATEGORIES.map((cat) => {
            const types = cat.types.filter((t) => !categoryTypes.has(t))
            if (!types.length) return null
            return (
              <section key={cat.id} className="action-modal-cat">
                <h3 className="action-modal-cat-label">{cat.label}</h3>
                <div className="action-modal-tiles">
                  {types.map((type) => {
                    const def = getActionDefinition(type)
                    if (!def) return null
                    const Icon = ACTION_TYPE_ICON[type] ?? Plus
                    return (
                      <button
                        key={type}
                        type="button"
                        className="action-tile"
                        onClick={() => handlePick(type)}
                      >
                        <span className="action-tile-icon">
                          <Icon size={20} strokeWidth={2} />
                        </span>
                        <span className="action-tile-text">
                          <span className="action-tile-name">{def.label}</span>
                          <span className="action-tile-desc">{ACTION_TYPE_DESC[type] ?? ''}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}

          <p className="action-modal-footnote">{ACTION_LIST.length} step types available.</p>
        </div>
      </div>
    </div>
  )
}
