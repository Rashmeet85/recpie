import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { exportToPDF, exportToDocx } from '../utils/export'

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function SettingsPage() {
  const { recipes, deleteRecipe, user, isAdmin, signOutUser, authError } = useStore()
  const [exporting, setExporting] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode())

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPromptEvent(event)
    }

    const handleInstalled = () => {
      setInstallPromptEvent(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleExport = async (type) => {
    setExporting(type)

    try {
      if (type === 'pdf') await exportToPDF(recipes)
      else if (type === 'docx') await exportToDocx(recipes)
    } catch (error) {
      console.error(error)
    } finally {
      setExporting(null)
    }
  }

  const handleExportJSON = () => {
    const data = JSON.stringify(recipes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `kaurscakery_recipes_${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (event) => {
    const file = event.target.files?.[0]
    if (!file || !isAdmin) return

    const reader = new FileReader()
    reader.onload = async (loadEvent) => {
      try {
        const imported = JSON.parse(loadEvent.target.result)

        if (Array.isArray(imported)) {
          const { addRecipe } = useStore.getState()
          const existingIds = new Set(useStore.getState().recipes.map((recipe) => recipe.id))
          let importedCount = 0

          for (const recipe of imported) {
            if (!existingIds.has(recipe.id)) {
              await addRecipe(recipe)
              importedCount += 1
            }
          }

          alert(importedCount ? `Imported ${importedCount} recipes.` : 'No new recipes were imported.')
        }
      } catch {
        alert('Invalid file format')
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const handleInstallApp = async () => {
    if (!installPromptEvent) return

    await installPromptEvent.prompt()
    await installPromptEvent.userChoice.catch(() => null)
    setInstallPromptEvent(null)
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

      <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.06s', marginBottom: 24, background: 'linear-gradient(135deg, rgba(255,224,245,0.52), rgba(220,227,255,0.48))', border: '1px solid rgba(255,255,255,0.58)', borderRadius: 24, padding: 20, backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-soft)' }}>
        <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--light-warm)', fontWeight: 600 }}>
          Signed In As
        </p>
        <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--charcoal)' }}>
          {user?.displayName || user?.email || 'Google User'}
        </h2>
        <p style={{ margin: '0 0 14px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)' }}>
          {isAdmin ? 'Admin access enabled. You can create, edit, import, and delete recipes.' : 'Viewer access enabled. You can browse and export recipes.'}
        </p>
        <button
          onClick={signOutUser}
          style={{ padding: '10px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.58)', background: 'rgba(255,255,255,0.6)', color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Sign Out
        </button>
        {authError && (
          <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-body)', fontSize: 12, color: '#c24a2d' }}>
            {authError}
          </p>
        )}
      </div>

      <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.08s', marginBottom: 24, background: 'linear-gradient(135deg, rgba(255,224,245,0.52), rgba(220,227,255,0.48))', border: '1px solid rgba(255,255,255,0.58)', borderRadius: 24, padding: 20, backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <StatItem value={recipes.length} label="Recipes" />
          <div style={{ width: 1, background: 'rgba(201,169,110,0.3)' }} />
          <StatItem value={[...new Set(recipes.map((recipe) => recipe.tag))].filter(Boolean).length} label="Categories" />
          <div style={{ width: 1, background: 'rgba(201,169,110,0.3)' }} />
          <StatItem value={recipes.reduce((sum, recipe) => sum + (recipe.ingredients?.length || 0), 0)} label="Ingredients" />
        </div>
      </div>

      <SettingsSection title="Export Collection" icon="📥" delay="0.12s">
        <SettingsButton onClick={() => handleExport('pdf')} loading={exporting === 'pdf'} icon="📄" label="Export all as PDF" sub={`${recipes.length} recipes -> styled PDF`} />
        <SettingsButton onClick={() => handleExport('docx')} loading={exporting === 'docx'} icon="📝" label="Export all as Word" sub={`${recipes.length} recipes -> editable DOCX`} />
        <SettingsButton onClick={handleExportJSON} icon="💾" label="Backup recipes" sub="Export as JSON for safekeeping" />
      </SettingsSection>

      <SettingsSection title="Install App" icon="📱" delay="0.16s">
        <SettingsButton
          onClick={handleInstallApp}
          disabled={!installPromptEvent || isInstalled}
          icon="⬇️"
          label={isInstalled ? 'App already installed' : 'Install this app'}
          sub={isInstalled ? 'The PWA is already installed on this device.' : installPromptEvent ? 'Add Kaur\'s Cakery to your home screen.' : 'Install becomes available when the browser allows it.'}
        />
      </SettingsSection>

      {isAdmin && (
        <SettingsSection title="Admin Tools" icon="🔐" delay="0.2s">
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18, cursor: 'pointer', background: 'rgba(255,255,255,0.52)', border: '1px solid rgba(255,255,255,0.58)', transition: 'background 0.2s', boxShadow: 'var(--shadow-soft)' }}
            onMouseOver={(event) => { event.currentTarget.style.background = 'rgba(255,255,255,0.85)' }}
            onMouseOut={(event) => { event.currentTarget.style.background = 'rgba(255,255,255,0.6)' }}
          >
            <span style={{ fontSize: 22 }}>📁</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--charcoal)' }}>Restore from backup</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--light-warm)' }}>Import from a JSON backup file</p>
            </div>
            <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--light-warm)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </label>

          <SettingsButton
            onClick={() => setShowClearConfirm(true)}
            icon="🗑️"
            label="Clear all recipes"
            sub="Remove every recipe from Firebase and this device"
          />
        </SettingsSection>
      )}

      <SettingsSection title="About" icon="🎂" delay={isAdmin ? '0.24s' : '0.2s'}>
        <div style={{ padding: '18px', background: 'rgba(255,255,255,0.52)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.58)', boxShadow: 'var(--shadow-soft)' }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>Kaur&apos;s Cakery</h3>
          <p style={{ margin: '0 0 12px', fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic', color: 'var(--warm-gray)' }}>
            Crafted with love, baked with passion
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--light-warm)', lineHeight: 1.6 }}>
            Recipes are now backed by Firebase so they stay available across devices and after local storage is cleared.
          </p>
        </div>
      </SettingsSection>

      {showClearConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(33,24,67,0.34)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowClearConfirm(false)}>
          <div onClick={(event) => event.stopPropagation()} style={{ background: 'rgba(248,246,255,0.88)', backdropFilter: 'blur(20px)', borderRadius: '28px 28px 0 0', padding: '24px 20px 48px', width: '100%' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(176,158,150,0.4)', margin: '0 auto 20px' }} />
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 22 }}>Clear all data?</h3>
            <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--warm-gray)' }}>
              This will permanently remove all {recipes.length} recipes from Firebase and this device.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={async () => {
                  for (const recipe of [...recipes]) await deleteRecipe(recipe.id)
                  setShowClearConfirm(false)
                }}
                style={{ padding: '15px', borderRadius: 14, border: 'none', background: '#e05a3a', color: 'white', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                Clear All Recipes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{ padding: '15px', borderRadius: 14, border: 'none', background: 'rgba(176,158,150,0.15)', color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', fontSize: 15, cursor: 'pointer' }}
              >
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

function SettingsButton({ onClick, loading, disabled, icon, label, sub }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 14,
        cursor: loading || disabled ? 'default' : 'pointer',
        width: '100%',
        textAlign: 'left',
        background: 'rgba(255,255,255,0.52)',
        border: '1px solid rgba(255,255,255,0.58)',
        transition: 'background 0.2s',
        opacity: loading || disabled ? 0.7 : 1,
        marginBottom: 2,
        boxShadow: 'var(--shadow-soft)',
      }}
      onMouseOver={(event) => {
        if (!loading && !disabled) event.currentTarget.style.background = 'rgba(255,255,255,0.85)'
      }}
      onMouseOut={(event) => { event.currentTarget.style.background = 'rgba(255,255,255,0.6)' }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--charcoal)' }}>{label}</p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--light-warm)' }}>{sub}</p>
      </div>
      {loading
        ? <div style={{ width: 18, height: 18, border: '2px solid rgba(212,136,106,0.2)', borderTopColor: 'var(--rose)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--light-warm)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
      }
    </button>
  )
}
