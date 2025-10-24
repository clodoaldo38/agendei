import type { FC } from 'react'

export type PasswordStrengthProps = {
  password: string
}

function calcCriteria(password: string) {
  const length = password.length >= 8
  const upper = /[A-Z]/.test(password)
  const lower = /[a-z]/.test(password)
  const number = /\d/.test(password)
  const special = /[^A-Za-z0-9]/.test(password)
  const score = [length, upper, lower, number, special].filter(Boolean).length
  return { length, upper, lower, number, special, score }
}

const HintItem: FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
  <li className={`text-xs flex items-center gap-2 ${ok ? 'text-green-700' : 'text-slate-600'}`}>
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${ok ? 'bg-green-600 border-green-600 text-white' : 'border-slate-400 text-slate-500'}`}>{ok ? '✓' : '•'}</span>
    {text}
  </li>
)

const PasswordStrengthHints: FC<PasswordStrengthProps> = ({ password }) => {
  const { length, upper, lower, number, special, score } = calcCriteria(password)
  return (
    <div className="grid gap-2">
      {/* Barra de força */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              score <= 2 ? 'bg-red-500 w-1/3' : score <= 4 ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
            }`}
          />
        </div>
        <span className="text-xs font-medium">
          Força: {score <= 2 ? 'Fraca' : score <= 4 ? 'Média' : 'Forte'}
        </span>
      </div>
      {/* Dicas para senha forte */}
      <ul className="grid gap-1">
        <HintItem ok={length} text="Pelo menos 8 caracteres" />
        <HintItem ok={upper} text="Inclua uma letra maiúscula (ex.: A)" />
        <HintItem ok={lower} text="Inclua uma letra minúscula (ex.: a)" />
        <HintItem ok={number} text="Inclua um número (ex.: 12)" />
        <HintItem ok={special} text="Inclua um caractere especial (ex.: @)" />
      </ul>
    </div>
  )
}

export default PasswordStrengthHints
export { calcCriteria }