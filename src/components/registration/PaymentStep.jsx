import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import BankInfo from './BankInfo'
import CopyButton from '../ui/CopyButton'

/**
 * Step 2 of registration: payment instructions + screenshot upload.
 *
 * Supports:
 *   - Free events (price === 0 or payment_methods is empty)
 *   - Single payment method (wechat or bank)
 *   - Dual payment methods (wechat + bank) → registrant picks one via radio group
 *   - Backward compat: old `payment_method` string field is treated as a 1-element array
 *
 * @param {{
 *   event: import('../../types').BadmintonEvent,
 *   quantity: number,
 *   onSubmit: (screenshot: string | null) => void,
 *   onBack: () => void,
 *   submitting: boolean,
 * }} props
 */
export default function PaymentStep({ event, quantity, onSubmit, onBack, submitting }) {
  // ── Resolve payment methods ───────────────────────────────────────────────
  // Support both new (payment_methods array) and old (payment_method string) formats
  const paymentMethods = Array.isArray(event.payment_methods) && event.payment_methods.length > 0
    ? event.payment_methods
    : (event.payment_method && event.payment_method !== 'free' ? [event.payment_method] : [])

  const isFree      = event.price === 0 || paymentMethods.length === 0
  const hasMultiple = paymentMethods.length > 1

  // Default to first available method; user can switch if hasMultiple
  const [paymentChoice, setPaymentChoice] = useState(paymentMethods[0] || 'wechat')

  // Derived: which panels to show
  const showWechat = paymentMethods.includes('wechat') && (!hasMultiple || paymentChoice === 'wechat')
  const showBank   = paymentMethods.includes('bank')   && (!hasMultiple || paymentChoice === 'bank')

  // ── Screenshot state ──────────────────────────────────────────────────────
  const [screenshot, setScreenshot] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Free event ───────────────────────────────────────────────────── */}
      {isFree ? (
        <div className="bg-gray-50 rounded-2xl px-5 py-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm text-gray-950 font-medium">本次活动免费</p>
          <p className="text-sm text-gray-400 mt-1">无需付款，直接确认报名</p>
        </div>

      /* ── Paid event ──────────────────────────────────────────────────── */
      ) : (
        <>
          {/* Amount card */}
          <div className="bg-brand text-white rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70 mb-0.5">应付金额</p>
              <p className="text-xl font-semibold">AUD$ {totalAmount}</p>
            </div>
            {quantity > 1 && (
              <p className="text-xs text-white/60">AUD$ {event.price} × {quantity} 人</p>
            )}
          </div>

          {/* Payment method selector — only shown when both wechat & bank are available */}
          {hasMultiple && (
            <div>
              <p className="text-xs text-gray-400 mb-3">选择支付方式</p>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentChoice(method)}
                    className={`py-3 rounded-xl text-sm border font-medium transition-all ${
                      paymentChoice === method
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {method === 'wechat' ? '💚 微信扫码' : '🏦 银行转账'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── WeChat panel ─────────────────────────────────────────────── */}
          {showWechat && (
            <div className="space-y-4">
              {!hasMultiple && (
                <p className="text-xs text-gray-400">微信扫码付款</p>
              )}

              {/* wechat_note — LARGE, BOLD, high-contrast block */}
              {event.wechat_note && (
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 px-5 py-5">
                  <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold text-center mb-3">
                    ⚠️ 转账备注 / RMB 金额
                  </p>
                  {/* break-all prevents long numbers/strings from overflowing on mobile */}
                  <p className="text-2xl font-bold text-amber-800 text-center break-all leading-snug word-wrap">
                    {event.wechat_note}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-xs text-amber-600 font-medium">一键复制</span>
                    <CopyButton text={event.wechat_note} />
                  </div>
                </div>
              )}

              {/* QR code */}
              {event.wechat_qr ? (
                <div className="flex justify-center">
                  <img
                    src={event.wechat_qr}
                    alt="微信收款码"
                    className="w-48 h-48 rounded-2xl object-cover border border-gray-200"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-400">组织者尚未上传收款码</p>
                  <p className="text-xs text-gray-300 mt-1">请联系组织者获取付款方式</p>
                </div>
              )}
            </div>
          )}

          {/* ── Bank panel ───────────────────────────────────────────────── */}
          {showBank && (
            <div className={hasMultiple ? '' : ''}>
              {!hasMultiple && (
                <p className="text-xs text-gray-400 mb-3">银行转账 / PayID</p>
              )}
              <BankInfo event={event} />
            </div>
          )}

          {/* Screenshot upload */}
          <div>
            <p className="text-xs text-gray-400 mb-3">上传付款截图</p>
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="付款截图"
                  className="w-full max-h-64 object-contain rounded-2xl border border-gray-200 bg-gray-50"
                />
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
