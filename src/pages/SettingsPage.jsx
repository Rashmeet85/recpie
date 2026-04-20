import { useState } from 'react'
import { useStore } from '../store/useStore'
import { exportToPDF, exportToDocx } from '../utils/export'

export default function SettingsPage() {
  const { recipes, deleteRecipe } = useStore()
  const [exporting, setExporting] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleExport = async (type) => {
    setExporting(type)
    try {
      if (type === 'pdf') await exportToPDF(recipes)
      else if (type === 'docx') await exportToDocx(recipes)
    } catch (e) { console.error(e) }
    finally { setExporting(null) }
  }

  const handleExportJSON = () => {
    const data = JSON.stringify(recipes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kaurscakery_recipes_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (Array.isArray(imported)) {
          // Import not duplicating existing
          const { addRecipe } = useStore.getState()
          const existing = useStore.getState().recipes.map(r => r.id)
          for (const r of imported) {
            if (!existing.includes(r.id)) await addRecipe(r)
          }
          alert(`Imported ${imported.length} recipes!`)
        }
      } catch { alert('Invalid file format') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{ padding: '56px 20px 24px' }}>
      <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.02s' }}>
        <p style={{ margin: '0 0 2px', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          Settings
        </p>
        <h1 style={{ margin: '0 0 28px', fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '-0.02em' }}>
          Your Cakery
        </h1>
      </div>

      {/* Stats card */}
      <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.08s', marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(212,136,106,0.12), rgba(201,169,110,0.1))',
        border: '1px solid rgba(212,136,106,0.2)', borderRadius: 20, padding: '20px',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <StatItem value={recipes.length} label="Recipes" />
          <div style={{ width: 1, background: 'rgba(201,169,110,0.3)' }} />
          <StatItem value={[...new Set(recipes.map(r => r.tag))].filter(Boolean).length} label="Categories" />
          <div style={{ width: 1, background: 'rgba(201,169,110,0.3)' }} />
          <StatItem value={recipes.reduce((sum, r) => sum + (r.ingredients?.length || 0), 0)} label="Ingredients" />
        </div>
      </div>

      {/* Export section */}
      <SettingsSection title="Export Collection" icon="📥" delay="0.12s">
        <SettingsButton
          onClick={() => handleExport('pdf')}
          loading={exporting === 'pdf'}
          icon="📄" label="Export all as PDF"
          sub={`${recipes.length} recipes → beautiful PDF`}
        />
        <SettingsButton
          onClick={() => handleExport('docx')}
          loading={exporting === 'docx'}
          icon="📝" label="Export all as Word"
          sub={`${recipes.length} recipes → editable DOCX`}
        />
        <SettingsButton
          onClick={handleExportJSON}
          icon="💾" label="Backup recipes"
          sub="Export as JSON for safekeeping"
        />
      </SettingsSection>

      {/* Import section */}
      <SettingsSection title="Import" icon="📤" delay="0.16s">
        <label style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          borderRadius: 14, cursor: 'pointer',
          background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)',
          transition: 'background 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.6)'}
        >
          <span style={{ fontSize: 22 }}>📁</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--charcoal)' }}>Restore from backup</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--light-warm)' }}>Import from JSON backup file</p>
          </div>
          <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--light-warm)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </label>
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About" icon="🎂" delay="0.2s">
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.6)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.85)' }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>Kaur's Cakery</h3>
          <p style={{ margin: '0 0 12px', fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic', color: 'var(--warm-gray)' }}>
            Crafted with love, baked with passion
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--light-warm)', lineHeight: 1.6 }}>
            A premium personal recipe book to collect, format, and export your baking creations. Works offline. Stores data locally.
          </p>
        </div>
      </SettingsSection>

      {/* Danger zone */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(45,40,38,0.5)',
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowClearConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'rgba(249,243,238,0.98)', backdropFilter: 'blur(20px)',
            borderRadius: '24px 24px 0 0', padding: '24px 20px 48px', width: '100%',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(176,158,150,0.4)', margin: '0 auto 20px' }} />
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 22 }}>Clear all data?</h3>
            <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--warm-gray)' }}>
              This will permanently remove all {recipes.length} recipes from your device.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={async () => {
                for (const r of [...recipes]) await deleteRecipe(r.id)
                setShowClearConfirm(false)
              }} style={{ padding: '15px', borderRadius: 14, border: 'none', background: '#e05a3a', color: 'white', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Clear All Recipes
              </button>
              <button onClick={() => setShowClearConfirm(false)} style={{ padding: '15px', borderRadius: 14, border: 'none', background: 'rgba(176,158,150,0.15)', color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', fontSize: 15, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatItem({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: '0 0 2px', fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--charcoal)' }}>{value}</p>
      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
    </div>
  )
}

function SettingsSection({ title, icon, delay, children }) {
  return (
    <div className="animate-fade-up" style={{ opacity: 0, animationDelay: delay, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-gray)' }}>{title}</h3>
      </div>
      <div style={{ borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </div>
    </div>
  )
}

function SettingsButton({ onClick, loading, icon, label, sub }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderRadius: 14, cursor: 'pointer', width: '100%', textAlign: 'left',
      background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)',
      transition: 'background 0.2s', opacity: loading ? 0.7 : 1,
      marginBottom: 2,
    }}
      onMouseOver={e => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
      onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.6)')}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--charcoal)' }}>{label}</p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--light-warm)' }}>{sub}</p>
      </div>
      {loading
        ? <div style={{ width: 18, height: 18, border: '2px solid rgba(212,136,106,0.2)', borderTopColor: 'var(--rose)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--light-warm)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      }
    </button>
  )
}
