import type { ProjectCase } from '../types/portfolio';

export const caseStudies: ProjectCase[] = [
  {
    id: 'motodiario',
    name: 'Motodiario.app',
    category: 'Product / Full Stack',
    role: 'Founder · Full Stack Developer · Designer',
    summary:
      'Plataforma própria em produção para gestão de ganhos, abastecimentos, manutenção, quilometragem e metas de motoboys.',
    problem:
      'Organizar a rotina financeira e operacional de profissionais que trabalham na rua, com dados espalhados.',
    steps: [
      'Arquitetura do produto e evolução contínua desde o zero.',
      'Interface e fluxos mobile-first, do cadastro ao acompanhamento.',
      'Autenticação, banco de dados e integrações via Firebase e APIs REST.',
      'Metas, manutenção, quilometragem, mapa de calor e modo compacto.',
    ],
    result: 'Produto web completo em produção, evoluindo de forma contínua.',
    tech: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Firebase', 'APIs REST', 'PWA'],
    url: 'https://www.motodiario.app/',
    urlLabel: 'Ver produto',
    gallery: [
      { src: '/port/motodiario/telas/motodiario_financeiro_completro_scrool.jpeg', caption: 'Financeiro' },
      { src: '/port/motodiario/telas/motodiario_combustivel.jpeg', caption: 'Abastecimentos' },
      { src: '/port/motodiario/telas/motodiario_manutencoes.jpeg', caption: 'Manutenções' },
      { src: '/port/motodiario/telas/motodiario_mapadecalor_gps.jpeg', caption: 'Mapa de calor' },
      { src: '/port/motodiario/telas/motodiario_compactmode.jpeg', caption: 'Modo compacto' },
    ],
  },
  {
    id: 'pedalhe',
    name: 'Pedalhe',
    category: 'E-commerce / WordPress',
    role: 'Tema e plugins próprios · Integrações',
    summary:
      'E-commerce de roupas técnicas para ciclismo em WordPress/WooCommerce, com tema e plugins próprios, regras personalizadas de carrinho e integração independente de pagamento via PIX.',
    problem:
      'Transformar catálogo, checkout e pagamento em uma operação de venda funcional, sem depender de plugins prontos que não cobriam as regras da loja.',
    steps: [
      'Tema próprio: catálogo, página de produto, institucional e landing pages da marca.',
      'Plugin de regras de carrinho: condições e personalizações além do padrão do WooCommerce.',
      'Plugin de pagamento PIX: integração independente, com geração de cobrança e confirmação de status.',
      'Tipos de conteúdo e campos personalizados (ACF/CPTs) para catálogo e comunicação.',
      'Landing page de campanha (NaChuva) dentro do mesmo tema e plugins da marca.',
    ],
    result: 'Loja sob medida, com personalizações que passam do visual para a regra de negócio.',
    tech: ['WordPress', 'WooCommerce', 'PHP', 'JavaScript', 'API PIX', 'ACF', 'CPTs'],
    gallery: [
      { src: '/portfolio/pedalhe/home.webp', caption: 'Home' },
      { src: '/portfolio/pedalhe/shop.webp', caption: 'Catálogo' },
      { src: '/portfolio/pedalhe/produto.webp', caption: 'Produto' },
      { src: '/portfolio/pedalhe/manifesto.webp', caption: 'Manifesto' },
      { src: '/portfolio/pedalhe/nachuva.webp', caption: 'Landing NaChuva' },
    ],
  },
  {
    id: 'unitv',
    name: 'UNITV',
    category: 'Portal / WordPress',
    role: 'Desenvolvimento e manutenção',
    summary:
      'Portal de notícias em WordPress no ar há mais de 5 anos, com mais de 5 mil publicações e rotina editorial contínua.',
    steps: [
      'Portal de notícias com tema e estrutura editorial em WordPress.',
      'Categorias, matérias, mídia e publicação contínua.',
      'Manutenção e evolução ao longo de mais de 5 anos.',
    ],
    tech: ['WordPress', 'PHP', 'Tema', 'Portal de notícias'],
    url: 'https://www.unitv.com.br/',
    urlLabel: 'Ver portal',
    gallery: [{ src: '/portfolio/unitv/home.webp', caption: 'Portal UNITV' }],
  },
  {
    id: 'vertica',
    name: 'Vertica 3D',
    category: 'Marca / Web',
    role: 'Identidade visual e interface',
    summary:
      'Site e identidade visual da Vertica 3D — impressão 3D com a ideia de que "ideias ganham forma". Criação da marca e da direção visual da página.',
    steps: [
      'Identidade e direção visual da marca.',
      'Layout e interface do site.',
      'Seções de produto, processo e contato.',
    ],
    tech: ['Branding', 'Identidade visual', 'UI', 'Web'],
    url: 'https://vertica3d.vercel.app/',
    urlLabel: 'Ver site',
    gallery: [{ src: '/portfolio/vertica/home.webp', caption: 'Vertica 3D' }],
  },
];
