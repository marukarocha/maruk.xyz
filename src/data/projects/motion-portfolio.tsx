import type { ProjectData } from './types';

export const motionPortfolio: ProjectData = {
  id: 'motion-portfolio',
  title: 'Motion Design Portfolio',
  shortDescription: 'Coleção de trabalhos em motion design e animações interativas.',
  role: 'Motion Designer & Developer',
  tags: ['Motion Design', 'GSAP', 'Framer Motion', 'WebGL', 'Interactive'],

  problem: 'Preciso apresentar meu trabalho em motion design de forma imersiva e profissional.',
  solution: 'Criei um portfólio dedicado com animações fluidas e interativas, destacando técnicas avançadas de motion design.',

  challenges: [
    'Integrar vídeo do Vimeo de forma responsiva',
    'Criar transições suaves entre diferentes estilos de animação',
    'Otimizar performance para dispositivos móveis',
  ],
  features: [
    'Vídeo showcase principal',
    'Animações CSS avançadas',
    'Interações micro-interativas',
    'Design responsivo',
  ],
  techStack: ['After Effects', 'Premiere Pro', 'Motion Design', 'Edicao de Video', 'Direcao de Arte'],

  videos: [
    { title: 'Reel Principal', url: 'https://vimeo.com/816333951' },
    { title: 'Video E-ouv Gov. Federal', url: 'https://vimeo.com/801965062' },
    { title: 'Gestao de Risco', url: 'https://vimeo.com/802180969' },
    { title: 'Colaborar Faz A Diferenca', url: 'https://vimeo.com/801951255' },
    { title: 'MDR Gov Federal', url: 'https://vimeo.com/801929809' },
    { title: 'Bandeiras Tarifarias', url: 'https://www.youtube.com/watch?v=w1rS7_tGSvM&t' },
    { title: 'Universipraia', url: 'https://vimeo.com/174934501' },
    { title: 'Mobiliario', url: 'https://vimeo.com/211000871' },
    { title: 'Lavanderia', url: 'https://vimeo.com/204715616' },
    { title: 'Ihformei', url: 'https://vimeo.com/69728399' },
    { title: 'Web Projects', url: 'https://vimeo.com/880236451' },
    { title: 'Costa do Dende', url: 'https://vimeo.com/803966970' }
  ],

  images: {
    hero: '/images/motion-hero.jpg',
    gallery: [
      '/images/motion-1.jpg',
      '/images/motion-2.jpg',
    ],
    heroVideo: 'https://player.vimeo.com/video/816333951?autoplay=1&loop=1&muted=1&background=1',
    logo: '/images/motion-logo.svg',
  },

  links: {
    live: 'https://vimeo.com/816333951',
  },
};
