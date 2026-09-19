import React from 'react'
import CertificateBorderSvg from './CertificateBorderSvg'
import kaursLogo from '../../assets/certificate/kaurs_logo.png'
import fssaiLogo from '../../assets/certificate/fssai_logo.png'
import cakeIllustration from '../../assets/certificate/cake_illustration.png'
import whiskIllustration from '../../assets/certificate/whisk_illustration.png'

export default function CertificateTemplate({
  name = 'Parleen Kaur',
  course = 'ICING CAKE COURSE',
  date = '20/09/2026',
  description = 'and has demonstrated dedication, creativity and skill in learning the art of cake icing and decoration.',
  signatory = "FOUNDER\nKAUR'S CAKERY",
  title = 'CERTIFICATE',
  subtitle = 'OF SUCCESSFUL COMPLETION',
  customTheme = {},
  innerRef = null,
}) {
  const primaryColor = customTheme.primaryColor || '#3B131D'
  const nameColor = customTheme.nameColor || '#BF1E5B'
  const courseColor = customTheme.courseColor || '#931A42'
  const borderColor = customTheme.borderColor || '#C5A866'
  const secondaryBorderColor = customTheme.secondaryBorderColor || '#DFC68C'
  const backgroundColor = customTheme.backgroundColor || '#FAF7F2'

  return (
    <div
      ref={innerRef}
      id="kaurs-certificate-root"
      style={{
        width: 1024,
        height: 740,
        position: 'relative',
        background: backgroundColor,
        backgroundImage: `
          radial-gradient(ellipse at 4% 96%, rgba(248, 178, 198, 0.48) 0%, rgba(253, 215, 226, 0.22) 28%, transparent 55%),
          radial-gradient(ellipse at 96% 4%, rgba(248, 178, 198, 0.42) 0%, rgba(253, 215, 226, 0.20) 24%, transparent 50%),
          linear-gradient(180deg, #FAF7F2 0%, #FAF5EE 100%)
        `,
        overflow: 'hidden',
        boxSizing: 'border-box',
        color: '#33272A',
        fontFamily: "'Montserrat', sans-serif",
        userSelect: 'none',
      }}
    >
      {/* Precision Vector Gold Border & Corner Filigrees */}
      <CertificateBorderSvg color={borderColor} secondaryColor={secondaryBorderColor} />

      {/* Top Left: Official Kaur's Cakery Logo */}
      <div
        style={{
          position: 'absolute',
          top: 38,
          left: 45,
          zIndex: 5,
        }}
      >
        <img
          src={kaursLogo}
          alt="Kaur's Cakery"
          style={{ height: 110, objectFit: 'contain' }}
        />
      </div>

      {/* Top Right: FSSAI Registered Emblem */}
      <div
        style={{
          position: 'absolute',
          top: 42,
          right: 48,
          zIndex: 5,
        }}
      >
        <img
          src={fssaiLogo}
          alt="FSSAI Registered"
          style={{ height: 95, objectFit: 'contain' }}
        />
      </div>

      {/* Left Whisk Line Illustration */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: '49%',
          transform: 'translateY(-50%)',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <img
          src={whiskIllustration}
          alt="Whisk Ornament"
          style={{ width: 105, objectFit: 'contain', opacity: 0.95 }}
        />
      </div>

      {/* Right Rosette Cake Stand & Piping Bag Illustration */}
      <div
        style={{
          position: 'absolute',
          right: 18,
          bottom: 45,
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <img
          src={cakeIllustration}
          alt="Rosette Cake"
          style={{ width: 235, objectFit: 'contain' }}
        />
      </div>

      {/* Center Main Certificate Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          paddingTop: 88,
          paddingLeft: 110,
          paddingRight: 110,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Main Title: CERTIFICATE */}
        <h1
          style={{
            margin: 0,
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: primaryColor,
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h1>

        {/* Dividing Gold Line with Centered Heart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            margin: '8px 0 6px',
            width: '100%',
          }}
        >
          <div
            style={{
              width: 55,
              height: 1.5,
              background: borderColor,
            }}
          />
          <span style={{ color: '#E56A8F', fontSize: 13, lineHeight: 1 }}>♥</span>
          <div
            style={{
              width: 55,
              height: 1.5,
              background: borderColor,
            }}
          />
        </div>

        {/* Subtitle: OF SUCCESSFUL COMPLETION */}
        <p
          style={{
            margin: 0,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            letterSpacing: '0.30em',
            color: primaryColor,
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </p>

        <span style={{ color: '#E56A8F', fontSize: 12, margin: '5px 0 10px', lineHeight: 1 }}>♥</span>

        {/* Certify text */}
        <p
          style={{
            margin: 0,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 15.5,
            fontWeight: 500,
            color: '#362A2E',
            letterSpacing: '0.02em',
          }}
        >
          This is to certify that
        </p>

        {/* Student Name in Signature Calligraphy */}
        <div
          style={{
            margin: '4px 0 0',
            width: '100%',
            maxWidth: 640,
          }}
        >
          <div
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: 54,
              color: nameColor,
              lineHeight: 1.15,
              fontWeight: 400,
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(191, 30, 91, 0.08)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '0 10px',
            }}
            title={name}
          >
            {name || 'Student Name'}
          </div>

          {/* Underline beneath the name */}
          <div
            style={{
              width: 480,
              height: 1.5,
              background: `linear-gradient(90deg, transparent 0%, ${borderColor} 18%, ${borderColor} 82%, transparent 100%)`,
              margin: '2px auto 14px',
            }}
          />
        </div>

        {/* has successfully completed the */}
        <p
          style={{
            margin: 0,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 14.5,
            fontWeight: 500,
            color: '#362A2E',
          }}
        >
          has successfully completed the
        </p>

        {/* Course Name */}
        <h2
          style={{
            margin: '7px 0 9px',
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: courseColor,
            lineHeight: 1.2,
            textTransform: 'uppercase',
            maxWidth: 680,
          }}
        >
          {course || 'ICING CAKE COURSE'}
        </h2>

        {/* Course Description */}
        <p
          style={{
            margin: 0,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13.5,
            fontWeight: 500,
            color: '#3A2E32',
            lineHeight: 1.55,
            maxWidth: 610,
          }}
        >
          {description}
        </p>

        {/* Benediction */}
        <p
          style={{
            margin: '7px 0 0',
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13.5,
            fontWeight: 500,
            fontStyle: 'italic',
            color: '#3A2E32',
          }}
        >
          We wish you all the very best for your future endeavours.
        </p>

        <span style={{ color: '#E56A8F', fontSize: 12, margin: '6px 0 16px', lineHeight: 1 }}>♥</span>

        {/* Bottom Signatory & Date Footer */}
        <div
          style={{
            width: '100%',
            maxWidth: 720,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingTop: 4,
          }}
        >
          {/* Left Signatory */}
          <div style={{ textAlign: 'center', width: 170 }}>
            <div
              style={{
                width: 145,
                height: 1.4,
                background: '#45353A',
                margin: '0 auto 6px',
              }}
            />
            {signatory.split('\n').map((line, idx) => (
              <p
                key={idx}
                style={{
                  margin: 0,
                  fontSize: idx === 0 ? 11 : 10,
                  fontWeight: idx === 0 ? 700 : 600,
                  letterSpacing: '0.08em',
                  color: '#45353A',
                  textTransform: 'uppercase',
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Center Date */}
          <div style={{ textAlign: 'center', width: 150 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#362A2E',
                letterSpacing: '0.04em',
                marginBottom: 3,
                minHeight: 18,
              }}
            >
              {date}
            </div>
            <div
              style={{
                width: 135,
                height: 1.4,
                background: '#45353A',
                margin: '0 auto 6px',
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#45353A',
                textTransform: 'uppercase',
              }}
            >
              DATE
            </p>
          </div>

          {/* Right Kaur's Cakery Tag */}
          <div style={{ textAlign: 'center', width: 170 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: 14,
                fontWeight: 700,
                color: '#291F22',
                lineHeight: 1.2,
              }}
            >
              Kaur&apos;s Cakery
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#45353A',
                textTransform: 'uppercase',
              }}
            >
              BAKING DREAMS
            </p>
            <span style={{ color: '#E56A8F', fontSize: 11, display: 'inline-block', marginTop: 2 }}>♥</span>
          </div>
        </div>
      </div>
    </div>
  )
}

