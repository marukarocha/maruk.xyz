import type { ProjectData } from './types';

export const motodiario: ProjectData = {
  id: 'motodiario',
  title: 'Moto Diário',
  shortDescription: 'Plataforma digital para entusiastas do motociclismo, conectando rotas, manutenção e comunidade.',
  role: 'Lead Developer & UI/UX Designer',
  tags: ['Web App', 'Community', 'Geo-Location'],
  
  problem: 'Motociclistas carecem de uma plataforma centralizada para registrar manutenções, descobrir novas rotas seguras e conectar-se com outros pilotos locais.',
  
  solution: 'Desenvolvimento de uma PWA (Progressive Web App) que permite registro offline de rotas, gestão de garagem virtual para controle de manutenção e um feed social geolocalizado.',
  
  challenges: [
    'Otimização de mapas para uso com baixa conexão em áreas rurais.',
    'Sincronização de dados offline-first para o diário de bordo.',
    'Compressão de imagens de alta qualidade enviadas pelos usuários sem perda significativa de detalhes.'
  ],
  
  features: [
    'Garagem Virtual: Histórico completo de serviços e alertas de manutenção.',
    'Descobridor de Rotas: Algoritmo que sugere caminhos baseados em curvas e paisagens, não apenas rapidez.',
    'Modo Pilotagem: Interface simplificada e de alto contraste para uso rápido (quando parado).'
  ],
  
  techStack: [
    'React', 
    'TypeScript', 
    'Vite', 
    'Mapbox GL', 
    'Supabase', 
    'Framer Motion', 
    'Tailwind CSS'
  ],
  
  images: {
    hero: '/images/motodiario-hero.jpg', // Placeholder
    gallery: [
      '/images/motodiario-ui-1.jpg',
      '/images/motodiario-ui-2.jpg',
      '/images/motodiario-map.jpg'
    ]
  },
  
  links: {
    live: 'https://motodiario.xyz',
    github: 'https://github.com/maruk/motodiario'
  }
};
