import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import DashboardClient, { type SpotWithStatus } from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const now = new Date().toISOString()

  // Parallel fetch: all spots + all active reservations
  const [{ data: spots }, { data: reservations }] = await Promise.all([
    supabase.from('spots').select('*').order('name'),
    supabase
      .from('reservations')
      .select('id, spot_id, name, ends_at')
      .eq('active', true)
      .gt('ends_at', now),
  ])

  // Build a map of spot_id → active reservation
  const resMap = new Map<string, { id: string; reservedBy: string; endsAt: string }>()
  for (const r of reservations ?? []) {
    resMap.set(r.spot_id, { id: r.id, reservedBy: r.name, endsAt: r.ends_at })
  }

  // Merge into SpotWithStatus[]
  const initialSpots: SpotWithStatus[] = (spots ?? []).map((spot) => ({
    id: spot.id,
    name: spot.name,
    location: spot.location,
    chairs: spot.chairs ?? 4,
    image_url: spot.image_url ?? null,
    activeReservation: resMap.get(spot.id) ?? null,
  }))

  return <DashboardClient initialSpots={initialSpots} />
}
