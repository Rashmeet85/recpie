import React, { useState, useRef, useEffect } from 'react'
import { useStore, OFFICIAL_CERTIFICATE_TEMPLATE } from '../store/useStore'
import CertificateTemplate from '../components/certificate/CertificateTemplate'
import CertificatePreviewModal from '../components/certificate/CertificatePreviewModal'

const COURSE_PRESETS = [
  {
    name: 'Icing Cake Course',
    emoji: '🎂',
    defaultDesc: 'and has demonstrated dedication, creativity and skill in learning the art of cake icing and decoration.',
  },
  {
    name: 'Artisan Breads & Sourdough',
    emoji: '🍞',
    defaultDesc: 'and has mastered the principles of fermentation, dough shaping, and artisan hearth baking techniques.',
  },
  {
    name: 'Cupcakes & Buttercream Florals',
    emoji: '🧁',
    defaultDesc: 'and has demonstrated excellence in cupcake sponge baking and intricate buttercream flower piping.',
  },
  {
    name: 'French Viennoiserie & Pastry',
    emoji: '🥐',
    defaultDesc: 'and has mastered butter lamination, croissant folding, and classic French pastry craftsmanship.',
  },
  {
    name: 'Chocolate Ganache & Truffles',
    emoji: '🍫',
    defaultDesc: 'and has mastered chocolate tempering, ganache emulsification, and gourmet truffle crafting.',
  },
  {
    name: 'Fondant & Sugar Art Masterclass',
    emoji: '🎨',
    defaultDesc: 'and has demonstrated exceptional creativity and finesse in sugarpaste draping and sculpted figurines.',
  },
  {
    name: 'Cookies, Macarons & Biscuits',
    emoji: '🍪',
    defaultDesc: 'and has mastered macaronage, pied formation, and precision cookie baking.',
  },
]

const COLOR_THEMES = [
  {
    id: 'classic-ruby',
    name: 'Classic Gold & Ruby (Original)',
    theme: {
      primaryColor: '#3B131D',
      nameColor: '#BF1E5B',
      courseColor: '#931A42',
      borderColor: '#C5A866',
      secondaryBorderColor: '#DFC68C',
      backgroundColor: '#FAF7F2',
    },
  },
  {
    id: 'royal-plum',
    name: 'Royal Plum & Rose',
    theme: {
      primaryColor: '#2B1124',
      nameColor: '#A82471',
      courseColor: '#7A1C54',
      borderColor: '#B89748',
      secondaryBorderColor: '#D8BE7A',
      backgroundColor: '#FCF8FA',
    },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Navy & Gold',
    theme: {
      primaryColor: '#101B2B',
      nameColor: '#1D4ED8',
      courseColor: '#1E3A8A',
      borderColor: '#C5A866',
      secondaryBorderColor: '#DFCA94',
      backgroundColor: '#F8F9FA',
    },
  },
  {
    id: 'emerald-champagne',
    name: 'Emerald & Champagne',
    theme: {
      primaryColor: '#14281D',
      nameColor: '#15803D',
      courseColor: '#166534',
      borderColor: '#B89E5F',
      secondaryBorderColor: '#D8C694',
      backgroundColor: '#F8FAF8',
    },
  },
]

function getTodayFormattedDate() {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function CertificatePage() {
  const {
    setPage,
    certificateTemplates = [OFFICIAL_CERTIFICATE_TEMPLATE],
    saveCertificateTemplate,
    deleteCertificateTemplate,
    isAdmin,
    canUseAi,
  } = useStore()

  // Active form state
  const [selectedTemplateId, setSelectedTemplateId] = useState('official-kaurs')
  const [studentName, setStudentName] = useState('Parleen Kaur')
  const [courseName, setCourseName] = useState('Icing Cake Course')
  const [issueDate, setIssueDate] = useState(getTodayFormattedDate())
  const [description, setDescription] = useState(
    'and has demonstrated dedication, creativity and skill in learning the art of cake icing and decoration.'
  )
  const [signatory, setSignatory] = useState("FOUNDER\nKAUR'S CAKERY")
  const [certificateTitle, setCertificateTitle] = useState('CERTIFICATE')
  const [certificateSubtitle, setCertificateSubtitle] = useState('OF SUCCESSFUL COMPLETION')
  const [activeTheme, setActiveTheme] = useState(OFFICIAL_CERTIFICATE_TEMPLATE.customTheme)

  // Modals & UI states
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuccessMsg, setAiSuccessMsg] = useState('')
  const [savedAlertMsg, setSavedAlertMsg] = useState('')

  // Live scale calculation for mobile viewport
  const previewBoxRef = useRef(null)
  const [previewScale, setPreviewScale] = useState(0.35)

  useEffect(() => {
    const updateScale = () => {
      if (previewBoxRef.current) {
        const containerWidth = previewBoxRef.current.clientWidth - 24
        // Canvas is 1024px wide
        const scale = Math.min(1, Math.max(0.28, containerWidth / 1024))
        setPreviewScale(scale)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Switch templates
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId)
    const tmpl = certificateTemplates.find((t) => t.id === templateId) || OFFICIAL_CERTIFICATE_TEMPLATE
    setCertificateTitle(tmpl.title || 'CERTIFICATE')
    setCertificateSubtitle(tmpl.subtitle || 'OF SUCCESSFUL COMPLETION')
    if (tmpl.description) setDescription(tmpl.description)
    if (tmpl.customTheme) setActiveTheme(tmpl.customTheme)
  }

  // Course preset chip selection
  const handleSelectCoursePreset = (preset) => {
    setCourseName(preset.name)
    setDescription(preset.defaultDesc)
  }

  // Next Student batch action
  const handleNextStudent = () => {
    setStudentName('')
    setSavedAlertMsg('Ready for next student! Course & date kept.')
    setTimeout(() => setSavedAlertMsg(''), 3000)
  }

  // Token-efficient AI polish
  const handleAiPolishDescription = async () => {
    if (!canUseAi || aiLoading) return
    setAiLoading(true)
    setAiSuccessMsg('')

    try {
      const response = await fetch('/api/recipe-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhanceCertificateDescription',
          options: {
            course: courseName,
            draft: description,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Could not enhance with AI')
      }

      const data = await response.json()
      if (data?.result?.description) {
        setDescription(data.result.description)
        setAiSuccessMsg('✨ Polished by AI!')
        setTimeout(() => setAiSuccessMsg(''), 3000)
      }
    } catch (err) {
      console.warn('AI Certificate Polish Error:', err)
    } finally {
      setAiLoading(false)
    }
  }

  // Save as new custom template
  const handleSaveAsTemplate = () => {
    const name = newTemplateName.trim() || `${courseName || 'Custom'} Certificate Template`
    const saved = saveCertificateTemplate({
      name,
      title: certificateTitle,
      subtitle: certificateSubtitle,
      description,
      customTheme: activeTheme,
    })
    setSelectedTemplateId(saved.id)
    setShowCustomizeModal(false)
    setNewTemplateName('')
    setSavedAlertMsg(`Saved "${name}" to your templates!`)
    setTimeout(() => setSavedAlertMsg(''), 3500)
  }

  const certificatePayload = {
    name: studentName,
    course: courseName,
    date: issueDate,
    description,
    signatory,
    title: certificateTitle,
    subtitle: certificateSubtitle,
    customTheme: activeTheme,
  }

  return (
    <div
      style={{
        padding: '0 0 80px',
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #faf8ff 0%, #f3f0ff 100%)',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '44px 18px 14px',
          background: 'linear-gradient(180deg, rgba(250,248,255,0.96) 75%, rgba(250,248,255,0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => setPage('library')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--rose)',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--rose)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Kaur&apos;s Cakery
            </p>
            <h1 style={{ margin: '1px 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 5.5vw, 26px)', fontWeight: 700, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Certificate Studio
            </h1>
          </div>
        </div>

        {/* Template Selector Pill */}
        <div style={{ flexShrink: 0 }}>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 12,
              border: '1px solid rgba(151, 145, 190, 0.3)',
              background: 'rgba(255, 255, 255, 0.9)',
              color: 'var(--charcoal)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(142, 106, 232, 0.08)',
              maxWidth: 150,
            }}
          >
            {certificateTemplates.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Alerts / Feedback */}
        {savedAlertMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 14,
              background: 'rgba(220, 252, 231, 0.9)',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              color: '#15803d',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.12)',
            }}
          >
            <span>✅</span> {savedAlertMsg}
          </div>
        )}

        {/* LIVE MOBILE SCALED PREVIEW CARD */}
        <div
          ref={previewBoxRef}
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 22,
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 12px 32px rgba(82, 55, 138, 0.12)',
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>📱</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Mobile Preview
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              style={{
                padding: '5px 11px',
                borderRadius: 10,
                border: '1px solid rgba(151, 145, 190, 0.25)',
                background: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--rose)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>🔍</span> Fullscreen PDF
            </button>
          </div>

          {/* Scaled Landscape Box Container */}
          <div
            style={{
              width: '100%',
              height: 740 * previewScale,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            }}
          >
            <div
              style={{
                width: 1024,
                height: 740,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
                position: 'absolute',
                top: 0,
              }}
            >
              <CertificateTemplate
                name={studentName}
                course={courseName}
                date={issueDate}
                description={description}
                signatory={signatory}
                title={certificateTitle}
                subtitle={certificateSubtitle}
                customTheme={activeTheme}
              />
            </div>
          </div>
        </div>

        {/* INPUT VARIABLES FORM CARD */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 22,
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 12px 32px rgba(82, 55, 138, 0.10)',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Student Name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 6 }}>
              Student Name * (Calligraphy)
            </label>
            <input
              type="text"
              placeholder="e.g. Parleen Kaur"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="input-field"
              style={{ width: '100%', fontSize: 16, fontWeight: 700 }}
            />
          </div>

          {/* Course Name */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)' }}>
                Course / Masterclass Name *
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. Icing Cake Course"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="input-field"
              style={{ width: '100%', fontSize: 14, fontWeight: 600 }}
            />

            {/* Quick Course Chips */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingTop: 8,
                paddingBottom: 4,
                scrollbarWidth: 'none',
              }}
            >
              {COURSE_PRESETS.map((preset) => {
                const isSelected = courseName.toLowerCase() === preset.name.toLowerCase()
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectCoursePreset(preset)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 10,
                      border: isSelected ? '1px solid #9d7cff' : '1px solid rgba(151, 145, 190, 0.25)',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(255, 143, 220, 0.22), rgba(157, 124, 255, 0.25))'
                        : 'rgba(255, 255, 255, 0.75)',
                      color: isSelected ? '#6f3fc8' : 'var(--warm-gray)',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{preset.emoji}</span> {preset.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date & Signatory Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 6 }}>
                Issue Date
              </label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: 13, fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 6 }}>
                Signatory Title
              </label>
              <input
                type="text"
                value={signatory}
                onChange={(e) => setSignatory(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: 13 }}
              />
            </div>
          </div>

          {/* Description with Token-Efficient AI Polish */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)' }}>
                Commendation Wording
              </label>

              {canUseAi && (
                <button
                  type="button"
                  onClick={handleAiPolishDescription}
                  disabled={aiLoading}
                  style={{
                    padding: '4px 9px',
                    borderRadius: 8,
                    border: '1px solid rgba(157, 124, 255, 0.35)',
                    background: 'linear-gradient(135deg, rgba(255, 143, 220, 0.15), rgba(157, 124, 255, 0.2))',
                    color: '#6f3fc8',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: aiLoading ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span>{aiLoading ? '⏳' : '🪄'}</span>
                  {aiLoading ? 'Polishing…' : 'AI Polish Wording'}
                </button>
              )}
            </div>

            {aiSuccessMsg && (
              <p style={{ margin: '0 0 6px', fontSize: 11.5, color: '#15803d', fontWeight: 600 }}>
                {aiSuccessMsg}
              </p>
            )}

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ width: '100%', fontSize: 13, lineHeight: 1.5, resize: 'vertical' }}
            />
          </div>

          {/* Customize Design & Template Settings Button */}
          <div style={{ paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => setShowCustomizeModal(true)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 12,
                border: '1px solid rgba(151, 145, 190, 0.25)',
                background: 'rgba(255, 255, 255, 0.75)',
                color: 'var(--warm-gray)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>🎨</span> Customize Colors & Template Design
            </button>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Next Student (Batch Issuing) */}
          <button
            type="button"
            onClick={handleNextStudent}
            style={{
              padding: '13px 16px',
              borderRadius: 14,
              border: '1px solid rgba(151, 145, 190, 0.25)',
              background: 'rgba(255, 255, 255, 0.85)',
              color: 'var(--charcoal)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            <span>➕</span> Next Student
          </button>

          {/* Preview & Download PDF */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            style={{
              flex: 1,
              padding: '13px 18px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 8px 22px rgba(142, 106, 232, 0.32)',
            }}
          >
            <span>📜</span> Preview & Download PDF
          </button>
        </div>
      </div>

      {/* CUSTOMIZE TEMPLATE MODAL */}
      {showCustomizeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(24, 16, 38, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowCustomizeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              maxHeight: '90dvh',
              overflowY: 'auto',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: 22,
              padding: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-display)' }}>
                Customize Certificate Design
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomizeModal(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(151, 145, 190, 0.15)',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Color Themes */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 8 }}>
                Color Palette Presets
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {COLOR_THEMES.map((themeItem) => (
                  <button
                    key={themeItem.id}
                    type="button"
                    onClick={() => setActiveTheme(themeItem.theme)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: activeTheme.primaryColor === themeItem.theme.primaryColor
                        ? '1.5px solid #9d7cff'
                        : '1px solid rgba(151, 145, 190, 0.25)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--charcoal)' }}>
                      {themeItem.name}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: themeItem.theme.primaryColor }} />
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: themeItem.theme.nameColor }} />
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: themeItem.theme.borderColor }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 4 }}>
                  Title
                </label>
                <input
                  type="text"
                  value={certificateTitle}
                  onChange={(e) => setCertificateTitle(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 4 }}>
                  Subtitle
                </label>
                <input
                  type="text"
                  value={certificateSubtitle}
                  onChange={(e) => setCertificateSubtitle(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: 12 }}
                />
              </div>
            </div>

            {/* Save As New Template */}
            <div style={{ paddingTop: 8, borderTop: '1px solid rgba(151, 145, 190, 0.15)' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 4 }}>
                Save As Reusable Template (Optional)
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="e.g. Masterclass Gold Template"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="input-field"
                  style={{ flex: 1, fontSize: 12 }}
                />
                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Save
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCustomizeModal(false)}
              style={{
                marginTop: 4,
                padding: '10px',
                borderRadius: 12,
                border: 'none',
                background: 'rgba(151, 145, 190, 0.15)',
                color: 'var(--warm-gray)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done & Apply
            </button>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      <CertificatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        certificateData={certificatePayload}
      />
    </div>
  )
}

