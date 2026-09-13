import { createPortal } from 'react-dom'

const AI_ACTIONS = [
  {
    id: 'fixFormatting',
    icon: '✏️',
    label: 'Fix Formatting',
    description: 'Clean punctuation, spacing & typos',
    color: '#8aa7ff',
  },
  {
    id: 'polishMethod',
    icon: '✨',
    label: 'Polish Method',
    description: 'Clearer steps & professional tone',
    color: '#f472d0',
  },
  {
    id: 'extractIngredients',
    icon: '🔍',
    label: 'Extract Ingredients',
    description: 'Find missing ingredients from method',
    color: '#ae7bff',
  },
  {
    id: 'missingDetails',
    icon: '⚠️',
    label: 'Missing Details Checker',
    description: 'Audit oven temps, yields & tips',
    color: '#b495ff',
  },
  {
    id: 'scaleRecipe',
    icon: '⚖️',
    label: 'Scale Recipe Guidance',
    description: 'Batch multiply with baking advice',
    color: '#8aa7ff',
  },
  {
    id: 'shoppingList',
    icon: '🛒',
    label: 'Shopping List',
    description: 'Categorized ingredients checklist',
    color: '#f472d0',
  },
]

export default function RecipeAiMenu({ isOpen, onClose, onSelectAction }) {
  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(28, 26, 46, 0.32)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '0 18px calc(64px + env(safe-area-inset-bottom) + 78px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          width: 'min(380px, calc(100vw - 36px))',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(26px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(26px) saturate(1.4)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: 24,
          padding: 16,
          boxShadow: '0 24px 60px rgba(68, 43, 128, 0.22), 0 1px 0 rgba(255, 255, 255, 0.6) inset',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 10px' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--light-warm)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Kaur&apos;s Cakery AI
            </p>
            <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--charcoal)' }}>
              Recipe Assistant
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(151, 145, 190, 0.16)',
              color: 'var(--warm-gray)',
              fontSize: 14,
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '60dvh', overflowY: 'auto' }}>
          {AI_ACTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectAction(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.65)',
                background: 'rgba(255, 255, 255, 0.52)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                e.currentTarget.style.transform = 'translateX(2px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.52)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(255,224,245,0.85), rgba(220,227,255,0.85))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(142, 106, 232, 0.12)',
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--charcoal)' }}>
                  {item.label}
                </p>
                <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--warm-gray)', lineHeight: 1.3 }}>
                  {item.description}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--light-warm)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

