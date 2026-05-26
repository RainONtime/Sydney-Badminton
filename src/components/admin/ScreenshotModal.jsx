import { X } from 'lucide-react'

/** @param {{ src: string, onClose: () => void }} props */
export default function ScreenshotModal({ src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <img src={src} alt="付款截图" className="w-full rounded-2xl shadow-xl" />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
