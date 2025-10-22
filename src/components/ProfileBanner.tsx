import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProfileStore } from '../store/profile'

export default function ProfileBanner() {
  const { profile, load } = useProfileStore()
  const location = useLocation()

  useEffect(() => {
    load()
  }, [load])

  const hiddenRoutes = ['/login', '/register', '/forgot-password', '/admin']
  const isHidden = hiddenRoutes.some((r) => location.pathname.startsWith(r))
  if (isHidden || !profile.photoUrl) return null

  return (
    <div className="bg-white">
      <div className="max-w-container mx-auto px-4 pt-3 pb-1 flex flex-col items-center">
        <img
          src={profile.photoUrl}
          alt="Foto do usuário"
          className="h-24 w-24 rounded-full object-cover ring-4 ring-brand/30 shadow-md"
        />
      </div>
    </div>
  )
}