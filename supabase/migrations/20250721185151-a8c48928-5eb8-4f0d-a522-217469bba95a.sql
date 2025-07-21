-- Criar tabela de perfis de usuário para controle interno
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL DEFAULT 'funcionario' CHECK (tipo_usuario IN ('admin', 'funcionario')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem seus próprios dados
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para admins verem todos os usuários
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);

-- Política para admins criarem usuários
CREATE POLICY "Admins can create users" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);

-- Política para admins atualizarem usuários
CREATE POLICY "Admins can update users" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar usuário admin automaticamente ao inserir na auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Só criar perfil se for o email admin específico
  IF NEW.email = 'admin@stardepiller.com' THEN
    INSERT INTO public.user_profiles (user_id, nome, email, tipo_usuario)
    VALUES (NEW.id, 'Administrador', NEW.email, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir usuário admin inicial (se não existir)
-- Senha será: admin123
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Verificar se já existe um admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@stardepiller.com') THEN
    -- Inserir o usuário admin na tabela auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@stardepiller.com',
      '$2a$10$rM7QRj6QWe5RJNF8lA9QgeVYL1JJe5F2rW8JzpGw8Oz1QgXV7LK4e', -- Hash de 'admin123'
      now(),
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_user_id;
    
    -- O trigger handle_new_user criará automaticamente o perfil
  END IF;
END $$;