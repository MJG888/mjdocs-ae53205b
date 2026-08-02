-- 1. Hide uploader identity from public/document readers (column-level privilege)
REVOKE SELECT (uploaded_by) ON public.documents FROM anon, authenticated;

-- 2. Restrict profiles to owner-only visibility
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Document intentional privacy of download history
COMMENT ON TABLE public.user_downloads IS 'Private download history. Intentionally readable only by the owning user (auth.uid() = user_id); no admin read policy by design to protect user reading privacy.';