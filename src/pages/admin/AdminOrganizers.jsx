import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const user = getAdminUser()

  // Guard: only super admin may access this page
  useEffect(() => {
    if (user?.role !== 'super') navigate('/admin', { replace: true })
  }, [])

  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)

  // "Add organizer" inline form
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', password: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Inline password editor
  const [editingId, setEditingId] = useState(null)
  const [editPassword, setEditPassword] = useState('')

  // Per-row loading state
  const [actingId, setActingId] = useState(null)

  // Toggle password visibility per row
  const [showPwd, setShowPwd] = useState({})

  // Global error banner (for delete failures, password save failures)
  const [bannerError, setBannerError] = useState('')

  useEffect(() => {
    getOrganizers().then(({ data }) => {
      setOrganizers(data || [])
      setLoading(false)
    })
  }, [])

  // ── Add ──────────────────────────────────────────────────────────────────

  async function handleAdd() {
    setFormError('')
    if (!newForm.name.trim()) { setFormError('请填写名字'); return }
    if (!newForm.password.trim()) { setFormError('请填写密码'); return }
    setSaving(true)
    const { data, error } = await addOrganizer(newForm)
    setSaving(false)
    if (error) { setFormError(error.message); return }
    setOrganizers(prev => [...prev, data])
    setNewForm({ name: '', password: '' })
    setAdding(false)
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete(org) {
    if (!confirm(`删除组织者「${org.name}」？此操作无法撤回。`)) return
    setBannerError('')
    setActingId(org.id)
    const { error } = await deleteOrganizer(org.id)
    setActingId(null)
    if (error) {
      if (error.message === 'HAS_ACTIVE_EVENTS') {
        setBannerError(
          `无法删除「${org.name}」：该账号下还有 ${error.count} 个进行中的活动。` +
          `请先将相关活动改为「已结束」或「已取消」，再执行删除。`
        )
      } else {
        setBannerError(error.message)
      }
      return
    }
    setOrganizers(prev => prev.filter(o => o.id !== org.id))
  }

  // ── Edit password ─────────────────────────────────────────────────────────

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
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-950 mb-8 transition-colors">
        <ArrowLeft size={13} /> 活动管理
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-950 tracking-tight">组织者管理</h1>
          <p className="text-sm text-gray-400 mt-0.5">{organizers.length} 个组织者账号</p>
        </div>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setFormError(''); setNewForm({ name: '', password: '' }) }}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} /> 添加组织者
          </button>
        )}
      </div>

      {/* Error banner */}
      {bannerError && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 leading-relaxed flex items-start gap-2">
          <span className="flex-1">{bannerError}</span>
          <button onClick={() => setBannerError('')} className="shrink-0 mt-0.5">
            <X size={12} className="text-red-400" />
          </button>
        </div>
      )}

      {/* Add organizer form */}
      {adding && (
        <div className="card p-5 mb-6">
          <p className="text-sm font-medium text-gray-950 mb-4">添加新组织者</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">名字</label>
              <input
                className="input-field"
                placeholder="组织者昵称"
                value={newForm.name}
                onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">登录密码</label>
              <input
                className="input-field"
                placeholder="设置密码（须唯一）"
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
              {saving ? '保存中…' : '保存'}
            </button>
            <button
              onClick={() => { setAdding(false); setFormError('') }}
              className="btn-secondary text-xs px-4 py-2"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Organizer table */}
      {organizers.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400">还没有组织者账号</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 w-8">#</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">名字</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">登录密码</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right w-20">操作</th>
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
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-950">{org.name}</td>

                    {/* Password cell */}
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSavePassword(org); if (e.key === 'Escape') cancelEdit() }}
                            autoFocus
                            placeholder="新密码"
                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-950 focus:outline-none focus:border-gray-400 w-32"
                          />
                          <button
                            onClick={() => handleSavePassword(org)}
                            disabled={isActing}
                            className="p-1 rounded text-green-600 hover:bg-green-50 transition-all disabled:opacity-30"
                            title="保存"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 rounded text-gray-400 hover:bg-gray-100 transition-all"
                            title="取消"
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
                            title={pwdVisible ? '隐藏' : '显示密码'}
                          >
                            {pwdVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        {!isEditing && (
                          <button
                            onClick={() => startEditPassword(org)}
                            disabled={isActing}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-all disabled:opacity-30"
                            title="修改密码"
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(org)}
                          disabled={isActing || isEditing}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                          title="删除组织者"
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

      {/* Note about password uniqueness */}
      <p className="text-[11px] text-gray-300 mt-5 text-center leading-relaxed">
        每个密码须唯一（Mock 模式通过密码区分账号）。接入 Supabase Auth 后将改为邮箱 + 密码登录。
      </p>
    </div>
  )
}
