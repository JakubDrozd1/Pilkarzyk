export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event: any) => {
      if (file.type === 'image/gif') {
        resolve(event.target.result.split(',')[1])
      } else {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = 200
          canvas.height = 200
          ctx?.drawImage(img, 0, 0, 200, 200)
          const base64String = canvas.toDataURL('image/jpeg').split(',')[1]
          resolve(base64String)
        }
        img.onerror = (error) => {
          reject(error)
        }
      }
    }
    reader.readAsDataURL(file)
  })
}
