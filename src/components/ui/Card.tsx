import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
  title?: string
  subtitle?: string
}>

export default function Card({ className = '', title, subtitle, children }: Props) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-card ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 border-b">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )}