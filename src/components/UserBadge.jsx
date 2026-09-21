import React from 'react'
import { User, LogOut } from 'lucide-react'

export default function UserBadge({ user, onSignOut, className = '' }) {
  if (!user) return null

  // Extrai o nome de exibição amigável
  // Ex: mariel.mees@radarmec.com -> mariel.mees
  // Ex: teste.teste@radarmec.com -> teste.teste
  const getDisplayName = (u) => {
    if (!u) return 'Equipe'
    if (u.user_metadata?.full_name) return u.user_metadata.full_name
    if (u.user_metadata?.username) return u.user_metadata.username
    if (u.email) {
      if (u.email.endsWith('@radarmec.com')) {
        return u.email.replace('@radarmec.com', '')
      }
      return u.email.split('@')[0]
    }
    return 'Equipe'
  }

  const name = getDisplayName(user)

  return (
    <div className={`flex items-center gap-2 pl-2 border-l border-slate-800 ${className}`}>
      {/* Indicador do Usuário Conectado */}
      <div
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#121c2d] border border-slate-700/80 text-xs shadow-sm select-none"
        title={`Conectado como: ${user.email || name}`}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <User className="w-3 h-3" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#121c2d] animate-pulse"></span>
        </div>
        <span className="text-slate-200 font-semibold text-xs tracking-tight">
          {name}
        </span>
      </div>

      {/* Botão Discreto de Sair */}
      <button
        type="button"
        onClick={onSignOut}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121c2d] hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 transition-colors text-xs font-medium cursor-pointer active:scale-95 shadow-sm"
        title="Encerrar sessão"
      >
        <LogOut className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline text-[11px] font-semibold">Sair</span>
      </button>
    </div>
  )
}
