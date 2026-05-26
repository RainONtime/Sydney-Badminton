import CopyButton from '../ui/CopyButton'

/** @param {{ event: import('../../types').BadmintonEvent }} props */
export default function BankInfo({ event }) {
  const rows = [
    event.payid        && { label: 'PayID',        value: event.payid },
    event.account_name && { label: 'Account Name', value: event.account_name },
    event.bsb          && { label: 'BSB',           value: event.bsb },
    event.account_number && { label: 'Account No.', value: event.account_number },
  ].filter(Boolean)

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">请联系组织者获取付款信息</p>
  }

  return (
    <div className="space-y-2">
      {rows.map(row => (
        <div key={row.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">{row.label}</p>
            <p className="text-sm font-medium text-gray-950">{row.value}</p>
          </div>
          <CopyButton text={row.value} />
        </div>
      ))}
    </div>
  )
}
