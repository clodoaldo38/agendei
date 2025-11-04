import { useEffect, useState } from 'react'
import { useCartStore } from '../store/cart'
import { useSettingsStore } from '../store/settings'
import { nextDays, hourlySlots, isSlotDisabled } from '../utils/dates'
import { buildWhatsAppLink, isValidWhatsappNumber } from '../utils/whatsapp'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAppointmentsStore } from '../store/appointments'
import { useProfileStore } from '../store/profile'
import { useAuthStore } from '../store/auth'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

export default function Schedule() {
  const navigate = useNavigate()
  const { settings } = useSettingsStore()
  const days = nextDays(settings.daysAhead)
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const hours = hourlySlots(settings.openingHourStart, settings.openingHourEnd)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const { items, clear } = useCartStore()
  const { load: loadProfile, profile } = useProfileStore()
  const { load: loadAppointments, isOccupied, add } = useAppointmentsStore()
  const user = useAuthStore((s) => s.user)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmForm, setShowConfirmForm] = useState(false)
  const [customerName, setCustomerName] = useState<string>('')
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; phone: boolean }>({ name: false, email: false, phone: false })

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  useEffect(() => {
    loadAppointments()
    loadProfile()
  }, [loadAppointments, loadProfile])

  // Ao entrar na página de agendamento, garantir que a rolagem vá para o topo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const nowIso = dayjs().format('YYYY-MM-DD')
  const nowHour = dayjs().hour()
  const nowMinute = dayjs().minute()

  // Pré-preencher com dados de perfil e usuário logado
  useEffect(() => {
    setCustomerName((prev) => prev || profile.name || '')
    setCustomerPhone((prev) => prev || profile.phone || '')
    setCustomerEmail((prev) => prev || user?.email || '')
  }, [profile.name, profile.phone, user?.email])

  function validateFields() {
    const errors: { name?: string; email?: string; phone?: string } = {}
    if (!customerName.trim()) errors.name = 'Informe seu nome.'
    const email = customerEmail.trim()
    if (!email) errors.email = 'Informe seu e-mail.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'E-mail inválido.'
    const phoneDigits = customerPhone.replace(/\D/g, '')
    if (!phoneDigits) errors.phone = 'Informe seu WhatsApp.'
    else if (phoneDigits.length < 10 || phoneDigits.length > 15) errors.phone = 'Telefone inválido (use DDI+DDD+Número).'
    return errors
  }

  function openConfirmForm() {
    if (selectedHour == null || items.length === 0) return
    const iso = days[selectedDay].format('YYYY-MM-DD')
    const cutoff = settings.currentHourCutoffMin ?? 0
    if (iso === nowIso && (selectedHour < nowHour || (selectedHour === nowHour && nowMinute >= cutoff))) {
      setError('Horário já passou. Escolha outro.')
      return
    }
    if (isOccupied(iso, selectedHour)) {
      setError('Horário já ocupado. Escolha outro.')
      return
    }
    // Prefill com dados do perfil, se existirem
    setCustomerName(profile.name || '')
    setCustomerEmail(user?.email || '')
    setCustomerPhone(profile.phone || '')
    setShowConfirmForm(true)
    setError(null)
    // Rolagem suave para o card de confirmação
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 50)
  }

  return (
    <div className="max-w-container mx-auto p-4 pb-24">
      <h1 className="text-2xl font-semibold mb-4">Agendamento</h1>

      <Card className="mb-6 bg-amber-50 border-amber-200 text-amber-900" title="Informações de horário">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold mt-0.5" aria-hidden="true">i</span>
          <div className="text-sm">
            <p>
              Nosso horário de fechamento é às {String(settings.openingHourEnd).padStart(2, '0')}:00.
            </p>
            <p className="mt-1 text-amber-800">
              No dia de hoje, horários anteriores à hora atual ficam indisponíveis. O horário da hora atual expira após {settings.currentHourCutoffMin} min.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Escolha a data e Agende o seu horário !">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {days.map((d, idx) => {
              const iso = d.format('YYYY-MM-DD')
              const blocked = settings.blockedDates.includes(iso)
              return (
                <Button
                  key={idx}
                  variant={blocked ? 'outline' : idx === selectedDay ? 'primary' : 'outline'}
                  className={`px-3 py-2 ${blocked ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={() => setSelectedDay(idx)}
                >
                  {d.format('DD/MM')}
                </Button>
              )
            })}
          </div>
        </Card>

        <Card title="Horários disponíveis">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {hours.map((h) => {
              const iso = days[selectedDay].format('YYYY-MM-DD')
              const occupied = isOccupied(iso, h)
              const blockedByAdmin = (settings.blockedHours?.[iso] || []).includes(h)
              const disabled = isSlotDisabled({
                nowIso,
                nowHour,
                nowMinute,
                cutoffMin: settings.currentHourCutoffMin ?? 0,
                dateIso: iso,
                hour: h,
                occupied,
                blockedByAdmin,
              })
              return (
                <Button
                  key={h}
                  variant={selectedHour === h ? 'primary' : 'outline'}
                  className={`px-3 py-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                  disabled={disabled}
                  onClick={() => { setSelectedHour(h); setError(null) }}
                >
                  {String(h).padStart(2, '0')}:00
                </Button>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-6" title="Resumo">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum serviço no carrinho.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.name}</span>
                <span>R$ {(i.price * i.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium">Total: R$ {total.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm('Deseja esvaziar o carrinho e voltar para Serviços?')) {
                  clear()
                  setError(null)
                  navigate('/')
                }
              }}
              disabled={items.length === 0}
              className="px-3 py-1.5 text-xs leading-tight bg-black text-white hover:bg-black/90 border-transparent"
            >
              Esvaziar carrinho
            </Button>
            <Button
              disabled={(() => {
                if (selectedHour == null || items.length === 0) return true
                const iso = days[selectedDay].format('YYYY-MM-DD')
                const disabledSlot = isSlotDisabled({
                  nowIso,
                  nowHour,
                  nowMinute,
                  cutoffMin: settings.currentHourCutoffMin ?? 0,
                  dateIso: iso,
                  hour: selectedHour,
                  occupied: isOccupied(iso, selectedHour),
                  blockedByAdmin: (settings.blockedHours?.[iso] || []).includes(selectedHour),
                })
                return disabledSlot
              })()}
              onClick={openConfirmForm}
              className="px-3 py-1.5 text-xs leading-tight"
            >
              Confirmar agendamento
            </Button>
          </div>
          {error && (
            <span className="ml-3 text-xs text-red-600">{error}</span>
          )}
        </div>
      </Card>

      {showConfirmForm && (
        <Card className="mt-6" title="Confirmar dados do agendamento">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Nome</span>
              <Input
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                  if (touched.name) setFieldErrors((prev) => ({ ...prev, name: e.target.value.trim() ? undefined : 'Informe seu nome.' }))
                }}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Seu nome completo"
                className={fieldErrors.name && touched.name ? 'border-red-500' : ''}
              />
              {fieldErrors.name && touched.name && (
                <span className="text-xs text-red-600">{fieldErrors.name}</span>
              )}
            </label>
            <label className="grid gap-1">
              <span className="text-sm">E-mail</span>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value)
                  if (touched.email) {
                    const val = e.target.value.trim()
                    const err = !val ? 'Informe seu e-mail.' : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? undefined : 'E-mail inválido.')
                    setFieldErrors((prev) => ({ ...prev, email: err }))
                  }
                }}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="seu@email.com"
                className={fieldErrors.email && touched.email ? 'border-red-500' : ''}
              />
              {fieldErrors.email && touched.email && (
                <span className="text-xs text-red-600">{fieldErrors.email}</span>
              )}
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Telefone (WhatsApp)</span>
              <Input
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value)
                  if (touched.phone) {
                    const digits = e.target.value.replace(/\D/g, '')
                    const err = !digits ? 'Informe seu WhatsApp.' : (digits.length < 10 || digits.length > 15 ? 'Telefone inválido (use DDI+DDD+Número).' : undefined)
                    setFieldErrors((prev) => ({ ...prev, phone: err }))
                  }
                }}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="(DDD) 99999-9999"
                className={fieldErrors.phone && touched.phone ? 'border-red-500' : ''}
              />
              {fieldErrors.phone && touched.phone && (
                <span className="text-xs text-red-600">{fieldErrors.phone}</span>
              )}
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmForm(false)}
            >
              Voltar
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmForm(false)}
            >
              Fechar
            </Button>
            <Button
              variant="whatsapp"
              disabled={(() => {
                const hasBasics = customerName.trim().length > 0 && customerEmail.trim().length > 0 && customerPhone.trim().length > 0
                if (!hasBasics) return true
                // Precisa do WhatsApp do estabelecimento configurado
                if (!isValidWhatsappNumber(settings.phone)) return true
                // Validar horário novamente por segurança
                if (selectedHour == null || items.length === 0) return true
                const iso = days[selectedDay].format('YYYY-MM-DD')
                const disabledSlot = isSlotDisabled({
                  nowIso,
                  nowHour,
                  nowMinute,
                  cutoffMin: settings.currentHourCutoffMin ?? 0,
                  dateIso: iso,
                  hour: selectedHour,
                  occupied: isOccupied(iso, selectedHour),
                  blockedByAdmin: (settings.blockedHours?.[iso] || []).includes(selectedHour),
                })
                return disabledSlot
              })()}
              onClick={() => {
                if (selectedHour == null) return
                const errors = validateFields()
                if (errors.name || errors.email || errors.phone) {
                  setTouched({ name: true, email: true, phone: true })
                  setFieldErrors(errors)
                  return
                }
                const dateStr = days[selectedDay].format('DD/MM/YYYY')
                const hourStr = `${String(selectedHour).padStart(2, '0')}:00`
                const iso = days[selectedDay].format('YYYY-MM-DD')
                const serviceLines = items.map((i) => {
                  const qtyText = i.qty > 1 ? ` (x${i.qty})` : ''
                  return `• ${i.name}${qtyText} - R$ ${(i.price * i.qty).toFixed(2)}`
                })
                const message = [
                  `Olá! Quero confirmar meu agendamento no ${settings.salonName}.`,
                  `• Data: ${dateStr}`,
                  `• Horário: ${hourStr}`,
                  '',
                  `• Nome: ${customerName}`,
                  `• Telefone: ${customerPhone}`,
                  `• E-mail: ${customerEmail}`,
                  '',
                  '• Serviços:',
                  ...serviceLines,
                  `• Total: R$ ${total.toFixed(2)}`,
                ].join('\n')
                const url = buildWhatsAppLink(settings.phone, message)
                // Persistir dados no perfil
                try {
                  // Atualiza e salva perfil com nome/telefone/e-mail
                  useProfileStore.getState().update({ name: customerName, phone: customerPhone, email: customerEmail })
                  useProfileStore.getState().save()
                } catch {}
                window.open(url, '_blank')
                add({ dateIso: iso, hour: selectedHour, items, total, customerName, customerPhone })
                clear()
                setShowConfirmForm(false)
                setError(null)
              }}
              className="px-3 py-1.5 text-xs leading-tight"
            >
              Agendar WhatsApp
            </Button>
          </div>
          {!isValidWhatsappNumber(settings.phone) && (
            <div className="mt-2 text-xs text-red-600">Configure o WhatsApp do estabelecimento no painel Admin.</div>
          )}
        </Card>
      )}
    </div>
  )
}