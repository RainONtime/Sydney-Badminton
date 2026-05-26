import { Check, Clock } from 'lucide-react'

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
  const isFree = event.price === 0 || !event.payment_methods?.length

  if (isWaitlisted) {
    return (
      <div>
        <div className="flex items-start gap-4 mb-8">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={14} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-950">已加入候补名单</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {name}，当前名额已满，你已排入候补队列。若有人退出，组织者会将你转为正式报名并通知你。
            </p>
            <button
              onClick={onReset}
              className="text-xs text-gray-400 hover:text-gray-950 mt-4 underline underline-offset-2 transition-colors"
            >
              返回活动页
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
            {isFree ? '报名成功！' : '已提交，等待确认'}
          </p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {isFree
              ? `${name}，你已完成报名，请按时到场。`
              : `组织者确认付款后，你的报名将正式生效。`}
          </p>
          <button
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-gray-950 mt-4 underline underline-offset-2 transition-colors"
          >
            再报一次
          </button>
        </div>
      </div>
    </div>
  )
}
