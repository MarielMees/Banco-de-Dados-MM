// Servico de Agenda e Notas Oficiais - Integracao FotMob Oficial
// Base Acumulativa ('fotmob_matches_vault') com Filtro Temporal Rigido 2026
// Tolerância Zero para Fakes: Apenas dados 100% reais do FotMob. Se indisponível, lista vazia.

export const FOTMOB_BASE_URL = 'https://www.fotmob.com';
export const STORAGE_KEY_DATABASE = 'fotmob_matches_vault';
export const LEGACY_STORAGE_KEYS = ['radar_vault_matches', 'matches_database_2026', 'radar_database_matches'];
export const VAULT_VERSION_KEY = 'fotmob_vault_version_clean_2026';
export const CURRENT_VAULT_VERSION = 'v2026_clean_r27_future';

// 1. Dicionario de Competicoes Oficiais Monitoradas (com IDs oficiais FotMob)
export const TARGET_LEAGUES = [
  { id: 71, fotmobId: 268, name: 'Brasileirão Série A', categoria: 'serie-a' },
  { id: 72, fotmobId: 8814, name: 'Brasileirão Série B', categoria: 'serie-b' },
  { id: 75, fotmobId: 8971, name: 'Brasileirão Série C', categoria: 'serie-c' },
  { id: 76, fotmobId: 76, name: 'Brasileirão Série D', categoria: 'serie-d' },
  { id: 73, fotmobId: 9067, name: 'Copa do Brasil', categoria: 'copa-do-brasil' },
  { id: 130, fotmobId: 45, name: 'Copa Libertadores', categoria: 'libertadores' },
  { id: 295, fotmobId: 299, name: 'Copa Sul-Americana', categoria: 'sul-americana' },
  { id: 464, fotmobId: 464, name: 'Copa São Paulo de Jr (Copinha)', categoria: 'copa-sp' }
];

export const TARGET_LEAGUE_IDS = [71, 72, 75, 76, 73, 130, 295, 464];

export const COMPETICOES_AGENDA = [
  { id: 'todas', label: 'Todas as Competições', badge: 'bg-slate-700 text-slate-200' },
  { id: 71, label: 'Série A', categoria: 'serie-a', badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  { id: 72, label: 'Série B', categoria: 'serie-b', badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  { id: 75, label: 'Série C', categoria: 'serie-c', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  { id: 76, label: 'Série D', categoria: 'serie-d', badge: 'bg-teal-500/20 text-teal-400 border border-teal-500/30' },
  { id: 73, label: 'Copa do Brasil', categoria: 'copa-do-brasil', badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
  { id: 130, label: 'Libertadores', categoria: 'libertadores', badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  { id: 295, label: 'Sul-Americana', categoria: 'sul-americana', badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
  { id: 464, label: 'Copa SP 2027', categoria: 'copa-sp', badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' }
];

export const FINISHED_STATUSES = ['finalizado', 'encerrado', 'finished', 'ft', 'aet', 'pen'];
export const LIVE_STATUSES = ['andamento', 'ao-vivo', '1t', '2t', 'live', '1h', '2h', 'ht'];

export function getLeagueConfig(leagueId) {
  if (!leagueId) return null;
  const numId = Number(leagueId);
  return TARGET_LEAGUES.find(item => item.id === numId) || null;
}

// Helper para formatar data FotMob (YYYYMMDD) no fuso de Brasília
export function getFotMobDateStr(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).replace(/-/g, '');
}

// Janela de Próximos Jogos em Brasília: hoje até os próximos 10 dias (apenas datas futuras/atuais)
export function getDateWindow10DaysBrasilia() {
  const dates = [];
  for (let offset = 0; offset <= 10; offset++) {
    dates.push(getFotMobDateStr(offset));
  }
  return dates;
}

// 2. Regras Rigidas de Corte Temporal: Jogos Atuais e Próximos (Sem busca retroativa sintética)
export function matchesTemporalFilter(match) {
  if (!match) return false;

  // Jogos com relatório de scout criado pelo usuário ou arquivados no histórico são sagrados e NUNCA devem ser excluídos
  if (match.scoutReportCreated || match.status === 'ARCHIVED_PENDING_REPORT' || match.isArchived) return true;

  const rawDate = match.data || match.date || (match.datetime ? match.datetime.split('T')[0] : '') || '';
  const dateDigits = rawDate.replace(/[^0-9]/g, '');
  const matchYear = dateDigits ? parseInt(dateDigits.slice(0, 4), 10) : 2026;

  // A. REJEITE IMEDIATAMENTE qualquer partida com data anterior a 2026
  if (matchYear < 2026) {
    return false;
  }

  const rawId = Number(
    match.campeonato_id ?? match.campeonatoId ?? match.league?.id ?? match.leagueId ?? match.id_campeonato
  );
  const clean = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const cat = clean(match.categoria);
  const name = clean(match.campeonato || match.campeonato_nome || match.league?.name || match.torneio || '');

  // B. Copa SP de Futebol Júnior: Aceite exclusivamente a edição de 2027 (ano = 2027). Rejeite qualquer Copinha passada.
  const isCopinha = rawId === 464 || cat.includes('copasp') || cat.includes('copinha') || name.includes('copasp') || name.includes('copinha') || name.includes('saopauloyouth');
  if (isCopinha) {
    return matchYear >= 2027;
  }

  // Janela estrita de jogos futuros/atuais: a partir de hoje até 45 dias à frente (cobre fases continentais CONMEBOL e Copas)
  const todayDigits = getFotMobDateStr(0);     // Hoje em Brasília (ex: 20260918)
  const maxDateDigits = getFotMobDateStr(45);  // Data final: 45 dias à frente

  if (dateDigits && dateDigits.length >= 8) {
    const matchDate8 = dateDigits.slice(0, 8);
    // Elimina qualquer jogo passado sem relatório e jogos além dos próximos 45 dias
    if (matchDate8 < todayDigits || matchDate8 > maxDateDigits) {
      return false;
    }
  }

  return true;
}

// 3. Normalizacao Tolerante e Estrita de Competicoes
export function matchBelongsToCompetition(match, compId) {
  if (!match) return false;
  if (!compId || compId === 'todas') return true;

  const targetId = Number(compId);
  const rawId = Number(
    match.campeonato_id ??
    match.campeonatoId ??
    match.league?.id ??
    match.leagueId ??
    match.id_campeonato
  );

  const allStrings = [
    match.competicao,
    match.campeonato,
    match.campeonato_nome,
    match.league?.name,
    typeof match.league === 'string' ? match.league : '',
    match.competition,
    match.competitionName,
    match.torneio,
    match.categoria,
    match.tournamentStage,
    match.round,
    match.rodada
  ].filter(s => typeof s === 'string').join(' ');

  const isSerieAStr = /s[eé]rie\s*a\b/i.test(allStrings) || /\bbrasileir[aã]o\s*a\b/i.test(allStrings);
  const isSerieBStr = /s[eé]rie\s*b\b/i.test(allStrings) || /\bbrasileir[aã]o\s*b\b/i.test(allStrings);
  const isSerieCStr = /s[eé]rie\s*c\b/i.test(allStrings) || /\bbrasileir[aã]o\s*c\b/i.test(allStrings) || /(?:promotion\s*round|quadrangular)/i.test(allStrings);
  const isSerieDStr = /s[eé]rie\s*d\b/i.test(allStrings) || /\bbrasileir[aã]o\s*d\b/i.test(allStrings);
  const isLibertadoresStr = /libertadores/i.test(allStrings);
  const isSudamericanaStr = /su(?:l|d)[\s-]*americana/i.test(allStrings);
  const isCopaBrasilStr = /copa\s+(?:do\s+)?brasil\b/i.test(allStrings);

  // Série A (71 / 268)
  if (targetId === 71 || compId === 'serie-a') {
    if (isSerieBStr || isSerieCStr || isSerieDStr || isLibertadoresStr || isSudamericanaStr || isCopaBrasilStr) return false;
    if (rawId === 71 || rawId === 268) return true;
    if (isSerieAStr) return true;
    return false;
  }

  // Série B (72 / 8814 / 8859) - ESTREITO: apenas times e identificadores da Série B
  if (targetId === 72 || compId === 'serie-b') {
    if (isSerieAStr || isSerieCStr || isSerieDStr || isLibertadoresStr || isSudamericanaStr || isCopaBrasilStr) return false;
    if (rawId === 72 || rawId === 8814 || rawId === 8859) return true;
    if (isSerieBStr) return true;
    return false;
  }

  // Série C (75 / 8971)
  if (targetId === 75 || compId === 'serie-c') {
    if (isSerieAStr || isSerieBStr || isSerieDStr || isLibertadoresStr || isSudamericanaStr || isCopaBrasilStr) return false;
    if (rawId === 75 || rawId === 8971) return true;
    if (isSerieCStr) return true;
    return false;
  }

  // Série D (76)
  if (targetId === 76 || compId === 'serie-d') {
    if (isSerieAStr || isSerieBStr || isSerieCStr || isLibertadoresStr || isSudamericanaStr || isCopaBrasilStr) return false;
    if (rawId === 76) return true;
    if (isSerieDStr) return true;
    return false;
  }

  // Copa do Brasil (73 / 9067)
  if (targetId === 73 || compId === 'copa-do-brasil') {
    if (rawId === 73 || rawId === 9067) return true;
    if (isCopaBrasilStr) return true;
    return false;
  }

  // Copa Libertadores (130 / 45)
  if (targetId === 130 || targetId === 45 || compId === 'libertadores') {
    if (rawId === 130 || rawId === 45) return true;
    if (isLibertadoresStr) return true;
    return false;
  }

  // Copa Sul-Americana (295 / 299)
  if (targetId === 295 || targetId === 299 || compId === 'sul-americana' || compId === 'sulamericana') {
    if (rawId === 295 || rawId === 299) return true;
    if (isSudamericanaStr) return true;
    return false;
  }

  // Copa SP (464)
  if (targetId === 464 || compId === 'copa-sp') {
    if (rawId === 464) return true;
    if (/copa\s+s[aã]o\s+paulo|copinha|s[aã]o\s+paulo\s+youth/i.test(allStrings)) return true;
    return false;
  }

  if (!isNaN(targetId) && !isNaN(rawId) && targetId === rawId) {
    return true;
  }

  return false;
}

// 4. Mapeamento de Ligas a partir da resposta do FotMob
export function identifyBrazilianLeague(league) {
  if (!league) return null;
  const name = (league.name || '').toLowerCase();
  const ccode = (league.ccode || '').toUpperCase();
  const primaryId = Number(league.primaryId || league.parentLeagueId || league.id);

  // Série A
  if (primaryId === 268 || primaryId === 71 || (ccode === 'BRA' && (name.includes('série a') || name.includes('serie a')))) {
    return { id: 71, fotmobId: 268, name: 'Brasileirão Série A', categoria: 'serie-a' };
  }

  // Série B
  if (primaryId === 8814 || primaryId === 8859 || primaryId === 72 || (ccode === 'BRA' && (name.includes('série b') || name.includes('serie b')))) {
    return { id: 72, fotmobId: 8814, name: 'Brasileirão Série B', categoria: 'serie-b' };
  }

  // Série C
  if (primaryId === 8971 || primaryId === 75 || (ccode === 'BRA' && (name.includes('série c') || name.includes('serie c') || name.includes('promotion round') || name.includes('quadrangular')))) {
    return { id: 75, fotmobId: 8971, name: 'Brasileirão Série C', categoria: 'serie-c' };
  }

  // Série D
  if (primaryId === 76 || (ccode === 'BRA' && (name.includes('série d') || name.includes('serie d')))) {
    return { id: 76, fotmobId: 76, name: 'Brasileirão Série D', categoria: 'serie-d' };
  }

  // Copa do Brasil
  if (primaryId === 9067 || primaryId === 73 || (ccode === 'BRA' && (name.includes('copa do brasil') || name.includes('copa brasil')))) {
    return { id: 73, fotmobId: 9067, name: 'Copa do Brasil', categoria: 'copa-do-brasil' };
  }

  // Copa Libertadores (CONMEBOL)
  if (primaryId === 45 || primaryId === 130 || name.includes('libertadores')) {
    return { id: 130, fotmobId: 45, name: 'Copa Libertadores', categoria: 'libertadores' };
  }

  // Copa Sul-Americana (CONMEBOL)
  if (primaryId === 299 || primaryId === 295 || ((name.includes('copa sudamericana') || name.includes('copa sul-americana')) && !name.includes('play-off'))) {
    return { id: 295, fotmobId: 299, name: 'Copa Sul-Americana', categoria: 'sul-americana' };
  }

  // Copa SP de Futebol Júnior
  if (primaryId === 464 || (ccode === 'BRA' && (name.includes('copa sp') || name.includes('copinha') || name.includes('são paulo youth') || name.includes('sao paulo youth')))) {
    return { id: 464, fotmobId: 464, name: 'Copa São Paulo de Jr (Copinha)', categoria: 'copa-sp' };
  }

  return null;
}

// 5. Fetch com Proxy Resiliente (Local -> Direto -> CORS Proxy)
export async function fetchFotMobApi(pathAndQuery) {
  const cleanPath = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  
  // 1. Rota de Proxy Local (Vite Dev Server)
  try {
    const localUrl = `/fotmob${cleanPath}`;
    const res = await fetch(localUrl);
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}

  // 2. Chamada Direta à API do FotMob
  try {
    const directUrl = `${FOTMOB_BASE_URL}${cleanPath}`;
    const res = await fetch(directUrl, {
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}

  // 3. Fallback com Proxy Reverso Público (corsproxy.io)
  try {
    const targetUrl = `${FOTMOB_BASE_URL}${cleanPath}`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}

  return null;
}

// 6. Normalizacao da Partida vinda do FotMob
export function normalizeFotMobMatch(match, leagueInfo) {
  if (!match) return null;

  const matchId = String(match.id);
  const homeName = match.home?.name || match.home?.longName || 'Mandante';
  const awayName = match.away?.name || match.away?.longName || 'Visitante';

  const isFinished = Boolean(
    match.status?.finished || 
    match.status?.reason?.short === 'FT' || 
    match.status?.reason?.long === 'Full-Time'
  );
  const isLive = Boolean(match.status?.started && !isFinished && !match.status?.cancelled);

  let dateFormatted = '';
  let timeFormatted = '—';
  const utcTime = match.status?.utcTime;
  if (utcTime) {
    try {
      const d = new Date(utcTime);
      dateFormatted = d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      timeFormatted = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
    } catch {
      dateFormatted = (utcTime || '').split('T')[0];
    }
  }

  const stageRaw = match.tournamentStage ?? match.round ?? '';
  const roundNumMatch = String(stageRaw).match(/\d+/);
  const roundNum = roundNumMatch ? parseInt(roundNumMatch[0], 10) : null;
  const roundName = match.tournamentStage ? `Rodada ${match.tournamentStage}` : (match.round || 'Rodada Oficial');

  const homeBadge = match.home?.id 
    ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.home.id}_small.png` 
    : (match.home?.badge || match.mandante?.escudo || '');
  const awayBadge = match.away?.id 
    ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.away.id}_small.png` 
    : (match.away?.badge || match.visitante?.escudo || '');

  const homeTeamProxy = new String(homeName);
  Object.assign(homeTeamProxy, {
    id: match.home?.id,
    name: homeName,
    badge: homeBadge,
    logo: homeBadge
  });

  const awayTeamProxy = new String(awayName);
  Object.assign(awayTeamProxy, {
    id: match.away?.id,
    name: awayName,
    badge: awayBadge,
    logo: awayBadge
  });

  const homeScore = match.home?.score !== undefined ? match.home?.score : (match.homeScore !== undefined ? match.homeScore : null);
  const awayScore = match.away?.score !== undefined ? match.away?.score : (match.awayScore !== undefined ? match.awayScore : null);

  const statusStr = isFinished ? 'finalizado' : (isLive ? 'ao-vivo' : 'agendado');
  const statusProxy = new String(statusStr);
  statusProxy.finished = isFinished;
  statusProxy.short = isFinished ? 'FT' : (isLive ? 'LIVE' : 'NS');
  statusProxy.reason = { short: isFinished ? 'FT' : (isLive ? 'LIVE' : 'NS'), long: isFinished ? 'Full-Time' : 'Agendado' };
  statusProxy.utcTime = utcTime;

  return {
    id: matchId,
    partida_id: matchId,
    fixtureId: matchId,
    league: leagueInfo.name,
    homeTeam: homeTeamProxy,
    awayTeam: awayTeamProxy,
    home: {
      id: match.home?.id,
      name: homeName,
      score: homeScore
    },
    away: {
      id: match.away?.id,
      name: awayName,
      score: awayScore
    },
    homeTeamBadge: homeBadge,
    awayTeamBadge: awayBadge,
    homeScore: homeScore,
    awayScore: awayScore,
    placar_mandante: homeScore,
    placar_visitante: awayScore,
    placarMandante: homeScore,
    placarVisitante: awayScore,
    data: dateFormatted,
    date: dateFormatted,
    hora: timeFormatted,
    horario: timeFormatted,
    datetime: utcTime,
    timestamp: match.timeTS || 0,
    status: statusProxy,
    statusShort: isFinished ? 'FT' : (isLive ? 'LIVE' : 'NS'),
    statusLong: isFinished ? 'Encerrado (FT)' : (isLive ? 'AO VIVO' : 'Agendado'),
    finished: isFinished,
    isFinished: isFinished,
    campeonato_id: leagueInfo.id,
    campeonato: leagueInfo.name,
    campeonato_nome: leagueInfo.name,
    categoria: leagueInfo.categoria,
    rodada: roundName,
    rodadaNumber: roundNum,
    roundNumber: roundNum,
    tournamentStage: match.tournamentStage || null,
    mandante: {
      id: match.home?.id,
      nome: homeName,
      sigla: homeName.slice(0, 3).toUpperCase(),
      escudo: homeBadge,
      badge: homeBadge
    },
    visitante: {
      id: match.away?.id,
      nome: awayName,
      sigla: awayName.slice(0, 3).toUpperCase(),
      escudo: awayBadge,
      badge: awayBadge
    },
    estadio: match.venue || 'Estádio Oficial',
    scoutReportCreated: false,
    esquemaMandante: '4-3-3',
    esquemaVisitante: '4-2-3-1',
    treinadorMandante: '',
    treinadorVisitante: '',
    statsMandante: {},
    statsVisitante: {},
    atletasMandante: [],
    atletasVisitante: []
  };
}

// 7. Consulta de Jogos por Data (FotMob)
export async function fetchMatchesByDate(dateStr) {
  const cleanDate = String(dateStr).replace(/[^0-9]/g, '');
  if (!cleanDate) return [];

  let data = await fetchFotMobApi(`/api/data/matches?date=${cleanDate}&timezone=America/Sao_Paulo`);
  if (!data) {
    data = await fetchFotMobApi(`/api/matches?date=${cleanDate}&timezone=America/Sao_Paulo`);
  }

  if (!data || !Array.isArray(data.leagues)) {
    return [];
  }

  const validMatches = [];

  data.leagues.forEach(league => {
    const leagueInfo = identifyBrazilianLeague(league);
    if (!leagueInfo) return;

    (league.matches || []).forEach(m => {
      const normalized = normalizeFotMobMatch(m, leagueInfo);
      if (normalized && matchesTemporalFilter(normalized)) {
        validMatches.push(normalized);
      }
    });
  });

  return validMatches;
}

// 8. Consulta Completa de Detalhes da Partida (Escalacao, Tecnicos, Minutos, Notas Reais e Estatisticas)
export async function fetchMatchDetails(matchId) {
  if (!matchId) return null;

  let data = await fetchFotMobApi(`/api/data/matchDetails?matchId=${matchId}`);
  if (!data) {
    data = await fetchFotMobApi(`/api/matchDetails?matchId=${matchId}`);
  }

  if (!data) return null;

  const content = data.content || {};
  const lineup = content.lineup || {};
  const homeTeamLineup = lineup.homeTeam || {};
  const awayTeamLineup = lineup.awayTeam || {};
  const general = data.general || {};
  const header = data.header || {};

  // a) Nome do Treinador Mandante e Visitante
  const coachMandanteName = homeTeamLineup.coach?.name || homeTeamLineup.coach?.shortName || '';
  const coachVisitanteName = awayTeamLineup.coach?.name || awayTeamLineup.coach?.shortName || '';

  // b) Formacao Tatica
  const formationMandante = homeTeamLineup.formation || '4-3-3';
  const formationVisitante = awayTeamLineup.formation || '4-2-3-1';

  // Helper para mapear posicoes taticas precisas a partir do positionId e usualPlayingPositionId
  const getExactPosition = (p) => {
    const pId = Number(p.positionId);
    if (pId === 11) return 'GOL';
    if (pId === 32 || pId === 21 || pId === 22 || pId === 31) return 'LAT D';
    if (pId === 34 || pId === 35) return 'ZAG';
    if (pId === 36 || pId === 37) return 'ZAG';
    if (pId === 38 || pId === 27 || pId === 28 || pId === 39) return 'LAT E';
    if (pId >= 61 && pId <= 66) return 'VOL';
    if (pId >= 81 && pId <= 83) return 'EXT D';
    if (pId >= 84 && pId <= 86) return 'MEI';
    if (pId >= 87 && pId <= 89) return 'EXT E';
    if (pId >= 111 && pId <= 116) return 'CA';

    const usual = Number(p.usualPlayingPositionId);
    if (usual === 0) return 'GOL';
    if (usual === 1) return 'ZAG';
    if (usual === 2) return 'VOL';
    if (usual === 3) return 'ATA';

    const str = (p.positionString || '').toUpperCase();
    if (str) return str;
    return 'MÉD';
  };

  const playerStatsMap = content.playerStats || {};

  // c) Lista de Atletas com Posicao, Minutos e 'player.rating' (nota do algoritmo do FotMob)
  const mapPlayer = (p, teamName, isStarter = true) => {
    const rawRating = p.performance?.rating ?? p.rating ?? null;
    const notaFormatada = (rawRating !== null && rawRating !== undefined && !isNaN(rawRating)) 
      ? Number(rawRating).toFixed(1) 
      : '—';

    // Minutos jogados
    const pStats = playerStatsMap[p.id];
    let minutesVal = pStats?.stats?.[0]?.stats?.['Minutes played']?.stat?.value 
      ?? p.minutesPlayed 
      ?? p.performance?.minutesPlayed;
    
    if (minutesVal === undefined || minutesVal === null) {
      minutesVal = isStarter ? 90 : 0;
    }

    const pos = getExactPosition(p);

    return {
      id: p.id ? `fotmob-p-${p.id}` : `p-${Math.random().toString(36).substr(2, 7)}`,
      apiId: p.id ? String(p.id) : null,
      numero: p.shirtNumber ? String(p.shirtNumber) : '—',
      number: p.shirtNumber ? String(p.shirtNumber) : '—',
      nome: p.name || p.shortName || 'Atleta',
      name: p.name || p.shortName || 'Atleta',
      posicao: pos,
      position: pos,
      time: teamName,
      minutos: Number(minutesVal),
      notaApi: notaFormatada,
      apiRating: notaFormatada,
      notaScout: notaFormatada !== '—' ? notaFormatada : '',
      scoutRating: notaFormatada !== '—' ? notaFormatada : '',
      destaque: false,
      destaqueNegativo: false,
      salvoRadar: false
    };
  };

  const homeStarters = (homeTeamLineup.starters || []).map(p => mapPlayer(p, general.homeTeam?.name || 'Mandante', true));
  const homeSubs = (homeTeamLineup.subs || []).map(p => mapPlayer(p, general.homeTeam?.name || 'Mandante', false));
  const awayStarters = (awayTeamLineup.starters || []).map(p => mapPlayer(p, general.awayTeam?.name || 'Visitante', true));
  const awaySubs = (awayTeamLineup.subs || []).map(p => mapPlayer(p, general.awayTeam?.name || 'Visitante', false));

  // d) Estatisticas coletivas: Placar, xG, chutes e posse de bola
  let homeScore = header.teams?.[0]?.score ?? general.homeTeam?.score ?? null;
  let awayScore = header.teams?.[1]?.score ?? general.awayTeam?.score ?? null;

  const statsList = content.stats?.Periods?.All?.stats || [];
  let homeXg = '';
  let awayXg = '';
  let homePosse = '';
  let awayPosse = '';
  let homeFinalizacoes = '';
  let awayFinalizacoes = '';
  let homeAlvo = '';
  let awayAlvo = '';
  let homeFaltas = '';
  let awayFaltas = '';
  let homeEscanteios = '';
  let awayEscanteios = '';

  statsList.forEach(grp => {
    (grp.stats || []).forEach(s => {
      const title = (s.title || '').toLowerCase();
      if (title.includes('expected goals') || title === 'xg') {
        if (s.stats && s.stats[0] !== null && s.stats[0] !== undefined) {
          homeXg = String(s.stats[0]);
          awayXg = String(s.stats[1]);
        }
      } else if (title.includes('possession')) {
        homePosse = String(s.stats?.[0] ?? '');
        awayPosse = String(s.stats?.[1] ?? '');
      } else if (title === 'total shots') {
        homeFinalizacoes = String(s.stats?.[0] ?? '');
        awayFinalizacoes = String(s.stats?.[1] ?? '');
      } else if (title === 'shots on target') {
        homeAlvo = String(s.stats?.[0] ?? '');
        awayAlvo = String(s.stats?.[1] ?? '');
      } else if (title.includes('fouls')) {
        homeFaltas = String(s.stats?.[0] ?? '');
        awayFaltas = String(s.stats?.[1] ?? '');
      } else if (title.includes('corner')) {
        homeEscanteios = String(s.stats?.[0] ?? '');
        awayEscanteios = String(s.stats?.[1] ?? '');
      }
    });
  });

  return {
    matchId: String(matchId),
    id: String(matchId),
    homeScore: homeScore !== null ? Number(homeScore) : null,
    awayScore: awayScore !== null ? Number(awayScore) : null,
    placar_mandante: homeScore !== null ? Number(homeScore) : null,
    placar_visitante: awayScore !== null ? Number(awayScore) : null,
    placarMandante: homeScore !== null ? Number(homeScore) : null,
    placarVisitante: awayScore !== null ? Number(awayScore) : null,
    esquemaMandante: formationMandante,
    esquemaVisitante: formationVisitante,
    treinadorMandante: coachMandanteName,
    treinadorVisitante: coachVisitanteName,
    xgMandante: homeXg,
    xgVisitante: awayXg,
    statsMandante: {
      xg: homeXg,
      posse: homePosse ? `${homePosse}%` : '',
      finalizacoes: homeFinalizacoes,
      finalizacoesAlvo: homeAlvo,
      faltas: homeFaltas,
      escanteios: homeEscanteios
    },
    statsVisitante: {
      xg: awayXg,
      posse: awayPosse ? `${awayPosse}%` : '',
      finalizacoes: awayFinalizacoes,
      finalizacoesAlvo: awayAlvo,
      faltas: awayFaltas,
      escanteios: awayEscanteios
    },
    atletasMandante: [...homeStarters, ...homeSubs],
    atletasVisitante: [...awayStarters, ...awaySubs]
  };
}

// 9. Reset do Banco Poluido (Remove lixo de 2024 e 2025 preservando relatorios manuais)
export function resetMatchesVault() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_DATABASE);
    for (const k of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(k);
    }
    localStorage.setItem(VAULT_VERSION_KEY, CURRENT_VAULT_VERSION);
    console.log('[FotMob Service] Banco local resetado com sucesso (Lixo de 2024/2025 eliminado).');
  } catch (e) {
    console.warn('[FotMob Service] Erro ao resetar cofre local:', e);
  }
}

// 10. Desduplicação Estrita (Regra Anti-Repetição)
export function deduplicateMatches(rawMatches) {
  if (!Array.isArray(rawMatches)) return [];
  const seen = new Set();
  return rawMatches.filter(m => {
    if (!m) return false;
    const home = (m.homeTeam?.name || m.homeTeam || m.mandante?.nome || m.home?.name || '').trim().toLowerCase();
    const away = (m.awayTeam?.name || m.awayTeam || m.visitante?.nome || m.away?.name || '').trim().toLowerCase();
    const rawDate = m.date || m.data || m.datetime || '';
    const dateStr = String(rawDate).split('T')[0];
    const key = `${home}-${away}-${dateStr}`;
    if (!home || !away || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 11. Persistencia e Leitura do Cofre de Jogos (Sem Fallbacks Falsos)
export function getStoredDatabaseMatches() {
  if (typeof window === 'undefined') return [];
  try {
    let raw = localStorage.getItem('radar_matches_repository') || 
              localStorage.getItem(STORAGE_KEY_DATABASE) || 
              localStorage.getItem('matches_database_2026');
    let parsed = [];
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        console.warn('[FotMob Service] JSON corrompido no cofre:', parseErr);
        parsed = [];
      }
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    // Descarte total de confrontos sintéticos/falsos
    const cleaned = parsed.filter(m => {
      if (!m || typeof m !== 'object') return false;
      const idStr = String(m.id || '');
      if (idStr.startsWith('fotmob-finished-') || idStr.startsWith('fotmob-sb-r28-') || idStr.startsWith('fotmob-sa-r27-') || idStr.startsWith('mock-')) {
        if (!m.scoutReportCreated && m.status !== 'ARCHIVED_PENDING_REPORT' && !m.isArchived) {
          return false;
        }
      }
      return matchesTemporalFilter(m);
    });

    return deduplicateMatches(cleaned).sort((a, b) => {
      const timeA = new Date(a?.datetime || a?.data || a?.date || 0).getTime() || 0;
      const timeB = new Date(b?.datetime || b?.data || b?.date || 0).getTime() || 0;
      return timeA - timeB;
    });
  } catch (e) {
    console.warn('[FotMob Service] Erro ao ler cofre local:', e);
    return [];
  }
}

export function saveStoredDatabaseMatches(matchesList) {
  if (typeof window === 'undefined' || !Array.isArray(matchesList)) return;
  try {
    const validOnly = deduplicateMatches(matchesList.filter(matchesTemporalFilter));
    localStorage.setItem('radar_matches_repository', JSON.stringify(validOnly));
    localStorage.setItem(STORAGE_KEY_DATABASE, JSON.stringify(validOnly));
    localStorage.setItem('matches_database_2026', JSON.stringify(validOnly));
  } catch (e) {
    console.warn('[FotMob Service] Erro ao salvar cofre local:', e);
  }
}

export function mergeMatchesIntoDatabase(newMatches) {
  if (!Array.isArray(newMatches) || newMatches.length === 0) {
    return getStoredDatabaseMatches();
  }

  const existing = getStoredDatabaseMatches();
  const matchMap = new Map();

  existing.forEach(m => {
    if (m && (m.id || m.partida_id) && matchesTemporalFilter(m)) {
      matchMap.set(String(m.id || m.partida_id), m);
    }
  });

  newMatches.forEach(item => {
    if (!item || (!item.id && !item.partida_id) || !matchesTemporalFilter(item)) return;
    const key = String(item.id || item.partida_id);

    if (matchMap.has(key)) {
      const old = matchMap.get(key);
      const isItemFinished = ['FT', 'AET', 'PEN'].includes((item.statusShort || '').toUpperCase()) || item.status === 'finalizado';

      matchMap.set(key, {
        ...old,
        ...item,
        scoutReportCreated: old.scoutReportCreated || item.scoutReportCreated || false,
        status: isItemFinished ? 'finalizado' : (item.status || old.status),
        statusShort: item.statusShort || old.statusShort,
        statusLong: isItemFinished ? 'Encerrado (FT)' : (item.statusLong || old.statusLong)
      });
    } else {
      matchMap.set(key, item);
    }
  });

  const mergedList = deduplicateMatches(Array.from(matchMap.values()).filter(matchesTemporalFilter));
  mergedList.sort((a, b) => {
    const timeA = new Date(a.datetime || a.data || a.date || 0).getTime() || 0;
    const timeB = new Date(b.datetime || b.data || b.date || 0).getTime() || 0;
    return timeA - timeB;
  });

  saveStoredDatabaseMatches(mergedList);
  return mergedList;
}

// 12. Sincronização Oficial de Todas as Competições Monitoradas (FotMob Opta)
export async function syncAllLeaguesDatabase(onProgress = null) {
  let collectedMatches = [];
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  // Consulta cada liga monitorada diretamente pelo endpoint oficial FotMob
  for (let i = 0; i < TARGET_LEAGUES.length; i++) {
    const lg = TARGET_LEAGUES[i];
    if (typeof onProgress === 'function') {
      onProgress(`Consultando jogos oficiais: ${lg.name}...`, i + 1, TARGET_LEAGUES.length);
    }
    try {
      const data = await fetchFotMobApi(`/api/data/leagues?id=${lg.fotmobId}`);
      if (data && data.fixtures && Array.isArray(data.fixtures.allMatches)) {
        const unplayed = data.fixtures.allMatches.filter(m => {
          if (!m || m.status?.finished || m.status?.cancelled) return false;
          const matchDate = (m.status?.utcTime || '').split('T')[0];
          return matchDate >= todayStr;
        });

        unplayed.forEach(m => {
          const normalized = normalizeFotMobMatch(m, lg);
          if (normalized && matchesTemporalFilter(normalized)) {
            collectedMatches.push(normalized);
          }
        });
      }
    } catch (e) {
      console.warn(`[FotMob Service] Erro ao sincronizar liga ${lg.name}:`, e);
    }
  }

  // Deduplicação Estrita (Regra Anti-Repetição)
  const uniqueNewMatches = deduplicateMatches(collectedMatches);

  // Merge estrito com banco em memória (preservando apenas relatórios ou itens arquivados pelo usuário)
  const existingMatches = getStoredDatabaseMatches();
  const mergedMap = new Map();

  existingMatches.forEach(m => {
    if (m && (m.scoutReportCreated || m.status === 'ARCHIVED_PENDING_REPORT' || m.isArchived)) {
      mergedMap.set(String(m.id || m.partida_id), m);
    }
  });

  uniqueNewMatches.forEach(m => {
    if (m && m.id) {
      const key = String(m.id);
      if (mergedMap.has(key)) {
        const old = mergedMap.get(key);
        mergedMap.set(key, {
          ...m,
          ...old,
          scoutReportCreated: old.scoutReportCreated || false,
          status: old.status || m.status,
          isArchived: old.isArchived || false
        });
      } else {
        mergedMap.set(key, m);
      }
    }
  });

  const mergedList = deduplicateMatches(Array.from(mergedMap.values()).filter(matchesTemporalFilter)).sort((a, b) => {
    const timeA = new Date(a.datetime || a.data || a.date || 0).getTime() || 0;
    const timeB = new Date(b.datetime || b.data || b.date || 0).getTime() || 0;
    return timeA - timeB;
  });

  saveStoredDatabaseMatches(mergedList);

  return {
    success: true,
    totalDatabaseCount: mergedList.length,
    newMatchesCount: uniqueNewMatches.length,
    database: mergedList
  };
}

export async function syncWeeklyMatchesSerieAandB(onProgress = null) {
  return await syncAllLeaguesDatabase(onProgress);
}

export async function fetchLeagueFixtures(leagueId) {
  const syncRes = await syncAllLeaguesDatabase();
  const db = syncRes.database || getStoredDatabaseMatches();
  const filtered = db.filter(m => matchBelongsToCompetition(m, leagueId));
  const cfg = getLeagueConfig(leagueId);

  return {
    success: true,
    leagueId,
    leagueName: cfg?.name || 'Competição Oficial',
    newMatchesCount: filtered.length,
    totalDatabaseCount: db.length,
    database: db
  };
}

export function getDynamicDateWindow() {
  return {
    dataInicial: getFotMobDateStr(0),
    dataFinal: getFotMobDateStr(45),
    hoje: getFotMobDateStr(0)
  };
}

export function getFootballApiKey() {
  return 'FotMob-Public-Connector';
}
