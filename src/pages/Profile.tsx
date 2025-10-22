import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useProfileStore } from '../store/profile'
import { useNavigate } from 'react-router-dom'
export default function Profile() {
  const { profile, update, load, save } = useProfileStore()
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [load])

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update({ photoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }

  function onSave() {
    save()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    navigate('/')
  }

  return (
    <div className="max-w-container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Editar perfil</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Foto">
          <div className="flex items-center gap-4">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200" />
            )}
            <label className="text-sm">
              <span className="block mb-1">Foto de perfil</span>
              <Input type="file" accept="image/*" onChange={onPhotoChange} />
            </label>
          </div>
        </Card>

        <Card title="Dados pessoais">
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Nome</span>
              <Input value={profile.name} onChange={(e) => update({ name: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Telefone (WhatsApp)</span>
              <Input value={profile.phone} onChange={(e) => update({ phone: e.target.value })} />
            </label>
          </div>
        </Card>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={onSave}>Salvar configurações</Button>
        {saved && <span className="text-sm text-green-600">Configurações salvas!</span>}
      </div>
    </div>
  )
}