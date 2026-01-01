
import React from 'react';
import { GeneratedPlan } from '../types';

interface PlanCardProps {
  plan: GeneratedPlan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  return (
    <div className="glass-effect rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <div className="aspect-square relative overflow-hidden bg-slate-800">
        <img 
          src={plan.imageUrl} 
          alt={`Planta de casa estilo ${plan.request.style}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-blue-600/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {plan.request.style}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Conceito de Projeto</h3>
          <span className="text-slate-400 text-sm">{new Date(plan.timestamp).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            {plan.request.size} m²
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            {plan.request.rooms} Quartos
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {plan.request.floors} Andar{plan.request.floors > 1 ? 'es' : ''}
          </div>
        </div>
        {plan.request.additionalNotes && (
          <p className="text-xs text-slate-400 italic line-clamp-2">
            "{plan.request.additionalNotes}"
          </p>
        )}
        <button 
          onClick={() => {
            const link = document.createElement('a');
            link.href = plan.imageUrl;
            link.download = `architai-projeto-${plan.id}.png`;
            link.click();
          }}
          className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar Renderização
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
