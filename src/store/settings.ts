import { create } from 'zustand'
import type { ServiceItem } from './cart'

export type PartnerBanner = {
  id: string
  imageUrl: string
  href?: string
  displayMode?: 'contain' | 'cover'
}

type Settings = {
  salonName: string
  phone: string
  logoUrl?: string
  openingHourStart: number // 24h format, e.g., 9
  openingHourEnd: number   // e.g., 18
  daysAhead: number        // how many days forward to show in agenda
  blockedDates: string[]   // dates in 'YYYY-MM-DD' disabled in agenda
  blockedHours?: Record<string, number[]> // map dateIso -> list of blocked hours
  services: ServiceItem[]  // catalog of services
  partnerBanners: PartnerBanner[] // partner banners managed via Admin
  partnerBannerIntervalMs: number // auto-slide interval for partner banners
  currentHourCutoffMin: number // minutes after current hour starts to block it (0-59)
  adminPassword: string // senha do administrador
}

type SettingsState = {
  settings: Settings
  update: (partial: Partial<Settings>) => void
  save: () => void
}

const defaultSettings: Settings = {
  salonName: 'Agendei',
  phone: '5599999999999',
  logoUrl: undefined,
  openingHourStart: 9,
  openingHourEnd: 18,
  daysAhead: 7,
  blockedDates: [],
  blockedHours: {},
  services: [
    { id: 'corte-feminino', name: 'Corte Feminino', price: 60 },
    { id: 'escova', name: 'Escova', price: 50 },
    { id: 'corte-masculino', name: 'Corte Masculino', price: 40 },
    { id: 'barba', name: 'Barba', price: 30 },
    { id: 'manicure', name: 'Manicure', price: 35 },
  ],
  partnerBanners: [],
  partnerBannerIntervalMs: 5000,
  currentHourCutoffMin: 5,
  adminPassword: 'Admin123!', // senha padrão do administrador
}

const LS_KEY = 'agendei_settings'

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: (() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return { ...defaultSettings, ...JSON.parse(raw) } as Settings
    } catch { /* ignore */ }
    return defaultSettings
  })(),
  update: (partial) => set((s) => {
    const next = { ...s.settings, ...partial }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch { /* ignore */ }
    return { settings: next }
  }),
  save: () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(get().settings))
    } catch { /* ignore */ }
  },
}))