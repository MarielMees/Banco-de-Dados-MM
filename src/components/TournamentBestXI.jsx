import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Trophy,
  Plus,
  X,
  Search,
  Star,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  FileText,
  Loader2,
  Calendar,
  Users,
  Award,
  RefreshCw,
  Shield,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

// Definição das formações táticas reaproveitadas do Time Sombra
const FORMATIONS_CONFIG = {
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'ext-e', label: 'Extremo Esquerdo', matchPositions: ['extremo'], top: 11, left: 16 },
      { id: 'ext-d', label: 'Extremo Direito', matchPositions: ['extremo'], top: 11, left: 84 },
      { id: 'mei-o', label: 'Meia Ofensivo', matchPositions: ['meia-ofensivo', 'medio'], top: 34, left: 50 },
      { id: 'med-c', label: 'Médio Central', matchPositions: ['medio'], top: 50, left: 30 },
      { id: 'vol', label: 'Volante (1º Médio)', matchPositions: ['medio'], top: 50, left: 70 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'mei-e', label: 'Meia / Ext. Esq.', matchPositions: ['extremo', 'meia-ofensivo'], top: 22, left: 18 },
      { id: 'mei-c', label: 'Meia Central', matchPositions: ['meia-ofensivo', 'medio'], top: 32, left: 50 },
      { id: 'mei-d', label: 'Meia / Ext. Dir.', matchPositions: ['extremo', 'meia-ofensivo'], top: 22, left: 82 },
      { id: 'vol-1', label: 'Volante 1', matchPositions: ['medio'], top: 50, left: 34 },
      { id: 'vol-2', label: 'Volante 2', matchPositions: ['medio'], top: 50, left: 66 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { id: 'ca-1', label: 'Centroavante 1', matchPositions: ['centroavante'], top: 8, left: 38 },
      { id: 'ca-2', label: 'Centroavante 2', matchPositions: ['centroavante'], top: 8, left: 62 },
      { id: 'me-e', label: 'Médio / Ext. Esq.', matchPositions: ['extremo', 'medio'], top: 30, left: 16 },
      { id: 'vol', label: 'Volante', matchPositions: ['medio'], top: 50, left: 38 },
      { id: 'med', label: 'Médio Central', matchPositions: ['medio'], top: 50, left: 62 },
      { id: 'me-d', label: 'Médio / Ext. Dir.', matchPositions: ['extremo', 'medio'], top: 30, left: 84 },
      { id: 'lat-e', label: 'Lat. Esquerdo', matchPositions: ['lat-esquerdo'], top: 72, left: 14 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 38 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 62 },
      { id: 'lat-d', label: 'Lat. Direito', matchPositions: ['lat-direito'], top: 72, left: 86 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '3-4-3': {
    name: '3-4-3',
    positions: [
      { id: 'ca', label: 'Centroavante', matchPositions: ['centroavante'], top: 8, left: 50 },
      { id: 'ext-e', label: 'Extremo Esquerdo', matchPositions: ['extremo'], top: 11, left: 18 },
      { id: 'ext-d', label: 'Extremo Direito', matchPositions: ['extremo'], top: 11, left: 82 },
      { id: 'ala-e', label: 'Ala Esquerdo', matchPositions: ['lat-esquerdo', 'extremo'], top: 38, left: 12 },
      { id: 'vol', label: 'Volante', matchPositions: ['medio'], top: 50, left: 38 },
      { id: 'med', label: 'Médio Central', matchPositions: ['medio'], top: 50, left: 62 },
      { id: 'ala-d', label: 'Ala Direito', matchPositions: ['lat-direito', 'extremo'], top: 38, left: 88 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 26 },
      { id: 'zag-c', label: 'Zagueiro Central', matchPositions: ['zagueiro'], top: 72, left: 50 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 74 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { id: 'ca-1', label: 'Centroavante 1', matchPositions: ['centroavante'], top: 8, left: 38 },
      { id: 'ca-2', label: 'Centroavante 2', matchPositions: ['centroavante'], top: 8, left: 62 },
      { id: 'ala-e', label: 'Ala Esquerdo', matchPositions: ['lat-esquerdo', 'extremo'], top: 38, left: 12 },
      { id: 'vol-1', label: 'Volante 1', matchPositions: ['medio'], top: 50, left: 36 },
      { id: 'mei-o', label: 'Meia Ofensivo', matchPositions: ['meia-ofensivo', 'medio'], top: 33, left: 50 },
      { id: 'vol-2', label: 'Volante 2', matchPositions: ['medio'], top: 50, left: 64 },
      { id: 'ala-d', label: 'Ala Direito', matchPositions: ['lat-direito', 'extremo'], top: 38, left: 88 },
      { id: 'zag-e', label: 'Zag. Canhoto', matchPositions: ['zag-canhoto'], top: 72, left: 26 },
      { id: 'zag-c', label: 'Zagueiro Central', matchPositions: ['zagueiro'], top: 72, left: 50 },
      { id: 'zag-d', label: 'Zag. Destro', matchPositions: ['zagueiro'], top: 72, left: 74 },
      { id: 'gl', label: 'Goleiro', matchPositions: ['goleiro'], top: 91, left: 50 }
    ]
  }
}

// Função utilitária para extrair o nome do torneio/campeonato de qualquer formato de relatório
export const extractTournamentName = (r) => {
  if (!r) return ''
  const val = r.competition || r.tournament || r.league || r.competicao || r.campeonato || r.campeonato_nome || r.torneio || r.liga
  if (typeof val === 'string') return val.trim()
  if (val && typeof val === 'object') {
    return (val.name || val.nome || '').trim()
  }
  return ''
}

// 1. FUNÇÃO UTILITÁRIA DE NORMALIZAÇÃO E AGRUPAMENTO DE COMPETIÇÕES
export const normalizeTournamentName = (name) => {
  if (!name) return ''
  const lower = String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  if (lower.includes("serie b")) return "Brasileirão Série B"
  if (lower.includes("serie a")) return "Brasileirão Série A"
  if (lower.includes("serie c")) return "Brasileirão Série C"
  if (lower.includes("serie d")) return "Brasileirão Série D"
  if (lower.includes("copa do brasil") || lower.includes("copa betano")) return "Copa do Brasil"
  if (lower.includes("libertadores")) return "Libertadores"
  if (lower.includes("sul-americana") || lower.includes("sulamericana") || lower.includes("sudamericana")) return "Sul-Americana"
  return String(name).trim()
}

export const normalizeLeagueKey = (name) => {
  if (!name) return ''
  const norm = normalizeTournamentName(name)
  return norm.toUpperCase().replace(/\s+/g, '_')
}

export const matchTournament = (compA, compB) => {
  if (!compA || !compB) return false
  return normalizeTournamentName(compA).toLowerCase() === normalizeTournamentName(compB).toLowerCase()
}

const STORAGE_KEY = 'radar_tournament_best_xi_v2'

// Mapeamento e dedução de posições para compatibilidade flexível e precisa
export const deduceAndNormalizePosition = (rawPos, rawFoot = '') => {
  if (!rawPos) return 'meia-ofensivo'
  const p = String(rawPos).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  const foot = String(rawFoot).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  if (p.includes('gol') || p.includes('gk') || p === 'gl' || p === 'goleiro') return 'goleiro'
  if (p.includes('canhot') || (p.includes('zag') && foot.includes('canhot')) || p === 'zag-canhoto') return 'zag-canhoto'
  if (p.includes('zag') || p.includes('cb') || p.includes('destro') || p.includes('defens') || p.includes('zagueiro')) return 'zagueiro'
  if ((p.includes('lat') && (p.includes('dir') || p.includes('d'))) || p === 'ld' || p === 'rb' || p.includes('ala d')) return 'lat-direito'
  if ((p.includes('lat') && (p.includes('esq') || p.includes('e'))) || p === 'le' || p === 'lb' || p.includes('ala e')) return 'lat-esquerdo'
  if (p.includes('vol') || p.includes('dm') || p.includes('defensivo') || p.includes('1o medio') || p.includes('1º medio')) return 'medio'
  if (p.includes('med') || p.includes('central') || p.includes('cm')) return 'medio'
  if (p.includes('mei') || p.includes('am') || p.includes('cam') || p.includes('ofensivo') || p.includes('armador')) return 'meia-ofensivo'
  if (p.includes('ext') || p.includes('pont') || p.includes('ala') || p.includes('rw') || p.includes('lw') || p.includes('winger')) return 'extremo'
  if (p.includes('cent') || p.includes('ata') || p.includes('avanc') || p === 'ca' || p === 'cf' || p === 'st' || p === 'centroavante') return 'centroavante'

  return normalizePositionKey(rawPos)
}

export const normalizePositionKey = (pos) => {
  if (!pos) return 'meia-ofensivo'
  const p = String(pos).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  if (p.includes('gol')) return 'goleiro'
  if (p.includes('canhot') || p === 'zag-canhoto') return 'zag-canhoto'
  if (p.includes('zag')) return 'zagueiro'
  if (p.includes('lat') && (p.includes('dir') || p.includes('d'))) return 'lat-direito'
  if (p.includes('lat') && (p.includes('esq') || p.includes('e'))) return 'lat-esquerdo'
  if (p.includes('vol') || p.includes('méd') || p.includes('med')) return 'medio'
  if (p.includes('mei')) return 'meia-ofensivo'
  if (p.includes('ext') || p.includes('ala') || p.includes('pont')) return 'extremo'
  if (p.includes('cent') || p.includes('ata') || p.includes('avanç') || p === 'ca') return 'centroavante'
  return p
}

export const formatPositionLabel = (pos) => {
  if (!pos) return '—'
  const p = String(pos).toLowerCase().trim()
  if (p === 'zagueiro' || p === 'zag. destro' || p === 'zag-destro' || p === 'zag') return 'Zag. Destro'
  if (p === 'zag-canhoto' || p === 'zag. canhoto' || p.includes('canhoto')) return 'Zag. Canhoto'
  if (p === 'lat-direito' || p === 'ld') return 'Lat. Direito'
  if (p === 'lat-esquerdo' || p === 'le') return 'Lat. Esquerdo'
  if (p === 'goleiro' || p === 'gol') return 'Goleiro'
  if (p === 'medio' || p.includes('volante') || p.includes('médio') || p.includes('medio')) return 'Volante / Médio'
  if (p === 'meia-ofensivo' || p.includes('meia')) return 'Meia Ofensivo'
  if (p === 'extremo' || p.includes('extremo') || p.includes('ponta')) return 'Extremo'
  if (p === 'centroavante' || p === 'ca' || p.includes('ata') || p.includes('centroavante')) return 'Centroavante'
  return pos
}

// 3. MAPEAMENTO INDESTRUTÍVEL PARA OS SLOTS DO CAMPO
export const mapTacticalCategory = (rawPos, rawFoot = '') => {
  const p = (rawPos || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  const f = (rawFoot || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

  // GOL: se contiver 'g', 'gol', 'goleiro', 'gk'
  if (p.includes('gol') || p.includes('gk') || p === 'gl' || p === 'g' || p.includes('goleiro')) {
    return 'GOL'
  }

  // LD: lateral direito
  if (p.includes('ld') || p.includes('lat. dir') || p.includes('lateral dir') || p.includes('lat dir') || p.includes('lat-d') || p.includes('lat-dir') || p.includes('rb') || (p.includes('lat') && (p.includes('dir') || p.includes('d')))) {
    return 'LD'
  }

  // LE: lateral esquerdo
  if (p.includes('le') || p.includes('lat. esq') || p.includes('lateral esq') || p.includes('lat esq') || p.includes('lat-e') || p.includes('lat-esq') || p.includes('lb') || (p.includes('lat') && (p.includes('esq') || p.includes('e')))) {
    return 'LE'
  }

  // ZAGUEIROS: segregação obrigatória entre canhotos e destros
  const isZagueiro = p.includes('zag') || p.includes('cb') || p.includes('def') || p === 'd' || p.includes('zagueiro')
  if (isZagueiro) {
    const isCanhoto = p.includes('canhot') || p.includes('esq') || f.includes('canhot') || f.includes('esq') || f === 'l' || f === 'left' || p === 'zag-canhoto'
    if (isCanhoto) return 'ZAG_CAN'
    return 'ZAG_DEST'
  }

  // CA: se contiver 'ca', 'cf', 'st', 'centroavante', 'ata', 'atacante' (mas não ponta/extremo/ala)
  if (!p.includes('ext') && !p.includes('ala') && !p.includes('pon') && (p.includes('ca') || p.includes('cf') || p.includes('st') || p.includes('centroavante') || p.includes('centro-avante') || p.includes('avanc') || p === 'f' || p.includes('atacante'))) {
    return 'CA'
  }

  // EXTREMOS / PONTAS: segregação entre direito e esquerdo se identificado
  if (p.includes('ext') || p.includes('pon') || p.includes('ala') || p.includes('rw') || p.includes('lw') || p.includes('winger') || p.includes('ponta') || p.includes('extremo')) {
    if (p.includes('esq') || p.includes('lw') || p.includes('left') || p.includes('-e') || p.includes('canhoto') || f.includes('canhot')) {
      return 'EXT_E'
    }
    if (p.includes('dir') || p.includes('rw') || p.includes('right') || p.includes('-d') || p.includes('destro') || f.includes('destro')) {
      return 'EXT_D'
    }
    return 'EXT'
  }

  // VOL: primeiro volante / defensivo
  if (p.includes('vol') || p.includes('dm') || p.includes('1o medio') || p.includes('1º medio') || p.includes('defensivo') || p.includes('volante') || p === '1o volante' || p === '1º volante') {
    return 'VOL'
  }

  // MC: médio central / segundo volante / meio-campo central
  if (p.includes('central') || p.includes('mc') || p.includes('cm') || p.includes('2o medio') || p.includes('2º medio') || p.includes('2o volante') || p.includes('2º volante') || p.includes('medio central')) {
    return 'MC'
  }

  // MEI: meia ofensivo / articulador / camisa 10
  if (p.includes('mei') || p.includes('am') || p.includes('cam') || p.includes('ofensivo') || p.includes('armador') || p.includes('meia')) {
    return 'MEI'
  }

  if (p.includes('medio') || p.includes('meio') || p === 'm') {
    return 'MC'
  }

  return 'CA'
}

export const slotMatchesCategory = (posId, category) => {
  const pid = (posId || '').toLowerCase()
  switch (category) {
    case 'GOL':
      return pid.startsWith('gl')
    case 'ZAG_CAN':
      return pid === 'zag-e' || (pid === 'zag-c' && category === 'ZAG_CAN')
    case 'ZAG_DEST':
      return pid === 'zag-d' || pid === 'zag-c'
    case 'LD':
      return pid === 'lat-d' || pid === 'ala-d' || pid.includes('dir')
    case 'LE':
      return pid === 'lat-e' || pid === 'ala-e' || pid.includes('esq')
    case 'VOL':
      return pid.startsWith('vol')
    case 'MC':
      return pid === 'med-c' || pid === 'med' || pid.startsWith('vol') || pid.startsWith('med')
    case 'MEI':
      return pid === 'mei-o' || pid === 'mei-c' || pid.startsWith('mei')
    case 'EXT_D':
      return pid === 'ext-d' || pid === 'mei-d' || pid === 'me-d' || pid === 'ala-d'
    case 'EXT_E':
      return pid === 'ext-e' || pid === 'mei-e' || pid === 'me-e' || pid === 'ala-e'
    case 'EXT':
      return pid.startsWith('ext') || pid.startsWith('me-') || pid.startsWith('mei-d') || pid.startsWith('mei-e') || pid.startsWith('ala')
    case 'CA':
      return pid.startsWith('ca') || pid.startsWith('ata')
    default:
      return false
  }
}

export const isCategoryCompatibleWithSlot = (posId, category) => {
  if (slotMatchesCategory(posId, category)) return true
  const pid = (posId || '').toLowerCase()
  if (pid === 'zag-c' && (category === 'ZAG_DEST' || category === 'ZAG_CAN')) return true
  if (pid === 'zag-e' && category === 'ZAG_DEST') return true
  if (pid === 'zag-d' && category === 'ZAG_CAN') return true
  if ((pid.startsWith('vol') || pid.startsWith('med')) && (category === 'VOL' || category === 'MC' || category === 'MEI')) return true
  if ((pid.startsWith('mei') || pid.startsWith('med')) && (category === 'MEI' || category === 'MC')) return true
  if ((pid.startsWith('ext') || pid.startsWith('mei-d') || pid.startsWith('mei-e') || pid.startsWith('me-')) && (category === 'EXT' || category === 'EXT_D' || category === 'EXT_E' || category === 'MEI')) return true
  if (pid === 'ext-d' && (category === 'EXT_E' || category === 'EXT')) return true
  if (pid === 'ext-e' && (category === 'EXT_D' || category === 'EXT')) return true
  if (pid.startsWith('ca') && (category === 'CA' || category === 'EXT' || category === 'EXT_D' || category === 'EXT_E')) return true
  if (pid.startsWith('ext') && category === 'CA') return true
  return false
}

export const findRegisteredPlayer = (highlight, playersList) => {
  if (!highlight || !playersList?.length) return null

  // 1. Tenta por ID direto se existir (id, idAtleta, savedPlayerId)
  const ids = [highlight.id, highlight.idAtleta, highlight.savedPlayerId].filter(Boolean).map(String)
  if (ids.length > 0) {
    const found = playersList.find(p => ids.includes(String(p.id)))
    if (found) return found
  }

  // 2. Tenta por apiId
  if (highlight.apiId) {
    const found = playersList.find(p => p.apiId && String(p.apiId) === String(highlight.apiId))
    if (found) return found
  }

  // 3. Tenta por correspondência de nome normalizado (+ clube se disponível)
  const hlName = (highlight.name || highlight.nome || highlight.apelido || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
  if (!hlName) return null

  const hlClub = (highlight.clube || highlight.ca || highlight.team || highlight.teamName || highlight.clubeAtual || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()

  // Primeiro match exato de nome + clube compatível
  const exactWithClub = playersList.find(p => {
    const pName = (p.nome || p.name || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim()
    if (pName !== hlName) return false
    if (!hlClub) return true
    const pClub = (p.clubeAtual || p.ca || p.clube || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim()
    return !pClub || pClub === hlClub || pClub.includes(hlClub) || hlClub.includes(pClub)
  })
  if (exactWithClub) return exactWithClub

  // Match por nome (exato ou substring)
  return playersList.find(p => {
    const pName = (p.nome || p.name || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim()
    if (!pName) return false
    return pName === hlName || pName.includes(hlName) || hlName.includes(pName)
  }) || null
}

export default function TournamentBestXI({ onBack, matchReports = [], players = [] }) {
  // Lista de jogadores garantida com fallback seguro para a base local
  const allPlayersList = useMemo(() => {
    if (Array.isArray(players) && players.length > 0) return players
    try {
      const saved = localStorage.getItem('scout_players') || localStorage.getItem('radar_players')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return players || []
  }, [players])

  // Sincronização manual e em tempo real com relatórios do localStorage
  const [syncCount, setSyncCount] = useState(0)
  const [syncToast, setSyncToast] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // 1. AUDITORIA E LEITURA UNIVERSAL DO LOCALSTORAGE (Apenas Relatórios Reais Salvos)
  const allReportsList = useMemo(() => {
    let collected = Array.isArray(matchReports) ? [...matchReports] : []
    try {
      // Varre apenas as chaves reais de relatórios pós-jogo e express (NUNCA radar_database_matches)
      const storageKeys = [
        'scout_match_reports',
        'radar_match_reports',
        'matchReports',
        'match_reports',
        'saved_match_reports',
        'radar_reports',
        'reports'
      ]

      storageKeys.forEach(k => {
        const item = localStorage.getItem(k)
        if (item) {
          try {
            const parsed = JSON.parse(item)
            if (Array.isArray(parsed)) {
              collected.push(...parsed)
            } else if (parsed && typeof parsed === 'object') {
              collected.push(parsed)
            }
          } catch (e) {}
        }
      })

      const repMap = new Map()
      collected.forEach(r => {
        if (r && (r.id || r.partida)) {
          const key = r.id || `${r.partida}_${r.data || ''}`
          if (!repMap.has(key)) {
            repMap.set(key, r)
          }
        }
      })
      const finalReports = Array.from(repMap.values())
      console.log('RELATÓRIOS ENCONTRADOS:', finalReports)
      return finalReports
    } catch (e) {
      console.warn('Erro ao recuperar relatórios universais:', e)
      return Array.isArray(matchReports) ? matchReports : []
    }
  }, [matchReports, syncCount])

  // ABAS DINÂMICAS DE COMPETIÇÕES (Baseadas estritamente nos relatórios salvos)
  const availableTournaments = useMemo(() => {
    const list = []
    const seen = new Set()
    allReportsList.forEach(r => {
      const rawName = extractTournamentName(r) || r.tournament || r.competicao || r.campeonato || r.campeonato_nome || r.torneio || r.league || r.liga || ''
      const rawStr = typeof rawName === 'string' ? rawName.trim() : (rawName?.name || '')
      const name = normalizeTournamentName(rawStr) || rawStr
      if (name && !seen.has(name.toLowerCase().trim())) {
        seen.add(name.toLowerCase().trim())
        list.push(name)
      }
    })
    return list
  }, [allReportsList])

  // Anos disponíveis extraídos dinamicamente dos relatórios cadastrados
  const availableYears = useMemo(() => {
    const yearsSet = new Set()
    allReportsList.forEach(r => {
      if (r.data) {
        const y = new Date(r.data).getFullYear()
        if (!isNaN(y) && y > 1990) {
          yearsSet.add(y)
        }
      }
    })
    if (yearsSet.size === 0) {
      yearsSet.add(2026)
      yearsSet.add(2025)
      yearsSet.add(2024)
    }
    return Array.from(yearsSet).sort((a, b) => b - a)
  }, [allReportsList])

  // Torneio ativo selecionado: dinâmico (primeiro por padrão se houver)
  const [selectedTournament, setSelectedTournament] = useState(() => '')

  // Ano / Temporada ativo
  const [selectedYear, setSelectedYear] = useState(() => {
    return availableYears[0] || new Date().getFullYear()
  })

  // Sincroniza a primeira competição ativa por padrão ao ler os relatórios
  useEffect(() => {
    if (availableTournaments.length > 0) {
      if (!selectedTournament || !availableTournaments.some(t => t.toLowerCase().trim() === selectedTournament.toLowerCase().trim())) {
        setSelectedTournament(availableTournaments[0])
      }
    } else {
      setSelectedTournament('')
    }
  }, [availableTournaments, selectedTournament])

  // Ajusta o ano se necessário
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [availableYears, selectedYear])

  // Formação tática ativa
  const [selectedFormation, setSelectedFormation] = useState('4-3-3')

  // Estado de curadoria manual por campeonato e ano salvo em localStorage
  const [tournamentCustomTeams, setTournamentCustomTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch (e) {
      return {}
    }
  })

  // Modal para adicionar atleta manualmente no slot
  const [assigningPos, setAssigningPos] = useState(null)
  const [playerSearch, setPlayerSearch] = useState('')
  const [filterTab, setFilterTab] = useState('SUGERIDOS') // 'SUGERIDOS' | 'TODOS'

  // Modal Rápido de Destaques dos Relatórios
  const [isHighlightsModalOpen, setIsHighlightsModalOpen] = useState(false)
  const [highlightsSearch, setHighlightsSearch] = useState('')
  const [highlightPosSelection, setHighlightPosSelection] = useState({})

  // Reposicionamento livre dos blocos de posição no gramado
  const [draggingPosId, setDraggingPosId] = useState(null)
  const isDraggingBlockRef = useRef(false)
  const pitchRef = useRef(null)

  // Salvar no localStorage sempre que houver alteração
  const saveCustomTeam = (updatedCustomTeams) => {
    setTournamentCustomTeams(updatedCustomTeams)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomTeams))
    } catch (e) {
      console.warn('Erro ao salvar radar_tournament_best_xi no localStorage:', e)
    }
  }

  // Limpa chaves legadas de cache do localStorage que possam conter escalações mock antigas
  useEffect(() => {
    try {
      localStorage.removeItem('radar_selection_squad')
      localStorage.removeItem('radar_tournament_best_xi')
      localStorage.removeItem('radar_tournament_best_xi_v2')
    } catch (e) {}
  }, [])

  // Sincronização automática ao entrar na tela ou alterar torneio/ano
  useEffect(() => {
    setSyncCount(prev => prev + 1)
  }, [selectedTournament, selectedYear])

  const handleSyncFromReports = () => {
    setIsSyncing(true)
    setSyncCount(prev => prev + 1)
    setTimeout(() => {
      setIsSyncing(false)
      setSyncToast('Destaques sincronizados com os relatórios!')
      setTimeout(() => {
        setSyncToast(null)
      }, 3000)
    }, 300)
  }

  // 1. BUSCA TOLERANTE DE TORNEIO (NORMALIZAÇÃO TOTAL)
  const clean = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  const filteredReports = useMemo(() => {
    if (!selectedTournament) return allReportsList
    const cleanSelected = clean(selectedTournament)

    const list = allReportsList.filter(report => {
      const reportTournament = extractTournamentName(report) || report.tournament || report.competicao || report.campeonato || report.campeonato_nome || report.torneio || report.league || report.liga || ''
      const cleanReport = clean(typeof reportTournament === 'string' ? reportTournament : (reportTournament?.name || ''))
      if (!cleanReport || !cleanSelected) return false
      return cleanReport.includes(cleanSelected) || cleanSelected.includes(cleanReport)
    })

    console.log("RELATORIOS FILTRADOS:", list)
    return list
  }, [allReportsList, selectedTournament])

  // 2. EXTRAÇÃO DOS ATLETAS: DESTAQUES (★) COM VÍNCULO NO BANCO 'players' E MAIOR MÉDIA DE NOTAS
  const extractedPlayers = useMemo(() => {
    const seenMap = new Map()

    filteredReports.forEach(report => {
      const reportId = String(report.id || report.matchId || `${report.partida || ''}_${report.data || ''}`)
      const homeTeam = report.homeTeam || report.mandante?.nome || (typeof report.mandante === 'string' ? report.mandante : '') || report.teams?.home?.name || ''
      const awayTeam = report.awayTeam || report.visitante?.nome || (typeof report.visitante === 'string' ? report.visitante : '') || report.teams?.away?.name || ''

      const rawPlayers = [
        ...(Array.isArray(report.highlights) ? report.highlights : (report.highlights && typeof report.highlights === 'object' ? Object.values(report.highlights) : [])),
        ...(Array.isArray(report.destaques) ? report.destaques : []),
        ...(Array.isArray(report.destaquesGerais) ? report.destaquesGerais : []),
        ...(Array.isArray(report.matchHighlights) ? report.matchHighlights : []),
        ...(Array.isArray(report.atletasAvaliados) ? report.atletasAvaliados : []),
        ...(Array.isArray(report.atletasMandante) ? report.atletasMandante : []),
        ...(Array.isArray(report.atletasVisitante) ? report.atletasVisitante : []),
        ...(Array.isArray(report.atletas) ? report.atletas : []),
        ...(Array.isArray(report.lineup) ? report.lineup : []),
        ...(Array.isArray(report.home_lineup) ? report.home_lineup : []),
        ...(Array.isArray(report.away_lineup) ? report.away_lineup : [])
      ]

      // Mapa local de atletas com destaque nesta partida para evitar contagens duplicadas dentro do mesmo relatório
      const reportHighlightsByPlayer = new Map()

      rawPlayers.forEach(player => {
        if (!player) return
        const pName = player.name || player.nome || player.apelido
        if (!pName) return

        // Trava de destaques negativos
        const isNegative = Boolean(
          player.type === 'negative' ||
          player.tipoDestaque === 'negativo' ||
          player.destaqueNegativo === true
        )
        if (isNegative) return

        // 1. FILTRO EXCLUSIVO POR ESTRELA (⭐ / destaque === true)
        const pId = player.id || player.idAtleta
        const isObjectHighlight = Boolean(
          report.highlights && (
            (pId && (report.highlights[pId] || report.highlights[String(pId)])) ||
            (pName && (report.highlights[pName] || report.highlights[String(pName).trim()]))
          )
        )

        const isHighlight = Boolean(
          isObjectHighlight ||
          player.isHighlight === true ||
          player.is_highlight === true ||
          player.highlight === true ||
          player.destaque === true ||
          player.destaquePositivo === true ||
          player.tipoDestaque === 'positivo' ||
          player.estrela === true ||
          player.isExplicitHighlight === true
        )

        // a) SÓ ENTRAM atletas com destaque === true
        if (!isHighlight) return

        // b) OBRIGATÓRIO ter vínculo válido com a lista de jogadores cadastrados ('players')
        const registered = findRegisteredPlayer(player, allPlayersList)
        if (!registered) return

        const rawNota = player.scoutRating ?? player.rating ?? player.nota ?? player.notaScout ?? player.scout_rating ?? player.notaApi ?? player.apiRating
        const numNota = Number(String(rawNota || 0).replace(',', '.'))

        const rawPos = registered.posicao || player.position || player.posicao || player.pos || "GOL"
        const rawFoot = registered.pePreferencial || registered.pe || player.pe || player.foot || player.pePreferencial || ''

        const club = (
          registered.clubeAtual ||
          registered.ca ||
          registered.clube ||
          player.team ||
          player.teamName ||
          player.clube ||
          player.clubeAtual ||
          player.ca ||
          (player.lado === 'visitante' || player.time === 'visitante' ? awayTeam : '') ||
          (player.lado === 'mandante' || player.time === 'mandante' ? homeTeam : '') ||
          '—'
        )

        const regId = String(registered.id)
        const existingInThisReport = reportHighlightsByPlayer.get(regId)
        if (!existingInThisReport) {
          reportHighlightsByPlayer.set(regId, {
            registered,
            player,
            numNota: numNota > 0 ? numNota : 0,
            rawPos,
            rawFoot,
            club
          })
        } else if (numNota > 0 && (!existingInThisReport.numNota || numNota > existingInThisReport.numNota)) {
          existingInThisReport.numNota = numNota
        }
      })

      // Consolida os destaques ÚNICOS desta partida no mapa global da competição
      reportHighlightsByPlayer.forEach((item, regId) => {
        const tacticalCategory = mapTacticalCategory(item.rawPos, item.rawFoot)
        let entry = seenMap.get(regId)
        if (!entry) {
          entry = {
            id: item.registered.id,
            apiId: item.registered.apiId || item.player.apiId || null,
            nome: item.registered.nome || item.player.nome || item.player.name,
            notas: item.numNota > 0 ? [item.numNota] : [],
            maxNota: item.numNota > 0 ? item.numNota : 0,
            posicao: item.rawPos,
            posicaoOriginal: item.player.posicao || item.rawPos,
            tacticalCategory: tacticalCategory,
            clube: item.club,
            nivel: item.registered.nivel || item.player.nivel || 'B',
            pe: item.registered.pePreferencial || item.registered.pe || item.rawFoot || (tacticalCategory === 'ZAG_CAN' ? 'Canhoto' : 'Destro'),
            isHighlight: true,
            matchIds: new Set([reportId]),
            destaquesCount: 1,
            totalDestaques: 1,
            totalJogos: 1,
            isAuto: true,
            registeredPlayer: item.registered
          }
          seenMap.set(regId, entry)
        } else {
          entry.matchIds.add(reportId)
          if (item.numNota > 0) {
            entry.notas.push(item.numNota)
            if (item.numNota > entry.maxNota) {
              entry.maxNota = item.numNota
            }
          }
        }
      })
    })

    // Calcular média das notas e total estrito de destaques por partidas únicas
    seenMap.forEach(entry => {
      const totalDestaques = entry.matchIds ? entry.matchIds.size : 1
      entry.destaquesCount = totalDestaques
      entry.totalDestaques = totalDestaques

      const sum = entry.notas.reduce((acc, val) => acc + val, 0)
      const media = entry.notas.length > 0 
        ? Number((sum / entry.notas.length).toFixed(1)) 
        : (entry.maxNota > 0 ? entry.maxNota : 6.0)
      entry.mediaNota = media
      entry.mediaNotas = media
      entry.nota = media // Chave primária de ordenação: maior média de notas
    })

    const extracted = Array.from(seenMap.values()).sort((a, b) => {
      if (b.nota !== a.nota) return b.nota - a.nota
      return (b.destaquesCount || 0) - (a.destaquesCount || 0)
    })

    console.log("ATLETAS EXTRAÍDOS (Destaques determinísticos por partidas únicas):", extracted)
    return extracted
  }, [filteredReports, allPlayersList])

  const competitionHighlights = extractedPlayers

  const tournamentRankingsByPos = useMemo(() => {
    const byPos = {}
    extractedPlayers.forEach(p => {
      const cat = p.tacticalCategory || 'MEI'
      if (!byPos[cat]) byPos[cat] = []
      byPos[cat].push(p)
    })
    return byPos
  }, [extractedPlayers])

  // Formação ativa
  const activeFormation = FORMATIONS_CONFIG[selectedFormation] || FORMATIONS_CONFIG['4-3-3']

  // Chave de curadoria com suporte a ano e chave canônica de torneio (preservando escalações manuais anteriores)
  const tournamentKey = normalizeLeagueKey(selectedTournament)
  const storageCustomKey = `${tournamentKey}_${selectedYear}`
  const currentTournamentCustom = 
    tournamentCustomTeams[storageCustomKey] || 
    tournamentCustomTeams[`${selectedTournament}_${selectedYear}`] || 
    tournamentCustomTeams[selectedTournament] || 
    tournamentCustomTeams[tournamentKey] || 
    {}
  const manualSlots = currentTournamentCustom.escalacao || {}

  // 3. LIMPEZA IMEDIATA DOS SLOTS VADIOS & EXIBIÇÃO APENAS DE ATLETAS COM ESTRELA
  const slotsData = useMemo(() => {
    const combined = {}
    const allocatedPlayerIds = new Set()

    // 1. Prioriza os atletas alocados manualmente pelo scout QUE TENHAM ESTRELA
    activeFormation.positions.forEach(pos => {
      const customList = manualSlots[pos.id]
      if (Array.isArray(customList) && customList.length > 0) {
        const starCustomList = customList.filter(p => 
          p && p.id && extractedPlayers.some(ep => String(ep.id).toLowerCase() === String(p.id).toLowerCase() || ep.nome.toLowerCase().trim() === (p.nome || '').toLowerCase().trim())
        )
        if (starCustomList.length > 0) {
          combined[pos.id] = starCustomList
          starCustomList.forEach(p => {
            if (p && p.id) allocatedPlayerIds.add(String(p.id).toLowerCase())
          })
        }
      }
    })

    // 2. Preenche os slots com os atletas de extractedPlayers (que passaram estritamente pelo filtro da estrela)
    // Passo 2A: Garante o 1º TITULAR de cada slot aberto priorizando match direto de categoria
    activeFormation.positions.forEach(pos => {
      if (combined[pos.id] !== undefined && combined[pos.id].length > 0) return

      let candidates = extractedPlayers.filter(p => {
        if (allocatedPlayerIds.has(String(p.id).toLowerCase())) return false
        return slotMatchesCategory(pos.id, p.tacticalCategory)
      })

      if (candidates.length === 0) {
        candidates = extractedPlayers.filter(p => {
          if (allocatedPlayerIds.has(String(p.id).toLowerCase())) return false
          return isCategoryCompatibleWithSlot(pos.id, p.tacticalCategory)
        })
      }

      candidates.sort((a, b) => (b.nota || 0) - (a.nota || 0))

      if (candidates.length > 0) {
        const titular = candidates[0]
        allocatedPlayerIds.add(String(titular.id).toLowerCase())
        combined[pos.id] = [titular]
      } else {
        combined[pos.id] = []
      }
    })

    // Passo 2B: Completa as opções seguintes (2ª a 5ª opção) com os candidatos restantes daquela posição
    activeFormation.positions.forEach(pos => {
      const currentList = combined[pos.id] || []
      const needed = 5 - currentList.length
      if (needed <= 0) return

      let extraCandidates = extractedPlayers.filter(p => {
        if (allocatedPlayerIds.has(String(p.id).toLowerCase())) return false
        return slotMatchesCategory(pos.id, p.tacticalCategory)
      })

      if (extraCandidates.length === 0) {
        extraCandidates = extractedPlayers.filter(p => {
          if (allocatedPlayerIds.has(String(p.id).toLowerCase())) return false
          return isCategoryCompatibleWithSlot(pos.id, p.tacticalCategory)
        })
      }

      extraCandidates.sort((a, b) => (b.nota || 0) - (a.nota || 0))

      if (extraCandidates.length > 0) {
        const toAdd = extraCandidates.slice(0, needed)
        toAdd.forEach(c => allocatedPlayerIds.add(String(c.id).toLowerCase()))
        combined[pos.id] = [...currentList, ...toAdd]
      }
    })

    return combined
  }, [activeFormation, manualSlots, extractedPlayers])

  // Contagem de posições preenchidas
  const filledCount = useMemo(() => {
    return activeFormation.positions.filter(pos => {
      const list = slotsData[pos.id] || []
      return list.length > 0
    }).length
  }, [activeFormation, slotsData])

  // Remover atleta do slot
  const handleRemovePlayer = (posId, index) => {
    const currentList = slotsData[posId] || []
    const updatedList = currentList.filter((_, i) => i !== index)

    const updatedTournaments = {
      ...tournamentCustomTeams,
      [storageCustomKey]: {
        ...currentTournamentCustom,
        formacao: selectedFormation,
        escalacao: {
          ...manualSlots,
          [posId]: updatedList
        }
      }
    }
    saveCustomTeam(updatedTournaments)
  }

  // Escalar atleta manualmente no slot
  const handleAssignPlayer = (player) => {
    if (!assigningPos || !player) return
    const posId = assigningPos.id
    const currentList = slotsData[posId] || []
    if (currentList.length >= 5) return
    if (currentList.some(p => p.id === player.id || (p.nome && player.nome && p.nome.toLowerCase() === player.nome.toLowerCase()))) return

    // Procura se tem histórico desse jogador no torneio e ano selecionados
    const matchData = extractedPlayers.find(r => 
      String(r.id) === String(player.id) || 
      (r.nome && player.nome && r.nome.toLowerCase().trim() === player.nome.toLowerCase().trim())
    )

    const destaquesCount = matchData ? matchData.destaquesCount : (player.destaquesCount || 0)
    const mediaNota = matchData ? matchData.mediaNota : (player.mediaNota !== undefined && player.mediaNota !== null ? player.mediaNota : (player.mediaNotas || player.mediaGeral || null))

    const newPlayerEntry = {
      id: player.id || `atleta-report-${Date.now()}`,
      nome: player.nome,
      clube: player.clube || player.ca || player.clubeAtual || '—',
      nivel: player.nivel || 'B',
      mediaNota: mediaNota,
      mediaNotas: mediaNota,
      destaquesCount: destaquesCount,
      posicaoOriginal: player.posicaoOriginal || player.posicao,
      isAuto: false
    }

    const updatedTournaments = {
      ...tournamentCustomTeams,
      [storageCustomKey]: {
        ...currentTournamentCustom,
        formacao: selectedFormation,
        escalacao: {
          ...manualSlots,
          [posId]: [...currentList, newPlayerEntry]
        }
      }
    }
    saveCustomTeam(updatedTournaments)
    setAssigningPos(null)
    setPlayerSearch('')
  }

  // Escalar atleta diretamente a partir do modal rápido de destaques
  const handleAssignPlayerToPos = (player, targetPosId) => {
    if (!targetPosId || !player) return
    const posObj = activeFormation.positions.find(p => p.id === targetPosId)
    const currentList = slotsData[targetPosId] || []
    if (currentList.length >= 5) return

    // Limpa este atleta de qualquer outra posição para evitar duplicidade no campo
    const updatedEscalacao = { ...manualSlots }
    Object.keys(updatedEscalacao).forEach(pKey => {
      if (Array.isArray(updatedEscalacao[pKey])) {
        updatedEscalacao[pKey] = updatedEscalacao[pKey].filter(
          p => p && p.id !== player.id && !(p.nome && player.nome && p.nome.toLowerCase().trim() === player.nome.toLowerCase().trim())
        )
      }
    })

    const targetList = updatedEscalacao[targetPosId] || currentList.filter(
      p => p && p.id !== player.id && !(p.nome && player.nome && p.nome.toLowerCase().trim() === player.nome.toLowerCase().trim())
    )

    const mediaVal = player.mediaNota !== null && player.mediaNota !== undefined 
      ? player.mediaNota 
      : (player.maxNota !== null && player.maxNota !== undefined ? player.maxNota : (player.nota || null))

    const newPlayerEntry = {
      id: player.id || `atleta-report-${Date.now()}`,
      nome: player.nome,
      clube: player.clube || player.ca || player.clubeAtual || '—',
      nivel: player.nivel || 'B',
      mediaNota: mediaVal,
      mediaNotas: mediaVal,
      destaquesCount: player.destaquesCount || player.estrelas || 1,
      posicaoOriginal: player.posicaoOriginal || player.posicao,
      isAuto: false
    }

    const updatedTournaments = {
      ...tournamentCustomTeams,
      [storageCustomKey]: {
        ...currentTournamentCustom,
        formacao: selectedFormation,
        escalacao: {
          ...updatedEscalacao,
          [targetPosId]: [...targetList, newPlayerEntry]
        }
      }
    }
    saveCustomTeam(updatedTournaments)
    setSyncToast(`${player.nome} escalado em ${posObj?.label || targetPosId}!`)
    setTimeout(() => setSyncToast(null), 3000)
  }

  // Resetar escalação da posição para o ranking automático
  const handleResetPositionToAuto = (posId) => {
    const updatedManual = { ...manualSlots }
    delete updatedManual[posId]

    const updatedTournaments = {
      ...tournamentCustomTeams,
      [storageCustomKey]: {
        ...currentTournamentCustom,
        formacao: selectedFormation,
        escalacao: updatedManual
      }
    }
    saveCustomTeam(updatedTournaments)
  }

  // Reposicionamento livre dos blocos de posição no gramado
  const handlePositionMouseDown = (e, posId) => {
    if (e.button !== 0 || e.target.closest('button')) return
    e.preventDefault()

    const pitchEl = pitchRef.current
    if (!pitchEl) return

    isDraggingBlockRef.current = true
    setDraggingPosId(posId)

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingBlockRef.current || !pitchRef.current) return
      const fieldRect = pitchRef.current.getBoundingClientRect()

      const newLeft = Math.max(2, Math.min(84, ((moveEvent.clientX - fieldRect.left) / fieldRect.width) * 100))
      const newTop = Math.max(2, Math.min(92, ((moveEvent.clientY - fieldRect.top) / fieldRect.height) * 100))

      const currentCustomPositions = currentTournamentCustom.customPositions || {}
      const updatedTournaments = {
        ...tournamentCustomTeams,
        [storageCustomKey]: {
          ...currentTournamentCustom,
          formacao: selectedFormation,
          customPositions: {
            ...currentCustomPositions,
            [posId]: {
              top: `${newTop.toFixed(2)}%`,
              left: `${newLeft.toFixed(2)}%`
            }
          }
        }
      }
      saveCustomTeam(updatedTournaments)
    }

    const handleMouseUp = () => {
      isDraggingBlockRef.current = false
      setDraggingPosId(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Restaurar posições padrão da formação atual
  const handleResetPositions = () => {
    const updatedTournament = { ...currentTournamentCustom }
    delete updatedTournament.customPositions

    const updatedTournaments = {
      ...tournamentCustomTeams,
      [storageCustomKey]: updatedTournament
    }
    saveCustomTeam(updatedTournaments)
  }

  // Exportação em PDF executiva do Campograma da Seleção do Campeonato
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExportPdf = async () => {
    if (!pitchRef.current || isExportingPdf) return
    setIsExportingPdf(true)

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const element = pitchRef.current

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        filter: (node) => {
          if (
            node.tagName === 'BUTTON' ||
            node.classList?.contains('no-export') ||
            node.classList?.contains('no-pdf') ||
            node.getAttribute?.('data-export-hide') === 'true'
          ) {
            return false
          }
          return true
        }
      })

      const img = new Image()
      img.src = dataUrl
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = rej
      })

      const headerHeight = 120
      const pdfWidth = img.width
      const pdfHeight = img.height + headerHeight

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      })

      // Bloco do Cabeçalho Dark Executivo
      pdf.setFillColor(6, 13, 23)
      pdf.rect(0, 0, pdfWidth, headerHeight, 'F')

      // Linha de detalhe superior em âmbar
      pdf.setFillColor(245, 158, 11)
      pdf.rect(0, 0, pdfWidth, 4, 'F')

      // Título Principal
      const torneioNome = (selectedTournament || 'CAMPEONATO').replace(/[^\w\s\dÀ-ú-]/gi, '').trim()
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text(`SELEÇÃO DO CAMPEONATO — ${torneioNome.toUpperCase()} (${selectedYear})`, 40, 48)

      // Subtítulo / Metadados
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(14)
      const dataFormatada = new Date().toLocaleDateString('pt-BR')
      pdf.text(
        `Temporada: ${selectedYear}  |  Esquema Tático: ${selectedFormation || '4-3-3'}  |  Critério: Destaques da Rodada e Médias Técnicas  |  Data: ${dataFormatada}`,
        40,
        84
      )

      // Insere a imagem do campinho renderizado
      pdf.addImage(dataUrl, 'PNG', 0, headerHeight, img.width, img.height)

      // Download do arquivo
      const safeTorneio = torneioNome.replace(/\s+/g, '_') || 'torneio'
      pdf.save(`Selecao_${safeTorneio}_${selectedYear}_${selectedFormation || '4-3-3'}.pdf`)
    } catch (err) {
      console.error('Erro ao gerar PDF da Seleção via html-to-image:', err)
      alert('Houve um erro ao gerar o PDF da Seleção. Verifique o console.')
    } finally {
      setIsExportingPdf(false)
    }
  }

  // Destaques filtrados especificamente para a posição que está sendo escalada no modal
  const positionHighlights = useMemo(() => {
    if (!assigningPos) return []
    const matchPositions = assigningPos.matchPositions || []

    // Trava global: reúne IDs e nomes de todos os atletas já alocados em qualquer posição do campo
    const allPitchAssignedIds = new Set(
      Object.values(slotsData)
        .flat()
        .filter(Boolean)
        .map(p => p.id)
    )
    const allPitchAssignedNames = new Set(
      Object.values(slotsData)
        .flat()
        .filter(Boolean)
        .map(p => (p.nome || '').toLowerCase().trim())
    )

    const isAssigningZagCanhoto = assigningPos.id === 'zag-e' || matchPositions.includes('zag-canhoto')
    const isAssigningZagDestro = assigningPos.id === 'zag-d' || assigningPos.id === 'zag-c'

    return competitionHighlights
      .map(h => ({
        ...h,
        isAlreadyAssigned: allPitchAssignedIds.has(h.id) || (h.nome && allPitchAssignedNames.has(h.nome.toLowerCase().trim()))
      }))
      .filter(h => {
        // Filtragem rígida para Zaga Canhota: NUNCA zagueiros destros natos
        if (isAssigningZagCanhoto) {
          const isCanhoto = h.pe === 'Canhoto' || h.pe === 'Esquerdo' || h.posicao === 'zag-canhoto' || (h.posSecundaria && h.posSecundaria.toLowerCase().includes('canhoto'))
          const isDestroNato = (h.posicao === 'zagueiro' || h.posicao === 'zag-destro') && (h.pe === 'Destro' || !h.pe)
          if (isDestroNato && !isCanhoto) return false
          if (filterTab === 'SUGERIDOS' && !isCanhoto) return false
        }

        // Filtragem rígida para Zaga Destra/Central: estritamente "zagueiro" / destros
        if (isAssigningZagDestro && filterTab === 'SUGERIDOS') {
          if (assigningPos.id === 'zag-d' && (h.posicao === 'zag-canhoto' || h.pe === 'Canhoto' || h.pe === 'Esquerdo')) return false
        }

        if (filterTab === 'SUGERIDOS') {
          if (!isAssigningZagCanhoto) {
            const matchCategory = slotMatchesCategory(assigningPos.id, h.tacticalCategory) || isCategoryCompatibleWithSlot(assigningPos.id, h.tacticalCategory)
            const matchPrincipal = matchPositions.includes(h.posicao)
            const matchSecundaria = h.posSecundaria && matchPositions.some(mp => h.posSecundaria.toLowerCase().includes(mp.toLowerCase()))
            if (!matchCategory && !matchPrincipal && !matchSecundaria) return false
          }
        }

        if (playerSearch.trim()) {
          const q = playerSearch.toLowerCase()
          const matchNome = (h.nome || '').toLowerCase().includes(q)
          const matchClube = (h.clube || '').toLowerCase().includes(q)
          const matchPos = (h.posicao || '').toLowerCase().includes(q)
          if (!matchNome && !matchClube && !matchPos) return false
        }

        return true
      })
  }, [assigningPos, competitionHighlights, slotsData, filterTab, playerSearch])

  // Candidatos para o modal de escalação manual
  const candidatePlayers = useMemo(() => {
    if (!assigningPos) return []
    const matchPositions = assigningPos.matchPositions || []
    
    // Trava global: reúne IDs e nomes de todos os atletas já alocados em qualquer posição do campo
    const allPitchAssignedIds = new Set(
      Object.values(slotsData)
        .flat()
        .filter(Boolean)
        .map(p => p.id)
    )
    const allPitchAssignedNames = new Set(
      Object.values(slotsData)
        .flat()
        .filter(Boolean)
        .map(p => (p.nome || '').toLowerCase().trim())
    )

    const isAssigningZagCanhoto = assigningPos.id === 'zag-e' || matchPositions.includes('zag-canhoto')
    const isAssigningZagDestro = assigningPos.id === 'zag-d' || assigningPos.id === 'zag-c'

    const pool = (Array.isArray(players) && players.length > 0) ? players : competitionHighlights

    return pool
      .map(p => ({
        ...p,
        isAlreadyAssigned: allPitchAssignedIds.has(p.id) || (p.nome && allPitchAssignedNames.has(p.nome.toLowerCase().trim()))
      }))
      .filter(p => {
        // Filtragem rígida para Zaga Canhota: NUNCA zagueiros destros natos
        if (isAssigningZagCanhoto) {
          const isCanhoto = p.pe === 'Canhoto' || p.pe === 'Esquerdo' || p.posicao === 'zag-canhoto' || (p.posSecundaria && p.posSecundaria.toLowerCase().includes('canhoto'))
          const isDestroNato = (p.posicao === 'zagueiro' || p.posicao === 'zag-destro') && (p.pe === 'Destro' || !p.pe)
          
          if (isDestroNato && !isCanhoto) return false
          if (filterTab === 'SUGERIDOS' && !isCanhoto) return false
        }

        // Filtragem rígida para Zaga Destra/Central: estritamente "zagueiro" (não canhotos no zag-d)
        if (isAssigningZagDestro && filterTab === 'SUGERIDOS') {
          if (assigningPos.id === 'zag-d' && (p.posicao === 'zag-canhoto' || p.pe === 'Canhoto' || p.pe === 'Esquerdo')) return false
        }

        if (filterTab === 'SUGERIDOS') {
          if (!isAssigningZagCanhoto) {
            const matchCategory = slotMatchesCategory(assigningPos.id, p.tacticalCategory) || isCategoryCompatibleWithSlot(assigningPos.id, p.tacticalCategory)
            const matchPrincipal = matchPositions.includes(p.posicao)
            const matchSecundaria = p.posSecundaria && p.posSecundaria !== '—' && matchPositions.some(mp => p.posSecundaria.toLowerCase().includes(mp.toLowerCase()))
            if (!matchCategory && !matchPrincipal && !matchSecundaria) return false
          }
        }

        if (playerSearch.trim()) {
          const q = playerSearch.toLowerCase()
          const matchNome = (p.nome || '').toLowerCase().includes(q)
          const matchClube = (p.ca || '').toLowerCase().includes(q)
          const matchPos = (p.posicao || '').toLowerCase().includes(q)
          if (!matchNome && !matchClube && !matchPos) return false
        }
        return true
      })
  }, [assigningPos, slotsData, players, filterTab, playerSearch])

  const getNivelStyle = (nivel) => {
    switch (nivel) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
      case 'B+':
      case 'B':
        return 'bg-blue-600 text-white font-bold border-blue-500'
      case 'C+':
      case 'C':
        return 'bg-amber-500 text-slate-950 font-bold border-amber-400'
      default:
        return 'bg-slate-700 text-slate-200 font-bold border-slate-600'
    }
  }

  const formatAthleteBirthYear = (atleta) => {
    if (!atleta) return ''
    const rawAn = atleta.anoNascimento || atleta.ano || atleta.nascimento || atleta.an
    if (!rawAn) return ''
    const strAn = String(rawAn).trim()
    const numAn = parseInt(strAn, 10)
    if (!isNaN(numAn) && numAn > 1900) {
      return ` ${String(numAn).slice(-2)}'`
    }
    if (strAn.length === 2 && !isNaN(parseInt(strAn, 10))) {
      return ` ${strAn}'`
    }
    return ''
  }

  const formatAthleteHeight = (atleta) => {
    if (!atleta) return ''
    const rawAlt = atleta.altura || atleta.alt
    if (!rawAlt) return ''
    const numAlt = parseFloat(String(rawAlt).replace(',', '.'))
    if (!isNaN(numAlt) && numAlt > 0) {
      if (numAlt < 3) {
        return `${Math.round(numAlt * 100)} cm`
      }
      return `${Math.round(numAlt)} cm`
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 font-sans flex flex-col pb-12 select-none">
      {/* Toast de Sincronização */}
      {syncToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-emerald-500/80 text-emerald-300 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top duration-200 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* 1. TOPO / HEADER */}
      <header className="bg-[#0b111c] border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40 shadow-xl">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131d2e] hover:bg-[#19273e] text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Voltar</span>
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Seleção do Campeonato</span>
                  {selectedTournament && (
                    <>
                      <span className="text-slate-600">—</span>
                      <span className="text-amber-400 font-extrabold">{selectedTournament}</span>
                    </>
                  )}
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  OFICIAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ranking automático dos relatórios de campo com curadoria manual e campograma tático
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Seletor de Formações Táticas */}
            <div className="flex items-center gap-1.5 bg-[#0a0f1a] p-1 rounded-xl border border-slate-800 text-xs">
              {['4-3-3', '4-2-3-1', '4-4-2', '3-4-3', '3-5-2'].map((fmt) => {
                const isSelected = selectedFormation === fmt
                return (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormation(fmt)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {fmt}
                  </button>
                )
              })}
            </div>

            {/* Botão Resetar Posições Padrão */}
            {currentTournamentCustom.customPositions && Object.keys(currentTournamentCustom.customPositions).length > 0 && (
              <button
                onClick={handleResetPositions}
                title="Restaurar alinhamento tático padrão da formação"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Resetar Posições</span>
              </button>
            )}

            {/* Botão Sincronizar dos Relatórios */}
            <button
              onClick={handleSyncFromReports}
              disabled={isSyncing}
              title="Sincronizar destaques e notas dos relatórios de jogos salvos"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Atualizar dos Relatórios</span>
            </button>

            {/* Botão Exportar PDF da Seleção */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="Exportar Campograma da Seleção em PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152338] hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/60 font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exportar PDF da Seleção</span>
                </>
              )}
            </button>

            {/* Indicador de Preenchimento */}
            <div className="bg-[#121c2d] border border-slate-700/80 rounded-lg px-3.5 py-1.5 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">
                  <strong className="text-emerald-400">{filledCount}</strong> / 11
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Posições Escaladas
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE SELEÇÃO DE TORNEIOS E TEMPORADA */}
        <div className="max-w-[1720px] mx-auto pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500/70" />
              TORNEIOS:
            </span>

            {availableTournaments.length === 0 ? (
              <span className="text-xs text-slate-500 italic py-1 px-2">
                Nenhum campeonato nos relatórios
              </span>
            ) : (
              availableTournaments.map((tour) => {
                const isSelected = tour === selectedTournament
                return (
                  <button
                    key={tour}
                    onClick={() => setSelectedTournament(tour)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                        : 'bg-[#121b2b] text-slate-300 border-slate-700/70 hover:border-slate-500 hover:bg-[#182439]'
                    }`}
                  >
                    {tour}
                  </button>
                )
              })
            )}
          </div>

          {/* Seletor de Temporada / Ano */}
          <div className="flex items-center gap-1.5 shrink-0 bg-[#121b2b] px-2.5 py-1 rounded-lg border border-slate-700/80">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Ano:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-400 font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-[#0b111c] text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* 2. O CAMPO DE FUTEBOL (CAMPOGRAMA VISUAL) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-6 py-6 flex flex-col items-center overflow-x-auto">
        {availableTournaments.length === 0 ? (
          <div className="w-full max-w-[760px] my-16 py-16 px-8 rounded-3xl bg-[#070e1b]/95 border border-emerald-500/30 shadow-2xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Nenhum relatório de jogo cadastrado ainda para gerar Seleções.
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Cadastre e salve relatórios pós-jogo na aba de Relatórios atribuindo notas ou marcando atletas como destaques para gerar automaticamente a Seleção da Competição.
            </p>
          </div>
        ) : (
          <div ref={pitchRef} className="relative w-full max-w-[1400px] min-h-[1250px] h-[1280px] pt-6 rounded-3xl overflow-hidden border-2 border-emerald-800/40 shadow-2xl bg-[#091b12]">
          {/* Textura sutil de faixas de grama */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 80px)'
            }}
          />

          {/* LINHAS DO GRAMADO */}
          <div className="absolute inset-5 border border-emerald-400/25 rounded-xl pointer-events-none" />
          <div className="absolute top-1/2 left-5 right-5 h-[1px] bg-emerald-400/25 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-emerald-400/25 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Áreas do Campo */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[440px] h-36 border-b border-x border-emerald-400/25 pointer-events-none" />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-48 h-16 border-b border-x border-emerald-400/25 pointer-events-none" />
          <div className="absolute top-28 left-1/2 w-2 h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[440px] h-36 border-t border-x border-emerald-400/25 pointer-events-none" />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-48 h-16 border-t border-x border-emerald-400/25 pointer-events-none" />
          <div className="absolute bottom-28 left-1/2 w-2 h-2 bg-emerald-400/30 rounded-full -translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-24 h-2 border-t-2 border-x-2 border-white/40 pointer-events-none" />

          {/* 3. DISPOSIÇÃO DAS POSIÇÕES NA FORMAÇÃO ATIVA */}
          {activeFormation.positions.map((pos) => {
            const currentSlots = slotsData[pos.id] || []
            const titular = currentSlots[0]
            const alternates = currentSlots.slice(1)
            const isFull = currentSlots.length >= 5
            const isManuallyCustomized = manualSlots[pos.id] !== undefined
            const customPositions = currentTournamentCustom.customPositions || {}
            const posCoords = customPositions[pos.id] || { top: `${pos.top}%`, left: `${pos.left}%` }
            const isBeingMoved = draggingPosId === pos.id

            return (
              <div
                key={pos.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 ${
                  isBeingMoved ? 'transition-none select-none z-30' : 'transition-all duration-500 ease-out'
                }`}
                style={{ top: posCoords.top, left: posCoords.left }}
              >
                {/* CARD TÁTICO TRANSLÚCIDO COMPACTO */}
                <div className={`w-[220px] min-w-[220px] max-w-[230px] bg-[#070e1b]/95 backdrop-blur-md border rounded-xl p-2.5 shadow-2xl transition-all hover:scale-105 group ${
                  isBeingMoved
                    ? 'border-2 border-amber-400 shadow-amber-500/30 scale-105 ring-2 ring-amber-500/20'
                    : 'border-slate-700/80 hover:border-amber-400/80'
                }`}>
                  {/* Topo do Card: Alça Exclusiva de Arraste da Posição + Nome + Ações */}
                  <div
                    onMouseDown={(e) => handlePositionMouseDown(e, pos.id)}
                    className="flex items-center justify-between border-b border-slate-800/90 pb-1.5 mb-2 cursor-move select-none active:cursor-grabbing group/header"
                    title="Arraste pelo cabeçalho para reposicionar livremente no gramado"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 truncate group-hover/header:text-amber-300" title={pos.label}>
                        {pos.label}
                      </span>
                      {isManuallyCustomized && (
                        <button
                          data-export-hide="true"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResetPositionToAuto(pos.id)
                          }}
                          title="Restaurar ranking automático desta posição"
                          className="no-export text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {!isFull && (
                      <button
                        data-export-hide="true"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAssigningPos(pos)
                          setPlayerSearch('')
                        }}
                        title="Adicionar Atleta Manualmente"
                        className="no-export w-4 h-4 rounded bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    )}
                  </div>

                  {/* Corpo do Card: Titular + Suplentes */}
                  <div className="space-y-1.5 h-auto">
                    {/* 1º Titular */}
                    {titular ? (
                      (() => {
                        const fullTitular = allPlayersList.find(p => p.id === titular.id || (p.nome && titular.nome && p.nome.toLowerCase().trim() === titular.nome.toLowerCase().trim())) || titular
                        const anoFormatado = formatAthleteBirthYear(fullTitular)
                        const alturaFormatada = formatAthleteHeight(fullTitular)
                        const clubeFormatado = fullTitular.clubeAtual || fullTitular.clube || fullTitular.ca || titular.clube || ''
                        const matchHighlightData = extractedPlayers.find(ep => String(ep.id) === String(titular.id) || (ep.nome && titular.nome && ep.nome.toLowerCase().trim() === titular.nome.toLowerCase().trim()))
                        const mediaVal = matchHighlightData ? matchHighlightData.mediaNota : (titular.mediaNota !== undefined && titular.mediaNota !== null ? titular.mediaNota : (titular.mediaNotas || titular.mediaGeral))
                        const destaquesVal = matchHighlightData ? matchHighlightData.destaquesCount : (titular.destaquesCount ?? 0)

                        return (
                          <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-600/50 rounded-lg px-2 py-1.5 flex flex-col gap-1 group/row">
                            {/* Linha 1: Foco Total no Nome e Ano */}
                            <div className="flex items-center gap-1.5 w-full min-w-0">
                              <span className="text-[10px] text-amber-500 font-bold shrink-0">1º Titular</span>
                              <span className="text-white font-bold text-xs truncate" title={fullTitular.nome}>
                                {fullTitular.nome}
                              </span>
                              {anoFormatado && (
                                <span className="text-slate-400 font-semibold text-[11px] shrink-0">
                                  {anoFormatado}
                                </span>
                              )}
                              <button
                                data-export-hide="true"
                                onClick={() => handleRemovePlayer(pos.id, 0)}
                                title="Remover"
                                className="no-export opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer ml-auto shrink-0"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Linha 2: Clube/Estatura à Esquerda e Badges à Direita */}
                            <div className="flex items-center justify-between gap-1 w-full mt-1">
                              {/* Dados Físicos e Clube */}
                              <div className="text-[11px] text-slate-300 truncate min-w-0 flex-1 pl-3" title={`${clubeFormatado}${alturaFormatada ? ` • ${alturaFormatada}` : ''}`}>
                                {clubeFormatado || '—'}
                                {alturaFormatada && ` • ${alturaFormatada}`}
                              </div>

                              {/* Badges de Desempenho Alinhadas à Direita */}
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {destaquesVal > 0 && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                                    ★ {destaquesVal}x
                                  </span>
                                )}
                                {mediaVal !== null && mediaVal !== undefined && (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                                    Number(mediaVal) >= 7.0 
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                                      : Number(mediaVal) >= 6.0 
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  }`}>
                                    {Number(mediaVal).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      isExportingPdf ? (
                        <div
                          className="py-2 px-2 rounded-lg border border-slate-800/80 bg-slate-900/40 text-center text-[10px] text-slate-500 font-medium italic select-none"
                        >
                          Disponível / Em Aberto
                        </div>
                      ) : (
                        <div
                          data-export-hide="true"
                          onClick={() => {
                            setAssigningPos(pos)
                            setPlayerSearch('')
                          }}
                          className="no-export border border-dashed border-amber-500/30 hover:border-amber-400 rounded-lg p-2 text-center text-[10px] text-amber-400/80 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                        >
                          + Inserir 1º Titular
                        </div>
                      )
                    )}

                    {/* Suplentes (2º ao 5º) */}
                    {alternates.map((player, idx) => {
                      const priorityNum = idx + 2
                      const fullPlayer = allPlayersList.find(p => p.id === player.id || (p.nome && player.nome && p.nome.toLowerCase().trim() === player.nome.toLowerCase().trim())) || player
                      const anoFormatado = formatAthleteBirthYear(fullPlayer)
                      const alturaFormatada = formatAthleteHeight(fullPlayer)
                      const clubeFormatado = fullPlayer.clubeAtual || fullPlayer.clube || fullPlayer.ca || player.clube || ''
                      const matchHighlightData = extractedPlayers.find(ep => String(ep.id) === String(player.id) || (ep.nome && player.nome && ep.nome.toLowerCase().trim() === player.nome.toLowerCase().trim()))
                      const mediaVal = matchHighlightData ? matchHighlightData.mediaNota : (player.mediaNota !== undefined && player.mediaNota !== null ? player.mediaNota : (player.mediaNotas || player.mediaGeral))
                      const destaquesVal = matchHighlightData ? matchHighlightData.destaquesCount : (player.destaquesCount ?? 0)

                      return (
                        <div
                          key={player.id || idx}
                          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-md px-1.5 py-1 flex flex-col gap-0.5 text-[11px] group/row"
                        >
                          {/* Linha 1: Foco Total no Nome e Ano */}
                          <div className="flex items-center gap-1.5 w-full min-w-0">
                            <span className="text-[8.5px] font-semibold text-slate-400 shrink-0">{priorityNum}ª Opção</span>
                            <span className="text-[10.5px] font-bold text-slate-200 truncate" title={fullPlayer.nome}>
                              {fullPlayer.nome}
                            </span>
                            {anoFormatado && (
                              <span className="text-slate-400 font-semibold text-[9.5px] shrink-0">
                                {anoFormatado}
                              </span>
                            )}
                            <button
                              data-export-hide="true"
                              onClick={() => handleRemovePlayer(pos.id, idx + 1)}
                              title="Remover"
                              className="no-export opacity-0 group-hover/row:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer ml-auto shrink-0"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Linha 2: Clube/Estatura à Esquerda e Badges à Direita */}
                          <div className="flex items-center justify-between gap-1 w-full mt-1">
                            {/* Dados Físicos e Clube */}
                            <div className="text-[11px] text-slate-300 truncate min-w-0 flex-1 pl-3" title={`${clubeFormatado}${alturaFormatada ? ` • ${alturaFormatada}` : ''}`}>
                              {clubeFormatado || '—'}
                              {alturaFormatada && ` • ${alturaFormatada}`}
                            </div>

                            {/* Badges de Desempenho Alinhadas à Direita */}
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {destaquesVal > 0 && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                                  ★ {destaquesVal}x
                                </span>
                              )}
                              {mediaVal !== null && mediaVal !== undefined && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border ${
                                  Number(mediaVal) >= 7.0 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                                    : Number(mediaVal) >= 6.0 
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                }`}>
                                  {Number(mediaVal).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Botão para inserir suplente caso haja vagas */}
                    {!isExportingPdf && titular && !isFull && alternates.length < 4 && (
                      <div
                        data-export-hide="true"
                        onClick={() => {
                          setAssigningPos(pos)
                          setPlayerSearch('')
                        }}
                        className="no-export text-[9px] text-slate-500 hover:text-amber-400 flex items-center justify-center gap-0.5 cursor-pointer py-1 transition-colors border border-dashed border-slate-800 hover:border-slate-700 rounded"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>+ {alternates.length + 2}º Opção</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </main>

      {/* 4. MODAL DE SELEÇÃO MANUAL DO BANCO */}
      {assigningPos && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d16]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Escalar para: <span className="text-amber-400">{assigningPos.label}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Selecione um atleta cadastrado no banco de dados para {selectedTournament}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAssigningPos(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campo de Busca e Filtros Rápidos */}
            <div className="p-4 border-b border-slate-800/80 bg-[#0a0f1a] space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar pelo nome, clube, posição..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500/70"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterTab('SUGERIDOS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    filterTab === 'SUGERIDOS'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/10'
                      : 'bg-[#131d2e] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  Sugeridos para a Posição
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('TODOS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    filterTab === 'TODOS'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/10'
                      : 'bg-[#131d2e] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  Todos do Banco ({players.length})
                </button>
              </div>
            </div>

            {/* Corpo do Modal: Seção Prioritária de Destaques + Busca Geral no Banco */}
            <div className="p-4 max-h-[62vh] overflow-y-auto space-y-4 custom-scrollbar">
              
              {/* 1. SEÇÃO PRIORITÁRIA: CANDIDATOS EM DESTAQUE NOS RELATÓRIOS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>⭐ Candidatos dos Relatórios da {selectedTournament}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {positionHighlights.length} {positionHighlights.length === 1 ? 'destaque' : 'destaques'}
                  </span>
                </div>

                {positionHighlights.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-[#0a111e]/90 border border-slate-800/80 text-center text-slate-500 text-xs italic space-y-2">
                    <p>Nenhum atleta marcado como destaque nos relatórios desta competição ainda para esta posição.</p>
                    {competitionHighlights.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningPos(null)
                          setIsHighlightsModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Ver todos os {competitionHighlights.length} destaques da competição</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {positionHighlights.map((highlight) => {
                      const anoFormatado = formatAthleteBirthYear(highlight)
                      const mediaVal = highlight.mediaNota !== null && highlight.mediaNota !== undefined ? highlight.mediaNota : highlight.mediaNotas
                      const starsVal = highlight.destaquesCount || 1

                      return (
                        <div
                          key={`hl-${highlight.id}`}
                          onClick={() => {
                            if (!highlight.isAlreadyAssigned) {
                              handleAssignPlayer(highlight)
                            }
                          }}
                          className={`bg-gradient-to-r from-amber-950/25 via-slate-900/90 to-slate-900 border rounded-xl p-3 flex items-center justify-between transition-all ${
                            highlight.isAlreadyAssigned
                              ? 'opacity-50 border-slate-800 cursor-not-allowed'
                              : 'hover:bg-[#16233b] border-amber-500/30 hover:border-amber-400/80 cursor-pointer shadow-md shadow-amber-950/20 group'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`font-extrabold text-xs ${highlight.isAlreadyAssigned ? 'text-slate-400' : 'text-white group-hover:text-amber-300'} transition-colors truncate`}>
                                {highlight.nome}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getNivelStyle(highlight.nivel)} shrink-0`}>
                                {highlight.nivel || 'B'}
                              </span>
                              
                              {/* Badge de Destaques / Estrelas */}
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>{starsVal}x Destaque</span>
                              </span>

                              {/* Badge de Média da Nota Scout */}
                              {mediaVal !== null && mediaVal !== undefined && (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 font-mono">
                                  <span>Nota Scout:</span>
                                  <strong className="font-extrabold text-emerald-400">{Number(mediaVal).toFixed(1)}</strong>
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-300 font-semibold">{highlight.clube || 'Sem clube'}</span>
                              {anoFormatado && (
                                <>
                                  <span>&bull;</span>
                                  <span className="font-mono text-slate-400">{anoFormatado}</span>
                                </>
                              )}
                              <span>&bull;</span>
                              <span className="text-amber-400/90 font-medium">{formatPositionLabel(highlight.posicaoOriginal || highlight.posicao)}</span>
                              {highlight.totalJogos > 0 && (
                                <span className="text-slate-500 text-[10px]">({highlight.totalJogos} {highlight.totalJogos === 1 ? 'partida avaliada' : 'partidas avaliadas'})</span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {highlight.isAlreadyAssigned ? (
                              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold text-[10px] border border-slate-700">
                                Já escalado
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAssignPlayer(highlight)
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Escalar nesta Posição</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 2. SEÇÃO GERAL: BUSCA NA BASE COMPLETA DE ATLETAS */}
              <div className="space-y-2 pt-2 border-t border-slate-800/90">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Base Geral de Atletas Cadastrados</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {candidatePlayers.length} atletas disponíveis
                  </span>
                </div>

                {candidatePlayers.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    Nenhum outro atleta encontrado para os critérios de busca.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {candidatePlayers.map((player) => (
                      <div
                        key={player.id}
                        onClick={() => {
                          if (!player.isAlreadyAssigned) {
                            handleAssignPlayer(player)
                          }
                        }}
                        className={`bg-[#0f172a] border rounded-xl p-2.5 flex items-center justify-between transition-all ${
                          player.isAlreadyAssigned
                            ? 'opacity-50 border-slate-800 cursor-not-allowed'
                            : 'hover:bg-[#152238] border-slate-800 hover:border-slate-700 cursor-pointer group'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`font-bold text-xs ${player.isAlreadyAssigned ? 'text-slate-400' : 'text-white group-hover:text-amber-300'} transition-colors`}>
                              {player.nome}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getNivelStyle(player.nivel)}`}>
                              {player.nivel}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {player.ca || 'Sem clube'} &bull; <span className="font-mono">{player.an}</span> &bull;{' '}
                            <span className="text-slate-300 font-semibold">{formatPositionLabel(player.posicao)}</span>
                            {player.posSecundaria && player.posSecundaria !== '—' && (
                              <span className="text-slate-500"> ({player.posSecundaria === 'Zagueiro' ? 'Zag. Destro' : player.posSecundaria})</span>
                            )}
                          </div>
                        </div>

                        {player.isAlreadyAssigned ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold text-[10px] border border-slate-700">
                            Já escalado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssignPlayer(player)
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-300 font-bold text-xs border border-slate-700 group-hover:border-amber-500/40 transition-colors cursor-pointer"
                          >
                            + Escalar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL RÁPIDO: ATLETAS EM DESTAQUE NA COMPETIÇÃO */}
      {isHighlightsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b111c] border border-emerald-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl shadow-emerald-950/40 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#080d16] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Atletas em Destaque nos Relatórios</span>
                    <span className="text-slate-600">—</span>
                    <span className="text-amber-400 font-extrabold">{selectedTournament}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Selecione a posição desejada e escale o atleta diretamente no campinho oficial
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHighlightsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Busca rápida */}
            <div className="p-4 border-b border-slate-800/80 bg-[#0a0f1a] flex items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar destaques por nome, clube ou posição..."
                  value={highlightsSearch}
                  onChange={(e) => setHighlightsSearch(e.target.value)}
                  className="w-full bg-[#131d2e] border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/70"
                />
              </div>

              <div className="text-xs text-slate-400 font-medium shrink-0">
                <strong className="text-emerald-400 font-bold">{competitionHighlights.length}</strong> {competitionHighlights.length === 1 ? 'destaque' : 'destaques'}
              </div>
            </div>

            {/* Lista de Atletas em Destaque */}
            <div className="p-4 overflow-y-auto space-y-2.5 custom-scrollbar flex-1">
              {competitionHighlights.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950/60 rounded-xl border border-slate-800">
                  Nenhum atleta marcado como destaque nos relatórios desta competição ainda.
                  <br />
                  <span className="text-slate-600 text-[11px]">Salve relatórios de jogos com notas ou estrelas de destaque para alimentá-los aqui.</span>
                </div>
              ) : (
                competitionHighlights
                  .filter(h => {
                    if (!highlightsSearch.trim()) return true
                    const q = highlightsSearch.toLowerCase().trim()
                    return (
                      (h.nome || '').toLowerCase().includes(q) ||
                      (h.clube || '').toLowerCase().includes(q) ||
                      (h.posicao || '').toLowerCase().includes(q) ||
                      (h.posicaoOriginal || '').toLowerCase().includes(q)
                    )
                  })
                  .map((hl) => {
                    // Encontra posição padrão da formação que casa com o atleta
                    const defaultPos = activeFormation.positions.find(p => p.matchPositions.includes(hl.posicao))?.id || activeFormation.positions[0]?.id
                    const currentSelectedPosId = highlightPosSelection[hl.id] || defaultPos

                    // Verifica se já está escalado no campinho
                    let assignedPosLabel = null
                    Object.entries(slotsData).forEach(([posId, list]) => {
                      if (Array.isArray(list) && list.some(p => p && (p.id === hl.id || (p.nome && hl.nome && p.nome.toLowerCase() === hl.nome.toLowerCase())))) {
                        const posObj = activeFormation.positions.find(p => p.id === posId)
                        assignedPosLabel = posObj?.label || posId
                      }
                    })

                    const mediaVal = hl.mediaNota !== null && hl.mediaNota !== undefined ? hl.mediaNota : hl.mediaNotas
                    const starsVal = hl.destaquesCount || 1

                    return (
                      <div
                        key={`modal-hl-${hl.id}`}
                        className="bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900 border border-amber-500/30 hover:border-amber-400/70 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md transition-all"
                      >
                        {/* Info do Atleta */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-extrabold text-sm text-white">
                              {hl.nome}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getNivelStyle(hl.nivel)} shrink-0`}>
                              {hl.nivel || 'B'}
                            </span>
                            
                            {/* Badge Estrelas / Destaques */}
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{starsVal}x Destaque</span>
                            </span>

                            {/* Badge Nota Scout */}
                            {mediaVal !== null && mediaVal !== undefined && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                                <span>Nota Scout:</span>
                                <strong className="text-emerald-400">{Number(mediaVal).toFixed(1)}</strong>
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                            <span className="text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              {hl.clube || 'Sem clube'}
                            </span>
                            <span>&bull;</span>
                            <span className="text-amber-400 font-semibold">{formatPositionLabel(hl.posicaoOriginal || hl.posicao)}</span>
                            {hl.totalJogos > 0 && (
                              <span className="text-slate-500 text-[10px]">({hl.totalJogos} {hl.totalJogos === 1 ? 'partida' : 'partidas'})</span>
                            )}
                            {assignedPosLabel && (
                              <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-2 py-0.2 rounded-full">
                                ✓ Escalado em: {assignedPosLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Seletor de Posição e Botão Escalar */}
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={currentSelectedPosId}
                            onChange={(e) => setHighlightPosSelection(prev => ({ ...prev, [hl.id]: e.target.value }))}
                            className="bg-[#121d30] border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            {activeFormation.positions.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleAssignPlayerToPos(hl, currentSelectedPosId)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                            <span>Escalar na Posição</span>
                          </button>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-3 border-t border-slate-800 bg-[#080d16] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Os atletas escalados serão atualizados imediatamente no campinho tático e salvos no seu navegador.
              </span>
              <button
                type="button"
                onClick={() => setIsHighlightsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
