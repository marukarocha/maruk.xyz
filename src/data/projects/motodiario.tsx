import type { ProjectData } from './types';

export const motodiario: ProjectData = {
  id: 'motodiario',
  title: 'Moto Diario',
  shortDescription:
    'Plataforma operacional para motoentregadores acompanharem lucro real, custos, manutencao, corridas e desempenho em uma experiencia mobile-first.',
  role: 'Lead Developer & Product Designer',
  tags: ['PWA', 'Delivery Ops', 'Mobile-First'],

  problem:
    'Operacao de motoentregadores é altamente desconectada: ganhos, custos, abastecimento e manutencion são gerenciados em aplicativos diferentes e notas soltas que não entregam insights acionáveis. Sem consolidar esses dados, é muito difícil calcular profitabilidade real, prever despesas e tomar decisoes inteligentes em tempo real.',

  solution:
    'Criar uma PWA moderna em Next.js com Firebase que unifica controles financeiros, corridas, consumo de combustivel, manutencao e trajetos GPS em uma experiência mobile-first. A interface prioriza ações rápidas, historico automatizado, relatórios instantâneos e alertas preventivos para rotina de alta pressão.',

  challenges: [
    'Traduzir uma rotina operacional complexa em uma interface simples, rapida e usavel no contexto mobile.',
    'Conectar dados de ganhos, custos, abastecimentos e manutencao sem transformar a experiencia em algo pesado ou confuso.',
    'Equilibrar profundidade analitica com fluidez de uso para um produto acessado com frequencia no dia a dia.'
  ],

  features: [
    'Controle financeiro com leitura de lucro liquido, despesas operacionais e visao consolidada por periodo.',
    'Registro de corridas com indicadores por plataforma, distancia, ganho por hora e ganho por km.',
    'Controle de abastecimento com historico de consumo, eficiencia da moto e integracao com custos.',
    'Gestao de manutencao preventiva com historico da moto, categorias e acompanhamento de revisoes.',
    'Recursos de GPS, mapas e visualizacoes operacionais para apoiar analise de deslocamento e produtividade.',
    'Perfil publico e ferramentas complementares para ampliar utilidade e presenca digital do entregador.'
  ],

  techStack: [
    'Next.js',
    'React',
    'TypeScript',
    'Firebase',
    'Firestore',
    'Material Design 3',
    'Framer Motion',
    'Mapbox',
    'Leaflet'
  ],

  deepDive: {
    headline:
      'Arquitetura orientada a operação real de rua: baixa fricção de uso, rastreabilidade financeira e consistência de dados para decisões táticas diárias.',
    blocks: [
      {
        title: 'Arquitetura de Aplicação',
        summary: 'Estrutura modular focada em velocidade de evolução e manutenção previsível.',
        points: [
          'Separação por domínios operacionais (financeiro, corridas, combustível, manutenção e perfil) com boundaries claros de estado e UI.',
          'PWA em Next.js com estratégia mobile-first e rotas otimizadas para acesso rápido em contexto de rua.',
          'Camada de serviços desacoplada da camada de interface, permitindo evolução de regras de negócio sem retrabalho visual.',
          'Versionamento de funcionalidades por feature flags para rollout seguro de novos fluxos.'
        ]
      },
      {
        title: 'Modelo de Dados & Analytics',
        summary: 'Dados transacionais e analíticos desenhados para leitura operacional em tempo real.',
        points: [
          'Modelagem no Firestore com coleções por contexto de uso e documentos derivados para leituras de alta frequência.',
          'Normalização seletiva: escrita otimizada para consistência e leitura agregada para dashboards de lucro e produtividade.',
          'Cálculos de métricas-chave (lucro líquido, custo por km, ganho por hora e eficiência de combustível) com recomputação incremental.',
          'Histórico temporal por período para análise comparativa semanal/mensal e suporte a tomada de decisão.'
        ]
      },
      {
        title: 'Engine de Regras de Negócio',
        summary: 'Regras críticas encapsuladas para reduzir erro manual e garantir previsibilidade.',
        points: [
          'Pipeline de fechamento financeiro com consolidação automática de receitas, custos fixos e custos variáveis.',
          'Sistema de manutenção preventiva baseado em quilometragem e histórico para antecipar revisões críticas.',
          'Validações de entrada e saneamento de dados para manter qualidade analítica mesmo com uso intensivo no mobile.',
          'Estados de domínio com fallback e recuperação para evitar perda de contexto durante operação contínua.'
        ]
      },
      {
        title: 'Confiabilidade, Segurança & Performance',
        summary: 'Stack preparada para uso recorrente, sessões curtas e ambiente com conectividade variável.',
        points: [
          'Regras de segurança no Firebase para isolamento de dados por usuário e controle de acesso por recurso.',
          'Estratégia de cache e sincronização para manter experiência fluida em cenários de rede instável.',
          'Lazy loading e divisão de responsabilidades visuais para reduzir tempo de carregamento inicial.',
          'Otimização de rendering e payload para estabilidade em dispositivos intermediários com alto volume de uso diário.'
        ]
      },
      {
        title: 'Operação de Produto & Escalabilidade',
        summary: 'Fundação para crescimento contínuo do produto com visão de plataforma.',
        points: [
          'Arquitetura preparada para expansão de módulos (novas integrações, novos relatórios e recursos de marketplace).',
          'Instrumentação de eventos para observação de comportamento e priorização de roadmap orientada por uso real.',
          'Padrão de componentes reutilizáveis para acelerar entrega de novas features sem degradar consistência da UX.',
          'Base técnica pronta para evoluir de ferramenta individual para ecossistema operacional de entregadores.'
        ]
      }
    ]
  },

  images: {
    hero: '/images/motodiario-hero.jpg',
    heroVideo: '/port/motodiario/fundohero.mp4',
    logo: '/port/motodiario/logo/logo.webp',
    gallery: [
      '/port/motodiario/telas/motodiario_financeiro_completro_scrool.jpeg',
      '/port/motodiario/telas/motodiario_Rastreio_de_corridas.jpeg',
      '/port/motodiario/telas/motodiario_manutencoes.jpeg',
      '/port/motodiario/telas/motodiario_mapadecalor_gps.jpeg',
      '/port/motodiario/telas/motodiario_perfil.png'
    ]
  },

  links: {
    live: 'https://www.motodiario.app',
    github: 'https://github.com/marukarocha/motodiariov2'
  }
};
