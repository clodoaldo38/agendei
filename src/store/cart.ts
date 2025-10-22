import { create } from 'zustand'

export type ServiceItem = {
  id: string
  name: string
  price: number
}

export type CartLine = ServiceItem & { qty: number }

type CartState = {
  items: CartLine[]
  add: (item: ServiceItem) => void
  increase: (id: string) => void
  decrease: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (item) => set((s) => {
    const idx = s.items.findIndex((i) => i.id === item.id)
    if (idx >= 0) {
      const next = [...s.items]
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
      return { items: next }
    }
    return { items: [...s.items, { ...item, qty: 1 }] }
  }),
  increase: (id) => set((s) => ({
    items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
  })),
  decrease: (id) => set((s) => ({
    items: s.items
      .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
      .filter((i) => i.qty > 0),
  })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}))