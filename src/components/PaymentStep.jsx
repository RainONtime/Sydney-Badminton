import { useRef, useState } from 'react'
import { Upload, X, Copy, Check } from 'lucide-react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="ml-2 text-gray-400 hover:text-gray-950 transition-colors">
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  )
}

function BankInfo({ event }) {
  const rows = [
    event.payid && { label: 'PayID', value: event.payid },
    event.account_name && { label: 'Account Name', value: event.account_name },
    event.bsb && { label: 'BSB', value: event.bsb },
    event.account_number && { label: 'Account No.', value: event.account_number },
  ].filter(Boolean)

  if (rows.length === 0) return (
    <p className="text-sm text-gray-400">请联系组织者获取付款信息</p>
  )

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

export default function PaymentStep({ event, quantity, onSubmit, onBack, submitting }) {
  const [screenshot, setScreenshot] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const isFree = event.payment_method === 'free' || event.price === 0

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      setScreenshot(e.target.result)
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const totalAmount = (event.price * quantity).toFixed(0)

  return (
    <div className="space-y-6">
      {isFree ? (
        // Free event — no payment needed
        <div className="bg-gray-50 rounded-2xl px-5 py-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm text-gray-950 font-medium">本次活动免费</p>
          <p className="text-sm text-gray-400 mt-1">无需付款，直接确认报名</p>
        </div>
      ) : (
        <>
          {/* Amount reminder */}
          <div className="bg-brand text-white rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">应付金额</p>
              <p className="text-xl font-semibold">AUD$ {totalAmount}</p>
            </div>
            {quantity > 1 && (
              <p className="text-xs text-gray-400">AUD$ {event.price} × {quantity} 人</p>
            )}
          </div>

          {/* Payment method */}
          {event.payment_method === 'wechat' && (
            <div>
              <p className="text-xs text-gray-400 mb-3">微信扫码付款</p>
              {event.wechat_qr ? (
                <div className="flex justify-center">
                  <img src={event.wechat_qr} alt="微信收款码" className="w-48 h-48 rounded-2xl object-cover border border-gray-200" />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-400">组织者尚未上传收款码</p>
                  <p className="text-xs text-gray-300 mt-1">请联系组织者获取付款方式</p>
                </div>
              )}
            </div>
          )}

          {event.payment_method === 'bank' && (
            <div>
              <p className="text-xs text-gray-400 mb-3">银行转账 / PayID</p>
              <BankInfo event={event} />
            </div>
          )}

          {/* Screenshot upload */}
          <div>
            <p className="text-xs text-gray-400 mb-3">上传付款截图</p>

            {preview ? (
              <div className="relative">
                <img src={preview} alt="付款截图" className="w-full max-h-64 object-contain rounded-2xl border border-gray-200 bg-gray-50" />
                <button
                  onClick={() => { setScreenshot(null); setPreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-gray-950/70 text-white rounded-full flex items-center justify-center hover:bg-gray-950 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload size={20} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">点击或拖拽上传截图</p>
                <p className="text-xs text-gray-300 mt-1">支持 JPG、PNG</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary px-5 py-3">
          上一步
        </button>
        <button
          onClick={() => onSubmit(screenshot)}
          disabled={submitting || (!isFree && !screenshot)}
          className="btn-primary flex-1 py-3 disabled:opacity-40"
        >
          {submitting ? '提交中…' : isFree ? '确认报名' : '提交审核'}
        </button>
      </div>
    </div>
  )
}
