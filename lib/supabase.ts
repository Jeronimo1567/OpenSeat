// Shared types — clients are created via utils/supabase/server.ts or utils/supabase/client.ts

export type Spot = {
  id: string
  name: string
  location: string
  chairs: number
  image_url: string | null
}

export type Reservation = {
  id: string
  spot_id: string
  name: string
  email: string
  started_at: string
  ends_at: string
  scanned_at: string
  active: boolean
  spots?: Spot
}
