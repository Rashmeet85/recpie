import { useStore, TAG_COLORS } from '../store/useStore'

export default function RecipeCard({ recipe, index }) {
  const { setPage } = useStore()
  const tagColor = TAG_COLORS[recipe.tag] || TAG_COLORS.Other

  return (
    <div
      onClick={() => setPage('view', { recipe })}
      className="recipe-card animate-fade-up"
      style={{
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        border: '1px solid rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: '18px 20px',
        cursor: 'pointer',
        boxShadow: '0 2px 16px rgba(45,40,38,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, var(--rose), var(--gold))',
        opacity: 0.7, borderRadius: '20px 20px 0 0'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Emoji badge */}
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(242,217,208,0.8), rgba(232,213,176,0.6))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(212,136,106,0.2)',
        }}>
          {recipe.emoji || '🍴'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: '0 0 6px',
            fontFamily: 'var(--font-display)',
            fontSize: 20, fontWeight: 600,
            color: 'var(--charcoal)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            {recipe.name}
          </h3>

          {/* Meta preview */}
          {recipe.meta?.length > 0 && (
            <p style={{
              margin: '0 0 8px',
              fontSize: 12.5,
              color: 'var(--warm-gray)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {recipe.meta.slice(0, 2).map(m => `${m.label}: ${m.value}`).join('  ·  ')}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {recipe.tag && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 500,
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.03em',
                background: tagColor.bg, color: tagColor.color,
                border: `1px solid ${tagColor.border}`,
              }}>
                {recipe.tag}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--light-warm)', fontFamily: 'var(--font-body)' }}>
              {recipe.ingredients?.length || 0} ingredients
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: 'var(--light-warm)', flexShrink: 0, marginTop: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
