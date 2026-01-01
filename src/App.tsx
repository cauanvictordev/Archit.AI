import React, { useState } from 'react';
import { HouseStyle, GenerationRequest, GeneratedPlan } from './types';
import { generateProject } from './services/geminiService';
import PlanCard from './components/PlanCard';
import ManualPlanner from './components/ManualPlanner';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<GeneratedPlan[]>([]);
  const [activeMode, setActiveMode] = useState<'ai-pure' | 'manual-assisted'>('ai-pure');
  
  // Estado do formulário de IA
  const [formData, setFormData] = useState<GenerationRequest>({
    style: HouseStyle.MODERN,
    size: 150,
    rooms: 3,
    floors: 1,
    additionalNotes: ''
  });

  const handleGenerate = async (inputImage?: string) => {
    setLoading(true);
    try {
      // Prepara os dados para a IA
      const requestData = { 
        ...formData, 
        inputImage // Imagem vinda do ManualPlanner, se houver
      };

      // Chama o serviço (certifique-se que o nome no geminiService.ts é generateProject)
      const responseText = await generateProject(requestData);
      
      const newPlan: GeneratedPlan = {
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: inputImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        request: { ...requestData, additionalNotes: responseText },
        timestamp: Date.now()
      };

      setPlans(prev => [newPlan, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Falha ao gerar o projeto. Verifique sua conexão e chave API no console (F12).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-20">
      {/* Barra de Navegação */}
      <nav className="sticky top-0 z-50 bg-[#1e293b]/70 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              ArchitAI
            </h1>
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setActiveMode('ai-pure')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeMode === 'ai-pure' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              Criação IA
            </button>
            <button 
              onClick={() => setActiveMode('manual-assisted')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeMode === 'manual-assisted' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              Desenho Manual
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Coluna de Configuração (Esquerda) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-effect p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-2xl font-bold text-white">Configurações</h2>
                <p className="text-slate-400 text-xs mt-1">Ajuste os detalhes do seu sonho</p>
              </div>

              {activeMode === 'manual-assisted' ? (
                <ManualPlanner onExport={handleGenerate} loading={loading} />
              ) : (
                <div className="space-y-6">
                  {/* Seletor de Estilo */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estilo Arquitetônico</label>
                    <select 
                      value={formData.style}
                      onChange={(e) => setFormData({...formData, style: e.target.value as HouseStyle})}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer text-sm font-medium"
                    >
                      {Object.values(HouseStyle).map(style => (
                        <option key={style} value={style} className="bg-slate-900">{style}</option>
                      ))}
                    </select>
                  </div>

                  {/* Inputs Numéricos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Área (m²)</label>
                      <input 
                        type="number" 
                        value={formData.size}
                        onChange={e => setFormData({...formData, size: +e.target.value})}
                        className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quartos</label>
                      <input 
                        type="number" 
                        value={formData.rooms}
                        onChange={e => setFormData({...formData, rooms: +e.target.value})}
                        className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Campo de Notas */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notas Especiais</label>
                    <textarea 
                      placeholder="Ex: Quero um jardim de inverno e teto solar..."
                      value={formData.additionalNotes}
                      onChange={e => setFormData({...formData, additionalNotes: e.target.value})}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 h-32 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
                    />
                  </div>

                  {/* Botão de Ação */}
                  <button 
                    onClick={() => handleGenerate()} 
                    disabled={loading}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-500 ${
                      loading 
                      ? 'bg-slate-700 cursor-wait' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] shadow-blue-500/20 active:scale-95'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando Projeto...
                      </span>
                    ) : 'Gerar Planta 3D Profissional'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna de Resultados (Direita) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                Seus Projetos 
                <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-400/20">
                  {plans.length} Gerados
                </span>
              </h2>
            </div>

            {plans.length === 0 ? (
              <div className="h-[600px] border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-500 bg-[#1e293b]/20 backdrop-blur-sm animate-pulse">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="font-medium">Inicie um projeto para ver as renderizações.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {plans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;