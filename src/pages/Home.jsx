import { useEffect, useState } from 'react'
import EventCard from '../components/event/EventCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getEvents, getRegistrationCount } from '../services/dataService'

export default function Home() {
  const [events, setEvents] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await getEvents()
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
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 py-7 sm:py-12">
      <div className="mb-7 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight mb-1">活动</h1>
        <p className="text-sm text-gray-400">选择场次，填写报名信息</p>
      </div>

      {loading ? (
        <div className="py-16"><LoadingSpinner /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-400">暂无活动，请稍后再来</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} registrationCount={counts[event.id] || 0} />
          ))}
        </div>
      )}

      <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
    </div>
  )
}
