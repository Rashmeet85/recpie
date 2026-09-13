export function cleanPastedText(text) {
  if (!text) return ''

  return String(text)
    // Remove URLs
    .replace(/https?:\/\/\S+/gi, '')
    // Remove common social noise
    .replace(/(?:follow|subscribe|click link|like & share|credit:?|via:?|instagram|youtube|tiktok)\b[^\n\r]*/gi, '')
    // Remove hashtag blocks
    .replace(/#\w+/g, '')
    // Normalize excessive newlines and spaces
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function optimizeRecipePhoto(file, maxDimension = 1024) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please provide a valid image file.'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image.'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Downscale while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          return reject(new Error('Could not initialize canvas context.'))
        }

        // Apply contrast and slight brightness boost to clean paper background and sharpen ink
        try {
          ctx.filter = 'contrast(1.22) brightness(1.04)'
        } catch {
          // Fallback if ctx.filter unsupported
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to high-efficiency JPEG
        const mimeType = 'image/jpeg'
        const dataUrl = canvas.toDataURL(mimeType, 0.78)
        const base64Data = dataUrl.split(',')[1]

        resolve({
          dataUrl,
          base64: base64Data,
          mimeType,
          originalSize: file.size,
          width,
          height,
        })
      }
      img.src = event.target.result
    }

    reader.readAsDataURL(file)
  })
}

export function optimizeOrderPhoto(file, maxDimension = 1000) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read photo.'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load photo.'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Downscale while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          return reject(new Error('Could not initialize image processing.'))
        }

        // Draw preserving natural true-to-life colors
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to high-efficiency JPEG (~80-120KB)
        const mimeType = 'image/jpeg'
        const dataUrl = canvas.toDataURL(mimeType, 0.82)
        const base64Data = dataUrl.split(',')[1]

        resolve({
          dataUrl,
          base64: base64Data,
          mimeType,
          originalSize: file.size,
          width,
          height,
        })
      }
      img.src = event.target.result
    }

    reader.readAsDataURL(file)
  })
}

