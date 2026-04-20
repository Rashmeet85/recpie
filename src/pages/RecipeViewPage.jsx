import { useState } from 'react'
import { useStore, TAG_COLORS } from '../store/useStore'
import { exportSinglePDF, exportSingleDocx, exportToPDF, exportToDocx } from '../utils/export'

function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
}
function EditIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
}
function DownloadIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}

export default function RecipeViewPage() {
  const { selectedRecipe, setPage, deleteRecipe, recipes } = useStore()
  const recipe = selectedRecipe
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState(false)

  if (!recipe) { setPage('library'); return null }

  const tagColor = TAG_COLORS[recipe.tag] || TAG_COLORS.Other

  const handleDelete = async () => {
    await deleteRecipe(recipe.id)
    setPage('library')
  }

  const handleExport = async (type) => {
    setShowExportMenu(false)
    setExporting(true)
    try {
      if (type === 'pdf-single') await exportSinglePDF(recipe)
      else if (type === 'docx-single') await exportSingleDocx(recipe)
      else if (type === 'pdf-all') await exportToPDF(recipes)
      else if (type === 'docx-all') await exportToDocx(recipes)
    } catch (e) { console.error(e) }
    finally { setExporting(false) }
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(249,243,238,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,169,110,0.15)',
        padding: '54px 20px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }} className="no-print">
        <button onClick={() => setPage('library')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', padding: 4, display: 'flex' }}>
          <BackIcon />
        </button>
        <div style={{ flex: 1 }} />

        {/* Export button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(201,169,110,0.3)',
              cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <DownloadIcon /> {exporting ? '…' : 'Export'}
          </button>
          {showExportMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 44, zIndex: 100,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(201,169,110,0.25)', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(45,40,38,0.15)', overflow: 'hidden', minWidth: 200,
            }}>
              {[
                { id: 'pdf-single', label: '📄 This recipe as PDF' },
                { id: 'docx-single', label: '📝 This recipe as Word' },
                { id: 'pdf-all', label: '📚 All recipes as PDF' },
                { id: 'docx-all', label: '📖 All recipes as Word' },
              ].map(opt => (
                <button key={opt.id} onClick={() => handleExport(opt.id)} style={{
                  display: 'block', width: '100%', padding: '13px 18px', border: 'none',
                  background: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--charcoal)',
                  borderBottom: '1px solid rgba(201,169,110,0.1)',
                  transition: 'background 0.15s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(212,136,106,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >{opt.label}</button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setPage('add', { editing: recipe })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warm-gray)', padding: 6 }}>
          <EditIcon />
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e05a3a', padding: 6 }}>
          <TrashIcon />
        </button>
      </div>

      {/* Recipe content */}
      <div style={{ padding: '0 20px 32px' }}>

        {/* Hero section */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.05s', textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{
            width: 84, height: 84, borderRadius: 24, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(242,217,208,0.9), rgba(232,213,176,0.7))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44, boxShadow: '0 8px 24px rgba(212,136,106,0.2)',
          }}>
            {recipe.emoji || '🍴'}
          </div>

          {recipe.tag && (
            <span style={{
              display: 'inline-block', marginBottom: 10, padding: '4px 14px', borderRadius: 20,
              fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)',
              background: tagColor.bg, color: tagColor.color, border: `1px solid ${tagColor.border}`,
            }}>{recipe.tag}</span>
          )}

          <h1 style={{
            margin: '0 0 0', fontFamily: 'var(--font-display)',
            fontSize: 34, fontWeight: 600, color: 'var(--charcoal)',
            letterSpacing: '-0.02em', lineHeight: 1.15
          }}>
            {recipe.name}
          </h1>

          <div style={{ marginTop: 12, height: 1.5, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        </div>

        {/* Meta grid */}
        {recipe.meta?.filter(m => m.value).length > 0 && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s', marginBottom: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, recipe.meta.filter(m=>m.value).length)}, 1fr)`, gap: 8 }}>
              {recipe.meta.filter(m => m.value).map((m, i) => (
                <div key={i} style={{
                  background: 'rgba(242,217,208,0.55)', borderRadius: 14, padding: '12px 8px',
                  textAlign: 'center', border: '1px solid rgba(242,217,208,0.8)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.15s', marginBottom: 28 }}>
            <SectionHeader icon="🌾" title="Ingredients" color="var(--rose)" />
            <div style={{
              background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.85)', borderRadius: 18,
              overflow: 'hidden',
            }}>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 18px',
                  borderBottom: i < recipe.ingredients.length - 1 ? '1px solid rgba(201,169,110,0.1)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose)', opacity: 0.6, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--charcoal)' }}>{ing.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--warm-gray)', whiteSpace: 'nowrap', marginLeft: 12 }}>{ing.amount}</span>
                </div>
              ))}
            </div>
            {recipe.ingredientNote && (
              <p style={{ margin: '10px 0 0 4px', fontSize: 13, fontStyle: 'italic', color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
                {recipe.ingredientNote}
              </p>
            )}
          </div>
        )}

        {/* Method */}
        {recipe.method?.length > 0 && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s', marginBottom: 28 }}>
            <SectionHeader icon="👩‍🍳" title="Method" color="var(--sage)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recipe.method.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    minWidth: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(212,136,106,0.15), rgba(201,169,110,0.15))',
                    border: '1.5px solid rgba(212,136,106,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--rose)', flexShrink: 0,
                    fontFamily: 'var(--font-body)',
                  }}>{i + 1}</span>
                  <p style={{ margin: '5px 0 0', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--charcoal)' }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {recipe.tips && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.25s', marginBottom: 28 }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(232,213,176,0.5), rgba(242,217,208,0.4))',
              border: '1px solid rgba(201,169,110,0.35)',
              borderRadius: 16, padding: '16px 18px',
              backdropFilter: 'blur(10px)',
            }}>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                💡 Baker's Tips
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.65, color: 'var(--charcoal)' }}>{recipe.tips}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.3s', marginBottom: 28 }}>
          <SectionHeader icon="📝" title="My Notes" color="var(--light-warm)" />
          <div style={{
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)', borderRadius: 16,
            padding: '16px 18px', minHeight: 100,
          }}>
            {recipe.notes ? (
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.7, color: 'var(--charcoal)', whiteSpace: 'pre-wrap' }}>{recipe.notes}</p>
            ) : (
              <div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ height: 1, background: 'rgba(176,158,150,0.25)', marginBottom: 22 }} />
                ))}
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic', color: 'var(--light-warm)' }}>
                  Tap edit to add your personal notes…
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontStyle: 'italic', color: 'var(--light-warm)', marginTop: 16 }}>
          Made with ❤️ by Kaur's Cakery
        </p>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(45,40,38,0.5)',
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', padding: '0 0 env(safe-area-inset-bottom)',
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'rgba(249,243,238,0.98)', backdropFilter: 'blur(20px)',
            borderRadius: '24px 24px 0 0', padding: '24px 20px 32px', width: '100%',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(176,158,150,0.4)', margin: '0 auto 20px' }} />
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>Delete Recipe?</h3>
            <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--warm-gray)' }}>
              "{recipe.name}" will be permanently removed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleDelete} style={{
                padding: '15px', borderRadius: 14, border: 'none',
                background: '#e05a3a', color: 'white',
                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>Delete Recipe</button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                padding: '15px', borderRadius: 14, border: 'none',
                background: 'rgba(176,158,150,0.15)', color: 'var(--warm-gray)',
                fontFamily: 'var(--font-body)', fontSize: 15, cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Export overlay click-away */}
      {showExportMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowExportMenu(false)} />
      )}
    </div>
  )
}

function SectionHeader({ icon, title, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color, letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
  )
}
