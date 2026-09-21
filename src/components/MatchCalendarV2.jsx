import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  UserCheck,
  Bookmark,
  FileText,
  Printer,
  Smartphone,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Archive,
  RotateCcw,
  Check,
  Settings,
  Sparkles,
  ExternalLink,
  Sliders,
  Trophy,
  Download,
  Upload,
  X
} from 'lucide-react';
import {
  API_FOOTBALL_LEAGUES,
  LIVE_STATUS_CODES,
  FINISHED_STATUS_CODES,
  getStoredMatchesV2,
  saveStoredMatchesV2,
  mergeMatchesIntoVault,
  getStoredReportsV2,
  saveStoredReportV2,
  syncLeagueFixtures,
  syncAllMonitoredLeagues,
  fetchFixtureLineupsAndPlayers,
  getApiFootballKey,
  setCustomApiKey,
  isValidDate,
  isMatchFinishedOrPast,
  getStartOfToday
} from '../services/apiFootballV2Service';
import {
  fetchMatchesFromSupabase,
  syncVaultToSupabase
} from '../services/supabaseService';
import ErrorBoundary from './ErrorBoundary';
import PostMatchReportModal from './PostMatchReportModal';
import QuickMatchReportModal from './QuickMatchReportModal';

/**
 * Normaliza o nome da competição para os botões do QuickMatchReportModal
 */
function mapCompetitionToQuick(name) {
  if (!name) return 'Brasileirão Série A';
  const n = String(name).trim();
  if (n.includes('Série A') || n.includes('Serie A')) return 'Brasileirão Série A';
  if (n.includes('Série B') || n.includes('Serie B')) return 'Brasileirão Série B';
  if (n.includes('Série C') || n.includes('Serie C')) return 'Brasileirão Série C';
  if (n.includes('Série D') || n.includes('Serie D')) return 'Brasileirão Série D';
  if (n.includes('Copa do Brasil')) return 'Copa do Brasil';
  if (n.includes('Libertadores')) return 'Libertadores';
  if (n.includes('Sul-Americana') || n.includes('Sudamericana')) return 'Sul-Americana';
  if (n.includes('Sub-20') || n.includes('Copinha')) return 'Sub-20 / Copinha';
  if (n.includes('Estadual') || n.includes('Paulista') || n.includes('Carioca') || n.includes('Mineiro') || n.includes('Gaúcho')) return 'Estaduais';
  return n;
}

/**
 * Mapeia siglas de posição da API-Football para os códigos padrão do PostMatchReportModal:
 * GOL, ZAG, LD, LE, VOL, MEI, EXT, CA
 */
function mapApiFootballPositionCode(pos, grid, indexInLineup = 0) {
  const p = String(pos || '').toUpperCase().trim();
  if (p === 'G' || p.includes('GOAL') || p.includes('GOL') || p.includes('GK')) return 'GOL';
  if (p === 'D' || p.includes('DEF') || p.includes('ZAG')) {
    if (grid) {
      const col = parseInt(grid.split(':')[1], 10);
      if (col === 1) return 'LD';
      if (col >= 4) return 'LE';
    }
    if (indexInLineup === 1) return 'LD';
    if (indexInLineup === 4) return 'LE';
    return 'ZAG';
  }
  if (p === 'M' || p.includes('MID') || p.includes('MEI') || p.includes('VOL')) {
    if (grid) {
      const row = parseInt(grid.split(':')[0], 10);
      if (row >= 4) return 'MEI';
    }
    if (indexInLineup >= 7) return 'MEI';
    return 'VOL';
  }
  if (p === 'F' || p.includes('ATT') || p.includes('FORW') || p.includes('ATA') || p.includes('CA') || p.includes('EXT')) {
    if (grid) {
      const col = parseInt(grid.split(':')[1], 10);
      if (col === 1 || col >= 3) return 'EXT';
    }
    return 'CA';
  }
  return 'VOL';
}

/**
 * Constrói a estrutura de dados esperada pelo PostMatchReportModal a partir da partida e súmula da API
 */
function buildMatchDataForPostMatchReport(match, apiData, registeredCoaches = []) {
  const homeClub = match?.homeTeam || match?.teams?.home?.name || match?.mandante?.nome || 'Mandante';
  const awayClub = match?.awayTeam || match?.teams?.away?.name || match?.visitante?.nome || 'Visitante';

  const homeLineup = apiData?.lineups?.[0] || null;
  const awayLineup = apiData?.lineups?.[1] || null;
  const homePlayersStat = apiData?.players?.[0]?.players || [];
  const awayPlayersStat = apiData?.players?.[1]?.players || [];

  // Mapa de notas Sofascore / API-Sports
  const ratingMap = {};
  [...homePlayersStat, ...awayPlayersStat].forEach(item => {
    if (item?.player && item?.statistics && item?.statistics[0]) {
      const r = item.statistics[0].games?.rating;
      if (r && item.player.id) ratingMap[String(item.player.id)] = r;
      if (r && item.player.name) ratingMap[item.player.name.toLowerCase().trim()] = r;
    }
  });

  // Treinadores com fallback inteligente para os cadastrados
  let coachHomeName = homeLineup?.coach?.name || match?.treinadorMandante || match?.coachHome?.name || (typeof match?.coachHome === 'string' ? match.coachHome : '') || '';
  let coachAwayName = awayLineup?.coach?.name || match?.treinadorVisitante || match?.coachAway?.name || (typeof match?.coachAway === 'string' ? match.coachAway : '') || '';

  if (!coachHomeName && Array.isArray(registeredCoaches)) {
    const found = registeredCoaches.find(c => {
      const cl = (c?.clubeAtual || c?.clube || '').toLowerCase().trim();
      return cl && (cl === homeClub.toLowerCase().trim() || homeClub.toLowerCase().trim().includes(cl) || cl.includes(homeClub.toLowerCase().trim()));
    });
    if (found?.nome) coachHomeName = found.nome;
  }

  if (!coachAwayName && Array.isArray(registeredCoaches)) {
    const found = registeredCoaches.find(c => {
      const cl = (c?.clubeAtual || c?.clube || '').toLowerCase().trim();
      return cl && (cl === awayClub.toLowerCase().trim() || awayClub.toLowerCase().trim().includes(cl) || cl.includes(awayClub.toLowerCase().trim()));
    });
    if (found?.nome) coachAwayName = found.nome;
  }

  // Placar oficial apurado da partida
  let homeScoreVal = 0;
  let awayScoreVal = 0;

  if (match?.homeScore !== undefined && match?.homeScore !== null) {
    homeScoreVal = Number(match.homeScore);
  } else if (match?.placar?.mandante !== undefined && match?.placar?.mandante !== null) {
    homeScoreVal = Number(match.placar.mandante);
  } else if (match?.goals?.home !== undefined && match?.goals?.home !== null) {
    homeScoreVal = Number(match.goals.home);
  } else if (match?.scoreFulltime?.home !== undefined && match?.scoreFulltime?.home !== null) {
    homeScoreVal = Number(match.scoreFulltime.home);
  }

  if (match?.awayScore !== undefined && match?.awayScore !== null) {
    awayScoreVal = Number(match.awayScore);
  } else if (match?.placar?.visitante !== undefined && match?.placar?.visitante !== null) {
    awayScoreVal = Number(match.placar.visitante);
  } else if (match?.goals?.away !== undefined && match?.goals?.away !== null) {
    awayScoreVal = Number(match.goals.away);
  } else if (match?.scoreFulltime?.away !== undefined && match?.scoreFulltime?.away !== null) {
    awayScoreVal = Number(match.scoreFulltime.away);
  }

  // Notas e destaques do modo Express prévios
  const expressNotes = match?.expressNotes?.notes || '';
  const expressHighlights = match?.expressNotes?.highlights || '';
  const expressStandouts = Array.isArray(match?.expressNotes?.highlightedPlayers)
    ? match.expressNotes.highlightedPlayers
    : [];

  const isHighlightedInExpress = (pName, pNum) => {
    if (!pName && !pNum) return false;
    const nameLow = String(pName || '').toLowerCase().trim();
    const numStr = String(pNum || '').trim();
    if (expressHighlights.toLowerCase().includes(nameLow)) return true;
    if (numStr && expressHighlights.includes(`#${numStr}`)) return true;
    if (expressStandouts.some(s => {
      const sName = String(s?.name || s || '').toLowerCase().trim();
      const sNum = String(s?.number || '');
      return (sName && nameLow.includes(sName)) || (sNum && sNum === numStr);
    })) return true;
    return false;
  };

  const buildTeamAthletes = (lineup, playersStat, teamName, isMandante) => {
    const starters = lineup?.startXI || [];
    const subs = lineup?.substitutes || [];
    const combined = [...starters, ...subs];

    if (combined.length > 0) {
      return combined.map((entry, idx) => {
        const p = entry?.player || {};
        const pId = p.id || `${isMandante ? 'home' : 'away'}-${idx + 1}`;
        const pName = p.name || `${teamName} Atleta ${idx + 1}`;
        const pNum = p.number || (idx + 1);
        const pPosCode = mapApiFootballPositionCode(p.pos, p.grid, idx);
        const apiRating = ratingMap[String(p.id)] || ratingMap[pName.toLowerCase().trim()] || '—';
        const isHighlight = isHighlightedInExpress(pName, pNum);

        return {
          id: pId,
          numero: pNum,
          nome: pName,
          posicao: pPosCode,
          time: teamName,
          notaApi: apiRating,
          notaScout: '', // Zerada/em branco para avaliação manual de scout
          destaque: isHighlight,
          destaqueNegativo: false,
          comentario: isHighlight ? 'Destaque anotado durante acompanhamento ao vivo.' : '',
          substitute: idx >= starters.length
        };
      });
    }

    if (Array.isArray(playersStat) && playersStat.length > 0) {
      return playersStat.map((item, idx) => {
        const p = item?.player || {};
        const g = item?.statistics?.[0]?.games || {};
        const pId = p.id || `${isMandante ? 'home' : 'away'}-${idx + 1}`;
        const pName = p.name || `${teamName} Atleta ${idx + 1}`;
        const pNum = g.number || (idx + 1);
        const pPosCode = mapApiFootballPositionCode(g.position, null, idx);
        const apiRating = g.rating || '—';
        const isHighlight = isHighlightedInExpress(pName, pNum);

        return {
          id: pId,
          numero: pNum,
          nome: pName,
          posicao: pPosCode,
          time: teamName,
          notaApi: apiRating,
          notaScout: '', // Zerada/em branco
          destaque: isHighlight,
          destaqueNegativo: false,
          comentario: isHighlight ? 'Destaque anotado durante acompanhamento ao vivo.' : '',
          substitute: Boolean(g.substitute)
        };
      });
    }

    // Padrão 11 atletas editáveis se a API ainda não tiver súmula
    const defaultPositions = ['GOL', 'LD', 'ZAG', 'ZAG', 'LE', 'VOL', 'VOL', 'MEI', 'EXT', 'EXT', 'CA'];
    return defaultPositions.map((pos, idx) => ({
      id: `${isMandante ? 'home' : 'away'}-${idx + 1}`,
      numero: idx + 1,
      nome: `${teamName} Atleta ${idx + 1}`,
      posicao: pos,
      time: teamName,
      notaApi: '—',
      notaScout: '',
      destaque: false,
      destaqueNegativo: false,
      comentario: ''
    }));
  };

  const atletasMandante = buildTeamAthletes(homeLineup, homePlayersStat, homeClub, true);
  const atletasVisitante = buildTeamAthletes(awayLineup, awayPlayersStat, awayClub, false);

  // Compila parecer tático integrando notas do modo Express
  let prefilledTacticalNotes = '';
  if (expressNotes) {
    prefilledTacticalNotes += `[ANOTAÇÕES AO VIVO / MODO EXPRESS]:\n${expressNotes}\n\n`;
  }
  if (expressHighlights) {
    prefilledTacticalNotes += `[DESTAQUES APONTADOS EM CAMPO]:\n${expressHighlights}\n`;
  }

  const matchDate = match?.date || (match?.datetime ? String(match.datetime).split('T')[0] : new Date().toISOString().split('T')[0]);
  const venueText = match?.venue || match?.fixture?.venue?.name || 'Estádio a definir';

  return {
    id: `rep-v2-${match?.id}`,
    fixtureId: String(match?.id),
    matchId: String(match?.id),
    partida: `${homeClub} x ${awayClub}`,
    competicao: match?.leagueName || match?.league?.name || 'Campeonato Oficial',
    campeonato: match?.leagueName || match?.league?.name || 'Campeonato Oficial',
    rodada: match?.round || match?.league?.round || '',
    data: matchDate,
    local: venueText,
    estadio: venueText,
    placar: `${homeScoreVal} x ${awayScoreVal}`,
    placarMandante: homeScoreVal,
    placarVisitante: awayScoreVal,
    placarObj: { mandante: homeScoreVal, visitante: awayScoreVal },
    mandante: { nome: homeClub },
    visitante: { nome: awayClub },
    homeTeam: homeClub,
    awayTeam: awayClub,
    treinadorMandante: coachHomeName,
    treinadorVisitante: coachAwayName,
    esquemaMandante: homeLineup?.formation || '4-3-3',
    esquemaVisitante: awayLineup?.formation || '4-2-3-1',
    atletasMandante,
    atletasVisitante,
    parecerTatico: prefilledTacticalNotes.trim(),
    analiseGeral: prefilledTacticalNotes.trim(),
    expressNotes: match?.expressNotes
  };
}

export default function MatchCalendarV2({
  players = [],
  coaches = [],
  onSavePlayerToRadar,
  onSaveCoach,
  onSaveMatchReport
}) {
  // Estado de partidas e relatórios (inicialização defensiva)
  const [matches, setMatches] = useState(() => {
    try {
      return getStoredMatchesV2() || [];
    } catch (_) {
      return [];
    }
  });
  const [reports, setReports] = useState(() => {
    try {
      return getStoredReportsV2() || [];
    } catch (_) {
      return [];
    }
  });

  // Filtros de UI
  const [selectedLeagueId, setSelectedLeagueId] = useState('todas');
  const [selectedTab, setSelectedTab] = useState('proximos'); // 'proximos' | 'encerrados' | 'todos'
  const [searchQuery, setSearchQuery] = useState('');

  // Status de carregamento e sincronização
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');
  const [apiError, setApiError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Configuração da Chave da API
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    try {
      return getApiFootballKey() || '';
    } catch (_) {
      return '';
    }
  });

  // Modais de Relatório (Relatório Express de Campo oficial e Relatório Completo Pós-Jogo em 2 colunas)
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [quickReportMatchData, setQuickReportMatchData] = useState(null);
  const [isPostMatchModalOpen, setIsPostMatchModalOpen] = useState(false);
  const [selectedPostMatchData, setSelectedPostMatchData] = useState(null);
  const [reportToEdit, setReportToEdit] = useState(null);
  const [loadingLineupMatchId, setLoadingLineupMatchId] = useState(null);
  const [viewPdfReport, setViewPdfReport] = useState(null);

  // Referência para o input de arquivo do Importar Cofre
  const fileInputRef = useRef(null);

  // Dispara toast temporário
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Exportação Completa: Vasculha absolutamente todas as chaves do localStorage (Jogos, Súmulas e Relatórios)
  const handleExportVault = () => {
    try {
      const localStorageDump = {};
      const allMatchesMap = new Map();
      const allReportsMap = new Map();

      // a) Vasculha todas as chaves do localStorage do navegador
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key);
        if (!val) continue;

        const lower = key.toLowerCase();
        const isMatchKey = lower.includes('matches') || lower.includes('vault') || lower.includes('fotmob') || lower.includes('api_football') || lower.includes('agenda');
        const isReportKey = lower.includes('report') || lower.includes('relatorio') || lower.includes('relatorios') || lower.includes('scout_notes');
        const isOtherScoutKey = lower.includes('scout') || lower.includes('radar') || lower.includes('players') || lower.includes('coaches');

        if (isMatchKey || isReportKey || isOtherScoutKey) {
          localStorageDump[key] = val;

          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              if (isMatchKey) {
                parsed.forEach(m => {
                  const mId = m?.id || m?.fixtureId || m?.fixture?.id;
                  if (mId) allMatchesMap.set(String(mId), m);
                });
              }
              if (isReportKey) {
                parsed.forEach(r => {
                  const rId = r?.id || r?.fixtureId || r?.matchId || r?.match_id;
                  if (rId) allReportsMap.set(String(rId), r);
                });
              }
            }
          } catch (_) {}
        }
      }

      // b) Garante que getStoredMatchesV2() e getStoredReportsV2() estejam consolidados
      try {
        const v2Matches = getStoredMatchesV2();
        v2Matches.forEach(m => {
          const mId = m?.id || m?.fixtureId || m?.fixture?.id;
          if (mId) {
            const existing = allMatchesMap.get(String(mId)) || {};
            allMatchesMap.set(String(mId), { ...existing, ...m });
          }
        });

        const v2Reports = getStoredReportsV2();
        v2Reports.forEach(r => {
          const rId = r?.id || r?.fixtureId || r?.matchId || r?.match_id;
          if (rId) {
            const existing = allReportsMap.get(String(rId)) || {};
            allReportsMap.set(String(rId), { ...existing, ...r });
          }
        });
      } catch (_) {}

      const matchesList = Array.from(allMatchesMap.values());
      const reportsList = Array.from(allReportsMap.values());

      // c) Consolida chaves canônicas no dump
      localStorageDump['radar_v2_matches_repository'] = JSON.stringify(matchesList);
      localStorageDump['matchesVault'] = JSON.stringify(matchesList);
      localStorageDump['radar_v2_reports'] = JSON.stringify(reportsList);
      localStorageDump['scout_match_reports'] = JSON.stringify(reportsList);
      localStorageDump['matchReports'] = JSON.stringify(reportsList);

      const backupData = {
        type: 'FULL_AGENDA_VAULT_BACKUP',
        version: '3.0',
        exportedAt: new Date().toISOString(),
        totalMatches: matchesList.length,
        totalReports: reportsList.length,
        matches: matchesList,
        reports: reportsList,
        localStorageDump
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'backup_completo_agenda.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Backup completo gerado! (${matchesList.length} jogos, ${reportsList.length} relatórios)`);
    } catch (err) {
      console.error('[MatchCalendarV2] Erro na exportação completa:', err);
      alert('Erro ao exportar cofre: ' + err.message);
    }
  };

  // 2. Importação com Merge e Atualização Instantânea: Restaura tudo no localStorage, Supabase e recarrega a página
  const handleImportVault = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (!text || typeof text !== 'string') {
          throw new Error('Arquivo vazio ou ilegível');
        }

        const data = JSON.parse(text);

        // a) Percorre cada chave presente no dump e grava no localStorage com merge por ID
        if (data.localStorageDump && typeof data.localStorageDump === 'object') {
          Object.entries(data.localStorageDump).forEach(([k, rawVal]) => {
            if (!k || rawVal === undefined || rawVal === null) return;
            try {
              const strVal = typeof rawVal === 'string' ? rawVal : JSON.stringify(rawVal);
              const existingRaw = localStorage.getItem(k);

              if (existingRaw) {
                try {
                  const existingParsed = JSON.parse(existingRaw);
                  const incomingParsed = JSON.parse(strVal);

                  if (Array.isArray(existingParsed) && Array.isArray(incomingParsed)) {
                    const mapById = new Map();
                    existingParsed.forEach(item => {
                      const id = item && (item.id || item.fixtureId);
                      if (id) mapById.set(String(id), item);
                    });
                    incomingParsed.forEach(item => {
                      const id = item && (item.id || item.fixtureId);
                      if (id) {
                        const prev = mapById.get(String(id)) || {};
                        mapById.set(String(id), { ...prev, ...item });
                      } else {
                        mapById.set(String(Math.random()), item);
                      }
                    });
                    localStorage.setItem(k, JSON.stringify(Array.from(mapById.values())));
                    return;
                  }
                } catch (_) {}
              }

              localStorage.setItem(k, strVal);
            } catch (kErr) {
              console.warn('[MatchCalendarV2] Erro ao restaurar chave:', k, kErr);
            }
          });
        }

        // b) Extrai arrays unificados de partidas e relatórios
        let incomingMatches = [];
        let incomingReports = [];

        if (Array.isArray(data)) {
          incomingMatches = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.matches)) incomingMatches = data.matches;
          else if (Array.isArray(data.matchesVault)) incomingMatches = data.matchesVault;
          else if (Array.isArray(data.radar_v2_matches_repository)) incomingMatches = data.radar_v2_matches_repository;

          if (Array.isArray(data.reports)) incomingReports = data.reports;
          else if (Array.isArray(data.radar_v2_reports)) incomingReports = data.radar_v2_reports;
          else if (Array.isArray(data.scout_match_reports)) incomingReports = data.scout_match_reports;
          else if (Array.isArray(data.matchReports)) incomingReports = data.matchReports;
        }

        // c) Merge seguro das partidas no cofre local (preserva relatórios concluídos e jogos cadastrados)
        if (incomingMatches.length > 0) {
          mergeMatchesIntoVault(incomingMatches);
        }

        // d) Salva e vincula relatórios nas chaves canônicas
        if (incomingReports.length > 0) {
          incomingReports.forEach(rep => {
            saveStoredReportV2(rep);
          });
        }

        // e) Garante que os relatórios estejam associados às partidas no cofre
        const currentMatches = getStoredMatchesV2();
        const currentReports = getStoredReportsV2();

        const linkedMatches = currentMatches.map(m => {
          const rep = currentReports.find(r => 
            (r?.fixtureId && String(r.fixtureId) === String(m.id)) ||
            (r?.matchId && String(r.matchId) === String(m.id)) ||
            (r?.match_id && String(r.match_id) === String(m.id)) ||
            (m.fixtureId && r?.fixtureId && String(r.fixtureId) === String(m.fixtureId)) ||
            (m.reportId && String(r?.id) === String(m.reportId)) ||
            (r?.id && String(r.id) === String(m.id)) ||
            (r?.partida && m.homeTeam && m.awayTeam && r.partida.toLowerCase().includes(m.homeTeam.toLowerCase()) && r.partida.toLowerCase().includes(m.awayTeam.toLowerCase()))
          ) || m.scoutReport;

          if (rep) {
            return {
              ...m,
              hasReport: true,
              reportStatus: 'CONCLUIDO',
              reportId: rep.id || m.id,
              scoutReport: rep,
              isArchived: true // Partidas com relatório completo ficam no histórico
            };
          }
          return m;
        });

        saveStoredMatchesV2(linkedMatches);

        // Atualiza chaves legadas e padrão para sincronização perfeita de tela
        try {
          const existingScoutReports = JSON.parse(localStorage.getItem('scout_match_reports') || '[]');
          const mergedScoutReports = [...currentReports];
          existingScoutReports.forEach(er => {
            if (!mergedScoutReports.some(mr => String(mr.id) === String(er.id))) {
              mergedScoutReports.push(er);
            }
          });
          localStorage.setItem('scout_match_reports', JSON.stringify(mergedScoutReports));
          localStorage.setItem('matchReports', JSON.stringify(mergedScoutReports));
          localStorage.setItem('radar_match_reports', JSON.stringify(mergedScoutReports));
        } catch (_) {}

        // f) Sincronização em Nuvem (Supabase)
        try {
          await syncVaultToSupabase(linkedMatches);
        } catch (_) {}

        const finalMatchesCount = linkedMatches.length;
        const finalReportsCount = currentReports.length;

        // g) Mostra alert de sucesso informando quantos jogos e relatórios foram recuperados
        alert(
          `Backup completo importado com sucesso!\n\n` +
          `• ${finalMatchesCount} partidas salvas no cofre\n` +
          `• ${finalReportsCount} relatórios completos recuperados\n\n` +
          `A página será recarregada para atualizar a Agenda e exibir os botões de relatório.`
        );

        // h) Force reload suave para leitura imediata dos dados importados
        window.location.reload();
      } catch (err) {
        console.error('[MatchCalendarV2] Erro na importação:', err);
        alert('Erro ao importar backup: ' + err.message);
      } finally {
        if (e.target) e.target.value = '';
      }
    };

    reader.onerror = () => {
      alert('Falha ao abrir arquivo.');
      if (e.target) e.target.value = '';
    };

    reader.readAsText(file);
  };

  // Carregamento inicial defensivo do cofre local e sincronização em nuvem (Supabase)
  useEffect(() => {
    let isMounted = true;

    // 1. Carrega imediatamente do cofre local
    try {
      const clean = getStoredMatchesV2();
      setMatches(clean);
    } catch (e) {
      console.warn('[MatchCalendarV2] Erro ao carregar cache local:', e);
    }

    try {
      const loadedReports = getStoredReportsV2();
      setReports(Array.isArray(loadedReports) ? loadedReports : []);
    } catch (_) {}

    // 2. Sincronização em Nuvem (Supabase) - garante paridade entre Localhost e Vercel
    async function initCloudSync() {
      try {
        const remoteMatches = await fetchMatchesFromSupabase();
        if (isMounted && Array.isArray(remoteMatches)) {
          if (remoteMatches.length > 0) {
            mergeMatchesIntoVault(remoteMatches);
            const merged = getStoredMatchesV2();
            setMatches(merged);
          } else {
            const currentLocal = getStoredMatchesV2();
            if (currentLocal.length > 0) {
              await syncVaultToSupabase(currentLocal);
            }
          }
        }
      } catch (err) {
        console.warn('[MatchCalendarV2] Sincronização inicial com Supabase:', err);
      }
    }

    initCloudSync();

    // 3. Dispara a sincronização dinâmica por janela móvel (-3 a +7 dias)
    handleSyncAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sincronizar uma liga específica por janela móvel dinâmica (-3 a +7 dias)
  const handleSyncLeague = async (leagueId) => {
    setIsSyncing(true);
    setApiError(null);
    setSyncProgress('Consultando API-Football...');

    try {
      const res = await syncLeagueFixtures({
        leagueId,
        onProgress: (msg) => setSyncProgress(msg)
      });

      if (res.success) {
        const updated = getStoredMatchesV2();
        setMatches(updated);
        syncVaultToSupabase(updated).catch(() => {});
        showToast(`Sincronização concluída: ${res.updatedCount || 0} jogos atualizados, ${res.newCount || 0} novas partidas encontradas.`);
      } else {
        setApiError(res.error || 'Nenhum jogo presente ou futuro encontrado para esta liga.');
      }
    } catch (err) {
      setApiError(`Erro de conexão: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  // Sincronizar todas as ligas monitoradas por janela móvel dinâmica (-3 a +7 dias)
  const handleSyncAll = async () => {
    setIsSyncing(true);
    setApiError(null);
    setSyncProgress('Sincronizando rodadas oficiais...');

    try {
      const res = await syncAllMonitoredLeagues((msg) => setSyncProgress(msg));
      const updated = getStoredMatchesV2();
      setMatches(updated);
      syncVaultToSupabase(updated).catch(() => {});

      if (res.success) {
        showToast(`Sincronização concluída: ${res.updatedCount || 0} jogos atualizados, ${res.newCount || 0} novas partidas encontradas.`);
      }
    } catch (err) {
      console.warn('[MatchCalendarV2] Erro na sincronização:', err);
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  // Mover para Jogos Encerrados (Histórico) e abrir diretamente o Relatório Completo Pós-Jogo
  const handleArchiveMatch = async (match) => {
    if (!match || !match.id) return;
    const updated = matches.map(m => {
      if (String(m.id) === String(match.id)) {
        return { ...m, isArchived: true, archivedAt: new Date().toISOString() };
      }
      return m;
    });
    setMatches(updated);
    saveStoredMatchesV2(updated);
    syncVaultToSupabase(updated).catch(() => {});
    setSelectedTab('encerrados');
    showToast(`Partida "${match.homeTeam} x ${match.awayTeam}" movida para Jogos Encerrados.`);
    await handleOpenCreateReport({ ...match, isArchived: true });
  };

  // Desarquivar partida
  const handleUnarchiveMatch = (match) => {
    if (!match || !match.id) return;
    const updated = matches.map(m => {
      if (String(m.id) === String(match.id)) {
        return { ...m, isArchived: false, archivedAt: null };
      }
      return m;
    });
    setMatches(updated);
    saveStoredMatchesV2(updated);
    syncVaultToSupabase(updated).catch(() => {});
    showToast(`Partida "${match.homeTeam} x ${match.awayTeam}" retornada para Próximos.`);
  };

  // Abrir o VERDADEIRO Relatório Express (Campo / Touch) oficial
  const handleOpenQuickReport = (match) => {
    if (!match) return;
    const homeName = match?.homeTeam || match?.teams?.home?.name || 'Mandante';
    const awayName = match?.awayTeam || match?.teams?.away?.name || 'Visitante';
    const comp = mapCompetitionToQuick(match?.leagueName || match?.league?.name || '');
    const matchDate = match?.date || (match?.datetime ? String(match.datetime).split('T')[0] : new Date().toISOString().split('T')[0]);
    const venue = match?.venue || match?.fixture?.venue?.name || '';

    const quickData = {
      id: `rep-express-${match.id || Date.now()}`,
      fixtureId: String(match.id),
      matchId: String(match.id),
      partida: `${homeName} x ${awayName}`,
      mandante: { nome: homeName },
      visitante: { nome: awayName },
      homeTeam: homeName,
      awayTeam: awayName,
      competicao: comp,
      campeonato: comp,
      data: matchDate,
      local: venue,
      estadio: venue,
      treinadorMandante: match?.treinadorMandante || match?.coachHome?.name || match?.coachHome || '',
      treinadorVisitante: match?.treinadorVisitante || match?.coachAway?.name || match?.coachAway || '',
      // Lista limpa para busca/inserção de atletas de campo conforme diretriz estrita
      atletasAvaliados: [],
      atletasMandante: [],
      atletasVisitante: []
    };

    setQuickReportMatchData(quickData);
    setIsQuickReportOpen(true);
  };

  // Salvar direto do Relatório Express de Campo oficial
  const handleSaveQuickReport = (reportPayload, provisorioPlayers = [], provisorioCoaches = []) => {
    if (!reportPayload) return;

    const targetMatchId = String(
      reportPayload.fixtureId ||
      reportPayload.matchId ||
      quickReportMatchData?.fixtureId ||
      reportPayload.id ||
      ''
    );

    const safePayload = {
      ...reportPayload,
      fixtureId: targetMatchId,
      matchId: targetMatchId
    };

    // 1. Salva no banco de relatórios V2
    const nextReports = saveStoredReportV2(safePayload);
    setReports(nextReports || getStoredReportsV2());

    // 2. Atualiza a partida no repositório local
    const updated = matches.map(m => {
      if (String(m.id) === targetMatchId || String(m?.fixture?.id) === targetMatchId) {
        return {
          ...m,
          hasReport: true,
          reportStatus: 'CONCLUIDO',
          reportId: safePayload.id,
          scoutReport: safePayload
        };
      }
      return m;
    });
    setMatches(updated);
    saveStoredMatchesV2(updated);

    // 3. Salva no repositório padrão de relatórios ('matchReports' / 'scout_match_reports') integrando com Seleção do Campeonato e Lista Geral
    if (onSaveMatchReport) {
      onSaveMatchReport(safePayload, provisorioPlayers, provisorioCoaches);
    }

    setIsQuickReportOpen(false);
    setQuickReportMatchData(null);
    showToast('Relatório de Campo salvo com sucesso no banco oficial!');
  };

  // Abrir fluxo de Relatório Completo Pós-Jogo
  const handleOpenCreateReport = async (match) => {
    if (!match) return;
    setLoadingLineupMatchId(match.id);
    try {
      const apiData = await fetchFixtureLineupsAndPlayers(match.id);
      const formatted = buildMatchDataForPostMatchReport(match, apiData, coaches);
      setSelectedPostMatchData(formatted);
      setReportToEdit(null);
      setIsPostMatchModalOpen(true);
    } catch (err) {
      console.warn('[MatchCalendarV2] Erro ao carregar súmula:', err);
      const fallback = buildMatchDataForPostMatchReport(match, null, coaches);
      setSelectedPostMatchData(fallback);
      setReportToEdit(null);
      setIsPostMatchModalOpen(true);
    } finally {
      setLoadingLineupMatchId(null);
    }
  };

  // Abrir edição de relatório existente
  const handleOpenEditReport = (match, existingReport) => {
    if (!match) return;
    setReportToEdit(existingReport || match?.scoutReport);
    setSelectedPostMatchData(null);
    setIsPostMatchModalOpen(true);
  };

  // Salvar relatório pós-jogo oficial com persistência unificada total
  const handleSaveFullReport = (reportPayload) => {
    if (!reportPayload) return;

    const targetMatchId = String(
      reportPayload.fixtureId ||
      reportPayload.matchId ||
      selectedPostMatchData?.fixtureId ||
      reportToEdit?.fixtureId ||
      reportPayload.id ||
      ''
    );

    const safePayload = {
      ...reportPayload,
      fixtureId: targetMatchId,
      matchId: targetMatchId
    };

    // 1. Salva no banco de relatórios V2
    const nextReports = saveStoredReportV2(safePayload);
    setReports(nextReports || getStoredReportsV2());

    // 2. Atualiza a partida no repositório de partidas da Agenda 2.0
    const updated = matches.map(m => {
      if (String(m.id) === targetMatchId || String(m?.fixture?.id) === targetMatchId) {
        return {
          ...m,
          hasReport: true,
          reportStatus: 'CONCLUIDO',
          reportId: safePayload.id,
          scoutReport: safePayload
        };
      }
      return m;
    });
    setMatches(updated);
    saveStoredMatchesV2(updated);

    // 3. Persistência direta em localStorage 'matchReports' e 'scout_match_reports' para retrocompatibilidade
    try {
      const storedM = JSON.parse(localStorage.getItem('matchReports') || '[]');
      const filteredM = storedM.filter(r => String(r.id) !== String(safePayload.id));
      localStorage.setItem('matchReports', JSON.stringify([safePayload, ...filteredM]));
    } catch (_) {}

    // 4. Notifica o sistema principal (App.jsx) para salvar em scout_match_reports/radar_match_reports e auto-cadastrar atletas estrela (★) no banco
    if (onSaveMatchReport) {
      onSaveMatchReport(safePayload);
    }

    setIsPostMatchModalOpen(false);
    setSelectedPostMatchData(null);
    setReportToEdit(null);
    showToast('Relatório oficial salvo e integrado com sucesso!');
  };

  // Salvar configurações de API
  const handleSaveSettings = (e) => {
    e.preventDefault();
    try {
      setCustomApiKey(apiKeyInput);
      setIsSettingsOpen(false);
      showToast('Chave da API-Football salva com sucesso!');
    } catch (_) {
      showToast('Erro ao salvar chave.');
    }
  };

  // Filtros de Partidas por aba (Separação Automática)
  // "Próximos / Hoje": Agendados ('NS', 'TBD') ou data >= hoje 00:00:00 e não finalizados
  const upcomingAndLiveMatches = useMemo(() => {
    return (matches || []).filter(m => {
      if (!m) return false;
      // Se a partida encerrou, foi arquivada ou tem data anterior a hoje, vai para Histórico
      if (isMatchFinishedOrPast(m)) return false;

      if (selectedLeagueId !== 'todas' && m.leagueId !== selectedLeagueId && m.league?.id !== selectedLeagueId) return false;

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const home = (m.homeTeam || m.teams?.home?.name || '').toLowerCase();
        const away = (m.awayTeam || m.teams?.away?.name || '').toLowerCase();
        const lg = (m.leagueName || m.league?.name || '').toLowerCase();
        const ven = (m.venue || m.fixture?.venue?.name || '').toLowerCase();
        return home.includes(q) || away.includes(q) || lg.includes(q) || ven.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a?.datetime || a?.date || a?.fixture?.date || 0);
      const dateB = new Date(b?.datetime || b?.date || b?.fixture?.date || 0);
      return dateA - dateB;
    });
  }, [matches, selectedLeagueId, searchQuery]);

  // "Jogos Encerrados (Histórico)": Finalizados ('FT', 'AET', 'PEN', etc.) OU data < hoje OU arquivados
  const finishedMatches = useMemo(() => {
    return (matches || []).filter(m => {
      if (!m) return false;
      // Apenas partidas que já encerraram ou cuja data é anterior a hoje
      if (!isMatchFinishedOrPast(m)) return false;

      if (selectedLeagueId !== 'todas' && m.leagueId !== selectedLeagueId && m.league?.id !== selectedLeagueId) return false;

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const home = (m.homeTeam || m.teams?.home?.name || '').toLowerCase();
        const away = (m.awayTeam || m.teams?.away?.name || '').toLowerCase();
        const lg = (m.leagueName || m.league?.name || '').toLowerCase();
        const ven = (m.venue || m.fixture?.venue?.name || '').toLowerCase();
        return home.includes(q) || away.includes(q) || lg.includes(q) || ven.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a?.datetime || a?.date || a?.fixture?.date || 0);
      const dateB = new Date(b?.datetime || b?.date || b?.fixture?.date || 0);
      return dateB - dateA; // Mais recentes primeiro
    });
  }, [matches, selectedLeagueId, searchQuery]);

  // Contagens por liga
  const leagueCounts = useMemo(() => {
    const counts = {};
    (API_FOOTBALL_LEAGUES || []).forEach(l => {
      counts[l.id] = (matches || []).filter(m => (m?.leagueId === l.id || m?.league?.id === l.id)).length;
    });
    return counts;
  }, [matches]);

  // Checar se o jogador já está no banco de dados principal
  const isPlayerInDatabase = (playerName) => {
    if (!playerName || !Array.isArray(players)) return false;
    const clean = playerName.toLowerCase().trim();
    return players.some(p => (p.nome || '').toLowerCase().trim() === clean);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOAST FLUTUANTE */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. HEADER DA AGENDA 2.0 */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold tracking-wider">
                  API-FOOTBALL v3
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {matches.length} partidas no cofre
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Agenda Oficial de Jogos</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Calendário oficial presente e futuro das competições nacionais e continentais com súmulas oficiais e notas SofaScore/API-Sports.
              </p>
            </div>

            {/* AÇÕES PRINCIPAIS */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleExportVault}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                title="Exportar backup completo do cofre de jogos (.json)"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>📤 Exportar Cofre</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                title="Importar backup do cofre de jogos (.json)"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>📥 Importar Cofre</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportVault}
                className="hidden"
              />

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                title="Configurar Chave da API"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Configurar API</span>
              </button>

              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{syncProgress || 'Sincronizando...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Sincronizar Todas as Ligas</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BADGES DE COMPETIÇÕES MONITORADAS */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
            <button
              onClick={() => setSelectedLeagueId('todas')}
              className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
                selectedLeagueId === 'todas'
                  ? 'bg-emerald-500/15 border-emerald-500/50 shadow-xs'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-slate-400 font-medium text-[10px] truncate">Todas as Ligas</span>
              <span className="font-bold text-white font-mono text-xs">
                {matches.length} <span className="text-[9px] font-normal text-slate-500">jogos</span>
              </span>
            </button>

            {API_FOOTBALL_LEAGUES.map(lg => {
              const isSel = selectedLeagueId === lg.id;
              const count = leagueCounts[lg.id] || 0;
              return (
                <div
                  key={lg.id}
                  onClick={() => setSelectedLeagueId(lg.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedLeagueId(lg.id); }}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 transition cursor-pointer text-left ${
                    isSel
                      ? 'bg-blue-500/15 border-blue-500/50 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-slate-400 font-medium text-[10px] truncate">{lg.shortName}</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 font-mono text-xs">
                      {count} <span className="text-[9px] font-normal text-slate-500">jogos</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncLeague(lg.id);
                      }}
                      className="text-[10px] text-slate-500 hover:text-emerald-400 p-0.5 rounded transition"
                      title={`Atualizar ${lg.name}`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BANNER AMIGÁVEL DE STATUS / ERRO DE REDE */}
        {apiError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold block">Status da Conexão com API-Football:</span>
                <span className="text-xs text-slate-300 block truncate">{apiError}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Tentar Novamente</span>
              </button>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-slate-400 hover:text-white p-1 text-xs"
                title="Fechar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 2. BARRA DE ABAS E BUSCA */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedTab('proximos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'proximos'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⏳ Próximos / Hoje</span>
              <span className="px-1.5 py-0.2 bg-slate-950/60 rounded-full text-[10px] font-mono text-emerald-400 font-semibold">
                {upcomingAndLiveMatches.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('encerrados')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'encerrados'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>✅ Jogos Encerrados (Histórico)</span>
              <span className="px-1.5 py-0.2 bg-slate-950/60 rounded-full text-[10px] font-mono text-blue-400 font-semibold">
                {finishedMatches.length}
              </span>
            </button>
          </div>

          <div className="relative min-w-[280px] md:min-w-[320px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por clube (ex: Palmeiras, Grêmio, Santos)..."
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

        {/* 3. CONTEÚDO PRINCIPAL DAS ABAS */}
        {selectedTab === 'proximos' ? (
          /* ABA A: PRÓXIMOS / AO VIVO */
          upcomingAndLiveMatches.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1">
                <Calendar className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nenhum próximo jogo agendado na base</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Clique em [ Sincronizar Todas as Ligas ] para buscar confrontos oficiais da API-Football.
                </p>
              </div>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Buscar Próximos Jogos</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcomingAndLiveMatches.map((match) => {
                const isLive = LIVE_STATUS_CODES.includes(match?.status || match?.fixture?.status?.short);
                const hasExpressNotes = Boolean(match?.expressNotes);
                const homeName = match?.homeTeam || match?.teams?.home?.name || 'Mandante';
                const awayName = match?.awayTeam || match?.teams?.away?.name || 'Visitante';
                const leagueTitle = match?.leagueName || match?.league?.name || 'Competição Oficial';
                const roundText = match?.round || match?.league?.round || '';
                const venueName = match?.venue || match?.fixture?.venue?.name || 'Estádio a definir';
                const cityName = match?.city || match?.fixture?.venue?.city || '';
                const matchDateText = match?.date || (match?.datetime ? String(match.datetime).split('T')[0] : '');
                const matchTimeText = match?.time || '—';
                const mKey = match?.id || match?.fixtureId || match?.fixture?.id || Math.random();

                return (
                  <div
                    key={mKey}
                    className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                  >
                    <div>
                      {/* Header: Competição, Rodada e Status */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-emerald-400 truncate">
                            {leagueTitle}
                          </span>
                          {roundText && (
                            <>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {roundText}
                              </span>
                            </>
                          )}
                        </div>

                        {isLive ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold animate-pulse shrink-0 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                            AO VIVO ({match?.elapsed || 0}')
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            {matchTimeText}
                          </span>
                        )}
                      </div>

                      {/* Confronto Central: Nomes Limpos sem escudos quebrados */}
                      <div className="flex items-center justify-between py-3 px-4 bg-slate-950/60 border border-slate-800/80 rounded-xl mb-3">
                        <span className="text-base font-bold text-slate-100 flex-1 text-right pr-3 truncate" title={homeName}>
                          {homeName}
                        </span>
                        {isLive ? (
                          <div className="px-2.5 py-1 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs font-mono font-bold text-rose-400 shrink-0">
                            {match?.homeScore ?? 0} x {match?.awayScore ?? 0}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-amber-400 rounded shrink-0">
                            VS
                          </span>
                        )}
                        <span className="text-base font-bold text-slate-100 flex-1 text-left pl-3 truncate" title={awayName}>
                          {awayName}
                        </span>
                      </div>

                      {/* Metadados: Data, Horário e Estádio */}
                      <div className="space-y-1.5 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {matchDateText}
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {matchTimeText}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{venueName} {cityName ? `(${cityName})` : ''}</span>
                        </div>
                      </div>

                      {/* Badge se houver relatório express ou completo salvo */}
                      {(hasExpressNotes || match?.hasReport) && (
                        <div className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{match?.hasReport ? 'Relatório Oficial vinculado' : 'Relatório Express registrado'}</span>
                        </div>
                      )}
                    </div>

                    {/* Ações do Card: Relatório Ao Vivo (Express) + Arquivar */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenQuickReport(match)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-500/50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        <span>📱 Acompanhar / Ao Vivo</span>
                      </button>

                      <button
                        onClick={() => handleArchiveMatch(match)}
                        className="py-2 px-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                        title="Mover para Jogos Encerrados e Abrir Relatório Completo Pós-Jogo"
                      >
                        <Archive className="w-3.5 h-3.5 text-slate-400" />
                        <span>📦 Encerrar / Pós-Jogo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ABA B: JOGOS ENCERRADOS (HISTÓRICO PERMANENTE) */
          finishedMatches.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1">
                <CheckCircle2 className="w-8 h-8 stroke-[1.5] text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nenhum jogo encerrado no histórico ainda</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Jogos finalizados da API-Football ou confrontos arquivados permanecerão salvos aqui permanentemente.
                </p>
              </div>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sincronizar Jogos Recentes</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {finishedMatches.map((match) => {
                const report = (reports || []).find(r => 
                  (r?.fixtureId && String(r.fixtureId) === String(match?.id)) ||
                  (r?.matchId && String(r.matchId) === String(match?.id)) ||
                  (r?.match_id && String(r.match_id) === String(match?.id)) ||
                  (match?.fixtureId && r?.fixtureId && String(r.fixtureId) === String(match.fixtureId)) ||
                  (match?.reportId && String(r?.id) === String(match.reportId)) ||
                  (r?.id && String(r.id) === String(match?.id)) ||
                  (r?.partida && match?.homeTeam && match?.awayTeam && r.partida.toLowerCase().includes(match.homeTeam.toLowerCase()) && r.partida.toLowerCase().includes(match.awayTeam.toLowerCase()))
                ) || match?.scoutReport;
                const isReportDone = Boolean(report || match?.hasReport || match?.scoutReport || match?.reportStatus === 'CONCLUIDO');
                const homeName = match?.homeTeam || match?.teams?.home?.name || 'Mandante';
                const awayName = match?.awayTeam || match?.teams?.away?.name || 'Visitante';
                const leagueTitle = match?.leagueName || match?.league?.name || 'Competição Oficial';
                const roundText = match?.round || match?.league?.round || '';
                const venueName = match?.venue || match?.fixture?.venue?.name || 'Estádio a definir';
                const cityName = match?.city || match?.fixture?.venue?.city || '';
                const matchDateText = match?.date || (match?.datetime ? String(match.datetime).split('T')[0] : '');
                const mKey = match?.id || match?.fixtureId || match?.fixture?.id || Math.random();
                const statusShort = match?.statusShort || match?.status || 'FT';

                return (
                  <div
                    key={mKey}
                    className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/20"
                  >
                    <div>
                      {/* Header: Competição e Badge de Relatório */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-slate-300 truncate">
                            {leagueTitle}
                          </span>
                          {roundText && (
                            <>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {roundText}
                              </span>
                            </>
                          )}
                        </div>

                        {isReportDone ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Concluído</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Pendente de Análise</span>
                          </span>
                        )}
                      </div>

                      {/* Placar Final Central */}
                      <div className="flex items-center justify-between py-3 px-4 bg-slate-950/60 border border-slate-800/80 rounded-xl mb-3">
                        <span className="text-base font-bold text-slate-100 flex-1 text-right pr-3 truncate" title={homeName}>
                          {homeName}
                        </span>
                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 font-mono font-black text-emerald-400 text-sm shrink-0">
                          <span>{match?.homeScore ?? 0}</span>
                          <span className="text-slate-500 text-xs">x</span>
                          <span>{match?.awayScore ?? 0}</span>
                        </div>
                        <span className="text-base font-bold text-slate-100 flex-1 text-left pl-3 truncate" title={awayName}>
                          {awayName}
                        </span>
                      </div>

                      {/* Metadados: Data, Horário e Estádio */}
                      <div className="space-y-1.5 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {matchDateText}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {statusShort === 'FT' ? "Encerrado (90')" : (match?.statusLong || 'Concluído')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{venueName} {cityName ? `(${cityName})` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ações do Card de Jogo Encerrado */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      {isReportDone ? (
                        <>
                          <button
                            onClick={() => setViewPdfReport(report || match?.scoutReport)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>👁️ Ver / PDF</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditReport(match, report || match?.scoutReport)}
                            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                            title="Editar Relatório"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenCreateReport(match)}
                            disabled={loadingLineupMatchId === match?.id}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30 cursor-pointer active:scale-95"
                          >
                            {loadingLineupMatchId === match?.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Carregando Súmula...</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                <span>📋 Relatório Completo Pós-Jogo</span>
                              </>
                            )}
                          </button>
                          {match?.isArchived && (
                            <button
                              onClick={() => handleUnarchiveMatch(match)}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 transition cursor-pointer"
                              title="Retornar para Próximos"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>

      {/* MODAL 1: RELATÓRIO EXPRESS OFICIAL (CAMPO / TOUCH) */}
      <QuickMatchReportModal
        isOpen={isQuickReportOpen}
        onClose={() => {
          setIsQuickReportOpen(false);
          setQuickReportMatchData(null);
        }}
        matchData={quickReportMatchData}
        onSaveReport={handleSaveQuickReport}
        onSaveSuccess={handleSaveQuickReport}
        players={players}
        coaches={coaches}
      />

      {/* MODAL 2: FLUXO B - RELATÓRIO COMPLETO PÓS-JOGO OFICIAL (2 COLUNAS CONSOLIDADAS) */}
      <PostMatchReportModal
        isOpen={isPostMatchModalOpen}
        onClose={() => {
          setIsPostMatchModalOpen(false);
          setSelectedPostMatchData(null);
          setReportToEdit(null);
        }}
        matchData={selectedPostMatchData}
        match={selectedPostMatchData}
        reportToEdit={reportToEdit}
        isEditing={Boolean(reportToEdit)}
        onSaveReport={handleSaveFullReport}
        onSavePlayerToRadar={onSavePlayerToRadar}
        onSaveCoach={onSaveCoach}
        existingPlayers={players}
        existingCoaches={coaches}
      />

      {/* MODAL 3: VISUALIZADOR DE RELATÓRIO / PDF */}
      {viewPdfReport && (
        <ReportPdfViewerModal
          report={viewPdfReport}
          onClose={() => setViewPdfReport(null)}
        />
      )}

      {/* MODAL 4: CONFIGURAÇÃO DE API & TEMPORADA */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                Configuração da API-Football
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Chave API-Sports (x-apisports-key):
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Insira sua chave da API-Sports..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-emerald-400">
                  Monitoramento Ativo: Temporada 2026
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Foco exclusivo em jogos presentes (a partir de 18/09/2026) e futuros das competições oficiais brasileiras e continentais.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 font-bold"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * COMPONENTE MODAL: VISUALIZADOR DE RELATÓRIO OFICIAL / PDF (FORMATO ABNT SCOUT)
 */
function ReportPdfViewerModal({ report, onClose }) {
  if (!report) return null;

  const homeName = report.homeTeam || report.mandante?.nome || 'Mandante';
  const awayName = report.awayTeam || report.visitante?.nome || 'Visitante';
  const scoreText = report.score || report.placar || (report.placarMandante !== undefined ? `${report.placarMandante} x ${report.placarVisitante}` : 'x');
  const leagueName = report.leagueName || report.competicao || report.campeonato || 'Competição Oficial';
  const roundText = report.round || report.rodada || '';
  const dateText = report.date || report.data || '';
  const venueText = report.venue || report.local || report.estadio || 'Estádio';
  const tacticalNotes = report.generalTacticalNotes || report.analiseGeral || report.parecerTatico || '';

  // Treinadores
  let coachHome = report.coachHome;
  let coachAway = report.coachAway;

  if (Array.isArray(report.treinadoresAvaliados) && report.treinadoresAvaliados.length > 0) {
    const m = report.treinadoresAvaliados.find(c => c && c.time === 'mandante');
    const v = report.treinadoresAvaliados.find(c => c && c.time === 'visitante');
    if (m) coachHome = { name: m.nome, rating: m.nota, notes: m.comentario || m.parecer, scheme: m.esquema };
    if (v) coachAway = { name: v.nome, rating: v.nota, notes: v.comentario || v.parecer, scheme: v.esquema };
  }

  // Atletas
  const homeAthletes = Array.isArray(report.atletasMandante) ? report.atletasMandante : [];
  const awayAthletes = Array.isArray(report.atletasVisitante) ? report.atletasVisitante : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full my-auto shadow-2xl p-6 md:p-8 space-y-6 print:border-none print:bg-white print:text-black print:p-0">
        
        {/* HEADER DO MODAL (OCULTO NA IMPRESSÃO) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Súmula Oficial de Scout & Avaliação</h3>
              <p className="text-xs text-slate-400">Relatório técnico pós-jogo consolidado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 text-base">✕</button>
          </div>
        </div>

        {/* CABEÇALHO DO RELATÓRIO TÉCNICO */}
        <div className="text-center border-b border-slate-800 pb-6 print:border-slate-300">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest print:text-emerald-700">
            {leagueName} {roundText ? `• ${roundText}` : ''}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-1 print:text-black">
            {homeName} <span className="font-mono text-emerald-400 print:text-black">{scoreText}</span> {awayName}
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-2 print:text-slate-600">
            <span>📅 {dateText}</span>
            <span>📍 {venueText}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold print:border">
              STATUS: CONCLUÍDO
            </span>
          </div>
        </div>

        {/* PARECER TÁTICO GERAL */}
        {tacticalNotes && (
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1.5 print:border-slate-300 print:bg-slate-50">
            <h4 className="text-xs font-bold text-slate-300 print:text-black flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>PARECER TÁTICO GERAL / OBSERVAÇÕES DE CAMPO:</span>
            </h4>
            <p className="text-xs text-slate-300 print:text-slate-800 whitespace-pre-wrap leading-relaxed">
              {tacticalNotes}
            </p>
          </div>
        )}

        {/* COMISSÕES TÉCNICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-1.5 print:border-slate-300 print:bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider print:text-emerald-800">
                COMISSÃO MANDANTE: {homeName}
              </span>
              {coachHome?.scheme && (
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                  Esquema: {coachHome.scheme}
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-white print:text-black flex items-center justify-between">
              <span>{coachHome?.name || 'Treinador não informado'}</span>
              {coachHome?.rating && (
                <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-xs print:text-black print:border-slate-400">
                  Nota: {coachHome.rating}
                </span>
              )}
            </div>
            {coachHome?.notes && (
              <p className="text-xs text-slate-400 print:text-slate-700 mt-1">{coachHome.notes}</p>
            )}
          </div>

          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-1.5 print:border-slate-300 print:bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider print:text-blue-800">
                COMISSÃO VISITANTE: {awayName}
              </span>
              {coachAway?.scheme && (
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                  Esquema: {coachAway.scheme}
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-white print:text-black flex items-center justify-between">
              <span>{coachAway?.name || 'Treinador não informado'}</span>
              {coachAway?.rating && (
                <span className="font-mono text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-xs print:text-black print:border-slate-400">
                  Nota: {coachAway.rating}
                </span>
              )}
            </div>
            {coachAway?.notes && (
              <p className="text-xs text-slate-400 print:text-slate-700 mt-1">{coachAway.notes}</p>
            )}
          </div>
        </div>

        {/* LISTAS DE ATLETAS DAS DUAS EQUIPES LADO A LADO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MANDANTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2 print:border-slate-300">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider print:text-emerald-800">
                {homeName} (Atletas)
              </h4>
              <span className="text-[10px] text-slate-400 print:text-slate-600">
                {homeAthletes.length} atletas avaliados
              </span>
            </div>

            <div className="space-y-1.5">
              {homeAthletes.length > 0 ? (
                homeAthletes.map((a, idx) => (
                  <div
                    key={a.id || idx}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      a.destaque || a.isHighlight
                        ? 'bg-amber-950/20 border-amber-500/40 print:bg-amber-50'
                        : 'bg-slate-950/40 border-slate-800/80 print:bg-white print:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300 flex items-center justify-center shrink-0 print:border">
                        {a.numero || a.number || (idx + 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white print:text-black truncate flex items-center gap-1">
                          <span>{a.nome || a.name}</span>
                          {(a.destaque || a.isHighlight) && (
                            <span className="text-amber-400 text-xs" title="Destaque">★</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold print:text-slate-600">
                          {a.posicao || a.position || 'Atleta'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                      {a.notaApi && a.notaApi !== '—' && (
                        <span className="text-slate-400 print:text-slate-600 text-[10px]">
                          API: {a.notaApi}
                        </span>
                      )}
                      {(a.notaScout || a.nota || a.scoutRating) && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 print:text-black print:border-slate-400">
                          Scout: {a.notaScout || a.nota || a.scoutRating}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Nenhum atleta registrado.</p>
              )}
            </div>
          </div>

          {/* VISITANTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-blue-500/30 pb-2 print:border-slate-300">
              <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider print:text-blue-800">
                {awayName} (Atletas)
              </h4>
              <span className="text-[10px] text-slate-400 print:text-slate-600">
                {awayAthletes.length} atletas avaliados
              </span>
            </div>

            <div className="space-y-1.5">
              {awayAthletes.length > 0 ? (
                awayAthletes.map((a, idx) => (
                  <div
                    key={a.id || idx}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      a.destaque || a.isHighlight
                        ? 'bg-amber-950/20 border-amber-500/40 print:bg-amber-50'
                        : 'bg-slate-950/40 border-slate-800/80 print:bg-white print:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300 flex items-center justify-center shrink-0 print:border">
                        {a.numero || a.number || (idx + 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white print:text-black truncate flex items-center gap-1">
                          <span>{a.nome || a.name}</span>
                          {(a.destaque || a.isHighlight) && (
                            <span className="text-amber-400 text-xs" title="Destaque">★</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold print:text-slate-600">
                          {a.posicao || a.position || 'Atleta'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                      {a.notaApi && a.notaApi !== '—' && (
                        <span className="text-slate-400 print:text-slate-600 text-[10px]">
                          API: {a.notaApi}
                        </span>
                      )}
                      {(a.notaScout || a.nota || a.scoutRating) && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 print:text-black print:border-slate-400">
                          Scout: {a.notaScout || a.nota || a.scoutRating}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Nenhum atleta registrado.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Helper para converter posição da API-Sports para as posições do app
function mapApiFootballPosition(pos) {
  if (!pos) return 'medio';
  const p = String(pos).toLowerCase();
  if (p.includes('g') || p.includes('keeper')) return 'goleiro';
  if (p.includes('def') || p.includes('d')) return 'zagueiro';
  if (p.includes('mid') || p.includes('m')) return 'medio';
  if (p.includes('att') || p.includes('f') || p.includes('w')) return 'extremo';
  return 'medio';
}

