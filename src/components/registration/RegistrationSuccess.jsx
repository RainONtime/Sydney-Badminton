import { Check, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Step 3: confirmation message after registration is submitted.
 * @param {{
 *   event: import('../../types').BadmintonEvent,
 *   name: string,
 *   onReset: () => void,
 *   isWaitlisted?: boolean,
 * }} props
 */
export default function RegistrationSuccess({ event, name, onReset, isWaitlisted = false }) {
  const { t } = useTranslation()
  const isFree = event.price === 0 || !event.payment_methods?.length

  if (isWaitlisted) {
    return (
      <div>
        <div className="flex items-start gap-4 mb-8">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={14} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-950">{t('success.waitlistTitle')}</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {t('success.waitlistBody', { name })}
            </p>
            <button
              onClick={onReset}
              className="text-xs text-gray-400 hover:text-gray-950 mt-4 underline underline-offset-2 transition-colors"
            >
              {t('success.backToEvent')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start gap-4 mb-8">
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 mt-0.5">
          <Check size={14} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-950">
            {isFree ? t('success.confirmedTitle') : t('success.pendingTitle')}
          </p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {isFree
              ? t('success.confirmedBody', { name })
              : t('success.pendingBody')}
          </p>
          <button
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-gray-950 mt-4 underline underline-offset-2 transition-colors"
          >
            {t('success.registerAgain')}
          </button>
        </div>
      </div>
    </div>
  )
}
