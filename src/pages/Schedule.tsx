import { useEffect, useState } from 'react'
import { useCartStore } from '../store/cart'
import { useSettingsStore } from '../store/settings'
import { nextDays, hourlySlots, isSlotDisabled } from '../utils/dates'
import { buildWhatsAppLink, isValidWhatsappNumber } from '../utils/whatsapp'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAppointmentsStore } from '../store/appointments'
import { useProfileStore } from '../store/profile'
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
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  useEffect(() => {
    loadAppointments()
    loadProfile()
  }, [loadAppointments, loadProfile])

  const nowIso = dayjs().format('YYYY-MM-DD')
  const nowHour = dayjs().hour()
  const nowMinute = dayjs().minute()

  function confirmAppointment() {
    if (selectedHour == null || items.length === 0) return
    if (!isValidWhatsappNumber(settings.phone)) return
    const dateStr = days[selectedDay].format('DD/MM/YYYY')
    const hourStr = `${String(selectedHour).padStart(2, '0')}:00`
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
    const services = items.map((i) => i.name).join(', ')
    const message = `Olá! Gostaria de confirmar meu agendamento no ${settings.salonName} para ${dateStr} às ${hourStr}. Serviços: ${services}. Total: R$ ${total.toFixed(2)}`
    const url = buildWhatsAppLink(settings.phone, message)
    window.open(url, '_blank')
    add({ dateIso: iso, hour: selectedHour, items, total, customerName: profile.name, customerPhone: profile.phone })
    clear()
    setError(null)
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
            >
              Esvaziar carrinho
            </Button>
            <Button
              disabled={(() => {
                if (selectedHour == null || items.length === 0 || !isValidWhatsappNumber(settings.phone)) return true
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
              onClick={confirmAppointment}
              variant="whatsapp"
            >
              Confirmar agendamento (WhatsApp)
            </Button>
          </div>
          {!isValidWhatsappNumber(settings.phone) && (
            <span className="ml-3 text-xs text-red-600">Configure o WhatsApp do estabelecimento no painel Admin.</span>
          )}
          {error && (
            <span className="ml-3 text-xs text-red-600">{error}</span>
          )}
        </div>
      </Card>
    </div>
  )
}