import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import CertificateTemplate from './CertificateTemplate'

export default function CertificatePreviewModal({
  isOpen,
  onClose,
  certificateData = {},
}) {
  const [downloading, setDownloading] = useState(false)
  const [zoomFit, setZoomFit] = useState(true)
  const certificateRef = useRef(null)

  if (!isOpen || typeof document === 'undefined') return null

  const {
    name = 'Student Name',
    course = 'ICING CAKE COURSE',
    date = '20/09/2026',
    description = '',
    signatory = "FOUNDER\nKAUR'S CAKERY",
    title = 'CERTIFICATE',
    subtitle = 'OF SUCCESSFUL COMPLETION',
    customTheme = {},
  } = certificateData

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || downloading) return
    setDownloading(true)

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      // Small delay for asset rendering
      await new Promise((resolve) => setTimeout(resolve, 150))

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Ultra-sharp 300 DPI print quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF7F2',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      // A4 Landscape is 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210)

      const safeName = (name || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      const safeCourse = (course || 'Course').trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      pdf.save(`Certificate_${safeName}_${safeCourse}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Could not export PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎓 *Kaur's Cakery Certificate of Completion*\n\n` +
      `Congratulations *${name}*! You have successfully completed the *${course}* at Kaur's Cakery on ${date}.\n\n` +
      `We wish you the very best in your baking journey! 🎂✨`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(24, 16, 38, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '94dvh',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 24,
          boxShadow: '0 25px 60px -10px rgba(35, 20, 60, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(151, 145, 190, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(250, 248, 255, 0.9)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(255, 143, 220, 0.25), rgba(157, 124, 255, 0.25))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              📜
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-display)' }}>
                Certificate PDF Preview
              </h3>
              <p style={{ margin: 0, fontSize: 11.5, color: 'var(--warm-gray)' }}>
                Landscape A4 • Ready for High-Resolution Print
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(151, 145, 190, 0.15)',
              color: 'var(--warm-gray)',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Certificate Display Container */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px 12px',
            background: '#2B2638',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 260,
          }}
        >
          <div
            style={{
              // Responsive scale wrapper so landscape 1024px canvas fits mobile screens
              width: 1024,
              height: 740,
              transform: zoomFit ? 'scale(min(1, calc((min(920px, 92vw) - 30px) / 1024)))' : 'scale(1)',
              transformOrigin: 'center center',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
              borderRadius: 4,
            }}
          >
            <CertificateTemplate
              innerRef={certificateRef}
              name={name}
              course={course}
              date={date}
              description={description}
              signatory={signatory}
              title={title}
              subtitle={subtitle}
              customTheme={customTheme}
            />
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid rgba(151, 145, 190, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setZoomFit(!zoomFit)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid rgba(151, 145, 190, 0.25)',
                background: 'rgba(255, 255, 255, 0.8)',
                color: 'var(--warm-gray)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {zoomFit ? '🔍 100% Size' : '📱 Fit Screen'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                padding: '9px 14px',
                borderRadius: 12,
                border: '1px solid rgba(37, 211, 102, 0.35)',
                background: 'rgba(37, 211, 102, 0.12)',
                color: '#15803d',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>💬</span> WhatsApp
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '9px 14px',
                borderRadius: 12,
                border: '1px solid rgba(151, 145, 190, 0.25)',
                background: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--warm-gray)',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>🖨️</span> Print
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              style={{
                padding: '9px 18px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 700,
                cursor: downloading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 6px 18px rgba(142, 106, 232, 0.3)',
                opacity: downloading ? 0.75 : 1,
              }}
            >
              <span>{downloading ? '⏳' : '📥'}</span>
              {downloading ? 'Generating 300 DPI PDF…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

