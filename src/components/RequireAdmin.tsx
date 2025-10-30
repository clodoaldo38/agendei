import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function RequireAdmin({ children }: PropsWithChildren) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin' && user.role !== 'developer') return <Navigate to="/" replace />
  return <>{children}</>
}