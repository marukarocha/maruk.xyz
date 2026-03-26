import type { ProjectData } from './types';

export const pdvShowcase: ProjectData = {
  id: 'pdv-showcase',
  title: 'PDV Spatial Showcase',
  shortDescription:
    'Case 3D para apresentar um ambiente comercial com narrativa guiada, hotspots clicaveis, HUD editorial e transicoes de camera pensadas para vender contexto e atmosfera.',
  role: 'Creative Developer · 3D Direction',
  tags: ['Three.js', 'Spatial UI', 'Kinetic Typography', 'GSAP'],

  problem:
    'Apresentacoes de produto 3D costumam mostrar so o modelo girando. O desafio aqui foi transformar a cena em narrativa: destacar setores, explicar o fluxo operacional e manter a interface elegante sem matar a imersao.',

  solution:
    'Criei uma experiencia spatial-first em Three.js com camera tour coreografada, hotspots semanticos, HUD lateral e uma linguagem visual inspirada em kinetic typography. O resultado mistura demonstracao tecnica com storytelling de produto.',

  challenges: [
    'Encontrar um equilibrio entre densidade informacional e leitura visual limpa dentro da cena 3D.',
    'Orquestrar animacoes de camera, interface e marcadores interativos sem perder performance.',
    'Construir um case que funcione tanto como experimento visual quanto como vitrine comercial.'
  ],

  features: [
    'Cena 3D navegavel com hotspots e estados de hover.',
    'Tour automatico com pontos de vista estrategicos e camera easing.',
    'HUD lateral com notas, contexto operacional e metricas visuais.',
    'Narrativa com posters editoriais em alta definicao para reforcar o case.'
  ],

  techStack: ['Three.js', 'GSAP', 'TypeScript', 'GLTFLoader', 'OrbitControls', 'Spatial Storytelling'],

  deepDive: {
    headline:
      'Um case desenhado para vender a cena, a interface e a intencao de produto ao mesmo tempo.',
    blocks: [
      {
        title: 'Narrativa Espacial',
        summary: 'A camera deixa de ser observadora e passa a ser guia editorial.',
        points: [
          'Roteiro com poses de introducao, overview e focos taticos por hotspot.',
          'Transicoes pensadas para revelar setores do ambiente sem cortar contexto.',
          'Sequencia de enquadramentos para aproximar UX, arquitetura e atmosfera.'
        ]
      },
      {
        title: 'Camada de Interface',
        summary: 'HUD e labels entram como extensao da cena, nao como overlay genérico.',
        points: [
          'Painel lateral contextual alinhado ao hotspot ativo.',
          'Blocos curtos de texto para leitura rapida em ritmo de showcase.',
          'Sistema visual com contraste alto, glow controlado e hierarquia cinematica.'
        ]
      },
      {
        title: 'Motor de Interacao',
        summary: 'A experiencia prioriza clareza de gesto e resposta visual.',
        points: [
          'Raycaster para descoberta de hotspots com feedback imediato.',
          'Interpolacao de ponteiro e camera para sensacao de inercia e refinamento.',
          'Estados de reveal progressivo para conduzir a exploracao da cena.'
        ]
      },
      {
        title: 'Performance & Produção',
        summary: 'A cena foi pensada para portifolio real, nao para demo descartavel.',
        points: [
          'Carga modular de GLB com setup dedicado de luz, sombras e materiais.',
          'Animacoes GSAP desacopladas da render loop para manter controle editorial.',
          'Base pronta para receber novas midias, capitulos e experimentos 3D.'
        ]
      }
    ]
  },

  images: {
    hero: '/port/pdv-showcase/hero-poster.svg',
    gallery: [
      '/port/pdv-showcase/flow-poster.svg',
      '/port/pdv-showcase/camera-poster.svg',
      '/port/pdv-showcase/hero-poster.svg'
    ]
  },

  links: {
    live: '/playground/pdv-showcase'
  }
};
