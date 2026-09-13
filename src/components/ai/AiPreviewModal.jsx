import { useState } from 'react'
import { createPortal } from 'react-dom'
import AiDiffView from './AiDiffView'

const ACTION_TITLES = {
  fixFormatting: 'Fix Formatting Preview',
  polishMethod: 'Polish Method Preview',
  extractIngredients: 'Extract Ingredients Preview',
  missingDetails: 'Recipe Audit & Suggestions',
  scaleRecipe: 'Scale Recipe Guidance',
  shoppingList: 'Shopping List',
}

export default function AiPreviewModal({
  isOpen,
  onClose,
  action,
  loading,
  error,
  result,
  recipe,
  onApply,
  onRetry,
  isAdmin,
}) {
  const [selectedAdditions, setSelectedAdditions] = useState({})
  const [copyToastMessage, setCopyToastMessage] = useState('')

  if (!isOpen || typeof document === 'undefined') return null

  const title = ACTION_TITLES[action] || 'AI Assistant Preview'

  const handleToggleAddition = (key) => {
    setSelectedAdditions((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }))
  }

  const handleCopyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyToastMessage('Copied to clipboard!')
      setTimeout(() => setCopyToastMessage(''), 3000)
    } catch {
      setCopyToastMessage('Could not copy')
      setTimeout(() => setCopyToastMessage(''), 3000)
    }
  }

  const handleApply = () => {
    if (!result || !isAdmin) return

    let updated = { ...recipe }

    if (action === 'fixFormatting' || action === 'polishMethod') {
      if (Array.isArray(result.method) && result.method.length > 0) {
        updated.method = result.method
      }
    } else if (action === 'extractIngredients') {
      const missing = result.missingIngredients || []
      const additions = missing.filter((_, idx) => selectedAdditions[`missing-${idx}`] !== false)
      if (additions.length > 0) {
        updated.ingredients = [...(recipe.ingredients || []), ...additions]
      }
    } else if (action === 'missingDetails') {
      const fixes = result.suggestedFixes || {}
      const metaAdditions = (fixes.meta || []).filter((_, idx) => selectedAdditions[`meta-${idx}`] !== false)
      const ingAdditions = (fixes.ingredients || []).filter((_, idx) => selectedAdditions[`ing-${idx}`] !== false)

      if (metaAdditions.length > 0) {
        updated.meta = [...(recipe.meta || []), ...metaAdditions]
      }
      if (ingAdditions.length > 0) {
        updated.ingredients = [...(recipe.ingredients || []), ...ingAdditions]
      }
    } else if (action === 'shoppingList') {
      // For shopping list, we don't mutate the recipe unless user wants to append to notes
      onClose()
      return
    }

    onApply(updated)
    onClose()
  }

  const isShoppingList = action === 'shoppingList'
  const isScaleGuidance = action === 'scaleRecipe'
  const canApplyChanges = isAdmin && !isShoppingList && !isScaleGuidance

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(28, 26, 46, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: 'min(88dvh, 760px)',
          background: 'rgba(252, 250, 255, 0.94)',
          backdropFilter: 'blur(28px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: 24,
          boxShadow: '0 28px 70px rgba(68, 43, 128, 0.28), 0 1px 0 rgba(255, 255, 255, 0.6) inset',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid rgba(151, 145, 190, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--light-warm)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              AI Preview • Kaur&apos;s Cakery
            </p>
            <h2 style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--charcoal)' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(151, 145, 190, 0.16)',
              color: 'var(--warm-gray)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div
          style={{
            padding: '18px 20px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 16px', margin: 'auto' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '3px solid rgba(180, 149, 255, 0.25)',
                  borderTopColor: 'var(--rose)',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--charcoal)' }}>
                Consulting the Baker AI…
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)' }}>
                Carefully analyzing recipe instructions and ingredients
              </p>
            </div>
          )}

          {error && !loading && (
            <div style={{ padding: '24px 16px', textAlign: 'center', margin: 'auto' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: '#c24a2d' }}>
                Could not complete AI action
              </p>
              <p style={{ margin: '0 0 18px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)', lineHeight: 1.5 }}>
                {error}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {!loading && !error && result && (
            <AiDiffView
              action={action}
              result={result}
              recipe={recipe}
              selectedAdditions={selectedAdditions}
              onToggleAddition={handleToggleAddition}
              copyToastMessage={copyToastMessage}
              onCopyText={handleCopyText}
            />
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && result && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(151, 145, 190, 0.2)',
              background: 'rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              {!isAdmin && canApplyChanges && (
                <span style={{ fontSize: 11, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
                  Viewer mode: suggestions cannot be saved to database.
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '11px 18px',
                  borderRadius: 14,
                  border: '1px solid rgba(151, 145, 190, 0.35)',
                  background: 'rgba(255, 255, 255, 0.7)',
                  color: 'var(--warm-gray)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {canApplyChanges ? 'Cancel' : 'Done'}
              </button>

              {canApplyChanges && (
                <button
                  onClick={handleApply}
                  style={{
                    padding: '11px 22px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 10px 24px rgba(142, 106, 232, 0.26)',
                  }}
                >
                  Apply Changes
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

