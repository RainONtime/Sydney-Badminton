import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X } from 'lucide-react'
import BankInfo from './BankInfo'
import CopyButton from '../ui/CopyButton'
import { compressImage } from '../../utils/imageUtils'
import { uploadPaymentScreenshot } from '../../services/dataService'

/**
 * Step 2 of registration: payment instructions + screenshot upload.
 * Images are compressed client-side for preview, then the original File is
 * uploaded to Supabase Storage (bucket: payment_screenshots). The resulting
 * public URL (not a base64 string) is passed to onSubmit().
 */
export default function PaymentStep({ event, quantity, onSubmit, onBack, submitting }) {
  const { t } = useTranslation()

  // ── Resolve payment methods ───────────────────────────────────────────────
  const paymentMethods = Array.isArray(event.payment_methods) && event.payment_methods.length > 0
    ? event.payment_methods
    : (event.payment_method && event.payment_method !== 'free' ? [event.payment_method] : [])

  const isFree      = event.price === 0 || paymentMethods.length === 0
  const hasMultiple = paymentMethods.length > 1

  const [paymentChoice, setPaymentChoice] = useState(paymentMethods[0] || 'wechat')

  const showWechat = paymentMethods.includes('wechat') && (!hasMultiple || paymentChoice === 'wechat')
  const showBank   = paymentMethods.includes('bank')   && (!hasMultiple || paymentChoice === 'bank')

  // ── Screenshot state ──────────────────────────────────────────────────────
  const [screenshot,   setScreenshot]  = useState(null)  // base64 — preview only
  const [rawFile,      setRawFile]     = useState(null)   // original File — for Storage upload
  const [preview,      setPreview]     = useState(null)
  const [dragOver,     setDragOver]    = useState(false)
  const [compressing,  setCompressing] = useState(false)
  const [uploading,    setUploading]   = useState(false)
  const [uploadError,  setUploadError] = useState('')
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setRawFile(file)        // keep original for Storage upload
    setUploadError('')
    setCompressing(true)
    try {
      const dataUrl = await compressImage(file)
      if (dataUrl) {
        setScreenshot(dataUrl)
        setPreview(dataUrl)
      }
    } catch {
      // Fallback: read original without compression (preview only)
      const reader = new FileReader()
      reader.onload = e => {
        setScreenshot(e.target.result)
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    } finally {
      setCompressing(false)
    }
  }

  async function handleSubmit() {
    if (isFree || !rawFile) {
      // Free event — no upload needed
      onSubmit(null)
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const publicUrl = await uploadPaymentScreenshot(rawFile, event.id)
      onSubmit(publicUrl)
    } catch (err) {
      setUploadError(err.message || '截图上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const totalAmount  = (event.price * quantity).toFixed(0)
  const isProcessing = submitting || compressing || uploading

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Free event ───────────────────────────────────────────────────── */}
      {isFree ? (
        <div className="bg-gray-50 rounded-2xl px-5 py-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm text-gray-950 font-medium">{t('payment.free')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('payment.freeNote')}</p>
        </div>

      /* ── Paid event ──────────────────────────────────────────────────── */
      ) : (
        <>
          {/* Amount card */}
          <div className="bg-brand text-white rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70 mb-0.5">{t('payment.amountLabel')}</p>
              <p className="text-xl font-semibold">AUD$ {totalAmount}</p>
            </div>
            {quantity > 1 && (
              <p className="text-xs text-white/60">AUD$ {event.price} × {quantity} 人</p>
            )}
          </div>

          {/* Payment method selector */}
          {hasMultiple && (
            <div>
              <p className="text-xs text-gray-400 mb-3">{t('payment.chooseMethod')}</p>
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
                    {method === 'wechat' ? t('payment.wechatMethod') : t('payment.bankMethod')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WeChat panel */}
          {showWechat && (
            <div className="space-y-4">
              {!hasMultiple && <p className="text-xs text-gray-400">{t('payment.wechatTitle')}</p>}

              {event.wechat_note && (
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 px-5 py-5">
                  <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold text-center mb-3">
                    {t('payment.wechatNoteLabel')}
                  </p>
                  <p className="text-2xl font-bold text-amber-800 text-center break-all leading-snug">
                    {event.wechat_note}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-xs text-amber-600 font-medium">{t('payment.copy')}</span>
                    <CopyButton text={event.wechat_note} />
                  </div>
                </div>
              )}

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
                  <p className="text-sm text-gray-400">{t('payment.noQR')}</p>
                  <p className="text-xs text-gray-300 mt-1">{t('payment.contactOrganizer')}</p>
                </div>
              )}
            </div>
          )}

          {/* Bank panel */}
          {showBank && (
            <div>
              {!hasMultiple && <p className="text-xs text-gray-400 mb-3">{t('payment.bankTitle')}</p>}
              <BankInfo event={event} />
            </div>
          )}

          {/* Screenshot upload */}
          <div>
            <p className="text-xs text-gray-400 mb-3">{t('payment.uploadLabel')}</p>
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="付款截图"
                  className="w-full max-h-64 object-contain rounded-2xl border border-gray-200 bg-gray-50"
                />
                <button
                  onClick={() => { setScreenshot(null); setPreview(null); setRawFile(null); setUploadError('') }}
                  className="absolute top-2 right-2 w-7 h-7 bg-gray-950/70 text-white rounded-full flex items-center justify-center hover:bg-gray-950 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !compressing && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  compressing
                    ? 'border-gray-200 bg-gray-50 cursor-wait'
                    : dragOver
                      ? 'border-gray-400 bg-gray-50 cursor-pointer'
                      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
              >
                {compressing ? (
                  <>
                    <div className="w-5 h-5 mx-auto mb-2 rounded-full border-2 border-gray-200 border-t-brand animate-spin" />
                    <p className="text-sm text-gray-400">{t('payment.compressing')}</p>
                  </>
                ) : (
                  <>
                    <Upload size={20} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{t('payment.uploadHint')}</p>
                    <p className="text-xs text-gray-300 mt-1">{t('payment.uploadFormats')}</p>
                  </>
                )}
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

      {/* Upload error */}
      {uploadError && (
        <p className="text-xs text-rose-500 text-center -mt-2 font-medium">{uploadError}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onBack} disabled={isProcessing} className="btn-secondary px-5 py-3 disabled:opacity-40">
          {t('common.back')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isProcessing || (!isFree && !screenshot)}
          className="btn-primary flex-1 py-3 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {(submitting || uploading) && (
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          )}
          {uploading
            ? '上传中…'
            : submitting
              ? t('common.submitting')
              : isFree
                ? t('form.confirm')
                : t('payment.submitForReview')}
        </button>
      </div>
    </div>
  )
}
