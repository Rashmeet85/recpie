import { useState } from 'react'
import { useStore, TAGS } from '../store/useStore'
import RecipeCard from '../components/RecipeCard'

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

export default function LibraryPage() {
  const { searchQuery, setSearch, activeTag, setTag, loading, getFilteredRecipes } = useStore()
  const filtered = getFilteredRecipes()

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 0',
        background: 'linear-gradient(180deg, rgba(249,243,238,1) 70%, rgba(249,243,238,0) 100%)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="animate-fade-up" style={{ animationDelay: '0s', opacity: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
            Kaur's Cakery
          </p>
          <h1 style={{ margin: '0 0 20px', fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Recipe Book
          </h1>
        </div>

        {/* Search */}
        <div className="animate-fade-up" style={{ animationDelay: '0.05s', opacity: 0, position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-warm)', pointerEvents: 'none' }}>
            <SearchIcon />
          </span>
          <input
            className="input-field"
            style={{ paddingLeft: 42 }}
            placeholder="Search recipes…"
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setTag(tag)}
              style={{
                padding: '7px 16px', borderRadius: 20, border: 'none',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                background: activeTag === tag
                  ? 'linear-gradient(135deg, #d4886a, #b8614a)'
                  : 'rgba(255,255,255,0.7)',
                color: activeTag === tag ? 'white' : 'var(--warm-gray)',
                border: activeTag === tag ? 'none' : '1px solid rgba(201,169,110,0.25)',
                boxShadow: activeTag === tag ? '0 4px 12px rgba(212,136,106,0.35)' : 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--light-warm)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(212,136,106,0.2)', borderTopColor: 'var(--rose)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>Loading recipes…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍴</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--charcoal)', margin: '0 0 8px' }}>No recipes found</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--light-warm)' }}>
              {searchQuery ? 'Try a different search' : 'Add your first recipe!'}
            </p>
          </div>
        ) : (
          filtered.map((recipe, i) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          ))
        )}
      </div>

      {/* Recipe count */}
      {!loading && filtered.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--light-warm)' }}>
          {filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'}
        </p>
      )}
    </div>
  )
}
