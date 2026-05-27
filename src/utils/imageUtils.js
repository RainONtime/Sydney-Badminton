/**
 * Compress an image file using Canvas before upload.
 *
 * @param {File} file           - The original image File object
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=800]   - Max output width in px (height scales proportionally)
 * @param {number} [opts.quality=0.7]    - JPEG quality 0–1
 * @returns {Promise<string>}   - Compressed image as base64 data URL (image/jpeg)
 */
export function compressImage(file, { maxWidth = 800, quality = 0.7 } = {}) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // Scale down if wider than maxWidth; maintain aspect ratio
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width))
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // toDataURL is synchronous; resolve directly
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // Fallback: read original file without compression
      const reader = new FileReader()
      reader.onload  = e => resolve(e.target.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    }

    img.src = objectUrl
  })
}
