import { useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '../store/cart'

export default function FloatingCartButton() {
  const { items, openCart } = useCartStore()
  const location = useLocation()
  const navigate = useNavigate()

  // Não mostrar em páginas de autenticação
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')
  if (isAuthPage || isAdminPage) return null

  const count = items.reduce((n, i) => n + i.qty, 0)

  const onServicesPage = location.pathname === '/'

  function handleClick() {
    if (onServicesPage) {
      openCart()
      // Tentar rolar até o final para visualizar o card do carrinho
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } else {
      navigate('/schedule')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleClick}
        className="relative h-14 w-14 rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand flex items-center justify-center"
        title="Carrinho"
        aria-label="Abrir carrinho"
      >
        <ShoppingCart className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-brand text-xs font-semibold rounded-full px-1.5 shadow">
            {count}
          </span>
        )}
      </button>
    </div>
  )
}