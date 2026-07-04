import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SupabaseNotConfiguredError } from "@/lib/supabase/admin";

const supabase = getSupabaseAdmin();export async function GET(req: NextRequest) {
  const consultation_id = req.nextUrl.searchParams.get('consultation_id')
  const garage_id = req.nextUrl.searchParams.get('garage_id')
  
  let query = supabase.from('bids').select('*, garages(garage_name, rating)')
  if (consultation_id) query = query.eq('consultation_id', consultation_id)
  if (garage_id) query = query.eq('garage_id', garage_id)
  
  const { data, error } = await query.order('weighted_score', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { consultation_id, garage_id, amount_cad, estimated_duration_hours, notes } = body
    
    const { data: garage } = await supabase.from('garages').select('rating').eq('id', garage_id).single()
    const rating = garage?.rating || 0
    
    const prixNorm = Math.max(0, 1 - (amount_cad / 1000))
    const ratingNorm = rating / 5
    const delaiNorm = Math.max(0, 1 - ((estimated_duration_hours || 48) / 168))
    const weighted_score = (prixNorm * 0.4) + (ratingNorm * 0.4) + (delaiNorm * 0.2)
    
    const { data: bid, error } = await supabase.from('bids').insert({
      consultation_id, garage_id, amount_cad, estimated_duration_hours, notes, weighted_score
    }).select('*').single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(bid, { status: 201 })
  } catch (e: any) {
    if (e instanceof SupabaseNotConfiguredError) {
      return NextResponse.json(
        { error: "Supabase not configured", message: e.message, fix: "Add env vars to Netlify dashboard" },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { bid_id, status } = await req.json()
    const { data: bid } = await supabase.from('bids').update({ status }).eq('id', bid_id).select('*').single()

    if (status === 'accepted' && bid) {
      // Créer la room Daily.co via la même logique que /api/booking
      // (mock URL si pas de DAILY_API_KEY, vraie room sinon)
      let roomUrl = `https://garaj.daily.co/${bid.consultation_id}-${bid.garage_id}`
      if (process.env.DAILY_API_KEY) {
        try {
          const room = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `garaj-${bid.consultation_id}-${bid.garage_id}`.slice(0, 41),
              properties: { enable_chat: true, start_audio_off: true }
            })
          }).then(r => r.json())
          if (room.url) roomUrl = room.url
        } catch (e) {
          // Fallback to mock URL
        }
      }
      const { data: booking } = await supabase.from('bookings').insert({
        consultation_id: bid.consultation_id, garage_id: bid.garage_id, daily_room_url: roomUrl, status: 'confirmed'
      }).select('*').single()
      return NextResponse.json({ ...bid, room_url: roomUrl, booking })
    }
    return NextResponse.json(bid)
  } catch (e: any) {
    if (e instanceof SupabaseNotConfiguredError) {
      return NextResponse.json(
        { error: "Supabase not configured", message: e.message, fix: "Add env vars to Netlify dashboard" },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
