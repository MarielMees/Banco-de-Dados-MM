import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Trophy,
  Award,
  Filter,
  FileText,
  Eye,
  X,
  AlertTriangle
} from 'lucide-react'
import CoachModal from './CoachModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const NIVEIS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']

const ESTILOS_JOGO = [
  'Jogo Apoiado',
  'Jogo Vertical',
  'Ofensivo',
  'Defensivo',
  'Equilibrado',
  'Bola Parada'
]

export default function CoachesList({
  onBack,
  coaches = [],
  onSaveCoach,
  onDeleteCoach,
  matchReports = []
}) {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [styleFilter, setStyleFilter] = useState('ALL')
  const [expandedCoachId, setExpandedCoachId] = useState(null)
  const [showReportsCoachIds, setShowReportsCoachIds] = useState(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coachToEdit, setCoachToEdit] = useState(null)
  const [previewReport, setPreviewReport] = useState(null)
  const [coachToDelete, setCoachToDelete] = useState(null)

  const toggleExpand = (id) => {
    setExpandedCoachId(prev => (prev === id ? null : id))
  }

  const toggleReportsCoach = (id) => {
    setShowReportsCoachIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleOpenAddModal = () => {
    setCoachToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (coach) => {
    setCoachToEdit(coach)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (coach) => {
    setCoachToDelete(coach)
  }

  const handleConfirmDelete = () => {
    if (coachToDelete && onDeleteCoach) {
      onDeleteCoach(coachToDelete.id)
    }
    setCoachToDelete(null)
  }

  const filteredCoaches = useMemo(() => {
    return coaches.filter(coach => {
      // Busca textual (Nome, Clube Atual, Experiência)
      if (search.trim()) {
        const s = search.toLowerCase()
        const matchNome = (coach.nome || '').toLowerCase().includes(s)
        const matchClube = (coach.clubeAtual || '').toLowerCase().includes(s)
        const matchExp = (coach.experiencia || '').toLowerCase().includes(s)
        if (!matchNome && !matchClube && !matchExp) return false
      }

      // Filtro por Nível
      if (levelFilter !== 'ALL' && coach.nivelAtual !== levelFilter) {
        return false
      }

      // Filtro por Estilo de Jogo
      if (styleFilter !== 'ALL') {
        if (!coach.caracteristicas || !coach.caracteristicas.includes(styleFilter)) {
          return false
        }
      }

      return true
    })
  }, [coaches, search, levelFilter, styleFilter])

  const getNivelStyle = (nivel) => {
    switch (nivel) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-slate-950 font-bold'
      case 'B+':
      case 'B':
        return 'bg-blue-600 text-white font-bold'
      case 'C+':
      case 'C':
        return 'bg-amber-500 text-slate-950 font-bold'
      default:
        return 'bg-slate-600 text-slate-100 font-bold'
    }
  }

  // Normalizador de títulos com retrocompatibilidade para contadores e texto
  const getCoachTitulosData = (titulos) => {
    const res = { nacionais: 0, estaduais: 0, internacionais: 0, base: 0 }
    if (!titulos) return res

    if (typeof titulos === 'object') {
      res.nacionais = Number(titulos.nacionais) || 0
      res.estaduais = Number(titulos.estaduais) || 0
      res.internacionais = Number(titulos.internacionais) || 0
      res.base = Number(titulos.base) || 0
      return res
    }

    if (typeof titulos === 'string' && titulos.trim()) {
      const tLower = titulos.toLowerCase()
      if (tLower.includes('brasileir') || tLower.includes('copa do brasil') || tLower.includes('série b') || tLower.includes('supercopa')) {
        res.nacionais = 1
      }
      if (tLower.includes('paulista') || tLower.includes('estadual') || tLower.includes('nordeste') || tLower.includes('mineiro') || tLower.includes('gaúcho') || tLower.includes('carioca')) {
        res.estaduais = 1
      }
      if (tLower.includes('sul-americana') || tLower.includes('libertadores') || tLower.includes('recopa')) {
        res.internacionais = 1
      }
      if (tLower.includes('copinha') || tLower.includes('sub-20') || tLower.includes('sub 20')) {
        res.base = 1
      }
    }

    return res
  }

  // Normalizador de acessos com retrocompatibilidade (fallback 1x se array)
  const getCoachAcessosData = (acessos) => {
    const res = { bParaA: 0, cParaB: 0, dParaC: 0 }
    if (!acessos) return res

    if (Array.isArray(acessos)) {
      acessos.forEach(ac => {
        if (typeof ac === 'string') {
          const lower = ac.toLowerCase()
          if (lower.includes('b para a') || lower.includes('b_para_a') || lower === 'bparaa') res.bParaA = Math.max(res.bParaA, 1)
          else if (lower.includes('c para b') || lower.includes('c_para_b') || lower === 'cparab') res.cParaB = Math.max(res.cParaB, 1)
          else if (lower.includes('d para c') || lower.includes('d_para_c') || lower === 'dparac') res.dParaC = Math.max(res.dParaC, 1)
        } else if (typeof ac === 'object' && ac !== null) {
          if (ac.bParaA) res.bParaA = Number(ac.bParaA) || 0
          if (ac.cParaB) res.cParaB = Number(ac.cParaB) || 0
          if (ac.dParaC) res.dParaC = Number(ac.dParaC) || 0
        }
      })
      return res
    }

    if (typeof acessos === 'object') {
      res.bParaA = Number(acessos.bParaA) || 0
      res.cParaB = Number(acessos.cParaB) || 0
      res.dParaC = Number(acessos.dParaC) || 0
    }

    return res
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 font-sans pb-12 select-none">
      {/* 1. TOPO / HEADER */}
      <header className="bg-[#0b111c] border-b border-slate-800/80 px-6 py-3 sticky top-0 z-50">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121d30] hover:bg-[#1a2942] text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide">
                  Banco de Treinadores <span className="text-slate-600">|</span> <span className="text-emerald-400">Mapeamento de Mercado</span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Perfis táticos, históricos de acessos, conquistas e modelos de jogo
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#121c2d] border border-slate-700/80 rounded-lg px-3 py-1 text-center min-w-[75px]">
              <div className="text-base font-extrabold text-white leading-tight">
                {coaches.length}
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider">
                TREINADORES
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BANNER DE ALERTA: TREINADORES PROVISÓRIOS AGUARDANDO DADOS COMPLETOS */}
      {coaches.some(c => c.isProvisorio) && (
        <section className="max-w-[1720px] mx-auto px-6 pt-4">
          <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-3 text-amber-300">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                ⚠️ Existem treinadores observados em campo aguardando dados completos.
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0">
              Scout de Campo
            </span>
          </div>
        </section>
      )}

      {/* 2. BARRA DE FILTROS & AÇÕES */}
      <section className="max-w-[1720px] mx-auto px-6 pt-5 pb-3">
        <div className="bg-[#0b111c] border border-slate-800/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Lado Esquerdo: Busca e Filtros */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Input de Busca Textual */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar treinador, clube, experiência..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#121d30] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 w-64"
              />
            </div>

            {/* Filtro por Nível */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-[#121d30] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
            >
              <option value="ALL">Todos os Níveis</option>
              {NIVEIS.map((n) => (
                <option key={n} value={n}>Nível {n}</option>
              ))}
            </select>

            {/* Filtro por Estilo de Jogo */}
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="bg-[#121d30] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer"
            >
              <option value="ALL">Todos os Estilos</option>
              {ESTILOS_JOGO.map((estilo) => (
                <option key={estilo} value={estilo}>{estilo}</option>
              ))}
            </select>
          </div>

          {/* Lado Direito: Total de Resultados e Botão Adicionar */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-medium">
              <strong className="text-white font-bold">{filteredCoaches.length}</strong> selecionados
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Treinador</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. TABELA DE TREINADORES COM EXPANSÃO ACCORDION */}
      <main className="max-w-[1720px] mx-auto px-6">
        <div className="bg-[#0b111c] border border-slate-800/90 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#080d16] text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-3 px-4">TREINADOR</th>
                  <th className="py-3 px-3 text-center">IDADE</th>
                  <th className="py-3 px-4">CLUBE ATUAL</th>
                  <th className="py-3 px-3 text-center">NÍVEL</th>
                  <th className="py-3 px-4 text-center">TÍTULOS</th>
                  <th className="py-3 px-4">EXPERIÊNCIA</th>
                  <th className="py-3 px-3 text-center">EX-ATLETA</th>
                  <th className="py-3 px-4 text-center">ACESSOS CONQUISTADOS</th>
                  <th className="py-3 px-4">CARACTERÍSTICAS</th>
                  <th className="py-3 px-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredCoaches.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 text-xs">
                      Nenhum treinador encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCoaches.map((coach) => {
                    const isExpanded = expandedCoachId === coach.id
                    const titulosData = getCoachTitulosData(coach.titulos)
                    const acessosData = getCoachAcessosData(coach.acessos)
                    const totalTitulos = titulosData.nacionais + titulosData.estaduais + titulosData.internacionais + titulosData.base
                    const totalAcessos = acessosData.bParaA + acessosData.cParaB + acessosData.dParaC

                    return (
                      <React.Fragment key={coach.id}>
                        <tr
                          onClick={() => toggleExpand(coach.id)}
                          className={`transition-colors group cursor-pointer ${
                            isExpanded
                              ? 'bg-slate-900/90 border-b-2 border-indigo-500/50 shadow-sm'
                              : 'hover:bg-[#101929]/80'
                          }`}
                        >
                          {/* TREINADOR */}
                          <td className="py-3.5 px-4 font-bold text-white tracking-wide text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span>{coach.nome}</span>
                                {coach.isProvisorio && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    <span>Cadastro Provisório</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* IDADE */}
                          <td className="py-3.5 px-3 text-center font-bold text-slate-200">
                            {coach.idade ? `${coach.idade} anos` : '—'}
                          </td>

                          {/* CLUBE ATUAL */}
                          <td className="py-3.5 px-4 font-medium">
                            <span className={coach.clubeAtual === 'Livre no Mercado' ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                              {coach.clubeAtual || '—'}
                            </span>
                          </td>

                          {/* NÍVEL */}
                          <td className="py-3.5 px-3 text-center">
                            {coach.nivelAtual ? (
                              <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[10px] leading-none ${getNivelStyle(coach.nivelAtual)}`}>
                                {coach.nivelAtual}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">—</span>
                            )}
                          </td>

                          {/* TÍTULOS (COLUNA DEDICADA LOGO APÓS NÍVEL) */}
                          <td className="py-3.5 px-4 text-center">
                            {totalTitulos > 0 ? (
                              <div className="flex flex-wrap justify-center gap-1">
                                {titulosData.internacionais > 0 && (
                                  <span
                                    title="Internacionais"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  >
                                    <span>🏆 Inter</span>
                                    <span>{titulosData.internacionais}x</span>
                                  </span>
                                )}
                                {titulosData.nacionais > 0 && (
                                  <span
                                    title="Nacionais"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  >
                                    <span>🏆 Nac</span>
                                    <span>{titulosData.nacionais}x</span>
                                  </span>
                                )}
                                {titulosData.estaduais > 0 && (
                                  <span
                                    title="Estaduais"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40"
                                  >
                                    <span>🏆 Estad</span>
                                    <span>{titulosData.estaduais}x</span>
                                  </span>
                                )}
                                {titulosData.base > 0 && (
                                  <span
                                    title="Base"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                  >
                                    <span>🏆 Base</span>
                                    <span>{titulosData.base}x</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 font-medium">—</span>
                            )}
                          </td>

                          {/* EXPERIÊNCIA */}
                          <td className="py-3.5 px-4 text-slate-300">
                            {coach.experiencia || '—'}
                          </td>

                          {/* EX-ATLETA */}
                          <td className="py-3.5 px-3 text-center">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              coach.exAtleta
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {coach.exAtleta ? 'Sim' : 'Não'}
                            </span>
                          </td>

                          {/* ACESSOS CONQUISTADOS */}
                          <td className="py-3.5 px-4 text-center">
                            {totalAcessos > 0 ? (
                              <div className="flex flex-wrap justify-center gap-1.5">
                                {acessosData.bParaA > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-tight">
                                    <Award className="w-2.5 h-2.5 text-amber-400" />
                                    <span>B para A{acessosData.bParaA > 1 ? ` ${acessosData.bParaA}x` : ''}</span>
                                  </span>
                                )}
                                {acessosData.cParaB > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 tracking-tight">
                                    <Award className="w-2.5 h-2.5 text-sky-400" />
                                    <span>C para B{acessosData.cParaB > 1 ? ` ${acessosData.cParaB}x` : ''}</span>
                                  </span>
                                )}
                                {acessosData.dParaC > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-tight">
                                    <Award className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>D para C{acessosData.dParaC > 1 ? ` ${acessosData.dParaC}x` : ''}</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px]">—</span>
                            )}
                          </td>

                          {/* CARACTERÍSTICAS */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {coach.caracteristicas && coach.caracteristicas.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-[#13233a] text-sky-400 border border-sky-800/40 font-medium"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* AÇÕES */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {coach.isProvisorio && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(coach)}
                                  className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Completar cadastro com títulos, estilo e dados técnicos"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>Completar Ficha</span>
                                </button>
                              )}
                              <button
                                title="Editar Treinador"
                                onClick={() => handleOpenEditModal(coach)}
                                className="p-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Excluir Treinador"
                                onClick={() => handleDeleteClick(coach)}
                                className="p-1.5 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ACCORDION INLINE DETALHADO */}
                        {isExpanded && (
                          <tr className="bg-[#080e1a] border-b-2 border-slate-800 animate-in fade-in duration-200">
                            <td colSpan={10} className="p-0">
                              <div className="p-5 bg-[#0b1322] border-l-4 border-l-indigo-500 shadow-inner">
                                <div className="max-w-6xl space-y-4">
                                  {/* Painel Resumido: TÍTULOS E ACESSOS */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {/* Bloco de Títulos */}
                                    <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                          <span>Títulos & Conquistas</span>
                                        </div>
                                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                          Total: {totalTitulos}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <div className="bg-[#121d30] p-2 rounded-lg border border-slate-700/60 text-center">
                                          <span className="text-[10px] text-slate-400 block font-medium">Nacionais</span>
                                          <span className="text-base font-black text-amber-400">{titulosData.nacionais}</span>
                                        </div>
                                        <div className="bg-[#121d30] p-2 rounded-lg border border-slate-700/60 text-center">
                                          <span className="text-[10px] text-slate-400 block font-medium">Estaduais</span>
                                          <span className="text-base font-black text-sky-400">{titulosData.estaduais}</span>
                                        </div>
                                        <div className="bg-[#121d30] p-2 rounded-lg border border-slate-700/60 text-center">
                                          <span className="text-[10px] text-slate-400 block font-medium">Inter</span>
                                          <span className="text-base font-black text-emerald-400">{titulosData.internacionais}</span>
                                        </div>
                                        <div className="bg-[#121d30] p-2 rounded-lg border border-slate-700/60 text-center">
                                          <span className="text-[10px] text-slate-400 block font-medium">Base</span>
                                          <span className="text-base font-black text-purple-400">{titulosData.base}</span>
                                        </div>
                                      </div>

                                      {/* Detalhes por extenso se houver */}
                                      {(coach.titulosTexto || (typeof coach.titulos === 'string' && coach.titulos)) && (
                                        <div className="text-xs text-slate-300 italic bg-[#111c30] p-2.5 rounded-lg border border-slate-800">
                                          "{coach.titulosTexto || coach.titulos}"
                                        </div>
                                      )}
                                    </div>

                                    {/* Bloco de Acessos */}
                                    <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Acessos Conquistados</span>
                                        </div>
                                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                          Total: {totalAcessos}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-[#121d30] p-2 rounded-lg border border-slate-700/60 text-center">
                                          <span className="text-[10px] text-slate-400 block font-medium">D para C</span>
                                          <span className="text-base font-black text-emerald-400">{acessosData.dParaC}</span>
                                        </div>
                                        <div className="bg-[#121d30] p-2 rounded-lg border border-slate-700/60 text-center">
                                          <span className="text-[10px] text-slate-400 block font-medium">C para B</span>
                                          <span className="text-base font-black text-sky-400">{acessosData.cParaB}</span>
                                        </div>
                                        <div className="bg-[#121d30] p-2 rounded-lg border border-slate-700/60 text-center">
                                          <span className="text-[10px] text-slate-400 block font-medium">B para A</span>
                                          <span className="text-base font-black text-amber-400">{acessosData.bParaA}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Observações do Scout */}
                                  <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-1.5 flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                      <span>OBSERVAÇÕES DO SCOUT E MODELO DE JOGO</span>
                                    </div>
                                    <div className="text-xs text-slate-100 bg-[#111c30] p-3.5 rounded-lg border border-slate-700/60 leading-relaxed shadow-sm">
                                      {coach.observacao && coach.observacao.trim() ? (
                                        <span>{coach.observacao}</span>
                                      ) : (
                                        <span className="text-slate-400 italic">
                                          Nenhuma observação registrada.
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Seção de Desempenho em Jogos / Avaliações Táticas */}
                                  {(() => {
                                    const coachReports = matchReports
                                      .map(r => {
                                        const list = (r.treinadoresAvaliados && Array.isArray(r.treinadoresAvaliados) && r.treinadoresAvaliados.length > 0)
                                          ? r.treinadoresAvaliados
                                          : (r.treinadorAvaliado ? [r.treinadorAvaliado] : [])
                                        
                                        const matchEntry = list.find(t => 
                                          t && (t.idTreinador === coach.id || (t.nome && t.nome.toLowerCase() === coach.nome.toLowerCase()))
                                        )

                                        return matchEntry ? { report: r, entry: matchEntry } : null
                                      })
                                      .filter(Boolean)

                                    const hasReports = coachReports.length > 0
                                    const totalJogos = coachReports.length
                                    const somaNotas = coachReports.reduce((acc, curr) => acc + (Number(curr.entry.nota) || 0), 0)
                                    const mediaNota = hasReports ? (somaNotas / totalJogos).toFixed(1) : null
                                    const isReportsOpen = showReportsCoachIds.has(coach.id)

                                    return (
                                      <div className="pt-3 border-t border-dashed border-slate-800/90 space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex flex-wrap items-center gap-2.5">
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                                              <span>DESEMPENHO EM JOGOS & AVALIAÇÕES TÁTICAS</span>
                                            </div>

                                            {hasReports && (
                                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-extrabold text-[11px]">
                                                  Nota Média: {mediaNota}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold text-[11px]">
                                                  {totalJogos} {totalJogos === 1 ? 'partida avaliada' : 'partidas avaliadas'}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {hasReports && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                toggleReportsCoach(coach.id)
                                              }}
                                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto sm:ml-0"
                                            >
                                              {isReportsOpen ? (
                                                <>
                                                  <span>Ocultar Histórico</span>
                                                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                                </>
                                              ) : (
                                                <>
                                                  <span>Ver Histórico de Jogos ({totalJogos})</span>
                                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </div>

                                        {!hasReports ? (
                                          <p className="text-xs text-slate-400 italic bg-[#111c30] p-3.5 rounded-lg border border-slate-700/60 shadow-sm">
                                            Nenhum relatório de jogo vinculado a este treinador até o momento.
                                          </p>
                                        ) : (
                                          isReportsOpen && (
                                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in duration-150">
                                              {coachReports.map(({ report, entry }) => {
                                                return (
                                                  <div
                                                    key={report.id}
                                                    className="p-3.5 bg-[#111c30] border border-slate-700/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-600 transition-colors"
                                                  >
                                                    <div className="space-y-1.5">
                                                      <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                          {report.data}
                                                        </span>
                                                        <span className="font-bold text-white text-xs">
                                                          {report.partida}
                                                        </span>
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/70 font-semibold">
                                                          {report.competicao}
                                                        </span>
                                                        {entry.time && (
                                                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                                                            entry.time === 'mandante'
                                                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                                              : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                                          }`}>
                                                            {entry.time === 'mandante' ? 'Mandante' : 'Visitante'}
                                                          </span>
                                                        )}
                                                        {entry?.nota !== undefined && (
                                                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/50">
                                                            Nota {Number(entry.nota).toFixed(1)}
                                                          </span>
                                                        )}
                                                      </div>

                                                      {entry?.comentario && (
                                                        <p className="text-slate-200 text-xs italic bg-[#0a111e] p-2.5 rounded-md border border-slate-800">
                                                          "{entry.comentario}"
                                                        </p>
                                                      )}
                                                    </div>

                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        setPreviewReport(report)
                                                      }}
                                                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18263e] hover:bg-[#203252] text-slate-200 border border-slate-600/70 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                                                    >
                                                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                                      <span>Ver Relatório Completo</span>
                                                    </button>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )
                                  })()}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      <CoachModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveCoach}
        coachToEdit={coachToEdit}
      />

      {/* MODAL DE PRÉVIA / VISUALIZAÇÃO DO RELATÓRIO COMPLETO */}
      {previewReport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1322] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#090f1c]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">
                  {previewReport.partida} ({previewReport.competicao})
                </span>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-400 pb-2 border-b border-slate-800">
                <span><strong>Data:</strong> {previewReport.data}</span>
                <span><strong>Local:</strong> {previewReport.local}</span>
              </div>

              {/* Avaliação dos Treinadores no Modal de Prévia */}
              {(() => {
                const list = (previewReport.treinadoresAvaliados && Array.isArray(previewReport.treinadoresAvaliados) && previewReport.treinadoresAvaliados.length > 0)
                  ? previewReport.treinadoresAvaliados
                  : (previewReport.treinadorAvaliado ? [previewReport.treinadorAvaliado] : [])

                if (list.length === 0) return null

                return (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-violet-400">
                      Avaliação dos Treinadores
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {list.map((c, idx) => (
                        <div key={idx} className="bg-[#070c16] p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{c.nome}</span>
                            <div className="flex items-center gap-1.5">
                              {c.time && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                                  c.time === 'mandante'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                }`}>
                                  {c.time === 'mandante' ? 'Mandante' : 'Visitante'}
                                </span>
                              )}
                              {c.nota !== undefined && (
                                <span className="font-extrabold text-indigo-400 text-xs">
                                  Nota {Number(c.nota).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          {c.comentario && (
                            <p className="text-slate-300 italic leading-relaxed text-[11px]">
                              "{c.comentario}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              <div>
                <h4 className="font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                  Resumo Tático da Partida
                </h4>
                <p className="bg-[#070c16] p-3 rounded-lg border border-slate-800/80 text-slate-200 leading-relaxed">
                  {previewReport.analiseGeral || 'Nenhum resumo tático informado.'}
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-[#090f1c] flex justify-end">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE TREINADOR */}
      <ConfirmDeleteModal
        isOpen={!!coachToDelete}
        onClose={() => setCoachToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={
          coachToDelete ? (
            <>
              Tem certeza que deseja remover o treinador{' '}
              <strong className="text-white font-bold">{coachToDelete.nome}</strong>?{' '}
              Esta ação não poderá ser desfeita.
            </>
          ) : null
        }
      />
    </div>
  )
}
