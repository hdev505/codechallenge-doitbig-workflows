import { useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { ACTION_LIST, getActionDefinition } from '../../actions/index.js'
import { ACTION_PICKER_CATEGORIES, ACTION_TYPE_DESC, ACTION_TYPE_ICON } from '../../workflow/actionUiMeta.js'

export function ActionPickerModal({ open, onClose, onPick }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

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
          {ACTION_PICKER_CATEGORIES.map((cat) => (
            <section key={cat.id} className="action-modal-cat">
              <h3 className="action-modal-cat-label">{cat.label}</h3>
              <div className="action-modal-tiles">
                {cat.types.map((type) => {
                  const def = getActionDefinition(type)
                  if (!def) return null
                  const Icon = ACTION_TYPE_ICON[type] || Plus
                  return (
                    <button
                      key={type}
                      type="button"
                      className="action-tile"
                      onClick={() => {
                        onPick(type)
                        onClose()
                      }}
                    >
                      <span className="action-tile-icon">
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      <span className="action-tile-text">
                        <span className="action-tile-name">{def.label}</span>
                        <span className="action-tile-desc">{ACTION_TYPE_DESC[type] || ''}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
          <p className="action-modal-footnote">
            {ACTION_LIST.length} step types registered — add new ones in <code>src/actions</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
