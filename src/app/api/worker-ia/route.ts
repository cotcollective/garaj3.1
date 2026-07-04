import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { consultation_id } = await req.json()
    
    // Claim atomique: pending → processing
    const { data: claimed, error: claimErr } = await supabase.rpc('claim_consultation', { cid: consultation_id })
    if (claimErr || !claimed) return Response.json({ status: 'already_claimed' })
    
    const { data: consultation } = await supabase.from('consultations').select('*').eq('id', consultation_id).single()
    if (!consultation) {
      await supabase.from('consultations').update({ ai_status: 'failed' }).eq('id', consultation_id)
      return Response.json({ error: 'not found' }, { status: 404 })
    }
    
    // Appel OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        messages: [{ role: 'system', content: `Tu es GARAJ-IA, système de diagnostic automobile expert. Réponds UNIQUEMENT en JSON: {"hypotheses":[{"rank":1,"hypothesis":"...","probability_pct":78,"urgency":"high","specialty_tag":"freins","estimated_cost_min":200,"estimated_cost_max":500,"recommended_action":"..."}]}. 1-3 hypothèses, probability décroissant, urgency low/medium/high, specialty_tag parmi: moteur|freins|électrique|climatisation|transmission|suspension|carrosserie|hybride|diesel.` },
          { role: 'user', content: `Symptômes: ${consultation.symptoms_description || 'Aucun fourni'}. Type de consultation: ${consultation.type}. Génère un diagnostic complet.` }],
        temperature: 0.3, max_tokens: 1500
      })
    })
    
    const aiData = await response.json()
    const content = aiData.choices?.[0]?.message?.content || ''
    
    // Parser le JSON
    let parsed: any
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch { parsed = null }
    
    if (!parsed?.hypotheses?.length) {
      // Retry
      const retries = (consultation.ai_retry_count || 0) + 1
      if (retries >= 3) {
        await supabase.from('consultations').update({ ai_status: 'failed', ai_retry_count: retries }).eq('id', consultation_id)
        return Response.json({ status: 'failed_permanent' })
      }
      await supabase.from('consultations').update({ ai_status: 'pending', ai_retry_count: retries }).eq('id', consultation_id)
      return Response.json({ status: 'retry', attempt: retries })
    }
    
    // Sauver hypothèses
    for (const h of parsed.hypotheses) {
      await supabase.from('diagnostic_hypotheses').insert({
        consultation_id, rank: h.rank, hypothesis: h.hypothesis, probability_pct: h.probability_pct,
        urgency: h.urgency, specialty_tag: h.specialty_tag,
        estimated_cost_min: h.estimated_cost_min, estimated_cost_max: h.estimated_cost_max,
        recommended_action: h.recommended_action
      })
    }
    
    await supabase.from('consultations').update({ ai_status: 'completed' }).eq('id', consultation_id)
    return Response.json({ status: 'completed', hypotheses: parsed.hypotheses.length })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
