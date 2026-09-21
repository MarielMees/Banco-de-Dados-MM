import React, { useRef, useState } from 'react'
import { 
  X, 
  Download, 
  Trophy, 
  Calendar, 
  MapPin, 
  Star, 
  Shield, 
  UserCheck, 
  Activity, 
  FileText,
  Sparkles,
  Users,
  CheckCircle2,
  Loader2,
  TrendingDown,
  Printer
} from 'lucide-react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export default function MatchReportViewerModal({
  isOpen,
  onClose,
  report = null
}) {
  const reportRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  if (!isOpen) return null

  if (!report) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md text-center">
          <p className="text-slate-300 font-bold mb-4">Relatório não encontrado ou dados indisponíveis.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  // 1. Extração e Normalização Defensiva de Nomes e Placar
  const [mNamePartida, vNamePartida] = (report?.partida || '').split(' x ').map(s => s.trim())
  const homeTeamName = report?.mandante?.nome || report?.homeTeam || report?.home_team || mNamePartida || 'Mandante'
  const awayTeamName = report?.visitante?.nome || report?.awayTeam || report?.away_team || vNamePartida || 'Visitante'

  let homeScore = '-'
  let awayScore = '-'
  if (report?.placarObj) {
    homeScore = report.placarObj.mandante ?? '-'
    awayScore = report.placarObj.visitante ?? '-'
  } else if (report?.homeScore !== undefined && report?.awayScore !== undefined) {
    homeScore = report.homeScore
    awayScore = report.awayScore
  } else if (typeof report?.placar === 'string' && report.placar.includes('x')) {
    const parts = report.placar.split('x').map(s => s.trim())
    homeScore = parts[0]
    awayScore = parts[1]
  }

  const homeLogo = report?.homeTeamBadge || report?.homeLogo || report?.mandanteLogo || report?.mandante?.logo || null
  const awayLogo = report?.awayTeamBadge || report?.awayLogo || report?.visitanteLogo || report?.visitante?.logo || null

  const getInitials = (name) => {
    if (!name) return 'FC'
    return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 3).join('').toUpperCase()
  }

  // 2. Treinadores
  let coachMandante = null
  let coachVisitante = null
  if (report?.treinadoresAvaliados && Array.isArray(report.treinadoresAvaliados)) {
    coachMandante = report.treinadoresAvaliados.find(t => t?.time === 'mandante' || t?.lado === 'mandante')
    coachVisitante = report.treinadoresAvaliados.find(t => t?.time === 'visitante' || t?.lado === 'visitante')
    if (!coachMandante && !coachVisitante && report.treinadoresAvaliados.length > 0) {
      coachMandante = report.treinadoresAvaliados[0]
    }
  } else if (report?.treinadorAvaliado) {
    coachMandante = report.treinadorAvaliado
  }

  // 3. Atletas (Blindagem Total e Fallback para Todos os Formatos de Dados)
  const homeTeamLower = (homeTeamName || '').toLowerCase().trim()
  const awayTeamLower = (awayTeamName || '').toLowerCase().trim()

  const directHomeLineup = Array.isArray(report?.home_lineup) ? report.home_lineup : (Array.isArray(report?.homeTeam?.lineup) ? report.homeTeam.lineup : (Array.isArray(report?.escalacaoMandante) ? report.escalacaoMandante : (Array.isArray(report?.titularesMandante) ? report.titularesMandante : [])))
  const directAwayLineup = Array.isArray(report?.away_lineup) ? report.away_lineup : (Array.isArray(report?.awayTeam?.lineup) ? report.awayTeam.lineup : (Array.isArray(report?.escalacaoVisitante) ? report.escalacaoVisitante : (Array.isArray(report?.titularesVisitante) ? report.titularesVisitante : [])))
  const directHomeSubs = Array.isArray(report?.home_substitutes) ? report.home_substitutes : (Array.isArray(report?.homeTeam?.substitutes) ? report.homeTeam.substitutes : (Array.isArray(report?.reservasMandante) ? report.reservasMandante : []))
  const directAwaySubs = Array.isArray(report?.away_substitutes) ? report.away_substitutes : (Array.isArray(report?.awayTeam?.substitutes) ? report.awayTeam.substitutes : (Array.isArray(report?.reservasVisitante) ? report.reservasVisitante : []))

  const allAthletes = Array.isArray(report?.atletasAvaliados) 
    ? report.atletasAvaliados 
    : (Array.isArray(report?.lineup) ? report.lineup : (Array.isArray(report?.atletas) ? report.atletas : []))

  let rawHomeAthletes = []
  let rawAwayAthletes = []

  if (directHomeLineup.length > 0 || directHomeSubs.length > 0) {
    rawHomeAthletes = [...directHomeLineup, ...directHomeSubs]
  } else {
    rawHomeAthletes = allAthletes.filter(a => {
      if (!a) return false
      const aTime = (a.time || a.lado || a.ca || a.team || '').toLowerCase().trim()
      return aTime === 'mandante' || aTime === 'home' || (homeTeamLower && aTime === homeTeamLower) || a.lado === 'mandante'
    })
  }

  if (directAwayLineup.length > 0 || directAwaySubs.length > 0) {
    rawAwayAthletes = [...directAwayLineup, ...directAwaySubs]
  } else {
    rawAwayAthletes = allAthletes.filter(a => {
      if (!a) return false
      const aTime = (a.time || a.lado || a.ca || a.team || '').toLowerCase().trim()
      return aTime === 'visitante' || aTime === 'away' || (awayTeamLower && aTime === awayTeamLower) || a.lado === 'visitante'
    })
  }

  // Fallbacks seguros se a lista geral não tiver lado explícito
  if (rawHomeAthletes.length === 0 && rawAwayAthletes.length === 0 && allAthletes.length > 0) {
    const mid = Math.ceil(allAthletes.length / 2)
    rawHomeAthletes = allAthletes.slice(0, mid)
    rawAwayAthletes = allAthletes.slice(mid)
  } else if (rawHomeAthletes.length > 0 && rawAwayAthletes.length === 0 && allAthletes.length > rawHomeAthletes.length) {
    rawAwayAthletes = allAthletes.filter(a => !rawHomeAthletes.includes(a))
  } else if (rawHomeAthletes.length === 0 && rawAwayAthletes.length > 0 && allAthletes.length > rawAwayAthletes.length) {
    rawHomeAthletes = allAthletes.filter(a => !rawAwayAthletes.includes(a))
  }

  // Particionamento Seguro (Titulares vs Entraram no Jogo)
  const partitionTeamAthletes = (list) => {
    if (!Array.isArray(list) || list.length === 0) return { titulares: [], reservas: [] }

    const safeList = list.filter(Boolean)

    // Titulares: marcados explicitamente ou primeiros 11
    let explicitTitulares = safeList.filter(a => a?.status === 'titular' || a?.isTitular === true || a?.tipo === 'titular' || a?.starter === true)
    let explicitOutros = safeList.filter(a => !(a?.status === 'titular' || a?.isTitular === true || a?.tipo === 'titular' || a?.starter === true))

    let titulares = []
    let outros = []

    if (explicitTitulares.length > 0) {
      titulares = explicitTitulares.slice(0, 11)
      outros = [...explicitTitulares.slice(11), ...explicitOutros]
    } else {
      titulares = safeList.slice(0, 11)
      outros = safeList.slice(11)
    }

    // Filtrar apenas substitutos que entraram / atuaram (descartando quem não atuou)
    const reservasAtuaram = outros.filter(a => {
      if (!a) return false
      const isExplicitNaoAtuou = a.status === 'nao_atuou' || a.naoAtuou === true || a.status === 'banco_nao_utilizado'
      if (isExplicitNaoAtuou) return false

      const hasMinutos = (a.minutosJogados && Number(a.minutosJogados) > 0) || 
                         (a.minutos && Number(a.minutos) > 0) || 
                         (a.minutes && Number(a.minutes) > 0) ||
                         Boolean(a.minutoEntrada) || Boolean(a.min)
      const hasNota = parseNotaNum(a.nota) !== null || 
                      parseNotaNum(a.notaScout) !== null || 
                      parseNotaNum(a.notaApi) !== null || 
                      parseNotaNum(a.apiRating) !== null ||
                      parseNotaNum(a.rating) !== null ||
                      parseNotaNum(a.scout_rating) !== null
      const hasDestaque = Boolean(a.destaquePositivo || a.destaqueNegativo || a.observacoes)
      const isSub = a.status === 'reserva_utilizado' || a.status === 'substituto' || a.entrou === true || a.substituicao === true || a.substitute === true

      return Boolean(isSub || hasMinutos || hasNota || hasDestaque)
    })

    return {
      titulares: titulares.slice(0, 11),
      reservas: reservasAtuaram.slice(0, 5) // Até 5 substituições
    }
  }

  // 4. Estatísticas da Partida (com suporte completo a xG)
  const stats = report?.estatisticas || report?.stats || null
  const statsMandante = stats?.mandante || stats?.home || {}
  const statsVisitante = stats?.visitante || stats?.away || {}

  const hasStats = Boolean(
    statsMandante?.posse || statsVisitante?.posse ||
    statsMandante?.xg || statsVisitante?.xg || statsMandante?.xG || statsVisitante?.xG ||
    statsMandante?.finalizacoes || statsVisitante?.finalizacoes ||
    statsMandante?.faltas || statsVisitante?.faltas ||
    statsMandante?.escanteios || statsVisitante?.escanteios
  )

  const formatStatVal = (val, suffix = '', fallback = '-') => {
    if (val === undefined || val === null || val === '') return fallback
    return `${val}${suffix}`
  }

  // 5. Tratamento de Valores Nulos / Zero e Escala de Cores Dinâmica
  const parseNotaNum = (val) => {
    if (val === null || val === undefined || val === '' || val === '—' || val === '-' || val === '--') return null
    const clean = typeof val === 'string' ? val.replace(',', '.').trim() : val
    const num = Number(clean)
    if (isNaN(num) || num <= 0) return null
    return num
  }

  const getNotaBadgeClass = (nota) => {
    const num = parseNotaNum(nota)
    if (num === null) {
      return 'bg-slate-800/40 text-slate-500 border-slate-700/40 font-mono'
    }
    if (num >= 7.5) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
    }
    if (num >= 6.5) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold'
    }
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold'
  }

  const homeAthletesData = partitionTeamAthletes(rawHomeAthletes)
  const awayAthletesData = partitionTeamAthletes(rawAwayAthletes)

  // Rotina de Exportação para PDF Oficial A4 Paisagem (Landscape)
  const handleExportPDF = async () => {
    if (!reportRef.current || isExporting) return
    setIsExporting(true)

    try {
      const dataUrl = await toPng(reportRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: '#090e18'
      })

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = 297
      const pdfHeight = 210

      const imgProps = pdf.getImageProperties(dataUrl)
      let renderWidth = pdfWidth
      let renderHeight = (imgProps.height * pdfWidth) / imgProps.width

      // Se exceder a altura da folha paisagem, redimensiona proporcionalmente para caber perfeitamente
      if (renderHeight > pdfHeight) {
        renderHeight = pdfHeight
        renderWidth = (imgProps.width * pdfHeight) / imgProps.height
      }

      const xPos = Math.max(0, (pdfWidth - renderWidth) / 2)
      const yPos = Math.max(0, (pdfHeight - renderHeight) / 2)

      pdf.addImage(dataUrl, 'PNG', xPos, yPos, renderWidth, renderHeight)

      const cleanHome = (homeTeamName || 'Mandante').replace(/[^a-zA-Z0-9]/g, '_')
      const cleanAway = (awayTeamName || 'Visitante').replace(/[^a-zA-Z0-9]/g, '_')
      const cleanDate = (report?.data || '2026').replace(/[^a-zA-Z0-9]/g, '-')
      const fileName = `Relatorio_Scout_Paisagem_${cleanHome}_x_${cleanAway}_${cleanDate}.pdf`

      pdf.save(fileName)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 4000)
    } catch (err) {
      console.error('Erro ao gerar PDF do relatório em paisagem:', err)
      alert('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Renderizador de Linha de Atleta com Notas API e SCOUT (Ultra-compacto e Blindado)
  const renderAthleteRow = (atleta, idx, isSub = false) => {
    if (!atleta) return null

    const rawApiRating = atleta?.notaApi ?? atleta?.apiRating ?? atleta?.rating ?? atleta?.nota_api ?? null
    const numApi = parseNotaNum(rawApiRating)
    const apiText = numApi !== null ? `API: ${numApi.toFixed(1)}` : 'API: -'
    const apiClass = getNotaBadgeClass(numApi)

    const rawScoutNote = (atleta?.notaScout !== undefined && atleta?.notaScout !== null && atleta?.notaScout !== '')
      ? atleta.notaScout
      : (atleta?.nota ?? atleta?.scout_rating ?? atleta?.scoutNote ?? null)
    const numScout = parseNotaNum(rawScoutNote)
    const scoutText = numScout !== null ? `SCOUT: ${numScout.toFixed(1)}` : 'SCOUT: -'
    const scoutClass = getNotaBadgeClass(numScout)

    const minEntrada = atleta?.minutoEntrada || atleta?.minutos || atleta?.minutosJogados || atleta?.min || atleta?.minutes || null
    const playerNum = atleta?.numero || atleta?.camisa || atleta?.number || `${idx + 1}`
    const playerName = atleta?.nome || atleta?.name || atleta?.apelido || 'Atleta'

    return (
      <div 
        key={atleta?.id || atleta?.athlete_id || `${isSub ? 'sub' : 'tit'}-${idx}`}
        className="flex items-center justify-between px-1.5 py-[2px] rounded bg-slate-950/70 border border-slate-800/60 text-[10px] hover:border-slate-700 transition-colors h-[21px] max-h-[21px] leading-tight"
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {isSub ? (
            <span className="text-[7.5px] font-mono font-black text-emerald-400 shrink-0" title={minEntrada ? `Entrou aos ${minEntrada}'` : 'Entrou no jogo'}>
              🔄{minEntrada ? `${minEntrada}'` : ''}
            </span>
          ) : (
            <span className="text-[8px] font-mono font-black text-slate-400 w-3.5 text-center shrink-0">
              {playerNum}
            </span>
          )}
          
          <span className="text-[10px] font-medium text-slate-200 truncate flex-1 min-w-0 leading-tight" title={playerName}>
            {playerName}
          </span>

          {atleta?.destaquePositivo && (
            <span className="text-[6.5px] px-0.8 py-0 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0 leading-none">
              ★
            </span>
          )}
          {atleta?.destaqueNegativo && (
            <span className="text-[6.5px] px-0.8 py-0 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 shrink-0 leading-none">
              ▼
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {/* Badge Nota API */}
          <span className={`text-[8.5px] font-mono px-1 py-0 rounded border leading-tight ${apiClass}`}>
            {apiText}
          </span>

          {/* Badge Nota Scout */}
          <span className={`text-[8.5px] px-1 py-0 rounded border shadow-xs leading-tight ${scoutClass}`}>
            {scoutText}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-[1180px] shadow-2xl flex flex-col overflow-hidden my-auto max-h-[96vh]">
        
        {/* BARRA SUPERIOR FIXA / HEADER DO MODAL (Não impresso) */}
        <div className="px-4 py-2 border-b border-slate-800/90 bg-[#080d17] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                <span>Relatório Executivo Pós-Jogo</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-extrabold">{report.competicao || 'Oficial'}</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  A4 Paisagem (1 Página)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {exportSuccess && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> PDF Gerado!
              </span>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-700"
              title="Imprimir / Salvar via navegador"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Exportar documento PDF em A4 Paisagem"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>📥 Baixar PDF A4</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer ml-1"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ÁREA DE RENDERIZAÇÃO DO RELATÓRIO A4 PAISAGEM (CAPTURADA PELO PDF) */}
        <div className="p-2 sm:p-4 overflow-y-auto flex-1 bg-[#090e18] flex justify-center items-start">
          <div 
            ref={reportRef} 
            className="folha-a4-relatorio w-full max-w-[1080px] bg-[#090e18] text-slate-100 flex flex-col justify-between border border-slate-800/80 shadow-2xl font-sans box-border overflow-hidden"
            style={{ 
              width: '297mm',
              maxWidth: '100%',
              minHeight: '210mm',
              maxHeight: '210mm',
              padding: '8mm 12mm',
              margin: '0 auto',
              boxSizing: 'border-box'
            }}
          >
            
            {/* 1. HEADER: PLACAR, ESCUDOS, ESQUEMAS E INFOS DA PARTIDA (100% VISÍVEL, MT-0, PT-2) */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0d1627] via-[#09101d] to-[#0d1627] border border-slate-800/90 px-3 py-2 shadow-sm w-full box-border mt-0">
              <div className="flex items-center justify-between gap-3 w-full">
                
                {/* MANDANTE (LADO ESQUERDO) */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow shrink-0">
                    {homeLogo ? (
                      <img src={homeLogo} alt={homeTeamName} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="font-black text-xs text-emerald-400">{getInitials(homeTeamName)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider block">MANDANTE</span>
                    <h3 className="text-sm font-black text-white truncate leading-tight">{homeTeamName}</h3>
                    <span className="text-[9px] text-slate-400 font-semibold">{report?.mandante?.esquema || report?.esquemaMandante || '4-3-3'}</span>
                  </div>
                </div>

                {/* CENTRO: PLACAR & BADGE */}
                <div className="flex flex-col items-center justify-center px-2 shrink-0">
                  <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase bg-slate-800/80 px-2 py-0.2 rounded-full border border-slate-700/60 mb-0.5">
                    {report?.competicao || 'SÚMULA OFICIAL'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tight">{homeScore}</span>
                    <span className="text-xs font-bold text-slate-500">✕</span>
                    <span className="text-2xl font-black text-white tracking-tight">{awayScore}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] text-slate-400 mt-0.5 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5 text-emerald-400" /> {report?.data || 'Hoje'}</span>
                    {report?.estadio && (
                      <span className="flex items-center gap-1 truncate max-w-[180px]"><MapPin className="w-2.5 h-2.5 text-teal-400" /> {report.estadio}</span>
                    )}
                  </div>
                </div>

                {/* VISITANTE (LADO DIREITO) */}
                <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
                  <div className="min-w-0">
                    <span className="text-[8px] font-black uppercase text-teal-400 tracking-wider block">VISITANTE</span>
                    <h3 className="text-sm font-black text-white truncate leading-tight">{awayTeamName}</h3>
                    <span className="text-[9px] text-slate-400 font-semibold">{report?.visitante?.esquema || report?.esquemaVisitante || '4-2-3-1'}</span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow shrink-0">
                    {awayLogo ? (
                      <img src={awayLogo} alt={awayTeamName} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="font-black text-xs text-teal-400">{getInitials(awayTeamName)}</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 2. ESTATÍSTICAS COLETIVAS (5 COLUNAS EM UMA LINHA COM xG - COMPACTO) */}
            <div className="rounded-lg bg-slate-900/90 border border-slate-800/80 px-2 py-1 my-0.5 w-full box-border text-[11px]">
              <div className="flex items-center justify-between mb-0.5 px-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-emerald-400" /> Estatísticas Coletivas ({homeTeamName} vs {awayTeamName})
                </span>
                <span className="text-[8px] font-bold text-slate-500">M vs V</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 w-full">
                {/* 1. Posse de Bola */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded p-1 text-center">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight block">Posse de Bola</span>
                  <div className="text-[11px] font-black text-white mt-0.5">
                    <span className="text-emerald-400">{formatStatVal(statsMandante.posse, '%', '50%')}</span>
                    <span className="text-slate-600 text-[8.5px] mx-1">vs</span>
                    <span className="text-teal-400">{formatStatVal(statsVisitante.posse, '%', '50%')}</span>
                  </div>
                </div>

                {/* 2. xG (Gols Esperados) */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded p-1 text-center">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight block">xG (Gols Esp.)</span>
                  <div className="text-[11px] font-black text-white mt-0.5">
                    <span className="text-emerald-400">{formatStatVal(statsMandante.xg || statsMandante.xG, '', '1.20')}</span>
                    <span className="text-slate-600 text-[8.5px] mx-1">vs</span>
                    <span className="text-teal-400">{formatStatVal(statsVisitante.xg || statsVisitante.xG, '', '0.85')}</span>
                  </div>
                </div>

                {/* 3. Finalizações (no alvo) */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded p-1 text-center">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight block">Finalizações (Alvo)</span>
                  <div className="text-[11px] font-black text-white mt-0.5">
                    <span className="text-emerald-400">
                      {formatStatVal(statsMandante.finalizacoes || statsMandante.finalizacoesTotal, '', '12')}
                      <span className="text-[8px] text-slate-400 ml-0.5">({formatStatVal(statsMandante.finalizacoesNoAlvo, '', '5')})</span>
                    </span>
                    <span className="text-slate-600 text-[8.5px] mx-1">vs</span>
                    <span className="text-teal-400">
                      {formatStatVal(statsVisitante.finalizacoes || statsVisitante.finalizacoesTotal, '', '8')}
                      <span className="text-[8px] text-slate-400 ml-0.5">({formatStatVal(statsVisitante.finalizacoesNoAlvo, '', '3')})</span>
                    </span>
                  </div>
                </div>

                {/* 4. Faltas Cometidas */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded p-1 text-center">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight block">Faltas</span>
                  <div className="text-[11px] font-black text-white mt-0.5">
                    <span className="text-emerald-400">{formatStatVal(statsMandante.faltas, '', '14')}</span>
                    <span className="text-slate-600 text-[8.5px] mx-1">vs</span>
                    <span className="text-teal-400">{formatStatVal(statsVisitante.faltas, '', '16')}</span>
                  </div>
                </div>

                {/* 5. Escanteios */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded p-1 text-center">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tight block">Escanteios</span>
                  <div className="text-[11px] font-black text-white mt-0.5">
                    <span className="text-emerald-400">{formatStatVal(statsMandante.escanteios, '', '6')}</span>
                    <span className="text-slate-600 text-[8.5px] mx-1">vs</span>
                    <span className="text-teal-400">{formatStatVal(statsVisitante.escanteios, '', '4')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TREINADORES (LADO A LADO - COMPACTO) */}
            {(coachMandante || coachVisitante) && (
              <div className="grid grid-cols-2 gap-2 my-0.5 w-full box-border text-[11px]">
                {/* Treinador Mandante */}
                <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 px-2.5 py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-[10.5px] font-bold text-white truncate">
                        {coachMandante?.nome || 'Técnico Mandante'}
                      </span>
                    </div>
                    {coachMandante?.nota !== undefined && (
                      <span className={`text-[8.5px] font-black px-1.5 py-0 rounded border ${getNotaBadgeClass(coachMandante.nota)}`}>
                        {parseNotaNum(coachMandante.nota) !== null ? `Nota ${parseNotaNum(coachMandante.nota).toFixed(1)}` : 'Nota -'}
                      </span>
                    )}
                  </div>
                  {coachMandante?.comentario && (
                    <p className="text-[8.5px] text-slate-300 mt-0.5 line-clamp-1 italic bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/50">
                      "{coachMandante.comentario}"
                    </p>
                  )}
                </div>

                {/* Treinador Visitante */}
                <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 px-2.5 py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <UserCheck className="w-3 h-3 text-teal-400 shrink-0" />
                      <span className="text-[10.5px] font-bold text-white truncate">
                        {coachVisitante?.nome || 'Técnico Visitante'}
                      </span>
                    </div>
                    {coachVisitante?.nota !== undefined && (
                      <span className={`text-[8.5px] font-black px-1.5 py-0 rounded border ${getNotaBadgeClass(coachVisitante.nota)}`}>
                        {parseNotaNum(coachVisitante.nota) !== null ? `Nota ${parseNotaNum(coachVisitante.nota).toFixed(1)}` : 'Nota -'}
                      </span>
                    )}
                  </div>
                  {coachVisitante?.comentario && (
                    <p className="text-[8.5px] text-slate-300 mt-0.5 line-clamp-1 italic bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/50">
                      "{coachVisitante.comentario}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 4. ATLETAS EM DUAS COLUNAS COM SUB-COLUNAS (TITULARES vs SUBSTITUIÇÕES) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 my-0.5 w-full box-border">
              
              {/* COLUNA MANDANTE */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-0.5 mb-1 border-b border-slate-800">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" /> {homeTeamName}
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase">
                      {homeAthletesData?.titulares?.length || 0} Titulares • {homeAthletesData?.reservas?.length || 0} Substituições
                    </span>
                  </div>

                  {/* SUB-COLUNAS: TITULARES (~60%) vs SUBSTITUIÇÕES (~40%) */}
                  <div className="grid grid-cols-12 gap-1.5 items-start">
                    
                    {/* Sub-coluna 1: Titulares */}
                    <div className="col-span-7 space-y-[2px]">
                      <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider px-0.5 pb-0.5 border-b border-slate-800/50 flex items-center justify-between">
                        <span>Titulares</span>
                        <span className="text-slate-500">API • SCOUT</span>
                      </div>
                      {(!homeAthletesData?.titulares || homeAthletesData.titulares.length === 0) ? (
                        <p className="text-[8px] text-slate-500 italic py-1 text-center">Nenhum titular registrado</p>
                      ) : (
                        homeAthletesData.titulares.map((atleta, idx) => renderAthleteRow(atleta, idx, false))
                      )}
                    </div>

                    {/* Sub-coluna 2: Entraram no Jogo */}
                    <div className="col-span-5 space-y-[2px] border-l border-slate-800/70 pl-1.5">
                      <div className="text-[7.5px] font-black text-emerald-400/90 uppercase tracking-wider px-0.5 pb-0.5 border-b border-slate-800/50 flex items-center justify-between">
                        <span>Entraram (🔄)</span>
                        <span className="text-slate-500">NOTAS</span>
                      </div>
                      {(!homeAthletesData?.reservas || homeAthletesData.reservas.length === 0) ? (
                        <div className="py-2 text-center text-[8px] text-slate-500 italic bg-slate-950/40 rounded border border-slate-800/40">
                          Sem substituições
                        </div>
                      ) : (
                        homeAthletesData.reservas.map((atleta, idx) => renderAthleteRow(atleta, idx, true))
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* COLUNA VISITANTE */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-0.5 mb-1 border-b border-slate-800">
                    <span className="text-[9px] font-black text-teal-400 uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" /> {awayTeamName}
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase">
                      {awayAthletesData?.titulares?.length || 0} Titulares • {awayAthletesData?.reservas?.length || 0} Substituições
                    </span>
                  </div>

                  {/* SUB-COLUNAS: TITULARES (~60%) vs SUBSTITUIÇÕES (~40%) */}
                  <div className="grid grid-cols-12 gap-1.5 items-start">
                    
                    {/* Sub-coluna 1: Titulares */}
                    <div className="col-span-7 space-y-[2px]">
                      <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider px-0.5 pb-0.5 border-b border-slate-800/50 flex items-center justify-between">
                        <span>Titulares</span>
                        <span className="text-slate-500">API • SCOUT</span>
                      </div>
                      {(!awayAthletesData?.titulares || awayAthletesData.titulares.length === 0) ? (
                        <p className="text-[8px] text-slate-500 italic py-1 text-center">Nenhum titular registrado</p>
                      ) : (
                        awayAthletesData.titulares.map((atleta, idx) => renderAthleteRow(atleta, idx, false))
                      )}
                    </div>

                    {/* Sub-coluna 2: Entraram no Jogo */}
                    <div className="col-span-5 space-y-[2px] border-l border-slate-800/70 pl-1.5">
                      <div className="text-[7.5px] font-black text-teal-400/90 uppercase tracking-wider px-0.5 pb-0.5 border-b border-slate-800/50 flex items-center justify-between">
                        <span>Entraram (🔄)</span>
                        <span className="text-slate-500">NOTAS</span>
                      </div>
                      {(!awayAthletesData?.reservas || awayAthletesData.reservas.length === 0) ? (
                        <div className="py-2 text-center text-[8px] text-slate-500 italic bg-slate-950/40 rounded border border-slate-800/40">
                          Sem substituições
                        </div>
                      ) : (
                        awayAthletesData.reservas.map((atleta, idx) => renderAthleteRow(atleta, idx, true))
                      )}
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* 5. PARECER TÁTICO & CONCLUSÃO DO SCOUT (MT-0.5, P-1.5, 2 LINHAS VISÍVEIS) */}
            <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 px-2 py-1.5 mt-0.5 w-full box-border text-[11px] leading-snug">
              <div className="flex items-center gap-1 mb-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[9px] font-black text-white uppercase tracking-wider">
                  Parecer Tático & Síntese do Observador
                </span>
              </div>
              <p className="text-[9px] text-slate-300 leading-snug line-clamp-2 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/50">
                {report?.resumoTatico || report?.observacoes || report?.analiseGeral || report?.parecerTatico || 'Partida analisada pelo departamento de scout. Equipes demonstraram organização conforme modelo de jogo, com destaque para a intensidade nas transições e desempenho individual dos atletas monitorados.'}
              </p>
            </div>

            {/* RODAPÉ DO DOCUMENTO */}
            <div className="flex items-center justify-between text-[7.5px] text-slate-400 px-1 pt-0.5 border-t border-slate-800/60 font-mono">
              <span>RADAR DE SCOUT PROFISSIONAL • ANÁLISE OFICIAL</span>
              <span>DOCUMENTO GERADO EM A4 PAISAGEM (LANDSCAPE)</span>
            </div>

          </div>
        </div>

      </div>

      {/* ESTILOS DE IMPRESSÃO RIGOROSOS PARA A4 PAISAGEM (LANDSCAPE) */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0 !important;
            background-color: #090e18 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .folha-a4-relatorio {
            width: 297mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            min-height: 210mm !important;
            padding: 8mm 12mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </div>
  )
}
