import { useSettingsStore } from '../store/settings'
import { useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

export default function PartnerBannerStrip() {
  const { settings } = useSettingsStore()
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(0)

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')
  if (isAuthPage || isAdminPage) return null

  const banners = settings.partnerBanners || []
  if (banners.length === 0) return null

  useEffect(() => {
    if (banners.length <= 1) return
    const intervalMs = Math.max(2000, settings.partnerBannerIntervalMs || 5000)
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [banners.length, settings.partnerBannerIntervalMs])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const width = el.clientWidth
    el.scrollTo({ left: width * index, behavior: 'smooth' })
  }, [index])

  return (
    <div className="w-full">
      <div className="max-w-container mx-auto py-2">
        <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth">
          {banners.map((b) => (
            <div key={b.id} className="snap-center shrink-0 w-full">
              <div className="aspect-video w-full rounded-md overflow-hidden relative">
                {banners.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Anterior"
                      onClick={() => setIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 text-slate-700 shadow hover:bg-white active:scale-95"
                    >‹</button>
                    <button
                      type="button"
                      aria-label="Próximo"
                      onClick={() => setIndex((prev) => (prev + 1) % banners.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 text-slate-700 shadow hover:bg-white active:scale-95"
                    >›</button>
                  </>
                )}
                {b.href ? (
                  <a href={b.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={b.imageUrl} alt="Banner parceiro" className={`w-full h-full ${(b.displayMode || 'contain') === 'cover' ? 'object-cover' : 'object-contain'}`} />
                  </a>
                ) : (
                  <img src={b.imageUrl} alt="Banner parceiro" className={`w-full h-full ${(b.displayMode || 'contain') === 'cover' ? 'object-cover' : 'object-contain'}`} />
                )}
              </div>
            </div>
          ))}
        </div>
        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-2">
            {banners.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir para banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-slate-900' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}