# Sistema de Proteção do Laboratório

## Visão Geral

Foi implementado um sistema de proteção por senha para as seguintes páginas do laboratório:

1. **Gabe Turismo** (`/playground/tourism-guide`) - Landing page editorial para guia em Morro de São Paulo
2. **Lagoa E-Bikes** (`/playground/experience-studio`) - Página comercial para aluguel, oficina e venda de bicicletas elétricas

## Como Funciona

### Autenticação
- Ao acessar uma página protegida, o usuário é redirecionado para uma tela de login
- A senha padrão é: `lab2024`
- Após autenticação bem-sucedida, o acesso é armazenado no `localStorage` do navegador
- Cada página tem sua própria chave de autenticação (ex: `lab_auth_tourism-guide`)

### Interface
- Tela de login com design que combina com o tema do site
- Botão de logout flutuante no canto superior direito quando autenticado
- Mensagens de erro para senhas incorretas

## Configuração

### Alterar a Senha
Para alterar a senha padrão, edite o arquivo `src/App.tsx`:

```typescript src/App.tsx
<Route 
  path=":id/*" 
  element={
    <ProtectedRoute 
      allowedPaths={['tourism-guide', 'experience-studio']}
      password="SUA_NOVA_SENHA_AQUI"  // ← Altere aqui
    >
      <ExperimentView />
    </ProtectedRoute>
  } 
/>
```

### Adicionar/Remover Páginas Protegidas
Para adicionar ou remover páginas da proteção, modifique o array `allowedPaths`:

```typescript src/App.tsx
allowedPaths={['tourism-guide', 'experience-studio', 'nova-pagina']}
```

### Personalizar a Tela de Login
O componente de proteção está em `src/components/ProtectedRoute.tsx`. Você pode personalizar:
- Textos e mensagens
- Estilos e cores
- Comportamento de autenticação

## Fluxo de Acesso

1. Usuário tenta acessar `/playground/tourism-guide` ou `/playground/experience-studio`
2. Sistema verifica se há autenticação no `localStorage`
3. Se não autenticado, mostra tela de login
4. Após login bem-sucedido, redireciona para a página
5. Botão de logout permite encerrar a sessão

## Considerações de Segurança

### Nível de Segurança
- **Proteção básica**: Adequada para restringir acesso casual
- **Não é criptografia forte**: A senha é armazenada em texto no código-fonte
- **Armazenamento local**: A autenticação persiste apenas no navegador atual

### Para Casos de Uso Mais Críticos
Se precisar de maior segurança, considere:
1. Implementar autenticação por token JWT
2. Adicionar backend com banco de dados de usuários
3. Usar provedores de autenticação (Auth0, Firebase Auth, etc.)
4. Configurar proteção por IP no servidor (Vercel, Netlify, etc.)

## Testando a Implementação

### URLs para Teste
- Página protegida 1: `http://localhost:5173/playground/tourism-guide`
- Página protegida 2: `http://localhost:5173/playground/experience-studio`
- Página não protegida: `http://localhost:5173/playground/drinks`

### Senha para Teste
- Senha padrão: `lab2024`

### Limpar Autenticação
Para testar novamente o fluxo de login:
1. Abra as Ferramentas de Desenvolvedor (F12)
2. Vá para "Application" → "Local Storage"
3. Remova as chaves `lab_auth_tourism-guide` e `lab_auth_experience-studio`
4. Recarregue a página

## Manutenção

### Atualização da Senha
Se a senha for alterada, os usuários precisarão:
1. Fazer logout (botão no canto superior direito)
2. Fazer login novamente com a nova senha

### Compatibilidade
- Funciona em todos os navegadores modernos
- Responsivo para dispositivos móveis
- Compatível com o tema escuro do site

## Solução de Problemas

### Problema: Login não funciona
**Solução:**
1. Verifique se a senha no código corresponde à digitada
2. Limpe o cache do navegador
3. Verifique o console do navegador para erros

### Problema: Botão de logout não aparece
**Solução:**
1. Verifique se está realmente autenticado
2. Recarregue a página
3. Verifique se há erros no console

### Problema: Proteção aplicada a páginas erradas
**Solução:**
1. Verifique o array `allowedPaths` no `App.tsx`
2. Certifique-se de que os IDs correspondem aos do registro de experimentos