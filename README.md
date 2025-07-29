### 1. Visão Geral do Sistema
O Star Depiller é um sistema de gerenciamento para clínicas de depilação, desenvolvido para facilitar o controle de clientes, agendamentos, tratamentos e usuários. O sistema oferece uma interface intuitiva e moderna, com funcionalidades específicas para o segmento de estética e depilação.

### 2. Tecnologias Utilizadas Frontend
- React : Biblioteca JavaScript para construção de interfaces
- TypeScript : Superset tipado de JavaScript
- Vite : Ferramenta de build rápida para desenvolvimento web
- React Router : Gerenciamento de rotas na aplicação
- React Query : Gerenciamento de estado e cache para requisições
- React Hook Form : Gerenciamento de formulários
- Zod : Validação de esquemas
- Tailwind CSS : Framework CSS utilitário
- Shadcn/UI : Componentes de UI baseados em Radix UI
- Lucide React : Biblioteca de ícones
- Date-fns : Biblioteca para manipulação de datas
- Sonner : Biblioteca para notificações toast Backend
- Supabase : Plataforma de backend como serviço (BaaS)
  - Autenticação e autorização
  - Banco de dados PostgreSQL
  - Armazenamento de arquivos
  - Funções e procedimentos armazenados Hospedagem
- Vercel : Plataforma de hospedagem e deploy
### 3. Estrutura do Banco de Dados Tabelas Principais
- clientes : Armazena informações dos clientes
- sessoes : Registra as sessões de tratamento agendadas
- fichas_avaliacao : Contém as fichas de avaliação dos clientes
- tratamentos : Registra os tratamentos em andamento
- user_profiles : Armazena os perfis de usuários do sistema Visões (Views)
- clientes_tratamentos_ativos : Exibe clientes com tratamentos ativos
- estatisticas_gerais : Fornece estatísticas gerais do sistema Funções
- buscar_clientes : Função para busca de clientes
- proximas_sessoes : Função para listar próximas sessões
### 4. Guia de Uso do Sistema 4.1 Acesso ao Sistema
1. 1.
   Acesse o sistema através da URL fornecida
2. 2.
   Na tela de login, insira seu email e senha cadastrados
3. 3.
   Clique em "Entrar" para acessar o sistema 4.2 Dashboard
A tela inicial apresenta um resumo das informações importantes:

- Total de clientes cadastrados
- Sessões agendadas para hoje
- Total de sessões realizadas
- Lista das próximas sessões agendadas
- Ações rápidas para cadastrar clientes e visualizar agenda 4.3 Gerenciamento de Clientes
1. 1.
   Listagem de Clientes
   
   - Acesse o menu "Clientes" para visualizar todos os clientes cadastrados
   - Utilize a barra de busca para encontrar clientes por nome, telefone, RG ou CPF
   - Filtre por cidade ou data de cadastro
2. 2.
   Cadastro de Novo Cliente
   
   - Clique no botão "Novo Cliente" na tela de clientes
   - Preencha os dados do formulário (nome, telefone, cidade, data de nascimento, etc.)
   - Clique em "Salvar" para cadastrar o cliente
3. 3.
   Edição de Cliente
   
   - Na lista de clientes, clique no botão de edição do cliente desejado
   - Atualize as informações necessárias
   - Clique em "Salvar" para atualizar os dados
4. 4.
   Exclusão de Cliente
   
   - Na lista de clientes, clique no botão de exclusão do cliente desejado
   - Confirme a exclusão na caixa de diálogo 4.4 Agenda e Sessões
1. 1.
   Visualização da Agenda
   
   - Acesse o menu "Agenda" para visualizar as sessões agendadas
   - Utilize os filtros por clínica e data para refinar a visualização
2. 2.
   Agendamento de Nova Sessão
   
   - Clique no botão "Novo Agendamento" na tela de agenda
   - Selecione o cliente, clínica, áreas de tratamento e demais informações
   - Defina a data e horário da sessão
   - Clique em "Agendar" para confirmar
3. 3.
   Edição de Sessão
   
   - Na agenda, clique na sessão que deseja editar
   - Atualize as informações necessárias
   - Clique em "Salvar" para atualizar os dados 4.5 Gerenciamento de Usuários (Apenas Administradores)
1. 1.
   Listagem de Usuários
   
   - Acesse o menu "Usuários" para visualizar todos os usuários cadastrados
   - Apenas administradores têm acesso a esta funcionalidade
2. 2.
   Cadastro de Novo Usuário
   
   - Clique no botão "Novo Usuário" na tela de usuários
   - Preencha os dados do formulário (nome, email, senha, tipo de usuário)
   - Clique em "Criar" para cadastrar o usuário
3. 3.
   Edição de Usuário
   
   - Na lista de usuários, clique no botão de edição do usuário desejado
   - Atualize as informações necessárias
   - Clique em "Salvar" para atualizar os dados
### 5. Manutenção e Suporte 5.1 Backup do Banco de Dados
O Supabase oferece backups automáticos do banco de dados. Recomenda-se também realizar backups manuais periodicamente através do painel de controle do Supabase.
 5.2 Atualização do Sistema
Para atualizar o sistema:

1. 1.
   Faça as alterações necessárias no código-fonte
2. 2.
   Realize o commit das alterações para o repositório Git
3. 3.
   A Vercel detectará automaticamente as alterações e realizará o deploy da nova versão
