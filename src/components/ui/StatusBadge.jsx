/** @param {{ status: import('../../types').PaymentStatus }} props */
export default function StatusBadge({ status }) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-candy-mint/20 rounded-full px-2.5 py-0.5">
        已确认
      </span>
    )
  }
  if (status === 'waitlisted') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-candy-purple/20 rounded-full px-2.5 py-0.5">
        候补中
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-candy-peach/20 rounded-full px-2.5 py-0.5">
        已驳回
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-candy-yellow/30 rounded-full px-2.5 py-0.5">
      待确认
    </span>
  )
}
