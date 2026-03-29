'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpotWithStatus = {
  id: string
  name: string
  location: string
  chairs: number
  image_url: string | null
  activeReservation: {
    id: string
    reservedBy: string
    endsAt: string
  } | null
}

interface Props {
  initialSpots: SpotWithStatus[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_MS = 30_000

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) return 'Updated just now'
  const diffMin = Math.floor(diffSec / 60)
  return `Updated ${diffMin}m ago`
}

function formatEndsAt(endsAtIso: string) {
  const endsAt = new Date(endsAtIso)
  const minutesLeft = Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 60_000))
  const timeStr = endsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return { minutesLeft, timeStr }
}

// ─── Header ───────────────────────────────────────────────────────────────────

function DashboardHeader({ spotCount, lastUpdated }: { spotCount: number; lastUpdated: Date }) {
  const [relTime, setRelTime] = useState(() => formatRelativeTime(lastUpdated))

  useEffect(() => {
    setRelTime(formatRelativeTime(lastUpdated))
    const id = setInterval(() => setRelTime(formatRelativeTime(lastUpdated)), 15_000)
    return () => clearInterval(id)
  }, [lastUpdated])

  return (
    <header className="px-4 pt-10 pb-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/reserve?spot=table-1"
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: '#8B7355' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </Link>
      </div>
      <p
        className="font-heading text-xs font-semibold tracking-widest uppercase mb-1"
        style={{ color: '#8B7355' }}
      >
        OpenSeat
      </p>
      <h1
        className="font-heading text-3xl font-bold leading-tight"
        style={{ color: '#1C1A18', letterSpacing: '-0.02em' }}
      >
        Study Spots
      </h1>
      <p className="text-xs mt-1.5" style={{ color: '#A89B8C' }}>
        {spotCount} {spotCount === 1 ? 'spot' : 'spots'} · {relTime}
      </p>
    </header>
  )
}

// ─── Spot Image ───────────────────────────────────────────────────────────────

function SpotImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#D9CEC2' }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#B8A898" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Table surface */}
        <rect x="2" y="8" width="20" height="2.5" rx="1.25"/>
        {/* Table legs */}
        <line x1="5.5" y1="10.5" x2="5.5" y2="18"/>
        <line x1="18.5" y1="10.5" x2="18.5" y2="18"/>
        {/* Chair left */}
        <rect x="1" y="4" width="5" height="4" rx="1"/>
        <line x1="2" y1="8" x2="2" y2="11"/>
        <line x1="5" y1="8" x2="5" y2="11"/>
        {/* Chair right */}
        <rect x="18" y="4" width="5" height="4" rx="1"/>
        <line x1="19" y1="8" x2="19" y2="11"/>
        <line x1="22" y1="8" x2="22" y2="11"/>
      </svg>
    </div>
  )
}

// ─── Status Badges ────────────────────────────────────────────────────────────

function AvailableBadge() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full live-dot shrink-0" style={{ backgroundColor: '#5DA06E' }} />
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#5DA06E' }}>
        Available
      </span>
    </div>
  )
}

function OccupiedBadge() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full live-dot shrink-0" style={{ backgroundColor: '#C0392B' }} />
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#C0392B' }}>
        Occupied
      </span>
    </div>
  )
}

// ─── Card Footers ─────────────────────────────────────────────────────────────

function AvailableFooter({ spotId }: { spotId: string }) {
  return (
    <Link
      href={`/reserve?spot=${spotId}`}
      className="flex w-full h-11 rounded-full items-center justify-center
                 font-semibold text-xs tracking-widest uppercase
                 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
      style={{ backgroundColor: '#6B5240', color: '#F5EFE6' }}
    >
      Reserve →
    </Link>
  )
}

function OccupiedFooter({ reservation }: { reservation: NonNullable<SpotWithStatus['activeReservation']> }) {
  const { minutesLeft, timeStr } = formatEndsAt(reservation.endsAt)
  const isUrgent = minutesLeft < 5

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-sm"
        style={{ backgroundColor: '#C8B89A', color: '#3D2E22' }}
      >
        {reservation.reservedBy.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate leading-tight" style={{ color: '#1C1A18' }}>
          {reservation.reservedBy}
        </p>
        <p className="text-xs leading-tight mt-0.5" style={{ color: isUrgent ? '#C0392B' : '#7A6E64' }}>
          Ends at {timeStr}{minutesLeft > 0 && ` · ${minutesLeft}m left`}
        </p>
      </div>
    </div>
  )
}

// ─── Spot Card ────────────────────────────────────────────────────────────────

function SpotCard({ spot }: { spot: SpotWithStatus }) {
  const isOccupied = spot.activeReservation !== null

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col" style={{ backgroundColor: '#E4DDD4' }}>
      {/* 16:9 photo area */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0">
          <SpotImage imageUrl={spot.image_url} name={spot.name} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 px-4 pt-4 pb-4 gap-3">
        {isOccupied ? <OccupiedBadge /> : <AvailableBadge />}

        {/* Name + location + chairs */}
        <div>
          <h2
            className="font-heading text-lg font-bold leading-tight"
            style={{ color: '#1C1A18', letterSpacing: '-0.01em' }}
          >
            {spot.name}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#7A6E64' }}>{spot.location}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A89B8C" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="2.5" rx="1.25"/>
              <line x1="5" y1="9.5" x2="5" y2="17"/>
              <line x1="19" y1="9.5" x2="19" y2="17"/>
            </svg>
            <span className="text-xs" style={{ color: '#A89B8C' }}>
              {spot.chairs} {spot.chairs === 1 ? 'chair' : 'chairs'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: 'rgba(200,184,154,0.25)' }} />

        {/* Footer */}
        {isOccupied
          ? <OccupiedFooter reservation={spot.activeReservation!} />
          : <AvailableFooter spotId={spot.id} />
        }
      </div>
    </div>
  )
}

// ─── Spot Grid ────────────────────────────────────────────────────────────────

function SpotGrid({ spots }: { spots: SpotWithStatus[] }) {
  if (spots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <p className="font-heading text-lg font-semibold" style={{ color: '#1C1A18' }}>
          No spots configured yet
        </p>
        <p className="text-sm" style={{ color: '#7A6E64' }}>
          Add spots to the database to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  )
}

// ─── Root Client Component ────────────────────────────────────────────────────

export default function DashboardClient({ initialSpots }: Props) {
  const router = useRouter()
  const [spots, setSpots] = useState<SpotWithStatus[]>(initialSpots)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())

  // Sync when server re-renders push new initialSpots after router.refresh()
  useEffect(() => {
    setSpots(initialSpots)
    setLastUpdated(new Date())
  }, [initialSpots])

  // 30-second polling via App Router's router.refresh()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS)
    return () => clearInterval(id)
  }, [router])

  return (
    <div className="min-h-screen" style={{ background: '#EDE8E0' }}>
      <DashboardHeader spotCount={spots.length} lastUpdated={lastUpdated} />
      <main className="px-4 pb-16 max-w-5xl mx-auto">
        <SpotGrid spots={spots} />
      </main>
    </div>
  )
}
