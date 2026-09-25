/**
 * Utilitários para o Simulador de Orçamento e Folha Salarial
 * Moeda: Real Brasileiro (BRL)
 */

export const DEFAULT_TIER_SALARIES = {
  'A+': 350000,
  'A': 220000,
  'B+': 130000,
  'B': 85000,
  'C+': 45000,
  'C': 25000,
  'D': 12000
}

/**
 * Formata um valor numérico para o padrão de moeda Real Brasileiro (R$)
 * Exemplo: 2000000 -> "R$ 2.000.000,00"
 */
export const formatBRL = (value, showDecimals = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return showDecimals ? 'R$ 0,00' : 'R$ 0'
  }

  const num = typeof value === 'number' ? value : parseBRL(value)
  if (isNaN(num)) return showDecimals ? 'R$ 0,00' : 'R$ 0'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }).format(num)
}

/**
 * Formatação compacta para tags ou telas menores
 * Exemplo: 2500000 -> "R$ 2,5M" | 85000 -> "R$ 85k"
 */
export const formatCompactBRL = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0'
  const num = typeof value === 'number' ? value : parseBRL(value)
  if (isNaN(num) || num === 0) return 'R$ 0'

  if (Math.abs(num) >= 1000000) {
    const val = (num / 1000000).toFixed(1).replace('.0', '').replace('.', ',')
    return `R$ ${val}M`
  }
  if (Math.abs(num) >= 1000) {
    const val = Math.round(num / 1000)
    return `R$ ${val}k`
  }
  return formatBRL(num, false)
}

/**
 * Converte qualquer entrada (string formatada com "R$", pontos, vírgulas ou número) em float limpo
 */
export const parseBRL = (input) => {
  if (typeof input === 'number') return input
  if (!input) return 0

  let str = String(input).trim()
  // Remove "R$", espaços e caracteres que não sejam dígitos, vírgula, ponto ou traço negativo
  str = str.replace(/[R$\s]/g, '')

  // Se contiver vírgula como separador decimal (formato brasileiro 1.500.000,00)
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.')
  }

  const result = parseFloat(str)
  return isNaN(result) ? 0 : result
}

/**
 * Obtém a estimativa salarial padrão de mercado baseada no Nível / Tier do atleta
 */
export const getDefaultEstimatedSalary = (nivel) => {
  if (!nivel) return 40000
  const key = String(nivel).toUpperCase().trim()
  return DEFAULT_TIER_SALARIES[key] || 35000
}

/**
 * Retorna o salário estimado do atleta.
 * Prioridade:
 * 1. Campo explícito no próprio objeto (estimated_salary ou salarioEstimado)
 * 2. Campo no registro correspondente da lista de players
 * 3. Estimativa padrão por Tier
 */
export const getAthleteSalary = (athlete, playersList = []) => {
  if (!athlete) return 0

  // 1. No próprio objeto
  if (athlete.estimated_salary !== undefined && athlete.estimated_salary !== null && athlete.estimated_salary !== '') {
    const num = parseBRL(athlete.estimated_salary)
    if (!isNaN(num) && num >= 0) return num
  }
  if (athlete.salarioEstimado !== undefined && athlete.salarioEstimado !== null && athlete.salarioEstimado !== '') {
    const num = parseBRL(athlete.salarioEstimado)
    if (!isNaN(num) && num >= 0) return num
  }

  // 2. Busca na lista de atletas cadastrados
  if (playersList && playersList.length > 0) {
    const match = playersList.find(p =>
      String(p.id) === String(athlete.id) ||
      (p.nome && athlete.nome && p.nome.toLowerCase().trim() === athlete.nome.toLowerCase().trim())
    )
    if (match) {
      if (match.estimated_salary !== undefined && match.estimated_salary !== null && match.estimated_salary !== '') {
        const num = parseBRL(match.estimated_salary)
        if (!isNaN(num) && num >= 0) return num
      }
      if (match.salarioEstimado !== undefined && match.salarioEstimado !== null && match.salarioEstimado !== '') {
        const num = parseBRL(match.salarioEstimado)
        if (!isNaN(num) && num >= 0) return num
      }
    }
  }

  // 3. Fallback de mercado por Tier
  return getDefaultEstimatedSalary(athlete.nivel)
}

/**
 * Verifica se o atleta possui salário estimado cadastrado manualmente
 */
export const isAthleteSalaryCustom = (athlete, playersList = []) => {
  if (!athlete) return false
  if (athlete.estimated_salary !== undefined && athlete.estimated_salary !== null && athlete.estimated_salary !== '') {
    return true
  }
  if (athlete.salarioEstimado !== undefined && athlete.salarioEstimado !== null && athlete.salarioEstimado !== '') {
    return true
  }
  if (playersList && playersList.length > 0) {
    const match = playersList.find(p =>
      String(p.id) === String(athlete.id) ||
      (p.nome && athlete.nome && p.nome.toLowerCase().trim() === athlete.nome.toLowerCase().trim())
    )
    if (match) {
      return Boolean(
        (match.estimated_salary !== undefined && match.estimated_salary !== null && match.estimated_salary !== '') ||
        (match.salarioEstimado !== undefined && match.salarioEstimado !== null && match.salarioEstimado !== '')
      )
    }
  }
  return false
}

/**
 * Calcula a folha projetada atual somando apenas os 11 titulares ativos
 */
export const calculateTeamPayroll = (formationPositions = [], slotsData = {}, playersList = []) => {
  let folhaProjetada = 0
  let startersCount = 0
  let customSalaryCount = 0
  const details = []

  formationPositions.forEach(pos => {
    const list = slotsData[pos.id] || []
    const titular = list[0]
    if (titular) {
      startersCount += 1
      const salary = getAthleteSalary(titular, playersList)
      const isCustom = isAthleteSalaryCustom(titular, playersList)
      if (isCustom) customSalaryCount += 1
      folhaProjetada += salary
      details.push({
        posId: pos.id,
        posLabel: pos.label,
        athlete: titular,
        salary,
        isCustom
      })
    }
  })

  return {
    folhaProjetada,
    startersCount,
    customSalaryCount,
    totalPositions: formationPositions.length,
    details
  }
}

/**
 * Formata a variação/impacto salarial ao trocar de titular na posição
 * diff = novoSalario - antigoSalario
 * diff < 0: economia (Verde, ↓ -R$ X)
 * diff > 0: aumento (Vermelho, ↑ +R$ X)
 */
export const formatSalaryDiff = (diff) => {
  if (diff === null || diff === undefined || isNaN(diff) || diff === 0) {
    return {
      text: '— R$ 0,00',
      compactText: '— R$ 0',
      type: 'neutral',
      colorClass: 'text-slate-400 bg-slate-800/80 border-slate-700/60'
    }
  }

  if (diff < 0) {
    // Redução de custo / economia
    const abs = Math.abs(diff)
    return {
      text: `↓ -${formatBRL(abs, true)}`,
      compactText: `↓ -${formatCompactBRL(abs)}`,
      type: 'saving',
      colorClass: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
    }
  }

  // Aumento de custo
  return {
    text: `↑ +${formatBRL(diff, true)}`,
    compactText: `↑ +${formatCompactBRL(diff)}`,
    type: 'expense',
    colorClass: 'text-rose-300 bg-rose-500/25 border-rose-500/50 shadow-sm shadow-rose-500/10'
  }
}
