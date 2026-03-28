import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { reservation_id } = body as { reservation_id?: string }

  if (!reservation_id) {
    return NextResponse.json({ error: 'Missing reservation_id.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Verify reservation exists and is active
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('id, active')
    .eq('id', reservation_id)
    .single()

  if (fetchError || !reservation) {
    return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 })
  }

  if (!reservation.active) {
    return NextResponse.json({ error: 'Reservation is already inactive.' }, { status: 400 })
  }

  // End the session
  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ active: false, ends_at: now })
    .eq('id', reservation_id)

  if (updateError) {
    console.error('[end-session] update error:', updateError)
    return NextResponse.json({ error: 'Failed to end session. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
