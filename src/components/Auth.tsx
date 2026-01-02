// src/components/Auth.tsx
import React, { useState } from 'react'; // Adicionei 'React' aqui
import { supabase } from '../services/supabaseClient';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Conta criada! Verifique seu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleAuth}
      className="flex flex-col gap-5 p-8 bg-[#1e293b] rounded-[2rem] border border-white/10 max-w-md mx-auto shadow-2xl text-white"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          {isRegistering ? 'Criar Conta' : 'Bem-vindo de volta'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isRegistering ? 'Cadastre-se para salvar seus projetos' : 'Entre para acessar seu painel'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
          <input 
            type="email" 
            name="email"
            autoComplete="username"
            required
            placeholder="seu@email.com" 
            className="w-full p-4 mt-1 bg-slate-900/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={e => setEmail(e.target.value)} 
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
          <input 
            type="password" 
            name="password"
            autoComplete={isRegistering ? "new-password" : "current-password"}
            required
            placeholder="••••••••" 
            className="w-full p-4 mt-1 bg-slate-900/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? 'Carregando...' : isRegistering ? 'Cadastrar Grátis' : 'Entrar no ArchitAI'}
      </button>

      <button 
        type="button" 
        onClick={() => setIsRegistering(!isRegistering)}
        className="text-slate-400 text-sm hover:text-white transition-colors text-center"
      >
        {isRegistering 
          ? 'Já tem uma conta? Faça login' 
          : 'Não tem uma conta? Cadastre-se agora'}
      </button>
    </form>
  );
}