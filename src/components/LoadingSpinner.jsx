export default function LoadingSpinner({ text = '加载中' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-300">
      <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />
      <p className="text-xs text-gray-400">{text}</p>
    </div>
  )
}
