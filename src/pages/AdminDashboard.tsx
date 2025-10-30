import { useSettingsStore } from '../store/settings'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import UploadButton from '../components/ui/UploadButton'
import ChangePasswordForm from '../components/ChangePasswordForm'
import { useMemo, useState, useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { hourlySlots } from '../utils/dates'
import { useAppointmentsStore } from '../store/appointments'

type EditableService = { id: string; name: string; price: number }

export default function AdminDashboard() {
  const { settings, update, save } = useSettingsStore()
  const [saved, setSaved] = useState(false)

  const [newService, setNewService] = useState<EditableService>({ id: '', name: '', price: 0 })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<EditableService | null>(null)

  function slugify(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  function addService() {
    const name = newService.name.trim()
    if (!name) return
    const id = newService.id.trim() || slugify(name)
    if (settings.services.some((s) => s.id === id)) return
    const price = Number(newService.price)
    if (Number.isNaN(price) || price < 0) return
    update({ services: [...settings.services, { id, name, price }] })
    setNewService({ id: '', name: '', price: 0 })
  }

  function startEdit(s: EditableService) {
    setEditingId(s.id)
    setEditValue({ ...s })
  }

  function saveEdit() {
    if (!editValue) return
    const next = settings.services.map((s) => (s.id === editingId ? { ...editValue } : s))
    update({ services: next })
    setEditingId(null)
    setEditValue(null)
  }

  function removeService(id: string) {
    update({ services: settings.services.filter((s) => s.id !== id) })
    if (editingId === id) {
      setEditingId(null)
      setEditValue(null)
    }
  }

  function onLogoFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update({ logoUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  function addBlockedDate(dateIso: string) {
    if (!dateIso) return
    if (settings.blockedDates.includes(dateIso)) return
    update({ blockedDates: [...settings.blockedDates, dateIso] })
  }

  function removeBlockedDate(dateIso: string) {
    update({ blockedDates: settings.blockedDates.filter((d) => d !== dateIso) })
  }

  const [blockDate, setBlockDate] = useState<string>('')

  const hoursRange = useMemo(() => hourlySlots(settings.openingHourStart, settings.openingHourEnd), [settings.openingHourStart, settings.openingHourEnd])
  const { appointments, load: loadAppointments, clearAll } = useAppointmentsStore()
  useEffect(() => { loadAppointments() }, [loadAppointments])

  // Banners de parceiros
  const [newBanner, setNewBanner] = useState<{ imageUrl: string; href?: string; displayMode?: 'contain' | 'cover' }>({ imageUrl: '', href: '', displayMode: 'contain' })

  // Estado de edição para tempo de troca (segundos) dos banners
  const [bannerIntervalSecDraft, setBannerIntervalSecDraft] = useState<string>(() => {
    const sec = Math.round(((settings.partnerBannerIntervalMs ?? 0) as number) / 1000)
    return String(sec)
  })
  useEffect(() => {
    const sec = Math.round(((settings.partnerBannerIntervalMs ?? 0) as number) / 1000)
    setBannerIntervalSecDraft(String(sec))
  }, [settings.partnerBannerIntervalMs])

  // Estado de edição para Dias visíveis à frente (edição fluida + clamp no blur)
  const [daysAheadDraft, setDaysAheadDraft] = useState<string>(() => String(settings.daysAhead ?? 7))
  useEffect(() => {
    setDaysAheadDraft(String(settings.daysAhead ?? 7))
  }, [settings.daysAhead])

  function onBannerFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setNewBanner((v) => ({ ...v, imageUrl: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  function addBanner() {
    if (!newBanner.imageUrl) return
    const id = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : String(Date.now())
    const href = newBanner.href?.trim()
    const displayMode = newBanner.displayMode || 'contain'
    const next = [...(settings.partnerBanners || []), { id, imageUrl: newBanner.imageUrl, href: href || undefined, displayMode }]
    update({ partnerBanners: next })
    setNewBanner({ imageUrl: '', href: '', displayMode: 'contain' })
  }

  function removeBanner(id: string) {
    const next = (settings.partnerBanners || []).filter((b) => b.id !== id)
    update({ partnerBanners: next })
  }

  function toggleBlockedHour(dateIso: string, hour: number) {
    if (!dateIso) return
    const current = settings.blockedHours?.[dateIso] || []
    const exists = current.includes(hour)
    const nextList = exists ? current.filter((h) => h !== hour) : [...current, hour]
    const next = { ...(settings.blockedHours || {}), [dateIso]: nextList.sort((a, b) => a - b) }
    update({ blockedHours: next })
  }

  function clearBlockedHour(dateIso: string, hour: number) {
    if (!dateIso) return
    const current = settings.blockedHours?.[dateIso] || []
    const nextList = current.filter((h) => h !== hour)
    const next = { ...(settings.blockedHours || {}), [dateIso]: nextList }
    update({ blockedHours: next })
  }

  // Navegação por botões (âncoras)
  const estabRef = useRef<HTMLDivElement>(null)
  const bannersRef = useRef<HTMLDivElement>(null)
  const horariosRef = useRef<HTMLDivElement>(null)
  const agendaRef = useRef<HTMLDivElement>(null)
  const servicosRef = useRef<HTMLDivElement>(null)
  const senhaRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  return (
    <div className="max-w-container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Painel Admin</h1>
      <p className="text-sm text-slate-500 mb-4">Gerencie dados do salão, horários de agenda, dias visíveis e serviços.</p>

      {/* Âncora topo */}
      <div ref={topRef} />

      {/* Barra de navegação */}
      <div className="sticky top-0 bg-white z-10 py-2 border-b mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button className="h-8 px-3" onClick={() => estabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Estabelecimento</Button>
          <Button className="h-8 px-3" onClick={() => bannersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Banners</Button>
          <Button className="h-8 px-3" onClick={() => horariosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Horários</Button>
          <Button className="h-8 px-3" onClick={() => agendaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Agenda</Button>
          <Button className="h-8 px-3" onClick={() => servicosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Serviços</Button>
          <Button className="h-8 px-3" onClick={() => senhaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Senha</Button>

          {/* Ações rápidas */}
          <div className="ml-auto flex items-center gap-2">
            {saved && <span className="text-xs text-green-600">Configurações salvas!</span>}
          </div>
        </div>
      </div>

      {/* Remover grid de âncoras temporário */}
      {/* âncoras serão posicionadas diretamente antes de cada seção */}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Âncora Estabelecimento */}
        <div ref={estabRef} />
        <Card title="Estabelecimento" subtitle="Nome, telefone e logo.">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Nome do estabelecimento</span>
              <Input value={settings.salonName} onChange={(e) => update({ salonName: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Telefone (WhatsApp)</span>
              <Input placeholder="Ex.: 5531999999999" value={settings.phone} onChange={(e) => update({ phone: e.target.value })} />
              <span className="text-xs text-slate-500">Use DDI+DDD+Número, apenas dígitos. Ex.: 5531999999999</span>
            </label>
            <div className="grid gap-1">
              <span className="text-sm">Logo</span>
              <UploadButton onFileSelect={onLogoFile} />
              {settings.logoUrl ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 object-contain border rounded" />
                  <Button variant="outline" className="h-8 px-3" onClick={() => update({ logoUrl: undefined })}>Remover logo</Button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Carregue uma imagem para usar como logo no topo.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Âncora Banners */}
        <div ref={bannersRef} />
        <Card title="Banners de Parceiros" subtitle="Anúncios exibidos abaixo da logo no cabeçalho.">
          <div className="grid gap-3">
            <div className="grid md:grid-cols-[1fr_auto] gap-2 items-end">
              <label className="grid gap-1">
                <span className="text-sm">Imagem do banner</span>
                <UploadButton onFileSelect={onBannerFile} />
                {newBanner.imageUrl ? (
                  <img src={newBanner.imageUrl} alt="Prévia banner" className="h-12 rounded border mt-2" />
                ) : (
                  <span className="text-xs text-slate-500">Carregue uma imagem para o banner.</span>
                )}
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Link (opcional)</span>
                <Input placeholder="https://..." value={newBanner.href || ''} onChange={(e) => setNewBanner((v) => ({ ...v, href: e.target.value }))} />
              </label>
              <div className="grid gap-1">
                <span className="text-sm">Modo de exibição</span>
                <select className="h-9 border rounded px-2" value={newBanner.displayMode || 'contain'} onChange={(e) => setNewBanner((v) => ({ ...v, displayMode: e.target.value as 'contain' | 'cover' }))}>
                  <option value="contain">Ajustar (sem cortes)</option>
                  <option value="cover">Preencher (pode cortar)</option>
                </select>
              </div>
              <Button onClick={addBanner}>Adicionar banner</Button>
            </div>

            <div className="grid gap-1">
              <span className="text-sm">Tempo de troca (segundos)</span>
              <Input
                type="number"
                min={0}
                max={60}
                value={bannerIntervalSecDraft}
                selectOnFocus
                onChange={(e) => {
                  // Não aplicar clamp durante digitação para evitar travas; manter rascunho como string
                  setBannerIntervalSecDraft(e.target.value)
                }}
                onBlur={(e) => {
                  const raw = e.target.value
                  const num = Number(raw)
                  const clamped = Math.max(2, Math.min(60, Number.isNaN(num) ? 0 : num))
                  update({ partnerBannerIntervalMs: clamped * 1000 })
                  setBannerIntervalSecDraft(String(clamped))
                }}
              />
              <span className="text-xs text-slate-500">Define o tempo que cada banner permanece visível antes de ir para o próximo.</span>
            </div>

            {(settings.partnerBanners || []).length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum banner cadastrado.</p>
            ) : (
              <ul className="divide-y">
                {settings.partnerBanners.map((b) => (
                  <li key={b.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={b.imageUrl} alt="Banner" className="h-10 rounded border" />
                      {b.href ? (
                        <a href={b.href} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">{b.href}</a>
                      ) : (
                        <span className="text-sm text-slate-500">Sem link</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="hidden md:flex items-center gap-2 text-sm">
                        <span>Modo</span>
                        <select className="h-8 border rounded px-2" value={b.displayMode || 'contain'} onChange={(e) => update({ partnerBanners: (settings.partnerBanners || []).map((x) => x.id === b.id ? { ...x, displayMode: e.target.value as 'contain' | 'cover' } : x) })}>
                          <option value="contain">Ajustar</option>
                          <option value="cover">Preencher</option>
                        </select>
                      </label>
                      <Button variant="outline" className="h-8 px-3" onClick={() => removeBanner(b.id)}>Remover</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Âncora Horários */}
        <div ref={horariosRef} />
        <Card title="Horários" subtitle="Defina o intervalo de funcionamento.">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Horário início (0-23)</span>
              <Input type="number" min={0} max={23} value={settings.openingHourStart}
                onChange={(e) => update({ openingHourStart: Number(e.target.value) })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Horário fim (0-23)</span>
              <Input type="number" min={0} max={23} value={settings.openingHourEnd}
                onChange={(e) => update({ openingHourEnd: Number(e.target.value) })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Corte da hora atual (minutos)</span>
              <Input type="number" min={0} max={59} value={settings.currentHourCutoffMin}
                onChange={(e) => update({ currentHourCutoffMin: Math.max(0, Math.min(59, Number(e.target.value))) })} />
              <span className="text-xs text-slate-500">Hoje, o horário da hora atual fica indisponível após X minutos decorridos. Ex.: 10:40 com corte 5min bloqueia 10:00.</span>
            </label>
            <p className="text-xs text-slate-500">Os horários disponíveis na agenda seguem intervalo de 1 hora.</p>
          </div>
        </Card>

        {/* Âncora Agenda */}
        <div ref={agendaRef} />
        <Card title="Agenda" subtitle="Controle dias visíveis e bloqueios.">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Dias visíveis à frente</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={daysAheadDraft}
                selectOnFocus
                onChange={(e) => {
                  // Não aplicar clamp durante digitação; manter edição fluida como string
                  setDaysAheadDraft(e.target.value)
                }}
                onBlur={(e) => {
                  const raw = e.target.value
                  const num = Number(raw)
                  const clamped = Math.max(1, Math.min(30, Number.isNaN(num) ? 1 : num))
                  update({ daysAhead: clamped })
                  setDaysAheadDraft(String(clamped))
                }}
              />
            </label>
            <div className="grid gap-2">
              <span className="text-sm">Datas bloqueadas</span>
              <div className="flex items-center gap-2">
                <Input type="date" onChange={(e) => addBlockedDate(e.target.value)} />
              </div>
              {settings.blockedDates.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma data bloqueada.</p>
              ) : (
                <ul className="text-sm">
                  {settings.blockedDates.map((d) => (
                    <li key={d} className="flex items-center justify-between py-1">
                      <span>{d}</span>
                      <Button variant="outline" className="h-7 px-3" onClick={() => removeBlockedDate(d)}>Desbloquear</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-2">
              <span className="text-sm">Horários bloqueados (por data)</span>
              <div className="flex items-center gap-2">
                <Input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
              </div>
              {!blockDate ? (
                <p className="text-xs text-slate-500">Selecione uma data para bloquear ou desbloquear horários específicos.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {hoursRange.map((h) => {
                    const blocked = (settings.blockedHours?.[blockDate] || []).includes(h)
                    return (
                      <Button
                        key={h}
                        variant="outline"
                        className={`px-3 py-2 ${blocked ? 'bg-slate-200 text-slate-500' : ''}`}
                        onClick={() => toggleBlockedHour(blockDate, h)}
                      >
                        {String(h).padStart(2, '0')}:00 {blocked ? '(bloqueado)' : ''}
                      </Button>
                    )
                  })}
                </div>
              )}
              {blockDate && (settings.blockedHours?.[blockDate] || []).length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-slate-500">Horários bloqueados em {blockDate}:</span>
                  <ul className="text-sm mt-1">
                    {(settings.blockedHours?.[blockDate] || []).map((h) => (
                      <li key={h} className="flex items-center justify-between py-1">
                        <span>{String(h).padStart(2, '0')}:00</span>
                        <Button variant="outline" className="h-7 px-3" onClick={() => clearBlockedHour(blockDate, h)}>Desbloquear</Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Agendamentos salvos: {appointments.length}</span>
              <Button variant="outline" className="h-7 px-3" onClick={() => { if (window.confirm('Deseja limpar todos os agendamentos salvos?')) clearAll() }}>Limpar agenda</Button>
            </div>
          </div>
        </Card>

        {/* Âncora Serviços */}
        <div ref={servicosRef} />
        <Card title="Serviços" subtitle="Adicionar, editar e remover.">
          <div className="grid gap-3">
            <div className="grid md:grid-cols-[1fr_auto_auto] gap-2 items-end">
              <label className="grid gap-1">
                <span className="text-sm">Nome</span>
                <Input value={newService.name} onChange={(e) => setNewService((v) => ({ ...v, name: e.target.value }))} />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Preço</span>
                <Input type="number" min={0} value={newService.price}
                  onKeyDown={(e) => {
                    const k = (e as any).key as string
                    if (newService.price === 0 && /^[0-9]$/.test(k)) {
                      e.preventDefault()
                      setNewService((v) => ({ ...v, price: Number(k) }))
                    }
                  }}
                  onChange={(e) => setNewService((v) => ({ ...v, price: Number(e.target.value) }))} />
              </label>
              <Button onClick={addService}>Adicionar</Button>
            </div>

            {settings.services.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum serviço cadastrado.</p>
            ) : (
              <ul className="divide-y">
                {settings.services.map((s) => (
                  <li key={s.id} className="py-2 flex items-center justify-between gap-3">
                    {editingId === s.id && editValue ? (
                      <div className="flex-1 grid md:grid-cols-[1fr_auto] gap-2">
                        <Input value={editValue.name} onChange={(e) => setEditValue((v) => v ? { ...v, name: e.target.value } : v)} />
                        <Input type="number" min={0} value={editValue.price}
                          onChange={(e) => setEditValue((v) => v ? { ...v, price: Number(e.target.value) } : v)} />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-sm text-slate-500">R$ {s.price.toFixed(2)}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {editingId === s.id ? (
                        <>
                          <Button className="h-8 px-3" onClick={saveEdit}>Salvar</Button>
                          <Button variant="outline" className="h-8 px-3" onClick={() => { setEditingId(null); setEditValue(null) }}>Cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" className="h-8 px-3" onClick={() => startEdit(s)}>Editar</Button>
                          <Button variant="outline" className="h-8 px-3" onClick={() => removeService(s.id)}>Remover</Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Âncora Senha */}
        <div ref={senhaRef} />
        <div>
          <ChangePasswordForm />
        </div>

      </div>
      
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <Button className="h-12 px-5 shadow-lg" onClick={() => { save(); setSaved(true); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => setSaved(false), 2000) }}>Salvar</Button>
      </div>
    </div>
  )
}