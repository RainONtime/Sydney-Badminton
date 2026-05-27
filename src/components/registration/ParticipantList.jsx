import { ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const GENDER_ICON = {
  male:   { icon: '♂', color: 'text-indigo-300'  },
  female: { icon: '♀', color: 'text-rose-300'    },
  other:  { icon: null, color: 'text-violet-400'  },
}

function GenderIcon({ gender, size = 'sm' }) {
  const g = GENDER_ICON[gender] || GENDER_ICON.male
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <span className={`inline-flex items-center justify-center h-6 shrink-0 ${g.color}`}>
      {g.icon ? (
        <span className="text-sm leading-none select-none">{g.icon}</span>
      ) : (
        <ShoppingBag className={`${iconSize} shrink-0`} strokeWidth={2.5} />
      )}
    </span>
  )
}

function levelBadge(level) {
  if (!level) return null
  return (
    <span className="inline-block text-[10px] font-medium text-violet-500 bg-violet-50 rounded-full px-2 py-0.5 leading-none">
      {level} 级
    </span>
  )
}

/** @param {{ registrations: import('../../types').Registration[] }} props */
export default function ParticipantList({ registrations }) {
  const { t } = useTranslation()

  const active     = registrations.filter(r => r.payment_status !== 'rejected' && r.payment_status !== 'waitlisted')
  const waitlisted = registrations.filter(r => r.payment_status === 'waitlisted')
  const confirmed  = active.filter(r => r.payment_status === 'confirmed')
  const pending    = active.filter(r => r.payment_status === 'pending')

  const maleCount      = confirmed.reduce((s, r) => s + (r.gender === 'male'   ? (r.quantity || 1) : 0), 0)
  const femaleCount    = confirmed.reduce((s, r) => s + (r.gender === 'female' ? (r.quantity || 1) : 0), 0)
  const otherCount     = confirmed.reduce((s, r) => s + (r.gender === 'other'  ? (r.quantity || 1) : 0), 0)
  const totalConfirmed = confirmed.reduce((s, r) => s + (r.quantity || 1), 0)
  const totalPending   = pending.reduce((s, r) => s + (r.quantity || 1), 0)
  const totalWaitlist  = waitlisted.reduce((s, r) => s + (r.quantity || 1), 0)

  if (active.length === 0 && waitlisted.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">{t('participants.empty')}</p>
      </div>
    )
  }

  return (
    <div>
      {active.length > 0 && (
        <>
          {/* ── 统计汇总区 ────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-sm">
            <span className="font-bold leading-none" style={{ color: '#4B4552' }}>
              {t('participants.confirmed', { count: totalConfirmed })}
            </span>

            {maleCount > 0 && (
              <span className="inline-flex items-center h-6 gap-1.5 text-indigo-300">
                <GenderIcon gender="male" size="sm" />
                <span className="leading-none">{maleCount} {t('participants.male')}</span>
              </span>
            )}
            {femaleCount > 0 && (
              <span className="inline-flex items-center h-6 gap-1.5 text-rose-300">
                <GenderIcon gender="female" size="sm" />
                <span className="leading-none">{femaleCount} {t('participants.female')}</span>
              </span>
            )}
            {otherCount > 0 && (
              <span className="inline-flex items-center h-6 gap-1.5 text-violet-400">
                <GenderIcon gender="other" size="sm" />
                <span className="leading-none">{otherCount}</span>
              </span>
            )}

            {totalPending > 0 && (
              <span className="leading-none text-amber-400 text-xs font-medium">
                {totalPending} {t('participants.pending')}
              </span>
            )}
          </div>

          {/* ── 报名列表 ──────────────────────────────────────────── */}
          <div className="space-y-2">
            {active.map((reg) => {
              const isPending = reg.payment_status === 'pending'
              return (
                <div
                  key={reg.id}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm transition-colors ${
                    isPending
                      ? 'bg-candy-yellow/10 border border-candy-yellow/40'
                      : 'bg-violet-50/40'
                  }`}
                >
                  <div className="flex items-center h-6 gap-1.5 flex-1 min-w-0">
                    <GenderIcon gender={reg.gender} size="md" />
                    <span className={`font-medium leading-none truncate ${
                      isPending ? 'text-gray-400' : ''
                    }`} style={!isPending ? { color: '#4B4552' } : {}}>
                      {reg.name}
                    </span>
                    {reg.quantity > 1 && (
                      <span className="text-gray-400 font-normal text-xs leading-none shrink-0">
                        ×{reg.quantity}
                      </span>
                    )}
                  </div>

                  {levelBadge(reg.skill_level)}

                  {isPending && (
                    <span className="text-[10px] text-amber-400 font-bold shrink-0 leading-none">
                      {t('participants.pending')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {totalWaitlist > 0 && (
        <p className="text-xs text-violet-400 font-medium mt-4 text-center">
          {t('participants.waitlist', { count: totalWaitlist })}
        </p>
      )}
    </div>
  )
}
