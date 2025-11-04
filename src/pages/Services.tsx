import { useCartStore } from '../store/cart'
import type { ServiceItem } from '../store/cart'
import { useSettingsStore } from '../store/settings'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'

export default function Services() {
  const { items, add, remove, increase, decrease, isOpen, closeCart } = useCartStore()
  const { settings } = useSettingsStore()
  const SERVICES: ServiceItem[] = settings.services
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
 

  return (
    <div className="max-w-container mx-auto p-4 pb-24">
      {/* Card informativo com borda animada */}
      <Card className="animated-border !border-transparent w-full mb-4 !bg-sky-50">
        <div className="text-center space-y-1 font-elegant">
          <p className="text-base md:text-lg text-slate-700">Olá, abaixo escolha os serviços desejados.</p>
          <p className="text-sm md:text-base text-slate-600">Obrigado(a) pela preferência!</p>
        </div>
      </Card>
      <h1 className="text-2xl font-semibold mb-4 text-center">Serviços</h1>
      <div className="grid grid-cols-1 gap-4">
        {SERVICES.map((s) => (
          <Card key={s.id} className="text-center w-full !bg-slate-50 !border-slate-300">
            <div className="space-y-1 md:space-y-2">
              <div className="text-base md:text-lg font-semibold">{s.name}</div>
              <div className="text-sm md:text-base text-slate-600">R$ {s.price.toFixed(2)}</div>
              <Button className="mt-4 block w-11/12 mx-auto" onClick={() => add(s)}>Adicionar</Button>
            </div>
          </Card>
        ))}
      </div>

      {isOpen && (
        <Card className="mt-6" title="Carrinho">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Itens selecionados</span>
            <Button
              variant="outline"
              className="px-3 py-1.5 text-xs leading-tight bg-black text-white hover:bg-black/90 border-transparent"
              onClick={closeCart}
              aria-label="Fechar carrinho"
            >
              Fechar
            </Button>
          </div>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 mt-2">Nenhum serviço adicionado.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between">
                <span>
                  {i.name} — R$ {(i.price * i.qty).toFixed(2)}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-7 px-2" onClick={() => decrease(i.id)}>−</Button>
                  <Button variant="outline" className="h-7 px-2" onClick={() => increase(i.id)}>+</Button>
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs leading-tight bg-black text-white hover:bg-black/90 border-transparent"
                    onClick={() => remove(i.id)}
                  >
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium">Total: R$ {total.toFixed(2)}</span>
          <Link
            to="/schedule"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`inline-flex items-center justify-center rounded-xl font-medium px-3 py-1.5 text-xs leading-tight ${items.length ? 'bg-black text-white hover:bg-black/90' : 'bg-slate-200 text-slate-500 pointer-events-none'}`}
          >
            Realizar agendamento
          </Link>
        </div>
      </Card>
      )}
    </div>
  )
}