import { useTranslation } from 'react-i18next'
import QuantityStepper from '../ui/QuantityStepper'

const LEVEL_OPTIONS = ['1', '2', '3', '4', '5', '6']

/**
 * Step 1 of registration: name / gender / level / quantity / notes.
 *
 * When a complete Supabase Auth profile is passed (display_name + gender both
 * set), the name / gender / level inputs are replaced by a compact identity
 * summary card so the user can confirm their details at a glance and proceed
 * directly to quantity + notes + submit.
 *
 * Guests (profile = null) always see the full form.
 *
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
 *   profile?: object|null,
 * }} props
 */
export default function RegistrationForm({
  form, onChange, onQuantityChange, onSubmit, error, event, spotsLeft,
  isWaitlisted = false, isSubmitting = false,
  profile = null,
}) {
  const { t } = useTranslation()

  const GENDER_OPTIONS = [
    { value: 'male',   label: t('form.male')   },
    { value: 'female', label: t('form.female') },
    { value: 'other',  label: t('form.other')  },
  ]

  // Show the compact summary card when the profile has enough info to skip manual entry
  const hasProfileSummary = Boolean(profile?.display_name && profile?.gender)

  return (
    <div>
      {/* Step indicator header */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-base font-semibold" style={{ color: '#4B4552' }}>{t('form.title')}</h2>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="w-2 h-2 rounded-full bg-violet-100" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">

        {hasProfileSummary ? (
          /* ── One-tap registration (logged-in user with complete profile) ──
             All manual inputs are hidden. A single compact card shows identity
             on the left and the quantity stepper on the right. The form values
             are pre-filled by EventPage and submitted unchanged.             */
          <>
            {/* Identity + quantity card */}
            <div className="bg-violet-50/80 p-4 rounded-2xl flex items-center justify-between gap-4">
              {/* Left: identity summary — just the display name, clean and fast */}
              <div className="min-w-0">
                <p className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase mb-1">
                  当前报名身份
                </p>
                <p className="text-sm font-semibold truncate" style={{ color: '#4B4552' }}>
                  👤 {profile.display_name}
                </p>
              </div>

              {/* Right: quantity stepper */}
              {!isWaitlisted && (
                <div className="shrink-0">
                  <QuantityStepper
                    value={form.quantity}
                    onChange={onQuantityChange}
                    max={Math.min(3, spotsLeft)}
                  />
                </div>
              )}
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            {/* Submit — directly below the card, no other fields */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2 ${
                isWaitlisted ? 'btn-secondary border-2 border-dashed border-violet-200' : 'btn-primary'
              }`}
            >
              {isSubmitting && (
                <span className={`w-4 h-4 rounded-full border-2 animate-spin ${
                  isWaitlisted ? 'border-violet-200 border-t-violet-500' : 'border-white/40 border-t-white'
                }`} />
              )}
              {isSubmitting
                ? t('common.submitting')
                : isWaitlisted
                  ? t('form.joinWaitlist')
                  : event.price > 0 && event.payment_methods?.length > 0
                    ? t('form.nextPayment')
                    : t('form.confirm')}
            </button>
          </>

        ) : (
          /* ── Full form (guest or incomplete profile) ─────────────────── */
          <>
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

            {/* Skill level */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">{t('form.levelLabel')}</label>
              <select className="input-field text-base" name="level" value={form.level} onChange={onChange}>
                <option value="">{t('form.levelNone')}</option>
                {LEVEL_OPTIONS.map(v => (
                  <option key={v} value={v}>{t('form.level', { n: v })}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
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
                <span className={`w-4 h-4 rounded-full border-2 animate-spin ${
                  isWaitlisted ? 'border-violet-200 border-t-violet-500' : 'border-white/40 border-t-white'
                }`} />
              )}
              {isSubmitting
                ? t('common.submitting')
                : isWaitlisted
                  ? t('form.joinWaitlist')
                  : event.price > 0 && event.payment_methods?.length > 0
                    ? t('form.nextPayment')
                    : t('form.confirm')}
            </button>
          </>
        )}

      </form>
    </div>
  )
}
