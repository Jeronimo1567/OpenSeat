'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DURATIONS = [
  { label: '1hr', sublabel: 'FOCUSED', value: '60' },
  { label: '2hr', sublabel: 'STANDARD', value: '120' },
  { label: '3hr', sublabel: 'DEEP', value: '180' },
]

interface Props {
  spotId: string
  spotName: string
  spotLocation: string
  spotChairs: number
  spotImage: string | null
}

export default function ReserveForm({ spotId, spotName, spotLocation, spotChairs, spotImage }: Props) {
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
      className="min-h-screen flex flex-col items-center justify-start pb-10"
      style={{ background: '#EDE8E0' }}
    >
      <div className="w-full max-w-sm flex flex-col">

        {/* Spot photo card */}
        <div className="w-full relative overflow-hidden" style={{ borderRadius: '0 0 2rem 2rem' }}>
          {spotImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={spotImage}
              alt={spotName}
              className="w-full object-cover"
              style={{ height: '220px' }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{ height: '220px', backgroundColor: '#D9CEC2' }}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#B8A898" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="8" width="20" height="2.5" rx="1.25"/>
                <line x1="5.5" y1="10.5" x2="5.5" y2="18"/>
                <line x1="18.5" y1="10.5" x2="18.5" y2="18"/>
                <rect x="1" y="4" width="5" height="4" rx="1"/>
                <line x1="2" y1="8" x2="2" y2="11"/>
                <line x1="5" y1="8" x2="5" y2="11"/>
                <rect x="18" y="4" width="5" height="4" rx="1"/>
                <line x1="19" y1="8" x2="19" y2="11"/>
                <line x1="22" y1="8" x2="22" y2="11"/>
              </svg>
            </div>
          )}

          {/* Gradient overlay with spot info */}
          <div
            className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10"
            style={{
              background: 'linear-gradient(to top, rgba(28,26,24,0.72) 0%, transparent 100%)',
            }}
          >
            <p className="text-white font-heading text-lg font-bold leading-tight">
              {spotName}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-white/75 text-xs">{spotLocation}</span>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/75 text-xs">
                {spotChairs} {spotChairs === 1 ? 'chair' : 'chairs'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-7 flex flex-col gap-0">

          {/* Heading */}
          <div className="text-center mb-7">
            <img
              src="/Untitled_Artwork.png"
              alt="OpenSeat"
              className="mx-auto mb-2"
              style={{ height: '3.5rem', width: 'auto', mixBlendMode: 'multiply' }}
            />
            <p className="text-sm leading-relaxed" style={{ color: '#7A6E64' }}>
              Oakland University · Study reservation
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-2.5 text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: '#8B7355' }}
            >
              View all tables →
            </Link>
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

          {/* AI Chat */}
          <div className="mt-4">
            <SpotChat />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Chat Component ────────────────────────────────────────────────────────

type Message = { role: 'user' | 'ai'; text: string }

function SpotChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! Ask me which table is right for you — e.g. "I need a table for 6 people"' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply ?? data.error ?? 'Something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#E4DDD4' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(200,184,154,0.3)' }}>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#6B5240' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F5EFE6" strokeWidth="2.5">
            <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <span className="text-xs font-semibold" style={{ color: '#1C1A18' }}>Ask OpenSeat AI</span>
        <span
          className="ml-auto text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#D9CEC2', color: '#6B5240' }}
        >
          Live data
        </span>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 px-4 py-3 max-h-48 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="text-xs leading-relaxed px-3 py-2 rounded-2xl max-w-[85%]"
              style={{
                backgroundColor: m.role === 'user' ? '#6B5240' : '#D9CEC2',
                color: m.role === 'user' ? '#F5EFE6' : '#1C1A18',
                borderBottomRightRadius: m.role === 'user' ? '4px' : undefined,
                borderBottomLeftRadius: m.role === 'ai' ? '4px' : undefined,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl rounded-bl-sm" style={{ backgroundColor: '#D9CEC2' }}>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#8B7355', animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#8B7355', animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#8B7355', animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 pb-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. I need a table for 4 people"
          className="flex-1 text-xs rounded-full px-4 py-2.5 outline-none focus:ring-1"
          style={{
            backgroundColor: '#D9CEC2',
            color: '#1C1A18',
            border: '1.5px solid transparent',
          }}
          onFocus={e => (e.target.style.borderColor = '#8B7355')}
          onBlur={e => (e.target.style.borderColor = 'transparent')}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#6B5240' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5EFE6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
