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

  const { spotId, name, email, durationMinutes } = body as {
    spotId?: string
    name?: string
    email?: string
    durationMinutes?: number
  }

  if (!spotId || !name || !email || !durationMinutes) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (!email.toLowerCase().endsWith('@oakland.edu')) {
    return NextResponse.json({ error: 'Email must be an @oakland.edu address.' }, { status: 400 })
  }

  const allowedDurations = [60, 120, 180]
  if (!allowedDurations.includes(durationMinutes)) {
    return NextResponse.json({ error: 'Invalid duration.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Check spot exists
  const { data: spot, error: spotError } = await supabase
    .from('spots')
    .select('id')
    .eq('id', spotId)
    .single()

  if (spotError || !spot) {
    return NextResponse.json({ error: `Unknown spot "${spotId}".` }, { status: 404 })
  }

  // Check for active reservation on this spot
  const now = new Date()
  const { data: activeRes } = await supabase
    .from('reservations')
    .select('id')
    .eq('spot_id', spotId)
    .eq('active', true)
    .gt('ends_at', now.toISOString())
    .maybeSingle()

  if (activeRes) {
    return NextResponse.json(
      { error: 'This spot is already reserved. Please choose another table.' },
      { status: 409 }
    )
  }

  // Create reservation
  const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000)

  const { data: newReservation, error: insertError } = await supabase
    .from('reservations')
    .insert({
      spot_id: spotId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      started_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      scanned_at: now.toISOString(),
      active: true,
    })
    .select('id')
    .single()

  if (insertError || !newReservation) {
    console.error('[reserve] insert error:', insertError)
    return NextResponse.json({ error: 'Failed to create reservation. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ reservation_id: newReservation.id }, { status: 201 })
}
