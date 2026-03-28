import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import StatusClient from './StatusClient'

interface PageProps {
  searchParams: { reservation_id?: string }
}

export default async function StatusPage({ searchParams }: PageProps) {
  const reservationId = searchParams.reservation_id

  if (!reservationId) {
    return <NotFound message="No reservation ID provided." />
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('*, spots(id, name, location)')
    .eq('id', reservationId)
    .single()

  if (error || !reservation) {
    return <NotFound message="Reservation not found." />
  }

  // Auto-expire if ends_at has passed
  if (reservation.active && new Date(reservation.ends_at) < new Date()) {
    await supabase
      .from('reservations')
      .update({ active: false })
      .eq('id', reservationId)
    reservation.active = false
  }

  return <StatusClient reservation={reservation} />
}

function NotFound({ message }: { message: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#EDE8E0' }}
    >
      <div className="w-full max-w-sm text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: '#E4DDD4' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B5240" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2
          className="font-heading text-2xl font-bold mb-2"
          style={{ color: '#1C1A18', letterSpacing: '-0.02em' }}
        >
          Not Found
        </h2>
        <p className="text-sm" style={{ color: '#7A6E64' }}>{message}</p>
      </div>
    </div>
  )
}
