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
