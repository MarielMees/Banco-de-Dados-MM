/**
 * playerSanitizer.js
 * Sanitização universal e estrita para perfis de atletas (Tabela, Campograma e Supabase)
 * Garante tolerância zero para dados fakes ou aleatórios.
 */

export const VALID_TIERS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'];
export const VALID_FEET = ['Destro', 'Canhoto', 'Ambidestro'];
export const VALID_CONTRACT_STATUSES = ['OK', 'Atenção', 'Vencendo', 'Sem data'];

/**
 * ALTURA (height): aceitar '188', '1.88', '1,88' ou '188 cm' e converter matematicamente para número inteiro em cm (ex: 188). Se vazio, salvar null.
 */
export function sanitizeHeight(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str || str === '—' || str === '-' || str.toLowerCase() === 'null') return null;

  // Substitui vírgula por ponto para parse correto de decimais (ex: 1,88 -> 1.88)
  const normalized = str.replace(',', '.');
  const numMatches = normalized.match(/[\d.]+/g);
  if (!numMatches) return null;

  const rawNum = parseFloat(numMatches.join(''));
  if (isNaN(rawNum) || rawNum <= 0) return null;

  // Se foi fornecido em metros (ex: 1.88, 1.95, 2.02)
  if (rawNum < 3.0) {
    return Math.round(rawNum * 100);
  }

  // Se fornecido em cm (ex: 188, 192)
  return Math.round(rawNum);
}

/**
 * SALÁRIO (salary): limpar símbolos monetários, pontos de milhar e vírgulas, convertendo para número float puro (ex: 'R$ 25.000,00' -> 25000.00). Se vazio, salvar null.
 */
export function sanitizeSalary(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (isNaN(val) || val < 0) return null;
    return Number(val.toFixed(2));
  }

  let str = String(val).trim().replace(/[R$\s]/gi, '');
  if (!str || str === '—' || str === '-' || str.toLowerCase() === 'null') return null;

  // Se contiver vírgula como separador decimal pt-BR (ex: 25.000,00 ou 25000,00)
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    // Pontos apenas como milhares sem decimais (ex: 25.000 ou 1.250.000)
    str = str.replace(/\./g, '');
  }

  const num = parseFloat(str);
  if (isNaN(num) || num < 0) return null;
  return Number(num.toFixed(2));
}

/**
 * ANO DE NASCIMENTO (birth_year): validar se possui 4 dígitos inteiros. Se vazio, null.
 */
export function sanitizeBirthYear(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str || str === '—' || str === '-' || str.toLowerCase() === 'null') return null;

  if (!/^\d{4}$/.test(str)) return null;
  const year = parseInt(str, 10);
  const currentYear = new Date().getFullYear();
  if (year < 1960 || year > currentYear + 2) return null;
  return year;
}

/**
 * PÉ PREFERIDO (preferred_foot): salvar estritamente a string selecionada ('Destro', 'Canhoto' ou 'Ambidestro').
 */
export function sanitizePreferredFoot(val) {
  if (!val) return null;
  const str = String(val).trim();
  if (VALID_FEET.includes(str)) return str;

  const lower = str.toLowerCase();
  if (lower === 'destro' || lower === 'd') return 'Destro';
  if (lower === 'canhoto' || lower === 'c' || lower === 'e' || lower === 'esquerdo') return 'Canhoto';
  if (lower === 'ambidestro' || lower === 'a') return 'Ambidestro';
  return null;
}

/**
 * TIER (tier): salvar exatamente a opção escolhida ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D') ou null.
 */
export function sanitizeTier(val) {
  if (!val) return null;
  const str = String(val).trim().toUpperCase();
  if (VALID_TIERS.includes(str)) return str;
  return null;
}

/**
 * STATUS DE CONTRATO (contract_status): 'OK', 'Atenção', 'Vencendo', 'Sem data'.
 */
export function sanitizeContractStatus(val) {
  if (!val) return 'Sem data';
  const str = String(val).trim();
  const lower = str.toLowerCase();
  if (lower === 'ok') return 'OK';
  if (lower === 'atenção' || lower === 'atencao' || lower === 'critico') return 'Atenção';
  if (lower === 'vencendo') return 'Vencendo';
  if (lower === 'sem data' || lower === 'desconhecido' || lower === '—' || lower === '-') return 'Sem data';
  return 'Sem data';
}

/**
 * FIM DE CONTRATO (contract_end): validar formato 'YYYY-MM-DD' válido ou null.
 */
export function sanitizeContractEnd(val) {
  if (!val) return null;
  const str = String(val).trim();
  if (!str || str === '—' || str === '-' || str.toLowerCase() === 'unknown' || str.toLowerCase() === 'sem data') {
    return null;
  }

  // Se estiver em formato DD/MM/AAAA: converter para YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    const dateObj = new Date(`${y}-${m}-${d}T00:00:00Z`);
    if (!isNaN(dateObj.getTime())) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // Se estiver no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const dateObj = new Date(`${str}T00:00:00Z`);
    if (!isNaN(dateObj.getTime())) {
      return str;
    }
  }

  return null;
}

/**
 * POSIÇÃO SECUNDÁRIA (secondary_position): string limpa ou null.
 */
export function sanitizeSecondaryPosition(val) {
  if (!val) return null;
  const str = String(val).trim();
  if (!str || str === 'Nenhuma' || str === '—' || str === '-' || str.toLowerCase() === 'null') {
    return null;
  }
  return str;
}

/**
 * CARACTERÍSTICAS (tactical_dna): array de tags selecionadas, sem inclusão automática de tags não marcadas.
 */
export function sanitizeTacticalDna(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return Array.from(new Set(val.map(t => String(t).trim()).filter(Boolean)));
  }
  if (typeof val === 'string') {
    return Array.from(new Set(val.split(',').map(t => t.trim()).filter(Boolean)));
  }
  return [];
}

/**
 * AGENTE (agent): string limpa ou null.
 */
export function sanitizeAgent(val) {
  if (!val) return null;
  const str = String(val).trim();
  if (!str || str === '—' || str === '-' || str.toLowerCase() === 'null' || str.toLowerCase() === 'sem agente') {
    return null;
  }
  return str;
}

/**
 * Sanitiza integralmente um objeto de jogador antes de despachar para o Supabase ou salvar no Estado
 */
export function sanitizePlayerProfile(raw) {
  if (!raw) return null;

  const height = sanitizeHeight(raw.height ?? raw.alt ?? raw.altura);
  const salary = sanitizeSalary(raw.salary ?? raw.estimated_salary ?? raw.salarioEstimado);
  const birthYear = sanitizeBirthYear(raw.birth_year ?? raw.an ?? raw.anoNascimento);
  const preferredFoot = sanitizePreferredFoot(raw.preferred_foot ?? raw.pePreferencial ?? raw.pe);
  const tier = sanitizeTier(raw.tier ?? raw.nivel);
  const contractStatus = sanitizeContractStatus(raw.contract_status ?? raw.situacao ?? raw.alerta);
  const contractEnd = sanitizeContractEnd(raw.contract_end ?? raw.contrato);
  const secondaryPos = sanitizeSecondaryPosition(raw.secondary_position ?? raw.posSecundaria);
  const tacticalDna = sanitizeTacticalDna(raw.tactical_dna ?? raw.caracteristicas);
  const agent = sanitizeAgent(raw.agent ?? raw.agente);

  // Formatações limpas para UI / compatibilidade com componentes existentes
  const altFormatted = height ? (height >= 100 ? `${(height / 100).toFixed(2)}m` : `${height}m`) : '—';
  const posSecFormatted = secondaryPos
    ? (secondaryPos === 'Lateral Direito' ? 'Lat. Direito' : (secondaryPos === 'Zagueiro Canhoto' ? 'Zag. Canhoto' : secondaryPos))
    : '—';
  const contratoFormatted = contractEnd
    ? contractEnd.split('-').reverse().join('/')
    : '—';

  return {
    ...raw,
    // Atributos normalizados oficiais (Banco e Regras)
    height,
    salary,
    estimated_salary: salary,
    salarioEstimado: salary,
    birth_year: birthYear,
    preferred_foot: preferredFoot,
    tier,
    contract_status: contractStatus,
    contract_end: contractEnd,
    secondary_position: secondaryPos,
    tactical_dna: tacticalDna,
    agent,

    // Aliases para UI
    alt: altFormatted,
    altura: altFormatted,
    an: birthYear || '—',
    anoNascimento: birthYear || null,
    idade: birthYear ? (new Date().getFullYear() - birthYear) : (raw.idade || ''),
    pe: preferredFoot || '—',
    pePreferencial: preferredFoot || '—',
    nivel: tier || '—',
    situacao: contractStatus,
    alerta: contractStatus,
    contrato: contratoFormatted,
    posSecundaria: posSecFormatted,
    caracteristicas: tacticalDna,
    agente: agent || '—',
    isProvisorio: false,
    is_provisorio: false
  };
}
