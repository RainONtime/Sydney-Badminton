import { ShoppingBag } from 'lucide-react'

const GENDER_ICON = {
  male:   { icon: '♂', label: '男',  color: 'text-blue-500'   },
  female: { icon: '♀', label: '女',  color: 'text-pink-500'   },
  other:  { icon: null, label: '其他', color: 'text-purple-500' },
}

// 统一的图标渲染：♂ ♀ 与上下文同号 text-sm，ShoppingBag 精确 14px，
// 统一用 -translate-y-[1px] 做光学微调（flex 子元素用 transform，不用 relative top）
function GenderIcon({ gender, size = 'sm' }) {
  const g = GENDER_ICON[gender] || GENDER_ICON.male
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'   // 14px / 16px

  return (
    <span className={`inline-flex items-center shrink-0 ${g.color}`}>
      {g.icon ? (
        <span className="text-sm leading-none -translate-y-[1px] select-none">
          {g.icon}
        </span>
      ) : (
        <ShoppingBag className={`${iconSize} shrink-0 -translate-y-[1px]`} />
      )}
    </span>
  )
}

function levelBadge(level) {
  if (!level) return null
  return (
    <span className="inline-block text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 leading-none">
      {level} 级
    </span>
  )
}

/** @param {{ registrations: import('../../types').Registration[] }} props */
export default function ParticipantList({ registrations }) {
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
        <p className="text-sm text-gray-400">暂无报名</p>
      </div>
    )
  }

  return (
    <div>
      {active.length > 0 && (
        <>
          {/* ── 统计汇总区 ────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-sm">
            <span className="font-medium text-gray-950 leading-none">
              {totalConfirmed} 人已确认
            </span>

            {maleCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-blue-500">
                <GenderIcon gender="male" size="sm" />
                <span className="leading-none">{maleCount} 男</span>
              </span>
            )}
            {femaleCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-pink-500">
                <GenderIcon gender="female" size="sm" />
                <span className="leading-none">{femaleCount} 女</span>
              </span>
            )}
            {otherCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-purple-500">
                <GenderIcon gender="other" size="sm" />
                <span className="leading-none">{otherCount}</span>
              </span>
            )}

            {totalPending > 0 && (
              <span className="leading-none text-amber-500 text-xs">
                {totalPending} 待确认
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                    isPending ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
                  }`}
                >
                  <GenderIcon gender={reg.gender} size="md" />

                  <span className={`flex-1 font-medium leading-tight ${
                    isPending ? 'text-gray-600' : 'text-gray-950'
                  }`}>
                    {reg.name}
                    {reg.quantity > 1 && (
                      <span className="text-gray-400 font-normal ml-1 text-xs">
                        ×{reg.quantity}
                      </span>
                    )}
                  </span>

                  {levelBadge(reg.skill_level)}

                  {isPending && (
                    <span className="text-[10px] text-amber-600 font-medium shrink-0 leading-none">
                      待确认
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {totalWaitlist > 0 && (
        <p className="text-xs text-purple-500 mt-4 text-center">
          另有 {totalWaitlist} 人在候补中
        </p>
      )}
    </div>
  )
}
