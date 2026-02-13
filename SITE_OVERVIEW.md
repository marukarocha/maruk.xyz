# Visão Geral do Site Maruk

Este documento descreve a estrutura atual do projeto, os textos presentes e a organização dos componentes para fins de revisão e correção.

## 1. Stack Tecnológica
- **Framework**: React com TypeScript e Vite
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion, GSAP (GreenSock)
- **3D**: Thee.js (via React Three Fiber/Drei)
- **Ícones**: Lucide React

## 2. Estrutura de Componentes (App.tsx)
A aplicação principal é composta pelas seguintes seções, renderizadas nesta ordem:

1.  `Navigation` (Menu fixo no topo)
2.  `Hero` (Seção inicial com logo e apresentação)
3.  `About` (Seção "Sobre" que contém o componente `ProjectsShowcase`)
4.  `Skills` (Lista de habilidades)
5.  `Contact` (Formulário e informações de contato)
6.  `Footer` (Rodapé)

*Nota: As seções `Showcase3D` e `Projects` estão atualmente comentadas (desativadas) no código.*

## 3. Conteúdo e Textos

### 3.1. Navegação (`Navigation.tsx`)
Itens do menu:
- Home
- Sobre
- Skills
- 3D Showcase (link para #showcase, atualmente desativado)
- Projetos (link para #projects, atualmente desativado)
- Contato

### 3.2. Hero Section (`Hero.tsx`)
- **Título**: Frontend Developer • 3D Designer
- **Descrição**: "Criando experiências digitais imersivas e minimalistas. Especialista em WebGL, Three.js e interfaces modernas de alta performance."
- **Botões (CTA)**:
    - "Projetos Selecionados" (link para #projects)
    - "Entrar em contato" (link para #contact)
- **Links Sociais**: GitHub, Instagram.

### 3.3. Sobre / Projetos (`About.tsx` e `ProjectsShowcase.tsx`)
Esta seção lista categorias de serviços/projetos. Ao clicar em uma categoria, abre-se o showcase.

**Categorias (Cards):**
1.  **Frontend Development**
    - Descrição: "Desenvolvimento frontend moderno com React, TypeScript e as mais recentes tecnologias web."
2.  **3D Design & WebGL**
    - Descrição: "Criação de experiências 3D interativas usando Three.js, A-Frame e WebGL nativo."
3.  **Animações Avançadas**
    - Descrição: "Animações fluidas e interativas com GreenSock (GSAP), Framer Motion e CSS avançado."
4.  **UI/UX Design**
    - Descrição: "Design de interfaces modernas e experiências de usuário que convertem e engajam."

**Projetos Detalhados (dentro de `ProjectsShowcase.tsx`):**
*Estes textos aparecem quando o usuário clica em uma categoria.*

- **Categoria: Frontend**
    - *E-commerce Platform*: "Plataforma completa de e-commerce com React, Next.js e TypeScript"
    - *Dashboard Analytics*: "Dashboard interativo com gráficos e métricas em tempo real"
    - *Social Media App*: "Aplicativo de rede social com chat em tempo real"
- **Categoria: 3D**
    - *Virtual Showroom*: "Showroom virtual 3D para visualização de produtos"
    - *Interactive Museum*: "Tour virtual interativo de museu com experiência imersiva"
- **Categoria: Animation**
    - *Interactive Portfolio*: "Portfolio com animações complexas e interações fluidas"
    - *Motion Landing Page*: "Landing page com micro-interações e animações avançadas"
- **Categoria: Design**
    - *Design System*: "Sistema de design completo com componentes reutilizáveis"
    - *Mobile App UI*: "Interface para aplicativo móvel com foco em UX"

### 3.4. Skills (`Skills.tsx`)
- **Título**: "Minhas Skills"
- **Subtítulo**: "Tecnologias e ferramentas especializadas em desenvolvimento frontend, design 3D e animações interativas"

**Lista de Habilidades:**
- **Frontend**: React, TypeScript, Next.js, Vue.js, JavaScript ES6+
- **3D & Animation**: Three.js, A-Frame, GreenSock (GSAP), WebGL, Framer Motion
- **Design & Tools**: Figma, Adobe Creative Suite, Blender, Git, Vite

### 3.5. Contato (`Contact.tsx`)
- **Título**: "Vamos Conversar"
- **Texto**: "Tem um projeto em mente? Vamos criar algo incrível juntos. Entre em contato e vamos discutir suas ideias sobre desenvolvimento frontend ou design 3D."
- **Informações**:
    - Email: marcusvsrocha@gmail.com
    - Telefone: 48 99634-8047
    - Localização: Florianópolis, SC
- **Campos do Formulário**: Nome, Email, Assunto, Mensagem.

### 3.6. Rodapé (`Footer.tsx`)
- **Texto de Copyright**: "© [Ano] Maruk. Feito com [Heart Icon] usando React, TypeScript e Tailwind CSS."
- **Info Extra**: "Hospedado no Vercel."
- **Links**: Home, Sobre, Skills, Projetos, Contato.

---

## 4. Seções Desativadas (Código Comentado)

### 4.1. Projetos (`Projects.tsx`)
*Esta seção possui uma lista alternativa de projetos.*
- *Experience WebXR Imersiva*: "Experiência de realidade virtual interativa usando A-Frame e WebXR APIs..."
- *Dashboard 3D Interativo*: "Dashboard de dados com visualizações 3D em tempo real..."
- *Portfolio Interativo 3D*: "Website portfolio com elementos 3D interativos..."
- *E-commerce com AR*: "Loja virtual com visualização de produtos em realidade aumentada..."
- *Configurador 3D Produto*: "Aplicação para customização de produtos em tempo real..."
- *Landing Page Animada*: "Landing page com animações complexas..."

### 4.2. Showcase 3D (`Showcase3D.tsx`)
- **Título**: "3D Interactive Workspace"
- **Descrição**: "Explore minha estação de trabalho em 3D. Clique e arraste para interagir com o modelo!"
