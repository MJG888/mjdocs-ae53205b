-- Fix user_roles RLS policy to avoid recursion when has_role is called
-- The has_role function is SECURITY DEFINER so it bypasses RLS, but let's make the policy simpler

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create simpler policies that don't cause recursion
-- Users can view their own roles (simple check, no function call)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all roles (for admin operations, use service role or separate check)
-- Since has_role is SECURITY DEFINER, this should work without recursion
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));