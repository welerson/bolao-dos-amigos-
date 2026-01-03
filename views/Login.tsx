
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validate credentials
    onLogin({
      id: 'user-1',
      name: 'Usuário Teste',
      email: 'teste@bolao.com',
      phone: '11999999999',
      isAdmin: true
    });
    navigate('/home');
  };

  return (
    <div className="flex-1 flex flex-col p-8 justify-center items-center bg-emerald-700 text-white">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl">
            <svg className="w-12 h-12 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Bolão dos Amigos</h1>
        <p className="text-emerald-100 mt-2">Sua sorte compartilhada</p>
      </div>

      <div className="w-full bg-white text-gray-900 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-6">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Nome Completo</label>
              <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ex: João Silva" />
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">E-mail ou Telefone</label>
            <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Senha</label>
            <input required type="password" title="Senha" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
          </div>
          
          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" id="terms" required className="w-4 h-4 text-emerald-600" />
            <label htmlFor="terms" className="text-xs text-gray-500">Aceito os termos e condições de uso</label>
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-emerald-600 font-semibold text-sm text-center"
        >
          {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;
