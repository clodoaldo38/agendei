import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart } from 'lucide-react'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'
import PartnerBannerStrip from './PartnerBannerStrip'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { items } = useCartStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { settings } = useSettingsStore()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')
  if (isAuthPage) return null

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-sm">
      <div className="max-w-container mx-auto px-4 min-h-28 py-2 flex items-center justify-between">
        {isAdminPage ? (
          <div className="cursor-default select-none">
            {settings.logoUrl ? (
              <div className="flex flex-col items-center leading-tight">
                <img src={settings.logoUrl} alt="Logo" className="h-24 w-24 rounded-full object-cover ring-2 ring-brand/50 border-2 border-brand shadow-sm" />
                {settings.salonName && (
                  <span className="mt-1 text-sm text-brand">{settings.salonName}</span>
                )}
              </div>
            ) : (
              <span className="font-semibold text-brand text-xl">{settings.salonName}</span>
            )}
          </div>
        ) : (
          <Link to="/" className="cursor-pointer">
            {settings.logoUrl ? (
              <div className="flex flex-col items-center leading-tight">
                <img src={settings.logoUrl} alt="Logo" className="h-24 w-24 rounded-full object-cover ring-2 ring-brand/50 border-2 border-brand shadow-sm" />
                {settings.salonName && (
                  <span className="mt-1 text-sm text-brand">{settings.salonName}</span>
                )}
              </div>
            ) : (
              <span className="font-semibold text-brand text-xl">{settings.salonName}</span>
            )}
          </Link>
        )}
        <nav className="hidden md:flex items-center gap-6 text-slate-700">
          {isAdminPage ? (
            <>
              {user && (
                <button onClick={handleLogout} aria-label="Sair" className="px-3 py-1.5 rounded-full bg-brand text-white shadow-sm hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light transition-colors">Sair</button>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-brand">Serviços</Link>
              <Link to="/schedule" className="hover:text-brand">Agendar</Link>
              <Link to="/profile" className="hover:text-brand">Perfil</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-brand">Admin</Link>
              )}
              <Link to="/schedule" className="relative hover:text-brand" title="Carrinho">
                <ShoppingCart />
                {items.reduce((n, i) => n + i.qty, 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand text-white text-xs rounded-full px-1">
                    {items.reduce((n, i) => n + i.qty, 0)}
                  </span>
                )}
              </Link>
              {user ? (
                <button onClick={handleLogout} aria-label="Sair" className="px-3 py-1.5 rounded-full bg-brand text-white shadow-sm hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light transition-colors">Sair</button>
              ) : (
                <Link to="/login" className="hover:text-brand">Entrar</Link>
              )}
            </>
          )}
        </nav>
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          <Menu />
        </button>
      </div>
      <PartnerBannerStrip />
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="max-w-container mx-auto px-4 py-2 flex flex-col gap-2">
            {isAdminPage ? (
              <>
                {user && (
                  <button
                    onClick={() => {
                      setOpen(false)
                      handleLogout()
                    }}
                    className="px-3 py-2 rounded-full bg-brand text-white shadow-sm hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light transition-colors text-left"
                  >
                    Sair
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setOpen(false)} className="py-2">Serviços</Link>
                <Link to="/schedule" onClick={() => setOpen(false)} className="py-2">Agendar</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="py-2">Perfil</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="py-2">Admin</Link>
                )}
                <Link to="/schedule" onClick={() => setOpen(false)} className="py-2 flex items-center gap-2">
                  <ShoppingCart />
                  Carrinho ({items.length})
                </Link>
                {user ? (
                  <button
                    onClick={() => {
                      setOpen(false)
                      handleLogout()
                    }}
                    className="px-3 py-2 rounded-full bg-brand text-white shadow-sm hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light transition-colors text-left"
                  >
                    Sair
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="py-2">Entrar</Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}