import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BatteryCharging,
  Bike,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Gauge,
  House,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Store,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type NavItem = {
  label: string;
  href: string;
};

type FrontCard = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image: string;
  icon: LucideIcon;
};

type PlanCard = {
  title: string;
  price: string;
  note: string;
};

type ServiceCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

type FieldServiceCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

type CatalogProduct = {
  title: string;
  image: string;
  badge: string;
  category: 'bike' | 'accessory';
  summary: string;
  price: string;
  status: string;
  heroLabel: string;
  attributes: Array<{ label: string; value: string }>;
  specs: string[];
  tags: string[];
  fitProfile?: CatalogFitProfile;
};

type CatalogUseFocus = 'cidade' | 'conforto' | 'autonomia' | 'carga' | 'compacta' | 'lazer';

type CatalogFitProfile = {
  riderHeightRangeCm: [number, number];
  maxRiderWeightKg: number;
  recommendedDailyDistanceKm: [number, number];
  chargeHours: number;
  useFocus: CatalogUseFocus[];
};

type CatalogNeedsFilter = {
  riderHeightCm: number;
  riderWeightKg: number;
  dailyDistanceKm: number;
  maxChargeHours: number;
  focus: CatalogUseFocus;
};

type AccessorySheet = {
  title: string;
  image: string;
  body: string;
  items: string[];
};

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${encodeURI(path.replace(/^\/+/, ''))}`;
const catalogAsset = (fileName: string) => assetPath(`lab/bikeshop/catalogo/${fileName}`);

const shopFacade = assetPath('lab/bikeshop/loja.webp');
const workshopScene = assetPath('lab/bikeshop/officina.png');
const rentalScene = assetPath('lab/bikeshop/Aluguel.png');
const salesScene = assetPath('lab/bikeshop/vendas.png');
const salesSceneAlt = assetPath('lab/bikeshop/vendas2.png');
const shopLogo = assetPath('lab/bikeshop/logo.png');

const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Aluguel', href: '#aluguel' },
  { label: 'Oficina', href: '#oficina' },
  { label: 'Venda', href: '#venda' },
  { label: 'Contato', href: '#contato' },
];

const catalogNavItems: NavItem[] = [
  { label: 'Inicio', href: '#catalogo-home' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Acessorios', href: '#acessorios' },
  { label: 'Curadoria', href: '#curadoria' },
  { label: 'Contato', href: '#contato-catalogo' },
] as const;

const languageOptions = ['EN', 'ESP', 'BR'] as const;
const catalogUseFocusOptions: Array<{ value: CatalogUseFocus; label: string }> = [
  { value: 'cidade', label: 'Cidade' },
  { value: 'conforto', label: 'Conforto' },
  { value: 'autonomia', label: 'Autonomia' },
  { value: 'carga', label: 'Carga' },
  { value: 'compacta', label: 'Compacta' },
  { value: 'lazer', label: 'Lazer' },
] as const;

const frontCards: FrontCard[] = [
  {
    eyebrow: 'Oficina',
    title: 'Manutencao especializada',
    body: 'Diagnostico, bateria, freios e eletrica para e-bikes.',
    href: '#oficina',
    cta: 'Ver oficina',
    image: workshopScene,
    icon: Wrench,
  },
  {
    eyebrow: 'Aluguel',
    title: 'Aluguel',
    body: 'Reserve rapido e pedale pela Lagoa sem burocracia.',
    href: '#aluguel',
    cta: 'Ver aluguel',
    image: rentalScene,
    icon: Bike,
  },
  {
    eyebrow: 'Venda',
    title: 'Venda',
    body: 'Bikes novas, consignadas, revisadas e acessorios.',
    href: '#venda',
    cta: 'Ver bikes',
    image: salesScene,
    icon: Store,
  },
] as const;

const rentalPlans: PlanCard[] = [
  { title: '1 hora', price: 'R$ 45', note: 'Passe rapido pela Lagoa.' },
  { title: '3 horas', price: 'R$ 95', note: 'Ideal para turista e casal.' },
  { title: 'Meia diaria', price: 'R$ 140', note: 'Mais tempo para curtir sem pressa.' },
  { title: 'Diaria', price: 'R$ 190', note: 'Para usar o dia inteiro.' },
] as const;

const rentalHighlights = [
  'Capacete e trava inclusos.',
  'Reserva por WhatsApp.',
  'Retirada rapida.',
  'Area de uso na Lagoa e arredores.',
] as const;

const rentalSteps = [
  'Chame no WhatsApp',
  'Escolha o plano',
  'Confirme e retire',
] as const;

const workshopServices: ServiceCard[] = [
  {
    title: 'Revisao',
    body: 'Check-up completo para uso diario.',
    icon: Gauge,
  },
  {
    title: 'Diagnostico',
    body: 'Leitura de falhas e avaliacao tecnica.',
    icon: ShieldCheck,
  },
  {
    title: 'Bateria',
    body: 'Analise de autonomia, carga e funcionamento.',
    icon: BatteryCharging,
  },
  {
    title: 'Freios e eletrica',
    body: 'Ajustes e reparos para seguranca e desempenho.',
    icon: Wrench,
  },
] as const;

const scheduleDays = [
  { label: 'Seg', date: '14 Abr', focus: 'Revisao geral' },
  { label: 'Ter', date: '15 Abr', focus: 'Freios e eletrica' },
  { label: 'Qua', date: '16 Abr', focus: 'Coleta em domicilio' },
  { label: 'Qui', date: '17 Abr', focus: 'Manutencao express' },
  { label: 'Sex', date: '18 Abr', focus: 'Entrega programada' },
] as const;

const scheduleSlots = [
  '08:30',
  '10:00',
  '11:30',
  '14:00',
  '15:30',
  '17:00',
] as const;

const fieldServiceCards: FieldServiceCard[] = [
  {
    title: 'Busca e entrega da bike',
    body: 'Retiramos na casa do cliente, levamos para a oficina e devolvemos pronta com janela de atendimento combinada.',
    icon: Truck,
  },
  {
    title: 'Atendimento a domicilio',
    body: 'Manutencoes pontuais no local para ajustes rapidos, troca de camara, conectores, freios e revisoes leves.',
    icon: House,
  },
  {
    title: 'Socorro no caminho',
    body: 'Suporte para pneu furado na rua e pequenas emergencias para colocar a bike de volta em movimento.',
    icon: Wrench,
  },
] as const;

const workshopGallery = [
  {
    image: workshopScene,
    eyebrow: 'bancada tecnica',
    title: 'Diagnostico e manutencao com leitura visual limpa.',
    body: 'Um bloco hero para mostrar oficina, cuidado tecnico e atendimento especializado sem cair num card cheio de texto.',
  },
  {
    image: shopFacade,
    eyebrow: 'coleta e entrega',
    title: 'A bike pode sair da casa do cliente e voltar pronta.',
    body: 'A narrativa visual ajuda a vender a logistica da oficina junto com o agendamento, sem depender so de lista de beneficios.',
  },
  {
    image: salesSceneAlt,
    eyebrow: 'operacao premium',
    title: 'Atendimento local com cara de servico organizado.',
    body: 'Uma vitrine moderna para reforcar confianca, fluxo e presenca da marca na Lagoa.',
  },
] as const;

const catalogProducts: CatalogProduct[] = [
  {
    title: 'Urban Glide',
    image: catalogAsset('Bikes-catalogo1.png'),
    badge: 'mobilidade diaria',
    category: 'bike',
    summary: 'Modelo com leitura urbana para deslocamentos leves e uso continuo no dia a dia.',
    price: 'a partir de R$ 8.490',
    status: 'sob consulta',
    heroLabel: 'INOW X50 ACTION',
    attributes: [
      { label: 'Autonomia', value: '40 a 60 km' },
      { label: 'Motor', value: '250W urbano' },
      { label: 'Perfil', value: 'cidade' },
    ],
    specs: [
      'Potencia: 1000W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 60 km',
      'Bateria: Litio 48V 15.6Ah',
      'Freios: Duplo hidraulico',
      'Cambio: Shimano 7 marchas',
      'Farol: LED',
    ],
    tags: ['urbana', 'conforto', 'test ride'],
    fitProfile: {
      riderHeightRangeCm: [160, 192],
      maxRiderWeightKg: 105,
      recommendedDailyDistanceKm: [8, 45],
      chargeHours: 5,
      useFocus: ['cidade', 'conforto'],
    },
  },
  {
    title: 'Lagoa Cruiser',
    image: catalogAsset('Bikes-catalogo2.png'),
    badge: 'lagoa e arredores',
    category: 'bike',
    summary: 'Pensada para turismo, pedal mais relaxado e uso de lazer com visual limpo.',
    price: 'a partir de R$ 9.290',
    status: 'pronta para teste',
    heroLabel: 'INOW X50 ACTION PRO',
    attributes: [
      { label: 'Autonomia', value: 'ate 60 km' },
      { label: 'Bateria', value: '48V 19.2Ah' },
      { label: 'Perfil', value: 'passeio' },
    ],
    specs: [
      'Potencia: 1000W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 60 km',
      'Bateria: Litio 48V 19.2Ah',
      'Freios: Duplo hidraulico',
      'Banco: Duplo',
      'Status visual: disponivel em breve',
    ],
    tags: ['turismo', 'lazer', 'ergonomia'],
    fitProfile: {
      riderHeightRangeCm: [162, 194],
      maxRiderWeightKg: 110,
      recommendedDailyDistanceKm: [10, 50],
      chargeHours: 6,
      useFocus: ['lazer', 'conforto'],
    },
  },
  {
    title: 'Step Flow',
    image: catalogAsset('Bikes-catalogo3.png'),
    badge: 'entrada baixa',
    category: 'bike',
    summary: 'Modelo pratico para quem busca subir e descer da bike com mais facilidade.',
    price: 'a partir de R$ 8.990',
    status: 'sob consulta',
    heroLabel: 'V20 MINI',
    attributes: [
      { label: 'Autonomia', value: 'ate 45 km' },
      { label: 'Bateria', value: '48V 13Ah' },
      { label: 'Perfil', value: 'compacta' },
    ],
    specs: [
      'Potencia: 750W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 45 km',
      'Bateria: Litio 48V 13Ah',
      'Freios: Duplo hidraulico',
      'Audio: Som bluetooth',
      'Chave: Cartao NFC',
    ],
    tags: ['facilidade', 'uso diario', 'urbana'],
    fitProfile: {
      riderHeightRangeCm: [150, 182],
      maxRiderWeightKg: 95,
      recommendedDailyDistanceKm: [5, 35],
      chargeHours: 4,
      useFocus: ['compacta', 'cidade', 'conforto'],
    },
  },
  {
    title: 'Cargo Flex',
    image: catalogAsset('Bikes-catalogo4.png'),
    badge: 'uso utilitario',
    category: 'bike',
    summary: 'Linha para carga leve, rotina de trabalho e deslocamentos com mais versatilidade.',
    price: 'sob consulta',
    status: 'curadoria especial',
    heroLabel: 'INOW V20 BRAKE PRO',
    attributes: [
      { label: 'Autonomia', value: 'ate 60 km' },
      { label: 'Banco', value: 'duplo' },
      { label: 'Perfil', value: 'utilitaria' },
    ],
    specs: [
      'Potencia: 750W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 60 km',
      'Bateria: Litio 48V 15.6Ah',
      'Freios: Duplo hidraulico',
      'Banco: Duplo',
      'Chave: Cartao NFC',
    ],
    tags: ['cargo', 'profissional', 'estoque rotativo'],
    fitProfile: {
      riderHeightRangeCm: [165, 196],
      maxRiderWeightKg: 130,
      recommendedDailyDistanceKm: [10, 55],
      chargeHours: 6,
      useFocus: ['carga', 'cidade'],
    },
  },
  {
    title: 'City One',
    image: catalogAsset('Bikes-catalogo5.png'),
    badge: 'linha urbana',
    category: 'bike',
    summary: 'Configuração pensada para rodar na cidade com leitura mais simples e funcional.',
    price: 'a partir de R$ 7.990',
    status: 'disponivel para consulta',
    heroLabel: 'INOW V35',
    attributes: [
      { label: 'Autonomia', value: 'ate 120 km' },
      { label: 'Bateria', value: '48V 15.6Ah' },
      { label: 'Perfil', value: 'urbana premium' },
    ],
    specs: [
      'Potencia: 1000W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 120 km',
      'Bateria: Litio 48V 15.6Ah',
      'Freios: Duplo hidraulico',
      'Extra: Cesto central',
      'Destaque visual: duas baterias',
    ],
    tags: ['entrada', 'cidade', 'mobilidade'],
    fitProfile: {
      riderHeightRangeCm: [165, 196],
      maxRiderWeightKg: 120,
      recommendedDailyDistanceKm: [15, 80],
      chargeHours: 6,
      useFocus: ['autonomia', 'cidade'],
    },
  },
  {
    title: 'Comfort Wave',
    image: catalogAsset('Bikes-catalogo6.png'),
    badge: 'mais conforto',
    category: 'bike',
    summary: 'Ideal para trajetos sem pressa, com foco em conforto e postura mais amigavel.',
    price: 'a partir de R$ 9.490',
    status: 'pronta para teste',
    heroLabel: 'X100 SERIES',
    attributes: [
      { label: 'Autonomia', value: 'ate 60 km' },
      { label: 'Bateria', value: '48V 20Ah' },
      { label: 'Perfil', value: 'serie leve' },
    ],
    specs: [
      'Potencia: 1000W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 60 km',
      'Bateria: Litio 48V 20Ah',
      'Freios: Duplo hidraulico',
      'Localizador: GPS',
      'Extra: Suporte de carga',
    ],
    tags: ['conforto', 'passeio', 'uso suave'],
    fitProfile: {
      riderHeightRangeCm: [158, 190],
      maxRiderWeightKg: 110,
      recommendedDailyDistanceKm: [8, 45],
      chargeHours: 5,
      useFocus: ['conforto', 'lazer'],
    },
  },
  {
    title: 'Compact Tour',
    image: catalogAsset('Bikes-catalogo7.png'),
    badge: 'compacta',
    category: 'bike',
    summary: 'Linha compacta para quem quer praticidade visual e mobilidade agil no entorno da Lagoa.',
    price: 'a partir de R$ 8.690',
    status: 'sob consulta',
    heroLabel: 'X100 PRO',
    attributes: [
      { label: 'Autonomia', value: 'ate 120 km' },
      { label: 'Bateria', value: 'dupla 48V 20Ah' },
      { label: 'Perfil', value: 'performance' },
    ],
    specs: [
      'Potencia: 1000W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 120 km',
      'Bateria: Dupla litio 48V 20Ah',
      'Freios: Duplo hidraulico',
      'Localizador: GPS',
      'Extra: Suporte de carga',
    ],
    tags: ['compacta', 'leve', 'mobilidade'],
    fitProfile: {
      riderHeightRangeCm: [155, 184],
      maxRiderWeightKg: 102,
      recommendedDailyDistanceKm: [10, 70],
      chargeHours: 6,
      useFocus: ['compacta', 'autonomia', 'cidade'],
    },
  },
  {
    title: 'Daily Motion',
    image: catalogAsset('Bikes-catalogo8.png'),
    badge: 'uso diario',
    category: 'bike',
    summary: 'Proposta equilibrada para quem vai usar a bike varias vezes por semana em diferentes trajetos.',
    price: 'a partir de R$ 8.990',
    status: 'disponivel para teste',
    heroLabel: 'X100 ELITE',
    attributes: [
      { label: 'Autonomia', value: 'ate 120 km' },
      { label: 'Motor', value: 'duplo 1000W / 750W' },
      { label: 'Perfil', value: 'elite' },
    ],
    specs: [
      'Motor: Duplo 1000W / 750W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 120 km',
      'Bateria: Dupla litio 52V 20Ah',
      'Freios: Duplo hidraulico',
      'Localizador: GPS',
      'Extra: Suporte de carga',
    ],
    tags: ['diaria', 'equilibrio', 'versatil'],
    fitProfile: {
      riderHeightRangeCm: [165, 196],
      maxRiderWeightKg: 122,
      recommendedDailyDistanceKm: [15, 85],
      chargeHours: 6,
      useFocus: ['autonomia', 'cidade', 'carga'],
    },
  },
  {
    title: 'Weekend Loop',
    image: catalogAsset('Bikes-catalogo9.png'),
    badge: 'fim de tarde',
    category: 'bike',
    summary: 'Modelo para pedais visuais, trajeto de lazer e experiencia mais casual na orla.',
    price: 'a partir de R$ 9.190',
    status: 'sob consulta',
    heroLabel: 'V20 BRAKE',
    attributes: [
      { label: 'Autonomia', value: 'ate 60 km' },
      { label: 'Bateria', value: '48V 15.5Ah' },
      { label: 'Perfil', value: 'urbana robusta' },
    ],
    specs: [
      'Potencia: 750W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 60 km',
      'Bateria: Litio 48V 15.5Ah',
      'Freios: Duplo hidraulico',
      'Farol: LED',
      'Seguranca: Alarme',
    ],
    tags: ['weekend', 'lazer', 'visual'],
    fitProfile: {
      riderHeightRangeCm: [160, 192],
      maxRiderWeightKg: 108,
      recommendedDailyDistanceKm: [8, 40],
      chargeHours: 5,
      useFocus: ['lazer', 'cidade'],
    },
  },
  {
    title: 'Premium Select',
    image: catalogAsset('Bikes-catalogo10.png'),
    badge: 'curadoria premium',
    category: 'bike',
    summary: 'Variação com apelo mais premium para quem quer acabamento e presença visual mais fortes.',
    price: 'sob consulta',
    status: 'curadoria especial',
    heroLabel: 'C20 PLUS',
    attributes: [
      { label: 'Autonomia', value: 'ate 55 km' },
      { label: 'Bateria', value: '48V 13Ah' },
      { label: 'Perfil', value: 'apoio urbano' },
    ],
    specs: [
      'Potencia: 750W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 55 km',
      'Bateria: Litio 48V 13Ah',
      'Freios: Duplo hidraulico',
      'Farol: LED',
      'Extra: Apoio para os pes',
    ],
    tags: ['premium', 'curadoria', 'showroom'],
    fitProfile: {
      riderHeightRangeCm: [160, 188],
      maxRiderWeightKg: 105,
      recommendedDailyDistanceKm: [8, 38],
      chargeHours: 4,
      useFocus: ['conforto', 'cidade'],
    },
  },
  {
    title: 'Touring Plus',
    image: catalogAsset('Bikes-catalogo11.png'),
    badge: 'roteiro ampliado',
    category: 'bike',
    summary: 'Configuração para quem quer mais autonomia de uso e leitura de produto mais completa.',
    price: 'a partir de R$ 9.790',
    status: 'sob consulta',
    heroLabel: 'INOW V50',
    attributes: [
      { label: 'Autonomia', value: 'ate 60 km' },
      { label: 'Bateria', value: '48V 13Ah' },
      { label: 'Perfil', value: 'city cruiser' },
    ],
    specs: [
      'Potencia: 750W',
      'Velocidade: 32 km/h',
      'Autonomia: ate 60 km',
      'Bateria: Litio 48V 13Ah',
      'Freios: Duplo hidraulico',
      'Aplicativo: Android e iOS',
      'Extra: Cesto central',
    ],
    tags: ['autonomia', 'touring', 'completo'],
    fitProfile: {
      riderHeightRangeCm: [165, 194],
      maxRiderWeightKg: 112,
      recommendedDailyDistanceKm: [12, 55],
      chargeHours: 5,
      useFocus: ['autonomia', 'lazer', 'cidade'],
    },
  },
  {
    title: 'Essentials Kit',
    image: catalogAsset('Acessorios01.png'),
    badge: 'kit completo',
    category: 'accessory',
    summary: 'Kit base com itens essenciais para sair pedalando com mais seguranca e praticidade.',
    price: 'a partir de R$ 390',
    status: 'pronta entrega',
    heroLabel: 'CAPACETES INOW',
    attributes: [
      { label: 'Modelos', value: '4 opcoes' },
      { label: 'Foco', value: 'seguranca' },
      { label: 'Perfil', value: 'setup inicial' },
    ],
    specs: [
      'Capacete Inow Coquinho',
      'Capacete Inow Dynamic Air',
      'Capacete Inow Light Protect',
      'Capacete Inow Basic',
    ],
    tags: ['acessorios', 'seguranca', 'upgrade'],
  },
  {
    title: 'Urban Lock Pro',
    image: catalogAsset('Acessorios02.png'),
    badge: 'seguranca',
    category: 'accessory',
    summary: 'Travas e combinacoes reforcadas para quem precisa parar e seguir com mais tranquilidade.',
    price: 'a partir de R$ 179',
    status: 'pronta entrega',
    heroLabel: 'BOLSAS E SUPORTES',
    attributes: [
      { label: 'Itens', value: '8 opcoes' },
      { label: 'Uso', value: 'setup urbano' },
      { label: 'Perfil', value: 'utilitario' },
    ],
    specs: [
      'Vintage Bag',
      'Pocket Bag',
      'Compressor de ar',
      'Cesta flexivel em tecido',
      'Cesta metalica',
      'Suporte dianteiro',
      'Banco extensor',
    ],
    tags: ['trava', 'seguranca', 'uso diario'],
  },
  {
    title: 'Travel Rack Set',
    image: catalogAsset('Acessorios03.png'),
    badge: 'carga e apoio',
    category: 'accessory',
    summary: 'Bagageiros, suportes e complementos para montar um setup mais utilitario e funcional.',
    price: 'a partir de R$ 249',
    status: 'sob consulta',
    heroLabel: 'TRAVAS E SUPORTES',
    attributes: [
      { label: 'Itens', value: '8 opcoes' },
      { label: 'Uso', value: 'seguranca e suporte' },
      { label: 'Perfil', value: 'upgrade funcional' },
    ],
    specs: [
      'Cadeado biometrico',
      'Cadeado U-Lock',
      'Retrovisor angular',
      'Retrovisor articulado',
      'Capa de protecao',
      'Suporte para smartphone',
    ],
    tags: ['bagageiro', 'setup', 'funcional'],
  },
] as const;

const catalogHighlights = [
  'Atendimento consultivo para encontrar o modelo certo.',
  'Catalogo vivo, com disponibilidade sob consulta.',
  'Teste orientado antes da decisao de compra.',
] as const;

const catalogSteps = [
  'Navegue pelos slides da linha desejada',
  'Compare autonomia, motor e extras pela propria arte',
  'Chame no WhatsApp para consulta ou disponibilidade',
] as const;

const catalogStats = [
  { value: '11', label: 'Modelos de bike' },
  { value: '3', label: 'Kits e acessorios' },
  { value: '1:1', label: 'Curadoria humana' },
] as const;

const accessorySheets: AccessorySheet[] = [
  {
    title: 'Capacetes',
    image: catalogAsset('Acessorios01.png'),
    body: 'Linha de capacetes da marca para montar o setup de seguranca logo na primeira compra.',
    items: ['Inow Coquinho', 'Dynamic Air', 'Light Protect', 'Basic'],
  },
  {
    title: 'Bolsas, cestos e suportes',
    image: catalogAsset('Acessorios02.png'),
    body: 'Itens de apoio para carga, uso urbano, transporte leve e pequenos upgrades funcionais.',
    items: ['Vintage Bag', 'Pocket Bag', 'Compressor de ar', 'Cesta metalica', 'Suporte dianteiro', 'Banco extensor'],
  },
  {
    title: 'Travas e smartphone',
    image: catalogAsset('Acessorios03.png'),
    body: 'Travas, espelhos, capa de protecao e suportes para montar um uso diario mais completo.',
    items: ['Cadeado biometrico', 'Cadeado U-Lock', 'Retrovisor angular', 'Retrovisor articulado', 'Suporte para smartphone'],
  },
] as const;

const saleColumns = [
  {
    title: 'Bikes disponiveis',
    items: ['Novas em consignacao', 'Usadas revisadas', 'Modelos urbanos e de passeio'],
  },
  {
    title: 'Marcas parceiras',
    items: ['Curadoria de modelos', 'Suporte local', 'Atendimento direto'],
  },
  {
    title: 'Acessorios',
    items: ['Capacetes', 'Travas', 'Bagageiros e luzes'],
  },
] as const;

const contactCards = [
  {
    title: 'Onde fica',
    body: 'Lagoa da Conceicao, perto do terminal.',
    icon: MapPinned,
  },
  {
    title: 'Horario',
    body: 'Atendimento com agendamento simples.',
    icon: Clock3,
  },
  {
    title: 'WhatsApp',
    body: 'Reserva, oficina e atendimento direto.',
    icon: MessageCircle,
  },
] as const;

const ExperienceStudio = () => {
  const location = useLocation();
  const isCatalogPage = location.pathname.endsWith('/catalogo');
  const [activeFrontIndex, setActiveFrontIndex] = useState(1);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState(3);
  const [activeWorkshopSlide, setActiveWorkshopSlide] = useState(0);
  const [activeBikeSlide, setActiveBikeSlide] = useState(0);
  const [activeAccessorySlide, setActiveAccessorySlide] = useState(0);
  const [catalogNeeds, setCatalogNeeds] = useState<CatalogNeedsFilter>({
    riderHeightCm: 172,
    riderWeightKg: 82,
    dailyDistanceKm: 24,
    maxChargeHours: 6,
    focus: 'cidade',
  });
  const headerNavItems = isCatalogPage ? catalogNavItems : navItems;
  const bikeCatalogProducts = catalogProducts.filter((product) => product.category === 'bike');
  const scoredBikeMatches = useMemo(() => {
    return bikeCatalogProducts
      .map((product) => {
        const fitProfile = product.fitProfile;
        if (!fitProfile) {
          return { product, score: 0, isCompatible: false };
        }

        const [minHeight, maxHeight] = fitProfile.riderHeightRangeCm;
        const [, maxDistance] = fitProfile.recommendedDailyDistanceKm;
        const heightInsideRange = catalogNeeds.riderHeightCm >= minHeight && catalogNeeds.riderHeightCm <= maxHeight;
        const weightInsideRange = catalogNeeds.riderWeightKg <= fitProfile.maxRiderWeightKg;
        const distanceInsideRange = catalogNeeds.dailyDistanceKm <= maxDistance;
        const chargeInsideRange = catalogNeeds.maxChargeHours >= fitProfile.chargeHours;
        const focusMatches = fitProfile.useFocus.includes(catalogNeeds.focus);

        let score = 0;
        score += heightInsideRange ? 3 : Math.abs(catalogNeeds.riderHeightCm - (catalogNeeds.riderHeightCm < minHeight ? minHeight : maxHeight)) <= 5 ? 1 : -2;
        score += weightInsideRange ? 2 : -3;
        score += distanceInsideRange ? 3 : catalogNeeds.dailyDistanceKm <= maxDistance + 10 ? 1 : -2;
        score += chargeInsideRange ? 2 : -1;
        score += focusMatches ? 3 : 0;

        return {
          product,
          score,
          isCompatible: heightInsideRange && weightInsideRange && distanceInsideRange && chargeInsideRange,
        };
      })
      .sort((left, right) => right.score - left.score);
  }, [bikeCatalogProducts, catalogNeeds]);
  const compatibleBikeProducts = scoredBikeMatches.filter((item) => item.isCompatible).map((item) => item.product);
  const filteredBikeProducts =
    compatibleBikeProducts.length > 0
      ? compatibleBikeProducts
      : scoredBikeMatches.slice(0, Math.min(4, bikeCatalogProducts.length)).map((item) => item.product);
  const featuredCatalogProduct = catalogProducts.find((product) => product.category === 'bike') ?? catalogProducts[0];
  const currentBikeSlide = filteredBikeProducts[activeBikeSlide] ?? filteredBikeProducts[0] ?? bikeCatalogProducts[0];
  const currentAccessorySheet = accessorySheets[activeAccessorySlide] ?? accessorySheets[0];
  const topRecommendedBike = scoredBikeMatches[0]?.product ?? bikeCatalogProducts[0];
  const hasExactBikeMatches = compatibleBikeProducts.length > 0;

  useEffect(() => {
    if (!isScheduleOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsScheduleOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isScheduleOpen]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveWorkshopSlide((current) => (current + 1) % workshopGallery.length);
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isCatalogPage) return undefined;

    const bikeIntervalId = window.setInterval(() => {
      setActiveBikeSlide((current) => (current + 1) % filteredBikeProducts.length);
    }, 5200);

    const accessoryIntervalId = window.setInterval(() => {
      setActiveAccessorySlide((current) => (current + 1) % accessorySheets.length);
    }, 5600);

    return () => {
      window.clearInterval(bikeIntervalId);
      window.clearInterval(accessoryIntervalId);
    };
  }, [filteredBikeProducts.length, isCatalogPage]);

  useEffect(() => {
    setActiveBikeSlide(0);
  }, [
    catalogNeeds.dailyDistanceKm,
    catalogNeeds.focus,
    catalogNeeds.maxChargeHours,
    catalogNeeds.riderHeightCm,
    catalogNeeds.riderWeightKg,
  ]);

  return (
    <div className="h-full overflow-y-auto bg-[#f6f2e8] text-[#17323a]">
      <style>{`
        @keyframes experience-front-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .experience-front-card {
          isolation: isolate;
        }

        .experience-front-card-border {
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.45s ease, filter 0.45s ease;
          z-index: 0;
          pointer-events: none;
        }

        .experience-front-card-border::before {
          content: "";
          position: absolute;
          inset: -32%;
          border-radius: inherit;
          padding: 2px;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 28deg,
            rgba(182, 255, 127, 0.08) 56deg,
            rgba(182, 255, 127, 0.98) 86deg,
            rgba(98, 255, 214, 0.88) 112deg,
            rgba(182, 255, 127, 0.2) 140deg,
            transparent 188deg,
            transparent 360deg
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: experience-front-spin 5.8s linear infinite;
        }

        .experience-front-card:hover .experience-front-card-border,
        .experience-front-card[data-active="true"] .experience-front-card-border {
          opacity: 1;
          filter:
            drop-shadow(0 0 16px rgba(182, 255, 127, 0.28))
            drop-shadow(0 0 28px rgba(98, 255, 214, 0.16));
        }

        .experience-hover-card,
        .experience-hover-card-dark {
          position: relative;
          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            box-shadow 0.35s ease,
            background-color 0.35s ease;
        }

        .experience-hover-card:hover,
        .experience-hover-card:focus-within {
          transform: translateY(-4px);
          border-color: rgba(76, 139, 93, 0.34);
          box-shadow:
            0 20px 46px rgba(23, 50, 58, 0.08),
            0 0 0 1px rgba(182, 255, 127, 0.18),
            0 0 24px rgba(149, 255, 116, 0.12);
        }

        .experience-hover-card-dark:hover,
        .experience-hover-card-dark:focus-within {
          transform: translateY(-4px);
          border-color: rgba(182, 255, 127, 0.26);
          box-shadow:
            0 24px 50px rgba(10, 24, 16, 0.22),
            0 0 0 1px rgba(182, 255, 127, 0.14),
            0 0 28px rgba(149, 255, 116, 0.12);
        }
      `}</style>

      {isScheduleOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#17323a]/55 p-4 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => setIsScheduleOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/35 bg-[#f6f2e8] shadow-[0_40px_120px_rgba(23,50,58,0.32)]">
            <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
              <div className="relative overflow-hidden bg-[#17323a] p-7 text-[#f6f2e8] md:p-9">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,255,127,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(98,255,214,0.16),transparent_24%)]" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.34em] text-[#bfdfc6]">agenda smart</p>
                      <h3 className="mt-3 max-w-sm text-3xl font-semibold tracking-[-0.04em]">
                        Simule um agendamento moderno em poucos cliques.
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsScheduleOpen(false)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-[#f6f2e8] transition-colors hover:bg-white/14"
                      aria-label="Fechar agenda"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-8 rounded-[26px] border border-white/10 bg-white/6 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-[#bfdfc6]">janela selecionada</p>
                        <p className="mt-2 text-2xl font-semibold">
                          {scheduleDays[selectedDay].label}, {scheduleDays[selectedDay].date}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#b6ff7f]/12 p-3 text-[#b6ff7f]">
                        <CalendarDays size={20} />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-[20px] border border-white/10 bg-[#10262a] px-4 py-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8eb89a]">servico sugerido</p>
                        <p className="mt-1 text-sm font-semibold text-[#f6f2e8]">
                          {scheduleDays[selectedDay].focus}
                        </p>
                      </div>
                      <div className="rounded-full border border-[#b6ff7f]/22 bg-[#b6ff7f]/10 px-3 py-1 text-xs font-semibold text-[#d8ffd1]">
                        {scheduleSlots[selectedSlot]}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      'Check-in tecnico antes da visita.',
                      'Confirmacao por WhatsApp em seguida.',
                      'Opcao de coleta, entrega ou atendimento no local.',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/6 px-4 py-3 text-sm text-[#d9e7e4]">
                        <CheckCircle2 size={16} className="text-[#9fd0ab]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#f8fbf8] p-7 md:p-9">
                <div className="grid gap-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#6f8b73]">escolha o dia</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-5">
                      {scheduleDays.map((day, index) => {
                        const isActive = selectedDay === index;

                        return (
                          <button
                            key={`${day.label}-${day.date}`}
                            type="button"
                            onClick={() => setSelectedDay(index)}
                            className={`rounded-[22px] border px-4 py-4 text-left transition-all ${isActive ? 'border-[#4c8b5d] bg-[#17323a] text-[#f6f2e8] shadow-[0_16px_30px_rgba(23,50,58,0.18)]' : 'border-[#17323a]/10 bg-white text-[#17323a] hover:border-[#4c8b5d]/35 hover:bg-[#eef6ef]'}`}
                          >
                            <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">{day.label}</p>
                            <p className="mt-2 text-lg font-semibold">{day.date}</p>
                            <p className={`mt-2 text-xs leading-5 ${isActive ? 'text-[#d8ffd1]' : 'text-[#52686d]'}`}>
                              {day.focus}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#6f8b73]">horarios disponiveis</p>
                      <p className="text-sm text-[#52686d]">Simulacao visual da agenda da oficina</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {scheduleSlots.map((slot, index) => {
                        const isActive = selectedSlot === index;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(index)}
                            className={`rounded-[20px] border px-4 py-4 text-left transition-all ${isActive ? 'border-[#4c8b5d] bg-[#eef6ef] shadow-[0_14px_24px_rgba(76,139,93,0.12)]' : 'border-[#17323a]/10 bg-white hover:border-[#4c8b5d]/30'}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-lg font-semibold text-[#17323a]">{slot}</span>
                              <Clock3 size={16} className={isActive ? 'text-[#2f6a42]' : 'text-[#6f8b73]'} />
                            </div>
                            <p className="mt-2 text-sm leading-5 text-[#52686d]">
                              {index < 2 ? 'Janela ideal para coleta ou retirada.' : index < 4 ? 'Horario bom para revisao programada.' : 'Fechamento leve e suporte rapido.'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#17323a]/10 bg-white p-6 shadow-[0_16px_40px_rgba(23,50,58,0.06)]">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-[#6f8b73]">resumo</p>
                        <h4 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17323a]">
                          {scheduleDays[selectedDay].date} as {scheduleSlots[selectedSlot]}
                        </h4>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#52686d]">
                          Fluxo sugerido para revisao, coleta e atendimento expresso. Depois podemos ligar esse modal ao WhatsApp ou a um formulario real.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsScheduleOpen(false)}
                        className="inline-flex items-center justify-center rounded-full bg-[#4c8b5d] px-6 py-4 text-sm font-semibold text-[#eef8ef] transition-transform hover:-translate-y-0.5"
                      >
                        Confirmar simulacao
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-[#17323a]/10 bg-[#f6f2e8]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
          <Link to="/playground/experience-studio" className="flex items-center gap-3">
            <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center">
              <img
                src={shopLogo}
                alt="Lagoa E-Bikes"
                className="h-[4.2rem] w-[4.2rem] object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#17323a] md:text-[1.3rem]">
                Lagoa E-Bikes
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {headerNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-[#3b535a] transition-colors hover:bg-[#17323a] hover:text-[#f6f2e8]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 rounded-full border border-[#17323a]/10 bg-white/60 p-1 md:flex">
              <Link
                to="/playground/experience-studio"
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${!isCatalogPage ? 'bg-[#17323a] text-[#f6f2e8]' : 'text-[#52686d] hover:bg-[#eef6ef] hover:text-[#245235]'}`}
              >
                Landing
              </Link>
              <Link
                to="/playground/experience-studio/catalogo"
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${isCatalogPage ? 'bg-[#17323a] text-[#f6f2e8]' : 'text-[#52686d] hover:bg-[#eef6ef] hover:text-[#245235]'}`}
              >
                Catalogo
              </Link>
            </div>

            <div className="hidden items-center gap-1 rounded-full border border-[#17323a]/10 bg-white/60 p-1 lg:flex">
              {languageOptions.map((language, index) => (
                <button
                  key={language}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${index === 2 ? 'bg-[#17323a] text-[#f6f2e8]' : 'text-[#52686d] hover:bg-[#eef6ef] hover:text-[#245235]'}`}
                >
                  {language}
                </button>
              ))}
            </div>

            <a
              href={isCatalogPage ? '#contato-catalogo' : '#contato'}
              className="inline-flex items-center gap-2 rounded-full bg-[#4c8b5d] px-5 py-3 text-sm font-semibold text-[#eef8ef] shadow-[0_0_30px_rgba(149,255,116,0.14)] transition-transform hover:-translate-y-0.5"
            >
              {isCatalogPage ? 'Consultar catalogo' : 'Falar no WhatsApp'}
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </header>

      <main>
        {!isCatalogPage ? (
        <>
        <section id="home" className="relative isolate overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${shopFacade})` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(76,139,93,0.18),_transparent_32%),linear-gradient(135deg,_rgba(246,242,232,0.98),_rgba(246,242,232,0.9))]" />
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(115deg,transparent_0%,transparent_44%,rgba(53,104,67,0.95)_49.5%,transparent_55%,transparent_100%)]" />
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_18%_22%,rgba(182,255,127,0.34),transparent_0_18%),radial-gradient(circle_at_82%_18%,rgba(76,139,93,0.18),transparent_0_24%),radial-gradient(circle_at_68%_72%,rgba(182,255,127,0.22),transparent_0_16%)]" />
          <div className="absolute inset-x-[8%] top-[16%] h-px bg-gradient-to-r from-transparent via-[#b6ff7f]/40 to-transparent opacity-80" />
          <div className="absolute right-[10%] top-[12%] h-40 w-40 rounded-full border border-[#b6ff7f]/12" />
          <div className="absolute left-[6%] bottom-[14%] h-56 w-56 rounded-full border border-[#356843]/10" />
          <div className="absolute left-[14%] top-[22%] h-24 w-24 rounded-full bg-[#b6ff7f]/10 blur-3xl" />
          <div className="absolute right-[18%] bottom-[16%] h-28 w-28 rounded-full bg-[#4c8b5d]/10 blur-3xl" />
          <div
            className="absolute right-[7%] top-[10%] hidden h-56 w-56 opacity-[0.08] mix-blend-multiply lg:block"
            style={{ background: `center / contain no-repeat url(${shopLogo})` }}
          />

          <div className="relative mx-auto flex min-h-[calc(60vh-3.5rem)] max-w-7xl flex-col justify-center px-6 py-6 md:px-10 md:py-7">
            <div className="mb-4 flex items-center justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.36em] text-[#5f8668]">
                  energia verde na lagoa
                </p>
                <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[0.9] tracking-[-0.05em] text-[#17323a] md:text-6xl">
                  Onde a cidade desacelera e a corrente continua.
                </h1>
              </div>
              <div className="hidden rounded-full border border-[#95ff74]/35 bg-[#17323a] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8ffd1] shadow-[0_0_20px_rgba(149,255,116,0.18)] lg:block">
                aluguel • manutencao • venda
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:h-[calc(60vh-7rem)] lg:min-h-[23rem] lg:flex-row">
                {frontCards.map(({ eyebrow, title, body, href, cta, image, icon: Icon }, index) => {
                  const isActive = activeFrontIndex === index;

                  return (
                    <a
                      key={title}
                      href={href}
                      data-active={isActive ? 'true' : 'false'}
                      onMouseEnter={() => setActiveFrontIndex(index)}
                      onFocus={() => setActiveFrontIndex(index)}
                      className={`experience-front-card group relative min-h-[160px] overflow-hidden rounded-[28px] border transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#4c8b5d]/35 lg:min-h-0 ${isActive ? 'border-[#9eff74]/28 shadow-[0_0_0_1px_rgba(158,255,116,0.08),0_0_34px_rgba(158,255,116,0.12)] lg:flex-[1.9]' : 'border-[#17323a]/10 hover:shadow-[0_0_26px_rgba(158,255,116,0.12)] lg:flex-[0.72]'}`}
                    >
                      <div className="experience-front-card-border" aria-hidden="true" />
                      <img
                        src={image}
                        alt={title}
                        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${isActive ? 'scale-100' : 'scale-110'}`}
                        loading="lazy"
                      />
                      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="absolute inset-0 rounded-[28px] border border-[#b6ff7f]/45 shadow-[inset_0_0_0_1px_rgba(182,255,127,0.14),0_0_20px_rgba(182,255,127,0.16)] animate-pulse" />
                        <div className="absolute inset-[3px] rounded-[24px] border border-[#62ffd6]/16" />
                      </div>
                      <div className={`absolute inset-0 transition-all duration-500 ${isActive ? 'bg-[linear-gradient(180deg,rgba(18,38,26,0.08),rgba(10,24,16,0.78))]' : 'bg-[linear-gradient(180deg,rgba(18,38,26,0.06),rgba(10,24,16,0.94))]'}`} />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(159,208,171,0.28),transparent_34%)]" />

                      <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-7">
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d7ead9]">
                            0{index + 1}
                          </span>
                          <div className={`inline-flex rounded-2xl border p-3 backdrop-blur-sm transition-all duration-500 ${isActive ? 'border-[#b6ff7f]/40 bg-[#b6ff7f]/12 text-[#f4ffe8] shadow-[0_0_20px_rgba(158,255,116,0.14)]' : 'border-white/10 bg-white/12 text-[#eff8f0]'}`}>
                            <Icon size={18} strokeWidth={1.8} />
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-[#bfdfc6]">
                            {eyebrow}
                          </p>
                          <h2 className="mt-3 max-w-[13ch] text-3xl font-semibold leading-[0.95] tracking-[-0.04em] text-white md:text-[2.35rem]">
                            {title}
                          </h2>
                          <p
                            className={`mt-4 max-w-[30ch] overflow-hidden text-sm leading-6 text-[#e0ece2] transition-all duration-500 ${isActive ? 'max-h-28 opacity-100 lg:max-h-28 lg:opacity-100' : 'max-h-24 opacity-100 lg:max-h-0 lg:opacity-0'}`}
                          >
                            {body}
                          </p>
                        </div>

                        <div className={`flex items-center justify-between border-t border-white/12 pt-4 text-[#ecf7ee] transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-80 lg:translate-y-8'}`}>
                          <span className="text-sm font-semibold">{cta}</span>
                          <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </a>
                  );
                })}
            </div>
          </div>
        </section>

        <section id="aluguel" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#5f8668]">aluguel</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#17323a] md:text-6xl">
                Planos simples para pedalar pela Lagoa.
              </h2>
            </div>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#4c8b5d] px-5 py-3 text-sm font-semibold text-[#eef8ef]"
            >
              Reservar por WhatsApp
              <MessageCircle size={16} />
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rentalPlans.map((plan) => (
              <article key={plan.title} className="experience-hover-card rounded-[28px] border border-[#17323a]/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,50,58,0.06)]">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#6f7f84]">{plan.title}</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#17323a]">{plan.price}</p>
                <p className="mt-3 text-sm leading-6 text-[#4d666d]">{plan.note}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="experience-hover-card-dark rounded-[30px] border border-[#17323a]/10 bg-[#17323a] p-7 text-[#f6f2e8]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#bfdfc6]">como funciona</p>
                  <h3 className="mt-3 text-2xl font-semibold">Rapido do inicio ao pedal.</h3>
                </div>
                <Bike size={22} className="text-[#9fd0ab]" />
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {rentalSteps.map((step, index) => (
                  <div key={step} className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#bfdfc6]">passo {index + 1}</p>
                    <p className="mt-2 text-sm font-semibold text-[#f6f2e8]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div className="experience-hover-card rounded-[30px] border border-[#17323a]/10 bg-[#f8fbf8] p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-[#17323a]">O que esta incluso</h3>
                  <ShieldCheck size={20} className="text-[#4c8b5d]" />
                </div>
                <div className="mt-5 grid gap-3">
                  {rentalHighlights.map((item) => (
                    <div key={item} className="rounded-[18px] border border-[#17323a]/10 bg-white px-4 py-3 text-sm text-[#486068]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="experience-hover-card rounded-[30px] border border-[#17323a]/10 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#6f8b73]">area de uso</p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#17323a]">Lagoa e arredores</h3>
                  </div>
                  <MapPinned size={20} className="text-[#4c8b5d]" />
                </div>
                <p className="mt-4 text-sm leading-6 text-[#4d666d]">
                  Centrinho, Avenida das Rendeiras, Canto da Lagoa e retiradas sob consulta.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="oficina" className="border-y border-[#17323a]/10 bg-white/55">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#5f8668]">oficina</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#17323a] md:text-6xl">
                  Manutencao especializada para e-bikes.
                </h2>
              </div>
              <a
                href="#agenda"
                onClick={(event) => {
                  event.preventDefault();
                  setIsScheduleOpen(true);
                }}
                className="inline-flex items-center gap-2 self-start rounded-full border border-[#4c8b5d]/30 bg-[#eef6ef] px-5 py-3 text-sm font-semibold text-[#245235]"
              >
                Agendar revisao
                <CalendarDays size={16} />
              </a>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {workshopServices.map(({ title, body, icon: Icon }) => (
                <article key={title} className="experience-hover-card rounded-[30px] border border-[#17323a]/10 bg-white p-6">
                  <div className="inline-flex rounded-2xl bg-[#e7f1e8] p-3 text-[#2f6a42]">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[#17323a]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#4d666d]">{body}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <article className="experience-hover-card-dark overflow-hidden rounded-[32px] border border-[#17323a]/10 bg-[#17323a] text-[#f6f2e8] shadow-[0_24px_70px_rgba(23,50,58,0.14)]">
                <div className="grid gap-6 p-7 md:grid-cols-[0.92fr_1.08fr] md:p-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[#bfdfc6]">agenda e operacao</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                      Oficina com agenda moderna, coleta e suporte no caminho.
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#d9e7e4]">
                      A ideia aqui e mostrar que a oficina nao depende so do balcao: a operacao pode retirar a bike, devolver pronta e atender pequenos imprevistos onde o cliente estiver.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {fieldServiceCards.map(({ title, body, icon: Icon }) => (
                      <div key={title} className="experience-hover-card-dark rounded-[24px] border border-white/10 bg-white/6 p-5">
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-[#b6ff7f]/12 p-3 text-[#b6ff7f]">
                            <Icon size={18} strokeWidth={1.8} />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-[#f6f2e8]">{title}</h4>
                            <p className="mt-2 text-sm leading-6 text-[#d9e7e4]">{body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="experience-hover-card overflow-hidden rounded-[32px] border border-[#17323a]/10 bg-[#f8fbf8] p-3 shadow-[0_24px_70px_rgba(23,50,58,0.08)]">
                <div className="relative overflow-hidden rounded-[28px] bg-[#17323a]">
                  {workshopGallery.map((slide, index) => {
                    const isActive = index === activeWorkshopSlide;

                    return (
                      <div
                        key={slide.title}
                        className={`absolute inset-0 transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.04]'}`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,20,14,0.04),rgba(9,20,14,0.82))]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,255,127,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(98,255,214,0.14),transparent_24%)]" />
                      </div>
                    );
                  })}

                  <div className="relative flex min-h-[460px] flex-col justify-between p-6 md:min-h-[520px] md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e2f3e1]">
                        galeria da oficina
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveWorkshopSlide((current) => (current - 1 + workshopGallery.length) % workshopGallery.length)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/20 text-[#f6f2e8] backdrop-blur-sm transition-colors hover:bg-black/35"
                          aria-label="Slide anterior"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveWorkshopSlide((current) => (current + 1) % workshopGallery.length)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/20 text-[#f6f2e8] backdrop-blur-sm transition-colors hover:bg-black/35"
                          aria-label="Proximo slide"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="relative z-10 max-w-md">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#bfdfc6]">
                        {workshopGallery[activeWorkshopSlide].eyebrow}
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#f6f2e8]">
                        {workshopGallery[activeWorkshopSlide].title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[#d9e7e4]">
                        {workshopGallery[activeWorkshopSlide].body}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {workshopGallery.map((slide, index) => {
                    const isActive = index === activeWorkshopSlide;

                    return (
                      <button
                        key={`${slide.eyebrow}-${index}`}
                        type="button"
                        onClick={() => setActiveWorkshopSlide(index)}
                        className={`group overflow-hidden rounded-[22px] border text-left transition-all ${isActive ? 'border-[#4c8b5d] bg-white shadow-[0_18px_34px_rgba(76,139,93,0.12)]' : 'border-[#17323a]/10 bg-white/70 hover:border-[#4c8b5d]/30'}`}
                      >
                        <div className="relative h-24 overflow-hidden">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className={`h-full w-full object-cover transition-transform duration-500 ${isActive ? 'scale-100' : 'scale-105 group-hover:scale-110'}`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.08),rgba(10,24,16,0.56))]" />
                        </div>
                        <div className="p-4">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">{slide.eyebrow}</p>
                          <p className="mt-2 text-sm font-semibold leading-5 text-[#17323a]">
                            {slide.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="venda" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#5f8668]">venda</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#17323a] md:text-6xl">
                Bikes e acessorios com atendimento proximo.
              </h2>
            </div>
            <div className="rounded-full bg-[#17323a] px-5 py-3 text-sm font-semibold text-[#f6f2e8]">
              Teste antes de comprar
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-5 md:grid-cols-3">
              {saleColumns.map((column) => (
                <article key={column.title} className="experience-hover-card rounded-[30px] border border-[#17323a]/10 bg-[#f8fbf8] p-6">
                  <h3 className="text-xl font-semibold text-[#17323a]">{column.title}</h3>
                  <div className="mt-5 space-y-3">
                    {column.items.map((item) => (
                      <div key={item} className="rounded-[18px] bg-white px-4 py-3 text-sm leading-6 text-[#4d666d]">
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <article className="experience-hover-card-dark rounded-[32px] border border-[#17323a]/10 bg-[#17323a] p-7 text-[#f6f2e8]">
              <div className="inline-flex rounded-2xl bg-white/10 p-3 text-[#9fd0ab]">
                <Store size={20} />
              </div>
              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em]">Teste antes de comprar</h3>
              <p className="mt-4 text-sm leading-7 text-[#d9e7e4]">
                Pedale, compare e sinta a bike na pratica. Se fechar a compra, parte do aluguel pode virar credito.
              </p>
            </article>
          </div>
        </section>

        <section id="contato" className="border-t border-[#17323a]/10 bg-[#17323a] text-[#f6f2e8]">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#bfdfc6]">contato</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] md:text-6xl">
                  Fale com a gente e resolva rapido.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#d9e7e4]">
                  Reserve sua bike, agende manutencao ou consulte modelos disponiveis.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#home"
                    className="inline-flex items-center justify-center rounded-full bg-[#4c8b5d] px-6 py-4 text-sm font-semibold text-[#eef8ef]"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-4 text-sm font-semibold text-[#f6f2e8]"
                  >
                    Instagram
                  </a>
                </div>
              </div>

              <div className="grid gap-5">
                {contactCards.map(({ title, body, icon: Icon }) => (
                  <div key={title} className="experience-hover-card-dark rounded-[30px] border border-white/10 bg-white/6 p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/10 p-3 text-[#9fd0ab]">
                        <Icon size={18} strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d9e7e4]">{body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        </>
        ) : (
        <>
          <section id="catalogo-home" className="relative isolate overflow-hidden border-b border-[#17323a]/10">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${salesSceneAlt})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(246,242,232,0.96),rgba(246,242,232,0.84))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,255,127,0.24),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(98,255,214,0.16),transparent_24%)]" />

            <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.36em] text-[#5f8668]">catalogo</p>
                <h1 className="mt-4 font-serif text-4xl leading-[0.92] tracking-[-0.05em] text-[#17323a] md:text-6xl">
                  Um catalogo com cara de e-commerce moderno para bikes e acessorios.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-[#486068]">
                  Definimos atributos por modelo, status de atendimento, faixa de preco e uma logica clara para vender bike, kit e upgrade com mais confianca.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#produtos"
                    className="inline-flex items-center justify-center rounded-full bg-[#17323a] px-6 py-4 text-sm font-semibold text-[#f6f2e8] transition-transform hover:-translate-y-0.5"
                  >
                    Ver produtos
                  </a>
                  <Link
                    to="/playground/experience-studio"
                    className="inline-flex items-center justify-center rounded-full border border-[#4c8b5d]/30 bg-[#eef6ef] px-6 py-4 text-sm font-semibold text-[#245235] transition-colors hover:border-[#4c8b5d] hover:bg-[#e4f0e5]"
                  >
                    Voltar para landing
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {catalogStats.map((stat) => (
                    <div key={stat.label} className="rounded-[22px] border border-[#17323a]/10 bg-white/80 px-4 py-4 shadow-[0_14px_34px_rgba(23,50,58,0.05)]">
                      <p className="text-2xl font-semibold tracking-[-0.04em] text-[#17323a]">{stat.value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6f8b73]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <article className="experience-hover-card overflow-hidden rounded-[32px] border border-[#17323a]/10 bg-[#17323a] text-[#f6f2e8] shadow-[0_24px_70px_rgba(23,50,58,0.14)]">
                  <div className="relative h-full min-h-[320px]">
                    <img src={featuredCatalogProduct.image} alt={featuredCatalogProduct.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.12),rgba(10,24,16,0.84))]" />
                    <div className="relative flex h-full flex-col justify-end p-7">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#bfdfc6]">produto em destaque</p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{featuredCatalogProduct.title}</h2>
                      <p className="mt-3 max-w-md text-sm leading-7 text-[#d9e7e4]">{featuredCatalogProduct.summary}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {featuredCatalogProduct.attributes.map((attribute) => (
                          <span key={attribute.label} className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f6f2e8]">
                            {attribute.label}: {attribute.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                <div className="grid gap-4">
                  <article className="experience-hover-card overflow-hidden rounded-[28px] border border-[#17323a]/10 bg-white shadow-[0_20px_50px_rgba(23,50,58,0.08)]">
                    <div className="relative h-40">
                      <img src={bikeCatalogProducts[1]?.image ?? featuredCatalogProduct.image} alt="Mobilidade eletrica na Lagoa" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.08),rgba(10,24,16,0.55))]" />
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">bikes</p>
                      <p className="mt-2 text-lg font-semibold text-[#17323a]">Modelos com atributos claros e leitura rapida.</p>
                    </div>
                  </article>

                  <article className="experience-hover-card overflow-hidden rounded-[28px] border border-[#17323a]/10 bg-white shadow-[0_20px_50px_rgba(23,50,58,0.08)]">
                    <div className="relative h-40">
                      <img src={catalogAsset('Captura de tela de 2026-04-12 02-55-16.png')} alt="Curadoria de modelos e showroom" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.08),rgba(10,24,16,0.55))]" />
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">acessorios</p>
                      <p className="mt-2 text-lg font-semibold text-[#17323a]">Kits, upgrades e itens de seguranca na mesma vitrine.</p>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          <section id="produtos" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#5f8668]">produtos</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#17323a] md:text-6xl">
                  Cada bike vira um slide com dados extraidos da propria arte do catalogo.
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBikeSlide((current) => (current - 1 + filteredBikeProducts.length) % filteredBikeProducts.length)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#17323a]/10 bg-white text-[#17323a] transition-colors hover:border-[#4c8b5d]/35 hover:text-[#245235]"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBikeSlide((current) => (current + 1) % filteredBikeProducts.length)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#17323a]/10 bg-white text-[#17323a] transition-colors hover:border-[#4c8b5d]/35 hover:text-[#245235]"
                  aria-label="Proximo slide"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="mb-10 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <article className="rounded-[34px] border border-[#17323a]/10 bg-white p-7 shadow-[0_24px_70px_rgba(23,50,58,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#6f8b73]">filtro por uso</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#17323a]">
                      Monte um perfil rapido e afine a curadoria.
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#486068]">
                      Ajuste altura, peso, distancia diaria, janela de recarga e tipo de uso para priorizar os modelos mais compativeis.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#eef6ef] p-3 text-[#2f6a42]">
                    <Gauge size={18} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <label className="rounded-[24px] border border-[#17323a]/10 bg-[#f8fbf8] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">altura</span>
                      <span className="text-sm font-semibold text-[#17323a]">{catalogNeeds.riderHeightCm} cm</span>
                    </div>
                    <input
                      type="range"
                      min="145"
                      max="200"
                      step="1"
                      value={catalogNeeds.riderHeightCm}
                      onChange={(event) => setCatalogNeeds((current) => ({ ...current, riderHeightCm: Number(event.target.value) }))}
                      className="mt-4 h-2 w-full accent-[#4c8b5d]"
                    />
                  </label>

                  <label className="rounded-[24px] border border-[#17323a]/10 bg-[#f8fbf8] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">peso do ciclista</span>
                      <span className="text-sm font-semibold text-[#17323a]">{catalogNeeds.riderWeightKg} kg</span>
                    </div>
                    <input
                      type="range"
                      min="45"
                      max="140"
                      step="1"
                      value={catalogNeeds.riderWeightKg}
                      onChange={(event) => setCatalogNeeds((current) => ({ ...current, riderWeightKg: Number(event.target.value) }))}
                      className="mt-4 h-2 w-full accent-[#4c8b5d]"
                    />
                  </label>

                  <label className="rounded-[24px] border border-[#17323a]/10 bg-[#f8fbf8] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">trajeto diario</span>
                      <span className="text-sm font-semibold text-[#17323a]">{catalogNeeds.dailyDistanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      step="1"
                      value={catalogNeeds.dailyDistanceKm}
                      onChange={(event) => setCatalogNeeds((current) => ({ ...current, dailyDistanceKm: Number(event.target.value) }))}
                      className="mt-4 h-2 w-full accent-[#4c8b5d]"
                    />
                  </label>

                  <div className="rounded-[24px] border border-[#17323a]/10 bg-[#f8fbf8] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">janela de recarga</span>
                      <span className="text-sm font-semibold text-[#17323a]">ate {catalogNeeds.maxChargeHours}h</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[4, 5, 6, 8].map((hours) => {
                        const isActive = catalogNeeds.maxChargeHours === hours;
                        return (
                          <button
                            key={`charge-${hours}`}
                            type="button"
                            onClick={() => setCatalogNeeds((current) => ({ ...current, maxChargeHours: hours }))}
                            className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${isActive ? 'border-[#4c8b5d] bg-[#17323a] text-[#f6f2e8]' : 'border-[#17323a]/10 bg-white text-[#486068] hover:border-[#4c8b5d]/35 hover:text-[#245235]'}`}
                          >
                            ate {hours}h
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">uso principal</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {catalogUseFocusOptions.map((option) => {
                      const isActive = catalogNeeds.focus === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCatalogNeeds((current) => ({ ...current, focus: option.value }))}
                          className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${isActive ? 'border-[#4c8b5d] bg-[#17323a] text-[#f6f2e8]' : 'border-[#17323a]/10 bg-white text-[#486068] hover:border-[#4c8b5d]/35 hover:text-[#245235]'}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>

              <article className="rounded-[34px] border border-[#17323a]/10 bg-[#17323a] p-7 text-[#f6f2e8] shadow-[0_24px_70px_rgba(23,50,58,0.14)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#bfdfc6]">curadoria sugerida</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                      {hasExactBikeMatches ? `${compatibleBikeProducts.length} modelos compativeis` : 'Sem match exato'}
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-[#b6ff7f]">
                    <BatteryCharging size={18} strokeWidth={1.8} />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#d9e7e4]">
                  {hasExactBikeMatches
                    ? 'O carrossel abaixo mostra apenas os modelos que suportam esse perfil de uso com altura, carga diaria e recarga dentro da janela escolhida.'
                    : 'Nao apareceu um encaixe exato com todos os limites. Abaixo mostramos os modelos mais proximos para comparar e ajustar a escolha.'}
                </p>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#bfdfc6]">melhor encaixe agora</p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{topRecommendedBike.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-[#d9e7e4]">{topRecommendedBike.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {topRecommendedBike.attributes.map((attribute) => (
                      <span key={`${topRecommendedBike.title}-${attribute.label}`} className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f6f2e8]">
                        {attribute.label}: {attribute.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#bfdfc6]">altura</p>
                    <p className="mt-2 text-base font-semibold">{catalogNeeds.riderHeightCm} cm</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#bfdfc6]">peso</p>
                    <p className="mt-2 text-base font-semibold">{catalogNeeds.riderWeightKg} kg</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#bfdfc6]">trajeto</p>
                    <p className="mt-2 text-base font-semibold">{catalogNeeds.dailyDistanceKm} km/dia</p>
                  </div>
                </div>
              </article>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.94fr_1.06fr]">
              <article className="experience-hover-card overflow-hidden rounded-[34px] border border-[#17323a]/10 bg-white shadow-[0_24px_70px_rgba(23,50,58,0.08)]">
                <div className="relative h-full min-h-[620px] bg-[#101816]">
                  <img
                    src={currentBikeSlide.image}
                    alt={currentBikeSlide.heroLabel}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.06),rgba(10,24,16,0.18))]" />
                  <div className="absolute left-5 top-5 rounded-full border border-white/16 bg-black/24 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f6f2e8] backdrop-blur-sm">
                    {currentBikeSlide.badge}
                  </div>
                  <div className="absolute right-5 top-5 rounded-full border border-white/16 bg-black/24 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f6f2e8] backdrop-blur-sm">
                    {activeBikeSlide + 1}/{filteredBikeProducts.length}
                  </div>
                </div>
              </article>

              <article className="experience-hover-card rounded-[34px] border border-[#17323a]/10 bg-[#f8fbf8] p-7 shadow-[0_24px_70px_rgba(23,50,58,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#6f8b73]">{currentBikeSlide.heroLabel}</p>
                    <h3 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#17323a]">
                      {currentBikeSlide.title}
                    </h3>
                  </div>
                  <div className="rounded-[22px] border border-[#17323a]/10 bg-white px-4 py-3 text-right shadow-[0_14px_30px_rgba(23,50,58,0.05)]">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#6f8b73]">{currentBikeSlide.status}</p>
                    <p className="mt-1 text-lg font-semibold text-[#245235]">{currentBikeSlide.price}</p>
                  </div>
                </div>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#486068]">
                  {currentBikeSlide.summary}
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {currentBikeSlide.attributes.map((attribute) => (
                    <div key={`${currentBikeSlide.title}-${attribute.label}`} className="rounded-[20px] border border-[#17323a]/10 bg-white px-4 py-4 shadow-[0_12px_24px_rgba(23,50,58,0.04)]">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#6f8b73]">{attribute.label}</p>
                      <p className="mt-2 text-base font-semibold text-[#17323a]">{attribute.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] border border-[#17323a]/10 bg-white p-5 shadow-[0_16px_30px_rgba(23,50,58,0.05)]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#6f8b73]">principais caracteristicas</p>
                    <p className="text-xs text-[#486068]">extraidas da arte do catalogo</p>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {currentBikeSlide.specs.map((spec) => (
                      <div key={`${currentBikeSlide.title}-${spec}`} className="rounded-[18px] bg-[#f8fbf8] px-4 py-3 text-sm leading-6 text-[#17323a]">
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {currentBikeSlide.tags.map((tag) => (
                    <span key={`${currentBikeSlide.title}-${tag}`} className="rounded-full border border-[#17323a]/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f8668]">
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href="#contato-catalogo"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#17323a] px-5 py-3 text-sm font-semibold text-[#f6f2e8] transition-transform hover:-translate-y-0.5"
                >
                  Consultar este modelo
                  <ArrowUpRight size={16} />
                </a>
              </article>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filteredBikeProducts.map((product, index) => {
                const isActive = index === activeBikeSlide;

                return (
                  <button
                    key={`bike-slide-${product.title}`}
                    type="button"
                    onClick={() => setActiveBikeSlide(index)}
                    className={`group overflow-hidden rounded-[24px] border text-left transition-all ${isActive ? 'border-[#4c8b5d] bg-white shadow-[0_20px_34px_rgba(76,139,93,0.12)]' : 'border-[#17323a]/10 bg-white/80 hover:border-[#4c8b5d]/30'}`}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.heroLabel}
                        className={`h-full w-full object-cover transition-transform duration-500 ${isActive ? 'scale-100' : 'scale-105 group-hover:scale-110'}`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.08),rgba(10,24,16,0.62))]" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/16 bg-black/24 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f6f2e8]">
                        {product.heroLabel}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold leading-5 text-[#17323a]">{product.title}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#6f8b73]">{product.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="acessorios" className="border-y border-[#17323a]/10 bg-white/55">
            <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
              <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#5f8668]">acessorios</p>
                  <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] text-[#17323a] md:text-6xl">
                    Nao vendemos so a bike. Vendemos o setup completo.
                  </h2>
                </div>
                <div className="rounded-full bg-[#17323a] px-5 py-3 text-sm font-semibold text-[#f6f2e8]">
                  kits e upgrades
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <article className="experience-hover-card-dark overflow-hidden rounded-[32px] border border-[#17323a]/10 bg-[#17323a] text-[#f6f2e8] shadow-[0_24px_70px_rgba(23,50,58,0.14)]">
                  <div className="relative min-h-[320px]">
                    <img src={currentAccessorySheet.image} alt={currentAccessorySheet.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.12),rgba(10,24,16,0.88))]" />
                    <div className="relative flex h-full flex-col justify-end p-7">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-[#bfdfc6]">cross sell inteligente</p>
                      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                        {currentAccessorySheet.title}
                      </h3>
                      <p className="mt-4 max-w-md text-sm leading-7 text-[#d9e7e4]">
                        {currentAccessorySheet.body}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="experience-hover-card rounded-[32px] border border-[#17323a]/10 bg-white p-7 shadow-[0_24px_70px_rgba(23,50,58,0.08)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">slide de acessorios</p>
                      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17323a]">{currentAccessorySheet.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveAccessorySlide((current) => (current - 1 + accessorySheets.length) % accessorySheets.length)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#17323a]/10 bg-white text-[#17323a] transition-colors hover:border-[#4c8b5d]/35 hover:text-[#245235]"
                        aria-label="Slide anterior de acessorios"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAccessorySlide((current) => (current + 1) % accessorySheets.length)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#17323a]/10 bg-white text-[#17323a] transition-colors hover:border-[#4c8b5d]/35 hover:text-[#245235]"
                        aria-label="Proximo slide de acessorios"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {currentAccessorySheet.items.map((item) => (
                      <div key={`${currentAccessorySheet.title}-${item}`} className="rounded-[18px] border border-[#17323a]/10 bg-[#f8fbf8] px-4 py-3 text-sm font-semibold text-[#17323a]">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {accessorySheets.map((sheet, index) => {
                      const isActive = index === activeAccessorySlide;

                      return (
                        <button
                          key={`accessory-sheet-${sheet.title}`}
                          type="button"
                          onClick={() => setActiveAccessorySlide(index)}
                          className={`group overflow-hidden rounded-[22px] border text-left transition-all ${isActive ? 'border-[#4c8b5d] bg-white shadow-[0_18px_34px_rgba(76,139,93,0.12)]' : 'border-[#17323a]/10 bg-white/80 hover:border-[#4c8b5d]/30'}`}
                        >
                          <div className="relative h-24 overflow-hidden">
                            <img
                              src={sheet.image}
                              alt={sheet.title}
                              className={`h-full w-full object-cover transition-transform duration-500 ${isActive ? 'scale-100' : 'scale-105 group-hover:scale-110'}`}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,16,0.08),rgba(10,24,16,0.56))]" />
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-semibold leading-5 text-[#17323a]">{sheet.title}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section id="curadoria" className="border-y border-[#17323a]/10 bg-white/55">
            <div className="mx-auto grid max-w-6xl gap-5 px-6 py-20 md:px-10 lg:grid-cols-[1.02fr_0.98fr]">
              <article className="experience-hover-card-dark overflow-hidden rounded-[32px] border border-[#17323a]/10 bg-[#17323a] text-[#f6f2e8] shadow-[0_24px_70px_rgba(23,50,58,0.14)]">
                <div className="grid gap-6 p-7 md:grid-cols-[0.9fr_1.1fr] md:p-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[#bfdfc6]">curadoria</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                      O padrao do catalogo pode servir tanto para bikes quanto para acessorios.
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#d9e7e4]">
                      Cada card pode carregar atributos tecnicos, faixa de preco, status e CTA. Isso permite crescer o catalogo sem desmontar o layout.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {catalogHighlights.map((item) => (
                      <div key={item} className="experience-hover-card-dark rounded-[24px] border border-white/10 bg-white/6 p-5">
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-[#b6ff7f]/12 p-3 text-[#b6ff7f]">
                            <CheckCircle2 size={18} strokeWidth={1.8} />
                          </div>
                          <p className="text-sm leading-6 text-[#d9e7e4]">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="experience-hover-card rounded-[32px] border border-[#17323a]/10 bg-[#f8fbf8] p-7 shadow-[0_24px_70px_rgba(23,50,58,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#6f8b73]">fluxo</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#17323a]">
                      Como essa pagina se aproxima de um e-commerce moderno.
                    </h3>
                  </div>
                  <div className="rounded-2xl bg-[#e7f1e8] p-3 text-[#2f6a42]">
                    <Store size={18} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {catalogSteps.map((step, index) => (
                    <div key={step} className="rounded-[22px] border border-[#17323a]/10 bg-white px-5 py-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#6f8b73]">etapa {index + 1}</p>
                      <p className="mt-2 text-base font-semibold text-[#17323a]">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] border border-[#17323a]/10 bg-[#eef6ef] p-5">
                  <p className="text-sm leading-7 text-[#486068]">
                    O proximo passo pode ser ligar esse padrao a um JSON real, com produtos editaveis, imagens por item e CTA dedicado para cada modelo.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section id="contato-catalogo" className="border-t border-[#17323a]/10 bg-[#17323a] text-[#f6f2e8]">
            <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#bfdfc6]">contato</p>
                  <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.04em] md:text-6xl">
                    Quer um modelo especifico ou uma curadoria rapida?
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-[#d9e7e4]">
                    Chame no WhatsApp para consultar disponibilidade, categorias e possibilidades de teste.
                  </p>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <a
                      href="#catalogo-home"
                      className="inline-flex items-center justify-center rounded-full bg-[#4c8b5d] px-6 py-4 text-sm font-semibold text-[#eef8ef]"
                    >
                      WhatsApp
                    </a>
                    <Link
                      to="/playground/experience-studio"
                      className="inline-flex items-center justify-center rounded-full border border-white/12 px-6 py-4 text-sm font-semibold text-[#f6f2e8]"
                    >
                      Voltar para landing
                    </Link>
                  </div>
                </div>

                <div className="grid gap-5">
                  {contactCards.map(({ title, body, icon: Icon }) => (
                    <div key={title} className="experience-hover-card-dark rounded-[30px] border border-white/10 bg-white/6 p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/10 p-3 text-[#9fd0ab]">
                          <Icon size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-[#d9e7e4]">{body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
        )}
      </main>
    </div>
  );
};

export default ExperienceStudio;
