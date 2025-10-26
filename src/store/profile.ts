import { create } from 'zustand'

export type Profile = {
  name: string
  phone: string
  photoUrl?: string
}

const LS_KEY = 'agendei_profile'

type ProfileState = {
  profile: Profile
  update: (patch: Partial<Profile>) => void
  load: () => void
  save: () => void
  clearPhoto: () => void
  reset: () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: { name: '', phone: '' },
  update: (patch) => set({ profile: { ...get().profile, ...patch } }),
  load: () => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) set({ profile: JSON.parse(raw) })
  },
  save: () => {
    localStorage.setItem(LS_KEY, JSON.stringify(get().profile))
  },
  clearPhoto: () => set({ profile: { ...get().profile, photoUrl: undefined } }),
  reset: () => {
    try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
    set({ profile: { name: '', phone: '' } })
  },
}))