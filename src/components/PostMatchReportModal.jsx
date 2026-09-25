import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ThumbsDown, 
  Check, 
  Star, 
  Shield, 
  UserPlus, 
  BarChart2, 
  Save, 
  Trophy, 
  Users, 
  Activity, 
  FileText,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  Edit3,
  UserCheck,
  Tag,
  Telescope,
  Flame,
  FileEdit,
  Plus
} from 'lucide-react';
import { upsertMatchReportToSupabase } from '../services/supabaseService';
import VoiceNoteControl from './VoiceNoteControl';
import NetworkStatusBadge from './NetworkStatusBadge';

// Dicionário Oficial de Características por Posição
export const CARACTERISTICAS_POR_POSICAO = {
  GOL: [
    {
      nome: 'Debaixo das Traves',
      descricao: 'Especialista em reflexos na linha e defesas de puro tempo de reação.'
    },
    {
      nome: 'Líbero / Jogo com Pés',
      descricao: 'Seguro na circulação curta, quebra linhas com passe e atua na cobertura fora da área.'
    },
    {
      nome: 'Saída Aérea',
      descricao: 'Dominante no controle da pequena e grande área em cruzamentos e bolas paradas.'
    },
    {
      nome: '1x1 / Abafador',
      descricao: 'Excelente tempo de saída, fechamento de ângulo e agressividade no mano a mano.'
    }
  ],
  ZAG: [
    {
      nome: 'Domínio Aéreo',
      descricao: 'Forte no jogo aéreo defensivo e ofensivo.'
    },
    {
      nome: 'Agressivo',
      descricao: 'Agressivo, ativo na defesa, ganha a posse de bola com frequência.'
    },
    {
      nome: 'Construtor',
      descricao: 'Forte na construção a partir de trás.'
    },
    {
      nome: 'Estratégico',
      descricao: 'Permanece afastado, defende o espaço, atrasa os adversários sem se envolver (Líbero).'
    },
    {
      nome: 'Velocidade',
      descricao: 'Zagueiro veloz, eficaz na cobertura de espaços e no acompanhamento de atacantes rápidos.'
    }
  ],
  LD: [
    {
      nome: 'Ofensivo / Corredor',
      descricao: 'Apoio contínuo, ultrapassagem em velocidade e cruzamento da linha de fundo.'
    },
    {
      nome: 'Construtor / Invertido',
      descricao: 'Joga por dentro, ajuda a articular o meio e constrói a posse no corredor central.'
    },
    {
      nome: 'Defensivo / Posicional',
      descricao: 'Forte contenção no 1x1 defensivo, mantém linha de 4 firme e equilibra sem subir tanto.'
    },
    {
      nome: 'Ala de Transição',
      descricao: 'Atua com campo aberto, vigor para acelerar contra-ataques e bater área a área.'
    }
  ],
  LE: [
    {
      nome: 'Ofensivo / Corredor',
      descricao: 'Apoio contínuo, ultrapassagem em velocidade e cruzamento da linha de fundo.'
    },
    {
      nome: 'Construtor / Invertido',
      descricao: 'Joga por dentro, ajuda a articular o meio e constrói a posse no corredor central.'
    },
    {
      nome: 'Defensivo / Posicional',
      descricao: 'Forte contenção no 1x1 defensivo, mantém linha de 4 firme e equilibra sem subir tanto.'
    },
    {
      nome: 'Ala de Transição',
      descricao: 'Atua com campo aberto, vigor para acelerar contra-ataques e bater área a área.'
    }
  ],
  VOL: [
    {
      nome: 'Destruidor / Âncora',
      descricao: 'Proteção pura de zaga, desarme agressivo e cobertura dos lados.'
    },
    {
      nome: 'Construtor Recuado',
      descricao: 'Primeiro passe de alta precisão, dita o ritmo e faz a saída lavolpiana.'
    },
    {
      nome: 'Box-to-Box (Área a Área)',
      descricao: 'Vigor físico, pressão alta, desarmes e chegada surpresa para finalizar na área rival.'
    },
    {
      nome: 'Dinâmico / Giros',
      descricao: 'Capacidade de receber a bola de costas para o jogo, girar sob pressão e acelerar a posse.'
    }
  ],
  MEI: [
    {
      nome: 'Armador Clássico',
      descricao: 'Visão periférica, especialista no último passe e enfiadas de bola decisivas.'
    },
    {
      nome: 'Meia Ofensivo Agudo',
      descricao: 'Condução rápida, drible em espaço curto e finalização forte de média distância.'
    },
    {
      nome: 'Meia Associativo',
      descricao: 'Toque rápido, tabela curta, movimentação constante entre as linhas adversárias.'
    },
    {
      nome: 'Meia de Pressão',
      descricao: 'Trabalho sem bola agressivo na transição defensiva e ocupação rápida da entrelinha.'
    }
  ],
  EXT: [
    {
      nome: 'Driblador 1x1',
      descricao: 'Desequilibra nos duelos individuais, drible desconcertante e finta curta.'
    },
    {
      nome: 'Agudo / Profundidade',
      descricao: 'Velocidade pura para atacar o espaço, ruptura em diagonal e presença de área.'
    },
    {
      nome: 'Ponta Articulador (Invertido)',
      descricao: 'Puxa o jogo da ponta para dentro, finaliza de perna trocada ou faz o passe de ruptura.'
    },
    {
      nome: 'Extremo Tático',
      descricao: 'Disciplina tática rigorosa, retorno defensivo acompanhando o lateral adversário e velocidade na saída.'
    }
  ],
  CA: [
    {
      nome: 'Referência / Pivô',
      descricao: 'Jogo de costas impecável, sustenta marcação, ganha duelos e escora para os meias.'
    },
    {
      nome: 'Matador / Finalizador de Área',
      descricao: 'Oportunista, desmarcaque curto fulminante e alto índice de gols em 1 toque.'
    },
    {
      nome: 'Móvel / Falso 9',
      descricao: 'Sai da área para se associar, abre espaços para os pontas e articula jogadas.'
    },
    {
      nome: 'Homem de Área Aéreo',
      descricao: 'Superioridade física e impulsão em cruzamentos laterais e bolas paradas.'
    }
  ]
};

// Identifica se a posição vinda da API é genérica e precisa de especificação
export function isGenericPosition(pos) {
  if (!pos || typeof pos !== 'string') return true;
  const p = pos.trim().toUpperCase();
  const genericList = [
    'M', 'MID', 'MIDFIELDER', 'MIDFIELD', 'MÉD', 'MED',
    'D', 'DEF', 'DEFENDER', 'F', 'FWD', 'FORWARD', 'ATTACKER', 'ATA',
    'G', 'GK', 'GOALKEEPER'
  ];
  return genericList.includes(p) || p.length <= 1;
}

// Mapeia códigos de posição para o padrão do Radar e separa Zagueiro Canhoto / Destro
export function mapSpecificPosition(posCode, perna = 'Destro') {
  const pUpper = (posCode || '').toUpperCase();
  const isCanhoto = (perna || '').toLowerCase() === 'canhoto';

  if (pUpper === 'GOL' || pUpper.includes('GOL')) {
    return { posicao: 'goleiro', posicaoLabel: 'Goleiro' };
  }
  if (pUpper === 'ZAG' || pUpper.includes('ZAG')) {
    if (isCanhoto || pUpper.includes('CANHOTO') || pUpper.includes('ESQ') || pUpper.includes('CAN')) {
      return { posicao: 'zag-canhoto', posicaoLabel: 'Zag. Canhoto' };
    }
    return { posicao: 'zagueiro', posicaoLabel: 'Zag. Destro' };
  }
  if (pUpper === 'LD' || (pUpper.includes('LAT') && pUpper.includes('D'))) {
    return { posicao: 'lat-direito', posicaoLabel: 'Lateral Direito' };
  }
  if (pUpper === 'LE' || (pUpper.includes('LAT') && pUpper.includes('E'))) {
    return { posicao: 'lat-esquerdo', posicaoLabel: 'Lateral Esquerdo' };
  }
  if (pUpper === 'VOL' || pUpper.includes('VOL') || pUpper.includes('MÉD') || pUpper.includes('MED')) {
    return { posicao: 'medio', posicaoLabel: 'Volante' };
  }
  if (pUpper === 'MEI' || pUpper.includes('MEI') || pUpper.includes('ARM')) {
    return { posicao: 'meia-ofensivo', posicaoLabel: 'Meia Ofensivo' };
  }
  if (pUpper === 'EXT' || pUpper.includes('EXT') || pUpper.includes('PON')) {
    return { posicao: 'extremo', posicaoLabel: 'Extremo / Ponta' };
  }
  if (pUpper === 'CA' || pUpper.includes('CA') || pUpper.includes('ATA')) {
    return { posicao: 'centroavante', posicaoLabel: 'Centroavante' };
  }
  return { posicao: 'medio', posicaoLabel: posCode || 'Médio' };
}

export default function PostMatchReportModal({
  isOpen,
  onClose,
  matchData = null,
  match = null,
  reportToEdit = null,
  isEditing = false,
  onSaveReport,
  onSaveSuccess,
  onSavePlayerToRadar,
  onDeletePlayer,
  onSaveCoach,
  onDeleteCoach,
  existingPlayers = [],
  existingCoaches = []
}) {
  const activeMatch = reportToEdit || matchData || match || {};

  if (!isOpen || !activeMatch) return null;

  const isEditMode = isEditing || !!reportToEdit;

  // Cabeçalho e Informações Gerais
  const [partidaNome, setPartidaNome] = useState('');
  const [competicao, setCompeticao] = useState('');
  const [rodada, setRodada] = useState('');
  const [dataJogo, setDataJogo] = useState('');
  const [estadio, setEstadio] = useState('');
  const [placarMandante, setPlacarMandante] = useState(0);
  const [placarVisitante, setPlacarVisitante] = useState(0);

  // Nomes dos clubes
  const [mandanteNome, setMandanteNome] = useState('Mandante');
  const [visitanteNome, setVisitanteNome] = useState('Visitante');

  // Treinadores e Esquemas
  const [treinadorMandante, setTreinadorMandante] = useState('');
  const [notaTreinadorMandante, setNotaTreinadorMandante] = useState('7.0');
  const [salvoCoachMandante, setSalvoCoachMandante] = useState(null);
  const [parecerCoachMandante, setParecerCoachMandante] = useState('');

  const [treinadorVisitante, setTreinadorVisitante] = useState('');
  const [notaTreinadorVisitante, setNotaTreinadorVisitante] = useState('6.5');
  const [salvoCoachVisitante, setSalvoCoachVisitante] = useState(null);
  const [parecerCoachVisitante, setParecerCoachVisitante] = useState('');

  const [esquemaMandante, setEsquemaMandante] = useState('4-3-3');
  const [esquemaVisitante, setEsquemaVisitante] = useState('4-2-3-1');

  // Estatísticas Coletivas
  const [statsMandante, setStatsMandante] = useState({
    posse: '52',
    xg: '1.45',
    passes: '420 (84%)',
    finalizacoes: '14',
    finalizacoesAlvo: '6',
    faltas: '12',
    escanteios: '5'
  });

  const [statsVisitante, setStatsVisitante] = useState({
    posse: '48',
    xg: '0.85',
    passes: '380 (78%)',
    finalizacoes: '9',
    finalizacoesAlvo: '3',
    faltas: '15',
    escanteios: '4'
  });

  // Atletas das duas equipes (lado a lado)
  const [atletasMandante, setAtletasMandante] = useState([]);
  const [atletasVisitante, setAtletasVisitante] = useState([]);

  // Destaques / Highlights globais indexados por ID único
  const [highlights, setHighlights] = useState({});

  // Modal de Correção de Posição / Características / Perfil / Esteiras
  const [positionModalData, setPositionModalData] = useState(null);
  const [tempPosCode, setTempPosCode] = useState('VOL');
  const [tempPerna, setTempPerna] = useState('Destro');
  const [tempCaracteristicas, setTempCaracteristicas] = useState([]);
  const [tempPapelTatico, setTempPapelTatico] = useState('');
  const [tempRadarSub23, setTempRadarSub23] = useState(false);
  const [tempMonitoramento, setTempMonitoramento] = useState(false);
  const [tempHotList, setTempHotList] = useState(false);

  // Parecer tático final
  const [parecerTatico, setParecerTatico] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Ref de proteção da sessão para evitar re-render destrutivo do formulário
  const initializedReportRef = useRef(null);

  // Sincronização e carga de dados existentes (Pre-fill Inteligente para Edição e Criação)
  useEffect(() => {
    if (!isOpen || !activeMatch) {
      initializedReportRef.current = null;
      return;
    }

    const currentMatchKey = `${activeMatch.id || ''}_${activeMatch.partida || ''}_${activeMatch.data || ''}`;
    if (initializedReportRef.current === currentMatchKey) {
      return; // Sessão já inicializada: NUNCA reseta os dados já preenchidos pelo usuário
    }
    initializedReportRef.current = currentMatchKey;

    const safePlayers = Array.isArray(existingPlayers) ? existingPlayers : [];
    const safeCoaches = Array.isArray(existingCoaches) ? existingCoaches : [];

    // 1. Extração Defensiva de Nomes dos Clubes e Confronto
    let mClub = activeMatch.mandante?.nome || activeMatch.teams?.home?.name || activeMatch.homeTeam || (typeof activeMatch.mandante === 'string' ? activeMatch.mandante : '') || '';
    let vClub = activeMatch.visitante?.nome || activeMatch.teams?.away?.name || activeMatch.awayTeam || (typeof activeMatch.visitante === 'string' ? activeMatch.visitante : '') || '';
    const pStr = activeMatch.partida || '';

    if ((!mClub || !vClub) && pStr && pStr.includes('x')) {
      const parts = pStr.split('x').map(s => s.trim());
      mClub = mClub || parts[0] || 'Mandante';
      vClub = vClub || parts[1] || 'Visitante';
    }

    mClub = mClub && mClub !== 'undefined' ? mClub : 'Mandante';
    vClub = vClub && vClub !== 'undefined' ? vClub : 'Visitante';

    setMandanteNome(mClub);
    setVisitanteNome(vClub);
    setPartidaNome(pStr || (`${mClub} x ${vClub}`));
    setCompeticao(activeMatch.competicao || activeMatch.campeonato || activeMatch.campeonato_nome || activeMatch.league?.name || 'Brasileirão');
    setRodada(activeMatch.rodada || activeMatch.round || '');
    setDataJogo(activeMatch.data || activeMatch.fixture?.date?.split('T')?.[0] || new Date().toISOString().split('T')[0]);
    setEstadio(activeMatch.estadio || activeMatch.local || activeMatch.fixture?.venue?.name || '');

    // 2. Placar Defensivo
    let mPlacar = 0;
    let vPlacar = 0;
    if (activeMatch.placarObj && typeof activeMatch.placarObj === 'object') {
      mPlacar = activeMatch.placarObj.mandante ?? 0;
      vPlacar = activeMatch.placarObj.visitante ?? 0;
    } else if (activeMatch.placar && typeof activeMatch.placar === 'object') {
      mPlacar = activeMatch.placar.mandante ?? 0;
      vPlacar = activeMatch.placar.visitante ?? 0;
    } else if (activeMatch.placarMandante !== undefined || activeMatch.placarVisitante !== undefined) {
      mPlacar = activeMatch.placarMandante ?? 0;
      vPlacar = activeMatch.placarVisitante ?? 0;
    } else if (activeMatch.placar_mandante !== undefined || activeMatch.placar_visitante !== undefined) {
      mPlacar = activeMatch.placar_mandante ?? 0;
      vPlacar = activeMatch.placar_visitante ?? 0;
    } else if (typeof activeMatch.placar === 'string' && activeMatch.placar.includes('x')) {
      const pParts = activeMatch.placar.split('x').map(s => parseInt(s.trim(), 10));
      mPlacar = isNaN(pParts[0]) ? 0 : pParts[0];
      vPlacar = isNaN(pParts[1]) ? 0 : pParts[1];
    } else if (activeMatch.homeScore !== undefined || activeMatch.awayScore !== undefined) {
      mPlacar = activeMatch.homeScore ?? 0;
      vPlacar = activeMatch.awayScore ?? 0;
    } else if (activeMatch.goals && typeof activeMatch.goals === 'object') {
      mPlacar = activeMatch.goals.home ?? 0;
      vPlacar = activeMatch.goals.away ?? 0;
    }
    setPlacarMandante(mPlacar);
    setPlacarVisitante(vPlacar);

    // 3. Treinadores
    let coachM = activeMatch.treinadorMandante || activeMatch.coachHome?.name || (typeof activeMatch.coachHome === 'string' ? activeMatch.coachHome : '') || '';
    let notaM = '7.0';
    let parecerM = activeMatch.parecerCoachMandante || activeMatch.parecerTreinadorMandante || '';
    let esquemaM = activeMatch.esquemaMandante || '4-3-3';

    let coachV = activeMatch.treinadorVisitante || activeMatch.coachAway?.name || (typeof activeMatch.coachAway === 'string' ? activeMatch.coachAway : '') || '';
    let notaV = '6.5';
    let parecerV = activeMatch.parecerCoachVisitante || activeMatch.parecerTreinadorVisitante || '';
    let esquemaV = activeMatch.esquemaVisitante || '4-2-3-1';

    if (!coachM && safeCoaches.length > 0 && mClub) {
      const foundM = safeCoaches.find(c => {
        const cl = (c?.clubeAtual || c?.clube || '').toLowerCase().trim();
        return cl && (cl === mClub.toLowerCase().trim() || mClub.toLowerCase().trim().includes(cl) || cl.includes(mClub.toLowerCase().trim()));
      });
      if (foundM?.nome) coachM = foundM.nome;
    }
    if (!coachV && safeCoaches.length > 0 && vClub) {
      const foundV = safeCoaches.find(c => {
        const cl = (c?.clubeAtual || c?.clube || '').toLowerCase().trim();
        return cl && (cl === vClub.toLowerCase().trim() || vClub.toLowerCase().trim().includes(cl) || cl.includes(vClub.toLowerCase().trim()));
      });
      if (foundV?.nome) coachV = foundV.nome;
    }

    if (activeMatch.treinadoresAvaliados && Array.isArray(activeMatch.treinadoresAvaliados) && activeMatch.treinadoresAvaliados.length > 0) {
      const m = activeMatch.treinadoresAvaliados.find(c => c && c.time === 'mandante');
      const v = activeMatch.treinadoresAvaliados.find(c => c && c.time === 'visitante');
      if (m) {
        coachM = m.nome || coachM;
        notaM = m.nota !== undefined && m.nota !== null ? String(m.nota) : notaM;
        parecerM = m.comentario || m.parecer || parecerM;
        esquemaM = m.esquema || esquemaM;
      }
      if (v) {
        coachV = v.nome || coachV;
        notaV = v.nota !== undefined && v.nota !== null ? String(v.nota) : notaV;
        parecerV = v.comentario || v.parecer || parecerV;
        esquemaV = v.esquema || esquemaV;
      }
    } else if (activeMatch.treinadorAvaliado && activeMatch.treinadorAvaliado.nome) {
      const c = activeMatch.treinadorAvaliado;
      if (c.time === 'visitante') {
        coachV = c.nome;
        notaV = c.nota !== undefined && c.nota !== null ? String(c.nota) : notaV;
        parecerV = c.comentario || c.parecer || parecerV;
        esquemaV = c.esquema || esquemaV;
      } else {
        coachM = c.nome;
        notaM = c.nota !== undefined && c.nota !== null ? String(c.nota) : notaM;
        parecerM = c.comentario || c.parecer || parecerM;
        esquemaM = c.esquema || esquemaM;
      }
    }

    setTreinadorMandante(coachM);
    setNotaTreinadorMandante(notaM);
    setParecerCoachMandante(parecerM);
    setEsquemaMandante(esquemaM);

    setTreinadorVisitante(coachV);
    setNotaTreinadorVisitante(notaV);
    setParecerCoachVisitante(parecerV);
    setEsquemaVisitante(esquemaV);

    if (coachM) {
      const matchCoachM = safeCoaches.find(c => (c?.nome || '').toLowerCase().trim() === coachM.toLowerCase().trim());
      setSalvoCoachMandante(matchCoachM ? matchCoachM.id : null);
    } else {
      setSalvoCoachMandante(null);
    }

    if (coachV) {
      const matchCoachV = safeCoaches.find(c => (c?.nome || '').toLowerCase().trim() === coachV.toLowerCase().trim());
      setSalvoCoachVisitante(matchCoachV ? matchCoachV.id : null);
    } else {
      setSalvoCoachVisitante(null);
    }

    // 4. Estatísticas
    const rawStatsM = activeMatch.estatisticas?.mandante || activeMatch.statsMandante || {};
    const rawStatsV = activeMatch.estatisticas?.visitante || activeMatch.statsVisitante || {};

    setStatsMandante({
      posse: rawStatsM.posse || '52',
      xg: rawStatsM.xg || '1.45',
      passes: rawStatsM.passes || '420 (84%)',
      finalizacoes: rawStatsM.finalizacoes || '14',
      finalizacoesAlvo: rawStatsM.finalizacoesAlvo || '6',
      faltas: rawStatsM.faltas || '12',
      escanteios: rawStatsM.escanteios || '5'
    });

    setStatsVisitante({
      posse: rawStatsV.posse || '48',
      xg: rawStatsV.xg || '0.85',
      passes: rawStatsV.passes || '380 (78%)',
      finalizacoes: rawStatsV.finalizacoes || '9',
      finalizacoesAlvo: rawStatsV.finalizacoesAlvo || '3',
      faltas: rawStatsV.faltas || '15',
      escanteios: rawStatsV.escanteios || '4'
    });

    // 5. Atletas e Destaques
    const initialHighlights = {};
    let rawHome = Array.isArray(activeMatch.atletasMandante) ? activeMatch.atletasMandante : [];
    let rawAway = Array.isArray(activeMatch.atletasVisitante) ? activeMatch.atletasVisitante : [];

    if (rawHome.length === 0 && rawAway.length === 0 && Array.isArray(activeMatch.atletasAvaliados) && activeMatch.atletasAvaliados.length > 0) {
      const allA = activeMatch.atletasAvaliados;
      rawHome = allA.filter(a => {
        const t = (a?.time || '').toLowerCase().trim();
        return t === 'mandante' || t === mClub.toLowerCase().trim() || a?.lado === 'mandante';
      });
      rawAway = allA.filter(a => {
        const t = (a?.time || '').toLowerCase().trim();
        return t === 'visitante' || t === vClub.toLowerCase().trim() || a?.lado === 'visitante';
      });
      if (rawHome.length === 0 && rawAway.length === 0) {
        const mid = Math.ceil(allA.length / 2);
        rawHome = allA.slice(0, mid);
        rawAway = allA.slice(mid);
      }
    }

    // Processar Atletas Mandante
    let initialHome = [];
    if (rawHome.length > 0) {
      initialHome = rawHome.map((a, idx) => {
        if (!a) return null;
        const aNome = typeof a === 'string' ? a : (a.nome || a.name || (`${mClub} Atleta ${idx + 1}`));
        const found = safePlayers.find(p => 
          (p?.nome || '').toLowerCase().trim() === aNome.toLowerCase().trim() ||
          (a.savedPlayerId && String(p?.id) === String(a.savedPlayerId))
        );
        const pId = a.id || a.idAtleta || a.numero || (`home-${idx + 1}`);
        const key = `${mClub}_${pId}_${aNome}`;
        const isPos = Boolean(reportToEdit && (a.destaque === true || a.tipoDestaque === 'positivo'));
        const isNeg = Boolean(reportToEdit && (a.destaqueNegativo === true || a.tipoDestaque === 'negativo'));
        if (isPos || isNeg) {
          initialHighlights[key] = {
            playerKey: key,
            id: pId,
            name: aNome,
            number: a.numero || a.number || (idx + 1),
            position: a.posicao || 'MÉD',
            team: mClub,
            type: isPos ? 'positive' : 'negative',
            comment: a.parecerDestaque || a.parecerNegativo || a.comentario || ''
          };
        }
        const scoutNum = (a.notaScout !== undefined && a.notaScout !== null && a.notaScout !== '') 
          ? String(a.notaScout) 
          : ((a.scoutRating !== undefined && a.scoutRating !== null && a.scoutRating !== '')
              ? String(a.scoutRating)
              : ((a.nota !== undefined && a.nota !== null && a.nota !== '' && a.nota !== 0) ? String(a.nota) : ''));

        const posVal = a.posicao || a.position || 'MÉD';
        const tagsArr = (Array.isArray(a.caracteristicas) && a.caracteristicas.length > 0)
          ? a.caracteristicas
          : (Array.isArray(a.characteristics) && a.characteristics.length > 0
              ? a.characteristics
              : (Array.isArray(found?.caracteristicas) ? found.caracteristicas : []));

        return {
          ...a,
          id: pId,
          nome: aNome,
          name: aNome,
          numero: a.numero || a.number || (idx + 1),
          number: a.numero || a.number || (idx + 1),
          posicao: posVal,
          position: posVal,
          time: mClub,
          team: mClub,
          notaScout: scoutNum,
          scoutRating: scoutNum,
          notaApi: a.notaApi || a.apiRating || '—',
          destaque: isPos,
          isHighlight: isPos,
          destaqueNegativo: isNeg,
          isNegativeHighlight: isNeg,
          tipoDestaque: isPos ? 'positivo' : (isNeg ? 'negativo' : null),
          salvoRadar: !!found,
          monitorando: found ? !!found.monitoramento : (!!a.monitoramento || !!a.monitorando),
          radarSub23: found ? !!found.radarSub23 : (!!a.radarSub23 || !!a.sub20),
          hotList: found ? !!found.hotList : !!a.hotList,
          savedPlayerId: found ? found.id : (a.savedPlayerId || null),
          pernaDominante: found?.pernaDominante || found?.perna || a.pernaDominante || a.perna || 'Destro',
          perna: found?.perna || found?.pernaDominante || a.perna || a.pernaDominante || 'Destro',
          caracteristicas: tagsArr,
          characteristics: tagsArr,
          papelTatico: found?.papelTatico || a.papelTatico || ''
        };
      }).filter(Boolean);
    } else {
      const posArr = ['GOL', 'LAT D', 'ZAG', 'ZAG', 'LAT E', 'VOL', 'VOL', 'MEI', 'EXT D', 'EXT E', 'CA'];
      initialHome = posArr.map((pos, idx) => {
        const pId = `home-${idx + 1}`;
        const pNome = `${mClub} Atleta ${idx + 1}`;
        const found = safePlayers.find(p => (p?.nome || '').toLowerCase().trim() === pNome.toLowerCase().trim());
        return {
          id: pId,
          numero: idx + 1,
          number: idx + 1,
          nome: pNome,
          name: pNome,
          posicao: pos,
          position: pos,
          time: mClub,
          team: mClub,
          notaApi: '—',
          notaScout: '',
          scoutRating: '',
          destaque: false,
          isHighlight: false,
          destaqueNegativo: false,
          isNegativeHighlight: false,
          salvoRadar: !!found,
          monitorando: found ? !!found.monitoramento : false,
          radarSub23: false,
          hotList: false,
          savedPlayerId: found ? found.id : null,
          pernaDominante: 'Destro',
          perna: 'Destro',
          caracteristicas: [],
          characteristics: [],
          papelTatico: ''
        };
      });
    }
    setAtletasMandante(initialHome);

    // Processar Atletas Visitante
    let initialAway = [];
    if (rawAway.length > 0) {
      initialAway = rawAway.map((a, idx) => {
        if (!a) return null;
        const aNome = typeof a === 'string' ? a : (a.nome || a.name || (`${vClub} Atleta ${idx + 1}`));
        const found = safePlayers.find(p => 
          (p?.nome || '').toLowerCase().trim() === aNome.toLowerCase().trim() ||
          (a.savedPlayerId && String(p?.id) === String(a.savedPlayerId))
        );
        const pId = a.id || a.idAtleta || a.numero || (`away-${idx + 1}`);
        const key = `${vClub}_${pId}_${aNome}`;
        const isPos = Boolean(reportToEdit && (a.destaque === true || a.tipoDestaque === 'positivo'));
        const isNeg = Boolean(reportToEdit && (a.destaqueNegativo === true || a.tipoDestaque === 'negativo'));
        if (isPos || isNeg) {
          initialHighlights[key] = {
            playerKey: key,
            id: pId,
            name: aNome,
            number: a.numero || a.number || (idx + 1),
            position: a.posicao || 'MÉD',
            team: vClub,
            type: isPos ? 'positive' : 'negative',
            comment: a.parecerDestaque || a.parecerNegativo || a.comentario || ''
          };
        }
        const scoutNum = (a.notaScout !== undefined && a.notaScout !== null && a.notaScout !== '') 
          ? String(a.notaScout) 
          : ((a.scoutRating !== undefined && a.scoutRating !== null && a.scoutRating !== '')
              ? String(a.scoutRating)
              : ((a.nota !== undefined && a.nota !== null && a.nota !== '' && a.nota !== 0) ? String(a.nota) : ''));

        const posVal = a.posicao || a.position || 'MÉD';
        const tagsArr = (Array.isArray(a.caracteristicas) && a.caracteristicas.length > 0)
          ? a.caracteristicas
          : (Array.isArray(a.characteristics) && a.characteristics.length > 0
              ? a.characteristics
              : (Array.isArray(found?.caracteristicas) ? found.caracteristicas : []));

        return {
          ...a,
          id: pId,
          nome: aNome,
          name: aNome,
          numero: a.numero || a.number || (idx + 1),
          number: a.numero || a.number || (idx + 1),
          posicao: posVal,
          position: posVal,
          time: vClub,
          team: vClub,
          notaScout: scoutNum,
          scoutRating: scoutNum,
          notaApi: a.notaApi || a.apiRating || '—',
          destaque: isPos,
          isHighlight: isPos,
          destaqueNegativo: isNeg,
          isNegativeHighlight: isNeg,
          tipoDestaque: isPos ? 'positivo' : (isNeg ? 'negativo' : null),
          salvoRadar: !!found,
          monitorando: found ? !!found.monitoramento : (!!a.monitoramento || !!a.monitorando),
          radarSub23: found ? !!found.radarSub23 : (!!a.radarSub23 || !!a.sub20),
          hotList: found ? !!found.hotList : !!a.hotList,
          savedPlayerId: found ? found.id : (a.savedPlayerId || null),
          pernaDominante: found?.pernaDominante || found?.perna || a.pernaDominante || a.perna || 'Destro',
          perna: found?.perna || found?.pernaDominante || a.perna || a.pernaDominante || 'Destro',
          caracteristicas: tagsArr,
          characteristics: tagsArr,
          papelTatico: found?.papelTatico || a.papelTatico || ''
        };
      }).filter(Boolean);
    } else {
      const posArr = ['GOL', 'LAT D', 'ZAG', 'ZAG', 'LAT E', 'VOL', 'VOL', 'MEI', 'EXT D', 'EXT E', 'CA'];
      initialAway = posArr.map((pos, idx) => {
        const pId = `away-${idx + 1}`;
        const pNome = `${vClub} Atleta ${idx + 1}`;
        const found = safePlayers.find(p => (p?.nome || '').toLowerCase().trim() === pNome.toLowerCase().trim());
        return {
          id: pId,
          numero: idx + 1,
          number: idx + 1,
          nome: pNome,
          name: pNome,
          posicao: pos,
          position: pos,
          time: vClub,
          team: vClub,
          notaApi: '—',
          notaScout: '',
          scoutRating: '',
          destaque: false,
          isHighlight: false,
          destaqueNegativo: false,
          isNegativeHighlight: false,
          salvoRadar: !!found,
          monitorando: found ? !!found.monitoramento : false,
          radarSub23: false,
          hotList: false,
          savedPlayerId: found ? found.id : null,
          pernaDominante: 'Destro',
          perna: 'Destro',
          caracteristicas: [],
          characteristics: [],
          papelTatico: ''
        };
      });
    }
    setAtletasVisitante(initialAway);

    setHighlights(initialHighlights);

    // 6. Parecer Tático Geral
    setParecerTatico(
      activeMatch.analiseGeral || activeMatch.parecerTatico || (`Partida disputada no ${activeMatch.estadio || activeMatch.local || 'estádio'}. Equipe mandante manteve maior controle nas transições com boa compactação.`)
    );

  }, [isOpen, reportToEdit, matchData]);

  // 1. FUNÇÃO UNIFICADA DE ATUALIZAÇÃO DO ATLETA (Atômica, imutável e com preservação total de campos)
  const updatePlayerData = (playerId, field, value, isMandante = null) => {
    const updater = (prevList) =>
      prevList.map(player => {
        const matches = (
          (player.id !== undefined && playerId !== undefined && String(player.id) === String(playerId)) ||
          (player.nome && playerId && String(player.nome).toLowerCase().trim() === String(playerId).toLowerCase().trim()) ||
          (player.name && playerId && String(player.name).toLowerCase().trim() === String(playerId).toLowerCase().trim()) ||
          (player.numero && playerId && String(player.numero) === String(playerId))
        );
        if (matches) {
          if (typeof field === 'object' && field !== null) {
            return {
              ...player,
              ...field
            };
          }
          const patch = { [field]: value };
          if (field === 'posicao') patch.position = value;
          if (field === 'position') patch.posicao = value;
          if (field === 'notaScout') patch.scoutRating = value;
          if (field === 'scoutRating') patch.notaScout = value;
          if (field === 'caracteristicas') patch.characteristics = value;
          if (field === 'characteristics') patch.caracteristicas = value;
          if (field === 'isHighlight') patch.destaque = value;
          if (field === 'destaque') patch.isHighlight = value;
          if (field === 'isNegativeHighlight') patch.destaqueNegativo = value;
          if (field === 'destaqueNegativo') patch.isNegativeHighlight = value;
          return {
            ...player,
            ...patch
          };
        }
        return player;
      });

    if (isMandante === true) {
      setAtletasMandante(updater);
    } else if (isMandante === false) {
      setAtletasVisitante(updater);
    } else {
      setAtletasMandante(updater);
      setAtletasVisitante(updater);
    }
  };

  const updateAtleta = (isMandante, id, field, value) => {
    updatePlayerData(id, field, value, isMandante);
  };

  // Salvar/Remover Treinador no Banco de Treinadores
  const handleToggleCoach = (isMandante) => {
    const coachName = isMandante ? treinadorMandante : treinadorVisitante;
    const coachNota = isMandante ? notaTreinadorMandante : notaTreinadorVisitante;
    const coachParecer = isMandante ? parecerCoachMandante : parecerCoachVisitante;
    const coachEsquema = isMandante ? esquemaMandante : esquemaVisitante;
    const isSalvo = isMandante ? salvoCoachMandante : salvoCoachVisitante;
    const teamName = isMandante ? mandanteNome : visitanteNome;

    if (isSalvo) {
      if (onDeleteCoach) {
        onDeleteCoach(isSalvo);
      }
      if (isMandante) setSalvoCoachMandante(null);
      else setSalvoCoachVisitante(null);
    } else {
      if (!coachName || !coachName.trim()) {
        alert('Informe o nome do treinador antes de salvar.');
        return;
      }

      const newCoachId = 'coach-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const coachObj = {
        id: newCoachId,
        nome: coachName.trim(),
        clubeAtual: teamName,
        nivelAtual: 'C',
        status: 'Incompleto',
        cadastroIncompleto: true,
        esquemaPreferido: coachEsquema || '4-3-3',
        notaRecente: parseFloat(coachNota) || 7.0,
        caracteristicas: ['Em Análise'],
        observacao: coachParecer && coachParecer.trim()
          ? ('[' + partidaNome + ' (' + dataJogo + ') - Nota: ' + (coachNota || '7.0') + ']: ' + coachParecer.trim())
          : ('Cadastrado via Súmula Oficial: ' + partidaNome + ' (' + dataJogo + '). Nota do jogo: ' + (coachNota || '7.0'))
      };

      if (onSaveCoach) {
        onSaveCoach(coachObj);
      }

      if (isMandante) setSalvoCoachMandante(newCoachId);
      else setSalvoCoachVisitante(newCoachId);
    }
  };

  // Abrir mini-modal de Posição / Radar
  const openPositionModal = (atleta, isMandante, mode = 'radar') => {
    const existingP = existingPlayers.find(p => 
      (p.nome || '').toLowerCase().trim() === (atleta.nome || '').toLowerCase().trim() ||
      (atleta.savedPlayerId && String(p.id) === String(atleta.savedPlayerId))
    );

    let defaultCode = 'VOL';
    const rawPos = (atleta.posicao || atleta.position || existingP?.posicao || '').toUpperCase();
    if (rawPos.includes('GOL') || rawPos === 'G') defaultCode = 'GOL';
    else if (rawPos.includes('ZAG') || rawPos.includes('ZAG-CANHOTO')) defaultCode = 'ZAG';
    else if (rawPos.includes('LAT D') || rawPos.includes('LD') || rawPos.includes('LAT-DIREITO')) defaultCode = 'LD';
    else if (rawPos.includes('LAT E') || rawPos.includes('LE') || rawPos.includes('LAT-ESQUERDO')) defaultCode = 'LE';
    else if (rawPos.includes('VOL') || rawPos.includes('MEDIO')) defaultCode = 'VOL';
    else if (rawPos.includes('MEI') || rawPos.includes('ARM') || rawPos.includes('MEIA-OFENSIVO')) defaultCode = 'MEI';
    else if (rawPos.includes('EXT') || rawPos.includes('PON') || rawPos.includes('EXTREMO') || rawPos === 'F') defaultCode = 'EXT';
    else if (rawPos.includes('CA') || rawPos.includes('ATA') || rawPos.includes('CENTROAVANTE')) defaultCode = 'CA';

    const currentTags = (Array.isArray(atleta.caracteristicas) && atleta.caracteristicas.length > 0)
      ? [...atleta.caracteristicas]
      : ((Array.isArray(atleta.characteristics) && atleta.characteristics.length > 0)
          ? [...atleta.characteristics]
          : (Array.isArray(existingP?.caracteristicas) ? [...existingP.caracteristicas] : []));

    setTempPosCode(defaultCode);
    setTempPerna(atleta.pernaDominante || atleta.perna || existingP?.pernaDominante || existingP?.perna || 'Destro');
    setTempCaracteristicas(currentTags);
    setTempPapelTatico(atleta.papelTatico || existingP?.papelTatico || '');
    setTempRadarSub23(Boolean(atleta.radarSub23 ?? existingP?.radarSub23));
    setTempMonitoramento(Boolean((atleta.monitorando || atleta.monitoramento) ?? existingP?.monitoramento));
    setTempHotList(Boolean(atleta.hotList ?? existingP?.hotList));
    setPositionModalData({ atleta, isMandante, mode, existingPlayer: existingP });
  };

  const toggleCaracteristica = (tag) => {
    setTempCaracteristicas(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePositionCodeChange = (newCode) => {
    setTempPosCode(newCode);
    // Preserva intactas as características já marcadas (ex: Construtor, Domínio Aéreo) sem resetar
  };

  const executeSavePlayer = (
    atleta, 
    isMandante, 
    specificPosCode, 
    perna, 
    papel, 
    caracteristicas = [], 
    radarSub23 = false, 
    monitoramento = false, 
    hotList = false
  ) => {
    const { posicao, posicaoLabel } = mapSpecificPosition(specificPosCode, perna);
    
    const existingP = existingPlayers.find(p => 
      (p.nome || '').toLowerCase().trim() === (atleta.nome || '').toLowerCase().trim() ||
      (atleta.savedPlayerId && String(p.id) === String(atleta.savedPlayerId))
    );

    const generatedId = existingP ? existingP.id : (atleta.savedPlayerId || Date.now() + Math.floor(Math.random() * 1000));
    const isMonitoring = Boolean(monitoramento);
    const isSub23 = Boolean(radarSub23);
    const isHotList = Boolean(hotList);
    const tagsList = Array.isArray(caracteristicas) && caracteristicas.length > 0 
      ? caracteristicas 
      : (atleta.caracteristicas || atleta.characteristics || []);

    let status = existingP?.status || 'Triagem';
    let statusTriagem = existingP?.statusTriagem || 'Em Observação';
    if (isMonitoring) {
      status = 'Monitoramento Ativo';
      statusTriagem = 'Monitoramento';
    } else if (isHotList) {
      status = 'Hot List';
      statusTriagem = 'Prioritário';
    } else if (isSub23) {
      status = 'Sub-23';
      statusTriagem = 'Sub-23';
    }

    const playerPayload = {
      ...(existingP || {}),
      id: generatedId,
      nome: atleta.nome,
      posicao: posicao,
      posicaoLabel: posicaoLabel,
      ca: atleta.time || existingP?.ca,
      nivel: existingP?.nivel || 'C',
      status: status,
      statusTriagem: statusTriagem,
      monitoramento: isMonitoring,
      radarSub23: isSub23,
      hotList: isHotList,
      perna: perna || 'Destro',
      pernaDominante: perna || 'Destro',
      caracteristicas: tagsList,
      papelTatico: papel || (tagsList.length > 0 ? tagsList.join(', ') : (existingP?.papelTatico || '')),
      isProvisorio: false,
      observacoes: existingP?.observacoes 
        ? (existingP.observacoes + '\n[Atualizado via Súmula: ' + partidaNome + ' (' + dataJogo + ') - Nota Scout: ' + (atleta.notaScout || atleta.scoutRating || '7.0') + ']')
        : ('Cadastrado via Súmula Oficial: ' + partidaNome + ' (' + dataJogo + ') - Nota: ' + (atleta.notaScout || atleta.scoutRating || '7.0') + (tagsList.length > 0 ? (' | Características: ' + tagsList.join(', ')) : '') + (papel ? (' | Função: ' + papel) : ''))
    };

    if (onSavePlayerToRadar) {
      onSavePlayerToRadar(playerPayload);
    }

    const displayPos = specificPosCode === 'ZAG' ? (perna === 'Canhoto' ? 'ZAG CAN' : 'ZAG DEST') : specificPosCode;

    // Atualização 100% atômica no estado local: altera APENAS a posição e características, mantendo intactos highlights, notas e pareceres
    updatePlayerData(atleta.id || atleta.nome, {
      posicao: displayPos,
      position: displayPos,
      pernaDominante: perna || atleta.pernaDominante || 'Destro',
      perna: perna || atleta.perna || 'Destro',
      caracteristicas: tagsList,
      characteristics: tagsList,
      papelTatico: papel || atleta.papelTatico || '',
      salvoRadar: true,
      monitorando: isMonitoring,
      radarSub23: isSub23,
      hotList: isHotList,
      savedPlayerId: generatedId
    }, isMandante);

    // Sincroniza a posição atualizada no dicionário de highlights da partida (sem resetar nenhum destaque existente)
    setHighlights(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (
          String(next[k]?.id) === String(atleta.id) ||
          String(next[k]?.name || '').toLowerCase().trim() === String(atleta.nome || '').toLowerCase().trim()
        ) {
          next[k] = {
            ...next[k],
            position: displayPos
          };
        }
      });
      return next;
    });
  };

  const handleToggleRadar = (atleta, isMandante) => {
    if (atleta.salvoRadar) {
      if (onDeletePlayer && atleta.savedPlayerId) {
        onDeletePlayer(atleta.savedPlayerId);
      }
      updatePlayerData(atleta.id || atleta.nome, {
        salvoRadar: false,
        monitorando: false,
        radarSub23: false,
        hotList: false,
        savedPlayerId: null
      }, isMandante);
    } else {
      openPositionModal(atleta, isMandante, 'radar');
    }
  };

  const handleConfirmPositionAndSave = () => {
    if (!positionModalData) return;
    const { atleta, isMandante } = positionModalData;
    executeSavePlayer(
      atleta, 
      isMandante, 
      tempPosCode, 
      tempPerna, 
      tempPapelTatico, 
      tempCaracteristicas,
      tempRadarSub23,
      tempMonitoramento,
      tempHotList
    );
    setPositionModalData(null);
  };

  // Gerenciamento de Destaques (⭐ e 👎) - Totalmente atômico e imutável
  const toggleHighlight = (player, teamName, type = 'positive') => {
    const tName = teamName || player.time || player.team || 'team';
    const pId = player.id || player.number || player.numero || 'id';
    const pName = player.name || player.nome || 'player';
    const key = tName + '_' + pId + '_' + pName;

    const isCurrentPos = Boolean(player.isHighlight || player.destaque || (highlights[key]?.type === 'positive'));
    const isCurrentNeg = Boolean(player.isNegativeHighlight || player.destaqueNegativo || (highlights[key]?.type === 'negative'));

    let newIsPositive = false;
    let newIsNegative = false;

    if (type === 'positive') {
      newIsPositive = !isCurrentPos;
      newIsNegative = false;
    } else if (type === 'negative') {
      newIsNegative = !isCurrentNeg;
      newIsPositive = false;
    }

    // Atualiza diretamente e de forma atômica o atleta na lista, preservando position, notaScout, características, etc.
    updatePlayerData(player.id || player.nome, {
      isHighlight: newIsPositive,
      destaque: newIsPositive,
      isNegativeHighlight: newIsNegative,
      destaqueNegativo: newIsNegative,
      tipoDestaque: newIsPositive ? 'positivo' : (newIsNegative ? 'negativo' : null)
    });

    // Atualiza o dicionário de destaques
    setHighlights(prev => {
      const next = { ...prev };
      if (!newIsPositive && !newIsNegative) {
        delete next[key];
      } else {
        const currentHl = next[key];
        next[key] = {
          playerKey: key,
          id: player.id,
          name: player.nome || player.name,
          number: player.numero || player.number,
          position: player.posicao || player.position,
          team: tName,
          type: newIsPositive ? 'positive' : 'negative',
          comment: currentHl ? currentHl.comment : (newIsNegative ? (player.parecerNegativo || '') : (player.parecerDestaque || player.comentario || ''))
        };
      }
      return next;
    });
  };

  const updateHighlightComment = (playerKey, comment) => {
    setHighlights(prev => {
      if (!prev[playerKey]) return prev;
      return {
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          comment
        }
      };
    });
    const hl = highlights[playerKey];
    if (hl && (hl.id || hl.name)) {
      updatePlayerData(hl.id || hl.name, {
        comentario: comment,
        parecerDestaque: hl.type === 'positive' ? comment : undefined,
        parecerNegativo: hl.type === 'negative' ? comment : undefined
      });
    }
  };

  // Salvar relatório completo (mantendo ID original se editando)
  const handleSaveFullReport = () => {
    const todosAtletas = [...atletasMandante, ...atletasVisitante];

    const finalReportId = (reportToEdit && reportToEdit.id) 
      ? reportToEdit.id 
      : (isEditing && activeMatch?.id ? activeMatch.id : ('report-pos-jogo-' + Date.now()));

    const reportPayload = {
      id: finalReportId,
      partida: partidaNome,
      competicao,
      campeonato: competicao,
      rodada,
      data: dataJogo,
      local: estadio,
      estadio,
      placar: placarMandante + ' x ' + placarVisitante,
      placarObj: { mandante: placarMandante, visitante: placarVisitante },
      placarMandante,
      placarVisitante,
      placar_mandante: placarMandante,
      placar_visitante: placarVisitante,
      mandante: { nome: mandanteNome },
      visitante: { nome: visitanteNome },
      tipo: 'pos-jogo-completo',
      estatisticas: {
        mandante: statsMandante,
        visitante: statsVisitante
      },
      statsMandante,
      statsVisitante,
      atletasMandante,
      atletasVisitante,
      treinadoresAvaliados: [
        { 
          time: 'mandante', 
          nome: treinadorMandante || 'Técnico Mandante', 
          esquema: esquemaMandante, 
          nota: parseFloat(notaTreinadorMandante) || 7.0,
          comentario: parecerCoachMandante || ('Comandou ' + mandanteNome + ' no esquema ' + esquemaMandante + '.'),
          parecer: parecerCoachMandante
        },
        { 
          time: 'visitante', 
          nome: treinadorVisitante || 'Técnico Visitante', 
          esquema: esquemaVisitante, 
          nota: parseFloat(notaTreinadorVisitante) || 6.5,
          comentario: parecerCoachVisitante || ('Comandou ' + visitanteNome + ' no esquema ' + esquemaVisitante + '.'),
          parecer: parecerCoachVisitante
        }
      ],
      atletasAvaliados: todosAtletas.map(a => {
        const tName = a.time || a.team || mandanteNome;
        const pId = a.id || a.numero;
        const pName = a.nome || a.name;
        const key = tName + '_' + pId + '_' + pName;
        const hl = highlights[key];
        const isPos = Boolean(a.isHighlight || a.destaque || (hl && hl.type === 'positive'));
        const isNeg = Boolean(a.isNegativeHighlight || a.destaqueNegativo || (hl && hl.type === 'negative'));
        const comment = hl ? hl.comment : (a.parecerDestaque || a.comentario || a.parecerNegativo || '');
        const scoutNum = (a.notaScout !== '' && a.notaScout !== undefined && !isNaN(parseFloat(a.notaScout)))
          ? parseFloat(a.notaScout)
          : ((a.scoutRating !== '' && a.scoutRating !== undefined && !isNaN(parseFloat(a.scoutRating))) ? parseFloat(a.scoutRating) : null);
        return {
          id: a.id,
          idAtleta: a.id,
          numero: a.numero || a.number || '',
          number: a.numero || a.number || '',
          nome: pName,
          name: pName,
          posicao: a.posicao || a.position,
          position: a.posicao || a.position,
          time: a.time || tName,
          team: a.time || tName,
          nota: scoutNum,
          notaScout: scoutNum,
          scoutRating: scoutNum,
          notaApi: a.notaApi || '—',
          destaque: isPos,
          isHighlight: isPos,
          destaqueNegativo: isNeg,
          isNegativeHighlight: isNeg,
          tipoDestaque: isPos ? 'positivo' : (isNeg ? 'negativo' : null),
          comentario: comment,
          parecerDestaque: isPos ? comment : '',
          parecerNegativo: isNeg ? comment : '',
          perna: a.perna || a.pernaDominante || 'Destro',
          pernaDominante: a.pernaDominante || a.perna || 'Destro',
          caracteristicas: a.caracteristicas || a.characteristics || [],
          characteristics: a.characteristics || a.caracteristicas || [],
          papelTatico: a.papelTatico || '',
          monitoramento: !!a.monitorando,
          radarSub23: !!a.radarSub23,
          hotList: !!a.hotList
        };
      }),
      highlights: highlights,
      destaques: todosAtletas.filter(a => Boolean(a.isHighlight || a.destaque)),
      analiseGeral: parecerTatico,
      status: 'Concluído'
    };

    // Persistência na nuvem com a tabela 'scout_match_reports' do Supabase
    upsertMatchReportToSupabase(reportPayload);

    if (onSaveReport) {
      onSaveReport(reportPayload);
    } else if (onSaveSuccess) {
      onSaveSuccess(reportPayload);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-5 overflow-y-auto select-none">
      <div className="bg-[#0b111c] border border-slate-800 rounded-none sm:rounded-2xl w-full h-full sm:h-auto max-w-[96vw] 2xl:max-w-7xl sm:max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal Amplo */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d16] shrink-0">
          <div className="flex items-center gap-3">
            <div className={'w-9 h-9 rounded-xl flex items-center justify-center ' + (
              isEditMode 
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            )}>
              {isEditMode ? <FileEdit className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isEditMode ? 'Editar Relatório Completo Pós-Jogo' : 'Relatório Completo Pós-Jogo'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {isEditMode ? 'Modo Edição' : 'Súmula Oficial'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEditMode 
                  ? 'Atualize escalações, comissões técnicas, estatísticas e notas das duas equipes'
                  : 'Dados técnicos, notas individuais, monitoramento e avaliação de comissões'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NetworkStatusBadge />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* BLOCO 1: PLACAR E METADADOS EDITÁVEIS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Informações da Partida & Placar Oficial
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Clube Mandante</label>
                <input
                  type="text"
                  value={mandanteNome}
                  onChange={(e) => {
                    const m = e.target.value;
                    setMandanteNome(m);
                    setPartidaNome(`${m} x ${visitanteNome}`);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Santos"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Clube Visitante</label>
                <input
                  type="text"
                  value={visitanteNome}
                  onChange={(e) => {
                    const v = e.target.value;
                    setVisitanteNome(v);
                    setPartidaNome(`${mandanteNome} x ${v}`);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: América-MG"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Competição</label>
                <input
                  type="text"
                  value={competicao}
                  onChange={(e) => setCompeticao(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Brasileirão Série B"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Data da Partida</label>
                <input
                  type="date"
                  value={dataJogo}
                  onChange={(e) => setDataJogo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Rodada / Fase</label>
                <input
                  type="text"
                  value={rodada}
                  onChange={(e) => setRodada(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Rodada 28"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Estádio / Local</label>
                <input
                  type="text"
                  value={estadio}
                  onChange={(e) => setEstadio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Vila Belmiro"
                />
              </div>
            </div>

            {/* Placar Editável */}
            <div className="flex items-center justify-center gap-4 bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
              <div className="text-center font-bold text-white text-sm max-w-[180px] truncate">
                {mandanteNome || 'Mandante'}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={placarMandante}
                  onChange={(e) => setPlacarMandante(parseInt(e.target.value) || 0)}
                  className="w-12 h-10 bg-slate-900 border border-emerald-500/40 rounded-lg text-center font-black text-lg text-emerald-400 focus:outline-none focus:border-emerald-400 shadow-inner"
                />
                <span className="text-slate-500 font-black text-sm">X</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={placarVisitante}
                  onChange={(e) => setPlacarVisitante(parseInt(e.target.value) || 0)}
                  className="w-12 h-10 bg-slate-900 border border-emerald-500/40 rounded-lg text-center font-black text-lg text-emerald-400 focus:outline-none focus:border-emerald-400 shadow-inner"
                />
              </div>
              <div className="text-center font-bold text-white text-sm max-w-[180px] truncate">
                {visitanteNome || 'Visitante'}
              </div>
            </div>
          </div>

          {/* BLOCO 2: TREINADORES COM NOTA E BOTÃO TOGGLE + ESTATÍSTICAS COLETIVAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Treinadores & Comissões */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Comissões Técnicas & Avaliação de Treinadores
              </div>

              <div className="space-y-3">
                {/* Técnico Mandante */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                      Técnico {mandanteNome}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCoach(true)}
                      className={'text-[10px] px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ' + (
                        salvoCoachMandante
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 hover:bg-purple-500/40'
                          : 'bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700'
                      )}
                      title="Salvar ou remover treinador da base de treinadores"
                    >
                      {salvoCoachMandante ? <Check className="w-3 h-3 text-purple-400" /> : <UserPlus className="w-3 h-3 text-purple-400" />}
                      <span>{salvoCoachMandante ? '✓ No Banco (Desfazer)' : '+ Base Treinadores'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Nome do Treinador"
                        value={treinadorMandante}
                        onChange={(e) => setTreinadorMandante(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-purple-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Esquema (4-3-3)"
                        value={esquemaMandante}
                        onChange={(e) => setEsquemaMandante(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-purple-500 text-center"
                        title="Esquema tático"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      <span className="text-[10px] text-purple-400 font-bold">Nota:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={notaTreinadorMandante}
                        onChange={(e) => setNotaTreinadorMandante(e.target.value)}
                        className="w-full bg-slate-900 border border-purple-500/40 rounded-lg py-1.5 text-center text-xs text-purple-300 font-bold focus:border-purple-400"
                      />
                    </div>
                  </div>
                  <div>
                    <VoiceNoteControl
                      rows={2}
                      value={parecerCoachMandante}
                      onChange={setParecerCoachMandante}
                      placeholder="Parecer Tático do Treinador (modelo de jogo, substituições, postura tática...)"
                      showMinuteButton={true}
                    />
                  </div>
                </div>

                {/* Técnico Visitante */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                      Técnico {visitanteNome}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCoach(false)}
                      className={'text-[10px] px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ' + (
                        salvoCoachVisitante
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 hover:bg-purple-500/40'
                          : 'bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700'
                      )}
                      title="Salvar ou remover treinador da base de treinadores"
                    >
                      {salvoCoachVisitante ? <Check className="w-3 h-3 text-purple-400" /> : <UserPlus className="w-3 h-3 text-purple-400" />}
                      <span>{salvoCoachVisitante ? '✓ No Banco (Desfazer)' : '+ Base Treinadores'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Nome do Treinador"
                        value={treinadorVisitante}
                        onChange={(e) => setTreinadorVisitante(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-purple-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Esquema (4-2-3-1)"
                        value={esquemaVisitante}
                        onChange={(e) => setEsquemaVisitante(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-purple-500 text-center"
                        title="Esquema tático"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      <span className="text-[10px] text-purple-400 font-bold">Nota:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={notaTreinadorVisitante}
                        onChange={(e) => setNotaTreinadorVisitante(e.target.value)}
                        className="w-full bg-slate-900 border border-purple-500/40 rounded-lg py-1.5 text-center text-xs text-purple-300 font-bold focus:border-purple-400"
                      />
                    </div>
                  </div>
                  <div>
                    <VoiceNoteControl
                      rows={2}
                      value={parecerCoachVisitante}
                      onChange={setParecerCoachVisitante}
                      placeholder="Parecer Tático do Treinador (modelo de jogo, substituições, postura tática...)"
                      showMinuteButton={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Painel de Estatísticas Coletivas */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Estatísticas Coletivas (Editáveis)
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'Posse de Bola (%)', mKey: 'posse', vKey: 'posse', placeholder: '50' },
                  { label: 'xG (Gols Esperados)', mKey: 'xg', vKey: 'xg', placeholder: '1.20' },
                  { label: 'Passes Totais / Certos', mKey: 'passes', vKey: 'passes', placeholder: '400 (80%)', wide: true },
                  { label: 'Finalizações Totais', mKey: 'finalizacoes', vKey: 'finalizacoes', placeholder: '10' },
                  { label: 'Finalizações no Alvo', mKey: 'finalizacoesAlvo', vKey: 'finalizacoesAlvo', placeholder: '4' },
                  { label: 'Faltas Cometidas', mKey: 'faltas', vKey: 'faltas', placeholder: '12' },
                  { label: 'Escanteios', mKey: 'escanteios', vKey: 'escanteios', placeholder: '5' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 bg-slate-950/60 p-1.5 px-2.5 rounded-lg border border-slate-800/80">
                    <input
                      type="text"
                      value={statsMandante[item.mKey]}
                      onChange={(e) => setStatsMandante({ ...statsMandante, [item.mKey]: e.target.value })}
                      placeholder={item.placeholder}
                      className={(item.wide ? 'w-24 text-[11px]' : 'w-14 text-xs') + ' text-center bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-white font-bold focus:border-emerald-500'}
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium text-center flex-1">{item.label}</span>
                    <input
                      type="text"
                      value={statsVisitante[item.vKey]}
                      onChange={(e) => setStatsVisitante({ ...statsVisitante, [item.vKey]: e.target.value })}
                      placeholder={item.placeholder}
                      className={(item.wide ? 'w-24 text-[11px]' : 'w-14 text-xs') + ' text-center bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-white font-bold focus:border-emerald-500'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BLOCO 3: LISTA TÁTICA DE ATLETAS COM TOGGLE RADAR, MONITORAR, DESTAQUE E PARECER (LADO A LADO) */}
          <div className="space-y-4">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Avaliação Individual de Atletas (Súmula Tática Lado a Lado)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Use <strong className="text-amber-400">⭐ Destaque</strong> para parecer da Seleção • <strong className="text-emerald-400">+ Radar</strong> para triagem e esteiras
              </span>
            </div>

            {/* Tabelas de Atletas (Mandante e Visitante Lado a Lado) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Equipe Mandante */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-white text-xs">{mandanteNome}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{atletasMandante.length} atletas listados</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                  {atletasMandante.map((atleta) => {
                    const playerKey = mandanteNome + '_' + (atleta.id || atleta.numero) + '_' + atleta.nome;
                    const hl = highlights[playerKey];
                    const isPositive = Boolean(atleta.isHighlight || atleta.destaque || (hl && hl.type === 'positive'));
                    const isNegative = Boolean(atleta.isNegativeHighlight || atleta.destaqueNegativo || (hl && hl.type === 'negative'));
                    const activeTags = (Array.isArray(atleta.caracteristicas) && atleta.caracteristicas.length > 0)
                      ? atleta.caracteristicas
                      : (Array.isArray(atleta.characteristics) ? atleta.characteristics : []);
                    return (
                      <div key={atleta.id} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700 transition space-y-1.5">
                        
                        {/* Linha Principal do Atleta */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap min-w-0">
                          <span className="w-5 text-center font-bold text-slate-400 text-[10px] shrink-0">{atleta.numero}</span>
                          
                          <input
                            type="text"
                            value={atleta.nome}
                            onChange={(e) => updateAtleta(true, atleta.id, 'nome', e.target.value)}
                            className="flex-1 min-w-[110px] bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-white font-semibold text-xs px-1 py-0.5 focus:outline-none"
                          />

                          {/* Badge de Posição com Atalho para Correção e Perfil */}
                          <button
                            type="button"
                            onClick={() => openPositionModal(atleta, true, 'radar')}
                            className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 flex-shrink-0 cursor-pointer"
                            title="Clique para ajustar posição específica, perna e características"
                          >
                            <span>{atleta.posicao || atleta.position}</span>
                            <Edit3 className="w-2.5 h-2.5 opacity-60" />
                          </button>

                          {/* Nota API (Alto Contraste Amarelo) */}
                          <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 flex-shrink-0 whitespace-nowrap" title="Nota algorítmica da API">
                            API: {atleta.notaApi}
                          </span>

                          {/* Nota Scout Editável (Verde) */}
                          <div className="flex items-center gap-1 shrink-0 flex-shrink-0">
                            <span className="text-[9px] text-emerald-400 font-bold uppercase">Scout:</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="-"
                              value={atleta.notaScout !== undefined && atleta.notaScout !== null ? atleta.notaScout : (atleta.scoutRating || '')}
                              onChange={(e) => updateAtleta(true, atleta.id, 'notaScout', e.target.value)}
                              className="w-11 bg-slate-900 border border-emerald-500/40 rounded text-center text-xs text-emerald-400 font-bold px-1 py-0.5 focus:border-emerald-400 shadow-inner placeholder-slate-600"
                            />
                          </div>

                          {/* Botão Destaque Positivo (⭐) */}
                          <button
                            type="button"
                            onClick={() => toggleHighlight(atleta, mandanteNome, 'positive')}
                            className={'p-1 rounded shrink-0 flex-shrink-0 transition cursor-pointer ' + (
                              isPositive
                                ? 'text-amber-400 bg-amber-400/20 ring-1 ring-amber-400/50 shadow-xs'
                                : 'text-slate-600 hover:text-amber-400/70 hover:bg-slate-800'
                            )}
                            title="Marcar como Destaque Positivo (⭐) para Seleção"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Botão Destaque Negativo (👎) */}
                          <button
                            type="button"
                            onClick={() => toggleHighlight(atleta, mandanteNome, 'negative')}
                            className={'p-1 rounded shrink-0 flex-shrink-0 transition cursor-pointer ' + (
                              isNegative
                                ? 'text-rose-400 bg-rose-400/20 ring-1 ring-rose-400/50 shadow-xs'
                                : 'text-slate-600 hover:text-rose-400/70 hover:bg-slate-800'
                            )}
                            title="Marcar como Destaque Negativo (👎)"
                          >
                            <ThumbsDown className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Botão Salvar/Remover do Radar */}
                          <button
                            type="button"
                            onClick={() => handleToggleRadar(atleta, true)}
                            className={'text-[9px] px-2 py-0.5 rounded font-bold transition shrink-0 flex-shrink-0 flex items-center gap-1 cursor-pointer ' + (
                              atleta.salvoRadar
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700'
                            )}
                            title="Adicionar ou remover atleta do Radar"
                          >
                            {atleta.salvoRadar ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Plus className="w-2.5 h-2.5 text-emerald-400" />}
                            <span>{atleta.salvoRadar ? '✓ No Radar' : '+ Radar'}</span>
                          </button>
                        </div>

                        {/* Badges de Esteiras e Características */}
                        {(atleta.salvoRadar || activeTags.length > 0 || atleta.monitorando || atleta.radarSub23 || atleta.hotList) && (
                          <div className="flex flex-wrap items-center gap-1 pl-6 pt-0.5">
                            {atleta.hotList && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                                <Flame className="w-2 h-2 text-rose-400 fill-rose-400" /> Hot List
                              </span>
                            )}
                            {atleta.radarSub23 && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                                <Sparkles className="w-2 h-2 text-purple-400" /> Sub-23
                              </span>
                            )}
                            {atleta.monitorando && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-0.5">
                                <Telescope className="w-2 h-2 text-sky-400" /> Monitoramento
                              </span>
                            )}
                            {activeTags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[8px] font-medium px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Equipe Visitante */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <span className="font-bold text-white text-xs">{visitanteNome}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{atletasVisitante.length} atletas listados</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                  {atletasVisitante.map((atleta) => {
                    const playerKey = visitanteNome + '_' + (atleta.id || atleta.numero) + '_' + atleta.nome;
                    const hl = highlights[playerKey];
                    const isPositive = Boolean(atleta.isHighlight || atleta.destaque || (hl && hl.type === 'positive'));
                    const isNegative = Boolean(atleta.isNegativeHighlight || atleta.destaqueNegativo || (hl && hl.type === 'negative'));
                    const activeTags = (Array.isArray(atleta.caracteristicas) && atleta.caracteristicas.length > 0)
                      ? atleta.caracteristicas
                      : (Array.isArray(atleta.characteristics) ? atleta.characteristics : []);
                    return (
                      <div key={atleta.id} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700 transition space-y-1.5">
                        
                        {/* Linha Principal do Atleta */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap min-w-0">
                          <span className="w-5 text-center font-bold text-slate-400 text-[10px] shrink-0">{atleta.numero}</span>
                          
                          <input
                            type="text"
                            value={atleta.nome}
                            onChange={(e) => updateAtleta(false, atleta.id, 'nome', e.target.value)}
                            className="flex-1 min-w-[110px] bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-white font-semibold text-xs px-1 py-0.5 focus:outline-none"
                          />

                          {/* Badge de Posição com Atalho para Correção e Perfil */}
                          <button
                            type="button"
                            onClick={() => openPositionModal(atleta, false, 'radar')}
                            className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 flex-shrink-0 cursor-pointer"
                            title="Clique para ajustar posição específica, perna e características"
                          >
                            <span>{atleta.posicao || atleta.position}</span>
                            <Edit3 className="w-2.5 h-2.5 opacity-60" />
                          </button>

                          {/* Nota API (Alto Contraste Amarelo) */}
                          <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 flex-shrink-0 whitespace-nowrap" title="Nota algorítmica da API">
                            API: {atleta.notaApi}
                          </span>

                          {/* Nota Scout Editável (Verde) */}
                          <div className="flex items-center gap-1 shrink-0 flex-shrink-0">
                            <span className="text-[9px] text-emerald-400 font-bold uppercase">Scout:</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="-"
                              value={atleta.notaScout !== undefined && atleta.notaScout !== null ? atleta.notaScout : (atleta.scoutRating || '')}
                              onChange={(e) => updateAtleta(false, atleta.id, 'notaScout', e.target.value)}
                              className="w-11 bg-slate-900 border border-emerald-500/40 rounded text-center text-xs text-emerald-400 font-bold px-1 py-0.5 focus:border-emerald-400 shadow-inner placeholder-slate-600"
                            />
                          </div>

                          {/* Botão Destaque Positivo (⭐) */}
                          <button
                            type="button"
                            onClick={() => toggleHighlight(atleta, visitanteNome, 'positive')}
                            className={'p-1 rounded shrink-0 flex-shrink-0 transition cursor-pointer ' + (
                              isPositive
                                ? 'text-amber-400 bg-amber-400/20 ring-1 ring-amber-400/50 shadow-xs'
                                : 'text-slate-600 hover:text-amber-400/70 hover:bg-slate-800'
                            )}
                            title="Marcar como Destaque Positivo (⭐) para Seleção"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Botão Destaque Negativo (👎) */}
                          <button
                            type="button"
                            onClick={() => toggleHighlight(atleta, visitanteNome, 'negative')}
                            className={'p-1 rounded shrink-0 flex-shrink-0 transition cursor-pointer ' + (
                              isNegative
                                ? 'text-rose-400 bg-rose-400/20 ring-1 ring-rose-400/50 shadow-xs'
                                : 'text-slate-600 hover:text-rose-400/70 hover:bg-slate-800'
                            )}
                            title="Marcar como Destaque Negativo (👎)"
                          >
                            <ThumbsDown className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Botão Salvar/Remover do Radar */}
                          <button
                            type="button"
                            onClick={() => handleToggleRadar(atleta, false)}
                            className={'text-[9px] px-2 py-0.5 rounded font-bold transition shrink-0 flex-shrink-0 flex items-center gap-1 cursor-pointer ' + (
                              atleta.salvoRadar
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700'
                            )}
                            title="Adicionar ou remover atleta do Radar"
                          >
                            {atleta.salvoRadar ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Plus className="w-2.5 h-2.5 text-emerald-400" />}
                            <span>{atleta.salvoRadar ? '✓ No Radar' : '+ Radar'}</span>
                          </button>
                        </div>

                        {/* Badges de Esteiras e Características */}
                        {(atleta.salvoRadar || activeTags.length > 0 || atleta.monitorando || atleta.radarSub23 || atleta.hotList) && (
                          <div className="flex flex-wrap items-center gap-1 pl-6 pt-0.5">
                            {atleta.hotList && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                                <Flame className="w-2 h-2 text-rose-400 fill-rose-400" /> Hot List
                              </span>
                            )}
                            {atleta.radarSub23 && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                                <Sparkles className="w-2 h-2 text-purple-400" /> Sub-23
                              </span>
                            )}
                            {atleta.monitorando && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-0.5">
                                <Telescope className="w-2 h-2 text-sky-400" /> Monitoramento
                              </span>
                            )}
                            {activeTags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[8px] font-medium px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 4: DESTAQUES SELECIONADOS DA PARTIDA */}
          {Object.keys(highlights).length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Destaques Selecionados da Partida ({Object.keys(highlights).length})
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(highlights).map(hl => (
                  <div key={hl.playerKey} className={'p-3 rounded-lg border space-y-2 ' + (
                    hl.type === 'positive' 
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' 
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hl.type === 'positive' ? (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ) : (
                          <ThumbsDown className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                        )}
                        <span className="font-bold text-white text-xs">{hl.name}</span>
                        <span className="text-[10px] text-slate-400">({hl.team} • {hl.position})</span>
                      </div>
                      <span className={'text-[9px] font-bold px-2 py-0.5 rounded uppercase ' + (
                        hl.type === 'positive' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                      )}>
                        {hl.type === 'positive' ? 'Destaque Positivo' : 'Destaque Negativo'}
                      </span>
                    </div>

                    <VoiceNoteControl
                      rows={2}
                      value={hl.comment || ''}
                      onChange={(val) => updateHighlightComment(hl.playerKey, val)}
                      placeholder="Parecer técnico individual deste atleta (ou ditar por voz)..."
                      showMinuteButton={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOCO 5: RESUMO GERAL DA PARTIDA */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Parecer Tático Geral da Partida
            </div>
            <VoiceNoteControl
              rows={3}
              value={parecerTatico}
              onChange={setParecerTatico}
              placeholder="Dinâmica do jogo, aspectos táticos gerais, destaques coletivos e clima do confronto (ou ditar por voz)..."
              showMinuteButton={false}
            />
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-800 bg-[#080d16] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            {savedSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" /> Relatório salvo com sucesso!
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveFullReport}
              className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditMode ? 'Salvar Alterações' : 'Salvar Relatório de Jogo Completo'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Mini-Modal de Correção de Posição, Características e Esteiras */}
      {positionModalData && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Perfil Tático do Atleta</h3>
                  <p className="text-[11px] text-slate-400">{positionModalData.atleta.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setPositionModalData(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seletor de Posição Específica */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Posição Específica</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['GOL', 'ZAG', 'LD', 'LE', 'VOL', 'MEI', 'EXT', 'CA'].map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handlePositionCodeChange(code)}
                    className={'py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ' + (
                      tempPosCode === code
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Perna Dominante */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Perna Dominante</label>
              <div className="grid grid-cols-3 gap-2">
                {['Destro', 'Canhoto', 'Ambidestro'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTempPerna(p)}
                    className={'py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ' + (
                      tempPerna === p
                        ? 'bg-blue-500 text-white border-blue-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Esteiras de Monitoramento */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Esteiras do Radar</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTempRadarSub23(prev => !prev)}
                  className={'py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition cursor-pointer ' + (
                    tempRadarSub23
                      ? 'bg-purple-500 text-white border-purple-400 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sub-23</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTempMonitoramento(prev => !prev)}
                  className={'py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition cursor-pointer ' + (
                    tempMonitoramento
                      ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <Telescope className="w-3 h-3" />
                  <span>Monitoramento</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTempHotList(prev => !prev)}
                  className={'py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition cursor-pointer ' + (
                    tempHotList
                      ? 'bg-rose-500 text-white border-rose-400 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <Flame className="w-3 h-3" />
                  <span>Hot List</span>
                </button>
              </div>
            </div>

            {/* Tags de Características Específicas */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                Características Táticas ({tempPosCode})
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
                {(CARACTERISTICAS_POR_POSICAO[tempPosCode] || []).map(c => {
                  const isSelected = tempCaracteristicas.includes(c.nome);
                  return (
                    <button
                      key={c.nome}
                      type="button"
                      onClick={() => toggleCaracteristica(c.nome)}
                      className={'px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ' + (
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      )}
                      title={c.descricao}
                    >
                      {c.nome}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPositionModalData(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPositionAndSave}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Confirmar e Salvar no Radar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
