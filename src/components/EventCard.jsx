import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function EventCard({ event, registrationCount = 0 }) {
  const spotsLeft = event.max_participants - registrationCount
  const isFull = spotsLeft <= 0
  const fillPct = Math.min((registrationCount / event.max_participants) * 100, 100)
  const weekday = format(parseISO(event.date), 'EEE', { locale: zhCN })
  const monthDay = format(parseISO(event.date), 'M月d日')

  const priceLabel = event.price > 0 ? `AUD$ ${event.price}` : '免费'

  return (
    <Link
      to={`/events/${event.id}`}
      className="card block p-5 sm:p-6 group touch-manipulation"
      style={{
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
      }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.985)' }}
      onTouchEnd={e => { e.currentTarget.style.transform = '' }}
      onTouchCancel={e => { e.currentTarget.style.transform = '' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 1px 0 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.04)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 mb-1.5 font-medium">
            {monthDay} · {weekday} · {event.start_time}{event.end_time ? `–${event.end_time}` : ''}
          </p>
          <h3 className="text-[15px] font-semibold text-gray-950 leading-snug group-hover:text-gray-600 transition-colors truncate tracking-tight">
            {event.title}
          </h3>
        </div>
        <div className="shrink-0 mt-[22px]">
          <span className={`text-sm font-bold tracking-tight ${event.price > 0 ? 'text-gray-950' : 'text-gray-500'}`}>
            {priceLabel}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-5 truncate">{event.location}</p>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{registrationCount} / {event.max_participants} 人</span>
          <span className={`text-xs font-medium ${
            isFull ? 'text-gray-400' : spotsLeft <= 3 ? 'text-amber-500' : 'text-gray-400'
          }`}>
            {isFull ? '名额已满' : `还剩 ${spotsLeft} 个`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-gray-200' : 'bg-brand'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
