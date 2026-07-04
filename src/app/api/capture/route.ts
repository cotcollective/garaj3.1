import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SupabaseNotConfiguredError } from "@/lib/supabase/admin";

const supabase = getSupabaseAdmin();export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const symptoms = form.get('symptoms') as string
    const type = (form.get('type') as string) || 'express'
    const email = form.get('email') as string
    const files = form.getAll('media') as File[]
    
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({ user_id: '00000000-0000-0000-0000-000000000000', vehicle_snapshot: {}, symptoms_description: symptoms, type, ai_status: 'pending' })
      .select('id').single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    for (const file of files.slice(0, 3)) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${consultation.id}/${Date.now()}-${file.name}`
      try {
        await supabase.storage.from('diagnostics').upload(filename, buffer)
        await supabase.from('media_uploads').insert({
          consultation_id: consultation.id, storage_path: filename, media_type: file.type
        })
      } catch {}
    }
    
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/worker-ia`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: consultation.id })
    }).catch(() => {})
    
    return NextResponse.json({ consultation_id: consultation.id }, { status: 201 })
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

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  
  const { data: consultation } = await supabase.from('consultations').select('*').eq('id', id).single()
  if (!consultation) return NextResponse.json({ error: 'not found' }, { status: 404 })
  
  const { data: hypotheses } = await supabase.from('diagnostic_hypotheses').select('*').eq('consultation_id', id).order('rank')
  
  const isPro = consultation.payment_status === 'paid'
  const filtered = (hypotheses || []).map((h: any) => ({
    rank: h.rank, hypothesis: h.hypothesis, probability_pct: h.probability_pct,
    urgency: h.urgency, specialty_tag: h.specialty_tag,
    ...(isPro ? { estimated_cost_min: h.estimated_cost_min, estimated_cost_max: h.estimated_cost_max, recommended_action: h.recommended_action } : {}),
    recommended_action: isPro ? h.recommended_action : (h.rank === 1 ? (h.recommended_action?.substring(0, 80) + '...') : null)
  }))
  
  return NextResponse.json({
    consultation: { id: consultation.id, type: consultation.type, ai_status: consultation.ai_status, payment_status: consultation.payment_status },
    hypotheses: filtered
  })
}

export async function PATCH(req: NextRequest) {
  try {
    const { consultation_id, email } = await req.json()
    if (!consultation_id || !email) {
      return NextResponse.json({ error: 'consultation_id et email requis' }, { status: 400 })
    }
    // email_captured column exists depuis migration 002_fix_anonymous.sql
    const { data, error } = await supabase
      .from('consultations')
      .update({ email_captured: email })
      .eq('id', consultation_id)
      .select('id, email_captured')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, consultation: data })
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
