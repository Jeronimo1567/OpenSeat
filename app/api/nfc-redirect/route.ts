import { NextRequest, NextResponse } from 'next/server'

/**
 * NFC Redirect endpoint
 *
 * Write NFC tags to point to:
 *   https://yourdomain.com/api/nfc-redirect?spot=table-1
 *
 * This redirects directly to /reserve — no timestamp injection needed.
 * The NFC tag URL is static and never needs to be rewritten.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spot = searchParams.get('spot')

  if (!spot) {
    return new NextResponse('Missing spot parameter', { status: 400 })
  }

  const redirectUrl = `/reserve?spot=${encodeURIComponent(spot)}`
  return NextResponse.redirect(new URL(redirectUrl, req.url), 302)
}
