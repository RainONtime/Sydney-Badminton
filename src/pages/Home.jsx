import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import EventCard from '../components/event/EventCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getEvents } from '../services/dataService'

export default function Home() {
  const { t } = useTranslation()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchErr } = await getEvents()

    if (fetchErr || !data) {
      setError(t('home.loadError'))
      setLoading(false)
      return
    }

    setEvents(data)
    setLoading(false)
  }, [t])

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 py-7 sm:py-10">

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div
        className="relative mb-8 sm:mb-10 rounded-[2rem] overflow-hidden px-7 py-8 sm:px-10 sm:py-10"
        style={{ background: 'linear-gradient(135deg, #A88BFA 0%, #F472B6 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 right-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-6 right-16 w-10 h-10 rounded-full bg-white/15 pointer-events-none" />

        <div className="relative z-10">
          <p className="text-white/70 text-xs font-bold tracking-[0.22em] uppercase mb-3">
            Duoduo Badminton ✨
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight">
            {t('home.title')}
          </h1>
          <p className="text-white/65 text-sm mt-2">{t('home.subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner text={t('home.loading')} />
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-rose-400">{error}</p>
          <button
            onClick={load}
            className="text-xs text-gray-400 hover:text-violet-500 underline underline-offset-2 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400">{t('home.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              registrationCount={event.registration_count ?? 0}
            />
          ))}
        </div>
      )}

      <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
    </div>
  )
}
