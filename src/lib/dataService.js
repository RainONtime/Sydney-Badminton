import { supabase } from './supabase'
import { mockEvents, mockRegistrations } from './mockData'

const useMock = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

// ── Events ──────────────────────────────────────────────────────────────────

export async function getEvents() {
  if (useMock) return { data: mockEvents.filter(e => e.status === 'active'), error: null }
  return supabase.from('events').select('*').eq('status', 'active').order('date', { ascending: true })
}

export async function getEventById(id) {
  if (useMock) {
    const event = mockEvents.find(e => e.id === id)
    return { data: event || null, error: event ? null : { message: '活动不存在' } }
  }
  return supabase.from('events').select('*').eq('id', id).single()
}

export async function getAllEvents() {
  if (useMock) return { data: mockEvents, error: null }
  return supabase.from('events').select('*').order('date', { ascending: false })
}

export async function createEvent(event) {
  if (useMock) {
    const newEvent = { ...event, id: Date.now().toString(), created_at: new Date().toISOString() }
    mockEvents.unshift(newEvent)
    return { data: newEvent, error: null }
  }
  return supabase.from('events').insert([event]).select().single()
}

export async function updateEvent(id, updates) {
  if (useMock) {
    const idx = mockEvents.findIndex(e => e.id === id)
    if (idx !== -1) Object.assign(mockEvents[idx], updates)
    return { data: mockEvents[idx], error: null }
  }
  return supabase.from('events').update(updates).eq('id', id).select().single()
}

export async function deleteEvent(id) {
  if (useMock) {
    const idx = mockEvents.findIndex(e => e.id === id)
    if (idx !== -1) mockEvents.splice(idx, 1)
    return { error: null }
  }
  return supabase.from('events').delete().eq('id', id)
}

// ── Registrations ────────────────────────────────────────────────────────────

export async function getRegistrationsByEvent(eventId) {
  if (useMock) return { data: mockRegistrations[eventId] || [], error: null }
  return supabase.from('registrations').select('*').eq('event_id', eventId).order('created_at', { ascending: true })
}

export async function getRegistrationCount(eventId) {
  if (useMock) {
    const regs = (mockRegistrations[eventId] || []).filter(r => r.payment_status !== 'rejected')
    const count = regs.reduce((sum, r) => sum + (r.quantity || 1), 0)
    return { count, error: null }
  }
  const { data, error } = await supabase
    .from('registrations')
    .select('quantity')
    .eq('event_id', eventId)
    .neq('payment_status', 'rejected')
  const count = error ? 0 : data.reduce((sum, r) => sum + (r.quantity || 1), 0)
  return { count, error }
}

export async function createRegistration(registration) {
  if (useMock) {
    const newReg = {
      ...registration,
      id: Date.now().toString(),
      payment_status: registration.payment_status || 'pending',
      created_at: new Date().toISOString(),
    }
    if (!mockRegistrations[registration.event_id]) mockRegistrations[registration.event_id] = []
    mockRegistrations[registration.event_id].push(newReg)
    return { data: newReg, error: null }
  }
  return supabase.from('registrations').insert([registration]).select().single()
}

export async function updateRegistrationStatus(id, eventId, status) {
  if (useMock) {
    const list = mockRegistrations[eventId] || []
    const idx = list.findIndex(r => r.id === id)
    if (idx !== -1) list[idx].payment_status = status
    return { data: list[idx], error: null }
  }
  return supabase.from('registrations').update({ payment_status: status }).eq('id', id).select().single()
}

export async function deleteRegistration(id) {
  if (useMock) {
    for (const key of Object.keys(mockRegistrations)) {
      const idx = mockRegistrations[key].findIndex(r => r.id === id)
      if (idx !== -1) { mockRegistrations[key].splice(idx, 1); break }
    }
    return { error: null }
  }
  return supabase.from('registrations').delete().eq('id', id)
}
