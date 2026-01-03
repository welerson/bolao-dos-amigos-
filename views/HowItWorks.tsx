
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-10">
      <header className="p-6 flex items-center gap-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-black text-gray-800">Regras e Info</h2>
      </header>

      <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
        <section className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">Conceito</h3>
            <p className="text-emerald-100 text-sm font-medium leading-relaxed opacity-90">
              O <span className="text-white font-bold">Bolão dos Amigos</span> é uma ferramenta social. 
              Não realizamos apostas oficiais. Organizamos os dados para que amigos compitam entre si 
              baseados na Mega-Sena.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mb-16 -mr-16"></div>
        </section>

        <section className="space-y-4">
          <h3 className="font-black text-gray-800 ml-4 tracking-tight">Fluxo de Jogo</h3>
          <div className="grid gap-4">
            {[
              { title: "Escolha seu Bolão", desc: "Entre em salas de 100, 300, 500 ou 1000 pessoas." },
              { title: "Dê seu Palpite", desc: "Selecione 12 números exclusivos entre 01 e 60." },
              { title: "3 Sorteios", desc: "Acompanhamos os 3 sorteios semanais oficiais da Mega-Sena." },
              { title: "Soma de Pontos", desc: "Seus acertos nos 3 sorteios são somados para o Ranking." }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 items-center p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600 font-black shadow-inner">0{i+1}</div>
                <div>
                  <h4 className="font-black text-sm text-gray-800">{item.title}</h4>
                  <p className="text-[11px] text-gray-400 font-bold mt-1 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900 text-white p-8 rounded-[48px] shadow-2xl">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-emerald-900">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
            </div>
            Exemplo Financeiro
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
              <span className="opacity-50 font-bold uppercase tracking-widest text-[10px]">Total Arrecadado</span>
              <span className="font-black text-lg">{formatCurrency(20000)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Adm (30%)</p>
                <p className="text-sm font-black">{formatCurrency(6000)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Ano (10%)</p>
                <p className="text-sm font-black">{formatCurrency(2000)}</p>
              </div>
            </div>

            <div className="bg-emerald-500/10 p-5 rounded-[32px] border border-emerald-500/20 flex justify-between items-center">
              <span className="font-black text-emerald-300 text-xs uppercase tracking-widest">Prêmios (60%)</span>
              <span className="text-xl font-black text-emerald-400">{formatCurrency(12000)}</span>
            </div>

            <div className="pt-4 space-y-2">
              {[
                { l: "1º Lugar (75%)", v: 9000 },
                { l: "2º Lugar (15%)", v: 1800 },
                { l: "3º Lugar (10%)", v: 1200 }
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2 px-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{row.l}</span>
                  <span className="text-sm font-black text-emerald-100">{formatCurrency(row.v)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;
