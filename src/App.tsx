import React, { useState, useEffect } from 'react';
import { HouseStyle, GenerationRequest, GeneratedPlan } from './types';
import { generateProject } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { Auth } from './components/Auth';
import PlanCard from './components/PlanCard';
import ManualPlanner from './components/ManualPlanner';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<GeneratedPlan[]>([]);
  const [activeMode, setActiveMode] = useState<'ai-pure' | 'manual-assisted'>('ai-pure');
  
  const [formData, setFormData] = useState<GenerationRequest>({
    style: HouseStyle.MODERN,
    size: 150,
    rooms: 3,
    floors: 1,
    additionalNotes: ''
  });

  // --- BUSCA PROJETOS SALVOS NO BANCO ---
  const fetchUserPlans = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPlans: GeneratedPlan[] = data.map((p: any) => ({
          id: String(p.id),
          imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
          request: {
            style: (p.estilo as HouseStyle) || HouseStyle.MODERN,
            size: Number(p.tamanho) || 0,
            rooms: Number(p.quartos) || 0,
            floors: 1,
            additionalNotes: p.descricao || ''
          },
          timestamp: p.created_at ? new Date(p.created_at).getTime() : Date.now()
        }));
        setPlans(formattedPlans);
      }
    } catch (error: any) {
      console.error("Erro ao carregar histórico:", error.message);
    }
  };

  // --- MONITORAMENTO DE LOGIN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserPlans(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserPlans(session.user.id);
      else setPlans([]); 
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- GERAR E SALVAR COM LIMITE INDIVIDUAL ---
  const handleGenerate = async (inputImage?: string) => {
    if (!session) return;
    setLoading(true);
    
    try {
      // 1. VERIFICAÇÃO DE LIMITE DIÁRIO (Evita esgotar sua API Key)
      const hoje = new Date().toISOString().split('T')[0]; 
      const { count, error: countError } = await supabase
        .from('projetos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', hoje);

      if (countError) throw countError;

      // Limite de 5 plantas por pessoa por dia
      if (count !== null && count >= 5) {
        alert("🔒 Limite diário atingido! \n\nPara mantermos o ArchitAI gratuito para todos, cada conta pode gerar 5 projetos por dia. Volte amanhã para criar mais!");
        setLoading(false);
        return;
      }

      // 2. CHAMADA DA IA
      const responseText = await generateProject({ ...formData, inputImage });
      
      // 3. SALVAMENTO NO BANCO
      const { data, error } = await supabase
        .from('projetos')
        .insert([{
          estilo: formData.style,
          tamanho: formData.size.toString(),
          quartos: formData.rooms.toString(),
          descricao: responseText,
          user_id: session.user.id
        }])
        .select();

      if (error) throw error;

      const newPlan: GeneratedPlan = {
        id: String(data[0].id),
        imageUrl: inputImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        request: { ...formData, additionalNotes: responseText },
        timestamp: Date.now()
      };

      setPlans(prev => [newPlan, ...prev]);

    } catch (error: any) {
      // Tradução amigável do erro de cota da API
      if (error.message === "LIMITE_DIARIO") {
        alert("⚠️ O sistema está muito ocupado agora. Aguarde 60 segundos e tente gerar sua planta novamente.");
      } else {
        alert("Ops! Tivemos um problema: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4"><Auth /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-20">
      {/* BARRA DE NAVEGAÇÃO */}
      <nav className="sticky top-0 z-50 bg-[#1e293b]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">ArchitAI</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
              <button onClick={() => setActiveMode('ai-pure')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeMode === 'ai-pure' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Criação IA</button>
              <button onClick={() => setActiveMode('manual-assisted')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeMode === 'manual-assisted' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Desenho Manual</button>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all">Sair</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
          <div className="lg:col-span-4">
            <div className="bg-[#1e293b]/50 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 backdrop-blur-md sticky top-32">
              <div>
                <h2 className="text-2xl font-bold text-white">Novo Projeto</h2>
                <p className="text-slate-400 text-xs mt-1">Bem-vindo, {session.user.email?.split('@')[0]}!</p>
              </div>

              {activeMode === 'manual-assisted' ? (
                <ManualPlanner onExport={handleGenerate} loading={loading} />
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estilo</label>
                    <select value={formData.style} onChange={e => setFormData({...formData, style: e.target.value as HouseStyle})} className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      {Object.values(HouseStyle).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Área m²</label>
                      <input type="number" placeholder="Ex: 150" value={formData.size} onChange={e => setFormData({...formData, size: +e.target.value})} className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Quartos</label>
                      <input type="number" placeholder="Ex: 3" value={formData.rooms} onChange={e => setFormData({...formData, rooms: +e.target.value})} className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desejos Extras</label>
                    <textarea placeholder="Ex: Varanda gourmet, closet no quarto principal..." value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 h-28 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" />
                  </div>

                  <button onClick={() => handleGenerate()} disabled={loading} className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${loading ? 'bg-slate-700 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] shadow-blue-500/20'}`}>
                    {loading ? 'Consultando IA...' : 'Gerar e Salvar Planta'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: GALERIA */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Seu Histórico
              <span className="bg-blue-600/20 text-blue-400 text-sm px-4 py-1 rounded-full border border-blue-400/20">{plans.length} Projetos</span>
            </h2>

            {plans.length === 0 && !loading ? (
              <div className="h-64 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-500 bg-white/5">
                <p className="text-center px-10">Você ainda não tem projetos salvos. <br/> Comece um agora mesmo nas configurações!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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