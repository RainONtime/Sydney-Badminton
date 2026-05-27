import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getEventById, getRegistrationsByEvent, createRegistration } from '../services/dataService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EventInfo from '../components/event/EventInfo'
import RegistrationForm from '../components/registration/RegistrationForm'
import RegistrationSuccess from '../components/registration/RegistrationSuccess'
import PaymentStep from '../components/registration/PaymentStep'
import ParticipantList from '../components/registration/ParticipantList'

const EMPTY_FORM = { name: '', gender: '', level: '', notes: '', quantity: 1 }

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent]               = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [pageError, setPageError]       = useState('') // network / server error
  const [step, setStep]                 = useState(1)  // 1=form 2=payment 3=success
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [wasWaitlisted, setWasWaitlisted] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setPageError('')

      const [{ data: ev, error: evErr }, { data: regs }] = await Promise.all([
        getEventById(id),
        getRegistrationsByEvent(id),
      ])

      if (evErr) {
        // Network / Supabase error — distinct from "event not found"
        setPageError('加载失败，请刷新重试')
        setLoading(false)
        return
      }

      setEvent(ev)             // null if event truly doesn't exist
      setRegistrations(regs || [])
      setLoading(false)
    }
    load()
  }, [id])

  /* ── Guards ──────────────────────────────────────────────────── */

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <LoadingSpinner text="正在加载活动..." />
    </div>
  )

  if (pageError) return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <p className="text-sm text-red-400 mb-4">{pageError}</p>
      <Link to="/" className="text-xs text-gray-500 hover:text-gray-950 underline underline-offset-2 transition-colors">
        ← 返回首页
      </Link>
    </div>
  )

  if (!event) return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <p className="text-sm text-gray-400 mb-4">活动不存在或已删除</p>
      <Link to="/" className="text-sm text-gray-950 hover:underline">← 返回</Link>
    </div>
  )

  /* ── Derived state (only runs when event is ready) ───────────── */

  const totalBooked = registrations
    .filter(r => r.payment_status !== 'rejected' && r.payment_status !== 'waitlisted')
    .reduce((sum, r) => sum + (r.quantity || 1), 0)
  const spotsLeft   = event.max_participants - totalBooked
  const isFull      = spotsLeft <= 0
  const isWaitlisted = isFull && event.status === 'active'

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleStep1(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('请填写名字'); return }
    if (!form.gender)      { setError('请选择性别'); return }
    setError('')

    // Waitlist path: skip payment step, submit directly
    if (isWaitlisted) {
      setSubmitting(true)
      const { data, error: err } = await createRegistration({
        event_id: id,
        name: form.name.trim(),
        gender: form.gender,
        skill_level: form.level || null,
        notes: form.notes.trim() || null,
        quantity: 1,
        payment_status: 'waitlisted',
        payment_screenshot: null,
      })
      setSubmitting(false)
      if (err) { setError('提交失败，请稍后重试'); return }
      setRegistrations(r => [...r, data])
      setWasWaitlisted(true)
      setStep(3)
      return
    }

    if (form.quantity > spotsLeft) { setError(`剩余名额不足，当前仅剩 ${spotsLeft} 个`); return }
    setStep(2)
  }

  async function handlePaymentSubmit(screenshot) {
    setSubmitting(true)
    const isFree = event.price === 0 || !event.payment_methods?.length
    const { data, error: err } = await createRegistration({
      event_id: id,
      name: form.name.trim(),
      gender: form.gender,
      skill_level: form.level || null,
      notes: form.notes.trim() || null,
      quantity: form.quantity,
      payment_status: isFree ? 'confirmed' : 'pending',
      payment_screenshot: screenshot || null,
    })
    setSubmitting(false)
    if (err) { setError('提交失败，请稍后重试'); setStep(1); return }
    setRegistrations(r => [...r, data])
    setStep(3)
  }

  function handleReset() {
    setStep(1)
    setForm(EMPTY_FORM)
    setWasWaitlisted(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <div
        className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-12"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-950 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft size={13} /> 所有活动
        </Link>

        <EventInfo event={event} spotsLeft={spotsLeft} isFull={isFull} />

        <div className="border-t border-gray-200 mb-7" />

        {/* Registration flow */}
        <div className="mb-10">
          {step === 3 ? (
            <RegistrationSuccess event={event} name={form.name} onReset={handleReset} isWaitlisted={wasWaitlisted} />
          ) : step === 1 ? (
            <RegistrationForm
              form={form}
              onChange={handleChange}
              onQuantityChange={q => setForm(f => ({ ...f, quantity: q }))}
              onSubmit={handleStep1}
              error={error}
              event={event}
              spotsLeft={spotsLeft}
              isWaitlisted={isWaitlisted}
              isSubmitting={submitting}
            />
          ) : step === 2 ? (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-base font-semibold text-gray-950">付款</h2>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-gray-200" />
                  <span className="w-2 h-2 rounded-full bg-brand" />
                </div>
              </div>
              <PaymentStep
                event={event}
                quantity={form.quantity}
                onSubmit={handlePaymentSubmit}
                onBack={() => setStep(1)}
                submitting={submitting}
              />
            </div>
          ) : null}
        </div>

        {/* Participant list */}
        <div className="border-t border-gray-200 pt-7">
          <h2 className="text-base font-semibold text-gray-950 mb-5">报名名单</h2>
          <ParticipantList registrations={registrations} />
        </div>
      </div>
    </div>
  )
}
