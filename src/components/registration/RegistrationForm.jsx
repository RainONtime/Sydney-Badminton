import { useTranslation } from 'react-i18next'
import QuantityStepper from '../ui/QuantityStepper'

const LEVEL_OPTIONS = ['1', '2', '3', '4', '5', '6']

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
  const { t } = useTranslation()

  const GENDER_OPTIONS = [
    { value: 'male',   label: t('form.male')   },
    { value: 'female', label: t('form.female') },
    { value: 'other',  label: t('form.other')  },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-base font-semibold" style={{ color: '#4B4552' }}>{t('form.title')}</h2>
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Step indicator dots */}
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="w-2 h-2 rounded-full bg-violet-100" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            {t('form.name')} <span className="text-rose-400">*</span>
          </label>
          <input
            className="input-field text-base"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder={t('form.namePlaceholder')}
            autoComplete="off"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            {t('form.gender')} <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ target: { name: 'gender', value: opt.value } })}
                className={`py-2.5 rounded-xl text-sm border transition-all font-medium ${
                  form.gender === opt.value
                    ? 'text-white border-transparent'
                    : 'bg-white border-violet-100 hover:border-violet-300'
                }`}
                style={form.gender === opt.value ? {
                  background: 'linear-gradient(135deg, #A88BFA, #F472B6)',
                  color: '#fff',
                } : { color: '#4B4552' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level + Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('form.levelLabel')}</label>
            <select className="input-field text-base" name="level" value={form.level} onChange={onChange}>
              <option value="">{t('form.levelNone')}</option>
              {LEVEL_OPTIONS.map(v => (
                <option key={v} value={v}>{t('form.level', { n: v })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('form.quantityLabel')}</label>
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
          <label className="block text-xs text-gray-400 mb-1.5">{t('form.notesLabel')}</label>
          <textarea
            className="input-field resize-none text-base"
            name="notes"
            value={form.notes}
            onChange={onChange}
            rows={2}
            placeholder={t('form.notesPlaceholder')}
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2 ${
            isWaitlisted ? 'btn-secondary border-2 border-dashed border-violet-200' : 'btn-primary'
          }`}
        >
          {isSubmitting && (
            <span className={`w-4 h-4 rounded-full border-2 animate-spin ${isWaitlisted ? 'border-violet-200 border-t-violet-500' : 'border-white/40 border-t-white'}`} />
          )}
          {isSubmitting
            ? t('common.submitting')
            : isWaitlisted
              ? t('form.joinWaitlist')
              : event.price > 0 && (event.payment_methods?.length > 0)
                ? t('form.nextPayment')
                : t('form.confirm')}
        </button>
      </form>
    </div>
  )
}
