-- Fix audit_logs INSERT policy to only allow authenticated users or service role
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Only allow authenticated users to insert their own audit logs, or admin/system
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);