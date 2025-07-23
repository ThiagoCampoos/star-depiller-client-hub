import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  username: string; // Adicionando o campo username
  tipo_usuario: 'admin' | 'funcionario';
  ativo: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        setUserProfile(null);
        setIsAdmin(false);
      } else {
        setUserProfile(data as UserProfile);
        setIsAdmin(data.tipo_usuario === 'admin');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setIsAdmin(false); // Resetar isAdmin quando não há usuário
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Tentando login com username:', username);
      
      // Buscar o perfil do usuário pelo username
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*') // Selecionar todos os campos do perfil
        .eq('username', username)
        .single();
      
      console.log('Resultado da busca de perfil:', { profileData, profileError });
      
      if (profileError || !profileData) {
        console.error('Erro ao buscar perfil:', profileError || 'Perfil não encontrado');
        return { error: { message: 'Nome de usuário ou senha incorretos' } };
      }// ❌ Pode causar problemas
{condition && <Component />}

// ✅ Melhor
{condition ? <Component /> : null}
      
      // Verificar se o usuário está ativo
      if (!profileData.ativo) {
        console.error('Usuário inativo');
        return { error: { message: 'Usuário inativo. Contate o administrador.' } };
      }
      
      // Autenticação personalizada - verificar a senha diretamente
      // Aqui você precisará implementar uma verificação de senha segura
      // Por enquanto, para fins de teste, vamos usar uma verificação simples
      if (password === 'admin' && username === 'admin') {
        // Login bem-sucedido para o admin
        // Criar uma sessão personalizada
        const session = {
          user: {
            id: profileData.id,
            email: profileData.email || 'admin@local',
            user_metadata: {
              nome: profileData.nome,
              username: profileData.username,
              tipo_usuario: profileData.tipo_usuario
            }
          }
        };
        
        // Armazenar a sessão no estado
        setUser(session.user as User);
        setSession(session as unknown as Session);
        setUserProfile(profileData);
        setIsAdmin(profileData.tipo_usuario === 'admin');
        
        return { error: null };
      } else {
        // Senha incorreta
        console.error('Senha incorreta');
        return { error: { message: 'Nome de usuário ou senha incorretos' } };
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      return { error };
    }
  };

  const signOut = async () => {
    // Limpar a sessão personalizada
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setIsAdmin(false);
    
    // Também limpar qualquer sessão do Supabase que possa existir
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return;
    }
    
    setUserProfile(data);
    setIsAdmin(data.tipo_usuario === 'admin');
  };

  // Remover esta linha
  // const isAdmin = userProfile?.tipo_usuario === 'admin';

  const value = {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};