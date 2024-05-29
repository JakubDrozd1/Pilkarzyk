export function getLocalISOString(date: Date) {
  const offset = date.getTimezoneOffset()
  const offsetAbs = Math.abs(offset)
  const isoString = new Date(date.getTime() - offset * 60 * 1000).toISOString()
  return `${isoString.slice(0, -1)}${offset > 0 ? '-' : '+'}${String(
    Math.floor(offsetAbs / 60)
  ).padStart(2, '0')}:${String(offsetAbs % 60).padStart(2, '0')}`
}
export function convertStringToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  let convertedTime = hours * 60 + minutes
  return convertedTime
}

export function convertMinutesToString(time: number) {
  const hours = Math.floor(time / 60)
  const remainingMinutes = time % 60
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`
}
