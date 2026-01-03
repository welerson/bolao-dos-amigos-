
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-10">
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold">Como funciona</h2>
      </header>

      <div className="p-6 space-y-8">
        <section className="bg-white p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-emerald-700 mb-3">Conceito</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            O "Bolão dos Amigos" é uma plataforma social para organizar bolões internos. 
            Não realizamos apostas oficiais na Caixa Econômica Federal. O app gerencia 
            os participantes e os palpites de forma independente.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-gray-800 ml-2">As Regras do Jogo</h3>
          <div className="grid gap-3">
            {[
              { title: "Palpite", desc: "Você escolhe 12 números entre 1 e 60." },
              { title: "Sorteios", desc: "Acompanhamos 3 sorteios oficiais da Mega-Sena por semana." },
              { title: "Pontuação", desc: "Seus acertos em cada sorteio são somados ao final da semana." },
              { title: "Ganhadores", desc: "Premiamos os 1º, 2º e 3º lugares do ranking de acertos." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold text-sm">{i+1}</div>
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-emerald-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Exemplo Financeiro
          </h3>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between border-b border-emerald-800 pb-2">
              <span className="text-sm">Total Arrecadado:</span>
              <span className="font-bold">{formatCurrency(20000)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-200">
              <span>Adm (30%):</span>
              <span>{formatCurrency(6000)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-200">
              <span>Final de Ano (10%):</span>
              <span>{formatCurrency(2000)}</span>
            </div>
            <div className="flex justify-between text-emerald-100 font-semibold pt-1">
              <span>Prêmio Semanal (60%):</span>
              <span>{formatCurrency(12000)}</span>
            </div>
            <div className="pt-4 space-y-2">
              <div className="p-3 bg-white/10 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold">1º Lugar (75%)</span>
                <span className="text-sm font-bold">{formatCurrency(9000)}</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold">2º Lugar (15%)</span>
                <span className="text-sm font-bold">{formatCurrency(1800)}</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold">3º Lugar (10%)</span>
                <span className="text-sm font-bold">{formatCurrency(1200)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;
