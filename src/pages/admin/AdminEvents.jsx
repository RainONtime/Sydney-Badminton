import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, Users, ArrowUpRight, LogOut } from 'lucide-react'
import { getAdminEvents, deleteEvent, getRegistrationCount } from '../../services/dataService'
import { getAdminUser, clearAdminUser } from '../../services/authService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const STATUS_LABEL = { active: '报名中', completed: '已结束', cancelled: '已取消' }

export default function AdminEvents() {
  const navigate = useNavigate()
  const user = getAdminUser()
  const isSuper = user?.role === 'super'

  const [events, setEvents] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await getAdminEvents(user)
    if (data) {
      setEvents(data)
      const entries = await Promise.all(
        data.map(async e => {
          const { count } = await getRegistrationCount(e.id)
          return [e.id, count || 0]
        })
      )
      setCounts(Object.fromEntries(entries))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm('删除这个活动？相关报名记录也会一并删除。')) return
    setDeleting(id)
    await deleteEvent(id)
    setEvents(ev => ev.filter(e => e.id !== id))
    setDeleting(null)
  }

  function handleLogout() {
    clearAdminUser()
    navigate('/admin/login', { replace: true })
  }

  // Derived quota stats for organizer role
  const activeCount = events.filter(e => e.status === 'active').length
  const quotaReached = !isSuper && activeCount >= 3

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          {/* Title + role badge */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-gray-950 tracking-tight">活动管理</h1>
            {isSuper ? (
              <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">超管</span>
            ) : (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">组织者</span>
            )}
          </div>

          {/* Sub-header */}
          <p className="text-sm text-gray-400">
            {user?.name}
            {' · '}
            {isSuper
              ? `全站 ${events.length} 个活动`
              : `${events.length} 个活动`}
            {!isSuper && (
              <span className={`ml-1 font-medium ${quotaReached ? 'text-red-500' : 'text-gray-500'}`}>
                · 进行中 {activeCount}/3{quotaReached ? '（已达上限）' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-all"
            title="退出登录"
          >
            <LogOut size={15} />
          </button>
          <Link
            to="/admin/events/new"
            className={`btn-primary flex items-center gap-1.5 text-xs ${quotaReached ? 'opacity-50 pointer-events-none' : ''}`}
            aria-disabled={quotaReached}
            title={quotaReached ? '已达同时发布 3 个活动的上限' : '新建活动'}
          >
            <Plus size={14} /> 新建活动
          </Link>
        </div>
      </div>

      {/* Quota warning banner for organizers at limit */}
      {quotaReached && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 leading-relaxed">
          已达同时发布 3 个进行中活动的上限。请将已有活动状态改为「已结束」或「已取消」后，再创建新活动。
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400 mb-5">还没有活动</p>
          {!quotaReached && (
            <Link to="/admin/events/new" className="btn-secondary text-sm">创建第一个活动</Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">活动名称</th>
                {isSuper && (
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">组织者</th>
                )}
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">日期</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-400">报名人数</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-400">状态</th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {events.map((event, i) => (
                <tr
                  key={event.id}
                  className={`${i < events.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-5 py-4 text-sm font-medium text-gray-950">{event.title}</td>
                  {isSuper && (
                    <td className="px-5 py-4 text-sm text-gray-400 hidden md:table-cell">
                      {event.organizer || <span className="text-gray-200">—</span>}
                    </td>
                  )}
                  <td className="px-5 py-4 text-sm text-gray-400 hidden sm:table-cell">
                    {format(parseISO(event.date), 'yyyy/MM/dd')}
                  </td>
                  <td className="px-5 py-4 text-sm text-center">
                    <span className={counts[event.id] >= event.max_participants ? 'text-gray-400' : 'text-gray-950 font-medium'}>
                      {counts[event.id] || 0}
                    </span>
                    <span className="text-gray-300">/{event.max_participants}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full ${
                      event.status === 'active' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {STATUS_LABEL[event.status] || event.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link to={`/admin/events/${event.id}/registrations`} title="报名名单"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-all">
                        <Users size={14} />
                      </Link>
                      <Link to={`/events/${event.id}`} target="_blank" title="前台预览"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-all">
                        <ArrowUpRight size={14} />
                      </Link>
                      <Link to={`/admin/events/${event.id}/edit`} title="编辑"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-all">
                        <Pencil size={13} />
                      </Link>
                      <button onClick={() => handleDelete(event.id)} disabled={deleting === event.id} title="删除"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
