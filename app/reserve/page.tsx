import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ReserveForm from './ReserveForm'
import type { Spot } from '@/lib/supabase'

interface PageProps {
  searchParams: { spot?: string }
}

export default async function ReservePage({ searchParams }: PageProps) {
  const spotId = searchParams.spot

  if (!spotId) {
    return <ErrorPage message="No study spot specified. Please tap the NFC tag on a table." />
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch spot info
  const { data: spot, error: spotError } = await supabase
    .from('spots')
    .select('*')
    .eq('id', spotId)
    .single()

  if (spotError || !spot) {
    return <ErrorPage message={`Unknown spot "${spotId}". Please check the NFC tag.`} />
  }

  // Check for active reservation
  const now = new Date().toISOString()
  const { data: activeRes } = await supabase
    .from('reservations')
    .select('id, name, ends_at')
    .eq('spot_id', spotId)
    .eq('active', true)
    .gt('ends_at', now)
    .maybeSingle()

  if (activeRes) {
    return <OccupiedPage spot={spot as Spot} activeRes={activeRes} />
  }

  return <ReserveForm spotId={spotId} spotName={(spot as Spot).name} />
}

function OccupiedPage({
  spot,
  activeRes,
}: {
  spot: Spot
  activeRes: { name: string; ends_at: string }
}) {
  const until = new Date(activeRes.ends_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#EDE8E0' }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[#E4DDD4] flex items-center justify-center mx-auto mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B5240" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h2
          className="font-heading text-2xl font-bold mb-2"
          style={{ color: '#1C1A18', letterSpacing: '-0.02em' }}
        >
          Spot Occupied
        </h2>
        <p className="text-sm mb-1" style={{ color: '#7A6E64' }}>
          <strong style={{ color: '#1C1A18' }}>{spot.name}</strong> is currently reserved by{' '}
          <strong style={{ color: '#1C1A18' }}>{activeRes.name}</strong>.
        </p>
        <p className="text-sm" style={{ color: '#7A6E64' }}>
          Available at <strong style={{ color: '#6B5240' }}>{until}</strong>.
        </p>
      </div>
    </div>
  )
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#EDE8E0' }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[#E4DDD4] flex items-center justify-center mx-auto mb-5">
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
          Something went wrong
        </h2>
        <p className="text-sm" style={{ color: '#7A6E64' }}>{message}</p>
      </div>
    </div>
  )
}
