import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp'
  }
>

export default function Button({ variant = 'primary', className = '', children, ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark focus:ring-brand',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900',
    outline: 'border border-slate-300 text-slate-900 hover:bg-slate-50 focus:ring-slate-300',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#1ebe57] focus:ring-[#25D366]',
  }[variant]
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}