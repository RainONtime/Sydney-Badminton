/** @param {{ status: import('../../types').PaymentStatus }} props */
export default function StatusBadge({ status }) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
        已确认
      </span>
    )
  }
  if (status === 'waitlisted') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5">
        候补中
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5">
      待确认
    </span>
  )
}
