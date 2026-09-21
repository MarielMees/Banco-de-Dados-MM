/**
 * apiFootballV2Service.js
 * Módulo de integração independente com a API-Football (v3.football.api-sports.io)
 * Agenda de Jogos 2.0 - Mariel Mees Scout
 * 
 * DIRETRIZES:
 * 1. Foco EXCLUSIVO: Jogos de HOJE (18/09/2026) e FUTUROS.
 * 2. Sem busca retroativa, sem 'last', sem anos anteriores (2024/2025).
 * 3. Persistência cumulativa no localStorage ('radar_v2_matches_repository' e 'radar_v2_reports').
 * 4. Consumo sob demanda para escalações e notas de jogadores.
 */

const API_BASE_URL = 'https://v3.football.api-sports.io';

export const API_FOOTBALL_LEAGUES = [
  { id: 71, name: 'Brasileirão Série A', shortName: 'Série A', color: 'emerald' },
  { id: 72, name: 'Brasileirão Série B', shortName: 'Série B', color: 'blue' },
  { id: 75, name: 'Brasileirão Série C', shortName: 'Série C', color: 'amber' },
  { id: 76, name: 'Brasileirão Série D', shortName: 'Série D', color: 'teal' },
  { id: 73, name: 'Copa do Brasil', shortName: 'Copa do Brasil', color: 'rose' },
  { id: 13, name: 'Copa Libertadores', shortName: 'Libertadores', color: 'yellow' },
  { id: 11, name: 'Copa Sul-Americana', shortName: 'Sul-Americana', color: 'cyan' },
];

export const LIVE_STATUS_CODES = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
export const FINISHED_STATUS_CODES = ['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'];
export const UPCOMING_STATUS_CODES = ['TBD', 'NS'];

/**
 * Funções utilitárias de Data Dinâmica (sempre baseadas no relógio atual em tempo de execução)
 */
export function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna lista de datas no formato YYYY-MM-DD para a janela móvel
 * @param {number} daysBack - dias retroativos (padrão 3)
 * @param {number} daysForward - dias à frente (padrão 7)
 */
export function getRollingDates(daysBack = 3, daysForward = 7) {
  const dates = [];
  const today = new Date();
  for (let i = -daysBack; i <= daysForward; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(formatDateToYYYYMMDD(d));
  }
  return dates;
}

/**
 * Identifica se a partida já encerrou ou é de data anterior a hoje
 */
export function isMatchFinishedOrPast(m) {
  if (!m) return false;
  if (m.isArchived) return true;
  const status = m.status || m.fixture?.status?.short || m.statusShort;
  if (FINISHED_STATUS_CODES.includes(status)) return true;

  const rawDate = m.datetime || m.date || m.fixture?.date;
  if (isValidDate(rawDate)) {
    const d = new Date(rawDate);
    if (d < getStartOfToday()) return true;
  }
  return false;
}

// Chave da API obtida do .env ou localStorage configurável
export function getApiFootballKey() {
  try {
    const customKey = localStorage.getItem('api_football_v2_key');
    if (customKey && customKey.trim()) return customKey.trim();
  } catch (_) {}

  return (
    import.meta.env.VITE_API_FOOTBALL_KEY ||
    import.meta.env.VITE_FOOTBALL_API_KEY ||
    '2e26786f2283863a684d0089789232d5'
  );
}

export function setCustomApiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem('api_football_v2_key', key.trim());
    } else {
      localStorage.removeItem('api_football_v2_key');
    }
  } catch (_) {}
}

export function getActiveSeason() {
  return '2026';
}

export function setActiveSeason() {
  return '2026';
}

export const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

/**
 * Persistência cumulativa de partidas no cofre ('radar_v2_matches_repository' e 'matchesVault')
 */
export function getStoredMatchesV2() {
  try {
    const raw = localStorage.getItem('radar_v2_matches_repository') || localStorage.getItem('matchesVault');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(m => m && isValidDate(m.datetime || m.date || m.fixture?.date));
      }
    }
  } catch (err) {
    console.warn('[apiFootballV2] Erro ao carregar partidas salvas:', err);
  }
  return [];
}

export function saveStoredMatchesV2(matches) {
  try {
    if (Array.isArray(matches)) {
      const cleanList = matches.filter(m => m && isValidDate(m.datetime || m.date || m.fixture?.date));
      localStorage.setItem('radar_v2_matches_repository', JSON.stringify(cleanList));
      localStorage.setItem('matchesVault', JSON.stringify(cleanList));
    }
  } catch (err) {
    console.warn('[apiFootballV2] Erro ao salvar partidas:', err);
  }
}

/**
 * Merge defensivo e cumulativo das partidas no cofre (Vault)
 * - Se a partida já existe (ID correspondente): atualiza status, placares (homeScore, awayScore, scoreFulltime) e campos da partida, mantendo relatórios salvos e notas express. Incrementa contador de 'jogos atualizados'.
 * - Se for nova: adiciona ao repositório. Incrementa contador de 'novas partidas encontradas'.
 * - Salva a lista final consolidada no cofre ('radar_v2_matches_repository' / 'matchesVault').
 */
export function mergeMatchesIntoVault(incomingMatches) {
  const current = getStoredMatchesV2();
  const map = new Map();
  current.forEach(m => {
    if (m && m.id) map.set(String(m.id), m);
  });

  let updatedCount = 0;
  let newCount = 0;

  // Deduplicação dos itens recebidos na mesma sincronização
  const seenIds = new Set();
  const dedupedIncoming = [];
  (incomingMatches || []).forEach(item => {
    if (item && item.id && !seenIds.has(String(item.id))) {
      seenIds.add(String(item.id));
      dedupedIncoming.push(item);
    }
  });

  dedupedIncoming.forEach(fresh => {
    const key = String(fresh.id);
    const existing = map.get(key);

    if (existing) {
      updatedCount++;
      map.set(key, {
        ...existing,
        ...fresh,
        // Preserva integridade de relatórios oficiais e anotações
        hasReport: existing.hasReport || fresh.hasReport || false,
        reportStatus: existing.reportStatus || fresh.reportStatus,
        reportId: existing.reportId || fresh.reportId || null,
        scoutReport: existing.scoutReport || fresh.scoutReport || null,
        expressNotes: existing.expressNotes || fresh.expressNotes || null,
        isArchived: existing.isArchived || false,
        archivedAt: existing.archivedAt || null
      });
    } else {
      newCount++;
      map.set(key, fresh);
    }
  });

  const merged = Array.from(map.values());
  saveStoredMatchesV2(merged);

  return {
    merged,
    updatedCount,
    newCount,
    totalCount: merged.length
  };
}

/**
 * Persistência de relatórios da V2
 */
export function getStoredReportsV2() {
  try {
    const raw = localStorage.getItem('radar_v2_reports');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[apiFootballV2] Erro ao carregar relatórios V2:', err);
  }
  return [];
}

export function saveStoredReportV2(report) {
  try {
    if (!report) return getStoredReportsV2();
    const reportKey = String(report.fixtureId || report.matchId || report.id || '');
    if (!reportKey) return getStoredReportsV2();

    const current = getStoredReportsV2();
    const idx = current.findIndex(r => 
      String(r.fixtureId) === reportKey || 
      String(r.id) === reportKey || 
      String(r.id) === String(report.id) ||
      (report.fixtureId && String(r.fixtureId) === String(report.fixtureId))
    );

    let nextList;
    if (idx >= 0) {
      nextList = [...current];
      nextList[idx] = { 
        ...nextList[idx], 
        ...report, 
        fixtureId: report.fixtureId || reportKey,
        updatedAt: new Date().toISOString() 
      };
    } else {
      nextList = [{ 
        ...report, 
        fixtureId: report.fixtureId || reportKey,
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      }, ...current];
    }
    localStorage.setItem('radar_v2_reports', JSON.stringify(nextList));

    // Também atualiza o status no repositório de partidas
    const matches = getStoredMatchesV2();
    const mIdx = matches.findIndex(m => 
      String(m.id) === reportKey || 
      String(m.id) === String(report.fixtureId) || 
      String(m?.fixture?.id) === reportKey
    );
    if (mIdx >= 0) {
      const updatedMatches = [...matches];
      updatedMatches[mIdx] = {
        ...updatedMatches[mIdx],
        hasReport: true,
        reportStatus: 'CONCLUIDO',
        reportId: report.id || reportKey,
        scoutReport: report
      };
      saveStoredMatchesV2(updatedMatches);
    }
    return nextList;
  } catch (err) {
    console.warn('[apiFootballV2] Erro ao salvar relatório:', err);
    return getStoredReportsV2();
  }
}

/**
 * Normaliza um objeto de partida retornado da API-Football
 */
export function normalizeFixture(item) {
  if (!item || !item.fixture) return null;

  const fix = item.fixture;
  const league = item.league || {};
  const teams = item.teams || {};
  const goals = item.goals || {};
  const score = item.score || {};

  const homeName = teams.home?.name || 'Mandante';
  const awayName = teams.away?.name || 'Visitante';
  const statusShort = fix.status?.short || 'NS';
  const statusLong = fix.status?.long || 'Not Started';

  const isLive = LIVE_STATUS_CODES.includes(statusShort);
  const isFinished = FINISHED_STATUS_CODES.includes(statusShort);
  const isUpcoming = !isLive && !isFinished;

  const dateObj = new Date(fix.date);
  const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '';
  const timeStr = !isNaN(dateObj.getTime()) 
    ? dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '—';

  return {
    id: String(fix.id),
    fixtureId: String(fix.id),
    date: dateStr,
    datetime: fix.date,
    time: timeStr,
    timestamp: fix.timestamp,
    status: statusShort,
    statusShort,
    statusLong,
    elapsed: fix.status?.elapsed || 0,
    venue: fix.venue?.name || 'Estádio a definir',
    city: fix.venue?.city || '',
    leagueId: league.id,
    leagueName: league.name || 'Competição Oficial',
    season: league.season || 2026,
    round: league.round || 'Rodada Oficial',
    homeTeam: homeName,
    awayTeam: awayName,
    homeId: teams.home?.id,
    awayId: teams.away?.id,
    homeScore: goals.home ?? null,
    awayScore: goals.away ?? null,
    scoreFulltime: score.fulltime,
    isLive,
    isFinished,
    isUpcoming,
    hasReport: false,
    reportStatus: 'PENDENTE',
    mandante: { nome: homeName, id: teams.home?.id },
    visitante: { nome: awayName, id: teams.away?.id },
    placar: { mandante: goals.home ?? 0, visitante: goals.away ?? 0 },
    raw: item
  };
}

/**
 * Consulta de jogos por janela móvel dinâmica para uma liga específica (-3 dias até +7 dias)
 */
export async function syncLeagueFixtures({ leagueId, onProgress }) {
  const apiKey = getApiFootballKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'Chave da API-Football não configurada.',
      updatedCount: 0,
      newCount: 0,
      totalCount: getStoredMatchesV2().length,
      matches: getStoredMatchesV2()
    };
  }

  const headers = { 'x-apisports-key': apiKey };
  const rawResults = [];

  async function callEndpoint(path) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, { headers });
      if (!res.ok) return { ok: false };
      const data = await res.json();
      return { ok: true, data: data.response || [] };
    } catch (e) {
      return { ok: false };
    }
  }

  if (onProgress) onProgress(`Consultando próximos jogos (league=${leagueId})...`);

  // 1. Tenta chamada por próximos jogos sem passar season
  const nextRes = await callEndpoint(`/fixtures?league=${leagueId}&next=10&timezone=America/Sao_Paulo`);
  if (nextRes.ok && Array.isArray(nextRes.data) && nextRes.data.length > 0) {
    rawResults.push(...nextRes.data);
  }

  // 2. Janela móvel dinâmica: 3 dias atrás até 7 dias à frente (captura ontem para placares/súmulas e dias futuros)
  const rollingDates = getRollingDates(3, 7);
  for (let i = 0; i < rollingDates.length; i++) {
    const d = rollingDates[i];
    if (onProgress) onProgress(`Consultando rodada da data ${d} (${i + 1}/${rollingDates.length})...`);
    const dRes = await callEndpoint(`/fixtures?date=${d}&timezone=America/Sao_Paulo`);
    if (dRes.ok && Array.isArray(dRes.data)) {
      const matchesOfLeague = dRes.data.filter(f => f.league?.id === leagueId);
      rawResults.push(...matchesOfLeague);
    }
  }

  if (rawResults.length === 0) {
    return {
      success: false,
      error: 'Nenhum jogo encontrado para esta liga no período consultado.',
      updatedCount: 0,
      newCount: 0,
      totalCount: getStoredMatchesV2().length,
      matches: getStoredMatchesV2()
    };
  }

  const normalizedNew = rawResults.map(normalizeFixture).filter(Boolean);
  const mergeResult = mergeMatchesIntoVault(normalizedNew);

  return {
    success: true,
    updatedCount: mergeResult.updatedCount,
    newCount: mergeResult.newCount,
    totalCount: mergeResult.totalCount,
    matches: mergeResult.merged
  };
}

/**
 * Sincroniza todas as 7 ligas monitoradas usando janela móvel dinâmica (-3 dias até +7 dias)
 */
export async function syncAllMonitoredLeagues(onProgress) {
  const apiKey = getApiFootballKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'Chave da API-Football não configurada.',
      updatedCount: 0,
      newCount: 0,
      totalMatches: getStoredMatchesV2().length,
      matches: getStoredMatchesV2()
    };
  }

  const headers = { 'x-apisports-key': apiKey };
  const targetIds = API_FOOTBALL_LEAGUES.map(l => l.id);
  const rawResults = [];

  async function callEndpoint(path) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, { headers });
      if (!res.ok) return { ok: false };
      const data = await res.json();
      return { ok: true, data: data.response || [] };
    } catch (_) {
      return { ok: false };
    }
  }

  // 1. Tenta puxar via next=10 se o plano do usuário permitir
  let canUseNext = true;
  if (onProgress) onProgress('Consultando próximos jogos oficiais...');
  const testNext = await callEndpoint(`/fixtures?league=71&next=10&timezone=America/Sao_Paulo`);
  if (!testNext.ok || !testNext.data || testNext.data.length === 0) {
    canUseNext = false;
  } else {
    rawResults.push(...testNext.data);
    for (let i = 1; i < API_FOOTBALL_LEAGUES.length; i++) {
      const lg = API_FOOTBALL_LEAGUES[i];
      if (onProgress) onProgress(`Buscando ${lg.name}... (${i + 1}/${API_FOOTBALL_LEAGUES.length})`);
      const r = await callEndpoint(`/fixtures?league=${lg.id}&next=10&timezone=America/Sao_Paulo`);
      if (r.ok && Array.isArray(r.data)) rawResults.push(...r.data);
    }
  }

  // 2. Janela móvel dinâmica: 3 dias atrás até 7 dias à frente (cobre jogos de ontem para atualizar placares e próximos jogos)
  const rollingDates = getRollingDates(3, 7);
  for (let i = 0; i < rollingDates.length; i++) {
    const d = rollingDates[i];
    if (onProgress) onProgress(`Sincronizando rodadas da data ${d} (${i + 1}/${rollingDates.length})...`);
    const r = await callEndpoint(`/fixtures?date=${d}&timezone=America/Sao_Paulo`);
    if (r.ok && Array.isArray(r.data)) {
      const matchesOfDate = r.data.filter(f => targetIds.includes(f.league?.id));
      rawResults.push(...matchesOfDate);
    }
  }

  const normalized = rawResults.map(normalizeFixture).filter(Boolean);
  const mergeResult = mergeMatchesIntoVault(normalized);

  return {
    success: true,
    updatedCount: mergeResult.updatedCount,
    newCount: mergeResult.newCount,
    totalMatches: mergeResult.totalCount,
    matches: mergeResult.merged
  };
}

/**
 * FLUXO ON-DEMAND: Carrega escalações e estatísticas de jogadores para um jogo específico
 * Consome:
 *  - /fixtures/lineups?fixture={fixtureId}
 *  - /fixtures/players?fixture={fixtureId}
 */
export async function fetchFixtureLineupsAndPlayers(fixtureId) {
  if (!fixtureId) return { lineups: [], players: [], error: 'ID da partida inválido' };

  const cacheKey = `radar_v2_lineups_players_${fixtureId}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed, fromCache: true };
    }
  } catch (_) {}

  const apiKey = getApiFootballKey();
  const headers = { 'x-apisports-key': apiKey };

  try {
    const [lineupsRes, playersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/fixtures/lineups?fixture=${fixtureId}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/fixtures/players?fixture=${fixtureId}`, { headers }).then(r => r.json())
    ]);

    const lineupsData = Array.isArray(lineupsRes.response) ? lineupsRes.response : [];
    const playersData = Array.isArray(playersRes.response) ? playersRes.response : [];

    const result = {
      lineups: lineupsData,
      players: playersData,
      hasLineups: lineupsData.length > 0,
      hasPlayers: playersData.length > 0,
      errors: {
        lineups: lineupsRes.errors,
        players: playersRes.errors
      }
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (_) {}

    return result;
  } catch (err) {
    console.error('[apiFootballV2] Erro ao buscar súmula on-demand:', err);
    return { lineups: [], players: [], error: err.message };
  }
}
