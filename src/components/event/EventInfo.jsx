import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { formatEventDate } from '../../utils/formatDate'

/**
 * Event detail block: title, date/time, location, price, spots.
 * @param {{ event: import('../../types').BadmintonEvent, spotsLeft: number, isFull: boolean }} props
 */
export default function EventInfo({ event, spotsLeft, isFull }) {
  const { t, i18n } = useTranslation()
  const displayTitle = (i18n.language === 'en' && event.title_en) ? event.title_en : event.title
  const displayDesc  = (i18n.language === 'en' && event.description_en) ? event.description_en : event.description
  const priceLabel = event.price > 0 ? `AUD$ ${event.price}` : t('common.free')
  const dateStr = formatEventDate(event.date, i18n.language)

  return (
    <div className="mb-6">
      {/* ── 核心信息卡片 ─────────────────────────────────── */}
      <div
        className="bg-white rounded-[2rem] p-4 sm:p-6 mb-3 sm:mb-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(249,168,212,0.2)' }}
      >
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-3 sm:mb-5 leading-tight" style={{ color: '#4B4552' }}>
          {displayTitle}
        </h1>

        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-5 text-sm">
          <div>
            <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">{t('event.timeLabel')}</p>
            <p className="font-bold text-slate-700">{dateStr}</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {event.start_time?.slice(0, 5)}{event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ''}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">{t('event.locationLabel')}</p>
            <p className="font-bold text-slate-700 leading-snug">{event.location}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">{t('event.priceLabel')}</p>
            <p className="font-bold text-slate-700">
              {priceLabel}
              <span className="font-normal text-slate-400 text-xs ml-1">{t('common.perPerson')}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">{t('event.spotsLabel')}</p>
            <p className={`font-bold ${isFull ? 'text-slate-400' : 'text-slate-700'}`}>
              {isFull
                ? t('event.full')
                : t('event.spotsLeftShort', { count: spotsLeft })}
              <span className="text-slate-300 font-normal ml-1 text-xs">/ {event.max_participants}</span>
            </p>
          </div>
        </div>

        {displayDesc && (
          <p className="text-sm text-slate-500 leading-relaxed mt-3 sm:mt-5">{displayDesc}</p>
        )}
      </div>

      {/* ── 组织者信息（紧凑单行卡片）────────────────────── */}
      {(event.organizer || event.organizer_wechat) && (
        <div className="bg-amber-50 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-center gap-2">
            <User size={13} className="text-amber-400 shrink-0" strokeWidth={2.5} />
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              {event.organizer && (
                <span className="text-xs text-amber-700">
                  {t('event.organizer')}：<span className="font-semibold text-amber-800">{event.organizer}</span>
                </span>
              )}
              {event.organizer_wechat && (
                <span className="text-xs text-amber-600">
                  {t('event.wechat')}：<span className="font-semibold text-amber-800 select-all">{event.organizer_wechat}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
