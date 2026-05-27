import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatCardDate } from '../../utils/formatDate'

/** @param {{ event: import('../../types').BadmintonEvent, registrationCount?: number }} props */
export default function EventCard({ event, registrationCount = 0 }) {
  const { t, i18n } = useTranslation()
  const displayTitle = (i18n.language === 'en' && event.title_en) ? event.title_en : event.title
  const spotsLeft = event.max_participants - registrationCount
  const isFull = spotsLeft <= 0
  const fillPct = Math.min((registrationCount / event.max_participants) * 100, 100)
  const { weekday, monthDay } = formatCardDate(event.date, i18n.language)

  const priceLabel = event.price > 0 ? `AUD$ ${event.price}` : t('common.free')

  return (
    <Link
      to={`/events/${event.id}`}
      className="card block p-5 sm:p-6 group touch-manipulation"
      style={{ transition: 'box-shadow 0.25s ease, transform 0.25s ease' }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.985)' }}
      onTouchEnd={e => { e.currentTarget.style.transform = '' }}
      onTouchCancel={e => { e.currentTarget.style.transform = '' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(168,139,250,0.14), 0 4px 16px rgba(244,114,182,0.09)'
        e.currentTarget.style.transform = 'translateY(-5px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.transform = ''
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-1.5 font-medium">
            {monthDay} · {weekday} · {event.start_time?.slice(0, 5)}{event.end_time ? `–${event.end_time.slice(0, 5)}` : ''}
          </p>
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight truncate transition-colors"
              style={{ color: '#4B4552' }}>
            {displayTitle}
          </h3>
        </div>
        <div className="shrink-0 mt-[22px]">
          {event.price > 0 ? (
            <span className="text-sm font-bold tracking-tight" style={{ color: '#4B4552' }}>
              {priceLabel}
            </span>
          ) : (
            <span className="text-xs font-semibold text-violet-400 bg-violet-50 rounded-full px-2.5 py-1">
              {priceLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm mb-5">
        <p className="text-gray-400 truncate">{event.location}</p>
        {event.organizer && (
          <span className="inline-flex items-center shrink-0 px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 text-xs font-semibold">
            {event.organizer}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{registrationCount} / {event.max_participants}</span>
          <span className={`text-xs font-medium ${
            isFull ? 'text-gray-300' : spotsLeft <= 3 ? 'text-rose-400' : 'text-violet-400'
          }`}>
            {isFull
              ? t('event.full')
              : t('event.spotsLeft', { count: spotsLeft })}
          </span>
        </div>
        <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull
                ? 'bg-gray-200'
                : 'bg-gradient-to-r from-violet-400 to-fuchsia-400'
            }`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
