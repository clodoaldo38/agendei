import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import BrandHeader from '../components/ui/BrandHeader'
import { useSettingsStore } from '../store/settings'
import { buildWhatsAppLink, isValidWhatsappNumber } from '../utils/whatsapp'

export default function ForgotPassword() {
  const { settings } = useSettingsStore()
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email')

  // Email flow
  const [email, setEmail] = useState('')
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  const [emailError, setEmailError] = useState<string | undefined>()
  const [emailSuccess, setEmailSuccess] = useState(false)

  // WhatsApp flow
  const [phone, setPhone] = useState('')
  const [waError, setWaError] = useState<string | undefined>()
  const [otp, setOtp] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [codeVerified, setCodeVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [waSuccess, setWaSuccess] = useState(false)
  // força da senha (igual ao Register)
  const pwdLength = password.length >= 8
  const pwdUpper = /[A-Z]/.test(password)
  const pwdLower = /[a-z]/.test(password)
  const pwdNumber = /\d/.test(password)
  const pwdSpecial = /[^A-Za-z0-9]/.test(password)
  const pwdScore = [pwdLength, pwdUpper, pwdLower, pwdNumber, pwdSpecial].filter(Boolean).length
  const passwordValid = pwdScore === 5
  const confirmValid = confirmPassword.length > 0 && confirmPassword === password

  function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!emailRegex.test(email)) {
      setEmailError('Informe um e-mail válido.')
      setEmailSuccess(false)
      return
    }
    setEmailError(undefined)
    setEmailSuccess(true)
  }

  function sendCodeViaWhatsApp(e: React.FormEvent) {
    e.preventDefault()
    const valid = isValidWhatsappNumber(phone)
    if (!valid) {
      setWaError('Informe um telefone válido com DDI/DDD (10-15 dígitos).')
      return
    }
    setWaError(undefined)
    const code = String(Math.floor(100000 + Math.random() * 900000)) // 6 dígitos
    setOtp(code)
    setCodeVerified(false)
    setWaSuccess(false)

    const msg = `Recuperação de senha — código: ${code}. Associe ao número ${phone}.`
    // Abre chat com o WhatsApp do estabelecimento para registro do pedido
    const url = buildWhatsAppLink(settings.phone, msg)
    window.open(url, '_blank')
  }

  function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!otp) {
      setWaError('Primeiro envie o código pelo WhatsApp.')
      return
    }
    if (codeInput.trim() !== otp) {
      setWaError('Código incorreto. Verifique e tente novamente.')
      setCodeVerified(false)
      return
    }
    setWaError(undefined)
    setCodeVerified(true)
  }

  function setNewPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordValid) {
      setWaError('A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.')
      return
    }
    if (!confirmValid) {
      setWaError('A confirmação deve ser igual à nova senha.')
      return
    }
    setWaError(undefined)
    setWaSuccess(true)
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="w-full max-w-md mb-4">
        <BrandHeader />
      </div>
      <Card className="w-full max-w-md" title="Recuperar senha" subtitle="Escolha o método: e-mail ou WhatsApp.">
        <div className="flex gap-2 mb-3">
          <Button variant={method === 'email' ? 'primary' : 'outline'} onClick={() => setMethod('email')}>Via e-mail</Button>
          <Button variant={method === 'whatsapp' ? 'whatsapp' : 'outline'} onClick={() => setMethod('whatsapp')}>Via WhatsApp</Button>
        </div>

        {method === 'email' ? (
          <form className="grid gap-3" onSubmit={onSubmitEmail}>
            <label className="grid gap-1">
              <span className="text-sm">E-mail</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!emailError} className={emailError ? 'border-red-500' : ''} />
              {email.length === 0 && <span className="text-xs text-slate-500">Preencha o e-mail para continuar.</span>}
              {emailError && <span className="text-xs text-red-600">{emailError}</span>}
            </label>
            <Button type="submit" disabled={!emailRegex.test(email)}>Enviar</Button>
            {emailSuccess && (
              <p className="mt-3 text-sm text-green-700">Se existir uma conta com este e-mail, enviaremos instruções de recuperação.</p>
            )}
          </form>
        ) : (
          <div className="grid gap-4">
            <form className="grid gap-3" onSubmit={sendCodeViaWhatsApp}>
              <label className="grid gap-1">
                <span className="text-sm">Telefone (WhatsApp)</span>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!waError && phone.length > 0} className={waError && phone.length > 0 ? 'border-red-500' : ''} placeholder="Ex.: 5531999999999" />
                <span className="text-xs text-slate-500">Use DDI+DDD+Número, apenas dígitos.</span>
                {waError && !otp && <span className="text-xs text-red-600">{waError}</span>}
              </label>
              <Button type="submit" variant="whatsapp" disabled={!isValidWhatsappNumber(phone)}>Enviar código via WhatsApp</Button>
              {otp && (
                <p className="text-xs text-slate-600">Código gerado: <span className="font-mono">{otp}</span> — registramos o pedido com o WhatsApp do estabelecimento.</p>
              )}
            </form>

            <form className="grid gap-3" onSubmit={verifyCode}>
              <label className="grid gap-1">
                <span className="text-sm">Código recebido</span>
                <Input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} disabled={!otp} aria-disabled={!otp} />
                {!otp && <span className="text-xs text-slate-500">Preencha o telefone e envie o código para continuar.</span>}
              </label>
              <Button type="submit" variant="outline" disabled={!otp || codeInput.trim().length === 0}>Validar código</Button>
              {waError && otp && !codeVerified && <span className="text-xs text-red-600">{waError}</span>}
              {codeVerified && <span className="text-xs text-green-700">Código validado com sucesso.</span>}
            </form>

            <form className="grid gap-3" onSubmit={setNewPassword}>
              <label className="grid gap-1">
                <span className="text-sm">Nova senha</span>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!passwordValid && password.length > 0} className={!passwordValid && password.length > 0 ? 'border-red-500' : ''} disabled={!codeVerified} aria-disabled={!codeVerified} />
                {!codeVerified && <span className="text-xs text-slate-500">Valide o código para habilitar este campo.</span>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs">Força da senha: {pwdScore <= 2 ? 'Fraca' : pwdScore <= 4 ? 'Média' : 'Forte'}</span>
                  <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 ${pwdScore <= 2 ? 'bg-red-500' : pwdScore <= 4 ? 'bg-yellow-500' : 'bg-green-600'}`}
                      style={{ width: `${(pwdScore / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <ul className="mt-2 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  <li className={pwdLength ? 'text-green-700' : 'text-slate-600'}>{pwdLength ? '✓' : '✗'} Mínimo de 8 caracteres</li>
                  <li className={pwdUpper ? 'text-green-700' : 'text-slate-600'}>{pwdUpper ? '✓' : '✗'} Uma letra maiúscula</li>
                  <li className={pwdLower ? 'text-green-700' : 'text-slate-600'}>{pwdLower ? '✓' : '✗'} Uma letra minúscula</li>
                  <li className={pwdNumber ? 'text-green-700' : 'text-slate-600'}>{pwdNumber ? '✓' : '✗'} Um número</li>
                  <li className={pwdSpecial ? 'text-green-700' : 'text-slate-600'}>{pwdSpecial ? '✓' : '✗'} Um caractere especial (#, !, @, ...)</li>
                </ul>
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Confirmar nova senha</span>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} aria-invalid={!confirmValid && confirmPassword.length > 0} className={!confirmValid && confirmPassword.length > 0 ? 'border-red-500' : ''} disabled={!codeVerified || password.length === 0} aria-disabled={!codeVerified || password.length === 0} />
                {!codeVerified && <span className="text-xs text-slate-500">Valide o código para habilitar este campo.</span>}
                {codeVerified && password.length === 0 && <span className="text-xs text-slate-500">Preencha a nova senha para continuar.</span>}
              </label>
              <Button type="submit" disabled={!codeVerified || !passwordValid || !confirmValid}>Definir nova senha</Button>
              {waError && codeVerified && !waSuccess && <span className="text-xs text-red-600">{waError}</span>}
              {waSuccess && (
                <p className="text-sm text-green-700">Senha redefinida. Em ambiente real, este passo persistiria no backend.</p>
              )}
            </form>
          </div>
        )}
        <div className="mt-4 text-sm">
          <Link to="/login" className="text-brand">Voltar ao login</Link>
        </div>
      </Card>
    </div>
  )
}