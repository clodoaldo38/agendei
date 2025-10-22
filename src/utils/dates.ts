import dayjs from 'dayjs'

export function nextSevenDays() {
  const today = dayjs().startOf('day')
  return Array.from({ length: 7 }, (_, i) => today.add(i, 'day'))
}

export function hourlySlots(startHour: number, endHour: number) {
  // Gera slots de hora em hora (ex.: 9,10,...,18)
  if (endHour < startHour) return []
  return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
}

export function nextDays(count: number) {
  const today = dayjs().startOf('day')
  return Array.from({ length: count }, (_, i) => today.add(i, 'day'))
}

// Verifica se um slot deve estar desabilitado considerando ocupação/bloqueio e tolerância da hora atual
export type SlotAvailabilityInput = {
  nowIso: string
  nowHour: number
  nowMinute: number
  cutoffMin: number
  dateIso: string
  hour: number
  occupied?: boolean
  blockedByAdmin?: boolean
}

export function isSlotDisabled(input: SlotAvailabilityInput): boolean {
  const { nowIso, nowHour, nowMinute, cutoffMin, dateIso, hour, occupied, blockedByAdmin } = input
  if (occupied) return true
  if (blockedByAdmin) return true
  // Em dias futuros, não penaliza pelo horário atual
  if (dateIso !== nowIso) return false
  // Hoje: horas anteriores ficam indisponíveis
  if (hour < nowHour) return true
  // Hoje: a hora atual expira após cutoffMin minutos
  if (hour === nowHour && nowMinute >= (cutoffMin ?? 0)) return true
  return false
}