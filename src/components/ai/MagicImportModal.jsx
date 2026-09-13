import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cleanPastedText, optimizeRecipePhoto } from '../../utils/imageOptimizer'

export default function MagicImportModal({ isOpen, onClose, onImportRecipe }) {
  const [tab, setTab] = useState('text') // 'text' | 'photo'
  const [pastedText, setPastedText] = useState('')
  const [photoData, setPhotoData] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [optimizingPhoto, setOptimizingPhoto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [extractedRecipe, setExtractedRecipe] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen || typeof document === 'undefined') return null

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)
    setError('')
    setOptimizingPhoto(true)

    try {
      const optimized = await optimizeRecipePhoto(file)
      setPhotoData(optimized)
    } catch (err) {
      console.error(err)
      setError('Could not process photo. Please try a different image.')
    } finally {
      setOptimizingPhoto(false)
      e.target.value = ''
    }
  }

  const handleGenerate = async () => {
    setError('')
    setLoading(true)

    try {
      let payload = { action: 'importRecipe' }

      if (tab === 'text') {
        const cleaned = cleanPastedText(pastedText)
        if (!cleaned || cleaned.length < 15) {
          throw new Error('Please paste recipe text with at least a few ingredients or steps.')
        }
        payload.options = { text: cleaned }
      } else {
        if (!photoData?.base64) {
          throw new Error('Please capture or select a photo of your recipe notes.')
        }
        payload.image = {
          base64: photoData.base64,
          mimeType: photoData.mimeType,
        }
      }

      const response = await fetch('/api/recipe-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Server error (${response.status})`)
      }

      const data = await response.json()
      if (!data.result || !data.result.name) {
        throw new Error('Could not parse a complete recipe. Please check your text or photo.')
      }

      setExtractedRecipe(data.result)
    } catch (err) {
      console.error('Magic import error:', err)
      setError(err.message || 'An error occurred during recipe import.')
    } finally {
      setLoading(false)
    }
  }

  const handlePopulate = () => {
    if (!extractedRecipe) return
    onImportRecipe(extractedRecipe)
    onClose()
  }

  const handleReset = () => {
    setExtractedRecipe(null)
    setError('')
  }

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
          maxWidth: 560,
          maxHeight: 'min(90dvh, 760px)',
          background: 'rgba(252, 250, 255, 0.95)',
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
              AI Assistant • Kaur&apos;s Cakery
            </p>
            <h2 style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--charcoal)' }}>
              🪄 Magic Recipe Import
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

        {/* Tab switcher (only when not showing preview) */}
        {!extractedRecipe && (
          <div style={{ display: 'flex', padding: '12px 20px 0', gap: 10 }}>
            <button
              onClick={() => { setTab('text'); setError('') }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 14,
                border: 'none',
                background: tab === 'text' ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(255, 255, 255, 0.6)',
                color: tab === 'text' ? 'white' : 'var(--warm-gray)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: tab === 'text' ? '0 8px 20px rgba(142, 106, 232, 0.24)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <span>📋</span> Paste Text
            </button>
            <button
              onClick={() => { setTab('photo'); setError('') }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 14,
                border: 'none',
                background: tab === 'photo' ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(255, 255, 255, 0.6)',
                color: tab === 'photo' ? 'white' : 'var(--warm-gray)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: tab === 'photo' ? '0 8px 20px rgba(142, 106, 232, 0.24)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <span>📷</span> Scan Note Photo
            </button>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
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
                {tab === 'photo' ? 'Transcribing & Enhancing Photo…' : 'Parsing Recipe Details…'}
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)' }}>
                Extracting ingredients, weights, oven temps, and steps
              </p>
            </div>
          ) : extractedRecipe ? (
            /* Extracted Preview */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(255,224,245,0.7), rgba(220,227,255,0.7))',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 32, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', borderRadius: 12 }}>
                  {extractedRecipe.emoji || '🍴'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 2px', fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--charcoal)' }}>
                    {extractedRecipe.name}
                  </h3>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(244, 114, 208, 0.16)', color: 'var(--rose)', fontWeight: 600 }}>
                    {extractedRecipe.tag || 'Recipe'}
                  </span>
                </div>
              </div>

              {/* Ingredients count & list preview */}
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--warm-gray)' }}>
                  Ingredients ({extractedRecipe.ingredients?.length || 0})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', padding: '10px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.7)' }}>
                  {(extractedRecipe.ingredients || []).map((ing, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                      <span style={{ color: 'var(--charcoal)' }}>• {ing.name}</span>
                      <span style={{ fontWeight: 600, color: 'var(--warm-gray)' }}>{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Method steps preview */}
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--warm-gray)' }}>
                  Method Steps ({extractedRecipe.method?.length || 0})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 140, overflowY: 'auto', padding: '10px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.7)' }}>
                  {(extractedRecipe.method || []).map((step, i) => (
                    <p key={i} style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>
                      <strong>{i + 1}.</strong> {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : tab === 'text' ? (
            /* Paste Text Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', lineHeight: 1.45 }}>
                Paste a forwarded WhatsApp message, YouTube recipe description, or website notes below:
              </p>
              <textarea
                className="input-field"
                rows={9}
                placeholder="Paste here... e.g.&#10;Eggless Vanilla Cake&#10;1.5 cups maida (180g)&#10;1 cup curd&#10;1/2 cup butter&#10;1 tsp vanilla&#10;Mix wet and dry ingredients. Bake at 180°C for 30 mins."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                style={{ fontSize: 13, lineHeight: 1.5 }}
              />
            </div>
          ) : (
            /* Scan Photo Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />

              {!photoData ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '36px 16px',
                    borderRadius: 18,
                    border: '2px dashed rgba(180, 149, 255, 0.45)',
                    background: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 42 }}>📸</span>
                  <div>
                    <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--charcoal)' }}>
                      Take Photo or Upload Note
                    </p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--warm-gray)' }}>
                      Snap a photo of your handwritten notebook or cookbook page
                    </p>
                  </div>
                  <span
                    style={{
                      marginTop: 6,
                      padding: '8px 16px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(255,224,245,0.8), rgba(220,227,255,0.8))',
                      color: 'var(--rose)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Choose Photo
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxHeight: 220,
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 8px 24px rgba(68, 43, 128, 0.12)',
                    }}
                  >
                    <img
                      src={photoData.dataUrl}
                      alt="Recipe note preview"
                      style={{ width: '100%', height: 'auto', maxHeight: 220, objectFit: 'contain', background: '#222' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#328a32', fontWeight: 600 }}>
                    <span>✨</span> Auto-contrast active (paper stains reduced & ink sharpened)
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(151, 145, 190, 0.3)',
                      background: 'rgba(255,255,255,0.6)',
                      color: 'var(--warm-gray)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Retake / Choose Another Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255, 237, 237, 0.7)', border: '1px solid rgba(224, 90, 58, 0.3)', color: '#c24a2d', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(151, 145, 190, 0.2)',
            background: 'rgba(255, 255, 255, 0.65)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <button
            onClick={extractedRecipe ? handleReset : onClose}
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
            {extractedRecipe ? 'Back / Edit' : 'Cancel'}
          </button>

          {extractedRecipe ? (
            <button
              onClick={handlePopulate}
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
              ✨ Populate Recipe Form
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading || optimizingPhoto || (tab === 'text' && !pastedText.trim()) || (tab === 'photo' && !photoData)}
              style={{
                padding: '11px 22px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                cursor: (tab === 'text' && !pastedText.trim()) || (tab === 'photo' && !photoData) ? 'default' : 'pointer',
                opacity: (tab === 'text' && !pastedText.trim()) || (tab === 'photo' && !photoData) ? 0.65 : 1,
                boxShadow: '0 10px 24px rgba(142, 106, 232, 0.26)',
              }}
            >
              {loading ? 'Analyzing…' : '✨ Generate Recipe'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

