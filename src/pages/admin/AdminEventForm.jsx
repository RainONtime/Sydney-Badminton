import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  getEventById,
  createEvent,
  updateEvent,
  getOrganizerActiveCount,
} from '../../services/dataService'
import { getAdminUser } from '../../services/authService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import QRUpload from '../../components/admin/QRUpload'

const EMPTY_FORM = {
  title: '', description: '', date: '', start_time: '', end_time: '',
  location: '', max_participants: 20, price: 0, status: 'active',
  organizer_id: '',
  organizer: '',
  organizer_wechat: '',
  // payment_methods: array of enabled methods ('wechat' | 'bank')
  // Empty array = free event (price must also be 0)
  payment_methods: [],
  wechat_qr: '',
  wechat_note: '',
  payid: '', account_name: '', bsb: '', account_number: '',
}

/** Convert legacy string payment_method → payment_methods array */
function migrateLegacyPayment(data) {
  if (Array.isArray(data.payment_methods)) return data
  const method = data.payment_method
  return {
    ...data,
    payment_methods: method && method !== 'free' ? [method] : [],
  }
}

export default function AdminEventForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const user = getAdminUser()
  const isOrg = user?.role === 'organizer'

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  useEffect(() => {
    if (isEdit) {
      getEventById(id).then(({ data }) => {
        if (data) setForm({ ...EMPTY_FORM, ...migrateLegacyPayment(data) })
        setLoading(false)
      })
      return
    }
    // New event: auto-fill organizer for org role + check quota
    if (isOrg && user) {
      setForm(f => ({ ...f, organizer: user.name, organizer_id: user.id }))
      getOrganizerActiveCount(user.id).then(({ count }) => setQuotaExceeded(count >= 3))
    }
  }, [id, isEdit])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      [name]: name === 'max_participants' || name === 'price' ? Number(value) : value,
    }))
  }

  function togglePaymentMethod(method) {
    setForm(f => {
      const has = f.payment_methods.includes(method)
      return {
        ...f,
        payment_methods: has
          ? f.payment_methods.filter(m => m !== method)
          : [...f.payment_methods, method],
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.date || !form.start_time || !form.location) {
      setError('请填写标题、日期、开始时间和地点')
      return
    }

    // Payment method validation (only for paid events)
    if (form.price > 0) {
      if (form.payment_methods.length === 0) {
        setError('付费活动必须至少启用一种支付方式')
        return
      }
      if (
        form.payment_methods.includes('wechat') &&
        !form.wechat_qr &&
        !form.wechat_note
      ) {
        setError('启用微信支付时，请上传收款码或填写转账备注 / RMB 金额')
        return
      }
      if (
        form.payment_methods.includes('bank') &&
        !form.payid &&
        !form.account_number
      ) {
        setError('启用银行转账时，请填写 PayID 或账户号码')
        return
      }
    }

    setSaving(true)
    setError('')

    const payload = { ...form }
    delete payload.id
    delete payload.created_at

    const result = isEdit
      ? await updateEvent(id, payload)
      : await createEvent(payload, user)

    setSaving(false)

    if (result.error) {
      if (result.error.message === 'QUOTA_EXCEEDED') {
        setError('已达同时发布 3 个活动的上限，请先将已有活动改为「已结束」或「已取消」。')
        setQuotaExceeded(true)
      } else {
        setError('保存失败，请重试')
      }
      return
    }
    navigate('/admin')
  }

  if (loading) return <div className="max-w-2xl mx-auto px-5 py-12"><LoadingSpinner /></div>

  const hasWechat = form.payment_methods.includes('wechat')
  const hasBank   = form.payment_methods.includes('bank')
  const submitBlocked = !isEdit && quotaExceeded

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-950 mb-8 transition-colors">
        <ArrowLeft size={13} /> 活动管理
      </Link>

      <h1 className="text-xl font-semibold text-gray-950 tracking-tight mb-8">
        {isEdit ? '编辑活动' : '新建活动'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">活动名称 *</label>
          <input className="input-field" name="title" value={form.title} onChange={handleChange} placeholder="例：周六混双友谊赛" />
        </div>

        {/* Organizer section */}
        {isOrg ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">组织者名字</label>
              <div className="input-field bg-gray-50 text-gray-400 select-none cursor-not-allowed">
                {form.organizer || user?.name}
              </div>
              <p className="text-[11px] text-gray-300 mt-1.5">自动关联当前登录账号</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">组织者微信号</label>
              <input className="input-field" name="organizer_wechat" value={form.organizer_wechat} onChange={handleChange} placeholder="WeChat ID（选填）" />
              <p className="text-[11px] text-gray-300 mt-1.5">填写后，报名者可看到取消退款联系方式</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">组织者名字</label>
              <input className="input-field" name="organizer" value={form.organizer} onChange={handleChange} placeholder="你的名字或昵称（选填）" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">组织者微信号</label>
              <input className="input-field" name="organizer_wechat" value={form.organizer_wechat} onChange={handleChange} placeholder="WeChat ID（选填）" />
              <p className="text-[11px] text-gray-300 mt-1.5">填写后，报名者可看到取消退款联系方式</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">活动描述</label>
          <textarea className="input-field resize-none" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="活动详情、注意事项等（选填）" />
        </div>

        {/* Date / Time */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 sm:col-span-1">
            <label className="block text-xs text-gray-400 mb-1.5">日期 *</label>
            <input className="input-field" type="date" name="date" value={form.date} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">开始时间 *</label>
            <input className="input-field" type="time" name="start_time" value={form.start_time} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">结束时间</label>
            <input className="input-field" type="time" name="end_time" value={form.end_time} onChange={handleChange} />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">地点 *</label>
          <input className="input-field" name="location" value={form.location} onChange={handleChange} placeholder="例：阳光体育中心 3号馆" />
        </div>

        {/* Capacity + Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">最大人数</label>
            <input className="input-field" type="number" name="max_participants" value={form.max_participants} onChange={handleChange} min={1} max={200} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">费用（AUD$，0 = 免费）</label>
            <input className="input-field" type="number" name="price" value={form.price} onChange={handleChange} min={0} step={0.5} />
          </div>
        </div>

        {/* ── Payment methods (only shown when price > 0) ── */}
        {form.price > 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">接受的支付方式（可同时启用两种，报名者自选）</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'wechat', label: '💚 微信收款码' },
                  { value: 'bank',   label: '🏦 银行 / PayID' },
                ].map(opt => {
                  const active = form.payment_methods.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => togglePaymentMethod(opt.value)}
                      className={`py-2.5 rounded-xl text-sm border transition-all font-medium ${
                        active
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}{active ? ' ✓' : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* WeChat config block */}
            {hasWechat && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                <p className="text-xs font-medium text-gray-500">微信收款配置</p>
                <div>
                  <label className="block text-xs text-gray-400 mb-3">微信收款码</label>
                  <QRUpload value={form.wechat_qr} onChange={v => setForm(f => ({ ...f, wechat_qr: v }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    转账备注 / RMB 金额提示
                    <span className="text-gray-300 ml-1">（报名人付款页大字高亮显示）</span>
                  </label>
                  <input
                    className="input-field"
                    name="wechat_note"
                    value={form.wechat_note}
                    onChange={handleChange}
                    placeholder='例：¥138（约 AUD$30）或"周六羽毛球 + 你的名字"'
                  />
                  <p className="text-[11px] text-gray-300 mt-1.5 leading-relaxed">
                    建议填写按当日汇率换算的<strong className="text-gray-400">具体 RMB 金额</strong>，
                    该内容会在报名人付款页放大加粗显示，确保转账金额不出错。
                  </p>
                </div>
              </div>
            )}

            {/* Bank config block */}
            {hasBank && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-3">
                <p className="text-xs font-medium text-gray-500">银行转账 / PayID 配置</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-300 mb-1">PayID（选填）</label>
                    <input className="input-field text-sm" name="payid" value={form.payid} onChange={handleChange} placeholder="email 或手机号" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-300 mb-1">Account Name（选填）</label>
                    <input className="input-field text-sm" name="account_name" value={form.account_name} onChange={handleChange} placeholder="收款人姓名" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-300 mb-1">BSB（选填）</label>
                    <input className="input-field text-sm" name="bsb" value={form.bsb} onChange={handleChange} placeholder="000-000" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-300 mb-1">Account No.（选填）</label>
                    <input className="input-field text-sm" name="account_number" value={form.account_number} onChange={handleChange} placeholder="账户号码" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status (edit only) */}
        {isEdit && (
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">状态</label>
            <select className="input-field" name="status" value={form.status} onChange={handleChange}>
              <option value="active">报名中</option>
              <option value="completed">已结束</option>
              <option value="cancelled">已取消</option>
            </select>
            {isOrg && (
              <p className="text-[11px] text-gray-300 mt-1.5">
                将状态改为「已结束」或「已取消」可释放发布额度
              </p>
            )}
          </div>
        )}

        {/* Quota warning */}
        {!isEdit && quotaExceeded && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 leading-relaxed">
            已达同时发布 3 个进行中活动的上限。请先将已有活动改为「已结束」或「已取消」，再创建新活动。
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="btn-primary flex-1 py-2.5 disabled:opacity-40"
            disabled={saving || submitBlocked}
          >
            {saving
              ? '保存中…'
              : submitBlocked
                ? '已达发布上限'
                : isEdit ? '保存修改' : '创建活动'}
          </button>
          <Link to="/admin" className="btn-secondary px-6 py-2.5 text-center">取消</Link>
        </div>
      </form>
    </div>
  )
}
