import React from 'react'

type Props = {
  className?: string
  title?: string // usado no alt da imagem
  src?: string
  cta?: string // chamada para ação abaixo do logo
}

export default function BrandHeader({ className = '', title = 'Agendei', src = '/brand-agendei.png', cta = 'Agende no seu ritmo!' }: Props) {
  const withBase = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [imgSrc, setImgSrc] = React.useState(withBase(src))
  return (
    <div className={`grid justify-items-center gap-2 ${className}`}>
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden flex items-center justify-center">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-contain"
          onError={() => setImgSrc(withBase('/vite.svg'))}
        />
      </div>
      <div className="text-sm md:text-base text-slate-700 font-medium text-center">
        {cta}
      </div>
    </div>
  )
}