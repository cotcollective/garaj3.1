import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { bid_id, status } = await req.json()
    const { data: bid } = await supabase.from('bids').update({ status }).eq('id', bid_id).select('*').single()
    
    if (status === 'accepted' && bid) {
      const roomUrl = `https://garaj.daily.co/${bid.consultation_id}-${bid.garage_id}`
      await supabase.from('bookings').insert({
        consultation_id: bid.consultation_id, garage_id: bid.garage_id, daily_room_url: roomUrl, status: 'confirmed'
      })
      return NextResponse.json({ ...bid, room_url: roomUrl })
    }
    return NextResponse.json(bid)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
