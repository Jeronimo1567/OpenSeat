import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NOT SET'
  const keyPrefix = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) ?? 'NOT SET'

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase.from('spots').select('*').eq('id', 'table-1').single()
    return NextResponse.json({ url, key_prefix: keyPrefix, data, error })
  } catch (e) {
    return NextResponse.json({ url, key_prefix: keyPrefix, thrown: String(e) })
  }
}
