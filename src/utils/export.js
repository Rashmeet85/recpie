import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat, PageBreak,
  Footer, Header } from 'docx'
import { saveAs } from 'file-saver'

// ─── PDF Export ───────────────────────────────────────────────────────────────

function addRecipeToPDF(doc, recipe, isFirst) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margin = 22
  const contentW = pw - margin * 2
  
  if (!isFirst) doc.addPage()

  let y = margin

  // Background tint
  doc.setFillColor(249, 243, 238)
  doc.rect(0, 0, pw, ph, 'F')

  // Top decorative bar
  doc.setFillColor(212, 136, 106)
  doc.rect(0, 0, pw, 4, 'F')

  // Emoji + Title
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(45, 40, 38)
  doc.text(`${recipe.emoji || '🍴'}  ${recipe.name}`, pw / 2, y, { align: 'center' })
  y += 4

  // Decorative line
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.5)
  doc.line(margin, y + 2, pw - margin, y + 2)
  y += 10

  // Meta grid
  if (recipe.meta?.length) {
    const cols = Math.min(4, recipe.meta.length)
    const cellW = contentW / cols
    const cellH = 16
    
    recipe.meta.forEach((m, i) => {
      const x = margin + (i % cols) * cellW
      const row = Math.floor(i / cols)
      const cy = y + row * (cellH + 2)
      
      // Cell bg
      doc.setFillColor(242, 217, 208)
      doc.roundedRect(x + 1, cy, cellW - 2, cellH, 3, 3, 'F')
      
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 94, 87)
      doc.text(m.label.toUpperCase(), x + cellW / 2, cy + 5, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(45, 40, 38)
      doc.text(m.value, x + cellW / 2, cy + 12, { align: 'center' })
    })
    
    const rows = Math.ceil(recipe.meta.length / cols)
    y += rows * (cellH + 2) + 8
  }

  // Ingredients
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(212, 136, 106)
  doc.text('🌾  Ingredients', margin, y)
  y += 7

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(45, 40, 38)
  
  recipe.ingredients?.forEach(ing => {
    doc.text(`• ${ing.name}`, margin + 4, y)
    doc.setFont('helvetica', 'bold')
    doc.text(ing.amount, pw - margin, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    y += 6.5
    if (y > ph - 40) { doc.addPage(); y = margin + 10 }
  })

  if (recipe.ingredientNote) {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(107, 94, 87)
    doc.text(recipe.ingredientNote, margin + 4, y)
    y += 7
  }
  y += 4

  // Method
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(143, 166, 139)
  doc.text('👩‍🍳  Method', margin, y)
  y += 7

  doc.setFontSize(9.5)
  doc.setTextColor(45, 40, 38)
  
  recipe.method?.forEach((step, i) => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(212, 136, 106)
    doc.text(`${i + 1}.`, margin + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(45, 40, 38)
    const lines = doc.splitTextToSize(step, contentW - 12)
    doc.text(lines, margin + 10, y)
    y += lines.length * 6 + 2
    if (y > ph - 40) { doc.addPage(); y = margin + 10 }
  })
  y += 4

  // Tips
  if (recipe.tips) {
    doc.setFillColor(232, 213, 176)
    doc.roundedRect(margin, y, contentW, 5 + doc.splitTextToSize(recipe.tips, contentW - 16).length * 6, 4, 4, 'F')
    y += 5
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(138, 100, 36)
    doc.text('💡  Baker\'s Tips', margin + 6, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const tipsLines = doc.splitTextToSize(recipe.tips, contentW - 16)
    doc.text(tipsLines, margin + 6, y)
    y += tipsLines.length * 6 + 6
  }

  // Notes section
  if (y > ph - 50) { doc.addPage(); y = margin + 10 }
  
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(176, 158, 150)
  doc.text('📝  My Notes', margin, y)
  y += 7
  
  if (recipe.notes) {
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(45, 40, 38)
    const noteLines = doc.splitTextToSize(recipe.notes, contentW - 8)
    doc.text(noteLines, margin + 4, y)
    y += noteLines.length * 6
  } else {
    // Blank lines
    doc.setDrawColor(176, 158, 150)
    doc.setLineWidth(0.3)
    for (let i = 0; i < 4; i++) {
      doc.line(margin + 4, y + 2, pw - margin, y + 2)
      y += 8
    }
  }

  // Footer
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(176, 158, 150)
  doc.text("Made with ❤️ by Kaur's Cakery", pw / 2, ph - 8, { align: 'center' })
  doc.setDrawColor(212, 136, 106)
  doc.setLineWidth(0.3)
  doc.line(margin, ph - 12, pw - margin, ph - 12)
}

export async function exportToPDF(recipes) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  
  // Title page
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  
  doc.setFillColor(249, 243, 238)
  doc.rect(0, 0, pw, ph, 'F')
  doc.setFillColor(212, 136, 106)
  doc.rect(0, 0, pw, 6, 'F')
  doc.setFillColor(212, 136, 106)
  doc.rect(0, ph - 6, pw, 6, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(36)
  doc.setTextColor(45, 40, 38)
  doc.text("KAUR'S CAKERY", pw / 2, ph / 2 - 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 94, 87)
  doc.text('Recipe Book', pw / 2, ph / 2 - 8, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setTextColor(176, 158, 150)
  doc.text('Crafted with love, baked with passion', pw / 2, ph / 2 + 4, { align: 'center' })
  
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.5)
  doc.line(pw / 2 - 40, ph / 2 - 2, pw / 2 + 40, ph / 2 - 2)

  recipes.forEach((recipe, i) => addRecipeToPDF(doc, recipe, false))
  
  doc.save(`Kauers_Cakery_Recipes_${new Date().toISOString().slice(0,10)}.pdf`)
}

export async function exportSinglePDF(recipe) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  addRecipeToPDF(doc, recipe, true)
  doc.save(`${recipe.name.replace(/\s+/g, '_')}.pdf`)
}

// ─── DOCX Export ─────────────────────────────────────────────────────────────

function makeBorder(color = 'E8D5B0') {
  const b = { style: BorderStyle.SINGLE, size: 1, color }
  return { top: b, bottom: b, left: b, right: b }
}

function sectionHeading(text, color = 'D4886A') {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 28, color, font: 'Calibri' })]
  })
}

function recipeToDocxElements(recipe) {
  const elements = []

  // Title
  elements.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    children: [
      new TextRun({ text: `${recipe.emoji || '🍴'}  ${recipe.name}`, bold: true, size: 40, font: 'Calibri', color: '2d2826' })
    ]
  }))

  // Divider line
  elements.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A96E' } },
    spacing: { before: 0, after: 200 },
    children: []
  }))

  // Meta table
  if (recipe.meta?.length) {
    const cols = recipe.meta.length
    const colW = Math.floor(9360 / cols)
    elements.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: recipe.meta.map(() => colW),
      rows: [
        new TableRow({
          children: recipe.meta.map(m => new TableCell({
            borders: makeBorder('F2D9D0'),
            width: { size: colW, type: WidthType.DXA },
            shading: { fill: 'F2D9D0', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 160, right: 160 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.label.toUpperCase(), size: 16, color: '6b5e57', font: 'Calibri' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.value, bold: true, size: 20, color: '2d2826', font: 'Calibri' })] }),
            ]
          }))
        })
      ]
    }))
  }

  elements.push(new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }))

  // Ingredients
  elements.push(sectionHeading('🌾  Ingredients', 'D4886A'))
  recipe.ingredients?.forEach(ing => {
    elements.push(new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: '• ', color: 'D4886A', font: 'Calibri', size: 20 }),
        new TextRun({ text: ing.name, font: 'Calibri', size: 20 }),
        new TextRun({ text: `  —  ${ing.amount}`, bold: true, font: 'Calibri', size: 20, color: '6b5e57' }),
      ]
    }))
  })
  if (recipe.ingredientNote) {
    elements.push(new Paragraph({
      spacing: { before: 80, after: 80 },
      indent: { left: 360 },
      children: [new TextRun({ text: recipe.ingredientNote, italics: true, size: 18, color: '6b5e57', font: 'Calibri' })]
    }))
  }

  // Method
  elements.push(sectionHeading('👩‍🍳  Method', '8FA68B'))
  recipe.method?.forEach((step, i) => {
    elements.push(new Paragraph({
      spacing: { before: 60, after: 60 },
      indent: { left: 360, hanging: 280 },
      children: [
        new TextRun({ text: `${i + 1}.  `, bold: true, color: 'D4886A', font: 'Calibri', size: 20 }),
        new TextRun({ text: step, font: 'Calibri', size: 20 }),
      ]
    }))
  })

  // Tips
  if (recipe.tips) {
    elements.push(new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }))
    elements.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [new TableRow({
        children: [new TableCell({
          borders: makeBorder('C9A96E'),
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: 'E8D5B0', type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [
            new Paragraph({ children: [new TextRun({ text: '💡  Baker\'s Tips', bold: true, size: 22, color: '8a6424', font: 'Calibri' })] }),
            new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: recipe.tips, size: 20, font: 'Calibri' })] }),
          ]
        })]
      })]
    }))
  }

  // Notes
  elements.push(new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }))
  elements.push(sectionHeading('📝  My Notes', 'B09E96'))
  
  if (recipe.notes) {
    elements.push(new Paragraph({
      indent: { left: 360 },
      children: [new TextRun({ text: recipe.notes, font: 'Calibri', size: 20 })]
    }))
  } else {
    for (let i = 0; i < 4; i++) {
      elements.push(new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D0C4BE' } },
        spacing: { before: 0, after: 280 },
        children: [new TextRun({ text: ' ', size: 20 })]
      }))
    }
  }

  // Page break (except last)
  elements.push(new Paragraph({ children: [new PageBreak()] }))

  return elements
}

export async function exportToDocx(recipes) {
  const allElements = []

  // Cover page elements
  allElements.push(
    new Paragraph({ spacing: { before: 2000, after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "KAUR'S CAKERY", bold: true, size: 64, color: '2d2826', font: 'Calibri' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 }, children: [new TextRun({ text: 'Recipe Book', size: 36, color: '6b5e57', font: 'Calibri' })] }),
    new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: 'C9A96E' } }, spacing: { before: 200, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: ' ', size: 20 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: 'Crafted with love, baked with passion', italics: true, size: 24, color: 'B09E96', font: 'Calibri' })] }),
    new Paragraph({ children: [new PageBreak()] }),
  )

  recipes.forEach(r => recipeToDocxElements(r).forEach(el => allElements.push(el)))

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'D4886A' } },
            spacing: { before: 120 },
            children: [new TextRun({ text: "Made with ❤️ by Kaur's Cakery", italics: true, size: 16, color: 'B09E96', font: 'Calibri' })]
          })]
        })
      },
      children: allElements
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    `Kauers_Cakery_Recipes_${new Date().toISOString().slice(0,10)}.docx`)
}

export async function exportSingleDocx(recipe) {
  const doc = new Document({
    sections: [{
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Made with ❤️ by Kaur's Cakery", italics: true, size: 16, color: 'B09E96', font: 'Calibri' })]
          })]
        })
      },
      children: recipeToDocxElements(recipe).filter(el => !(el.root?.[0]?.rootKey === 'w:lastRenderedPageBreak'))
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    `${recipe.name.replace(/\s+/g, '_')}.docx`)
}
