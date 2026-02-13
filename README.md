# 🎨 Portfolio Marcus Rocha - Frontend Developer & 3D Designer

Um portfólio moderno e interativo desenvolvido com as mais recentes tecnologias web, apresentando trabalhos de desenvolvimento frontend, design 3D e animações.

## ✨ Características

- **🎯 Design Responsivo**: Otimizado para todos os dispositivos
- **🌙 Tema Escuro/Claro**: Alternância suave entre temas
- **🎭 Animações Fluidas**: Powered by Framer Motion e GSAP
- **🔮 Background 3D Interativo**: Elementos 3D com Three.js
- **⚡ Performance Otimizada**: Build otimizado com Vite
- **🎨 Design Moderno**: Interface clean e profissional
- **📱 Mobile First**: Totalmente responsivo
- **🚀 Deploy Ready**: Configurado para Vercel

## 🛠️ Tecnologias Principais

### Frontend & Web
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Framer Motion** para animações

### 3D & Interatividade
- **Three.js** para renderização 3D
- **WebGL** para gráficos avançados
- **Canvas API** para animações leves

### Ferramentas
- **Git** para controle de versão
- **ESLint** para qualidade de código
- **PostCSS** para processamento CSS

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/portfolio-marcus.git
cd portfolio-marcus
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:5173](http://localhost:5173) no navegador

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa linting do código

## 🎨 Seções do Portfolio

### 🏠 Hero
- Background 3D interativo com Three.js
- Apresentação pessoal dinâmica
- Links para redes sociais

### 👨‍💻 Sobre
- Informações profissionais
- Estatísticas de experiência
- Áreas de especialização

### 🎯 Skills
- Tecnologias frontend (React, TypeScript, etc.)
- Ferramentas 3D & Animação (Three.js, GSAP, A-Frame)
- Design & Tools (Figma, Blender, etc.)

### 💼 Projetos
- Showcase de projetos em destaque
- Demonstração de habilidades técnicas
- Links para demos e código

### 📞 Contato
- Formulário de contato funcional
- Informações de contato
- Download do CV

## 🎨 Personalização

### Cores
As cores podem ser personalizadas no arquivo `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Suas cores personalizadas
      }
    }
  }
}
```

### Conteúdo
- Edite `src/sections/` para modificar o conteúdo das seções
- Atualize `src/assets/` para adicionar suas imagens
- Modifique `src/components/` para customizar componentes

## 🚀 Portfolio Marcus Rocha - Frontend Developer & 3D Designer

Um portfólio moderno e interativo construído com React, TypeScript, Three.js e Tailwind CSS, featuring:

- ✨ Background 3D interativo com Three.js
- 🎨 Design responsivo e acessível
- 🌙 Modo escuro/claro
- 📱 Totalmente responsivo
- ⚡ Performance otimizada com Vite
- 🎭 Animações fluidas com Framer Motion
- 🔧 TypeScript para type safety

## 🛠️ Tecnologias Utilizadas

### Frontend & Framework
- **React 18** - Biblioteca principal
- **TypeScript** - Type safety
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Styling utilitário

### 3D & Animações
- **Three.js** - Renderização 3D
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Utilitários para React Three Fiber
- **Framer Motion** - Animações React

### UI/UX
- **Lucide React** - Ícones modernos
- **CSS Custom Properties** - Variáveis CSS

## 🚀 Como executar o projeto

```bash
# Instale as dependências
npm install

# Execute o projeto em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🖼️ Adicionando sua imagem de perfil

Para substituir o avatar placeholder pela sua imagem cyberpunk:

1. Salve sua imagem como `profile.jpg` na pasta `public/images/`
2. Recomenda-se uma resolução de 400x400px para melhor resultado
3. A imagem será automaticamente utilizada no Hero e About

## 📦 Deploy no Vercel

```bash
# Instale o Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📞 Contato

- **Email**: marcus@exemplo.com
- **LinkedIn**: [linkedin.com/in/marcus](https://linkedin.com)
- **GitHub**: [github.com/marcus](https://github.com)

---

⭐ **Desenvolvido com ❤️ por Marcus Rocha**

## 🔧 Configuração Avançada

### Performance 3D
Se houver problemas de performance, você pode:

1. Usar a versão lite do background 3D:
```typescript
import { HeroBackground3DLite } from '../components/HeroBackground3DLite';
```

2. Ajustar configurações no `HeroBackground3D.tsx`:
- Reduzir `particleCount`
- Diminuir resolução do renderer
- Simplificar geometrias

### SEO
- Meta tags configuradas em `index.html`
- Estrutura semântica otimizada
- Performance otimizada para Core Web Vitals

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvedor

**Marcus Rocha**
- Frontend Developer & 3D Designer
- Especialista em React, Three.js e Animações Web
- [GitHub](https://github.com/seu-usuario)
- [LinkedIn](https://linkedin.com/in/seu-perfil)

---

⭐ **Gostou do projeto? Deixe uma estrela!** ⭐