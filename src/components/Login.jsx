import React, { useState } from 'react'
import {
  Zap,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Loader2,
  ShieldCheck
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'

export default function Login({ onLoginSuccess }) {
  const [inputUser, setInputUser] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedUser = inputUser.trim()
    if (!trimmedUser) {
      setErrorMessage('Por favor, informe seu usuário ou e-mail.')
      return
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      // 1. Formatação Amigável: Se não contiver '@', completa com '@radarmec.com'
      const emailAuth = trimmedUser.includes('@')
        ? trimmedUser
        : `${trimmedUser}@radarmec.com`

      // 2. Autenticação oficial no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailAuth,
        password: password
      })

      if (error) {
        const msg = error.message?.toLowerCase() || ''
        if (
          msg.includes('invalid login credentials') ||
          msg.includes('invalid grant') ||
          error.status === 400
        ) {
          setErrorMessage('Usuário ou senha incorretos. Verifique suas credenciais e tente novamente.')
        } else if (msg.includes('email not confirmed')) {
          setErrorMessage('E-mail ainda não confirmado no sistema.')
        } else {
          setErrorMessage(error.message || 'Erro ao conectar. Tente novamente em alguns instantes.')
        }
        setIsLoading(false)
        return
      }

      if (data?.session) {
        if (onLoginSuccess) {
          onLoginSuccess(data.session)
        }
      }
    } catch (err) {
      console.error('Erro na autenticação:', err)
      setErrorMessage('Ocorreu uma falha de conexão com o servidor. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Luz ambiente de fundo (Glow sutil) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[250px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Card Principal de Login */}
        <div className="bg-[#0b111c]/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Logo e Cabeçalho */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
              <Zap className="w-7 h-7 fill-emerald-400" />
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight">
              Radar de Mercado
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Scout & Inteligência Esportiva • Banco de Dados - MM
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Acesso Restrito à Equipe</span>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Formulário de Autenticação */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Usuário / E-mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usuário ou E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={inputUser}
                  onChange={(e) => setInputUser(e.target.value)}
                  placeholder="ex: mariel.mees ou seu@email.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#121c2d] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#121c2d] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dica da Equipe */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 Você pode digitar apenas seu usuário (ex: <span className="text-emerald-400 font-semibold">mariel.mees</span>). O domínio <span className="text-slate-300 font-medium">@radarmec.com</span> será completado automaticamente.
            </p>
          </div>
        </div>

        {/* Rodapé Seguro */}
        <p className="text-center text-[10px] text-slate-600 mt-4">
          Conexão Segura & Criptografada via Supabase Auth
        </p>
      </div>
    </div>
  )
}
