import React from 'react'
import baseTemplateImg from '../../assets/certificate/certificate_base_template.png'

export default function CertificateTemplate({
  name = 'Parleen Kaur',
  course = 'ICING CAKE COURSE',
  date = '20/09/2026',
  description = 'and has demonstrated dedication, creativity and skill in learning the art of cake icing and decoration.',
  signatory = "FOUNDER\nKAUR'S CAKERY",
  title = 'CERTIFICATE',
  subtitle = 'OF SUCCESSFUL COMPLETION',
  prefixText = 'This is to certify that',
  completionText = 'has successfully completed the',
  blessingText = 'We wish you all the very best for your future endeavours.',
  customTheme = {},
  innerRef = null,
}) {
  const nameColor = customTheme.nameColor || '#BF1E5B'
  const courseColor = customTheme.courseColor || '#931A42'
  const primaryColor = customTheme.primaryColor || '#3B131D'
  const borderColor = customTheme.borderColor || '#C5A866'

  // Detect if user has customized the fixed header or footer blessing
  const isCustomTitle = title && title.trim().toUpperCase() !== 'CERTIFICATE'
  const isCustomSubtitle = subtitle && subtitle.trim().toUpperCase() !== 'OF SUCCESSFUL COMPLETION'
  const isCustomBlessing = blessingText && blessingText.trim() !== 'We wish you all the very best for your future endeavours.'

  return (
    <div
      ref={innerRef}
      id="kaurs-certificate-root"
      style={{
        width: 1024,
        height: 740,
        position: 'relative',
        backgroundImage: `url(${baseTemplateImg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#FAF7F2',
        overflow: 'hidden',
        boxSizing: 'border-box',
        color: '#33272A',
        fontFamily: "'Montserrat', sans-serif",
        userSelect: 'none',
      }}
    >
      {/* 1. Custom Title & Subtitle Override (if altered in template customizer) */}
      {(isCustomTitle || isCustomSubtitle) && (
        <div
          style={{
            position: 'absolute',
            top: 110,
            left: 230,
            width: 564,
            height: 120,
            backgroundColor: '#FAF7F2',
            zIndex: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: primaryColor,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              width: '100%',
              marginTop: 10,
            }}
          >
            <div
              style={{
                height: 1.5,
                width: 70,
                background: `linear-gradient(90deg, transparent, ${borderColor})`,
              }}
            />
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: '0.24em',
                color: '#4A3B3F',
                textTransform: 'uppercase',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {subtitle}
            </span>
            <div
              style={{
                height: 1.5,
                width: 70,
                background: `linear-gradient(90deg, ${borderColor}, transparent)`,
              }}
            />
          </div>

          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 45, height: 1, backgroundColor: borderColor, opacity: 0.7 }} />
            <span style={{ color: '#E84376', fontSize: 13, lineHeight: 1 }}>❤️</span>
            <div style={{ width: 45, height: 1, backgroundColor: borderColor, opacity: 0.7 }} />
          </div>
        </div>
      )}

      {/* 2. Central Dynamic Certificate Content (Zero distortion, 100% crisp typography) */}
      <div
        style={{
          position: 'absolute',
          top: 252,
          left: 220,
          width: 584,
          height: 275,
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          padding: '0 8px',
        }}
      >
        {/* "This is to certify that" */}
        <p
          style={{
            margin: '0 0 6px 0',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 16.5,
            fontWeight: 500,
            color: '#3A2E32',
            letterSpacing: '0.02em',
          }}
        >
          {prefixText}
        </p>

        {/* Student Name in Luxury Great Vibes Calligraphy */}
        <div
          style={{
            margin: '2px 0 0 0',
            fontFamily: "'Great Vibes', cursive",
            fontSize: name && name.length > 22 ? 46 : 54,
            fontWeight: 400,
            color: nameColor,
            lineHeight: 1.15,
            letterSpacing: '0.03em',
            textShadow: '0 1px 1px rgba(0,0,0,0.06)',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name || 'Student Name'}
        </div>

        {/* Gold Underline under Student Name */}
        <div
          style={{
            width: 380,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${borderColor} 20%, ${borderColor} 80%, transparent)`,
            margin: '6px 0 10px 0',
          }}
        />

        {/* "has successfully completed the" */}
        <p
          style={{
            margin: '0 0 7px 0',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 15,
            fontWeight: 500,
            color: '#3A2E32',
            letterSpacing: '0.02em',
          }}
        >
          {completionText}
        </p>

        {/* Course Name in Bold Uppercase Serif */}
        <div
          style={{
            margin: '0 0 10px 0',
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontSize: course && course.length > 30 ? 22 : 26,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: courseColor,
            lineHeight: 1.25,
            textTransform: 'uppercase',
            maxWidth: '100%',
          }}
        >
          {course || 'COURSE NAME'}
        </div>

        {/* Course Commendation / Description */}
        <p
          style={{
            margin: 0,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13.5,
            fontWeight: 500,
            lineHeight: 1.55,
            color: '#3E3236',
            maxWidth: 540,
            letterSpacing: '0.01em',
          }}
        >
          {description ||
            'and has demonstrated dedication, creativity and skill in learning the art of cake icing and decoration.'}
        </p>
      </div>

      {/* 3. Custom Blessing Override (if altered) */}
      {isCustomBlessing && (
        <div
          style={{
            position: 'absolute',
            top: 532,
            left: 230,
            width: 564,
            backgroundColor: '#FAF7F2',
            zIndex: 6,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 14.5,
              fontWeight: 500,
              color: '#3A2E32',
              letterSpacing: '0.01em',
            }}
          >
            {blessingText}
          </p>
        </div>
      )}

      {/* 4. Founder Signature Area (Left Side) */}
      {signatory && (
        <div
          style={{
            position: 'absolute',
            left: 175,
            top: 596,
            width: 190,
            height: 44,
            zIndex: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: 32,
              color: '#7B1838',
              lineHeight: 1,
              letterSpacing: '0.02em',
              marginBottom: 4,
            }}
          >
            Parleen Kaur
          </span>
        </div>
      )}

      {/* 5. Dynamic Date (Centered Directly Over the DATE Line at y=644) */}
      <div
        style={{
          position: 'absolute',
          left: 420,
          top: 618,
          width: 165,
          zIndex: 6,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13.5,
            fontWeight: 700,
            color: '#362A2E',
            letterSpacing: '0.04em',
          }}
        >
          {date || '20/09/2026'}
        </span>
      </div>
    </div>
  )
}
