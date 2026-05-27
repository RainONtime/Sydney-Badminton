import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2, Plus, Check, X, Eye, EyeOff } from 'lucide-react'
import {
  getOrganizers,
  addOrganizer,
  deleteOrganizer,
  updateOrganizerPassword,
} from '../../services/dataService'
import { getAdminUser } from '../../services/authService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminOrganizers() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = getAdminUser()

  useEffect(() => {
    if (user?.role !== 'super') navigate('/admin', { replace: true })
  }, [])

  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)

  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', password: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editPassword, setEditPassword] = useState('')

  const [actingId, setActingId] = useState(null)
  const [showPwd, setShowPwd] = useState({})
  const [bannerError, setBannerError] = useState('')

  useEffect(() => {
    getOrganizers().then(({ data }) => {
      setOrganizers(data || [])
      setLoading(false)
    })
  }, [])

  async function handleAdd() {
    setFormError('')
    if (!newForm.name.trim()) { setFormError(t('admin.organizers.errorName')); return }
    if (!newForm.password.trim()) { setFormError(t('admin.organizers.errorPassword')); return }
    setSaving(true)
    const { data, error } = await addOrganizer(newForm)
    setSaving(false)
    if (error) { setFormError(error.message); return }
    setOrganizers(prev => [...prev, data])
    setNewForm({ name: '', password: '' })
    setAdding(false)
  }

  async function handleDelete(org) {
    if (!confirm(t('admin.organizers.deleteConfirm', { name: org.name }))) return
    setBannerError('')
    setActingId(org.id)
    const { error } = await deleteOrganizer(org.id)
    setActingId(null)
    if (error) {
      if (error.message === 'HAS_ACTIVE_EVENTS') {
        setBannerError(t('admin.organizers.deleteHasEvents', { name: org.name, count: error.count }))
      } else {
        setBannerError(error.message)
      }
      return
    }
    setOrganizers(prev => prev.filter(o => o.id !== org.id))
  }

  function startEditPassword(org) {
    setEditingId(org.id)
    setEditPassword('')
    setBannerError('')
  }

  async function handleSavePassword(org) {
    setBannerError('')
    setActingId(org.id)
    const { error } = await updateOrganizerPassword(org.id, editPassword)
    setActingId(null)
    if (error) { setBannerError(error.message); return }
    setOrganizers(prev =>
      prev.map(o => o.id === org.id ? { ...o, password: editPassword.trim() } : o)
    )
    setEditingId(null)
    setEditPassword('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditPassword('')
  }

  function toggleShowPwd(id) {
    setShowPwd(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) return <div className="max-w-2xl mx-auto px-5 py-12"><LoadingSpinner /></div>

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-400 mb-8 transition-colors">
        <ArrowLeft size={13} /> {t('admin.organizers.backToEvents')}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#4B4552' }}>
            {t('admin.organizers.pageTitle')}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {t('admin.organizers.count', { count: organizers.length })}
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setFormError(''); setNewForm({ name: '', password: '' }) }}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} /> {t('admin.organizers.addButton')}
          </button>
        )}
      </div>

      {bannerError && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 leading-relaxed flex items-start gap-2">
          <span className="flex-1">{bannerError}</span>
          <button onClick={() => setBannerError('')} className="shrink-0 mt-0.5">
            <X size={12} className="text-red-400" />
          </button>
        </div>
      )}

      {adding && (
        <div className="card p-5 mb-6">
          <p className="text-sm font-medium mb-4" style={{ color: '#4B4552' }}>
            {t('admin.organizers.addTitle')}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">{t('admin.organizers.nameLabel')}</label>
              <input
                className="input-field"
                placeholder={t('admin.organizers.namePlaceholder')}
                value={newForm.name}
                onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">{t('admin.organizers.passwordLabel')}</label>
              <input
                className="input-field"
                placeholder={t('admin.organizers.passwordPlaceholder')}
                value={newForm.password}
                onChange={e => setNewForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
          </div>
          {formError && <p className="text-xs text-red-500 mb-3">{formError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="btn-primary text-xs px-4 py-2 disabled:opacity-40"
            >
              {saving ? t('admin.organizers.saving') : t('admin.organizers.save')}
            </button>
            <button
              onClick={() => { setAdding(false); setFormError('') }}
              className="btn-secondary text-xs px-4 py-2"
            >
              {t('admin.organizers.cancel')}
            </button>
          </div>
        </div>
      )}

      {organizers.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400">{t('admin.organizers.empty')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 w-8">
                  {t('admin.organizers.colIndex')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">
                  {t('admin.organizers.colName')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">
                  {t('admin.organizers.colPassword')}
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right w-20">
                  {t('admin.organizers.colActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((org, idx) => {
                const isEditing = editingId === org.id
                const isActing  = actingId === org.id
                const pwdVisible = showPwd[org.id]

                return (
                  <tr
                    key={org.id}
                    className={`${idx < organizers.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-5 py-3.5 text-xs text-gray-300">{idx + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: '#4B4552' }}>{org.name}</td>

                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSavePassword(org); if (e.key === 'Escape') cancelEdit() }}
                            autoFocus
                            placeholder={t('admin.organizers.newPasswordPlaceholder')}
                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-gray-400 w-32"
                            style={{ color: '#4B4552' }}
                          />
                          <button
                            onClick={() => handleSavePassword(org)}
                            disabled={isActing}
                            className="p-1 rounded text-green-600 hover:bg-green-50 transition-all disabled:opacity-30"
                            title={t('admin.organizers.save')}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 rounded text-gray-400 hover:bg-gray-100 transition-all"
                            title={t('admin.organizers.cancel')}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          <span className="text-sm font-mono text-gray-400 tracking-wider">
                            {pwdVisible ? org.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => toggleShowPwd(org.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-300 hover:text-gray-600 transition-all"
                            title={pwdVisible ? t('admin.organizers.hidePassword') : t('admin.organizers.showPassword')}
                          >
                            {pwdVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        {!isEditing && (
                          <button
                            onClick={() => startEditPassword(org)}
                            disabled={isActing}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all disabled:opacity-30"
                            title={t('admin.organizers.editPasswordTitle')}
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(org)}
                          disabled={isActing || isEditing}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                          title={t('admin.organizers.deleteTitle')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-gray-300 mt-5 text-center leading-relaxed">
        {t('admin.organizers.passwordNote')}
      </p>
    </div>
  )
}
