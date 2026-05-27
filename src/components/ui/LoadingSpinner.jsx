/**
 * @param {{ text?: string }} props
 * text — optional label below the spinner (default: '加载中')
 */
export default function LoadingSpinner({ text = '加载中' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-5 h-5 rounded-full border-2 border-gray-100 border-t-brand animate-spin" />
      {text && <p className="text-xs text-gray-400">{text}</p>}
    </div>
  )
}
