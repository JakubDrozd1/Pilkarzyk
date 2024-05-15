export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event: any) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        let scale = 1
        if (img.width > 300 || img.height > 300) {
          scale = Math.min(300 / img.width, 300 / img.height)
        }
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        const base64String = canvas.toDataURL('image/jpeg').split(',')[1]
        resolve(base64String)
      }
      img.onerror = (error) => {
        reject(error)
      }
    }
    reader.readAsDataURL(file)
  })
}
