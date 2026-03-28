'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Reservation } from '@/lib/supabase'

interface Props {
  reservation: Reservation & { spots: { id: string; name: string; location: string } | null }
}

function formatTimeRemaining(ms: number) {
  if (ms <= 0) return { display: '0:00', urgent: true }
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const urgent = ms < 5 * 60 * 1000

  if (hours > 0) {
    return {
      display: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      urgent,
    }
  }
  return { display: `${minutes}:${String(seconds).padStart(2, '0')}`, urgent }
}

export default function StatusClient({ reservation }: Props) {
  const endsAtMs = new Date(reservation.ends_at).getTime()
  const startedAtMs = new Date(reservation.started_at).getTime()
  const totalDurationMs = endsAtMs - startedAtMs

  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, endsAtMs - Date.now()))
  const [ended, setEnded] = useState(!reservation.active || remainingMs === 0)
  const [endingEarly, setEndingEarly] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)

  useEffect(() => {
    if (ended) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, endsAtMs - Date.now())
      setRemainingMs(remaining)
      if (remaining === 0) { setEnded(true); clearInterval(interval) }
    }, 1000)
    return () => clearInterval(interval)
  }, [ended, endsAtMs])

  const handleEndEarly = useCallback(async () => {
    setEndingEarly(true)
    setEndError(null)
    try {
      const res = await fetch('/api/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservation.id }),
      })
      const data = await res.json()
      if (!res.ok) { setEndError(data.error || 'Failed to end session.'); setEndingEarly(false); return }
      setEnded(true)
    } catch {
      setEndError('Network error. Please try again.')
      setEndingEarly(false)
    }
  }, [reservation.id])

  const progressPct = ended ? 0 : Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100))
  const { display: timeDisplay, urgent } = formatTimeRemaining(remainingMs)
  const spot = reservation.spots
  const firstName = reservation.name.split(' ')[0]

  // --- Ended state ---
  if (ended) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: '#EDE8E0' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#D9CEC2' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B5240" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2
            className="font-heading text-2xl font-bold mb-2"
            style={{ color: '#1C1A18', letterSpacing: '-0.02em' }}
          >
            Session Complete
          </h2>
          <p className="text-sm mb-1" style={{ color: '#7A6E64' }}>
            Thanks for using OpenSeat, <strong style={{ color: '#1C1A18' }}>{firstName}</strong>!
          </p>
          <p className="text-sm" style={{ color: '#7A6E64' }}>
            Please leave <strong style={{ color: '#1C1A18' }}>{spot?.name ?? reservation.spot_id}</strong> available for others.
          </p>
        </div>
      </div>
    )
  }

  // --- Active state ---
  return (
    <div
      className="min-h-screen flex flex-col items-start px-6 pt-12 pb-10"
      style={{ background: '#EDE8E0' }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">

        {/* Live badge */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full live-dot" style={{ backgroundColor: '#5DA06E' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#5DA06E' }}>
            Live Session
          </span>
        </div>

        {/* Heading */}
        <div>
          <h1
            className="font-heading text-[2rem] font-bold leading-tight"
            style={{ color: '#1C1A18', letterSpacing: '-0.02em' }}
          >
            Your Reservation
          </h1>
          <p className="text-sm mt-1" style={{ color: '#7A6E64' }}>
            {spot?.name ?? reservation.spot_id}
            {spot?.location ? ` · ${spot.location}` : ''}
          </p>
        </div>

        {/* Timer card */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: '#E4DDD4' }}>
          {/* Big countdown */}
          <div className="px-6 pt-6 pb-4 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8B7355' }}>
              Time Remaining
            </p>
            <p
              className="font-heading text-6xl font-bold tabular-nums"
              style={{ color: urgent ? '#C0392B' : '#1C1A18', letterSpacing: '-0.04em' }}
            >
              {timeDisplay}
            </p>
            {urgent && (
              <p className="text-xs font-semibold mt-2" style={{ color: '#C0392B' }}>
                Less than 5 minutes left!
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-5">
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#C8B89A' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: urgent ? '#C0392B' : '#6B5240',
                }}
              />
            </div>
          </div>

          {/* Start / end times */}
          <div
            className="flex justify-between px-6 py-3 border-t"
            style={{ borderColor: '#C8B89A40' }}
          >
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#A89B8C' }}>Started</p>
              <p className="text-sm font-semibold" style={{ color: '#3D2E22' }}>
                {new Date(reservation.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#A89B8C' }}>Ends At</p>
              <p className="text-sm font-semibold" style={{ color: '#3D2E22' }}>
                {new Date(reservation.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Reserved by */}
        <div className="rounded-3xl px-5 py-4 flex items-center gap-3" style={{ backgroundColor: '#E4DDD4' }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-base"
            style={{ backgroundColor: '#C8B89A', color: '#3D2E22' }}
          >
            {reservation.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1C1A18' }}>{reservation.name}</p>
            <p className="text-xs" style={{ color: '#A89B8C' }}>{reservation.email}</p>
          </div>
        </div>

        {/* Error */}
        {endError && (
          <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            {endError}
          </div>
        )}

        {/* End Early */}
        <button
          onClick={handleEndEarly}
          disabled={endingEarly}
          className="btn-ghost mt-1"
        >
          {endingEarly ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Ending session...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              End Session Early
            </>
          )}
        </button>

        <p className="text-center text-xs" style={{ color: '#A89B8C' }}>
          Ending early frees the spot for other students.
        </p>
      </div>
    </div>
  )
}
