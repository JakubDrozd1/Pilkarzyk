import { GetMessagesUsersMeetingsResponse } from 'libs/api-client'

export function convertBase64ToFile(base64String: string): Promise<File> {
  return new Promise((resolve) => {
    const byteCharacters = atob(base64String)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    resolve(file)
  })
}

export async function convertStringsToImages(
  stringArray: GetMessagesUsersMeetingsResponse[]
) {
  const images = []

  for (let str of stringArray) {
    if (str.Avatar !== null) {
      const file = await convertBase64ToFile(str.Avatar ?? '')
      const reader = new FileReader()
      reader.onload = () => {
        images.push(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      images.push(null)
    }
  }

  return images
}
