import { create } from 'zustand'

type User = {
  name: string
  email: string
  role: 'user' | 'admin' | 'developer'
}

type AuthState = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const LS_KEY = 'agendei_auth'

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw) as User
    } catch { /* ignore */ }
    return null
  })(),
  login: (user) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(user)) } catch { /* ignore */ }
    set({ user })
  },
  logout: () => {
    try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
    set({ user: null })
  },
}))