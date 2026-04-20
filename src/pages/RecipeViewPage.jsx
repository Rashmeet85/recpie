import { useState } from 'react'
import { useStore, TAG_COLORS } from '../store/useStore'
import { exportSinglePDF, exportSingleDocx, exportToPDF, exportToDocx } from '../utils/export'
import { scaleRecipe } from '../utils/recipeScaling'

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
  const { selectedRecipe, setPage, deleteRecipe, recipes, isAdmin } = useStore()
  const recipe = selectedRecipe
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [scaleFactorInput, setScaleFactorInput] = useState('1')

  if (!recipe) {
    setPage('library')
    return null
  }

  const scaleFactor = Number(scaleFactorInput)
  const safeScaleFactor = Number.isFinite(scaleFactor) && scaleFactor > 0 ? scaleFactor : 1
  const scaledRecipe = scaleRecipe(recipe, safeScaleFactor)
  const tagColor = TAG_COLORS[recipe.tag] || TAG_COLORS.Other

  const handleDelete = async () => {
    await deleteRecipe(recipe.id)
    setPage('library')
  }

  const handleExport = async (type) => {
    setShowExportMenu(false)
    setExporting(true)

    try {
      if (type === 'pdf-single') await exportSinglePDF(scaledRecipe)
      else if (type === 'docx-single') await exportSingleDocx(scaledRecipe)
      else if (type === 'pdf-all') await exportToPDF(recipes)
      else if (type === 'docx-all') await exportToDocx(recipes)
    } catch (error) {
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div
        className="no-print"
        style={{
          background: 'rgba(250,248,255,0.74)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.55)',
          padding: '54px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button onClick={() => setPage('library')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', padding: 4, display: 'flex' }}>
          <BackIcon />
        </button>
        <div style={{ flex: 1 }} />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.58)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--warm-gray)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <DownloadIcon /> {exporting ? '...' : 'Export'}
          </button>

          {showExportMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 44,
                zIndex: 100,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.58)',
                borderRadius: 14,
                boxShadow: 'var(--shadow-soft)',
                overflow: 'hidden',
                minWidth: 200,
              }}
            >
              {[
                { id: 'pdf-single', label: 'This recipe as PDF' },
                { id: 'docx-single', label: 'This recipe as Word' },
                { id: 'pdf-all', label: 'All recipes as PDF' },
                { id: 'docx-all', label: 'All recipes as Word' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleExport(option.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '13px 18px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'var(--charcoal)',
                    borderBottom: '1px solid rgba(201,169,110,0.1)',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(event) => { event.currentTarget.style.background = 'rgba(180,149,255,0.12)' }}
                  onMouseOut={(event) => { event.currentTarget.style.background = 'none' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAdmin && (
          <>
            <button onClick={() => setPage('add', { editing: recipe })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warm-gray)', padding: 6 }}>
              <EditIcon />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e05a3a', padding: 6 }}>
              <TrashIcon />
            </button>
          </>
        )}
      </div>

      <div style={{ padding: '0 20px 32px' }}>
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.05s', textAlign: 'center', padding: '32px 0 24px' }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, rgba(255,218,241,0.92), rgba(196,210,255,0.84))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              boxShadow: '0 14px 34px rgba(122, 96, 209, 0.16)',
            }}
          >
            {scaledRecipe.emoji || '🍴'}
          </div>

          {scaledRecipe.tag && (
            <span
              style={{
                display: 'inline-block',
                marginBottom: 10,
                padding: '4px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                background: tagColor.bg,
                color: tagColor.color,
                border: `1px solid ${tagColor.border}`,
              }}
            >
              {scaledRecipe.tag}
            </span>
          )}

          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 34,
              fontWeight: 600,
              color: 'var(--charcoal)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            {scaledRecipe.name}
          </h1>

          <div style={{ marginTop: 12, height: 1.5, background: 'linear-gradient(90deg, transparent, #c79fff, transparent)' }} />
        </div>

        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.08s', marginBottom: 24 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.52)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.85)',
              borderRadius: 18,
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Scale Recipe
                </p>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--light-warm)' }}>
                  Multiply ingredients and recipe quantities by any factor.
                </p>
              </div>
              <button
                onClick={() => setScaleFactorInput('1')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(201,169,110,0.25)',
                  background: 'rgba(255,255,255,0.62)',
                  color: 'var(--warm-gray)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                className="input-field"
                type="number"
                min="0.1"
                step="0.1"
                value={scaleFactorInput}
                onChange={(event) => setScaleFactorInput(event.target.value)}
                style={{ maxWidth: 140 }}
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)' }}>
                {safeScaleFactor === 1 ? 'Original recipe' : `Scaled x${safeScaleFactor}`}
              </span>
            </div>
          </div>
        </div>

        {scaledRecipe.meta?.filter((item) => item.value).length > 0 && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s', marginBottom: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, scaledRecipe.meta.filter((item) => item.value).length)}, 1fr)`, gap: 8 }}>
              {scaledRecipe.meta.filter((item) => item.value).map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255,255,255,0.52)',
                    borderRadius: 18,
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.58)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {scaledRecipe.ingredients?.length > 0 && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.15s', marginBottom: 28 }}>
            <SectionHeader icon="🌾" title="Ingredients" color="var(--rose)" />
            <div
              style={{
                background: 'rgba(255,255,255,0.52)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.85)',
                borderRadius: 18,
                overflow: 'hidden',
              }}
            >
              {scaledRecipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '13px 18px',
                    borderBottom: index < scaledRecipe.ingredients.length - 1 ? '1px solid rgba(201,169,110,0.1)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose)', opacity: 0.6, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--charcoal)' }}>{ingredient.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--warm-gray)', whiteSpace: 'nowrap', marginLeft: 12 }}>{ingredient.amount}</span>
                </div>
              ))}
            </div>

            {scaledRecipe.ingredientNote && (
              <p style={{ margin: '10px 0 0 4px', fontSize: 13, fontStyle: 'italic', color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
                {scaledRecipe.ingredientNote}
              </p>
            )}
          </div>
        )}

        {scaledRecipe.method?.length > 0 && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s', marginBottom: 28 }}>
            <SectionHeader icon="👩‍🍳" title="Method" color="var(--sage)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scaledRecipe.method.map((step, index) => (
                <div key={index} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      minWidth: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(255,143,220,0.16), rgba(157,124,255,0.16))',
                      border: '1.5px solid rgba(180,149,255,0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--rose)',
                      flexShrink: 0,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {index + 1}
                  </span>
                  <p style={{ margin: '5px 0 0', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--charcoal)' }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {scaledRecipe.tips && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.25s', marginBottom: 28 }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255,224,245,0.68), rgba(219,225,255,0.65))',
                border: '1px solid rgba(255,255,255,0.55)',
                borderRadius: 16,
                padding: '16px 18px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                Baker&apos;s Tips
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.65, color: 'var(--charcoal)' }}>{scaledRecipe.tips}</p>
            </div>
          </div>
        )}

        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.3s', marginBottom: 28 }}>
          <SectionHeader icon="📝" title="My Notes" color="var(--light-warm)" />
          <div
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: 16,
              padding: '16px 18px',
              minHeight: 100,
            }}
          >
            {scaledRecipe.notes ? (
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.7, color: 'var(--charcoal)', whiteSpace: 'pre-wrap' }}>{scaledRecipe.notes}</p>
            ) : (
              <div>
                {[...Array(4)].map((_, index) => (
                  <div key={index} style={{ height: 1, background: 'rgba(176,158,150,0.25)', marginBottom: 22 }} />
                ))}
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic', color: 'var(--light-warm)' }}>
                  Tap edit to add your personal notes...
                </p>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontStyle: 'italic', color: 'var(--light-warm)', marginTop: 16 }}>
          Made with love by Kaur&apos;s Cakery
        </p>
      </div>

      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(33,24,67,0.34)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 0 env(safe-area-inset-bottom)',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: 'rgba(248,246,255,0.88)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px 32px',
              width: '100%',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(176,158,150,0.4)', margin: '0 auto 20px' }} />
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>Delete Recipe?</h3>
            <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--warm-gray)' }}>
              &quot;{recipe.name}&quot; will be permanently removed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleDelete}
                style={{
                  padding: '15px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#e05a3a',
                  color: 'white',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete Recipe
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '15px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'rgba(176,158,150,0.15)',
                  color: 'var(--warm-gray)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
