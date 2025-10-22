import { create } from 'zustand'
import type { CartLine } from './cart'

export type Appointment = {
  id: string
  dateIso: string // YYYY-MM-DD
  hour: number // 0-23
  items: CartLine[]
  total: number
  customerName?: string
  customerPhone?: string
  createdAt: string
}

const LS_KEY = 'agendei_appointments'

type AppointmentsState = {
  appointments: Appointment[]
  load: () => void
  save: () => void
  isOccupied: (dateIso: string, hour: number) => boolean
  add: (data: Omit<Appointment, 'id' | 'createdAt'>) => Appointment | null
  clearAll: () => void
}

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: [],
  load: () => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        set({ appointments: Array.isArray(parsed) ? parsed : [] })
      } catch {
        // ignore parse error
      }
    }
  },
  save: () => {
    localStorage.setItem(LS_KEY, JSON.stringify(get().appointments))
  },
  isOccupied: (dateIso, hour) => {
    return get().appointments.some((a) => a.dateIso === dateIso && a.hour === hour)
  },
  add: (data) => {
    // prevent duplicate if occupied
    if (get().isOccupied(data.dateIso, data.hour)) return null
    const id = `${data.dateIso}-${String(data.hour).padStart(2, '0')}-${Date.now()}`
    const appt: Appointment = {
      id,
      createdAt: new Date().toISOString(),
      ...data,
    }
    set((s) => {
      const next = [...s.appointments, appt]
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return { appointments: next }
    })
    return appt
  },
  clearAll: () => set({ appointments: [] }),
}))