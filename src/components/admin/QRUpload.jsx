import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

/** @param {{ value: string, onChange: (v: string) => void }} props */
export default function QRUpload({ value, onChange }) {
  const fileRef = useRef()
  const [drag, setDrag] = useState(false)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onChange(e.target.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  if (value) {
    return (
      <div className="relative inline-block">
        <img src={value} alt="收款码" className="w-40 h-40 rounded-xl object-cover border border-gray-200" />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-950 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all w-40 h-40 flex flex-col items-center justify-center ${
          drag ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <Upload size={18} className="text-gray-300 mb-1.5" />
        <p className="text-xs text-gray-400">上传收款码</p>
        <p className="text-[10px] text-gray-300 mt-0.5">JPG / PNG</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
    </>
  )
}
