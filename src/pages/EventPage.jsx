import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check } from 'lucide-react'
import {
  getEventById,
  getRegistrationsByEvent,
  createRegistration,
  deleteRegistration,
  getUserProfile,
  getUserRegistrationForEvent,
} from '../services/dataService'
import { getSession } from '../services/authService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatusBadge from '../components/ui/StatusBadge'
import EventInfo from '../components/event/EventInfo'
import RegistrationForm from '../components/registration/RegistrationForm'
import RegistrationSuccess from '../components/registration/RegistrationSuccess'
import PaymentStep from '../components/registration/PaymentStep'
import ParticipantList from '../components/registration/ParticipantList'

const EMPTY_FORM = { name: '', gender: '', level: '', notes: '', quantity: 1 }

/** Build a form snapshot from a profile object (or return EMPTY_FORM). */
function formFromProfile(profile) {
  if (!profile) return EMPTY_FORM
  return {
    name:     profile.display_name || '',
    gender:   profile.gender       || '',
    level:    profile.skill_level  || '',
    notes:    profile.contact_info ? `联系方式: ${profile.contact_info}` : '',
    quantity: 1,
  }
}

export default function EventPage() {
  const { id } = useParams()
  const { t } = useTranslation()

  // ── Core data ──────────────────────────────────────────────────────────
  const [event, setEvent]               = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [pageError, setPageError]       = useState('')

  // ── Registration flow ──────────────────────────────────────────────────
  const [step, setStep]                 = useState(1)  // 1=form 2=payment 3=success
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [wasWaitlisted, setWasWaitlisted] = useState(false)

  // ── Auth / profile / existing booking ─────────────────────────────────
  const [userProfile, setUserProfile]       = useState(null)
  const [myRegistration, setMyRegistration] = useState(null)

  // ── Cancel flow ────────────────────────────────────────────────────────
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling]       = useState(false)
  const [cancelError, setCancelError]     = useState('')

  // ── Load everything in one shot ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      setPageError('')
      setConfirmCancel(false)
      setCancelError('')

      // Fetch event, registrations, and session concurrently
      const [
        { data: ev, error: evErr },
        { data: regs },
        { session },
      ] = await Promise.all([
        getEventById(id),
        getRegistrationsByEvent(id),
        getSession(),
      ])

      if (evErr) {
        setPageError(t('event.loadError'))
        setLoading(false)
        return
      }

      setEvent(ev)
      setRegistrations(regs || [])

      if (session?.user && ev) {
        // Fetch profile + existing booking concurrently (only for logged-in users)
        const [{ data: profile }, { data: myReg }] = await Promise.all([
          getUserProfile(session.user.id),
          getUserRegistrationForEvent(ev.id, session.user.id),
        ])

        setUserProfile(profile)
        setMyRegistration(myReg)

        // Pre-fill form from profile so RegistrationForm can show the summary card
        setForm(formFromProfile(profile))
      } else {
        setUserProfile(null)
        setMyRegistration(null)
      }

      setLoading(false)
    }
    load()
  }, [id])

  /* ── Guards ─────────────────────────────────────────────────────────── */

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <LoadingSpinner text={t('home.loading')} />
    </div>
  )

  if (pageError) return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <p className="text-sm text-red-400 mb-4">{pageError}</p>
      <Link to="/" className="text-xs text-gray-500 hover:text-gray-950 underline underline-offset-2 transition-colors">
        {t('event.backToHome')}
      </Link>
    </div>
  )

  if (!event) return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <p className="text-sm text-gray-400 mb-4">{t('event.notFound')}</p>
      <Link to="/" className="text-sm text-gray-950 hover:underline">{t('event.backToAll')}</Link>
    </div>
  )

  /* ── Derived state ───────────────────────────────────────────────────── */

  const totalBooked = registrations
    .filter(r => r.payment_status !== 'rejected' && r.payment_status !== 'waitlisted')
    .reduce((sum, r) => sum + (r.quantity || 1), 0)
  const spotsLeft    = event.max_participants - totalBooked
  const isFull       = spotsLeft <= 0
  const isWaitlisted = isFull && event.status === 'active'

  /* ── Registration form handlers ──────────────────────────────────────── */

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleStep1(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError(t('form.errorName')); return }
    if (!form.gender)      { setError(t('form.errorGender')); return }
    setError('')

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
      if (err) { setError(t('form.errorSubmit')); return }
      setRegistrations(r => [...r, data])
      setMyRegistration(data)  // track the new registration immediately
      setWasWaitlisted(true)
      setStep(3)
      return
    }

    if (form.quantity > spotsLeft) { setError(t('form.errorSpots', { count: spotsLeft })); return }
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
    if (err) { setError(t('form.errorSubmit')); setStep(1); return }
    setRegistrations(r => [...r, data])
    setMyRegistration(data)  // track the new registration immediately
    setStep(3)
  }

  function handleReset() {
    setStep(1)
    setWasWaitlisted(false)
    // Restore profile pre-fill so the form is ready for another registration
    setForm(formFromProfile(userProfile))
  }

  /* ── 24-hour proximity check ─────────────────────────────────────────── */

  function hoursUntilEvent() {
    if (!event?.date || !event?.start_time) return Infinity
    const eventDateTime = new Date(`${event.date}T${event.start_time}`)
    return (eventDateTime - new Date()) / (1000 * 60 * 60)
  }

  /* ── Cancel registration handlers ────────────────────────────────────── */

  async function handleCancelRegistration() {
    if (!myRegistration) return
    setCancelling(true)
    setCancelError('')

    const { error } = await deleteRegistration(myRegistration.id)
    setCancelling(false)

    if (error) {
      setCancelError('取消失败，请稍后重试')
      return
    }

    // Update local state — release the spot and allow re-registration
    setRegistrations(r => r.filter(reg => reg.id !== myRegistration.id))
    setMyRegistration(null)
    setConfirmCancel(false)
    setStep(1)
    setForm(formFromProfile(userProfile))
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen">
      <div
        className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-12"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-400 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft size={13} /> {t('event.allEvents')}
        </Link>

        <EventInfo event={event} spotsLeft={spotsLeft} isFull={isFull} />

        <div className="border-t border-violet-100/60 mb-7" />

        {/* ── Registration area ──────────────────────────────────────── */}
        <div className="mb-10">

          {myRegistration ? (
            /* ── 我的门票 card (already registered) ─────────────────── */
            <div
              className="bg-white rounded-[2rem] p-6"
              style={{
                boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                border: '1px solid rgba(134,239,172,0.3)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #86efac, #34d399)' }}
                  >
                    <Check size={15} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#4B4552' }}>
                    我已报名
                  </span>
                </div>
                <StatusBadge status={myRegistration.payment_status} />
              </div>

              {/* Registration details */}
              <div className="bg-violet-50 rounded-2xl px-4 py-3.5 mb-5">
                <p className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase mb-1.5">
                  报名信息
                </p>
                <p className="text-sm font-semibold" style={{ color: '#4B4552' }}>
                  {myRegistration.name}
                  <span className="font-normal text-gray-400">
                    {' · '}{myRegistration.quantity} 人
                    {myRegistration.gender &&
                      ` · ${t(`form.${myRegistration.gender}`)}`}
                    {myRegistration.skill_level &&
                      ` · ${t('form.level', { n: myRegistration.skill_level })}`}
                  </span>
                </p>
                {myRegistration.notes && (
                  <p className="text-xs text-gray-400 mt-1.5 break-all">
                    {myRegistration.notes}
                  </p>
                )}
              </div>

              {/* Cancel section */}
              {cancelError && (
                <p className="text-xs text-rose-400 text-center mb-3">{cancelError}</p>
              )}

              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="w-full py-2.5 text-xs rounded-full font-medium bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                >
                  取消报名
                </button>
              ) : (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-4">
                  {hoursUntilEvent() < 24 ? (
                    <p className="text-xs text-center font-semibold mb-3" style={{ color: '#ef4444' }}>
                      ⚠️ 距离活动开始不足 24 小时，此时取消将【无法退款】。是否确认取消并释放名额？
                    </p>
                  ) : (
                    <p className="text-xs text-center text-gray-500 mb-3">
                      确认取消此次报名？名额将立即释放，此操作不可撤回。
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelRegistration}
                      disabled={cancelling}
                      className="flex-1 py-2.5 text-xs rounded-full font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {cancelling && (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      )}
                      {cancelling ? '处理中…' : '确认取消'}
                    </button>
                    <button
                      onClick={() => { setConfirmCancel(false); setCancelError('') }}
                      className="flex-1 py-2.5 text-xs rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      保留报名
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : step === 3 ? (
            <RegistrationSuccess
              event={event}
              name={form.name}
              onReset={handleReset}
              isWaitlisted={wasWaitlisted}
            />

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
              profile={userProfile}
            />

          ) : step === 2 ? (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-base font-semibold" style={{ color: '#4B4552' }}>
                  {t('event.paymentStep')}
                </h2>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-violet-100" />
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
        <div className="border-t border-violet-100/60 pt-7">
          <h2 className="text-base font-semibold mb-5" style={{ color: '#4B4552' }}>
            {t('event.participantList')}
          </h2>
          <ParticipantList registrations={registrations} />
        </div>
      </div>
    </div>
  )
}
