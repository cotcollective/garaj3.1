import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { consultation_id, garage_id, slot_id } = await req.json()
    
    // Créer la room Daily.co (mode démo si pas de clé)
    let roomUrl = `https://garaj.daily.co/${consultation_id}`
    if (process.env.DAILY_API_KEY) {
      try {
        const room = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: consultation_id, properties: { enable_chat: true, start_audio_off: true } })
        }).then(r => r.json())
        if (room.url) roomUrl = room.url
      } catch {}
    }
    
    const { data: booking, error } = await supabase.from('bookings').insert({
      consultation_id, garage_id, slot_id, daily_room_url: roomUrl, status: 'confirmed'
    }).select('*').single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    // Marquer le slot comme booké
    if (slot_id) await supabase.from('availability').update({ is_booked: true }).eq('id', slot_id)
    
    return NextResponse.json({ booking, room_url: roomUrl }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
