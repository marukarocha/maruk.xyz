// Calculadora de E-Bikes - Versão com Recomendações
import { useState, useEffect } from "react";
import { 
  Bike, 
  Battery, 
  MapPin, 
  DollarSign,
  Zap,
  Calculator as CalcIcon,
  CheckCircle,
  Star,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";

interface CalculatorInputs {
  dailyDistance: number;
  terrainType: 'flat' | 'hilly' | 'mixed';
  riderWeight: number;
  cargoWeight: number;
  budget: number;
}

interface BikeRecommendation {
  id: string;
  name: string;
  category: 'city' | 'comfort' | 'cargo' | 'compact' | 'leisure';
  batteryRange: number; // km
  motorPower: number; // W
  weight: number; // kg
  price: number; // R$
  suitabilityScore: number; // 0-100
  features: string[];
  description: string;
  pros: string[];
}

const bikeDatabase: BikeRecommendation[] = [
  {
    id: 'urban-glide',
    name: 'Urban Glide Pro',
    category: 'city',
    batteryRange: 60,
    motorPower: 250,
    weight: 22,
    price: 4500,
    suitabilityScore: 0,
    features: ['Display LCD', 'Freios a disco', 'Suspensão dianteira', '5 Níveis de assistência'],
    description: 'Ideal para deslocamento urbano diário',
    pros: ['Excelente para cidade', 'Bateria de longa duração', 'Confortável']
  },
  {
    id: 'mountain-explorer',
    name: 'Mountain Explorer',
    category: 'leisure',
    batteryRange: 45,
    motorPower: 350,
    weight: 25,
    price: 5200,
    suitabilityScore: 0,
    features: ['Suspensão completa', 'Pneus largos', 'Motor de alto torque', 'Modo Turbo'],
    description: 'Aventura e lazer em trilhas',
    pros: ['Ideal para trilhas', 'Potência excelente', 'Robusta']
  },
  {
    id: 'city-commuter',
    name: 'City Commuter Lite',
    category: 'compact',
    batteryRange: 40,
    motorPower: 200,
    weight: 18,
    price: 3200,
    suitabilityScore: 0,
    features: ['Leve e ágil', 'Dobrável', 'Display simples', '3 Níveis de assistência'],
    description: 'Perfeita para multimodalidade',
    pros: ['Muito leve', 'Preço acessível', 'Fácil de guardar']
  },
  {
    id: 'cargo-master',
    name: 'Cargo Master',
    category: 'cargo',
    batteryRange: 50,
    motorPower: 300,
    weight: 28,
    price: 5800,
    suitabilityScore: 0,
    features: ['Porta-cargas frontal', 'Bateria extra', 'Freios a disco hidráulicos', 'Capacidade 100kg'],
    description: 'Para transporte de cargas e mercadorias',
    pros: ['Ideal para cargas', 'Muito estável', 'Bateria duradoura']
  },
  {
    id: 'comfort-cruiser',
    name: 'Comfort Cruiser',
    category: 'comfort',
    batteryRange: 55,
    motorPower: 250,
    weight: 21,
    price: 3800,
    suitabilityScore: 0,
    features: ['Conforto premium', 'Banco largo', 'Guidão ajustável', 'Assistência suave'],
    description: 'Conforto máximo para passeios longos',
    pros: ['Muito confortável', 'Boa autonomia', 'Preço justo']
  },
  {
    id: 'speed-racer',
    name: 'Speed Racer',
    category: 'city',
    batteryRange: 70,
    motorPower: 500,
    weight: 24,
    price: 6500,
    suitabilityScore: 0,
    features: ['Motor de alta performance', 'Suspensão esportiva', 'Pneus slick', 'Display avançado'],
    description: 'Para quem busca velocidade e performance',
    pros: ['Muito rápida', 'Alta autonomia', 'Performance excelente']
  }
];

const terrainFactors = {
  flat: 1.0,
  hilly: 1.3,
  mixed: 1.15
};

export const CalculatorApp = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    dailyDistance: 10,
    terrainType: 'mixed',
    riderWeight: 70,
    cargoWeight: 0,
    budget: 5000,
  });

  const [recommendations, setRecommendations] = useState<BikeRecommendation[]>([]);
  const [selectedBike, setSelectedBike] = useState<BikeRecommendation | null>(null);

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para calcular a adequação de uma bike
  const calculateSuitability = (bike: BikeRecommendation): number => {
    let score = 0;
    const totalWeight = inputs.riderWeight + inputs.cargoWeight;
    const adjustedDistance = inputs.dailyDistance * terrainFactors[inputs.terrainType];

    // Fator de bateria (0-40 pontos)
    const batteryScore = Math.max(0, 40 - Math.abs(bike.batteryRange - adjustedDistance * 1.5));
    score += batteryScore;

    // Fator de potência para terreno (0-30 pontos)
    if (inputs.terrainType === 'hilly' && bike.motorPower >= 300) score += 30;
    else if (inputs.terrainType === 'mixed' && bike.motorPower >= 250) score += 25;
    else if (inputs.terrainType === 'flat') score += 20;

    // Fator de capacidade de peso (0-15 pontos)
    const weightCapacity = bike.weight * 4; // Estimativa
    if (totalWeight <= weightCapacity) score += 15;
    else if (totalWeight <= weightCapacity * 1.2) score += 10;
    else score += 5;

    // Fator de orçamento (0-15 pontos)
    const budgetScore = Math.max(0, 15 - ((bike.price - inputs.budget) / 500));
    score += Math.max(0, budgetScore);

    return Math.min(100, Math.round(score));
  };

  // Atualizar recomendações quando inputs mudarem
  useEffect(() => {
    const calculatedBikes = bikeDatabase.map(bike => ({
      ...bike,
      suitabilityScore: calculateSuitability(bike)
    })).sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    setRecommendations(calculatedBikes);
    setSelectedBike(calculatedBikes[0]);
  }, [inputs]);

  // Cálculos básicos
  const totalWeight = inputs.riderWeight + inputs.cargoWeight;
  const adjustedDistance = inputs.dailyDistance * terrainFactors[inputs.terrainType];

  // Função para obter cor da categoria
  const getCategoryColor = (category: BikeRecommendation['category']) => {
    switch (category) {
      case 'city': return 'bg-blue-100 text-blue-800';
      case 'comfort': return 'bg-green-100 text-green-800';
      case 'cargo': return 'bg-amber-100 text-amber-800';
      case 'compact': return 'bg-purple-100 text-purple-800';
      case 'leisure': return 'bg-red-100 text-red-800';
    }
  };

  // Função para obter label da categoria
  const getCategoryLabel = (category: BikeRecommendation['category']) => {
    switch (category) {
      case 'city': return 'Urbana';
      case 'comfort': return 'Conforto';
      case 'cargo': return 'Carga';
      case 'compact': return 'Compacta';
      case 'leisure': return 'Lazer';
    }
  };

  // Função para obter cor do score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4">
            <CalcIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Calculadora de E-Bikes
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encontre a e-bike perfeita baseada no seu perfil de uso e necessidades
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Painel de Entrada */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <CalcIcon className="w-5 h-5 text-emerald-500" />
                Configure suas necessidades
              </h2>

              <div className="space-y-8">
                {/* Distância Diária */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Distância Diária (km)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={inputs.dailyDistance}
                      onChange={(e) => handleInputChange('dailyDistance', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">5 km</span>
                      <span className="font-medium text-gray-800">{inputs.dailyDistance} km</span>
                      <span className="text-gray-500">100 km</span>
                    </div>
                  </div>
                </div>

                {/* Tipo de Terreno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Terreno
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['flat', 'hilly', 'mixed'] as const).map((terrain) => (
                      <button
                        key={terrain}
                        onClick={() => handleInputChange('terrainType', terrain)}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                          inputs.terrainType === terrain
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {terrain === 'flat' ? 'Plano' : terrain === 'hilly' ? 'Montanhoso' : 'Misto'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Peso do Ciclista */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Seu Peso (kg)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={inputs.riderWeight}
                      onChange={(e) => handleInputChange('riderWeight', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">40 kg</span>
                      <span className="font-medium text-gray-800">{inputs.riderWeight} kg</span>
                      <span className="text-gray-500">120 kg</span>
                    </div>
                  </div>
                </div>

                {/* Peso da Carga */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Carga Adicional (kg)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={inputs.cargoWeight}
                      onChange={(e) => handleInputChange('cargoWeight', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">0 kg</span>
                      <span className="font-medium text-gray-800">{inputs.cargoWeight} kg</span>
                      <span className="text-gray-500">50 kg</span>
                    </div>
                  </div>
                </div>

                {/* Orçamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Orçamento (R$)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="2000"
                      max="10000"
                      step="500"
                      value={inputs.budget}
                      onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">R$ 2.000</span>
                      <span className="font-medium text-gray-800">R$ {inputs.budget.toLocaleString()}</span>
                      <span className="text-gray-500">R$ 10.000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Recomendações */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                E-Bikes Recomendadas
              </h2>

              <div className="space-y-4">
                {recommendations.map((bike) => (
                  <div
                    key={bike.id}
                    onClick={() => setSelectedBike(bike)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedBike?.id === bike.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(bike.category)}`}>
                            {getCategoryLabel(bike.category)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className={`text-sm font-bold ${getScoreColor(bike.suitabilityScore)}`}>
                              {bike.suitabilityScore}%
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{bike.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{bike.description}</p>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex items-center gap-2">
                            <Battery className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{bike.batteryRange} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{bike.motorPower}W</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{bike.weight} kg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-emerald-600">R$ {bike.price.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Preço</div>
                      </div>
                    </div>
                </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel de resumo */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-gray-800">
                <Shield className="h-5 w-5 text-emerald-500" />
                Seu perfil
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    Distância ajustada
                  </span>
                  <strong className="text-gray-800">{adjustedDistance.toFixed(1)} km</strong>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Peso total</span>
                  <strong className="text-gray-800">{totalWeight} kg</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Orçamento</span>
                  <strong className="text-gray-800">R$ {inputs.budget.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {selectedBike && (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Melhor combinação
                </p>
                <h2 className="mt-3 text-2xl font-bold">{selectedBike.name}</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">{selectedBike.description}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/65">Compatibilidade</p>
                    <p className="text-3xl font-bold">{selectedBike.suitabilityScore}%</p>
                  </div>
                  <p className="text-lg font-semibold">R$ {selectedBike.price.toLocaleString()}</p>
                </div>
                <ul className="mt-6 space-y-3">
                  {selectedBike.pros.map((pro) => (
                    <li key={pro} className="flex items-center gap-2 text-sm text-white/88">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
