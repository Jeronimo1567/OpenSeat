import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.storage
    .from('Desk-pictures')
    .list('', { limit: 50, sortBy: { column: 'name', order: 'asc' } })

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const files = (data ?? []).map((f) => ({
    name: f.name,
    url: `${baseUrl}/storage/v1/object/public/Desk-pictures/${f.name}`,
  }))

  return NextResponse.json({ files, error })
}
