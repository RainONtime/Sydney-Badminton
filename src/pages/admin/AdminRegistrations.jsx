import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Trash2, Download, X, Check, Pencil, Eye } from 'lucide-react'
import { getEventById, getAdminRegistrationsByEvent, deleteRegistration, updateRegistrationStatus, updateRegistrationQuantity, promoteWaitlistedRegistration } from '../../services/dataService'
import { getAdminUser } from '../../services/authService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import RegistrationDetailsModal from '../../components/admin/RegistrationDetailsModal'

export default function AdminRegistrations() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const user = getAdminUser()

  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [detailReg, setDetailReg] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState(1)
  const [promoteError, setPromoteError] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: ev }, { data: regs }] = await Promise.all([
        getEventById(id),
        getAdminRegistrationsByEvent(id),
      ])

      if (ev && user?.role === 'organizer' && ev.organizer_id !== user.id) {
        navigate('/admin', { replace: true })
        return
      }

      setEvent(ev)
      setRegistrations(regs || [])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleConfirm(reg) {
    setActing(reg.id)
    await updateRegistrationStatus(reg.id, id, 'confirmed')
    setRegistrations(r => r.map(x => x.id === reg.id ? { ...x, payment_status: 'confirmed' } : x))
    setActing(null)
  }

  async function handleReject(reg) {
    if (!confirm(t('admin.registrations.rejectConfirm', { name: reg.name }))) return
    setActing(reg.id)
    await deleteRegistration(reg.id)
    setRegistrations(r => r.filter(x => x.id !== reg.id))
    setActing(null)
  }

  function startEditQty(reg) {
    setEditingId(reg.id)
    setEditQty(reg.quantity || 1)
  }

  async function handleSaveQty(reg) {
    if (editQty < 1) {
      alert(t('admin.registrations.quantityZeroAlert'))
      return
    }
    if (editQty === (reg.quantity || 1)) { setEditingId(null); return }
    setActing(reg.id)
    await updateRegistrationQuantity(reg.id, id, editQty)
    setRegistrations(r => r.map(x => x.id === reg.id ? { ...x, quantity: editQty } : x))
    setActing(null)
    setEditingId(null)
  }

  async function handleDelete(reg) {
    if (!confirm(t('admin.registrations.deleteConfirm', { name: reg.name }))) return
    setActing(reg.id)
    await deleteRegistration(reg.id)
    setRegistrations(r => r.filter(x => x.id !== reg.id))
    setActing(null)
  }

  async function handlePromote(reg) {
    setPromoteError('')
    setActing(reg.id)
    const { error: err } = await promoteWaitlistedRegistration(reg.id, id)
    setActing(null)
    if (err) {
      if (err.message === 'NO_SPOTS_AVAILABLE') {
        setPromoteError(t('admin.registrations.noSpotsError', { name: reg.name }))
      } else {
        setPromoteError(err.message)
      }
      return
    }
    setRegistrations(r => r.map(x => x.id === reg.id ? { ...x, payment_status: 'pending' } : x))
  }

  function exportCSV() {
    const genderLabel = g => t(`admin.registrations.gender.${g}`) || g || ''
    const statusLabel = s =>
      s === 'confirmed' ? t('admin.registrations.confirmed')
      : s === 'waitlisted' ? t('admin.registrations.waitlisted')
      : t('admin.registrations.pending')

    const header = ['#', t('admin.registrations.columns.name'), t('admin.registrations.columns.gender'),
      'Level', t('admin.registrations.columns.quantity'), 'Status', t('admin.registrations.columns.notes'), 'Date']
    const rows = registrations.map((r, i) => [
      i + 1, r.name,
      genderLabel(r.gender),
      r.skill_level ? `${r.skill_level}` : '',
      r.quantity || 1,
      statusLabel(r.payment_status),
      r.notes || '',
      format(parseISO(r.created_at), 'MM-dd HH:mm'),
    ])
    const csv = [header, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const eventTitle = (i18n.language === 'en' && event?.title_en) ? event.title_en : (event?.title || 'registrations')
    a.download = `${eventTitle}_registrations.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="max-w-4xl mx-auto px-5 py-12"><LoadingSpinner /></div>

  const confirmedCount  = registrations.filter(r => r.payment_status === 'confirmed').reduce((s, r) => s + (r.quantity || 1), 0)
  const pendingCount    = registrations.filter(r => r.payment_status === 'pending').reduce((s, r) => s + (r.quantity || 1), 0)
  const waitlistedCount = registrations.filter(r => r.payment_status === 'waitlisted').reduce((s, r) => s + (r.quantity || 1), 0)

  const eventTitle = (i18n.language === 'en' && event?.title_en) ? event.title_en : event?.title

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      {detailReg && <RegistrationDetailsModal registration={detailReg} onClose={() => setDetailReg(null)} />}

      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-400 mb-8 transition-colors">
        <ArrowLeft size={13} /> {t('admin.registrations.backToEvents')}
      </Link>

      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#4B4552' }}>{eventTitle}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="font-medium" style={{ color: '#4B4552' }}>{confirmedCount}</span>
            {' '}{t('admin.registrations.confirmed')}
            {pendingCount > 0 && (
              <> · <span className="text-amber-600 font-medium">{pendingCount}</span> {t('admin.registrations.pending')}</>
            )}
            {event && <span className="text-gray-300 ml-1">/ {event.max_participants}</span>}
            {waitlistedCount > 0 && (
              <> · <span className="text-purple-500 font-medium">{waitlistedCount}</span> {t('admin.registrations.waitlisted')}</>
            )}
          </p>
        </div>
        {registrations.length > 0 && (
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5 text-xs shrink-0">
            <Download size={13} /> {t('admin.registrations.exportCSV')}
          </button>
        )}
      </div>

      {promoteError && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 leading-relaxed flex items-start gap-2">
          <span className="flex-1">{promoteError}</span>
          <button onClick={() => setPromoteError('')} className="shrink-0 mt-0.5">
            <X size={12} className="text-red-400" />
          </button>
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400">{t('admin.registrations.empty')}</p>
        </div>
      ) : (
        <div className="card overflow-x-auto pb-1">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 w-8">{t('admin.registrations.columns.index')}</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">{t('admin.registrations.columns.name')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">{t('admin.registrations.columns.gender')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">{t('admin.registrations.columns.level')}</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">{t('admin.registrations.columns.quantity')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">{t('admin.registrations.columns.status')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 hidden lg:table-cell">{t('admin.registrations.columns.notes')}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right">{t('admin.registrations.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, idx) => {
                const isPending    = reg.payment_status === 'pending'
                const isWaitlisted = reg.payment_status === 'waitlisted'
                const isActing     = acting === reg.id
                const genderKey    = ['male', 'female', 'other'].includes(reg.gender) ? reg.gender : null
                return (
                  <tr
                    key={reg.id}
                    className={`${idx < registrations.length - 1 ? 'border-b border-gray-100' : ''} ${isPending ? 'bg-amber-50/40' : isWaitlisted ? 'bg-purple-50/40' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-5 py-3.5 text-xs text-gray-300">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium" style={{ color: '#4B4552' }}>{reg.name}</span>
                      {(reg.quantity || 1) > 1 && (
                        <span className="text-xs text-gray-400 ml-1">×{reg.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 hidden sm:table-cell">
                      {genderKey ? t(`admin.registrations.gender.${genderKey}`) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 hidden sm:table-cell">
                      {reg.skill_level ? `${reg.skill_level} 级` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center">
                      {editingId === reg.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <select
                            value={editQty}
                            onChange={e => setEditQty(Number(e.target.value))}
                            autoFocus
                            className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none focus:border-gray-400"
                            style={{ color: '#4B4552' }}
                          >
                            {Array.from({ length: reg.quantity || 1 }, (_, i) => i + 1).map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveQty(reg)}
                            disabled={isActing}
                            className="p-1 rounded text-green-600 hover:bg-green-50 transition-all disabled:opacity-30"
                            title={t('admin.registrations.actions.save')}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded text-gray-400 hover:bg-gray-100 transition-all"
                            title={t('admin.registrations.actions.cancel')}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 group">
                          <span className={(reg.quantity || 1) > 1 ? 'font-medium' : 'text-gray-400'} style={(reg.quantity || 1) > 1 ? { color: '#4B4552' } : {}}>
                            {reg.quantity || 1}
                          </span>
                          {(reg.quantity || 1) > 1 && (
                            <button
                              onClick={() => startEditQty(reg)}
                              disabled={isActing}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-300 hover:text-gray-600 transition-all disabled:opacity-30"
                              title={t('admin.registrations.actions.editQty')}
                            >
                              <Pencil size={10} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={reg.payment_status} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-400 hidden lg:table-cell max-w-[160px] truncate">
                      {reg.notes || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailReg(reg)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-violet-500 hover:bg-violet-50 transition-all"
                          title={t('admin.registrations.actions.details')}
                        >
                          <Eye size={13} />
                        </button>

                        {isWaitlisted && (
                          <>
                            <button
                              onClick={() => handlePromote(reg)}
                              disabled={isActing}
                              className="text-[10px] text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-2 py-1 transition-all disabled:opacity-30 whitespace-nowrap"
                              title={t('admin.registrations.actions.promote')}
                            >
                              {isActing ? t('admin.registrations.actions.acting') : t('admin.registrations.actions.promoteShort')}
                            </button>
                            <button
                              onClick={() => handleDelete(reg)}
                              disabled={isActing}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                              title={t('admin.registrations.actions.removeWaitlist')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleConfirm(reg)}
                              disabled={isActing}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-30"
                              title={t('admin.registrations.actions.confirm')}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(reg)}
                              disabled={isActing}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                              title={t('admin.registrations.actions.reject')}
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {!isPending && !isWaitlisted && (
                          <button
                            onClick={() => handleDelete(reg)}
                            disabled={isActing}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                            title={t('admin.registrations.actions.delete')}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
