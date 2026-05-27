import { useEffect, useState, useCallback } from 'react'
import EventCard from '../components/event/EventCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getEvents } from '../services/dataService'

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  // getEvents now embeds registration_count — no N+1 needed
  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchErr } = await getEvents()

    if (fetchErr || !data) {
      setError('活动加载失败，请刷新重试')
      setLoading(false)
      return
    }

    setEvents(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 py-7 sm:py-12">
      <div className="mb-7 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight mb-1">活动</h1>
        <p className="text-sm text-gray-400">选择场次，填写报名信息</p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingSpinner text="正在加载活动..." />
        </div>
      ) : error ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={load}
            className="text-xs text-gray-500 hover:text-gray-950 underline underline-offset-2 transition-colors"
          >
            点击重试
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400">暂无活动，请稍后再来</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              registrationCount={event.registration_count ?? 0}
            />
          ))}
        </div>
      )}

      <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
    </div>
  )
}
