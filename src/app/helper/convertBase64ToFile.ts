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
