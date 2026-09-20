import React, { useState, useRef, useEffect } from 'react'
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
  const [sharing, setSharing] = useState(false)
  const [zoomFit, setZoomFit] = useState(true)
  const certificateRef = useRef(null)
  const exportRef = useRef(null)
  const previewAreaRef = useRef(null)
  const [previewScale, setPreviewScale] = useState(0.35)

  // Dynamically compute optimal scale based on the preview viewport
  useEffect(() => {
    if (!isOpen) return

    const computeScale = () => {
      if (previewAreaRef.current) {
        const areaWidth = previewAreaRef.current.clientWidth - 20
        const areaHeight = previewAreaRef.current.clientHeight - 20
        // Landscape canvas base is 1024 x 740
        const scaleX = Math.max(0.2, areaWidth / 1024)
        const scaleY = Math.max(0.2, areaHeight / 740)
        // Scale to fit BOTH dimensions completely
        const scale = Math.min(scaleX, scaleY, 1)
        setPreviewScale(scale)
      }
    }

    const timer = setTimeout(computeScale, 50)
    window.addEventListener('resize', computeScale)

    let ro = null
    if (typeof ResizeObserver !== 'undefined' && previewAreaRef.current) {
      ro = new ResizeObserver(computeScale)
      ro.observe(previewAreaRef.current)
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', computeScale)
      if (ro) ro.disconnect()
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  const {
    name = 'Student Name',
    course = 'ICING CAKE COURSE',
    date = '20/09/2026',
    description = '',
    signatory = "FOUNDER\nKAUR'S CAKERY",
    title = 'CERTIFICATE',
    subtitle = 'OF SUCCESSFUL COMPLETION',
    seal = 'none',
    dividerStyle = 'heart',
    customTheme = {},
  } = certificateData

  // Generate high-resolution canvas strictly from the UNTRANSFORMED offscreen container
  const generateCanvas = async () => {
    const targetNode = exportRef.current || certificateRef.current
    if (!targetNode) throw new Error('Certificate target not found')

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    // Allow brief settle for font and image decode
    await new Promise((resolve) => setTimeout(resolve, 200))

    return await html2canvas(targetNode, {
      scale: 2.5, // 2560 x 1850 px - ultra-sharp 300 DPI print quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FAF7F2',
      logging: false,
      width: 1024,
      height: 740,
    })
  }

  // Export as high-quality PDF with native Blob URL download
  const handleDownloadPdf = async () => {
    if (downloading || sharing) return
    setDownloading(true)

    try {
      const canvas = await generateCanvas()
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      // A4 Landscape is 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210)

      const safeName = (name || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      const safeCourse = (course || 'Course').trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      const fileName = `Certificate_${safeName}_${safeCourse}.pdf`

      const pdfBlob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 1000)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Could not export PDF. Please check your browser permissions.')
    } finally {
      setDownloading(false)
    }
  }

  // Share strictly the certificate file itself (no text) via WhatsApp / System Share
  const handleShareFileOnly = async () => {
    if (downloading || sharing) return
    setSharing(true)

    try {
      const canvas = await generateCanvas()
      const safeName = (name || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_')
      const safeCourse = (course || 'Course').trim().replace(/[^a-zA-Z0-9_-]/g, '_')

      // 1. Attempt PDF File share first (Android Chrome & modern iOS)
      let pdfFile = null
      try {
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        })
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210)
        const pdfBlob = pdf.output('blob')
        pdfFile = new File([pdfBlob], `Certificate_${safeName}_${safeCourse}.pdf`, {
          type: 'application/pdf',
        })
      } catch (pdfErr) {
        console.warn('PDF blob generation issue:', pdfErr)
      }

      if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          // Strictly no text, no title as requested
        })
        return
      }

      // 2. Attempt PNG Image File share (Universal support on mobile WhatsApp)
      const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95))
      const imageFile = new File([imageBlob], `Certificate_${safeName}_${safeCourse}.png`, {
        type: 'image/png',
      })

      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          files: [imageFile],
          // Strictly no text, no title as requested
        })
        return
      }

      // 3. Fallback: direct download so user can attach to WhatsApp
      const blobUrl = URL.createObjectURL(imageBlob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `Certificate_${safeName}_${safeCourse}.png`
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 1000)
      alert('Certificate saved to downloads! You can now send it directly on WhatsApp.')
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('File share failed:', err)
        alert('Could not share file directly. Please use Download PDF.')
      }
    } finally {
      setSharing(false)
    }
  }

  const effectiveScale = zoomFit ? previewScale : 1
  const targetWidth = 1024
  const targetHeight = 740

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 12, 28, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
      }}
      onClick={onClose}
    >
      {/* HIDDEN OFFSCREEN UNTRANSFORMED CAPTURE TARGET (guarantees 100% reliable 1024x740 export) */}
      <div
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: 1024,
          height: 740,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 1,
          zIndex: -1,
        }}
      >
        <CertificateTemplate
          innerRef={exportRef}
          name={name}
          course={course}
          date={date}
          description={description}
          signatory={signatory}
          title={title}
          subtitle={subtitle}
          seal={seal}
          dividerStyle={dividerStyle}
          customTheme={customTheme}
        />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 960,
          height: '94dvh',
          maxHeight: 880,
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 22,
          boxShadow: '0 25px 60px -10px rgba(18, 12, 28, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(151, 145, 190, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(250, 248, 255, 0.95)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(255, 143, 220, 0.25), rgba(157, 124, 255, 0.25))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
              }}
            >
              📜
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--charcoal)',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.2,
                }}
              >
                Certificate Preview
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--warm-gray)' }}>
                Landscape A4 • 100% Crisp Vector Quality
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
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Certificate Display Area (Perfect Fit, No Overflow, No Weird Zoom) */}
        <div
          ref={previewAreaRef}
          style={{
            flex: 1,
            overflow: zoomFit ? 'hidden' : 'auto',
            padding: '12px',
            background: '#1F1A2C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}
        >
          {/* Scaled viewport container with explicit scaled dimensions */}
          <div
            style={{
              width: targetWidth * effectiveScale,
              height: targetHeight * effectiveScale,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 44px rgba(0, 0, 0, 0.55)',
              borderRadius: 6,
              flexShrink: 0,
              transition: 'width 0.2s ease, height 0.2s ease',
            }}
          >
            {/* Scaled display element for visual preview on phone */}
            <div
              style={{
                width: targetWidth,
                height: targetHeight,
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
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
                seal={seal}
                dividerStyle={dividerStyle}
                customTheme={customTheme}
              />
            </div>
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(151, 145, 190, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.98)',
            flexShrink: 0,
          }}
        >
          {/* Zoom toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => setZoomFit(!zoomFit)}
              style={{
                padding: '7px 11px',
                borderRadius: 10,
                border: '1px solid rgba(151, 145, 190, 0.25)',
                background: 'rgba(255, 255, 255, 0.9)',
                color: 'var(--warm-gray)',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {zoomFit ? '🔍 100% Size' : '📱 Fit Phone'}
            </button>
          </div>

          {/* Action Buttons: Share File (WhatsApp) and Download PDF */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* WhatsApp Share Button (Pure File Only, Zero Text) */}
            <button
              type="button"
              onClick={handleShareFileOnly}
              disabled={sharing || downloading}
              title="Share certificate file on WhatsApp"
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                border: '1px solid rgba(37, 211, 102, 0.4)',
                background: 'rgba(37, 211, 102, 0.12)',
                color: '#15803d',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: (sharing || downloading) ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: (sharing || downloading) ? 0.7 : 1,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766 0-3.18-2.586-5.767-5.768-5.767zm0 10.551c-.888 0-1.636-.239-2.348-.661l-.168-.1-1.579.414.422-1.54-.109-.174c-.456-.724-.698-1.521-.698-2.344 0-2.639 2.148-4.786 2.787-4.786 2.639 0 4.787 2.147 4.787 4.786 0 2.639-2.148 4.786-4.787 4.786zm6.84-11.458C17.067 3.46 14.654 2.375 12.033 2.375c-5.32 0-9.65 4.33-9.65 9.651 0 1.7.444 3.36 1.288 4.823L2 22l5.305-1.391c1.408.767 2.994 1.172 4.613 1.172h.005c5.319 0 9.65-4.33 9.65-9.651 0-2.578-1.004-4.999-2.702-6.865z" />
              </svg>
              <span>{sharing ? 'Preparing...' : 'Share File'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading || sharing}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, var(--rose) 0%, var(--lavender-deep) 100%)',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: (downloading || sharing) ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(184, 51, 106, 0.35)',
                opacity: (downloading || sharing) ? 0.7 : 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{downloading ? 'Exporting...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
