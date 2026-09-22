import { supabase } from './supabaseClient.js';

/**
 * Mapeamento Atleta (App) -> Linha da Tabela 'players' (Supabase)
 */
export function mapPlayerToSupabaseRow(p) {
  if (!p) return null;
  const rawIdade = p.idade || p.an || p.anoNascimento;
  let numIdade = null;
  if (rawIdade) {
    const parsed = parseInt(String(rawIdade), 10);
    if (!isNaN(parsed)) {
      if (parsed > 1900 && parsed <= new Date().getFullYear()) {
        numIdade = new Date().getFullYear() - parsed;
      } else if (parsed >= 12 && parsed <= 50) {
        numIdade = parsed;
      }
    }
  }

  return {
    id: String(p.id),
    nome: String(p.nome || 'Atleta').trim(),
    clube_atual: p.clubeAtual || p.ca || p.clube || null,
    posicao: p.posicaoLabel || p.posicao || null,
    pe_preferencial: p.pePreferencial || p.pe || null,
    idade: numIdade,
    nacionalidade: p.nacionalidade || 'Brasileiro',
    origem: p.origem || 'Base',
    is_provisorio: Boolean(p.isProvisorio || p.is_provisorio),
    nivel: p.nivel || 'B'
  };
}

/**
 * Normaliza abreviações de posição para IDs canônicos do sistema
 */
export function normalizePosition(pos, pe) {
  if (!pos) return 'medio';
  const p = String(pos).toLowerCase().trim();
  if (p === 'goleiro' || p === 'gol' || p === 'gk') return 'goleiro';
  if (p === 'zag-canhoto' || (p.includes('zag') && p.includes('canhoto'))) return 'zag-canhoto';
  if (p === 'zagueiro' || p === 'zag-destro' || p.includes('destro') || p === 'zag') {
    if (String(pe || '').toLowerCase().includes('canhoto')) return 'zag-canhoto';
    return 'zagueiro';
  }
  if (p === 'lat-direito' || p === 'ld' || p.includes('lateral direito') || p.includes('lat. direito') || p === 'lat d') return 'lat-direito';
  if (p === 'lat-esquerdo' || p === 'le' || p.includes('lateral esquerdo') || p.includes('lat. esquerdo') || p === 'lat e') return 'lat-esquerdo';
  if (p.includes('volante') || p.includes('1º médio') || p.includes('1o medio') || p === 'vol') return 'medio';
  if (p.includes('médio central') || p.includes('medio central') || p === 'medio-central' || p === 'mc') return 'medio-central';
  if (p === 'medio' || p === 'médio') return 'medio';
  if (p.includes('meia ofensivo') || p === 'meia-ofensivo' || p === 'meia' || p === 'mei' || p === 'moc') return 'meia-ofensivo';
  if (p.includes('extremo') || p.includes('ponta') || p.startsWith('ext')) return 'extremo';
  if (p.includes('centroavante') || p === 'ca' || p.includes('ata') || p === 'cf') return 'centroavante';
  return p;
}

/**
 * Retorna o label amigável da posição
 */
export function formatPosLabel(pos) {
  if (!pos) return 'Meia Ofensivo';
  const p = String(pos).toLowerCase().trim();
  if (p === 'goleiro' || p === 'gol' || p === 'gk') return 'Goleiro';
  if (p === 'zag-canhoto' || (p.includes('zag') && p.includes('canhoto'))) return 'Zag. Canhoto';
  if (p === 'zagueiro' || p === 'zag-destro' || p.includes('destro') || p === 'zag') return 'Zag. Destro';
  if (p === 'lat-direito' || p === 'ld' || p.includes('lateral direito') || p.includes('lat. direito')) return 'Lat. Direito';
  if (p === 'lat-esquerdo' || p === 'le' || p.includes('lateral esquerdo') || p.includes('lat. esquerdo')) return 'Lat. Esquerdo';
  if (p.includes('volante') || p.includes('1º médio') || p.includes('1o medio') || p === 'vol') return 'Volante (1º Médio)';
  if (p.includes('médio central') || p.includes('medio central') || p === 'medio-central' || p === 'mc') return 'Médio Central';
  if (p === 'medio' || p === 'médio') return 'Médio';
  if (p.includes('meia ofensivo') || p === 'meia-ofensivo' || p === 'meia' || p === 'mei' || p === 'moc') return 'Meia Ofensivo';
  if (p.includes('extremo') || p.includes('ponta') || p.startsWith('ext')) return 'Extremo';
  if (p.includes('centroavante') || p === 'ca' || p.includes('ata') || p === 'cf') return 'Centroavante';
  return String(pos);
}

/**
 * Mapeamento Linha da Tabela 'players' (Supabase) -> Atleta (App)
 */
export function mapSupabaseRowToPlayer(row) {
  if (!row) return null;
  const isProv = Boolean(row.is_provisorio);
  const pe = row.pe_preferencial || (isProv ? '' : 'Destro');
  const posId = normalizePosition(row.posicao, pe);

  let anVal = null;
  if (row.idade) {
    const pIdade = parseInt(String(row.idade), 10);
    if (!isNaN(pIdade)) {
      if (pIdade > 1900 && pIdade <= new Date().getFullYear()) {
        anVal = pIdade;
      } else if (pIdade >= 12 && pIdade <= 50) {
        anVal = new Date().getFullYear() - pIdade;
      }
    }
  }

  return {
    id: row.id,
    nome: row.nome || 'Atleta Observado',
    clubeAtual: row.clube_atual || '',
    ca: row.clube_atual || '',
    clube: row.clube_atual || '',
    posicao: posId,
    posicaoOriginal: row.posicao || '',
    posicaoLabel: formatPosLabel(row.posicao || posId),
    pePreferencial: pe,
    pe: pe,
    idade: row.idade || '',
    an: anVal,
    anoNascimento: anVal,
    alt: null,
    nacionalidade: row.nacionalidade || 'Brasileiro',
    origem: row.origem || (isProv ? 'Destaque de Relatório' : 'Base'),
    isProvisorio: isProv,
    is_provisorio: isProv,
    nivel: row.nivel || (isProv ? '' : 'B'),
    projecao: [],
    caracteristicas: isProv ? ['Destaque de Campo'] : [],
    alerta: 'OK',
    created_at: row.created_at
  };
}

/**
 * Busca todos os jogadores no Supabase com fallback seguro
 */
export async function fetchPlayersFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Erro ao consultar players:', error.message);
      return null;
    }
    if (Array.isArray(data)) {
      return data.map(mapSupabaseRowToPlayer).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] Falha ao buscar players (modo offline ativo):', err.message);
    return null;
  }
}

/**
 * Salva ou atualiza um jogador na tabela 'players' do Supabase
 */
export async function upsertPlayerToSupabase(player) {
  try {
    const row = mapPlayerToSupabaseRow(player);
    if (!row) return { success: false, error: 'Dados inválidos' };

    const { data, error } = await supabase
      .from('players')
      .upsert(row, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[Supabase] Erro ao sincronizar jogador:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao sincronizar jogador:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Remove um jogador da tabela 'players' do Supabase
 */
export async function deletePlayerFromSupabase(id) {
  try {
    if (!id) return { success: false };
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', String(id));

    if (error) {
      console.warn('[Supabase] Erro ao deletar jogador:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Falha ao deletar jogador no Supabase:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Mapeamento Relatório (App) -> Linha da Tabela 'scout_match_reports' (Supabase)
 */
export function mapReportToSupabaseRow(report) {
  if (!report) return null;
  const [mNamePartida, vNamePartida] = (report.partida || '').split(' x ').map(s => s ? s.trim() : '');
  const homeTeam = report.homeTeam || report.mandante?.nome || mNamePartida || 'Mandante';
  const awayTeam = report.awayTeam || report.visitante?.nome || vNamePartida || 'Visitante';

  let scoreText = '';
  if (report.placarObj && (report.placarObj.mandante !== undefined || report.placarObj.visitante !== undefined)) {
    scoreText = `${report.placarObj.mandante ?? 0} x ${report.placarObj.visitante ?? 0}`;
  } else if (report.homeScore !== undefined && report.awayScore !== undefined) {
    scoreText = `${report.homeScore} x ${report.awayScore}`;
  } else if (typeof report.placar === 'string') {
    scoreText = report.placar;
  }

  const rawHighlights = report.highlights || report.destaques || [];
  const highlightsArr = Array.isArray(rawHighlights) 
    ? rawHighlights 
    : Object.values(rawHighlights || {});

  const homeLineup = Array.isArray(report.atletasMandante) ? report.atletasMandante : (Array.isArray(report.home_lineup) ? report.home_lineup : []);
  const awayLineup = Array.isArray(report.atletasVisitante) ? report.atletasVisitante : (Array.isArray(report.away_lineup) ? report.away_lineup : []);

  const notes = report.analiseGeral || report.parecerTatico || report.scout_notes || report.observacoes || '';

  return {
    id: String(report.id || `rep_${Date.now()}`),
    match_id: report.fixtureId || report.matchId || report.match_id ? String(report.fixtureId || report.matchId || report.match_id) : null,
    tournament: report.competicao || report.campeonato || report.tournament || 'Competição Oficial',
    round: report.rodada || report.round || null,
    match_date: report.data || report.match_date || (new Date().toISOString().split('T')[0]),
    home_team: homeTeam,
    away_team: awayTeam,
    score: scoreText,
    highlights: highlightsArr,
    home_lineup: homeLineup,
    away_lineup: awayLineup,
    scout_notes: notes
  };
}

/**
 * Mapeamento Linha da Tabela 'scout_match_reports' (Supabase) -> Relatório (App)
 */
export function mapSupabaseRowToReport(row) {
  if (!row) return null;
  const homeTeam = row.home_team || 'Mandante';
  const awayTeam = row.away_team || 'Visitante';
  const scoreStr = row.score || '0 x 0';
  const [hScore, aScore] = scoreStr.split('x').map(s => parseInt(s ? s.trim() : '0', 10) || 0);

  const homeLineup = Array.isArray(row.home_lineup) ? row.home_lineup : [];
  const awayLineup = Array.isArray(row.away_lineup) ? row.away_lineup : [];
  const highlights = Array.isArray(row.highlights) 
    ? row.highlights 
    : (typeof row.highlights === 'object' && row.highlights ? Object.values(row.highlights) : []);

  const combinedAthletes = [...homeLineup, ...awayLineup];

  return {
    id: row.id,
    fixtureId: row.match_id,
    matchId: row.match_id,
    partida: `${homeTeam} x ${awayTeam}`,
    homeTeam,
    awayTeam,
    mandante: { nome: homeTeam },
    visitante: { nome: awayTeam },
    competicao: row.tournament,
    campeonato: row.tournament,
    rodada: row.round || '',
    data: row.match_date || (row.created_at ? row.created_at.split('T')[0] : ''),
    local: 'Estádio Oficial',
    estadio: 'Estádio Oficial',
    placar: scoreStr,
    placarMandante: hScore,
    placarVisitante: aScore,
    placarObj: { mandante: hScore, visitante: aScore },
    atletasMandante: homeLineup,
    atletasVisitante: awayLineup,
    atletasAvaliados: combinedAthletes.length > 0 ? combinedAthletes : highlights,
    destaques: highlights,
    highlights: highlights,
    analiseGeral: row.scout_notes || '',
    parecerTatico: row.scout_notes || '',
    scout_notes: row.scout_notes || '',
    status: 'Concluído',
    created_at: row.created_at
  };
}

/**
 * Busca todos os relatórios de jogos da tabela 'scout_match_reports' do Supabase
 */
export async function fetchMatchReportsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('scout_match_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Erro ao buscar scout_match_reports:', error.message);
      return null;
    }
    if (Array.isArray(data)) {
      return data.map(mapSupabaseRowToReport).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao buscar relatórios (modo offline ativo):', err.message);
    return null;
  }
}

/**
 * Salva ou atualiza um relatório de jogo na tabela 'scout_match_reports' do Supabase
 */
export async function upsertMatchReportToSupabase(report) {
  try {
    const row = mapReportToSupabaseRow(report);
    if (!row) return { success: false, error: 'Dados inválidos' };

    const { data, error } = await supabase
      .from('scout_match_reports')
      .upsert(row, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[Supabase] Erro ao salvar scout_match_reports:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase] Falha ao enviar relatório para o Supabase:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Remove um relatório da tabela 'scout_match_reports' do Supabase
 */
export async function deleteMatchReportFromSupabase(id) {
  try {
    if (!id) return { success: false };
    const { error } = await supabase
      .from('scout_match_reports')
      .delete()
      .eq('id', String(id));

    if (error) {
      console.warn('[Supabase] Erro ao deletar scout_match_reports:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Falha ao deletar relatório no Supabase:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Mapeamento Partida (App) -> Linha da Tabela 'matches' (Supabase)
 */
export function mapMatchToSupabaseRow(m) {
  if (!m || !m.id) return null;
  const dateStr = m.date || (m.datetime ? String(m.datetime).split('T')[0] : null);
  const homeName = m.homeTeam || m.mandante?.nome || m.teams?.home?.name || 'Mandante';
  const awayName = m.awayTeam || m.visitante?.nome || m.teams?.away?.name || 'Visitante';
  const homeScore = m.homeScore !== undefined && m.homeScore !== null ? Number(m.homeScore) : null;
  const awayScore = m.awayScore !== undefined && m.awayScore !== null ? Number(m.awayScore) : null;

  return {
    id: String(m.id),
    fixture_id: m.fixtureId ? String(m.fixtureId) : String(m.id),
    league_id: m.leagueId || m.league?.id || null,
    league_name: m.leagueName || m.league?.name || null,
    home_team: homeName,
    away_team: awayName,
    home_score: homeScore,
    away_score: awayScore,
    match_date: dateStr,
    status: m.status || m.statusShort || 'NS',
    has_report: Boolean(m.hasReport),
    report_status: m.reportStatus || 'PENDENTE',
    data: m,
    updated_at: new Date().toISOString()
  };
}

/**
 * Mapeamento Linha da Tabela 'matches' (Supabase) -> Partida (App)
 */
export function mapSupabaseRowToMatch(row) {
  if (!row) return null;
  // Se contiver o objeto serializado completo 'data', restaura integralmente
  if (row.data && typeof row.data === 'object' && (row.data.id || row.data.fixtureId)) {
    return {
      ...row.data,
      id: String(row.id || row.data.id),
      hasReport: row.has_report !== undefined ? Boolean(row.has_report) : Boolean(row.data.hasReport),
      reportStatus: row.report_status || row.data.reportStatus || 'PENDENTE'
    };
  }

  // Fallback para campos relacionais básicos
  const homeScore = row.home_score ?? null;
  const awayScore = row.away_score ?? null;
  return {
    id: String(row.id),
    fixtureId: String(row.fixture_id || row.id),
    date: row.match_date || '',
    datetime: row.match_date ? `${row.match_date}T16:00:00Z` : '',
    time: '—',
    status: row.status || 'NS',
    statusShort: row.status || 'NS',
    leagueId: row.league_id,
    leagueName: row.league_name || 'Competição Oficial',
    homeTeam: row.home_team || 'Mandante',
    awayTeam: row.away_team || 'Visitante',
    homeScore,
    awayScore,
    hasReport: Boolean(row.has_report),
    reportStatus: row.report_status || 'PENDENTE',
    mandante: { nome: row.home_team || 'Mandante' },
    visitante: { nome: row.away_team || 'Visitante' },
    placar: { mandante: homeScore ?? 0, visitante: awayScore ?? 0 }
  };
}

/**
 * Busca todas as partidas da tabela 'matches' do Supabase
 */
export async function fetchMatchesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Consulta de partidas indisponível (cofre local ativo):', error.message);
      return null;
    }
    if (Array.isArray(data)) {
      return data.map(mapSupabaseRowToMatch).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] Falha ao consultar partidas na nuvem:', err.message);
    return null;
  }
}

/**
 * Upsert em lote de partidas no Supabase
 */
export async function upsertMatchesToSupabase(matches) {
  try {
    if (!Array.isArray(matches) || matches.length === 0) return { success: true, count: 0 };

    const rows = matches.map(mapMatchToSupabaseRow).filter(Boolean);
    if (rows.length === 0) return { success: true, count: 0 };

    const CHUNK_SIZE = 50;
    let syncedCount = 0;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase
        .from('matches')
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        // Tentativa de fallback se houver incompatibilidade de colunas
        const minimalChunk = chunk.map(r => ({
          id: r.id,
          data: r.data,
          updated_at: r.updated_at
        }));
        const { error: fbErr } = await supabase
          .from('matches')
          .upsert(minimalChunk, { onConflict: 'id' });

        if (fbErr) {
          console.warn('[Supabase] Aviso ao persistir partidas na nuvem:', fbErr.message);
          return { success: false, error: fbErr.message };
        }
      }
      syncedCount += chunk.length;
    }

    return { success: true, count: syncedCount };
  } catch (err) {
    console.warn('[Supabase] Falha ao enviar partidas para a nuvem:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sincroniza o cofre de partidas com o Supabase
 */
export async function syncVaultToSupabase(matches) {
  return await upsertMatchesToSupabase(matches);
}

/**
 * Constrói um objeto de partida completo a partir de um relatório de scout salvo no Supabase
 */
export function buildMatchFromReport(report) {
  if (!report) return null;
  const matchId = String(report.fixtureId || report.matchId || report.match_id || report.id || '');
  const [mNamePartida, vNamePartida] = (report.partida || '').split(' x ').map(s => s ? s.trim() : '');
  const homeName = report.homeTeam || report.home_team || report.mandante?.nome || mNamePartida || 'Mandante';
  const awayName = report.awayTeam || report.away_team || report.visitante?.nome || vNamePartida || 'Visitante';

  let hScore = report.placarMandante ?? report.placarObj?.mandante ?? null;
  let aScore = report.placarVisitante ?? report.placarObj?.visitante ?? null;
  if (hScore === null && (report.score || report.placar)) {
    const raw = String(report.score || report.placar);
    const parts = raw.split('x').map(s => parseInt(s ? s.trim() : '0', 10));
    if (!isNaN(parts[0])) hScore = parts[0];
    if (!isNaN(parts[1])) aScore = parts[1];
  }

  const dateStr = report.data || report.match_date || (report.created_at ? report.created_at.split('T')[0] : '2026-09-20');

  return {
    id: matchId,
    fixtureId: matchId,
    date: dateStr,
    datetime: `${dateStr}T16:00:00Z`,
    time: '16:00',
    venue: report.local || report.estadio || 'Estádio Oficial',
    city: '',
    leagueId: 72,
    leagueName: report.competicao || report.campeonato || report.tournament || 'Competição Oficial',
    season: 2026,
    round: report.rodada || report.round || 'Rodada Oficial',
    homeTeam: homeName,
    awayTeam: awayName,
    homeScore: hScore ?? 0,
    awayScore: aScore ?? 0,
    scoreFulltime: { home: hScore ?? 0, away: aScore ?? 0 },
    status: 'FT',
    statusShort: 'FT',
    isLive: false,
    isFinished: true,
    isUpcoming: false,
    isArchived: true,
    hasReport: true,
    reportStatus: 'CONCLUIDO',
    reportId: report.id,
    scoutReport: report,
    mandante: { nome: homeName },
    visitante: { nome: awayName },
    placar: { mandante: hScore ?? 0, visitante: aScore ?? 0 }
  };
}

const VAULT_LIVE_STATUS_CODES = ['1H', 'HT', '2H', 'ET', 'P', 'LIVE', 'BT', 'INT'];
const VAULT_FINISHED_STATUS_CODES = ['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'];

/**
 * Converte linha de 'fixtures_vault' em objeto de partida da Agenda
 */
export function mapVaultRowToMatch(row) {
  if (!row) return null;
  const raw = row.raw_data || {};
  const fix = raw.fixture || {};
  const teams = raw.teams || {};
  const goals = raw.goals || {};
  const score = raw.score || {};

  const homeName = row.home_team || teams.home?.name || 'Mandante';
  const awayName = row.away_team || teams.away?.name || 'Visitante';
  const statusShort = row.status || fix.status?.short || 'NS';
  const statusLong = fix.status?.long || (statusShort === 'FT' ? 'Match Finished' : 'Not Started');

  const isLive = VAULT_LIVE_STATUS_CODES.includes(statusShort);
  const isFinished = VAULT_FINISHED_STATUS_CODES.includes(statusShort);
  const isUpcoming = !isLive && !isFinished;

  const dateObj = new Date(row.fixture_date || fix.date);
  const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '';
  const timeStr = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '—';

  return {
    id: String(row.id),
    fixtureId: String(row.id),
    date: dateStr,
    datetime: row.fixture_date || fix.date || '',
    time: timeStr,
    timestamp: fix.timestamp,
    status: statusShort,
    statusShort,
    statusLong,
    elapsed: fix.status?.elapsed || 0,
    venue: row.venue || fix.venue?.name || 'Estádio a definir',
    city: fix.venue?.city || '',
    leagueId: row.league_id || raw.league?.id,
    leagueName: row.league_name || raw.league?.name || 'Competição Oficial',
    season: raw.league?.season || new Date().getFullYear(),
    round: row.league_round || raw.league?.round || 'Rodada Oficial',
    homeTeam: homeName,
    awayTeam: awayName,
    homeId: teams.home?.id,
    awayId: teams.away?.id,
    homeLogo: row.home_logo || teams.home?.logo || '',
    awayLogo: row.away_logo || teams.away?.logo || '',
    homeScore: row.goals_home ?? goals.home ?? null,
    awayScore: row.goals_away ?? goals.away ?? null,
    scoreFulltime: score.fulltime,
    isLive,
    isFinished,
    isUpcoming,
    hasReport: false,
    reportStatus: 'PENDENTE',
    mandante: { nome: homeName, id: teams.home?.id, logo: row.home_logo || teams.home?.logo },
    visitante: { nome: awayName, id: teams.away?.id, logo: row.away_logo || teams.away?.logo },
    placar: { mandante: row.goals_home ?? goals.home ?? 0, visitante: row.goals_away ?? goals.away ?? 0 },
    raw: raw,
    raw_data: raw,
    updated_at: row.updated_at
  };
}

/**
 * Busca partidas diretamente de 'fixtures_vault' no Supabase
 */
export async function fetchFixturesVaultFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('fixtures_vault')
      .select('*')
      .order('fixture_date', { ascending: true });

    if (error) {
      console.warn('[Supabase] Erro ao carregar fixtures_vault (utilizando fallback local):', error.message);
      return null;
    }
    if (Array.isArray(data)) {
      return data.map(mapVaultRowToMatch).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] Falha ao consultar fixtures_vault:', err.message);
    return null;
  }
}

/**
 * Upsert direto de itens da API-Football em 'fixtures_vault'
 */
export async function upsertRawFixturesToVault(items) {
  if (!Array.isArray(items) || items.length === 0) return { success: true, count: 0 };

  const rows = items.map(item => {
    if (!item) return null;
    const fixture = item.fixture || {};
    const league = item.league || {};
    const teams = item.teams || {};
    const goals = item.goals || {};

    if (!fixture.id) return null;

    return {
      id: fixture.id,
      league_id: league.id || null,
      league_name: league.name || '',
      league_round: league.round || '',
      fixture_date: fixture.date || null,
      home_team: teams.home?.name || 'Mandante',
      away_team: teams.away?.name || 'Visitante',
      home_logo: teams.home?.logo || '',
      away_logo: teams.away?.logo || '',
      venue: fixture.venue?.name || '',
      status: fixture.status?.short || 'NS',
      goals_home: goals.home ?? null,
      goals_away: goals.away ?? null,
      raw_data: item,
      updated_at: new Date().toISOString()
    };
  }).filter(Boolean);

  if (rows.length === 0) return { success: true, count: 0 };

  try {
    const CHUNK_SIZE = 50;
    let synced = 0;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase
        .from('fixtures_vault')
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] Erro no upsert de fixtures_vault:', error.message);
        return { success: false, error: error.message };
      }
      synced += chunk.length;
    }
    return { success: true, count: synced };
  } catch (err) {
    console.warn('[Supabase] Falha ao conectar em fixtures_vault:', err.message);
    return { success: false, error: err.message };
  }
}



