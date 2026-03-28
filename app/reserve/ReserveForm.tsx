'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const DURATIONS = [
  { label: '1hr', sublabel: 'FOCUSED', value: '60' },
  { label: '2hr', sublabel: 'STANDARD', value: '120' },
  { label: '3hr', sublabel: 'DEEP', value: '180' },
]

interface Props {
  spotId: string
  spotName: string
}

export default function ReserveForm({ spotId, spotName }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [duration, setDuration] = useState('120')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailTouched = email.length > 0
  const emailValid = !emailTouched || email.toLowerCase().endsWith('@oakland.edu')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.toLowerCase().endsWith('@oakland.edu')) {
      setError('Please use your @oakland.edu email address.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          durationMinutes: Number(duration),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      router.push(`/status?reservation_id=${data.reservation_id}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-6 pt-12 pb-10"
      style={{ background: '#EDE8E0' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-0">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#6B5240"/>
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#6B5240" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="font-heading text-[2rem] font-bold leading-tight mb-2"
            style={{ color: '#1C1A18', letterSpacing: '-0.02em' }}
          >
            Secure Your Space
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#7A6E64' }}>
            Premium study environments tailored for<br />
            Oakland&apos;s academic excellence.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Name */}
          <div>
            <label className="field-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="input-pill"
              placeholder="Grizzly Bear"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <label className="field-label" htmlFor="email">Oakland Email (@Oakland.edu)</label>
            <input
              id="email"
              type="email"
              className={`input-pill${!emailValid ? ' error' : ''}`}
              placeholder="grizzly@oakland.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
            {!emailValid && (
              <p className="field-error">Must be an @oakland.edu address</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="field-label">Session Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(d => {
                const selected = duration === d.value
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={`
                      flex flex-col items-center justify-center
                      h-20 rounded-2xl transition-all duration-200
                      ${selected
                        ? 'duration-pill-selected'
                        : 'border border-[#C8BEB2]/60'
                      }
                    `}
                    style={{
                      backgroundColor: selected ? '#D9CEC2' : '#E4DDD4',
                    }}
                  >
                    <span
                      className="font-heading text-xl font-bold leading-none"
                      style={{ color: selected ? '#3D2E22' : '#6B5240' }}
                    >
                      {d.label}
                    </span>
                    <span
                      className="text-[10px] font-semibold tracking-widest mt-1"
                      style={{ color: selected ? '#6B5240' : '#A89B8C' }}
                    >
                      {d.sublabel}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Policy card */}
          <div className="policy-card">
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
              style={{ backgroundColor: '#D9CEC2' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5240" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round"/>
                <line x1="12" y1="11" x2="12" y2="17" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: '#1C1A18' }}>
                Reservation Policy
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#7A6E64' }}>
                Check-ins required within 15m. Manage bookings via your dashboard.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-2xl px-4 py-3 text-sm flex items-start gap-2"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
            >
              <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !emailValid || !name || !email}
            className="btn-primary mt-1"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Reserving...
              </>
            ) : (
              <>Reserve Table &nbsp;→</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
