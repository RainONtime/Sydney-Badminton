import QuantityStepper from '../ui/QuantityStepper'

const LEVEL_OPTIONS = ['1', '2', '3', '4', '5', '6']
const GENDER_OPTIONS = [
  { value: 'male',   label: '男' },
  { value: 'female', label: '女' },
  { value: 'other',  label: '沃尔玛塑料袋' },
]

/**
 * Step 1 of registration: name / gender / level / quantity / notes.
 * @param {{
 *   form: { name: string, gender: string, level: string, notes: string, quantity: number },
 *   onChange: (e: React.ChangeEvent) => void,
 *   onQuantityChange: (v: number) => void,
 *   onSubmit: (e: React.FormEvent) => void,
 *   error: string,
 *   event: import('../../types').BadmintonEvent,
 *   spotsLeft: number,
 *   isWaitlisted?: boolean,
 *   isSubmitting?: boolean,
 * }} props
 */
export default function RegistrationForm({
  form, onChange, onQuantityChange, onSubmit, error, event, spotsLeft,
  isWaitlisted = false, isSubmitting = false,
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-base font-semibold text-gray-950">报名</h2>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-brand" />
          <span className="w-2 h-2 rounded-full bg-gray-200" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            名字 <span className="text-gray-950">*</span>
          </label>
          <input
            className="input-field text-base"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="微信名或群昵称"
            autoComplete="off"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            性别 <span className="text-gray-950">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ target: { name: 'gender', value: opt.value } })}
                className={`py-2.5 rounded-xl text-sm border transition-all ${
                  form.gender === opt.value
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level + Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">中羽等级（选填）</label>
            <select className="input-field text-base" name="level" value={form.level} onChange={onChange}>
              <option value="">不填</option>
              {LEVEL_OPTIONS.map(v => (
                <option key={v} value={v}>{v} 级</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">人数（最多 3 人）</label>
            <div className="h-[42px] flex items-center">
              <QuantityStepper
                value={form.quantity}
                onChange={onQuantityChange}
                max={isWaitlisted ? 1 : Math.min(3, spotsLeft)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">备注（选填）</label>
          <textarea
            className="input-field resize-none text-base"
            name="notes"
            value={form.notes}
            onChange={onChange}
            rows={2}
            placeholder="如有特殊需求可在此说明"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2 ${
            isWaitlisted ? 'btn-secondary border-2 border-dashed border-gray-300' : 'btn-primary'
          }`}
        >
          {isSubmitting && (
            <span className={`w-4 h-4 rounded-full border-2 animate-spin ${isWaitlisted ? 'border-gray-300 border-t-gray-600' : 'border-white/40 border-t-white'}`} />
          )}
          {isSubmitting
            ? '提交中…'
            : isWaitlisted
              ? '名额已满，加入候补'
              : event.price > 0 && (event.payment_methods?.length > 0)
                ? '下一步：付款'
                : '确认报名'}
        </button>
      </form>
    </div>
  )
}
