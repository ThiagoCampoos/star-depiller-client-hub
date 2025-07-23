-- Remover as políticas existentes que causam recursão
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create users" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update users" ON public.user_profiles;

-- Criar uma nova política que permite acesso anônimo para login
CREATE POLICY "Allow anonymous access for login" 
ON public.user_profiles 
FOR SELECT 
USING (true);

-- Política para admins verem todos os usuários (sem recursão)
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email IN (
      SELECT email FROM public.user_profiles WHERE tipo_usuario = 'admin'
    )
  )
);

-- Política para admins criarem usuários (sem recursão)
CREATE POLICY "Admins can create users" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'role' = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email IN (
      SELECT email FROM public.user_profiles WHERE tipo_usuario = 'admin'
    )
  )
);

-- Política para admins atualizarem usuários (sem recursão)
CREATE POLICY "Admins can update users" 
ON public.user_profiles 
FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email IN (
      SELECT email FROM public.user_profiles WHERE tipo_usuario = 'admin'
    )
  )
);