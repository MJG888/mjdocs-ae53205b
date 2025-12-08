-- Fix RLS policies for profiles table - restrict public access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Only allow users to view their own profile, admins can view all
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Fix RLS policies for user_roles table - restrict public access  
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;

-- Only allow users to view their own roles, admins can view all
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Ensure document_versions has proper restrictions
DROP POLICY IF EXISTS "Anyone can view versions of active docs" ON public.document_versions;

-- Only allow viewing versions of active documents
CREATE POLICY "Users can view versions of active documents"
ON public.document_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_versions.document_id 
    AND documents.status = 'active'
  )
  OR public.has_role(auth.uid(), 'admin')
);