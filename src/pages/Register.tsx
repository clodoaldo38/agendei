import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import BrandHeader from '../components/ui/BrandHeader'
import PasswordStrengthHints from '../components/ui/PasswordStrengthHints'
import { useAuthStore } from '../store/auth'
import { useProfileStore } from '../store/profile'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { reset, update, save } = useProfileStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  const phoneDigits = phone.replace(/\D/g, '')
  const nameValid = name.trim().length >= 2
  const emailValid = emailRegex.test(email)
  const phoneValid = phoneDigits.length >= 10

  const pwdLength = password.length >= 8
  const pwdUpper = /[A-Z]/.test(password)
  const pwdLower = /[a-z]/.test(password)
  const pwdNumber = /\d/.test(password)
  const pwdSpecial = /[^A-Za-z0-9]/.test(password)
  const pwdScore = [pwdLength, pwdUpper, pwdLower, pwdNumber, pwdSpecial].filter(Boolean).length
  const passwordValid = pwdScore === 5
  const confirmValid = confirmPassword.length > 0 && confirmPassword === password
  const isValid = nameValid && emailValid && phoneValid && passwordValid && confirmValid

  function generateStrongPassword() {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const nums = '0123456789'
    const specials = '!@#$%^&*()-_=+[]{};:,.<>?'
    function pick(str: string) { return str[Math.floor(Math.random() * str.length)] }
    const base = [pick(upper), pick(lower), pick(nums), pick(specials)]
    const all = upper + lower + nums + specials
    const targetLen = 12
    while (base.length < targetLen) base.push(pick(all))
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = base[i]; base[i] = base[j]; base[j] = tmp
    }
    const pwd = base.join('')
    setPassword(pwd)
    setConfirmPassword(pwd)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    
    // Simula cadastro e faz login automático
    const newUser = {
      name: name.trim(),
      email: email.trim(),
      role: 'user' as const
    }
    
    login(newUser)
    // Zera dados de perfil para não herdar dados do usuário anterior
    reset()
    // Preenche dados pessoais com o nome e telefone informados no cadastro
    update({ name: name.trim(), phone })
    save()
    navigate('/')
  }
  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="w-full max-w-md mb-4">
        <BrandHeader />
      </div>
      <Card className="w-full max-w-md" title="Criar conta">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="grid gap-1">
            <span className="text-sm">Nome</span>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!nameValid && name.length > 0} className={!nameValid && name.length > 0 ? 'border-red-500' : ''} required />
            {!nameValid && name.length > 0 && (
              <span className="text-xs text-red-600">Informe seu nome completo.</span>
            )}
          </label>
          <label className="grid gap-1">
            <span className="text-sm">E-mail</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!emailValid && email.length > 0} className={!emailValid && email.length > 0 ? 'border-red-500' : ''} required />
            {!emailValid && email.length > 0 && (
              <span className="text-xs text-red-600">Informe um e-mail válido.</span>
            )}
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Telefone</span>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!phoneValid && phone.length > 0} className={!phoneValid && phone.length > 0 ? 'border-red-500' : ''} required />
            {!phoneValid && phone.length > 0 && (
              <span className="text-xs text-red-600">Informe um telefone com DDD (10-11 dígitos).</span>
            )}
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Senha</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!passwordValid && password.length > 0} className={!passwordValid && password.length > 0 ? 'border-red-500' : ''} required />
            <PasswordStrengthHints password={password} />
            <div>
              <Button type="button" className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white" onClick={generateStrongPassword}>Gerar senha forte</Button>
            </div>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Confirmar senha</span>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} aria-invalid={!confirmValid && confirmPassword.length > 0} className={!confirmValid && confirmPassword.length > 0 ? 'border-red-500' : ''} required />
            {!confirmValid && confirmPassword.length > 0 && (
              <span className="text-xs text-red-600">As senhas não coincidem.</span>
            )}
          </label>
          <Button type="submit" disabled={!isValid}>Cadastrar</Button>
        </form>
        <div className="mt-4 text-sm">
          Já tem conta? <Link to="/login" className="text-brand">Entrar</Link>
        </div>
      </Card>
    </div>
  )
}