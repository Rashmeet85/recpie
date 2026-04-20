import jsPDF from 'jspdf'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
  PageBreak, Footer, PageNumber
} from 'docx'
import { saveAs } from 'file-saver'

// ─── Exact colour palette from the reference DOCX ────────────────────────────
// E8536A  – rose/pink  (brand title, section headings, recipe banner bg)
// D4A843  – gold       (divider lines, baker's tips border, notes border)
// 2C1810  – dark brown (body text)
// 6B5B52  – warm brown (meta labels, footer, decorative text)
// FDF6EC  – cream      (meta table bg, baker's tips bg)
// FAFAFA  – near-white (notes box bg)

const FONT = 'Georgia'
const FONT_BODY = 'Arial'

// ─── PDF Export ───────────────────────────────────────────────────────────────

function addRecipeToPDF(doc, recipe, isFirst) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margin = 19
  const contentW = pw - margin * 2

  if (!isFirst) doc.addPage()

  let y = 0

  // Cream background
  doc.setFillColor(249, 243, 238)
  doc.rect(0, 0, pw, ph, 'F')

  // Recipe banner (E8536A) with emoji + title in white
  const bannerH = 22
  doc.setFillColor(232, 83, 106)
  doc.rect(0, 0, pw, bannerH, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text(`${recipe.emoji || '🍴'}  ${recipe.name}`, pw / 2, bannerH / 2 + 4, { align: 'center' })
  y = bannerH + 5

  // Meta stats table (FDF6EC background, E8536A value colour)
  if (recipe.meta?.length) {
    const cols = Math.min(4, recipe.meta.length)
    const cellW = contentW / cols
    const cellH = 15

    recipe.meta.forEach((m, i) => {
      const x = margin + (i % cols) * cellW
      const row = Math.floor(i / cols)
      const cy = y + row * (cellH + 1)

      doc.setFillColor(253, 246, 236)
      doc.rect(x + 0.5, cy, cellW - 1, cellH, 'F')

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 91, 82)
      doc.text(m.label, x + cellW / 2, cy + 5.5, { align: 'center' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(232, 83, 106)
      doc.text(m.value, x + cellW / 2, cy + 12, { align: 'center' })
    })

    const rows = Math.ceil(recipe.meta.length / cols)
    y += rows * (cellH + 1) + 5
  }

  // Ingredients heading with gold underline
  doc.setDrawColor(212, 168, 67)
  doc.setLineWidth(0.5)
  doc.line(margin, y + 6, pw - margin, y + 6)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(232, 83, 106)
  doc.text('🌾  Ingredients', margin, y + 4)
  y += 10

  doc.setFontSize(9.5)
  recipe.ingredients?.forEach(ing => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(44, 24, 16)
    const nameStr = `• ${ing.name}`
    doc.text(nameStr, margin + 4, y)
    const nameW = doc.getTextWidth(nameStr)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 91, 82)
    doc.text(' – ', margin + 4 + nameW, y)
    const sepW = doc.getTextWidth(nameStr + ' – ')
    doc.setTextColor(44, 24, 16)
    doc.text(ing.amount, margin + 4 + sepW, y)
    y += 6.5
    if (y > ph - 45) { doc.addPage(); y = margin + 5 }
  })

  if (recipe.ingredientNote) {
    doc.setFontSize(8.5)
    const parts = recipe.ingredientNote.split(':')
    const label = parts[0] + ': '
    const rest = parts.slice(1).join(':').trim()
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(232, 83, 106)
    doc.text(label, margin + 4, y)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(44, 24, 16)
    doc.text(rest, margin + 4 + doc.getTextWidth(label), y)
    y += 7
  }
  y += 3

  // Method heading
  if (y > ph - 60) { doc.addPage(); y = margin + 5 }
  doc.setDrawColor(212, 168, 67)
  doc.setLineWidth(0.5)
  doc.line(margin, y + 6, pw - margin, y + 6)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(232, 83, 106)
  doc.text('👩‍🍳  Method', margin, y + 4)
  y += 10

  doc.setFontSize(9.5)
  recipe.method?.forEach((step, i) => {
    if (y > ph - 45) { doc.addPage(); y = margin + 5 }
    const numStr = `${i + 1}.  `
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(212, 168, 67)
    doc.text(numStr, margin + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(44, 24, 16)
    const lines = doc.splitTextToSize(step, contentW - 12)
    doc.text(lines, margin + 2 + doc.getTextWidth(numStr), y)
    y += lines.length * 6 + 2
  })
  y += 3

  // Baker's Tips (FDF6EC bg, gold thick-left border)
  if (recipe.tips) {
    if (y > ph - 50) { doc.addPage(); y = margin + 5 }
    const tipArr = Array.isArray(recipe.tips) ? recipe.tips : [recipe.tips]
    const allTipLines = tipArr.flatMap(t => doc.splitTextToSize(t, contentW - 14))
    const boxH = 8 + allTipLines.length * 6 + 4

    doc.setFillColor(253, 246, 236)
    doc.rect(margin, y, contentW, boxH, 'F')
    doc.setFillColor(212, 168, 67)
    doc.rect(margin, y, 1.5, boxH, 'F')
    doc.setDrawColor(212, 168, 67)
    doc.setLineWidth(0.25)
    doc.rect(margin, y, contentW, boxH)

    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(212, 168, 67)
    doc.text("💡  Baker's Tips", margin + 5, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(44, 24, 16)
    let ty = y + 13
    allTipLines.forEach(line => {
      doc.text('• ' + line, margin + 5, ty)
      ty += 6
    })
    y += boxH + 5
  }

  // My Notes (FAFAFA bg, D4A843 border)
  if (y > ph - 50) { doc.addPage(); y = margin + 5 }
  const noteText = recipe.notes || ''
  const noteLines = noteText ? doc.splitTextToSize(noteText, contentW - 14) : []
  const noteBoxH = noteLines.length ? 8 + noteLines.length * 6 + 4 : 28

  doc.setFillColor(250, 250, 250)
  doc.rect(margin, y, contentW, noteBoxH, 'F')
  doc.setDrawColor(212, 168, 67)
  doc.setLineWidth(0.25)
  doc.rect(margin, y, contentW, noteBoxH)

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(212, 168, 67)
  doc.text('📝  My Notes', margin + 5, y + 6)
  if (noteLines.length) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(44, 24, 16)
    doc.text(noteLines, margin + 5, y + 13)
  }

  // Footer
  doc.setDrawColor(232, 213, 196)
  doc.setLineWidth(0.3)
  doc.line(margin, ph - 10, pw - margin, ph - 10)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 91, 82)
  doc.text("Made with ❤️ by Kaur's Cakery", pw / 2, ph - 6, { align: 'center' })
}

export async function exportToPDF(recipes) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()

  // Cover page
  doc.setFillColor(249, 243, 238)
  doc.rect(0, 0, pw, ph, 'F')
  doc.setFillColor(232, 83, 106)
  doc.rect(0, 0, pw, 8, 'F')
  doc.setFillColor(232, 83, 106)
  doc.rect(0, ph - 8, pw, 8, 'F')

  const cy = ph / 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(40)
  doc.setTextColor(232, 83, 106)
  doc.text("KAUR'S CAKERY", pw / 2, cy - 20, { align: 'center' })
  doc.setDrawColor(212, 168, 67)
  doc.setLineWidth(0.6)
  doc.line(pw / 2 - 35, cy - 12, pw / 2 + 35, cy - 12)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(44, 24, 16)
  doc.text('BREAD MAKING WORKSHOP', pw / 2, cy - 4, { align: 'center' })
  doc.setFontSize(13)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(107, 91, 82)
  doc.text('Recipe Collection', pw / 2, cy + 6, { align: 'center' })
  doc.setFontSize(10)
  doc.text('Crafted with love, baked with passion', pw / 2, cy + 18, { align: 'center' })

  recipes.forEach(recipe => addRecipeToPDF(doc, recipe, false))
  doc.save(`Kauers_Cakery_Recipes_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export async function exportSinglePDF(recipe) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  addRecipeToPDF(doc, recipe, true)
  doc.save(`${recipe.name.replace(/\s+/g, '_')}.pdf`)
}

// ─── DOCX Export ─────────────────────────────────────────────────────────────

function sectionHeading(label) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D4A843', space: 0 } },
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text: label, bold: true, size: 24, color: 'E8536A', font: FONT_BODY })]
  })
}

function recipeToDocxElements(recipe) {
  const elements = []

  // Recipe banner: E8536A background, white Georgia title
  elements.push(new Paragraph({
    shading: { fill: 'E8536A', type: ShadingType.CLEAR },
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 0 },
    children: [new TextRun({ text: recipe.emoji || '🍴', size: 44, font: FONT_BODY })]
  }))
  elements.push(new Paragraph({
    shading: { fill: 'E8536A', type: ShadingType.CLEAR },
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: recipe.name, bold: true, size: 40, color: 'FFFFFF', font: FONT })]
  }))
  elements.push(new Paragraph({
    shading: { fill: 'E8536A', type: ShadingType.CLEAR },
    spacing: { before: 0, after: 0 },
    children: []
  }))
  elements.push(new Paragraph({ spacing: { before: 100, after: 0 }, children: [] }))

  // Meta stats table — FDF6EC, no cell borders, label grey, value E8536A
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
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.label, size: 16, color: '6B5B52', font: FONT_BODY })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.value, bold: true, color: 'E8536A', font: FONT_BODY })] }),
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
        new TextRun({ text: ing.name, bold: true, color: '2C1810', font: FONT_BODY }),
        new TextRun({ text: ' – ', color: '6B5B52', font: FONT_BODY }),
        new TextRun({ text: ing.amount, color: '2C1810', font: FONT_BODY }),
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
        new TextRun({ text: label + ' ', bold: true, color: 'E8536A', font: FONT_BODY }),
        new TextRun({ text: rest, italics: true, color: '2C1810', font: FONT_BODY }),
      ]
    }))
  }

  // Method
  elements.push(sectionHeading('👩‍🍳  Method'))
  recipe.method?.forEach(step => {
    elements.push(new Paragraph({
      numbering: { reference: 'numbers', level: 0 },
      spacing: { before: 28, after: 28 },
      children: [new TextRun({ text: step, color: '2C1810', font: FONT_BODY })]
    }))
  })

  // Baker's Tips — FDF6EC bg, thick gold left accent
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
              children: [new TextRun({ text: "💡  Baker's Tips", bold: true, color: 'D4A843', font: FONT_BODY })]
            }),
            ...tipArr.map(tip => new Paragraph({
              numbering: { reference: 'tips-bullets', level: 0 },
              spacing: { before: 20, after: 20 },
              children: [new TextRun({ text: tip, color: '2C1810', font: FONT_BODY })]
            }))
          ]
        })]
      })]
    }))
  }

  // My Notes — FAFAFA bg, D4A843 all-border
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
            children: [new TextRun({ text: '📝  My Notes', bold: true, size: 22, color: 'D4A843', font: FONT_BODY })]
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({
              text: recipe.notes || 'Write your tips, tweaks, and tasting notes here...',
              italics: !recipe.notes,
              color: recipe.notes ? '2C1810' : '6B5B52',
              font: FONT_BODY,
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
        new TextRun({ text: "Made with ❤️ by Kaur's Cakery  •  Page ", size: 16, color: '6B5B52' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6B5B52' }),
      ]
    })]
  })
}

export async function exportToDocx(recipes) {
  const allElements = []

  // Cover page — matches reference exactly
  allElements.push(
    new Paragraph({ spacing: { before: 1440, after: 400 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "KAUR'S CAKERY", bold: true, size: 72, color: 'E8536A', font: FONT })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: '✦  ✦  ✦', color: 'D4A843', size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'BREAD MAKING WORKSHOP', bold: true, size: 44, color: '2C1810', font: FONT })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Recipe Collection', italics: true, size: 28, color: '6B5B52', font: FONT })] }),
    new Paragraph({ spacing: { before: 500 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: '🍔  Burger Buns  |  🌾  Whole Wheat Bread  |  🥖  Ladi Pav  |  🫓  Focaccia  |  🍕  Pizza Base', color: '6B5B52' })] }),
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E8536A', space: 0 } }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: ' ' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: 'Crafted with love, baked with passion', italics: true, size: 22, color: '6B5B52', font: FONT })] }),
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
  if (elements.length) elements.pop() // remove trailing page break

  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [{ properties: { page: PAGE_PROPS }, footers: { default: makeFooter() }, children: elements }]
  })

  const buffer = await Packer.toBuffer(doc)
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    `${recipe.name.replace(/\s+/g, '_')}.docx`)
}
