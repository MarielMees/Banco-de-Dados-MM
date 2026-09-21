import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  Filter, 
  Loader2,
  AlertCircle,
  Database,
  ShieldCheck,
  FileCheck2,
  Trophy,
  CalendarDays,
  Plus,
  Star,
  UserCheck,
  Pencil,
  Archive,
  RotateCcw
} from 'lucide-react';
import { 
  COMPETICOES_AGENDA, 
  getStoredDatabaseMatches, 
  syncAllLeaguesDatabase, 
  syncWeeklyMatchesSerieAandB,
  matchBelongsToCompetition,
  matchesTemporalFilter,
  getDynamicDateWindow,
  FINISHED_STATUSES,
  LIVE_STATUSES,
  fetchMatchDetails,
  saveStoredDatabaseMatches,
  deduplicateMatches
} from '../services/fotmobService';
import PostMatchReportModal from './PostMatchReportModal';
import QuickMatchReportModal from './QuickMatchReportModal';
import ErrorBoundary from './ErrorBoundary';

// Helper de normalizacao defensiva para os modais de relatorio
export function normalizeMatchForScoutReport(match) {
  if (!match || typeof match !== 'object') return null;

  const timeMandante = 
    match?.mandante?.nome || 
    match?.teams?.home?.name || 
    match?.homeTeam || 
    match?.home?.name ||
    (typeof match?.mandante === 'string' && match.mandante !== 'undefined' ? match.mandante : '') || 
    'Mandante';

  const timeVisitante = 
    match?.visitante?.nome || 
    match?.teams?.away?.name || 
    match?.awayTeam || 
    match?.away?.name ||
    (typeof match?.visitante === 'string' && match.visitante !== 'undefined' ? match.visitante : '') || 
    'Visitante';

  const competicao = 
    match?.campeonato || 
    match?.campeonato_nome || 
    match?.competicao || 
    match?.league?.name || 
    match?.competition || 
    'Futebol Oficial';

  const rodada = match?.rodada || match?.round || match?.roundName || 'Rodada Oficial';
  const data = match?.data || match?.date || match?.fixture?.date?.split('T')?.[0] || match?.status?.utcTime?.split('T')?.[0] || new Date().toISOString().split('T')[0];
  const estadio = match?.estadio || match?.local || match?.fixture?.venue?.name || match?.venue || 'Estádio';

  const placarMandante = 
    match?.placar_mandante !== null && match?.placar_mandante !== undefined
      ? Number(match.placar_mandante)
      : (match?.placarMandante !== undefined ? Number(match.placarMandante) : (match?.goals?.home ?? (match?.homeScore ?? 0)));

  const placarVisitante = 
    match?.placar_visitante !== null && match?.placar_visitante !== undefined
      ? Number(match.placar_visitante)
      : (match?.placarVisitante !== undefined ? Number(match.placarVisitante) : (match?.goals?.away ?? (match?.awayScore ?? 0)));

  const partida = `${timeMandante} x ${timeVisitante}`;
  const fixtureId = String(match?.id || match?.partida_id || match?.fixture?.id || Date.now());

  return {
    id: fixtureId,
    fixtureId: fixtureId,
    partida: partida,
    timeMandante: timeMandante,
    timeVisitante: timeVisitante,
    mandante: typeof match?.mandante === 'object' ? { ...match.mandante, nome: timeMandante } : { nome: timeMandante },
    visitante: typeof match?.visitante === 'object' ? { ...match.visitante, nome: timeVisitante } : { nome: timeVisitante },
    competicao: competicao,
    campeonato: competicao,
    rodada: rodada,
    data: data,
    date: data,
    estadio: estadio,
    local: estadio,
    placar: {
      mandante: placarMandante,
      visitante: placarVisitante
    },
    placarObj: {
      mandante: placarMandante,
      visitante: placarVisitante
    },
    placarMandante: placarMandante,
    placarVisitante: placarVisitante,
    placar_mandante: placarMandante,
    placar_visitante: placarVisitante,
    treinadorMandante: match?.treinadorMandante || '',
    treinadorVisitante: match?.treinadorVisitante || '',
    esquemaMandante: match?.esquemaMandante || '4-3-3',
    esquemaVisitante: match?.esquemaVisitante || '4-2-3-1',
    statsMandante: match?.statsMandante || {},
    statsVisitante: match?.statsVisitante || {},
    atletasMandante: Array.isArray(match?.atletasMandante)
      ? match.atletasMandante.map(a => ({ ...a, destaque: false, isHighlight: false }))
      : [],
    atletasVisitante: Array.isArray(match?.atletasVisitante)
      ? match.atletasVisitante.map(a => ({ ...a, destaque: false, isHighlight: false }))
      : [],
    atletasAvaliados: Array.isArray(match?.atletasAvaliados) ? match.atletasAvaliados : []
  };
}

// 2. Reconhecimento Amplo de Jogo Encerrado
export const isMatchFinished = (match) => {
  if (!match) return false;
  const rawStatus = (
    match.status?.reason?.short || 
    match.status?.short || 
    match.statusShort || 
    (typeof match.status === 'string' ? match.status : '') || 
    ''
  );
  const status = String(rawStatus).toUpperCase();
  const matchDate = new Date(match.date || match.data || match.datetime || 0);

  const isFinishedFlag = match.status?.finished === true || match.finished === true || match.isFinished === true;
  const isFinishedStatus = ['FT', 'AET', 'PEN', 'ENCERRADO', 'FINALIZADO', 'POST'].includes(status) ||
    ['FT', 'AET', 'PEN', 'ENCERRADO', 'FINALIZADO', 'POST'].includes((match.statusShort || '').toUpperCase());

  const hasScore = (
    (match.home?.score !== undefined && match.home?.score !== null && match.away?.score !== undefined && match.away?.score !== null) ||
    (match.placar_mandante !== undefined && match.placar_mandante !== null && match.placar_visitante !== undefined && match.placar_visitante !== null) ||
    (match.placarMandante !== undefined && match.placarMandante !== null && match.placarVisitante !== undefined && match.placarVisitante !== null)
  );

  return (
    isFinishedFlag ||
    isFinishedStatus ||
    (hasScore && matchDate < new Date())
  );
};

function MatchesAgendaInternal({
  matches: propMatches,
  onCreateScoutReport,
  onSaveMatchReport,
  onSavePlayerToRadar,
  onDeletePlayer,
  onSaveCoach,
  onDeleteCoach,
  players = [],
  coaches = [],
  matchReports = []
}) {
  const [databaseMatches, setDatabaseMatches] = useState([]);
  const [matches, setMatches] = useState(Array.isArray(propMatches) ? propMatches : []);

  useEffect(() => {
    if (databaseMatches && Array.isArray(databaseMatches)) {
      setMatches(databaseMatches);
    }
  }, [databaseMatches]);

  // Relatórios de scout locais sincronizados com a prop ou localStorage
  const getInitialReports = () => {
    if (Array.isArray(matchReports) && matchReports.length > 0) {
      return matchReports;
    }
    try {
      const stored = localStorage.getItem('scout_match_reports') || localStorage.getItem('radar_match_reports');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  };

  const [localReports, setLocalReports] = useState(getInitialReports);

  useEffect(() => {
    if (Array.isArray(matchReports) && matchReports.length > 0) {
      setLocalReports(matchReports);
    }
  }, [matchReports]);

  const [selectedCompId, setSelectedCompId] = useState('todas');
  const [selectedTab, setSelectedTab] = useState('proximos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgressText, setSyncProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Modais de Relatório de Scout
  const [postMatchModalOpen, setPostMatchModalOpen] = useState(false);
  const [selectedPostMatchData, setSelectedPostMatchData] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [quickReportModalOpen, setQuickReportModalOpen] = useState(false);
  const [quickReportMatchData, setQuickReportMatchData] = useState(null);

  // 1. Limpeza radical de caches corrompidos de jogos + sincronização de partidas oficiais
  useEffect(() => {
    try {
      // Limpeza forçada das chaves de jogos para expurgar confrontos fictícios (preserva relatórios e atletas)
      localStorage.removeItem('radar_matches_repository');
      localStorage.removeItem('fotmob_cached_matches');
      localStorage.removeItem('fotmob_matches_vault');
      localStorage.removeItem('matches_database_2026');

      const storedMatches = getStoredDatabaseMatches();
      const loaded = storedMatches && Array.isArray(storedMatches) ? storedMatches : [];
      setDatabaseMatches(loaded);
      
      // Dispara a sincronização real imediatamente com a API oficial
      handleSyncMatches();
    } catch (err) {
      console.warn('[MatchesAgenda] Erro ao carregar jogos iniciais:', err);
      setDatabaseMatches([]);
    }
  }, []);

  // 2. Sincronização Estrita com a API Oficial (Zero Fake Data)
  const handleSyncMatches = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    setSyncProgressText('Buscando dados oficiais das competições...');

    try {
      const res = await syncWeeklyMatchesSerieAandB((msg, current, total) => {
        setSyncProgressText(`${msg} (${current}/${total})`);
      });

      if (res && res.success && res.newMatchesCount > 0) {
        const safeList = res?.database && Array.isArray(res.database) ? res.database : [];
        setDatabaseMatches(safeList);
        setMatches(safeList);
        setSuccessToast(`Agenda atualizada com dados oficiais! ${res?.newMatchesCount} partidas ativas (${res?.totalDatabaseCount || safeList.length} no total).`);
        setTimeout(() => setSuccessToast(null), 5000);
      } else {
        // Tolerância zero para dados fakes: se a API não retornar partidas, a lista fica vazia
        const validList = (getStoredDatabaseMatches() || []).filter(m => !String(m.id || '').startsWith('mock-'));
        setDatabaseMatches(validList);
        setMatches(validList);
        setSuccessToast("Sincronização concluída com os dados oficiais.");
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.warn('[MatchesAgenda] Erro ao sincronizar jogos oficiais:', err);
      setDatabaseMatches([]);
      setMatches([]);
      setErrorMessage("Não foi possível conectar à API oficial de partidas no momento.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSyncing(false);
      setSyncProgressText('');
    }
  };

  // Salvar relatório de scout mantendo atualização do storage e da lista em tela
  const handleSaveReportInternal = (savedPayload) => {
    if (!savedPayload) return;
    if (onSaveMatchReport) {
      onSaveMatchReport(savedPayload);
    }
    try {
      const stored = localStorage.getItem('scout_match_reports') || localStorage.getItem('radar_match_reports');
      const list = stored ? JSON.parse(stored) : (localReports || []);
      const idx = (list || []).findIndex(r => r && String(r.id) === String(savedPayload.id));
      let nextList;
      if (idx >= 0) {
        nextList = [...list];
        nextList[idx] = savedPayload;
      } else {
        nextList = [savedPayload, ...(list || [])];
      }
      localStorage.setItem('scout_match_reports', JSON.stringify(nextList));
      localStorage.setItem('radar_match_reports', JSON.stringify(nextList));
      setLocalReports(nextList);
    } catch (e) {
      console.warn('[MatchesAgenda] Erro ao atualizar storage de relatórios:', e);
    }
  };

  // Abrir modal com formulário em branco para jogo avulso / passado
  const handleOpenCustomReport = () => {
    const compLabel = (
      selectedCompId === 71 ? 'Brasileirão Série A' :
      selectedCompId === 72 ? 'Brasileirão Série B' :
      selectedCompId === 75 ? 'Brasileirão Série C' :
      selectedCompId === 73 ? 'Copa do Brasil' :
      selectedCompId === 130 ? 'Copa Libertadores' :
      selectedCompId === 295 ? 'Copa Sul-Americana' :
      'Brasileirão Série B'
    );
    const blankMatch = {
      id: `manual-report-${Date.now()}`,
      fixtureId: `manual-report-${Date.now()}`,
      partida: '',
      mandante: { nome: '' },
      visitante: { nome: '' },
      timeMandante: '',
      timeVisitante: '',
      competicao: compLabel,
      campeonato: compLabel,
      rodada: 'Rodada Oficial',
      data: new Date().toISOString().split('T')[0],
      estadio: '',
      local: '',
      placar: { mandante: 0, visitante: 0 },
      placarObj: { mandante: 0, visitante: 0 },
      placarMandante: 0,
      placarVisitante: 0,
      treinadorMandante: '',
      treinadorVisitante: '',
      esquemaMandante: '4-3-3',
      esquemaVisitante: '4-2-3-1',
      atletasMandante: [],
      atletasVisitante: [],
      atletasAvaliados: [],
      isCustomAvulso: true
    };
    setEditingReport(null);
    setSelectedPostMatchData(blankMatch);
    setPostMatchModalOpen(true);
  };

  // Abrir modal em modo de edição para relatório já concluído
  const handleOpenEditReport = (report) => {
    if (!report) return;
    setEditingReport(report);
    setSelectedPostMatchData(null);
    setPostMatchModalOpen(true);
  };

  // Arquivar partida sem preencher relatório agora
  const handleArchiveMatch = (match) => {
    if (!match || !match.id) return;
    const matchId = String(match.id);

    const updatedDb = (databaseMatches || []).map(m => {
      if (String(m.id) === matchId) {
        return {
          ...m,
          status: 'ARCHIVED_PENDING_REPORT',
          isArchived: true,
          archivedAt: new Date().toISOString()
        };
      }
      return m;
    });

    setDatabaseMatches(updatedDb);
    saveStoredDatabaseMatches(updatedDb);
    const home = match?.mandante?.nome || match?.homeTeam || match?.home?.name || 'Mandante';
    const away = match?.visitante?.nome || match?.awayTeam || match?.away?.name || 'Visitante';
    setSuccessToast(`Partida "${home} x ${away}" arquivada com sucesso no histórico.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Desarquivar partida retornando para a fila de agendados
  const handleUnarchiveMatch = (match) => {
    if (!match || !match.id) return;
    const matchId = String(match.id);

    const updatedDb = (databaseMatches || []).map(m => {
      if (String(m.id) === matchId) {
        return {
          ...m,
          status: 'agendado',
          isArchived: false,
          archivedAt: null
        };
      }
      return m;
    });

    setDatabaseMatches(updatedDb);
    saveStoredDatabaseMatches(updatedDb);
    setSuccessToast(`Partida retornada para a fila de Próximos / Agendados.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // 1. Próximos jogos oficiais (apenas agendados, sem placares sintéticos, sem jogos passados e sem arquivados)
  const scheduledMatches = useMemo(() => {
    const rawList = databaseMatches && Array.isArray(databaseMatches) ? databaseMatches : [];
    const filtered = rawList.filter(match => {
      if (!match || typeof match !== 'object') return false;
      if (match.status === 'ARCHIVED_PENDING_REPORT' || match.isArchived) return false; // Sai da fila imediatamente!
      if (isMatchFinished(match)) return false; // NENHUM jogo finalizado aqui!
      if (!matchesTemporalFilter(match)) return false;
      if (!matchBelongsToCompetition(match, selectedCompId)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const homeName = (match?.homeTeam || match?.home?.name || match?.mandante?.nome || match?.teams?.home?.name || '').toLowerCase();
        const awayName = (match?.awayTeam || match?.away?.name || match?.visitante?.nome || match?.teams?.away?.name || '').toLowerCase();
        const compName = (match?.campeonato || match?.campeonato_nome || match?.competicao || match?.league?.name || '').toLowerCase();
        const stadium = (match?.estadio || match?.local || match?.venue || '').toLowerCase();
        const round = (match?.rodada || match?.round || match?.roundName || '').toLowerCase();
        return homeName.includes(q) || awayName.includes(q) || compName.includes(q) || stadium.includes(q) || round.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const timeA = new Date(a?.datetime || a?.data || a?.date || 0).getTime() || 0;
      const timeB = new Date(b?.datetime || b?.data || b?.date || 0).getTime() || 0;
      return timeA - timeB;
    });
    return deduplicateMatches(filtered);
  }, [databaseMatches, selectedCompId, searchQuery]);

  // 2. Jogos arquivados pendentes de relatório
  const archivedMatches = useMemo(() => {
    const rawList = databaseMatches && Array.isArray(databaseMatches) ? databaseMatches : [];
    const filtered = rawList.filter(match => {
      if (!match || typeof match !== 'object') return false;
      if (match.status !== 'ARCHIVED_PENDING_REPORT' && !match.isArchived) return false;
      if (!matchBelongsToCompetition(match, selectedCompId)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const homeName = (match?.homeTeam || match?.home?.name || match?.mandante?.nome || match?.teams?.home?.name || '').toLowerCase();
        const awayName = (match?.awayTeam || match?.away?.name || match?.visitante?.nome || match?.teams?.away?.name || '').toLowerCase();
        const compName = (match?.campeonato || match?.campeonato_nome || match?.competicao || match?.league?.name || '').toLowerCase();
        const stadium = (match?.estadio || match?.local || match?.venue || '').toLowerCase();
        const round = (match?.rodada || match?.round || match?.roundName || '').toLowerCase();
        return homeName.includes(q) || awayName.includes(q) || compName.includes(q) || stadium.includes(q) || round.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const timeA = new Date(a?.datetime || a?.data || a?.date || 0).getTime() || 0;
      const timeB = new Date(b?.datetime || b?.data || b?.date || 0).getTime() || 0;
      return timeB - timeA;
    });
    return deduplicateMatches(filtered);
  }, [databaseMatches, selectedCompId, searchQuery]);

  // 3. Relatórios de jogos encerrados (derivados EXCLUSIVAMENTE dos relatórios reais salvos pelo scout)
  const filteredReports = useMemo(() => {
    const list = Array.isArray(localReports) ? localReports : [];
    return list.filter(report => {
      if (!report || typeof report !== 'object') return false;
      if (!matchBelongsToCompetition(report, selectedCompId)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const homeName = (report?.mandante?.nome || report?.homeTeam || report?.partida?.split(' x ')?.[0] || '').toLowerCase();
        const awayName = (report?.visitante?.nome || report?.awayTeam || report?.partida?.split(' x ')?.[1] || '').toLowerCase();
        const compName = (report?.competicao || report?.campeonato || '').toLowerCase();
        const stadium = (report?.estadio || report?.local || '').toLowerCase();
        const round = (report?.rodada || '').toLowerCase();
        return homeName.includes(q) || awayName.includes(q) || compName.includes(q) || stadium.includes(q) || round.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const timeA = new Date(a?.data || a?.date || 0).getTime() || 0;
      const timeB = new Date(b?.data || b?.date || 0).getTime() || 0;
      return timeB - timeA; // Mais recentes primeiro
    });
  }, [localReports, selectedCompId, searchQuery]);

  // Abertura de Relatório a partir de um confronto agendado ou arquivado
  const handleOpenScoutReport = async (match) => {
    try {
      let enrichedMatch = { ...match };

      if ((!enrichedMatch.atletasMandante || enrichedMatch.atletasMandante.length === 0) && enrichedMatch.id) {
        setIsSyncing(true);
        setSyncProgressText('Carregando notas oficiais e escalações do FotMob...');
        try {
          const details = await fetchMatchDetails(enrichedMatch.id);
          if (details) {
            enrichedMatch = {
              ...enrichedMatch,
              ...details
            };
            const updatedDb = getStoredDatabaseMatches().map(m => 
              String(m?.id) === String(enrichedMatch.id) ? { ...m, ...details } : m
            );
            setDatabaseMatches(updatedDb);
            saveStoredDatabaseMatches(updatedDb);
          }
        } catch (e) {
          console.warn('[MatchesAgenda] Erro ao carregar detalhes do confronto:', e);
        } finally {
          setIsSyncing(false);
          setSyncProgressText('');
        }
      }

      const normalizedData = normalizeMatchForScoutReport(enrichedMatch);
      if (!normalizedData) return;

      setEditingReport(null);
      setSelectedPostMatchData(normalizedData);
      setPostMatchModalOpen(true);
    } catch (err) {
      console.error('[MatchesAgenda] Erro ao preparar dados do relatório:', err);
      setErrorMessage('Não foi possível abrir o formulário deste jogo. Os dados foram preservados.');
    }
  };

  const formatMatchDateHeader = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return 'Data a definir';
    try {
      let clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      if (clean.length === 8 && !clean.includes('-')) {
        clean = `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
      }
      const parts = clean.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d, 12, 0, 0);
        if (!isNaN(dateObj.getTime())) {
          const formatted = dateObj.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }
      }
      return dateStr;
    } catch {
      return dateStr || 'Data a definir';
    }
  };

  // Contadores por competição (próximos jogos)
  const compFutureMatches = useMemo(() => {
    const raw = Array.isArray(databaseMatches) ? databaseMatches : [];
    return raw.filter(m => m && !isMatchFinished(m) && m.status !== 'ARCHIVED_PENDING_REPORT' && !m.isArchived && matchesTemporalFilter(m));
  }, [databaseMatches]);

  const countSerieA = compFutureMatches.filter(m => matchBelongsToCompetition(m, 71)).length;
  const countSerieB = compFutureMatches.filter(m => matchBelongsToCompetition(m, 72)).length;
  const countSerieC = compFutureMatches.filter(m => matchBelongsToCompetition(m, 75)).length;
  const countSerieD = compFutureMatches.filter(m => matchBelongsToCompetition(m, 76)).length;
  const countCopaBrasil = compFutureMatches.filter(m => matchBelongsToCompetition(m, 73)).length;
  const countLibertadores = compFutureMatches.filter(m => matchBelongsToCompetition(m, 130)).length;
  const countSulAmericana = compFutureMatches.filter(m => matchBelongsToCompetition(m, 295)).length;
  const countCopaSP = compFutureMatches.filter(m => matchBelongsToCompetition(m, 464)).length;

  const compReports = useMemo(() => {
    const list = Array.isArray(localReports) ? localReports : [];
    if (selectedCompId === 'todas') return list;
    return list.filter(r => matchBelongsToCompetition(r, selectedCompId));
  }, [localReports, selectedCompId]);

  const compArchived = useMemo(() => {
    const raw = Array.isArray(databaseMatches) ? databaseMatches : [];
    const list = raw.filter(m => m && (m.status === 'ARCHIVED_PENDING_REPORT' || m.isArchived));
    if (selectedCompId === 'todas') return list;
    return list.filter(m => matchBelongsToCompetition(m, selectedCompId));
  }, [databaseMatches, selectedCompId]);

  const compScheduled = useMemo(() => {
    if (selectedCompId === 'todas') return compFutureMatches;
    return compFutureMatches.filter(m => matchBelongsToCompetition(m, selectedCompId));
  }, [compFutureMatches, selectedCompId]);

  const counts = {
    total: compScheduled.length + compReports.length + compArchived.length,
    finalizados: compReports.length + compArchived.length,
    agendados: compScheduled.length,
    arquivados: compArchived.length,
    serieA: countSerieA,
    serieB: countSerieB,
    serieC: countSerieC,
    serieD: countSerieD,
    copaDoBrasil: countCopaBrasil,
    libertadores: countLibertadores,
    sulAmericana: countSulAmericana,
    copaSp: countCopaSP
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast de Sucesso */}
      {successToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn shadow-lg shadow-emerald-950/20">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Alerta de Erro */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-xs underline hover:text-white"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Painel do Topo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  Agenda e Banco de Jogos Oficial (FotMob)
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  FotMob Ao Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span>Base de Dados Integrada (Últimos 10 Dias e Próximos 10 Dias • Fuso Brasília)</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/70 border border-slate-800/90 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Fonte:</span>
              <span className="font-semibold text-emerald-400">FotMob Conector Oficial</span>
            </div>

            <button
              onClick={handleOpenCustomReport}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/30 cursor-pointer active:scale-95"
              title="Cadastrar avaliação manual de qualquer jogo do passado que assistiu"
            >
              <Plus className="w-4 h-4" />
              <span>+ Relatório Avulso / Jogo Passado</span>
            </button>

            <button
              onClick={handleSyncMatches}
              disabled={isSyncing || loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>{syncProgressText || 'Sincronizando...'}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Sincronizar Jogos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Badges de Competições */}
        <div className="mt-4 pt-4 border-t border-slate-800/70 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          <button 
            onClick={() => setSelectedCompId(71)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 71 ? 'bg-emerald-500/15 border-emerald-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Série A</span>
            <span className="font-bold text-emerald-400 font-mono text-xs">
              {countSerieA} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>

          <button 
            onClick={() => setSelectedCompId(72)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 72 ? 'bg-blue-500/15 border-blue-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Série B</span>
            <span className="font-bold text-blue-400 font-mono text-xs">
              {countSerieB} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>

          <button 
            onClick={() => setSelectedCompId(75)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 75 ? 'bg-amber-500/15 border-amber-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Série C</span>
            <span className="font-bold text-amber-400 font-mono text-xs">
              {countSerieC} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>

          <button 
            onClick={() => setSelectedCompId(76)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 76 ? 'bg-teal-500/15 border-teal-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Série D</span>
            <span className="font-bold text-teal-400 font-mono text-xs">
              {countSerieD} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>

          <button 
            onClick={() => setSelectedCompId(73)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 73 ? 'bg-rose-500/15 border-rose-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Copa do Brasil</span>
            <span className="font-bold text-rose-400 font-mono text-xs">
              {countCopaBrasil} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>

          <button 
            onClick={() => setSelectedCompId(130)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 130 ? 'bg-yellow-500/15 border-yellow-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Libertadores</span>
            <span className="font-bold text-yellow-400 font-mono text-xs">
              {countLibertadores} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>

          <button 
            onClick={() => setSelectedCompId(295)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 295 ? 'bg-cyan-500/15 border-cyan-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Sul-Americana</span>
            <span className="font-bold text-cyan-400 font-mono text-xs">
              {countSulAmericana} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>

          <button 
            onClick={() => setSelectedCompId(464)}
            className={`p-2 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
              selectedCompId === 464 ? 'bg-indigo-500/15 border-indigo-500/50 shadow-xs' : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-medium text-[10px] truncate">Copa SP 2027</span>
            <span className="font-bold text-indigo-400 font-mono text-xs">
              {countCopaSP} <span className="text-[9px] font-normal text-slate-500">jogos</span>
            </span>
          </button>
        </div>
      </div>

      {/* Controles de Filtros */}
      <div className="space-y-4">
        {/* Seletor de Competições */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Competição:
          </span>
          {COMPETICOES_AGENDA.map((comp) => {
            const isSelected = selectedCompId === comp.id || (selectedCompId === 'todas' && comp.id === 'todas');
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black' 
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{comp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Barra de Abas e Busca */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedTab('proximos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'proximos'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⏳ Próximos / Agendados</span>
              <span className="px-1.5 py-0.2 bg-slate-950/60 rounded-full text-[10px] font-mono text-emerald-400 font-semibold">
                {counts.agendados}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('anteriores')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'anteriores'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>✅ Encerrados / Histórico</span>
              <span className="px-1.5 py-0.2 bg-slate-950/60 rounded-full text-[10px] font-mono text-slate-400 font-semibold">
                {counts.finalizados}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'todos'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📁 Todos os Jogos</span>
              <span className="px-1.5 py-0.2 bg-slate-950/60 rounded-full text-[10px] font-mono text-slate-400 font-semibold">
                {counts.total}
              </span>
            </button>
          </div>

          <div className="relative min-w-[260px] md:min-w-[300px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por clube (ex: Goiás, CRB, Sport, Botafogo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Partidas / Relatórios ou Fallback Seguro */}
      {loading ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <div>
            <h3 className="text-base font-bold text-white">Carregando Banco de Jogos...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Organizando os confrontos salvos no banco local.
            </p>
          </div>
        </div>
      ) : selectedTab === 'anteriores' ? (
        /* SUB-ABA: ENCERRADOS / HISTÓRICO (RELATÓRIOS REAIS + JOGOS ARQUIVADOS) */
        filteredReports.length === 0 && archivedMatches.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1">
              <FileCheck2 className="w-8 h-8 stroke-[1.5] text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nenhum relatório ou jogo arquivado nesta competição ainda.</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Esta aba exibe os relatórios de scout criados e jogos arquivados para avaliação posterior. Para registrar a avaliação de qualquer jogo que você assistiu, clique no botão abaixo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                onClick={handleOpenCustomReport}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Relatório Avulso / Jogo Passado</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seção de Jogos Arquivados (Sem Relatório ainda) */}
            {archivedMatches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Archive className="w-4 h-4 text-slate-400" />
                  <span>Jogos Arquivados ({archivedMatches.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {archivedMatches.map((match) => {
                    const mNome = match?.mandante?.nome || match?.homeTeam || match?.home?.name || match?.teams?.home?.name || (typeof match?.mandante === 'string' ? match.mandante : 'Mandante');
                    const vNome = match?.visitante?.nome || match?.awayTeam || match?.away?.name || match?.teams?.away?.name || (typeof match?.visitante === 'string' ? match.visitante : 'Visitante');

                    return (
                      <div
                        key={match?.id || Math.random().toString(36).substr(2, 7)}
                        className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                      >
                        <div>
                          {/* Header: Competição, Rodada e Badge de Arquivado */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-slate-300 truncate">
                                {match?.campeonato || match?.campeonato_nome || match?.competicao || 'Competição Oficial'}
                              </span>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {match?.rodada || match?.round || match?.roundName || 'Rodada Oficial'}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                              <Archive className="w-3 h-3 text-slate-400" />
                              <span>Arquivado (Sem Relatório)</span>
                            </span>
                          </div>

                          {/* Confronto Central: Mandante x Visitante (Texto Limpo Sem Escudos) */}
                          <div className="flex items-center justify-between py-3 px-4 bg-slate-900/60 rounded-lg">
                            <span className="text-base font-bold text-slate-100 flex-1 text-right pr-3 truncate" title={mNome}>
                              {mNome}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-amber-400 rounded shrink-0">
                              VS
                            </span>
                            <span className="text-base font-bold text-slate-100 flex-1 text-left pl-3 truncate" title={vNome}>
                              {vNome}
                            </span>
                          </div>

                          {/* Data, Horário e Estádio */}
                          <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                {formatMatchDateHeader(match?.data || match?.date)}
                              </span>
                              <span className="font-mono text-slate-300">
                                {match?.hora || match?.horario || '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{match?.estadio || match?.local || match?.venue || 'Local a definir'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Ações: Criar Relatório e Desarquivar */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenScoutReport(match)}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>📋 Criar Relatório de Scout</span>
                          </button>
                          <button
                            onClick={() => handleUnarchiveMatch(match)}
                            className="py-2 px-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                            title="Desarquivar e retornar para a fila de agendados"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            <span>↩️ Desarquivar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seção de Relatórios Concluídos */}
            {filteredReports.length > 0 && (
              <div className="space-y-3">
                {archivedMatches.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Relatórios Concluídos ({filteredReports.length})</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredReports.map((report) => {
                    const homeName = report?.mandante?.nome || report?.homeTeam || report?.partida?.split(' x ')?.[0] || 'Mandante';
                    const awayName = report?.visitante?.nome || report?.awayTeam || report?.partida?.split(' x ')?.[1] || 'Visitante';
                    const homeScore = report?.placarObj?.mandante ?? report?.placarMandante ?? report?.homeScore ?? (report?.placar?.split(' x ')?.[0] ?? 0);
                    const awayScore = report?.placarObj?.visitante ?? report?.placarVisitante ?? report?.awayScore ?? (report?.placar?.split(' x ')?.[1] ?? 0);
                    const evaluatedAthletes = report?.atletasAvaliados || report?.lineup || [];
                    const highlightsList = evaluatedAthletes.filter(a => a?.destaque || a?.isHighlight || a?.destaquePositivo);

                    return (
                      <div
                        key={report.id || `rep-${Math.random()}`}
                        className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                      >
                        <div>
                          {/* Header: Competição, Rodada e Status */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-emerald-400 truncate">
                                {report?.competicao || report?.campeonato || 'Competição Oficial'}
                              </span>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {report?.rodada || 'Relatório de Scout'}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Relatório Salvo</span>
                            </span>
                          </div>

                          {/* Data da Partida Formatada */}
                          <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{formatMatchDateHeader(report?.data || report?.date)}</span>
                          </div>

                          {/* Confronto Central com Placar Real */}
                          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                            <div className="flex-1 flex flex-col items-center text-center px-1">
                              <span className="text-xs font-bold text-white leading-tight line-clamp-1">
                                {homeName}
                              </span>
                            </div>

                            <div className="px-3 flex flex-col items-center justify-center shrink-0">
                              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-emerald-500/30 shadow-inner">
                                <span className="text-base font-black text-emerald-400 font-mono">
                                  {homeScore}
                                </span>
                                <span className="text-xs text-slate-500 font-bold">x</span>
                                <span className="text-base font-black text-emerald-400 font-mono">
                                  {awayScore}
                                </span>
                              </div>
                              <span className="text-[9px] text-emerald-500/80 font-semibold mt-0.5">Placar Final</span>
                            </div>

                            <div className="flex-1 flex flex-col items-center text-center px-1">
                              <span className="text-xs font-bold text-white leading-tight line-clamp-1">
                                {awayName}
                              </span>
                            </div>
                          </div>

                          {/* Informações adicionais do relatório: Atletas Avaliados & Destaques */}
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-950/40 border border-slate-800/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="text-slate-400 truncate">Avaliados:</span>
                              <span className="font-bold text-white font-mono">{evaluatedAthletes.length}</span>
                            </div>

                            <div className="bg-slate-950/40 border border-slate-800/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400/30" />
                              <span className="text-slate-400 truncate">Destaques:</span>
                              <span className="font-bold text-amber-400 font-mono">{highlightsList.length}</span>
                            </div>
                          </div>

                          {/* Estádio / Local */}
                          {(report?.estadio || report?.local) && (
                            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{report.estadio || report.local}</span>
                            </div>
                          )}
                        </div>

                        {/* Botão de Ver / Editar Relatório */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <button
                            onClick={() => handleOpenEditReport(report)}
                            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                          >
                            <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                            <span>✏️ Visualizar / Editar Relatório</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      ) : selectedTab === 'proximos' ? (
        /* SUB-ABA: PRÓXIMOS / AGENDADOS (RIGOROSAMENTE JOGOS OFICIAIS AGENDADOS) */
        scheduledMatches.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1">
              <Calendar className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nenhum próximo jogo encontrado</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Nenhum confronto agendado encontrado para os filtros selecionados. Clique em [ 🔄 Sincronizar Jogos ] para atualizar os dados oficiais.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Limpar Busca
                </button>
              )}
              <button
                onClick={handleSyncMatches}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>🔄 Sincronizar Jogos</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {scheduledMatches.map((match) => {
              const isLive = LIVE_STATUSES.includes((match?.status || '').toLowerCase()) || LIVE_STATUSES.includes((match?.statusShort || '').toLowerCase());

              const mNome = match?.mandante?.nome || match?.homeTeam || match?.home?.name || match?.teams?.home?.name || (typeof match?.mandante === 'string' ? match.mandante : 'Mandante');
              const vNome = match?.visitante?.nome || match?.awayTeam || match?.away?.name || match?.teams?.away?.name || (typeof match?.visitante === 'string' ? match.visitante : 'Visitante');

              return (
                <div 
                  key={match?.id || match?.partida_id || Math.random().toString(36).substr(2, 7)}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                >
                  <div>
                    {/* Header: Competição, Rodada e Status */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-emerald-400 truncate">
                          {match?.campeonato || match?.campeonato_nome || match?.competicao || 'Competição Oficial'}
                        </span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {match?.rodada || match?.round || match?.roundName || 'Rodada Oficial'}
                        </span>
                      </div>

                      {isLive ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold animate-pulse shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          AO VIVO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          {match?.hora || match?.horario || 'Agendado'}
                        </span>
                      )}
                    </div>

                    {/* Confronto Central: Mandante x Visitante (Texto Limpo Sem Escudos) */}
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-900/60 rounded-lg">
                      <span className="text-base font-bold text-slate-100 flex-1 text-right pr-3 truncate" title={mNome}>
                        {mNome}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-amber-400 rounded shrink-0">
                        {isLive ? 'AO VIVO' : 'VS'}
                      </span>
                      <span className="text-base font-bold text-slate-100 flex-1 text-left pl-3 truncate" title={vNome}>
                        {vNome}
                      </span>
                    </div>

                    {/* Data, Horário e Estádio */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {formatMatchDateHeader(match?.data || match?.date)}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {match?.hora || match?.horario || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{match?.estadio || match?.local || match?.venue || 'Local a definir'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Card Agendado: Criar Relatório e Arquivar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenScoutReport(match)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>📋 Criar Relatório de Scout</span>
                    </button>
                    <button
                      onClick={() => handleArchiveMatch(match)}
                      className="py-2 px-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                      title="Arquivar confronto sem preencher relatório agora"
                    >
                      <Archive className="w-3.5 h-3.5 text-slate-400" />
                      <span>📦 Arquivar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* SUB-ABA: TODOS OS JOGOS (RELATÓRIOS + JOGOS ARQUIVADOS + PRÓXIMOS CONFRONTOS) */
        filteredReports.length === 0 && scheduledMatches.length === 0 && archivedMatches.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1">
              <Calendar className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nenhum jogo ou relatório encontrado</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Nenhuma partida ou relatório registrado nesta competição. Clique em [ 🔄 Sincronizar Jogos ] ou cadastre um relatório avulso.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                onClick={handleOpenCustomReport}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Relatório Avulso</span>
              </button>
              <button
                onClick={handleSyncMatches}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>🔄 Sincronizar Jogos</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Relatórios Concluídos ({filteredReports.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredReports.map(report => (
                    <div
                      key={report.id || `rep-${Math.random()}`}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-bold text-emerald-400 truncate">
                            {report?.competicao || report?.campeonato || 'Competição Oficial'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                            Relatório Salvo
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatMatchDateHeader(report?.data || report?.date)}</span>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex-1 text-center truncate">
                            {report?.mandante?.nome || report?.partida?.split(' x ')?.[0] || 'Mandante'}
                          </span>
                          <div className="px-3 flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm bg-slate-900 py-1 px-2.5 rounded-lg border border-emerald-500/30">
                            <span>{report?.placarObj?.mandante ?? report?.placarMandante ?? 0}</span>
                            <span className="text-slate-500">x</span>
                            <span>{report?.placarObj?.visitante ?? report?.placarVisitante ?? 0}</span>
                          </div>
                          <span className="text-xs font-bold text-white flex-1 text-center truncate">
                            {report?.visitante?.nome || report?.partida?.split(' x ')?.[1] || 'Visitante'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <button
                          onClick={() => handleOpenEditReport(report)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Visualizar / Editar Relatório</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {archivedMatches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Archive className="w-4 h-4" />
                  <span>Jogos Arquivados ({archivedMatches.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {archivedMatches.map(match => (
                    <div
                      key={match?.id || Math.random()}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-bold text-slate-400 truncate">
                            {match?.campeonato || match?.competicao || 'Competição'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                            Arquivado (Sem Relatório)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatMatchDateHeader(match?.data || match?.date)}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/60 rounded-lg">
                          <span className="text-base font-bold text-slate-100 flex-1 text-right pr-3 truncate" title={match?.mandante?.nome || match?.homeTeam || 'Mandante'}>
                            {match?.mandante?.nome || match?.homeTeam || 'Mandante'}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-amber-400 rounded shrink-0">
                            VS
                          </span>
                          <span className="text-base font-bold text-slate-100 flex-1 text-left pl-3 truncate" title={match?.visitante?.nome || match?.awayTeam || 'Visitante'}>
                            {match?.visitante?.nome || match?.awayTeam || 'Visitante'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenScoutReport(match)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Criar Relatório de Scout</span>
                        </button>
                        <button
                          onClick={() => handleUnarchiveMatch(match)}
                          className="py-2 px-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                          title="Desarquivar e retornar para a fila de agendados"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          <span>↩️ Desarquivar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scheduledMatches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <Clock className="w-4 h-4" />
                  <span>Próximos Confrontos Agendados ({scheduledMatches.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {scheduledMatches.map(match => (
                    <div
                      key={match?.id || Math.random()}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-bold text-blue-400 truncate">
                            {match?.campeonato || match?.competicao || 'Competição'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {match?.hora || 'Agendado'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatMatchDateHeader(match?.data || match?.date)}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 bg-slate-900/60 rounded-lg">
                          <span className="text-base font-bold text-slate-100 flex-1 text-right pr-3 truncate" title={match?.mandante?.nome || match?.homeTeam || 'Mandante'}>
                            {match?.mandante?.nome || match?.homeTeam || 'Mandante'}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-amber-400 rounded shrink-0">
                            VS
                          </span>
                          <span className="text-base font-bold text-slate-100 flex-1 text-left pl-3 truncate" title={match?.visitante?.nome || match?.awayTeam || 'Visitante'}>
                            {match?.visitante?.nome || match?.awayTeam || 'Visitante'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenScoutReport(match)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Criar Relatório de Scout</span>
                        </button>
                        <button
                          onClick={() => handleArchiveMatch(match)}
                          className="py-2 px-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                          title="Arquivar confronto sem preencher relatório agora"
                        >
                          <Archive className="w-3.5 h-3.5 text-slate-400" />
                          <span>📦 Arquivar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Modais de Relatório Envolvidos em Error Boundary */}
      <ErrorBoundary onReset={() => { setPostMatchModalOpen(false); setSelectedPostMatchData(null); setEditingReport(null); }}>
        <PostMatchReportModal
          isOpen={postMatchModalOpen}
          onClose={() => {
            setPostMatchModalOpen(false);
            setSelectedPostMatchData(null);
            setEditingReport(null);
          }}
          matchData={selectedPostMatchData}
          reportToEdit={editingReport}
          isEditing={Boolean(editingReport)}
          onSaveReport={handleSaveReportInternal}
          onSaveSuccess={handleSaveReportInternal}
          onSavePlayerToRadar={onSavePlayerToRadar}
          onDeletePlayer={onDeletePlayer}
          onSaveCoach={onSaveCoach}
          onDeleteCoach={onDeleteCoach}
          existingPlayers={players}
          existingCoaches={coaches}
        />
      </ErrorBoundary>

      <ErrorBoundary onReset={() => setQuickReportModalOpen(false)}>
        <QuickMatchReportModal
          isOpen={quickReportModalOpen}
          onClose={() => {
            setQuickReportModalOpen(false);
            setQuickReportMatchData(null);
          }}
          matchData={quickReportMatchData}
          onSaveQuickReport={handleSaveReportInternal}
          onSaveReport={handleSaveReportInternal}
          players={players}
          coaches={coaches}
        />
      </ErrorBoundary>
    </div>
  );
}

// Exportacao com ErrorBoundary Defensivo para evitar tela branca em qualquer cenario
export default function MatchesAgenda(props) {
  return (
    <ErrorBoundary 
      fallbackTitle="Agenda de Jogos Temporariamente Indisponível"
      fallbackMessage="Ocorreu uma falha ao exibir a Agenda de Jogos. Os dados foram preservados com segurança.">
      <MatchesAgendaInternal {...props} />
    </ErrorBoundary>
  );
}

export { MatchesAgenda, MatchesAgendaInternal as MatchCalendar };
