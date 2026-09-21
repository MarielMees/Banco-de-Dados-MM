import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Search,
  Plus,
  Zap,
  Calendar,
  MapPin,
  UserCheck,
  Star,
  FileText,
  Trash2,
  Trophy,
  Pencil,
  Eye,
  Users
} from 'lucide-react'
import PostMatchReportModal from './PostMatchReportModal'
import MatchReportViewerModal from './MatchReportViewerModal'
import QuickMatchReportModal from './QuickMatchReportModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { fetchMatchReportsFromSupabase } from '../services/supabaseService'

export default function MatchReportsList({
  onBack,
  matchReports = [],
  onSaveReport,
  onDeleteReport,
  onSavePlayerToRadar,
  onDeletePlayer,
  onSaveCoach,
  onDeleteCoach,
  coaches = [],
  players = [],
  initialReportToEdit = null,
  initialAddModalOpen = false
}) {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [competitionFilter, setCompetitionFilter] = useState('ALL')
  
  // Modal de Edição/Criação Original Estável
  const [isEditModalOpen, setIsEditModalOpen] = useState(initialAddModalOpen || !!initialReportToEdit)
  const [selectedReport, setSelectedReport] = useState(initialReportToEdit || null)

  // Modal Panorâmico de Visualização com Exportação para PDF
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)
  const [selectedViewerReport, setSelectedViewerReport] = useState(null)

  // Modal Express de Campo
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false)

  const [reportToDelete, setReportToDelete] = useState(null)

  // Leitura direta da tabela 'scout_match_reports' do Supabase para atualizar a listagem
  React.useEffect(() => {
    let isMounted = true
    async function loadCloudReports() {
      try {
        const cloudReports = await fetchMatchReportsFromSupabase()
        if (isMounted && Array.isArray(cloudReports) && cloudReports.length > 0) {
          cloudReports.forEach(r => {
            if (!matchReports.some(m => String(m.id) === String(r.id))) {
              if (onSaveReport) onSaveReport(r)
            }
          })
        }
      } catch (_) {}
    }
    loadCloudReports()
    return () => { isMounted = false }
  }, [])

  // Abrir Modal de Criação
  const handleOpenAddModal = () => {
    setSelectedReport(null)
    setIsEditModalOpen(true)
  }

  // Abrir Modal em Modo de Edição
  const handleOpenEditModal = (report) => {
    if (!report) return
    setSelectedReport(report)
    setIsEditModalOpen(true)
  }

  // Abrir Modal de Visualização Panorâmica com Exportação para PDF
  const handleOpenViewer = (report) => {
    if (!report) return
    setSelectedViewerReport(report)
    setIsViewerModalOpen(true)
  }

  // Salvar/Atualizar Relatório
  const handleSaveModalReport = (reportPayload) => {
    if (!reportPayload) return

    if (onSaveReport) {
      onSaveReport(reportPayload)
    }

    try {
      const storedScout = localStorage.getItem('scout_match_reports')
      const list = storedScout ? JSON.parse(storedScout) : matchReports
      const idx = (list || []).findIndex(r => r && r.id === reportPayload.id)
      let nextList
      if (idx >= 0) {
        nextList = [...list]
        nextList[idx] = reportPayload
      } else {
        nextList = [reportPayload, ...(list || [])]
      }
      localStorage.setItem('scout_match_reports', JSON.stringify(nextList))
      localStorage.setItem('radar_match_reports', JSON.stringify(nextList))
    } catch (e) {
      console.warn('Erro ao atualizar storage de relatórios:', e)
    }

    setIsEditModalOpen(false)
    setSelectedReport(null)
  }

  // Tratamento do Relatório Express
  const handleSaveQuickReport = (quickPayload, provPlayers = [], provCoaches = []) => {
    if (!quickPayload) return

    if (onSaveReport) {
      onSaveReport(quickPayload, provPlayers, provCoaches)
    }

    try {
      const storedScout = localStorage.getItem('scout_match_reports')
      const list = storedScout ? JSON.parse(storedScout) : matchReports
      const idx = (list || []).findIndex(r => r && r.id === quickPayload.id)
      let nextList
      if (idx >= 0) {
        nextList = [...list]
        nextList[idx] = quickPayload
      } else {
        nextList = [quickPayload, ...(list || [])]
      }
      localStorage.setItem('scout_match_reports', JSON.stringify(nextList))
      localStorage.setItem('radar_match_reports', JSON.stringify(nextList))
    } catch (e) {
      console.warn('Erro ao atualizar storage de relatórios express:', e)
    }

    setIsQuickModalOpen(false)
  }

  const handleDeleteClick = (report) => {
    setReportToDelete(report)
  }

  const handleConfirmDelete = () => {
    if (reportToDelete && onDeleteReport) {
      onDeleteReport(reportToDelete.id)
    }
    setReportToDelete(null)
  }

  // Extrair anos únicos disponíveis a partir das datas (YYYY) ordenados de forma decrescente
  const availableYears = useMemo(() => {
    const yearSet = new Set()
    ;(matchReports || []).forEach(r => {
      if (r?.data) {
        const year = r.data.substring(0, 4)
        if (year && !isNaN(year)) {
          yearSet.add(year)
        }
      }
    })
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a))
  }, [matchReports])

  // Competições disponíveis dependentes do ano selecionado (ou todas se 'ALL')
  const availableCompetitions = useMemo(() => {
    const set = new Set()
    ;(matchReports || []).forEach(r => {
      if (yearFilter === 'ALL' || (r?.data && r.data.startsWith(yearFilter))) {
        if (r?.competicao) set.add(r.competicao)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [matchReports, yearFilter])

  // Resetar ou sincronizar o filtro de competição se a competição selecionada não existir no ano escolhido
  const handleYearChange = (newYear) => {
    setYearFilter(newYear)
    if (competitionFilter !== 'ALL') {
      const existsInNewYear = (matchReports || []).some(r => {
        const matchesYear = newYear === 'ALL' || (r?.data && r.data.startsWith(newYear))
        return matchesYear && r?.competicao === competitionFilter
      })
      if (!existsInNewYear) {
        setCompetitionFilter('ALL')
      }
    }
  }

  // Helper para obter lista normalizada de treinadores avaliados para filtros de busca
  const getReportCoaches = (report) => {
    if (!report) return []
    if (report.treinadoresAvaliados && Array.isArray(report.treinadoresAvaliados) && report.treinadoresAvaliados.length > 0) {
      return report.treinadoresAvaliados
    }
    if (report.treinadorAvaliado && report.treinadorAvaliado.nome) {
      return [{ ...report.treinadorAvaliado, time: report.treinadorAvaliado.time || 'mandante' }]
    }
    return []
  }

  // Helper consolidado para extrair técnicos mandante e visitante
  const getUnifiedCoaches = (report, homeTeamName, awayTeamName) => {
    let coachM = null
    let coachV = null

    if (report.treinadoresAvaliados && Array.isArray(report.treinadoresAvaliados) && report.treinadoresAvaliados.length > 0) {
      coachM = report.treinadoresAvaliados.find(t => (t.time || '').toLowerCase() === 'mandante' || (t.lado || '').toLowerCase() === 'mandante')
      coachV = report.treinadoresAvaliados.find(t => (t.time || '').toLowerCase() === 'visitante' || (t.lado || '').toLowerCase() === 'visitante')
      if (!coachM && !coachV && report.treinadoresAvaliados[0]) {
        coachM = report.treinadoresAvaliados[0]
        if (report.treinadoresAvaliados[1]) coachV = report.treinadoresAvaliados[1]
      }
    } else if (report.treinadorAvaliado && report.treinadorAvaliado.nome) {
      coachM = report.treinadorAvaliado
    }

    const finalM = {
      nome: coachM?.nome || report.mandante?.treinador || report.treinadorMandante || report.mandante?.nomeTreinador || 'Não informado',
      esquema: coachM?.esquema || report.mandante?.esquema || report.esquemaMandante || '4-3-3',
      nota: (coachM?.nota !== undefined && coachM?.nota !== null && coachM?.nota !== '') ? coachM.nota : (report.mandante?.notaTreinador ?? null),
      comentario: coachM?.comentario || coachM?.observacoes || report.mandante?.parecerTreinador || coachM?.parecer || '',
      timeNome: homeTeamName
    }

    const finalV = {
      nome: coachV?.nome || report.visitante?.treinador || report.treinadorVisitante || report.visitante?.nomeTreinador || 'Não informado',
      esquema: coachV?.esquema || report.visitante?.esquema || report.esquemaVisitante || '4-2-3-1',
      nota: (coachV?.nota !== undefined && coachV?.nota !== null && coachV?.nota !== '') ? coachV.nota : (report.visitante?.notaTreinador ?? null),
      comentario: coachV?.comentario || coachV?.observacoes || report.visitante?.parecerTreinador || coachV?.parecer || '',
      timeNome: awayTeamName
    }

    return { coachM: finalM, coachV: finalV }
  }

  const filteredReports = useMemo(() => {
    return (matchReports || []).filter(report => {
      if (!report) return false
      // 1. Filtro por Ano
      if (yearFilter !== 'ALL') {
        const reportYear = report.data ? report.data.substring(0, 4) : ''
        if (reportYear !== yearFilter) return false
      }

      // 2. Filtro por Competição
      if (competitionFilter !== 'ALL' && report.competicao !== competitionFilter) {
        return false
      }

      // 3. Busca textual
      if (search.trim()) {
        const s = search.toLowerCase()
        const matchPartida = (report.partida || '').toLowerCase().includes(s)
        const matchLocal = (report.local || '').toLowerCase().includes(s)
        const coachesList = getReportCoaches(report)
        const matchCoach = coachesList.some(c => (c?.nome || '').toLowerCase().includes(s))
        const matchAtleta = (report.atletasAvaliados || []).some(a => (a?.nome || '').toLowerCase().includes(s))
        if (!matchPartida && !matchLocal && !matchCoach && !matchAtleta) {
          return false
        }
      }

      return true
    })
  }, [matchReports, yearFilter, competitionFilter, search])

  const toggleExpand = (id) => {
    setExpandedReportId(prev => (prev === id ? null : id))
  }

  // 1. Tratamento e Normalização Numérica da Nota (0, null, "", "—" -> null)
  const parseNotaNum = (val) => {
    if (val === null || val === undefined || val === '' || val === '—' || val === '-' || val === '--') return null
    const clean = typeof val === 'string' ? val.replace(',', '.').trim() : val
    const num = Number(clean)
    if (isNaN(num) || num <= 0) return null
    return num
  }

  // 2. Escala de Cores Dinâmica
  // >= 7.5: Esmeralda suave com texto verde vivo
  // >= 6.5 e < 7.5: Âmbar suave com texto amarelo/dourado
  // > 0 e < 6.5: Vermelho/coral suave com texto vermelho claro
  // Nulo / 0: Estilo neutro / apagado
  const getNotaBadgeClass = (nota) => {
    const num = parseNotaNum(nota)
    if (num === null) {
      return 'bg-slate-800/40 text-slate-500 border-slate-700/40'
    }
    if (num >= 7.5) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    }
    if (num >= 6.5) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    }
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30'
  }

  const formatShortPos = (pos) => {
    if (!pos) return 'MÉD'
    const p = pos.toUpperCase()
    if (p.includes('GOL')) return 'GOL'
    if (p.includes('CANHOTO')) return 'ZAG (C)'
    if (p.includes('ZAG')) return 'ZAG'
    if (p.includes('LAT') && p.includes('D')) return 'LD'
    if (p.includes('LAT') && p.includes('E')) return 'LE'
    if (p.includes('VOL') || p.includes('1º')) return 'VOL'
    if (p.includes('CENTRAL')) return 'MC'
    if (p.includes('MEIA')) return 'MEI'
    if (p.includes('EXT') || p.includes('PONTA')) return 'EXT'
    if (p.includes('CENTROAVANTE') || p.includes('ATA')) return 'CA'
    return pos.substring(0, 4).toUpperCase()
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
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide">
                  Relatórios de Jogo <span className="text-slate-600">|</span> <span className="text-emerald-400">Análise de Partidas</span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Observações táticas in loco, notas técnicas e avaliações individuais
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#121c2d] border border-slate-700/80 rounded-lg px-3 py-1 text-center min-w-[75px]">
              <div className="text-base font-extrabold text-white leading-tight">
                {(matchReports || []).length}
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider">
                PARTIDAS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BARRA DE FILTROS & AÇÕES */}
      <section className="max-w-[1720px] mx-auto px-6 pt-5 pb-3">
        <div className="bg-[#0b111c] border border-slate-800/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Lado Esquerdo: Busca e Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por partida, estádio, técnico ou atleta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#121d30] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 w-64 md:w-72"
              />
            </div>

            <div className="hidden sm:block h-5 w-px bg-slate-800"></div>

            {/* FILTRO 1: ANO */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                Ano:
              </span>
              <div className="flex items-center gap-1 bg-[#121d30] p-0.5 rounded-lg border border-slate-700/70">
                <button
                  onClick={() => handleYearChange('ALL')}
                  className={'px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ' + (
                    yearFilter === 'ALL'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Todos
                </button>
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => handleYearChange(yr)}
                    className={'px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ' + (
                      yearFilter === yr
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:block h-5 w-px bg-slate-800"></div>

            {/* FILTRO 2: COMPETIÇÃO */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-slate-500" />
                Competição:
              </span>
              <select
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
                className="bg-[#121d30] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 cursor-pointer font-medium"
              >
                <option value="ALL">Todas as Competições ({availableCompetitions.length})</option>
                {availableCompetitions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lado Direito: Contador e Botões */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-medium">
              <strong className="text-emerald-400 font-bold">{filteredReports.length}</strong> {filteredReports.length === 1 ? 'partida encontrada' : 'partidas encontradas'}
            </div>

            <button
              onClick={() => setIsQuickModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>⚡ Relatório Express</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Relatório</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. LISTAGEM DE PARTIDAS EM CARDS ESTRUTURADOS COM ALTO CONTRASTE */}
      <main className="max-w-[1720px] mx-auto px-6 space-y-6">
        {filteredReports.length === 0 ? (
          <div className="bg-[#0b111c] border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
            Nenhum relatório de jogo encontrado com os filtros atuais.
          </div>
        ) : (
          filteredReports.map((report) => {
            if (!report) return null
            // 1. Extração de Clubes e Placar
            const [mNamePartida, vNamePartida] = (report.partida || '').split(' x ').map(s => s.trim())
            const homeTeamName = report.mandante?.nome || report.homeTeam || mNamePartida || 'Mandante'
            const awayTeamName = report.visitante?.nome || report.awayTeam || vNamePartida || 'Visitante'

            let placarText = null
            if (report.placarObj && (report.placarObj.mandante !== undefined || report.placarObj.visitante !== undefined)) {
              placarText = `${report.placarObj.mandante ?? '-'} x ${report.placarObj.visitante ?? '-'}`
            } else if (report.homeScore !== undefined && report.awayScore !== undefined) {
              placarText = `${report.homeScore} x ${report.awayScore}`
            } else if (typeof report.placar === 'string' && report.placar.includes('x')) {
              placarText = report.placar
            }

            // 2. Extração Unificada de Treinadores
            const { coachM, coachV } = getUnifiedCoaches(report, homeTeamName, awayTeamName)

            // 3. Extração de Atletas e Destaques Gerais da Partida
            const allAthletes = report.atletasAvaliados || report.lineup || report.atletas || []
            const destaques = allAthletes.filter(a => {
              return a?.destaque === true || a?.destaquePositivo === true || a?.tipoDestaque === 'positivo' || a?.isHighlight === true
            })

            return (
              <div
                key={report.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-emerald-500/25 border-l-4 border-l-emerald-500 rounded-2xl overflow-hidden shadow-lg shadow-emerald-950/20 transition-all mb-6 p-5 space-y-4"
              >
                {/* 1. CABEÇALHO DO CARD (FUNDO SÓLIDO ESCURO E ALTO CONTRASTE) */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider shadow-xs">
                      {report.competicao || 'Torneio'}
                    </span>
                    
                    <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2.5">
                      <span>{report.partida || `${homeTeamName} x ${awayTeamName}`}</span>
                      
                      {/* DESTAQUE DO PLACAR OFICIAL */}
                      {placarText && (
                        <span className="font-black text-base text-white tracking-widest px-3 py-0.5 bg-slate-800/90 rounded-md border border-slate-700 shadow-inner font-mono">
                          {placarText}
                        </span>
                      )}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {report.data || 'Data não informada'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {report.local || 'Local não informado'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        {allAthletes.length} atletas
                      </span>
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div className="flex items-center gap-2">
                    {/* Botão de Visualização Panorâmica & PDF */}
                    <button
                      onClick={() => handleOpenViewer(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                      title="Visualizar Relatório Panorâmico & Exportar PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar & PDF</span>
                    </button>

                    {/* Botão Editar */}
                    <button
                      onClick={() => handleOpenEditModal(report)}
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-colors cursor-pointer"
                      title="Editar Relatório"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {onDeleteReport && (
                      <button
                        onClick={() => handleDeleteClick(report)}
                        className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                        title="Excluir Relatório"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. BLOCO CONSOLIDADO: TREINADORES LADO A LADO COM DIFERENCIAÇÃO VISUAL & DESTAQUES */}
                <div className="space-y-3.5">
                  
                  {/* TREINADORES (CARD DUPLO LADO A LADO COM CORES DISTINTAS) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    
                    {/* Card do Técnico MANDANTE (Gradiente Esmeralda + Borda Verde) */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border border-emerald-500/20 border-l-4 border-l-emerald-500 shadow-md space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30 shadow-xs">
                                MANDANTE
                              </span>
                              <span className="font-bold text-white text-xs truncate" title={coachM.nome}>
                                {coachM.nome}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-300/80 font-semibold">
                              {homeTeamName} • <strong className="text-white">{coachM.esquema}</strong>
                            </span>
                          </div>
                        </div>

                        {coachM.nota !== null && (
                          <span className={'px-2 py-0.5 rounded-md font-extrabold text-xs border shrink-0 ' + getNotaBadgeClass(coachM.nota)}>
                            {parseNotaNum(coachM.nota) !== null ? `Nota ${parseNotaNum(coachM.nota).toFixed(1)}` : 'Nota -'}
                          </span>
                        )}
                      </div>

                      {coachM.comentario ? (
                        <p className="text-[11px] text-slate-300 italic bg-slate-950/70 p-2 rounded-lg border border-emerald-500/15 leading-relaxed">
                          "{coachM.comentario}"
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic px-1">Sem parecer tático registrado</p>
                      )}
                    </div>

                    {/* Card do Técnico VISITANTE (Gradiente Sky/Ciano + Borda Azul) */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950/40 to-slate-900/60 border border-sky-500/20 border-l-4 border-l-sky-500 shadow-md space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-xs">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-sky-300 bg-sky-500/20 px-1.5 py-0.2 rounded border border-sky-500/30 shadow-xs">
                                VISITANTE
                              </span>
                              <span className="font-bold text-white text-xs truncate" title={coachV.nome}>
                                {coachV.nome}
                              </span>
                            </div>
                            <span className="text-[10px] text-sky-300/80 font-semibold">
                              {awayTeamName} • <strong className="text-white">{coachV.esquema}</strong>
                            </span>
                          </div>
                        </div>

                        {coachV.nota !== null && (
                          <span className={'px-2 py-0.5 rounded-md font-extrabold text-xs border shrink-0 ' + getNotaBadgeClass(coachV.nota)}>
                            {parseNotaNum(coachV.nota) !== null ? `Nota ${parseNotaNum(coachV.nota).toFixed(1)}` : 'Nota -'}
                          </span>
                        )}
                      </div>

                      {coachV.comentario ? (
                        <p className="text-[11px] text-slate-300 italic bg-slate-950/70 p-2 rounded-lg border border-sky-500/15 leading-relaxed">
                          "{coachV.comentario}"
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic px-1">Sem parecer tático registrado</p>
                      )}
                    </div>

                  </div>

                  {/* FAIXA DE DESTAQUES DO JOGO (FUNDO ÂMBAR SUTIL + BADGES EM CONTRASTE) */}
                  {destaques.length > 0 && (
                    <div className="py-2 px-3 bg-amber-950/25 border border-amber-500/25 rounded-lg flex flex-wrap items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          Destaques do Jogo:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {destaques.map((d, dIdx) => {
                            const rawNota = d?.notaScout ?? d?.nota
                            const numN = parseNotaNum(rawNota)
                            const posVal = formatShortPos(d?.posicao || d?.pos)
                            return (
                              <span 
                                key={d?.idAtleta || `destaque-${dIdx}-${d?.nome}`}
                                className="bg-slate-950/80 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-bold text-xs shadow-xs"
                              >
                                <span>{d?.nome}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-200 font-black">
                                  {posVal}
                                </span>
                                {numN !== null && (
                                  <span className="text-[10px] font-black text-emerald-400 font-mono">
                                    ★ {numN.toFixed(1)}
                                  </span>
                                )}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium ml-auto">
                        {destaques.length} destaque(s) selecionado(s)
                      </span>
                    </div>
                  )}

                </div>
              </div>
            )
          })
        )}
      </main>

      {/* MODAL PANORÂMICO DE VISUALIZAÇÃO COM EXPORTAÇÃO PARA PDF */}
      {isViewerModalOpen && (
        <MatchReportViewerModal
          isOpen={isViewerModalOpen}
          onClose={() => {
            setIsViewerModalOpen(false)
            setSelectedViewerReport(null)
          }}
          report={selectedViewerReport}
        />
      )}

      {/* MODAL COMPLETO DE CRIAÇÃO / EDIÇÃO DE RELATÓRIO PÓS-JOGO PADRONIZADO */}
      {isEditModalOpen && (
        <PostMatchReportModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedReport(null)
          }}
          reportToEdit={selectedReport}
          isEditing={!!selectedReport}
          onSaveReport={handleSaveModalReport}
          onSaveSuccess={handleSaveModalReport}
          onSavePlayerToRadar={onSavePlayerToRadar}
          onDeletePlayer={onDeletePlayer}
          onSaveCoach={onSaveCoach}
          onDeleteCoach={onDeleteCoach}
          existingCoaches={coaches || []}
          existingPlayers={players || []}
        />
      )}

      {/* MODAL EXPRESS DE CAMPO */}
      {isQuickModalOpen && (
        <QuickMatchReportModal
          isOpen={isQuickModalOpen}
          onClose={() => setIsQuickModalOpen(false)}
          onSaveQuickReport={handleSaveQuickReport}
          players={players || []}
          coaches={coaches || []}
        />
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE RELATÓRIO */}
      <ConfirmDeleteModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={
          reportToDelete ? (
            <>
              Tem certeza que deseja apagar o relatório da partida{' '}
              <strong className="text-white font-bold">{reportToDelete.partida}</strong>?{' '}
              Esta ação não poderá ser desfeita.
            </>
          ) : null
        }
      />
    </div>
  )
}
