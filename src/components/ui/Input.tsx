import { useState, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  // Quando type="password", mostra botão para revelar/ocultar
  revealable?: boolean
}

export default function Input({ className = '', type = 'text', revealable = true, ...props }: Props) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && revealable ? (show ? 'text' : 'password') : type
  const base = 'border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent'

  const inputEl = (
    <input type={inputType} className={`${base} ${isPassword && revealable ? 'pr-10' : ''} ${className}`} {...props} />
  )

  if (!(isPassword && revealable)) {
    return inputEl
  }

  return (
    <div className="relative">
      {inputEl}
      <button
        type="button"
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
      >
        {show ? (
          // Ícone olho-fechado
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.39 21.39 0 0 1 5.06-6.06" />
            <path d="M1 1l22 22" />
            <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 3-3" />
          </svg>
        ) : (
          // Ícone olho-aberto
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}