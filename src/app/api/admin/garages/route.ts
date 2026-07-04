import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PATCH(req: NextRequest) {
  try {
    const { garage_id, status } = await req.json()
    
    const { data: garage, error } = await supabase.from('garages')
      .update({ validation_status: status })
      .eq('id', garage_id)
      .select('*').single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(garage)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { data: garages, error } = await supabase.from('garages')
    .select('*').eq('validation_status', 'pending').order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(garages || [])
}
