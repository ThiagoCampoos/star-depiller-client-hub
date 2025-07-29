import { createClient } from '@supabase/supabase-js';

// Crie um cliente Supabase com a chave de serviço (service_role)
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password, nome, tipo_usuario } = req.body;

  try {
    // Verificar se o usuário que está fazendo a solicitação é um admin
    const { data: { user } } = await adminSupabase.auth.getUser(req.headers.authorization?.split(' ')[1]);
    
    if (!user) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    
    const { data: adminProfile } = await adminSupabase
      .from('user_profiles')
      .select('tipo_usuario')
      .eq('user_id', user.id)
      .single();
    
    if (!adminProfile || adminProfile.tipo_usuario !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Criar o usuário usando a API de Admin
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        nome,
        tipo_usuario
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, user: data.user });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}