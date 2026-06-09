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
    <div>

      {/* ── Hero — macaron jelly-text, transparent background ── */}
      <div className="w-full pt-12 pb-12 px-4 flex flex-col items-center text-center">
        <h1
          className="text-[2.5rem] md:text-5xl font-black text-[#FCFAFA] tracking-wider mb-3"
          style={{ textShadow: '2px 2px 0px #E5D5FF, 4px 4px 0px #FBCFE8, 0px 10px 25px rgba(168,139,250,0.2)' }}
        >
          DUODUO BADMINTON
        </h1>
        <p className="text-[#4B4552]/50 font-medium text-sm md:text-base">
          {t('home.subtitle')}
        </p>
      </div>

      {/* ── Event content ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-5 pb-7 sm:pb-10">
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

    </div>
  )
}
