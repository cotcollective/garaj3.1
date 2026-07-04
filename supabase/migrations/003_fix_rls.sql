-- Fix RLS policies avec syntaxe correcte
-- Le problème: auth.jwt()->>'user_metadata'->>'role' = 'admin' n'est pas valide
-- Solution: utiliser auth.jwt() correctement

DROP POLICY IF EXISTS garage_admin ON garages;
CREATE POLICY garage_admin ON garages FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS garage_owner ON garages;
CREATE POLICY garage_owner ON garages FOR ALL 
  USING (auth.uid() = user_id);

-- View pour masquer estimated_cost sur Express non payé
CREATE OR REPLACE VIEW diagnostic_hypotheses_masked AS
SELECT h.*,
  CASE WHEN c.payment_status = 'paid' OR c.type = 'pro' 
    THEN h.estimated_cost_min ELSE NULL END AS visible_cost_min,
  CASE WHEN c.payment_status = 'paid' OR c.type = 'pro' 
    THEN h.estimated_cost_max ELSE NULL END AS visible_cost_max,
  CASE WHEN c.payment_status = 'paid' OR c.type = 'pro' 
    THEN h.recommended_action ELSE substring(h.recommended_action, 1, 80) || '...' END AS visible_action
FROM diagnostic_hypotheses h
JOIN consultations c ON c.id = h.consultation_id;
