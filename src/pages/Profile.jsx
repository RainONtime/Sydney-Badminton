import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, User } from 'lucide-react'
import { getSession } from '../services/authService'
import { getUserProfile, updateUserProfile } from '../services/dataService'

const LEVEL_OPTIONS = ['1', '2', '3', '4', '5', '6']

const EMPTY_PROFILE = {
  display_name:   '',
  gender:         '',
  skill_level:    '',
  contact_info:   '',
  refund_account: '',
}

export default function Profile() {
  const { t } = useTranslation()

  const [userId, setUserId]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [loadErr, setLoadErr]   = useState('')
  const [profile, setProfile]   = useState(EMPTY_PROFILE)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState('') // success | error message

  const GENDER_OPTIONS = [
    { value: 'male',   label: t('form.male')   },
    { value: 'female', label: t('form.female') },
    { value: 'other',  label: t('form.other')  },
  ]

  /* ── Load session + profile on mount ────────────────────────────── */
  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadErr('')

      const { session } = await getSession()
      if (!session?.user) {
        setLoading(false)
        return // userId stays null → "not logged in" UI
      }

      setUserId(session.user.id)

      const { data, error } = await getUserProfile(session.user.id)
      if (error) {
        setLoadErr(t('profile.loadError'))
        setLoading(false)
        return
      }

      if (data) {
        setProfile({
          display_name:   data.display_name   || '',
          gender:         data.gender         || '',
          skill_level:    data.skill_level    || '',
          contact_info:   data.contact_info   || '',
          refund_account: data.refund_account || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  /* ── Handle field changes ────────────────────────────────────────── */
  function handleChange(e) {
    const { name, value } = e.target
    setProfile(p => ({ ...p, [name]: value }))
    setFeedback('')
  }

  function setGender(value) {
    setProfile(p => ({ ...p, gender: value }))
    setFeedback('')
  }

  /* ── Save profile ────────────────────────────────────────────────── */
  async function handleSave(e) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setFeedback('')

    const { error } = await updateUserProfile(userId, {
      display_name:   profile.display_name.trim()   || null,
      gender:         profile.gender                || null,
      skill_level:    profile.skill_level           || null,
      contact_info:   profile.contact_info.trim()   || null,
      refund_account: profile.refund_account.trim() || null,
    })

    setSaving(false)
    if (error) {
      setFeedback('error')
    } else {
      setFeedback('success')
      // Auto-clear success message after 3 s
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  /* ── Render states ───────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-violet-200 border-t-brand animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div
        className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-12"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-400 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft size={13} /> {t('profile.backToHome')}
        </Link>

        {/* Header card */}
        <div
          className="bg-white rounded-[2rem] p-6 mb-6"
          style={{
            boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
            border: '1px solid rgba(249,168,212,0.2)',
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #A88BFA, #F472B6)' }}
            >
              <User size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: '#4B4552' }}>
                {t('profile.title')}
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('profile.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Not logged in */}
        {!userId ? (
          <div
            className="bg-white rounded-[2rem] p-8 text-center"
            style={{
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              border: '1px solid rgba(249,168,212,0.2)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: '#4B4552' }}>
              {t('profile.notLoggedIn')}
            </p>
            <p className="text-xs text-gray-400">{t('profile.notLoggedInHint')}</p>
          </div>
        ) : (
          /* Profile form */
          <div
            className="bg-white rounded-[2rem] p-6"
            style={{
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              border: '1px solid rgba(249,168,212,0.2)',
            }}
          >
            {loadErr ? (
              <p className="text-xs text-rose-400 text-center py-4">{loadErr}</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">

                {/* Display name */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    {t('profile.displayName')}
                  </label>
                  <input
                    className="input-field text-base"
                    name="display_name"
                    value={profile.display_name}
                    onChange={handleChange}
                    placeholder={t('profile.displayNamePlaceholder')}
                    autoComplete="off"
                  />
                </div>

                {/* Gender — required */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    {t('profile.gender')}
                    <span className="text-rose-500 text-xs ml-1 font-medium">(必填)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDER_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setGender(opt.value)}
                        className={`py-2.5 rounded-xl text-sm border transition-all font-medium ${
                          profile.gender === opt.value
                            ? 'text-white border-transparent'
                            : 'bg-white border-violet-100 hover:border-violet-300'
                        }`}
                        style={
                          profile.gender === opt.value
                            ? { background: 'linear-gradient(135deg, #A88BFA, #F472B6)', color: '#fff' }
                            : { color: '#4B4552' }
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Clear gender */}
                  {profile.gender && (
                    <button
                      type="button"
                      onClick={() => setGender('')}
                      className="mt-1.5 text-[11px] text-gray-300 hover:text-gray-400 transition-colors"
                    >
                      ✕ 清除选择
                    </button>
                  )}
                </div>

                {/* Skill level — optional */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    {t('profile.skillLevel')}
                    <span className="text-gray-400 text-xs ml-1">(选填)</span>
                  </label>
                  <select
                    className="input-field text-base"
                    name="skill_level"
                    value={profile.skill_level}
                    onChange={handleChange}
                  >
                    <option value="">{t('profile.levelNone')}</option>
                    {LEVEL_OPTIONS.map(v => (
                      <option key={v} value={v}>{t('form.level', { n: v })}</option>
                    ))}
                  </select>
                </div>

                {/* Contact info — required */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    {t('profile.contactInfo')}
                    <span className="text-rose-500 text-xs ml-1 font-medium">(必填)</span>
                  </label>
                  <input
                    className="input-field text-base"
                    name="contact_info"
                    value={profile.contact_info}
                    onChange={handleChange}
                    placeholder={t('profile.contactInfoPlaceholder')}
                    autoComplete="off"
                  />
                  <p className="text-[11px] text-gray-300 mt-1.5">
                    {t('profile.contactInfoHint')}
                  </p>
                </div>

                {/* Refund account — optional */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    {t('profile.refundAccount')}
                    <span className="text-gray-400 text-xs ml-1">(选填)</span>
                  </label>
                  <input
                    className="input-field text-base"
                    name="refund_account"
                    value={profile.refund_account}
                    onChange={handleChange}
                    placeholder={t('profile.refundAccountPlaceholder')}
                    autoComplete="off"
                  />
                  <p className="text-[11px] text-gray-300 mt-1.5">
                    {t('profile.refundAccountHint')}
                  </p>
                </div>

                {/* Feedback */}
                {feedback === 'success' && (
                  <p className="text-xs font-medium" style={{ color: '#5eead4' }}>
                    {t('profile.saveSuccess')}
                  </p>
                )}
                {feedback === 'error' && (
                  <p className="text-xs text-rose-400">{t('profile.saveError')}</p>
                )}

                {/* Save button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && (
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  )}
                  {saving ? t('profile.saving') : t('profile.save')}
                </button>

              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
