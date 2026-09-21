import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import PlayerList from './components/PlayerList'
import GlobalSearch from './components/GlobalSearch'
import RecentAdditionsModal from './components/RecentAdditionsModal'
import ShadowTeam from './components/ShadowTeam'
import CoachesList from './components/CoachesList'
import MatchReportsList from './components/MatchReportsList'
import TournamentBestXI from './components/TournamentBestXI'
import CopaSPList from './components/CopaSPList'
import MatchCalendarV2 from './components/MatchCalendarV2'
import ErrorBoundary from './components/ErrorBoundary'
import { MOCK_PLAYERS } from './data/mockPlayers'
import { MOCK_COACHES } from './data/mockCoaches'
import { MOCK_MATCH_REPORTS } from './data/mockMatchReports'
import {
  fetchPlayersFromSupabase,
  upsertPlayerToSupabase,
  deletePlayerFromSupabase,
  fetchMatchReportsFromSupabase,
  upsertMatchReportToSupabase,
  deleteMatchReportFromSupabase
} from './services/supabaseService'

const INITIAL_RECENT_ADDITIONS = [
  {
    id: 901,
    nome: 'Mikael',
    posicao: 'lat-direito',
    posicaoLabel: 'Lateral Direito',
    nivel: 'C',
    monitoramento: true,
    ca: 'Operario',
    autor: 'dudu@admin.com',
    dataHora: 'hoje às 12:52'
  },
  {
    id: 902,
    nome: 'Danielzinho',
    posicao: 'extremo',
    posicaoLabel: 'Extremo',
    nivel: 'C',
    monitoramento: false,
    ca: 'Nautico',
    autor: 'dudu@admin.com',
    dataHora: 'hoje às 12:51'
  },
  {
    id: 903,
    nome: 'Gabriel Delfim',
    posicao: 'goleiro',
    posicaoLabel: 'Goleiro',
    nivel: 'B',
    monitoramento: false,
    ca: 'America-MG',
    autor: 'dudu@admin.com',
    dataHora: 'ontem às 11:22'
  },
  {
    id: 904,
    nome: 'Adrianinho',
    posicao: 'medio',
    posicaoLabel: 'Médio',
    nivel: 'B',
    monitoramento: false,
    ca: 'Ponte Preta',
    autor: 'dudu@admin.com',
    dataHora: '09/09 às 16:15'
  },
  {
    id: 905,
    nome: 'Biel Fonseca',
    posicao: 'meia-ofensivo',
    posicaoLabel: 'Meia Ofensivo',
    nivel: 'A',
    monitoramento: false,
    ca: 'Juventude',
    autor: 'dudu@admin.com',
    dataHora: '09/09 às 10:04'
  },
  {
    id: 906,
    nome: 'Fellipe Resende',
    posicao: 'extremo',
    posicaoLabel: 'Extremo',
    nivel: 'B',
    monitoramento: false,
    ca: 'Brusque (Sport)',
    autor: 'dudu@admin.com',
    dataHora: '08/09 às 08:42'
  }
]

function App() {
  const [currentTab, setCurrentTab] = useState('visao-geral')
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('scout_players') || localStorage.getItem('radar_players')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(p => p.id))
          const missingMocks = MOCK_PLAYERS.filter(mp => !existingIds.has(mp.id))
          return [...parsed, ...missingMocks]
        }
      }
      return MOCK_PLAYERS
    } catch (e) {
      return MOCK_PLAYERS
    }
  })
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false)
  const [isRecentAdditionsOpen, setIsRecentAdditionsOpen] = useState(false)
  const [coaches, setCoaches] = useState(() => {
    try {
      const saved = localStorage.getItem('scout_coaches')
      return saved ? JSON.parse(saved) : MOCK_COACHES
    } catch (e) {
      return MOCK_COACHES
    }
  })
  const [matchReports, setMatchReports] = useState(() => {
    try {
      const saved = localStorage.getItem('scout_match_reports')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  const [recentAdditions, setRecentAdditions] = useState(() => {
    try {
      const saved = localStorage.getItem('scout_recent_additions')
      return saved ? JSON.parse(saved) : INITIAL_RECENT_ADDITIONS
    } catch (e) {
      return INITIAL_RECENT_ADDITIONS
    }
  })
  const [agendaPrefillMatch, setAgendaPrefillMatch] = useState(null)
  const [copaSPPrefillMatch, setCopaSPPrefillMatch] = useState(null)

  // Sincronização inicial com o Supabase para Jogadores e Relatórios (com fallback no localStorage)
  useEffect(() => {
    let isMounted = true

    async function loadCloudData() {
      // 1. Leitura inicial da tabela 'players' do Supabase
      try {
        const remotePlayers = await fetchPlayersFromSupabase()
        if (isMounted && Array.isArray(remotePlayers)) {
          if (remotePlayers.length > 0) {
            let cached = []
            try {
              const saved = localStorage.getItem('scout_players') || localStorage.getItem('radar_players')
              if (saved) cached = JSON.parse(saved)
            } catch (_) {}

            const mergedPlayers = remotePlayers.map(rp => {
              const local = Array.isArray(cached) ? cached.find(lp => String(lp.id) === String(rp.id)) : null
              if (local) {
                return {
                  ...local,
                  ...rp,
                  alt: local.alt || rp.alt || null,
                  an: local.an || rp.an || null,
                  contrato: local.contrato || rp.contrato || '',
                  agente: local.agente || rp.agente || '',
                  caracteristicas: (local.caracteristicas && local.caracteristicas.length > 0) ? local.caracteristicas : rp.caracteristicas,
                  projecao: (local.projecao && local.projecao.length > 0) ? local.projecao : rp.projecao,
                  nivelFisico: local.nivelFisico || rp.nivelFisico || '',
                  isProvisorio: Boolean(rp.isProvisorio),
                  is_provisorio: Boolean(rp.isProvisorio)
                }
              }
              return rp
            })

            const remoteIds = new Set(remotePlayers.map(rp => String(rp.id)))
            const localOnly = Array.isArray(cached) ? cached.filter(lp => lp && lp.id && !remoteIds.has(String(lp.id))) : []
            const combined = [...mergedPlayers, ...localOnly]

            setPlayers(combined)
            try {
              localStorage.setItem('scout_players', JSON.stringify(combined))
              localStorage.setItem('radar_players', JSON.stringify(combined))
            } catch (_) {}
          } else {
            // Se a tabela no Supabase estiver vazia pela primeira vez, faz backup dos jogadores locais para a nuvem
            try {
              const saved = localStorage.getItem('scout_players') || localStorage.getItem('radar_players')
              const initialToUpload = saved ? JSON.parse(saved) : MOCK_PLAYERS
              if (Array.isArray(initialToUpload)) {
                initialToUpload.slice(0, 30).forEach(p => upsertPlayerToSupabase(p))
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn('[App] Erro ao carregar players do Supabase (mantendo cache local):', err)
      }

      // 2. Leitura inicial da tabela 'scout_match_reports' do Supabase
      try {
        const remoteReports = await fetchMatchReportsFromSupabase()
        if (isMounted && Array.isArray(remoteReports)) {
          if (remoteReports.length > 0) {
            setMatchReports(remoteReports)
            try {
              localStorage.setItem('scout_match_reports', JSON.stringify(remoteReports))
              localStorage.setItem('radar_match_reports', JSON.stringify(remoteReports))
            } catch (_) {}
          } else {
            // Se a tabela de relatórios no Supabase estiver vazia, sincroniza relatórios locais
            try {
              const savedRep = localStorage.getItem('scout_match_reports') || localStorage.getItem('radar_match_reports')
              const localReports = savedRep ? JSON.parse(savedRep) : []
              if (Array.isArray(localReports) && localReports.length > 0) {
                localReports.forEach(r => upsertMatchReportToSupabase(r))
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn('[App] Erro ao carregar scout_match_reports do Supabase (mantendo cache local):', err)
      }
    }

    loadCloudData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveCoach = (coachData) => {
    console.log("App recebeu novo treinador:", coachData)

    setCoaches(prev => {
      const existsIndex = prev.findIndex(c => c.id === coachData.id)
      let nextCoaches
      if (existsIndex >= 0) {
        nextCoaches = [...prev]
        nextCoaches[existsIndex] = coachData
      } else {
        nextCoaches = [coachData, ...prev]
      }

      try {
        localStorage.setItem('scout_coaches', JSON.stringify(nextCoaches))
      } catch (e) {
        console.warn('Erro ao salvar coaches no localStorage:', e)
      }

      return nextCoaches
    })

    // Adicionar novo treinador no topo de recentAdditions
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const newRecentItem = {
      id: coachData.id || Date.now().toString(),
      tipo: 'treinador',
      nome: coachData.nome,
      detalhe: coachData.clubeAtual || 'Sem clube',
      nivel: coachData.nivelAtual || 'B',
      autor: 'dudu@admin.com',
      dataHora: `hoje às ${hours}:${minutes}`
    }
    setRecentAdditions(prevRecent => {
      const nextRecent = [newRecentItem, ...prevRecent].slice(0, 30)
      try {
        localStorage.setItem('scout_recent_additions', JSON.stringify(nextRecent))
      } catch (e) {
        console.warn('Erro ao salvar recentAdditions no localStorage:', e)
      }
      return nextRecent
    })
  }

  const handleDeleteCoach = (id) => {
    setCoaches(prev => {
      const next = prev.filter(c => c.id !== id)
      try {
        localStorage.setItem('scout_coaches', JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  const handleSaveMatchReport = (reportData, provisorioPlayers = [], provisorioCoaches = []) => {
    console.log("App recebeu novo relatório:", reportData)
    if (!reportData) return

    // Clone defensivo do relatório para vincular IDs dos atletas
    const updatedReport = { ...reportData }

    // Helper de normalizacao de texto/nome
    const normName = (str) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

    // 3. AUTO-CADASTRO INTELIGENTE DE DESTAQUES (★) COM TRAVA ANTI-DUPLICIDADE
    setPlayers(prevPlayers => {
      let currentList = Array.isArray(prevPlayers) && prevPlayers.length > 0 ? [...prevPlayers] : []
      if (currentList.length === 0) {
        try {
          const saved = localStorage.getItem('scout_players') || localStorage.getItem('radar_players')
          if (saved) currentList = JSON.parse(saved)
        } catch (e) {}
      }
      if (currentList.length === 0) currentList = [...MOCK_PLAYERS]

      const updatedPlayers = [...currentList]
      const addedIds = new Set(updatedPlayers.map(p => String(p.id)))

      // 1. Processar provisorioPlayers explicitos
      if (provisorioPlayers && provisorioPlayers.length > 0) {
        provisorioPlayers.forEach(np => {
          if (np && np.id && !addedIds.has(String(np.id)) && !updatedPlayers.some(ep => normName(ep.nome) === normName(np.nome))) {
            updatedPlayers.unshift(np)
            addedIds.add(String(np.id))
          }
        })
      }

      // 2. Extrair e vincular todos os atletas avaliados no relatorio
      const athleteArrays = [
        updatedReport.atletasAvaliados,
        updatedReport.atletasMandante,
        updatedReport.atletasVisitante,
        updatedReport.atletas,
        updatedReport.destaques,
        updatedReport.destaquesGerais,
        updatedReport.matchHighlights
      ]

      // Conjunto para evitar múltiplos incrementos do mesmo atleta dentro do mesmo relatório
      const processedPlayerIdsInThisReport = new Set()

      athleteArrays.forEach(arr => {
        if (!Array.isArray(arr)) return
        arr.forEach(atleta => {
          if (!atleta) return
          const isDestaque = Boolean(
            atleta.destaque === true || 
            atleta.destaquePositivo === true || 
            atleta.tipoDestaque === 'positivo' || 
            atleta.isHighlight === true ||
            atleta.highlight === true ||
            atleta.estrela === true
          )

          if (!isDestaque) return

          const aNome = atleta.nome || atleta.name
          if (!aNome) return

          const aNorm = normName(aNome)
          const aClube = atleta.clube || atleta.ca || atleta.time || ''
          const aClubeNorm = normName(aClube)

          // Trava anti-duplicidade: verificar por id, apiId ou nome normalizado (+ clube se disponivel)
          const existingPlayer = updatedPlayers.find(p => {
            if (atleta.id && String(p.id) === String(atleta.id)) return true
            if (atleta.idAtleta && String(p.id) === String(atleta.idAtleta)) return true
            if (atleta.savedPlayerId && String(p.id) === String(atleta.savedPlayerId)) return true
            if (p.apiId && atleta.apiId && String(p.apiId) === String(atleta.apiId)) return true
            
            const pNorm = normName(p.nome)
            if (pNorm === aNorm) {
              if (!aClubeNorm) return true
              const pClubNorm = normName(p.clubeAtual || p.ca || p.clube)
              if (!pClubNorm || pClubNorm === aClubeNorm || pClubNorm.includes(aClubeNorm) || aClubeNorm.includes(pClubNorm)) {
                return true
              }
            }
            return false
          })

          if (!existingPlayer) {
            const apiId = atleta.apiId || null
            const newPlayerId = apiId 
              ? `player_api_${apiId}` 
              : `player_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`

            const posRaw = atleta.posicao || "A Definir"
            const isCanhoto = posRaw.toLowerCase().includes("canhoto") || posRaw.toLowerCase() === "le" || atleta.pe === "Canhoto" || atleta.pePreferencial === "Canhoto"
            const pePref = isCanhoto ? "Canhoto" : "Destro"
            const clubeVal = aClube || (atleta.lado === 'visitante' ? (updatedReport.visitante?.nome || updatedReport.timeVisitante || updatedReport.visitante) : (updatedReport.mandante?.nome || updatedReport.timeMandante || updatedReport.mandante)) || '—'

            const newPlayerEntry = {
              id: newPlayerId,
              apiId: apiId,
              nome: aNome,
              clubeAtual: clubeVal,
              ca: clubeVal,
              posicao: posRaw,
              posSecundaria: 'Nenhuma',
              pePreferencial: pePref,
              pe: pePref,
              origem: "Destaque de Relatório",
              isProvisorio: true,
              nivel: atleta.nivel || "B",
              relatoriosCount: 1,
              mediaNotas: atleta.nota || atleta.notaScout || null,
              an: atleta.an || atleta.anoNascimento || null,
              alt: atleta.alt || atleta.altura || null,
              caracteristicas: Array.isArray(atleta.caracteristicas) ? atleta.caracteristicas : ['Destaque de Campo'],
              observacao: `Auto-cadastrado como Destaque (★) no confronto: ${updatedReport.partida || ''} (${updatedReport.data || ''}). ${atleta.comentario || atleta.parecerDestaque || ''}`
            }

            updatedPlayers.unshift(newPlayerEntry)
            addedIds.add(String(newPlayerId))
            processedPlayerIdsInThisReport.add(String(newPlayerId))

            atleta.id = newPlayerId
            atleta.idAtleta = newPlayerId
            atleta.savedPlayerId = newPlayerId
          } else {
            if (!processedPlayerIdsInThisReport.has(String(existingPlayer.id))) {
              processedPlayerIdsInThisReport.add(String(existingPlayer.id))
              existingPlayer.relatoriosCount = (existingPlayer.relatoriosCount || 1) + 1
            }
            atleta.id = existingPlayer.id
            atleta.idAtleta = existingPlayer.id
            atleta.savedPlayerId = existingPlayer.id
          }
        })
      })

      try {
        localStorage.setItem('scout_players', JSON.stringify(updatedPlayers))
        localStorage.setItem('radar_players', JSON.stringify(updatedPlayers))
      } catch (e) {
        console.warn('Erro ao salvar players no localStorage:', e)
      }

      return updatedPlayers
    })

    if (provisorioCoaches && provisorioCoaches.length > 0) {
      setCoaches(prev => {
        const toAdd = provisorioCoaches.filter(nc => !prev.some(ec => ec.id === nc.id))
        const nextCoaches = [...toAdd, ...prev]
        try {
          localStorage.setItem('scout_coaches', JSON.stringify(nextCoaches))
        } catch (e) {
          console.warn('Erro ao salvar coaches provisórios no localStorage:', e)
        }
        return nextCoaches
      })
    }

    setMatchReports(prev => {
      const existsIndex = prev.findIndex(r => r.id === updatedReport.id)
      let nextReports
      if (existsIndex >= 0) {
        nextReports = [...prev]
        nextReports[existsIndex] = updatedReport
      } else {
        nextReports = [updatedReport, ...prev]
      }

      try {
        localStorage.setItem('scout_match_reports', JSON.stringify(nextReports))
        localStorage.setItem('radar_match_reports', JSON.stringify(nextReports))
      } catch (e) {
        console.warn('Erro ao salvar matchReports no localStorage:', e)
      }

      return nextReports
    })

    // Sincroniza o relatório com a tabela 'scout_match_reports' do Supabase
    upsertMatchReportToSupabase(updatedReport)

    // Adicionar novo relatório no topo de recentAdditions
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const newRecentItem = {
      id: updatedReport.id || Date.now().toString(),
      tipo: 'relatorio',
      nome: updatedReport.partida,
      detalhe: updatedReport.competicao || 'Partida',
      autor: 'dudu@admin.com',
      dataHora: `hoje às ${hours}:${minutes}`
    }
    setRecentAdditions(prevRecent => {
      const nextRecent = [newRecentItem, ...prevRecent].slice(0, 30)
      try {
        localStorage.setItem('scout_recent_additions', JSON.stringify(nextRecent))
      } catch (e) {
        console.warn('Erro ao salvar recentAdditions no localStorage:', e)
      }
      return nextRecent
    })
  }

  const handleDeleteMatchReport = (id) => {
    setMatchReports(prev => {
      const next = prev.filter(r => r.id !== id)
      try {
        localStorage.setItem('scout_match_reports', JSON.stringify(next))
        localStorage.setItem('radar_match_reports', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    // Sincroniza exclusão no Supabase
    deleteMatchReportFromSupabase(id)
  }

  // Keyboard shortcut: Press 'K' or 'k' to open GlobalSearch
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input, textarea or select
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : ''
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return
      }

      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        setIsGlobalSearchOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelectTab = (tabId) => {
    setAgendaPrefillMatch(null)
    setCopaSPPrefillMatch(null)
    setCurrentTab(tabId)

    if (tabId === 'relatorios-jogo') {
      fetchMatchReportsFromSupabase().then(reports => {
        if (Array.isArray(reports) && reports.length > 0) {
          setMatchReports(reports)
        }
      }).catch(() => {})
    } else if (tabId === 'jogadores') {
      fetchPlayersFromSupabase().then(cloudPlayers => {
        if (Array.isArray(cloudPlayers) && cloudPlayers.length > 0) {
          setPlayers(prev => {
            const merged = cloudPlayers.map(cp => {
              const existing = prev.find(p => String(p.id) === String(cp.id))
              if (existing) {
                return {
                  ...existing,
                  ...cp,
                  alt: existing.alt || cp.alt || null,
                  an: existing.an || cp.an || null,
                  contrato: existing.contrato || cp.contrato || '',
                  agente: existing.agente || cp.agente || '',
                  caracteristicas: (existing.caracteristicas && existing.caracteristicas.length > 0) ? existing.caracteristicas : cp.caracteristicas,
                  projecao: (existing.projecao && existing.projecao.length > 0) ? existing.projecao : cp.projecao,
                  isProvisorio: Boolean(cp.isProvisorio),
                  is_provisorio: Boolean(cp.isProvisorio)
                }
              }
              return cp
            })
            const cloudIds = new Set(cloudPlayers.map(cp => String(cp.id)))
            const prevOnly = prev.filter(p => !cloudIds.has(String(p.id)))
            const result = [...merged, ...prevOnly]
            try {
              localStorage.setItem('scout_players', JSON.stringify(result))
              localStorage.setItem('radar_players', JSON.stringify(result))
            } catch (_) {}
            return result
          })
        }
      }).catch(() => {})
    }
  }

  const handleCreateScoutReportFromMatch = (match) => {
    if (!match) return

    // Se for partida da Copa SP de Futebol Jr., redirecionar para a aba isolada da Copa SP
    if (match.categoriaCampeonato === 'copa-sp' || (match.campeonato && match.campeonato.toLowerCase().includes('copa sp'))) {
      setCopaSPPrefillMatch(match)
      setAgendaPrefillMatch(null)
      setCurrentTab('copa-sp')
      return
    }

    // Para as demais competições (Série A, B, C, D, Copa do Brasil, Estaduais), preencher relatório padrão
    const prefilledReport = {
      id: `match-report-from-agenda-${Date.now()}`,
      partida: `${match.mandante?.nome || ''} x ${match.visitante?.nome || ''}`,
      competicao: match.campeonato || 'Brasileirão',
      rodada: match.rodada || '',
      data: match.data || new Date().toISOString().split('T')[0],
      local: match.estadio || '',
      atletasAvaliados: [],
      treinadoresAvaliados: [],
      observacoes: match.transmissao ? `Transmissão: ${match.transmissao}` : ''
    }

    setAgendaPrefillMatch(prefilledReport)
    setCopaSPPrefillMatch(null)
    setCurrentTab('relatorios-jogo')
  }

  const handleSavePlayer = (playerData) => {
    setPlayers(prev => {
      const existsIndex = prev.findIndex(p => p.id === playerData.id)
      let updated
      if (existsIndex >= 0) {
        updated = [...prev]
        // Se o scout salvou a ficha completa pelo PlayerModal, removemos isProvisorio
        const isStillProvisorio = playerData.isProvisorio === true || playerData.is_provisorio === true ? true : false
        updated[existsIndex] = {
          ...playerData,
          isProvisorio: isStillProvisorio,
          is_provisorio: isStillProvisorio
        }
      } else {
        // Adicionar novo jogador no topo de recentAdditions
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const newRecentItem = {
          id: playerData.id || Date.now(),
          nome: playerData.nome,
          posicao: playerData.posicao,
          nivel: playerData.nivel,
          monitoramento: !!playerData.monitoramento,
          ca: playerData.ca,
          autor: 'dudu@admin.com',
          dataHora: `hoje às ${hours}:${minutes}`
        }
        setRecentAdditions(prevRecent => {
          const nextRecent = [newRecentItem, ...prevRecent].slice(0, 30)
          try {
            localStorage.setItem('scout_recent_additions', JSON.stringify(nextRecent))
          } catch (e) {}
          return nextRecent
        })

        updated = [playerData, ...prev]
      }

      try {
        localStorage.setItem('scout_players', JSON.stringify(updated))
        localStorage.setItem('radar_players', JSON.stringify(updated))
      } catch (e) {
        console.warn('Erro ao salvar players no localStorage:', e)
      }

      return updated
    })

    // Sincronização em nuvem com a tabela 'players' do Supabase
    upsertPlayerToSupabase(playerData)
  }

  const handleDeletePlayer = (id) => {
    setPlayers(prev => {
      const next = prev.filter(p => p.id !== id)
      try {
        localStorage.setItem('scout_players', JSON.stringify(next))
        localStorage.setItem('radar_players', JSON.stringify(next))
      } catch (e) {}
      return next
    })

    // Sincroniza exclusão no Supabase
    deletePlayerFromSupabase(id)
  }

  return (
    <>
      {currentTab === 'visao-geral' ? (
        <Dashboard
          activeTab={currentTab}
          onSelectTab={handleSelectTab}
          players={players}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onOpenRecentAdditions={() => setIsRecentAdditionsOpen(true)}
        />
      ) : currentTab === 'time-sombra' ? (
        <ShadowTeam
          onBack={() => setCurrentTab('visao-geral')}
          players={players}
        />
      ) : currentTab === 'selecao-campeonato' ? (
        <TournamentBestXI
          onBack={() => setCurrentTab('visao-geral')}
          matchReports={matchReports}
          players={players}
        />
      ) : currentTab === 'treinadores' ? (
        <CoachesList
          onBack={() => setCurrentTab('visao-geral')}
          coaches={coaches}
          onSaveCoach={handleSaveCoach}
          onDeleteCoach={handleDeleteCoach}
          matchReports={matchReports}
        />
      ) : currentTab === 'relatorios-jogo' || currentTab === 'relatorios-individuais' ? (
        <MatchReportsList
          onBack={() => setCurrentTab('visao-geral')}
          matchReports={matchReports}
          onSaveReport={handleSaveMatchReport}
          onDeleteReport={handleDeleteMatchReport}
          onSavePlayerToRadar={handleSavePlayer}
          onDeletePlayer={handleDeletePlayer}
          onSaveCoach={handleSaveCoach}
          onDeleteCoach={handleDeleteCoach}
          coaches={coaches}
          players={players}
          initialReportToEdit={agendaPrefillMatch}
          initialAddModalOpen={!!agendaPrefillMatch}
        />
      ) : currentTab === 'copa-sp' ? (
        <CopaSPList
          onBack={() => setCurrentTab('visao-geral')}
          onPromotePlayer={handleSavePlayer}
          mainPlayers={players}
          initialMatchToCreate={copaSPPrefillMatch}
        />
      ) : (currentTab === 'agenda-jogos' || currentTab === 'agenda-jogos-v2') ? (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <button
              onClick={() => setCurrentTab('visao-geral')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer mb-2"
            >
              ← Voltar ao Início
            </button>
            <ErrorBoundary
              fallbackTitle="Agenda Oficial de Jogos Temporariamente Indisponível"
              fallbackMessage="Ocorreu uma inconsistência no módulo da Agenda Oficial. Seus atletas cadastrados e relatórios continuam 100% seguros e intactos."
            >
              <MatchCalendarV2
                players={players}
                coaches={coaches}
                onSavePlayerToRadar={handleSavePlayer}
                onSaveCoach={handleSaveCoach}
                onSaveMatchReport={handleSaveMatchReport}
              />
            </ErrorBoundary>
          </div>
        </div>
      ) : (
        <PlayerList
          activePosition={currentTab}
          onSelectTab={handleSelectTab}
          players={players}
          onSavePlayer={handleSavePlayer}
          onDeletePlayer={handleDeletePlayer}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onOpenRecentAdditions={() => setIsRecentAdditionsOpen(true)}
          matchReports={matchReports}
        />
      )}

      {/* MODAL / TELA DE BUSCA GLOBAL */}
      <GlobalSearch
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        players={players}
        coaches={coaches}
        onSelectPlayerPosition={(pos) => {
          setCurrentTab(pos)
          setIsGlobalSearchOpen(false)
        }}
        onSelectCoach={() => {
          setCurrentTab('treinadores')
          setIsGlobalSearchOpen(false)
        }}
      />

      {/* DRAWER LATERAL DE ÚLTIMAS ADIÇÕES */}
      {isRecentAdditionsOpen && (
        <RecentAdditionsModal
          isOpen={isRecentAdditionsOpen}
          onClose={() => setIsRecentAdditionsOpen(false)}
          recentAdditions={recentAdditions}
          onSelectPlayer={(pos) => {
            setCurrentTab(pos)
            setIsRecentAdditionsOpen(false)
          }}
          onSelectCoach={() => {
            setCurrentTab('treinadores')
            setIsRecentAdditionsOpen(false)
          }}
          onSelectReport={() => {
            setCurrentTab('relatorios-jogo')
            setIsRecentAdditionsOpen(false)
          }}
        />
      )}
    </>
  )
}

export default App


