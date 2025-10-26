import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProfileStore } from '../store/profile'
import { useAuthStore } from '../store/auth'

export default function ProfileBanner() {
  const { profile, load } = useProfileStore()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  useEffect(() => {
    load()
  }, [load])

  const hiddenRoutes = ['/login', '/register', '/forgot-password', '/admin']
  const isHidden = hiddenRoutes.some((r) => location.pathname.startsWith(r))
  if (isHidden) return null

  const hasProfileName = !!profile.name && profile.name.trim().length > 0
  const displayName = hasProfileName ? profile.name : (user?.name || '')
  const greeting = 'Seja Bem-vindo'

  return (
    <div className="bg-white">
      <div className="max-w-container mx-auto px-4 pt-3 pb-2 flex flex-col items-center">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt="Foto do usuário"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-brand/30 shadow-md"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-slate-200 ring-4 ring-brand/30 shadow-md flex items-center justify-center">
            <svg
              className="h-12 w-12 text-slate-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
        {displayName && (
          <div className="mt-2 text-sm md:text-base text-slate-700 font-medium text-center">
            {greeting}, {displayName}!
          </div>
        )}
      </div>
    </div>
  )
}