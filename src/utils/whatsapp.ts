
export function buildWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '')
  const text = encodeURIComponent(message)
  // Use o endpoint api.whatsapp.com para reduzir incidência de HTTP 429 (rate limit)
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`
}

export function isValidWhatsappNumber(phone: string) {
  const clean = phone.replace(/\D/g, '')
  // E.164 permite até 15 dígitos. Consideramos válido com DDI e ao menos 10 dígitos.
  return clean.length >= 10 && clean.length <= 15
}