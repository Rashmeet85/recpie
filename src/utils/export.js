import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
  PageBreak, Footer, PageNumber
} from 'docx'
import { saveAs } from 'file-saver'

// ─── Colour palette (from reference DOCX) ────────────────────────────────────
// E8536A  rose    – banner bg, section headings
// D4A843  gold    – divider lines, tips border, notes border
// 2C1810  dark    – body text
// 6B5B52  grey    – meta labels, footer
// FDF6EC  cream   – meta table bg, tips bg
// FAFAFA  offwhite– notes bg

// ─── Emoji-aware text splitter (for DOCX) ────────────────────────────────────
// Splits a string into [{text, isEmoji}] segments so emojis get Segoe UI Emoji font
function splitEmoji(str) {
  const emojiRe = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const segs = []
  let last = 0, m
  while ((m = emojiRe.exec(str)) !== null) {
    if (m.index > last) segs.push({ text: str.slice(last, m.index), isEmoji: false })
    segs.push({ text: m[0], isEmoji: true })
    last = m.index + m[0].length
  }
  if (last < str.length) segs.push({ text: str.slice(last), isEmoji: false })
  return segs.length ? segs : [{ text: str, isEmoji: false }]
}

// Build TextRun(s) for a string, applying emoji font where needed
function emojiRuns(text, baseProps = {}) {
  return splitEmoji(text).map(seg => new TextRun({
    ...baseProps,
    text: seg.text,
    font: seg.isEmoji ? 'Segoe UI Emoji' : (baseProps.font || 'Arial'),
  }))
}

// ─── PDF via html2canvas ──────────────────────────────────────────────────────
// We render each recipe as a hidden styled HTML element, capture it with
// html2canvas (which uses the browser's native emoji rendering), then add
// the resulting image to jsPDF. This is the only reliable way to get
// correct Unicode + emoji in a PDF from a browser.

function buildRecipeHTML(recipe) {
  // Colours
  const rose = '#E8536A', gold = '#D4A843', dark = '#2C1810'
  const grey = '#6B5B52', cream = '#FDF6EC', offwhite = '#FAFAFA'
  const bg = '#F9F3EE'

  // Meta grid
  const metaHTML = recipe.meta?.length ? `
    <div style="display:grid;grid-template-columns:repeat(${Math.min(4, recipe.meta.length)},1fr);gap:2px;margin-bottom:12px;">
      ${recipe.meta.map(m => `
        <div style="background:${cream};padding:6px 8px;text-align:center;border-radius:3px;">
          <div style="font-size:9px;color:${grey};margin-bottom:2px;">${m.label}</div>
          <div style="font-size:12px;font-weight:700;color:${rose};">${m.value}</div>
        </div>`).join('')}
    </div>` : ''

  // Ingredients
  const ingHTML = `
    <div style="border-bottom:2px solid ${gold};padding-bottom:3px;margin-bottom:8px;margin-top:14px;">
      <span style="font-size:14px;font-weight:700;color:${rose};">🌾&nbsp;&nbsp;Ingredients</span>
    </div>
    <ul style="margin:0 0 8px 0;padding-left:18px;list-style:disc;">
      ${recipe.ingredients?.map(ing => `
        <li style="font-size:10px;color:${dark};margin-bottom:3px;">
          <strong>${ing.name}</strong>
          <span style="color:${grey}"> – </span>${ing.amount}
        </li>`).join('') || ''}
    </ul>
    ${recipe.ingredientNote ? (() => {
      const parts = recipe.ingredientNote.split(':')
      return `<p style="font-size:9.5px;margin:4px 0 0 0;">
        <strong style="color:${rose};">${parts[0]}:</strong>
        <em style="color:${dark};"> ${parts.slice(1).join(':').trim()}</em>
      </p>`
    })() : ''}`

  // Method
  const methodHTML = `
    <div style="border-bottom:2px solid ${gold};padding-bottom:3px;margin-bottom:8px;margin-top:14px;">
      <span style="font-size:14px;font-weight:700;color:${rose};">👩‍🍳&nbsp;&nbsp;Method</span>
    </div>
    <ol style="margin:0 0 8px 0;padding-left:20px;">
      ${recipe.method?.map(step => `
        <li style="font-size:10px;color:${dark};margin-bottom:4px;">${step}</li>`).join('') || ''}
    </ol>`

  // Tips
  const tipsHTML = recipe.tips ? `
    <div style="border:1px solid ${gold};border-left:4px solid ${gold};background:${cream};padding:8px 12px;margin:10px 0;border-radius:2px;">
      <div style="font-size:11px;font-weight:700;color:${gold};margin-bottom:4px;">💡&nbsp;&nbsp;Baker's Tips</div>
      <ul style="margin:0;padding-left:16px;">
        ${(Array.isArray(recipe.tips) ? recipe.tips : [recipe.tips]).map(t => `
          <li style="font-size:10px;color:${dark};margin-bottom:3px;">${t}</li>`).join('')}
      </ul>
    </div>` : ''

  // Notes
  const notesHTML = `
    <div style="border:1px solid ${gold};background:${offwhite};padding:8px 12px;margin-top:10px;border-radius:2px;">
      <div style="font-size:11px;font-weight:700;color:${gold};margin-bottom:4px;">📝&nbsp;&nbsp;My Notes</div>
      <div style="font-size:10px;color:${recipe.notes ? dark : grey};font-style:${recipe.notes ? 'normal' : 'italic'};">
        ${recipe.notes || 'Write your tips, tweaks, and tasting notes here...'}
      </div>
    </div>`

  return `
    <div style="width:680px;background:${bg};font-family:'Segoe UI',Arial,sans-serif;padding:0 0 16px 0;box-sizing:border-box;">
      <div style="background:${rose};padding:14px 24px;text-align:center;margin-bottom:12px;">
        <div style="font-size:26px;">${recipe.emoji || '🍴'}</div>
        <div style="font-size:22px;font-weight:700;color:white;font-family:Georgia,serif;">${recipe.name}</div>
      </div>
      <div style="padding:0 20px;">
        ${metaHTML}
        ${ingHTML}
        ${methodHTML}
        ${tipsHTML}
        ${notesHTML}
        <div style="border-top:1px solid #E8D5C4;margin-top:14px;padding-top:6px;text-align:center;font-size:8px;color:${grey};">
          Made with ❤️ by Kaur's Cakery
        </div>
      </div>
    </div>`
}

async function renderRecipeToPDFPage(doc, recipe, isFirst) {
  // Create hidden container
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  container.innerHTML = buildRecipeHTML(recipe)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container.firstElementChild, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#F9F3EE',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    const margin = 10
    const maxW = pw - margin * 2
    const ratio = canvas.height / canvas.width
    let imgW = maxW
    let imgH = imgW * ratio

    if (!isFirst) doc.addPage()

    // If taller than page, scale down
    if (imgH > ph - margin * 2) {
      imgH = ph - margin * 2
      imgW = imgH / ratio
    }

    const x = (pw - imgW) / 2
    doc.addImage(imgData, 'JPEG', x, margin, imgW, imgH)
  } finally {
    document.body.removeChild(container)
  }
}

async function renderCoverToPDF(doc) {
  const rose = '#E8536A', gold = '#D4A843', dark = '#2C1810', grey = '#6B5B52'
  const coverHTML = `
    <div style="width:680px;height:960px;background:#F9F3EE;font-family:'Segoe UI',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;padding:40px;">
      <div style="background:${rose};width:100%;height:10px;position:absolute;top:0;left:0;"></div>
      <div style="background:${rose};width:100%;height:10px;position:absolute;bottom:0;left:0;"></div>
      <div style="font-size:52px;font-weight:700;color:${rose};font-family:Georgia,serif;text-align:center;letter-spacing:2px;">KAUR'S CAKERY</div>
      <div style="width:80px;height:2px;background:${gold};margin:14px auto;"></div>
      <div style="font-size:24px;font-weight:700;color:${dark};font-family:Georgia,serif;text-align:center;margin-bottom:8px;">BREAD MAKING WORKSHOP</div>
      <div style="font-size:16px;color:${grey};font-style:italic;font-family:Georgia,serif;margin-bottom:8px;">Recipe Collection</div>
      <div style="font-size:12px;color:${grey};margin-top:20px;">Crafted with love, baked with passion</div>
    </div>`

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  container.innerHTML = coverHTML
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container.firstElementChild, { scale: 2, backgroundColor: '#F9F3EE', logging: false })
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    doc.addImage(imgData, 'JPEG', 0, 0, pw, ph)
  } finally {
    document.body.removeChild(container)
  }
}

export async function exportToPDF(recipes) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  await renderCoverToPDF(doc)
  for (const recipe of recipes) {
    await renderRecipeToPDFPage(doc, recipe, false)
  }
  doc.save(`Kauers_Cakery_Recipes_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export async function exportSinglePDF(recipe) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  await renderRecipeToPDFPage(doc, recipe, true)
  doc.save(`${recipe.name.replace(/\s+/g, '_')}.pdf`)
}

// ─── DOCX Export ─────────────────────────────────────────────────────────────

function sectionHeading(label) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D4A843', space: 0 } },
    spacing: { before: 180, after: 80 },
    children: emojiRuns(label, { bold: true, size: 24, color: 'E8536A' })
  })
}

function recipeToDocxElements(recipe) {
  const elements = []

  // Banner
  elements.push(new Paragraph({
    shading: { fill: 'E8536A', type: ShadingType.CLEAR },
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 0 },
    children: emojiRuns(recipe.emoji || '🍴', { size: 44 })
  }))
  elements.push(new Paragraph({
    shading: { fill: 'E8536A', type: ShadingType.CLEAR },
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: emojiRuns(recipe.name, { bold: true, size: 40, color: 'FFFFFF', font: 'Georgia' })
  }))
  elements.push(new Paragraph({
    shading: { fill: 'E8536A', type: ShadingType.CLEAR },
    spacing: { before: 0, after: 0 },
    children: []
  }))
  elements.push(new Paragraph({ spacing: { before: 100, after: 0 }, children: [] }))

  // Meta table
  if (recipe.meta?.length) {
    const cols = recipe.meta.length
    const colW = Math.floor(9360 / cols)
    const nb = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
    const noBorders = { top: nb, bottom: nb, left: nb, right: nb }

    elements.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: recipe.meta.map(() => colW),
      rows: [new TableRow({
        children: recipe.meta.map(m => new TableCell({
          borders: noBorders,
          width: { size: colW, type: WidthType.DXA },
          shading: { fill: 'FDF6EC', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.label, size: 16, color: '6B5B52', font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.value, bold: true, color: 'E8536A', font: 'Arial' })] }),
          ]
        }))
      })]
    }))
    elements.push(new Paragraph({ spacing: { before: 80, after: 0 }, children: [] }))
  }

  // Ingredients
  elements.push(sectionHeading('🌾  Ingredients'))
  recipe.ingredients?.forEach(ing => {
    elements.push(new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: ing.name, bold: true, color: '2C1810', font: 'Arial' }),
        new TextRun({ text: ' – ', color: '6B5B52', font: 'Arial' }),
        new TextRun({ text: ing.amount, color: '2C1810', font: 'Arial' }),
      ]
    }))
  })
  if (recipe.ingredientNote) {
    const parts = recipe.ingredientNote.split(':')
    const label = parts[0] + ':'
    const rest = parts.slice(1).join(':').trim()
    elements.push(new Paragraph({
      spacing: { before: 60, after: 40 },
      children: [
        new TextRun({ text: label + ' ', bold: true, color: 'E8536A', font: 'Arial' }),
        new TextRun({ text: rest, italics: true, color: '2C1810', font: 'Arial' }),
      ]
    }))
  }

  // Method
  elements.push(sectionHeading('👩‍🍳  Method'))
  recipe.method?.forEach(step => {
    elements.push(new Paragraph({
      numbering: { reference: 'numbers', level: 0 },
      spacing: { before: 28, after: 28 },
      children: [new TextRun({ text: step, color: '2C1810', font: 'Arial' })]
    }))
  })

  // Tips
  if (recipe.tips) {
    elements.push(new Paragraph({ spacing: { before: 120, after: 0 }, children: [] }))
    const tipArr = Array.isArray(recipe.tips) ? recipe.tips : [recipe.tips]
    elements.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 3, color: 'D4A843' },
            left: { style: BorderStyle.THICK, size: 12, color: 'D4A843' },
            bottom: { style: BorderStyle.SINGLE, size: 3, color: 'D4A843' },
            right: { style: BorderStyle.SINGLE, size: 3, color: 'D4A843' },
          },
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: 'FDF6EC', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 200, right: 200 },
          children: [
            new Paragraph({
              spacing: { before: 0, after: 60 },
              children: emojiRuns("💡  Baker's Tips", { bold: true, color: 'D4A843' })
            }),
            ...tipArr.map(tip => new Paragraph({
              numbering: { reference: 'tips-bullets', level: 0 },
              spacing: { before: 20, after: 20 },
              children: [new TextRun({ text: tip, color: '2C1810', font: 'Arial' })]
            }))
          ]
        })]
      })]
    }))
  }

  // Notes
  elements.push(new Paragraph({ spacing: { before: 80, after: 0 }, children: [] }))
  elements.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
        },
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: 'FAFAFA', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 200, right: 200 },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: emojiRuns('📝  My Notes', { bold: true, size: 22, color: 'D4A843' })
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: recipe.notes || 'Write your tips, tweaks, and tasting notes here...',
              italics: !recipe.notes,
              color: recipe.notes ? '2C1810' : '6B5B52',
              font: 'Arial',
            })]
          }),
        ]
      })]
    })]
  }))

  elements.push(new Paragraph({ children: [new PageBreak()] }))
  return elements
}

const NUMBERING_CONFIG = {
  config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] },
    { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 220 } } } }] },
    { reference: 'tips-bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] },
  ]
}

const PAGE_PROPS = { size: { width: 12240, height: 15840 }, margin: { top: 900, right: 1080, bottom: 900, left: 1080 } }

function makeFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E8D5C4', space: 0 } },
      spacing: { before: 60 },
      children: [
        ...emojiRuns("Made with ❤️ by Kaur's Cakery  •  Page ", { size: 16, color: '6B5B52' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6B5B52' }),
      ]
    })]
  })
}

export async function exportToDocx(recipes) {
  const allElements = []

  // Cover page
  allElements.push(
    new Paragraph({ spacing: { before: 1440, after: 400 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "KAUR'S CAKERY", bold: true, size: 72, color: 'E8536A', font: 'Georgia' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: '✦  ✦  ✦', color: 'D4A843', size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'BREAD MAKING WORKSHOP', bold: true, size: 44, color: '2C1810', font: 'Georgia' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Recipe Collection', italics: true, size: 28, color: '6B5B52', font: 'Georgia' })] }),
    new Paragraph({ spacing: { before: 500 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: '🍔  Burger Buns  |  🌾  Whole Wheat Bread  |  🥖  Ladi Pav  |  🫓  Focaccia  |  🍕  Pizza Base', color: '6B5B52', font: 'Segoe UI Emoji' })] }),
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E8536A', space: 0 } }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: ' ' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: 'Crafted with love, baked with passion', italics: true, size: 22, color: '6B5B52', font: 'Georgia' })] }),
    new Paragraph({ children: [new PageBreak()] }),
  )

  recipes.forEach(r => recipeToDocxElements(r).forEach(el => allElements.push(el)))

  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [{ properties: { page: PAGE_PROPS }, footers: { default: makeFooter() }, children: allElements }]
  })

  const buffer = await Packer.toBuffer(doc)
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    `Kauers_Cakery_Recipes_${new Date().toISOString().slice(0, 10)}.docx`)
}

export async function exportSingleDocx(recipe) {
  const elements = recipeToDocxElements(recipe)
  if (elements.length) elements.pop()

  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [{ properties: { page: PAGE_PROPS }, footers: { default: makeFooter() }, children: elements }]
  })

  const buffer = await Packer.toBuffer(doc)
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    `${recipe.name.replace(/\s+/g, '_')}.docx`)
}
