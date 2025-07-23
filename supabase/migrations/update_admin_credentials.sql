-- Adicionar coluna username à tabela user_profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'username') THEN
    ALTER TABLE public.user_profiles ADD COLUMN username TEXT;
    -- Inicialmente, definir username igual ao email para usuários existentes
    UPDATE public.user_profiles SET username = SPLIT_PART(email, '@', 1);
    -- Tornar o campo username NOT NULL e UNIQUE
    ALTER TABLE public.user_profiles ALTER COLUMN username SET NOT NULL;
    ALTER TABLE public.user_profiles ADD CONSTRAINT unique_username UNIQUE (username);
  END IF;
END
$$;

-- Atualizar a senha do usuário admin para 'admin'
UPDATE auth.users
SET encrypted_password = '$2a$10$rM7QRj6QWe5RJNF8lA9QgeVYL1JJe5F2rW8JzpGw8Oz1QgXV7LK4e' -- Hash de 'admin'
WHERE email = 'admin@stardepiller.com';

-- Atualizar o nome de usuário do admin para 'admin'
UPDATE public.user_profiles
SET username = 'admin'
WHERE email = 'admin@stardepiller.com';