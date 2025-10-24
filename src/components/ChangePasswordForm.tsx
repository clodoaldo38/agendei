import { useState } from 'react'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import { useSettingsStore } from '../store/settings'
import PasswordStrengthHints from './ui/PasswordStrengthHints'

export default function ChangePasswordForm() {
  const { settings, update, save } = useSettingsStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({})
  const [success, setSuccess] = useState(false)

  // Validação da força da senha (igual ao Register e ForgotPassword)
  const pwdLength = newPassword.length >= 8
  const pwdUpper = /[A-Z]/.test(newPassword)
  const pwdLower = /[a-z]/.test(newPassword)
  const pwdNumber = /\d/.test(newPassword)
  const pwdSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const pwdScore = [pwdLength, pwdUpper, pwdLower, pwdNumber, pwdSpecial].filter(Boolean).length
  const newPasswordValid = pwdScore === 5
  const confirmValid = confirmPassword.length > 0 && confirmPassword === newPassword

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const nextErrors: { current?: string; new?: string; confirm?: string } = {}
    
    // Validar senha atual
    if (currentPassword !== settings.adminPassword) {
      nextErrors.current = 'Senha atual incorreta.'
    }
    
    // Validar nova senha
    if (!newPasswordValid) {
      nextErrors.new = 'A nova senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.'
    }
    
    // Validar confirmação
    if (!confirmValid) {
      nextErrors.confirm = 'A confirmação deve ser igual à nova senha.'
    }
    
    // Verificar se a nova senha é diferente da atual
    if (newPassword === currentPassword) {
      nextErrors.new = 'A nova senha deve ser diferente da senha atual.'
    }
    
    setErrors(nextErrors)
    
    if (Object.keys(nextErrors).length === 0) {
      // Atualizar a senha
      update({ adminPassword: newPassword })
      save()
      
      // Limpar campos e mostrar sucesso
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <Card title="Alterar Senha do Administrador" subtitle="Defina uma nova senha para acessar o painel administrativo.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Senha atual</span>
            <Input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-invalid={!!errors.current}
              className={errors.current ? 'border-red-500' : ''}
              required 
            />
            {errors.current && <span className="text-xs text-red-600">{errors.current}</span>}
          </label>
        </div>

        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Nova senha</span>
            <Input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={!!errors.new}
              className={errors.new ? 'border-red-500' : ''}
              required 
            />
            {newPassword.length > 0 && (
              <PasswordStrengthHints password={newPassword} />
            )}
            {errors.new && <span className="text-xs text-red-600">{errors.new}</span>}
          </label>
        </div>

        <div className="grid gap-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Confirmar nova senha</span>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirm}
              className={errors.confirm ? 'border-red-500' : ''}
              disabled={newPassword.length === 0}
              required 
            />
            {errors.confirm && <span className="text-xs text-red-600">{errors.confirm}</span>}
            {!confirmValid && confirmPassword.length > 0 && !errors.confirm && (
              <span className="text-xs text-red-600">As senhas não coincidem.</span>
            )}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            type="submit" 
            disabled={!currentPassword || !newPasswordValid || !confirmValid}
          >
            Alterar Senha
          </Button>
          {success && <span className="text-sm text-green-600">Senha alterada com sucesso!</span>}
        </div>
      </form>
    </Card>
  )
}