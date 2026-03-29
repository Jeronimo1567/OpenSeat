import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

type Spot = { id: string; name: string; location: string; chairs: number; image_url: string | null }

function buildFallbackReply(message: string, spots: Spot[], occupiedIds: Set<string>): string {
  const available = spots.filter(s => !occupiedIds.has(s.id))
  const occupied = spots.filter(s => occupiedIds.has(s.id))

  const msg = message.toLowerCase()

  // Group size detection
  const numMatch = msg.match(/\b(\d+)\s*(people|person|chairs?|seats?|students?)\b/) ||
                   msg.match(/\b(one|two|three|four|five|six|seven)\b/)
  const wordToNum: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 }
  const requestedSize = numMatch
    ? (parseInt(numMatch[1]) || wordToNum[numMatch[1]] || 0)
    : 0

  if (available.length === 0) {
    const freeList = occupied.map(s => s.name).join(' and ')
    return `All tables are currently occupied (${freeList}). Check back soon — sessions are 1–3 hours max!`
  }

  if (requestedSize > 0) {
    const fits = available.filter(s => s.chairs >= requestedSize)
    if (fits.length === 0) {
      const biggest = available.sort((a, b) => b.chairs - a.chairs)[0]
      return `No available table fits ${requestedSize} people right now. The largest available is ${biggest.name} (${biggest.chairs} chairs, ${biggest.location}).`
    }
    const best = fits.sort((a, b) => a.chairs - b.chairs)[0]
    return `${best.name} is perfect for ${requestedSize} — it has ${best.chairs} chairs and is located on the ${best.location}. It's available now!`
  }

  // General availability
  const list = available.map(s => `${s.name} (${s.chairs} chairs, ${s.location})`).join(', ')
  return `${available.length} table${available.length > 1 ? 's are' : ' is'} available right now: ${list}. Which would you like?`
}

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Chat unavailable' }, { status: 500 })
  }

  // Fetch live spot availability from Supabase
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const now = new Date().toISOString()

  const [{ data: spots }, { data: reservations }] = await Promise.all([
    supabase.from('spots').select('id, name, location, chairs, image_url'),
    supabase
      .from('reservations')
      .select('spot_id, name, ends_at')
      .eq('active', true)
      .gt('ends_at', now),
  ])

  const occupiedIds = new Set((reservations ?? []).map(r => r.spot_id))

  const spotsContext = (spots ?? [])
    .map(s => {
      const status = occupiedIds.has(s.id) ? 'OCCUPIED' : 'AVAILABLE'
      const res = (reservations ?? []).find(r => r.spot_id === s.id)
      const until = res
        ? ` (free at ${new Date(res.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        : ''
      return `- ${s.name} | ${s.location} | ${s.chairs} chairs | ${status}${until}`
    })
    .join('\n')

  const systemPrompt = `You are OpenSeat, a helpful study spot assistant at Oakland University's Oakland Center.
Your job is to help students find the right study table based on their needs.

Current table availability:
${spotsContext}

Guidelines:
- Be concise and friendly (2-4 sentences max)
- Recommend specific tables by name based on the student's needs
- Only recommend AVAILABLE tables
- If they mention group size, match it to chairs count
- If all tables are occupied, let them know and suggest checking back soon
- Don't make up information — only use what's listed above`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    // Groq unavailable — fall back to rule-based reply using live Supabase data
    return NextResponse.json({ reply: buildFallbackReply(message, spots ?? [], occupiedIds) })
  }

  const data = await res.json()
  const reply = data?.choices?.[0]?.message?.content ?? buildFallbackReply(message, spots ?? [], occupiedIds)

  return NextResponse.json({ reply })
}
