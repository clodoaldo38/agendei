import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'
import { useProfileStore } from '../store/profile'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import BrandHeader from '../components/ui/BrandHeader'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const prevUser = useAuthStore((s) => s.user)
  const { reset } = useProfileStore()
  const { settings } = useSettingsStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  const isValid = emailRegex.test(email) && password.length >= 6

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: { email?: string; password?: string } = {}
    if (!emailRegex.test(email)) nextErrors.email = 'Informe um e-mail válido.'
    if (password.length < 6) nextErrors.password = 'A senha deve ter ao menos 6 caracteres.'
    
    // Verificar se é tentativa de login de admin
    const isAdminEmail = email.trim().toLowerCase() === 'admin@agendei.com'
    if (isAdminEmail && password !== settings.adminPassword) {
      nextErrors.password = 'Senha incorreta para o administrador.'
    }
    
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    
    // Login bem-sucedido
    const isAdmin = isAdminEmail

    // Se o e-mail mudou em relação ao usuário atual, limpar perfil salvo
    const isDifferentUser = (prevUser?.email || '').toLowerCase() !== email.trim().toLowerCase()
    if (isDifferentUser) {
      reset()
    }

    login({ name: isAdmin ? 'Admin' : 'Cliente', email, role: isAdmin ? 'admin' : 'user' })
    navigate(isAdmin ? '/admin' : '/')
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="w-full max-w-md mb-4">
        <BrandHeader />
      </div>
      <Card className="w-full max-w-md" title="Entrar">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="grid gap-1">
            <span className="text-sm">E-mail</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} className={errors.email ? 'border-red-500' : ''} required />
            {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Senha</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} className={errors.password ? 'border-red-500' : ''} required />
            {errors.password && <span className="text-xs text-red-600">{errors.password}</span>}
          </label>
          <Button type="submit" disabled={!isValid}>Entrar</Button>
        </form>
        <div className="mt-4 text-sm flex justify-between">
          <Link to="/register" className="text-brand">Criar conta</Link>
          <Link to="/forgot-password" className="text-brand">Esqueci minha senha</Link>
        </div>
      </Card>
    </div>
  )
}