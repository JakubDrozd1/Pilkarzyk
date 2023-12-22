export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      } else {
        console.error('Błąd konwersji pliku do base64.')
      }
    }
    reader.readAsDataURL(file)
  })
}
