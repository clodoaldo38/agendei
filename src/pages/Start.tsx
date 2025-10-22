import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'

export default function Start() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { items, clear } = useCartStore()

  function resetFlow() {
    logout()
    clear()
  }

  return (
    <div className="max-w-container mx-auto p-4 grid gap-6">
      <h1 className="text-2xl font-semibold">Fluxo de teste sequencial</h1>
      <p className="text-sm text-slate-600">Siga os passos para criar conta, fazer login, revisar perfil (opcional), escolher serviços e agendar — começando por este único link.</p>

      <Card title="Status atual">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div><span className="font-medium">Usuário:</span> {user ? `${user.name} (${user.email})` : 'não autenticado'}</div>
            <div><span className="font-medium">Itens no carrinho:</span> {items.length}</div>
          </div>
          <Button variant="outline" onClick={resetFlow}>Resetar fluxo</Button>
        </div>
      </Card>

      <Card title="Passo 1" subtitle="Criar sua conta">
        <p className="text-sm text-slate-600 mb-3">Abra a tela de cadastro e preencha seus dados.</p>
        <Button onClick={() => navigate('/register')}>Ir para Cadastro</Button>
      </Card>

      <Card title="Passo 2" subtitle="Fazer login">
        <p className="text-sm text-slate-600 mb-3">Informe suas credenciais para entrar.</p>
        <Button onClick={() => navigate('/login')}>Ir para Login</Button>
      </Card>

      <Card title="Passo 3 (opcional)" subtitle="Ver e editar seu perfil">
        <p className="text-sm text-slate-600 mb-3">Ajuste seus dados e foto, se desejar.</p>
        <Button onClick={() => navigate('/profile')}>Ir para Perfil</Button>
      </Card>

      <Card title="Passo 4" subtitle="Escolher serviços">
        <p className="text-sm text-slate-600 mb-3">Selecione os serviços desejados e adicione ao carrinho.</p>
        <Button onClick={() => navigate('/')}>Abrir Serviços</Button>
      </Card>

      <Card title="Passo 5" subtitle="Efetuar agendamento">
        <p className="text-sm text-slate-600 mb-3">Escolha a data e horário e confirme pelo WhatsApp.</p>
        <Button onClick={() => navigate('/schedule')}>Ir para Agendar</Button>
      </Card>
    </div>
  )
}