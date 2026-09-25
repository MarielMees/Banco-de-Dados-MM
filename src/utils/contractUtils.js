/**
 * Utilitários para o Radar de Fim de Contrato (Janela de 180 Dias / Pré-Contrato)
 */

export const parseContractDate = (contratoRaw) => {
  if (!contratoRaw || typeof contratoRaw !== 'string') return null
  const str = contratoRaw.trim()
  if (!str || str === '—' || str === '-' || str.toLowerCase() === 'indefinido') return null

  let day, month, year

  if (str.includes('/')) {
    const parts = str.split('/')
    if (parts.length === 3) {
      day = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10) - 1
      year = parseInt(parts[2], 10)
    }
  } else if (str.includes('-')) {
    const parts = str.split('-')
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0], 10)
        month = parseInt(parts[1], 10) - 1
        day = parseInt(parts[2], 10)
      } else {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10)
        month = parseInt(parts[1], 10) - 1
        year = parseInt(parts[2], 10)
      }
    }
  }

  if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1900 || year > 2100) {
    return null
  }

  const d = new Date(year, month, day)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Calcula a diferença em dias corridos até o término do contrato em relação à data atual.
 * Retorna número negativo se já expirou, 0 se expira hoje, positivo se no futuro, ou null se indefinido.
 */
export const getDaysToContractExpiry = (playerOrContrato) => {
  if (!playerOrContrato) return null

  let dateStr = ''
  if (typeof playerOrContrato === 'object') {
    dateStr = playerOrContrato.contrato || playerOrContrato.contract_end || playerOrContrato.contract_until || ''
  } else {
    dateStr = String(playerOrContrato)
  }

  const contractDate = parseContractDate(dateStr)
  if (!contractDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = contractDate.getTime() - today.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Retorna o status completo e especificações visuais de urgência do contrato.
 */
export const getContractStatus = (playerOrContrato) => {
  const days = getDaysToContractExpiry(playerOrContrato)

  let dateStr = ''
  if (typeof playerOrContrato === 'object' && playerOrContrato !== null) {
    dateStr = playerOrContrato.contrato || playerOrContrato.contract_end || playerOrContrato.contract_until || ''
  } else if (playerOrContrato) {
    dateStr = String(playerOrContrato)
  }

  if (days === null) {
    return {
      days: null,
      status: 'UNKNOWN',
      label: dateStr || '—',
      fullLabel: 'Sem data de contrato registrada',
      shortLabel: '—',
      badgeClass: 'text-slate-500 bg-slate-800/40 border-slate-700/50',
      textClass: 'text-slate-500',
      isExpired: false,
      isCritical: false,
      isPreContract: false,
      isRegular: false
    }
  }

  // 1. Tag "Expirado": Data anterior à data corrente (< 0 dias)
  if (days < 0) {
    const absDays = Math.abs(days)
    return {
      days,
      status: 'EXPIRED',
      label: '⚠️ Expirado',
      fullLabel: `⚠️ Expirado há ${absDays} ${absDays === 1 ? 'dia' : 'dias'} (${dateStr})`,
      shortLabel: '⚠️ Expirado',
      badgeClass: 'bg-rose-950/80 text-rose-300 border border-rose-600/70 shadow-sm shadow-rose-950/40 font-bold',
      textClass: 'text-rose-400 font-bold',
      isExpired: true,
      isCritical: false,
      isPreContract: false,
      isRegular: false
    }
  }

  // 2. Alerta Vermelho: Vencimento em menos de 90 dias (Urgência Máxima)
  if (days <= 90) {
    return {
      days,
      status: 'CRITICAL',
      label: days === 0 ? '🚨 Expira Hoje!' : `🚨 Faltam ${days} dias`,
      fullLabel: days === 0 ? '🚨 Contrato expira hoje!' : `🚨 Faltam ${days} dias (${dateStr})`,
      shortLabel: `🚨 ${days}d`,
      badgeClass: 'bg-rose-500/25 text-rose-200 border border-rose-500/80 shadow-md shadow-rose-950/50 font-extrabold animate-pulse',
      textClass: 'text-rose-400 font-bold',
      isExpired: false,
      isCritical: true,
      isPreContract: true,
      isRegular: false
    }
  }

  // 3. Alerta Amarelo/Âmbar: Vencimento entre 91 e 180 dias (Janela de Pré-Contrato Ativa)
  if (days <= 180) {
    return {
      days,
      status: 'PRE_CONTRACT',
      label: `⏳ Faltam ${days} dias`,
      fullLabel: `⏳ Faltam ${days} dias • Janela de Pré-Contrato Ativa (${dateStr})`,
      shortLabel: `⏳ ${days}d`,
      badgeClass: 'bg-amber-500/20 text-amber-200 border border-amber-500/60 shadow-sm shadow-amber-950/40 font-bold',
      textClass: 'text-amber-400 font-semibold',
      isExpired: false,
      isCritical: false,
      isPreContract: true,
      isRegular: false
    }
  }

  // 4. Contrato Regular (> 180 dias)
  return {
    days,
    status: 'REGULAR',
    label: `${days} dias`,
    fullLabel: `Contrato até ${dateStr} (${days} dias)`,
    shortLabel: `${days}d`,
    badgeClass: 'bg-slate-800/60 text-slate-300 border border-slate-700/60 font-medium',
    textClass: days <= 365 ? 'text-amber-300/90 font-medium' : 'text-emerald-400/90 font-medium',
    isExpired: false,
    isCritical: false,
    isPreContract: false,
    isRegular: true
  }
}

/**
 * Agrupamentos de posições prioritárias para filtro rápido:
 * GOL, ZAG, LAT, VOL, MEI, ATA
 */
export const PRIORITY_POSITION_GROUPS = [
  { id: 'ALL', label: 'Todas as Posições', shortLabel: 'Todas' },
  { id: 'GOL', label: 'Goleiros', shortLabel: 'GOL' },
  { id: 'ZAG', label: 'Zagueiros', shortLabel: 'ZAG' },
  { id: 'LAT', label: 'Laterais', shortLabel: 'LAT' },
  { id: 'VOL', label: 'Volantes', shortLabel: 'VOL' },
  { id: 'MEI', label: 'Meias', shortLabel: 'MEI' },
  { id: 'ATA', label: 'Atacantes', shortLabel: 'ATA' }
]

export const matchesPriorityPosition = (player, groupKey) => {
  if (!groupKey || groupKey === 'ALL') return true
  const pos = String(player.posicao || '').toLowerCase().trim()

  switch (groupKey) {
    case 'GOL':
      return pos === 'goleiro' || pos === 'gol' || pos === 'gk' || pos.includes('goleiro')

    case 'ZAG':
      return (
        pos === 'zagueiro' ||
        pos === 'zag-canhoto' ||
        pos === 'zag-destro' ||
        pos.includes('zag') ||
        pos.includes('cb') ||
        (pos.includes('destro') && !pos.includes('lat')) ||
        (pos.includes('canhoto') && !pos.includes('lat'))
      )

    case 'LAT':
      return (
        pos === 'lat-direito' ||
        pos === 'lat-esquerdo' ||
        pos === 'ld' ||
        pos === 'le' ||
        pos.includes('lateral') ||
        pos.includes('lat')
      )

    case 'VOL':
      return (
        pos === 'medio' ||
        pos === 'volante' ||
        pos === 'vol' ||
        pos.includes('volante') ||
        pos.includes('1º') ||
        pos.includes('1o') ||
        (pos.includes('médio') && !pos.includes('ofensivo') && !pos.includes('central'))
      )

    case 'MEI':
      return (
        pos === 'meia-ofensivo' ||
        pos === 'medio-central' ||
        pos === 'meia' ||
        pos === 'moc' ||
        pos === 'mc' ||
        pos.includes('ofensivo') ||
        pos.includes('central') ||
        (pos.includes('meia') && !pos.includes('lateral'))
      )

    case 'ATA':
      return (
        pos === 'extremo' ||
        pos === 'centroavante' ||
        pos === 'ponta' ||
        pos === 'ca' ||
        pos === 'cf' ||
        pos === 'ata' ||
        pos.includes('extremo') ||
        pos.includes('ponta') ||
        pos.includes('centroavante') ||
        pos.includes('atacante')
      )

    default:
      return true
  }
}

/**
 * Tiers rápidos para filtro imediato:
 * A+, A, B+, B, C
 */
export const QUICK_TIERS = ['ALL', 'A+', 'A', 'B+', 'B', 'C']

export const matchesQuickTier = (player, tierKey) => {
  if (!tierKey || tierKey === 'ALL') return true
  const lvl = String(player.nivel || '').trim().toUpperCase()
  if (tierKey === 'C') {
    return lvl === 'C' || lvl === 'C+'
  }
  return lvl === tierKey
}
