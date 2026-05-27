import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, Users, LogOut } from 'lucide-react'
import { getAdminEvents, deleteEvent } from '../../services/dataService'
import { getAdminUser, clearAdminUser } from '../../services/authService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminEvents() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const user = getAdminUser()
  const isSuper = user?.role === 'super'

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await getAdminEvents(user)
    if (data) setEvents(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm(t('admin.events.deleteConfirm'))) return
    setDeleting(id)
    await deleteEvent(id)
    setEvents(ev => ev.filter(e => e.id !== id))
    setDeleting(null)
  }

  function handleLogout() {
    clearAdminUser()
    navigate('/admin/login', { replace: true })
  }

  const activeCount = events.filter(e => e.status === 'active').length
  const quotaReached = !isSuper && activeCount >= 3

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#4B4552' }}>
              {t('admin.events.title')}
            </h1>
            {isSuper ? (
              <span className="text-[10px] bg-violet-50 text-violet-500 px-2 py-0.5 rounded-full font-medium">
                {t('admin.roles.super')}
              </span>
            ) : (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {t('admin.roles.organizer')}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400">
            {user?.name}
            {' · '}
            {isSuper
              ? t('admin.events.totalCount', { count: events.length })
              : t('admin.events.myCount', { count: events.length })}
            {!isSuper && (
              <span className={`ml-1 font-medium ${quotaReached ? 'text-red-500' : 'text-gray-500'}`}>
                · {t('admin.events.activeQuota', { active: activeCount })}
                {quotaReached ? t('admin.events.quotaReached') : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all"
            title={t('admin.events.logoutTitle')}
          >
            <LogOut size={15} />
          </button>
          <Link
            to="/admin/events/new"
            className={`btn-primary flex items-center gap-1.5 text-xs ${quotaReached ? 'opacity-50 pointer-events-none' : ''}`}
            aria-disabled={quotaReached}
            title={quotaReached ? t('admin.events.quotaTitle') : t('admin.events.createButton')}
          >
            <Plus size={14} /> {t('admin.events.createButton')}
          </Link>
        </div>
      </div>

      {quotaReached && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 leading-relaxed">
          {t('admin.events.quotaWarning')}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex items-center justify-center"><LoadingSpinner /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400 mb-5">{t('admin.events.empty')}</p>
          {!quotaReached && (
            <Link to="/admin/events/new" className="btn-secondary text-sm">
              {t('admin.events.createFirst')}
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">
                  {t('admin.events.columns.name')}
                </th>
                {isSuper && (
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">
                    {t('admin.events.columns.organizer')}
                  </th>
                )}
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">
                  {t('admin.events.columns.date')}
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-400">
                  {t('admin.events.columns.registrations')}
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-400">
                  {t('admin.events.columns.status')}
                </th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {events.map((event, i) => {
                const displayTitle = (i18n.language === 'en' && event.title_en) ? event.title_en : event.title
                const statusKey = event.status === 'active' ? 'active' : event.status === 'completed' ? 'completed' : 'cancelled'
                return (
                  <tr
                    key={event.id}
                    className={`${i < events.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: '#4B4552' }}>
                      {displayTitle}
                    </td>
                    {isSuper && (
                      <td className="px-5 py-4 text-sm text-gray-400 hidden md:table-cell">
                        {event.organizer || <span className="text-gray-200">—</span>}
                      </td>
                    )}
                    <td className="px-5 py-4 text-sm text-gray-400 hidden sm:table-cell">
                      {format(parseISO(event.date), 'yyyy/MM/dd')}
                    </td>
                    <td className="px-5 py-4 text-sm text-center">
                      <span className={(event.registration_count ?? 0) >= event.max_participants ? 'text-gray-400' : 'font-medium'} style={(event.registration_count ?? 0) < event.max_participants ? { color: '#4B4552' } : {}}>
                        {event.registration_count ?? 0}
                      </span>
                      <span className="text-gray-300">/{event.max_participants}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full ${
                        event.status === 'active'
                          ? 'bg-violet-50 text-violet-500'
                          : 'bg-gray-50 text-gray-400'
                      }`}>
                        {t(`admin.events.status.${statusKey}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/events/${event.id}/registrations`}
                          title={t('admin.events.actions.registrations')}
                          className="p-2 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all"
                        >
                          <Users size={17} />
                        </Link>
                        <Link
                          to={`/admin/events/${event.id}/edit`}
                          title={t('admin.events.actions.edit')}
                          className="p-2 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting === event.id}
                          title={t('admin.events.actions.delete')}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                        >
                          <Trash2 size={16} />
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
    </div>
  )
}
