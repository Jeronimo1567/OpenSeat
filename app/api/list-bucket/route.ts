import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // List all buckets to find the right name
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  // Try both casings
  const bucketName = 'Desk-pictures'
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 50, sortBy: { column: 'name', order: 'asc' } })

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const files = (data ?? []).map((f) => ({
    name: f.name,
    url: `${baseUrl}/storage/v1/object/public/${bucketName}/${encodeURIComponent(f.name)}`,
  }))

  return NextResponse.json({ buckets: buckets?.map(b => b.name), bucketsError, files, listError: error })
}
