import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * Event detail block: title, date/time, location, price, spots.
 * @param {{ event: import('../../types').BadmintonEvent, spotsLeft: number, isFull: boolean }} props
 */
export default function EventInfo({ event, spotsLeft, isFull }) {
  const priceLabel = event.price > 0 ? `AUD$ ${event.price}` : '免费'
  const dateStr = format(parseISO(event.date), 'yyyy年M月d日 EEEE', { locale: zhCN })

  return (
    <div className="mb-7">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-950 tracking-tight mb-5 leading-tight">
        {event.title}
      </h1>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-5">
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide">时间</p>
          <p className="text-gray-950 font-medium">{dateStr}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide">地点</p>
          <p className="text-gray-950 font-medium leading-snug">{event.location}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide">费用</p>
          <p className="font-semibold text-gray-950">
            {priceLabel}
            <span className="font-normal text-gray-400 text-xs ml-1">/ 人</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide">名额</p>
          <p className={`font-medium ${isFull ? 'text-gray-400' : 'text-gray-950'}`}>
            {isFull ? '已满' : `剩余 ${spotsLeft} 个`}
            <span className="text-gray-300 font-normal ml-1 text-xs">/ {event.max_participants}</span>
          </p>
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{event.description}</p>
      )}

      {/* Organizer info + cancellation notice */}
      {(event.organizer || event.organizer_wechat) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5">
          <div className="flex items-center gap-3 flex-wrap">
            {event.organizer && (
              <span className="text-xs text-gray-500">
                组织者：<span className="font-medium text-gray-950">{event.organizer}</span>
              </span>
            )}
            {event.organizer_wechat && (
              <span className="text-xs text-gray-400">
                微信：<span className="font-medium text-gray-700 select-all">{event.organizer_wechat}</span>
              </span>
            )}
          </div>
          {event.organizer_wechat && (
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              如需取消报名或修改人数，请添加组织者微信联系退款。
            </p>
          )}
        </div>
      )}
    </div>
  )
}
