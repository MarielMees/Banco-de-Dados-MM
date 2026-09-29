/**
 * curatedCentreBacks.js
 * Base Oficial Curada de Zagueiros Destros (Zag. Destro)
 * Ingestão de 56 perfis verificados para Radar de Mercado e Supabase
 */

export const RAW_CENTRE_BACKS = [
  {"name": "Abner", "birth_year": 2004, "height": 188, "tier": "A", "contract_status": "OK", "current_club": "Juventude", "youth_club": "Juventude", "tactical_dna": ["Velocidade"], "contract_end": "2028-12-31"},
  {"name": "Adriano Martins", "birth_year": 1997, "height": 193, "tier": "B+", "contract_status": "Vencendo", "current_club": "Atletico-GO", "youth_club": "Penapolense", "tactical_dna": ["Velocidade", "Construtor"], "contract_end": "2026-12-31"},
  {"name": "Alix", "birth_year": 1999, "height": 196, "tier": "B+", "contract_status": "OK", "current_club": "Red Bull Bragantino", "youth_club": "Tigres do Brasil", "tactical_dna": ["Agressivo", "Velocidade"], "contract_end": "2028-12-31"},
  {"name": "Anderson Jordan", "birth_year": 1999, "height": 190, "tier": "B+", "contract_status": "Desconhecido", "current_club": "Zorya", "youth_club": "Ferroviaria", "tactical_dna": ["Construtor", "Agressivo"], "contract_end": null},
  {"name": "Augusto", "birth_year": 1997, "height": 186, "tier": "C+", "contract_status": "Vencendo", "current_club": "Sao Bernardo", "youth_club": "Palmeiras", "tactical_dna": ["Agressivo"], "contract_end": "2026-11-30"},
  {"name": "Betao", "birth_year": 1999, "height": 188, "tier": "C", "contract_status": "Vencendo", "current_club": "Nautico", "youth_club": "Taubate", "tactical_dna": ["Velocidade"], "contract_end": "2026-11-30"},
  {"name": "Breno Bora", "birth_year": 2002, "height": 186, "tier": "D", "contract_status": "Atencao", "current_club": "Foz do Iguacu", "loan_details": "Vila Nova", "youth_club": "Atletico-GO", "tactical_dna": ["Estrategico", "Construtor"], "contract_end": "2027-07-31"},
  {"name": "Castro", "birth_year": 1995, "height": 191, "tier": "C", "contract_status": "Vencendo", "current_club": "Paysandu", "youth_club": "Corinthians-RN", "tactical_dna": ["Agressivo"], "contract_end": "2026-10-30"},
  {"name": "Caua Tavares", "birth_year": 2004, "height": 187, "tier": "C", "contract_status": "OK", "current_club": "Maringa", "youth_club": "Ituano", "tactical_dna": ["Construtor"], "contract_end": "2027-12-31"},
  {"name": "Clayton Sampaio", "birth_year": 2000, "height": 187, "tier": "B", "contract_status": "OK", "current_club": "Internacional", "youth_club": "Santos", "tactical_dna": ["Estrategico", "Velocidade"], "contract_end": "2028-12-31"},
  {"name": "Darlan Dutra", "birth_year": 2003, "height": 196, "tier": "C", "contract_status": "OK", "current_club": "Gremio Anapolis", "loan_details": "Vitoria", "youth_club": "Gremio Anapolis", "tactical_dna": ["Construtor"], "contract_end": "2027-12-31"},
  {"name": "David Duarte", "birth_year": 1995, "height": 196, "tier": "A", "contract_status": "OK", "current_club": "Bahia", "youth_club": "Goias", "tactical_dna": ["Dominio Aereo"], "contract_end": "2027-12-31"},
  {"name": "Eduardo Biazus", "birth_year": 2001, "height": 186, "tier": "B", "contract_status": "OK", "current_club": "Portuguesa-SP", "youth_club": "Sao Joseense", "tactical_dna": ["Construtor"], "contract_end": "2028-12-13"},
  {"name": "Eduardo Santos", "birth_year": 1997, "height": 196, "tier": "A+", "contract_status": "OK", "current_club": "Red Bull Bragantino", "youth_club": "Fluminense", "tactical_dna": ["Construtor", "Velocidade"], "contract_end": "2028-12-29"},
  {"name": "Ericson", "birth_year": 1999, "height": 184, "tier": "C+", "contract_status": "Vencendo", "current_club": "Botafogo-SP", "youth_club": "Gremio", "tactical_dna": ["Agressivo", "Velocidade"], "contract_end": "2026-12-10"},
  {"name": "Franco Romero", "birth_year": 1995, "height": 180, "tier": "B", "contract_status": "Desconhecido", "current_club": "Sporting Cristal", "youth_club": "Estudiantes", "tactical_dna": ["Agressivo"], "contract_end": null},
  {"name": "Gabriel Bahia", "birth_year": 1998, "height": 190, "tier": "A", "contract_status": "Atencao", "current_club": "Volta Redonda", "loan_details": "Botafogo", "youth_club": "Juazeirense", "tactical_dna": ["Construtor"], "contract_end": "2027-03-30"},
  {"name": "Gabriel Pinheiro", "birth_year": 1997, "height": 187, "tier": "B", "contract_status": "OK", "current_club": "Volta Redonda", "loan_details": "Juventude", "youth_club": "Americano", "tactical_dna": ["Construtor"], "contract_end": "2027-11-30"},
  {"name": "Guilherme Mariano", "birth_year": 1999, "height": 192, "tier": "B", "contract_status": "OK", "current_club": "Cuiaba", "loan_details": "Botafogo-SP", "youth_club": "Comercial", "tactical_dna": ["Agressivo", "Velocidade"], "contract_end": "2028-12-31"},
  {"name": "Gustavo Henrique", "birth_year": 1999, "height": 192, "tier": "C+", "contract_status": "OK", "current_club": "Portuguesa", "youth_club": "Sao Carlense", "tactical_dna": ["Construtor"], "contract_end": "2028-12-31"},
  {"name": "Gustavo Medina", "birth_year": 2001, "height": 184, "tier": "B", "contract_status": "Vencendo", "current_club": "Ferroviaria", "youth_club": "Ferroviaria", "tactical_dna": ["Construtor", "Velocidade"], "contract_end": "2026-12-31"},
  {"name": "Gustavo Vilar", "birth_year": 2000, "height": 189, "tier": "B", "contract_status": "Vencendo", "current_club": "Botafogo-SP", "youth_club": "Santos", "tactical_dna": ["Dominio Aereo", "Velocidade"], "contract_end": "2026-11-30"},
  {"name": "Henri", "birth_year": 2002, "height": 190, "tier": "B+", "contract_status": "OK", "current_club": "CRB", "youth_club": "Palmeiras", "tactical_dna": ["Construtor", "Dominio Aereo"], "contract_end": "2027-12-31"},
  {"name": "Jefferson Maciel", "birth_year": 2003, "height": 193, "tier": "B+", "contract_status": "Atencao", "current_club": "Avai", "youth_club": "Ceara", "tactical_dna": ["Construtor", "Velocidade"], "contract_end": "2027-03-30"},
  {"name": "Jhonatan Silva", "birth_year": 1999, "height": 186, "tier": "B", "contract_status": "OK", "current_club": "Athletic", "youth_club": "Red Bull Brasil", "tactical_dna": ["Estrategico"], "contract_end": "2027-12-31"},
  {"name": "Jhow Alecxander", "birth_year": 2003, "height": 184, "tier": "C", "contract_status": "Vencendo", "current_club": "Maringa", "youth_club": "America-MG", "tactical_dna": ["Construtor"], "contract_end": "2026-10-26"},
  {"name": "Joao Pedro Tchoca", "birth_year": 2003, "height": 190, "tier": "A", "contract_status": "OK", "current_club": "Corinthians", "youth_club": "Corinthians", "tactical_dna": ["Construtor"], "contract_end": "2030-12-31"},
  {"name": "Joaquim", "birth_year": 1998, "height": 190, "tier": "A-", "contract_status": "Atencao", "current_club": "Tigres", "youth_club": "URT", "tactical_dna": ["Construtor"], "contract_end": "2027-06-30"},
  {"name": "Jonathan Costa", "birth_year": 1995, "height": 186, "tier": "B-", "contract_status": "OK", "current_club": "Guarani", "youth_club": "Paulinia", "tactical_dna": ["Agressivo"], "contract_end": "2027-12-31"},
  {"name": "Julio Cesar", "birth_year": 2003, "height": null, "tier": "B", "contract_status": "OK", "current_club": "Ceara", "youth_club": "America-MG", "tactical_dna": ["Construtor"], "contract_end": "2027-12-31"},
  {"name": "Kaio Fernando", "birth_year": 1995, "height": 188, "tier": "A-", "contract_status": "OK", "current_club": "Botafogo", "youth_club": "Ferroviaria", "tactical_dna": ["Velocidade"], "contract_end": "2028-06-30"},
  {"name": "Leo Coelho", "birth_year": 1993, "height": 189, "tier": "B-", "contract_status": "OK", "current_club": "Amazonas", "youth_club": "Nacional-SP", "tactical_dna": ["Estrategico", "Agressivo", "Dominio Aereo"], "contract_end": "2028-11-30"},
  {"name": "Leo Coltro", "birth_year": 1999, "height": 190, "tier": "C", "contract_status": "Atencao", "current_club": "Porto Vitoria", "loan_details": "Ituano", "youth_club": null, "tactical_dna": ["Agressivo"], "contract_end": "2027-04-30"},
  {"name": "Luan Freitas", "birth_year": 2001, "height": 184, "tier": "B", "contract_status": "OK", "current_club": "Fortaleza", "youth_club": "Fluminense", "tactical_dna": ["Construtor"], "contract_end": "2027-12-31"},
  {"name": "Luan Patrick", "birth_year": 2002, "height": 190, "tier": "B", "contract_status": "OK", "current_club": "Estrela Amadora", "youth_club": "Red Bull", "tactical_dna": ["Construtor"], "contract_end": "2028-06-30"},
  {"name": "Lucao", "birth_year": 1996, "height": 195, "tier": "C", "contract_status": "Desconhecido", "current_club": "Camboja", "youth_club": "Rio Branco - SP", "tactical_dna": ["Dominio Aereo"], "contract_end": null},
  {"name": "Lucao Gomes", "birth_year": 2000, "height": 197, "tier": "C-", "contract_status": "Vencendo", "current_club": "Maranhao", "youth_club": "America-RJ", "tactical_dna": ["Dominio Aereo"], "contract_end": "2026-10-30"},
  {"name": "Luisao", "birth_year": 2003, "height": 192, "tier": "A", "contract_status": "OK", "current_club": "Santos", "youth_club": "Gremio Novorizontino", "tactical_dna": ["Velocidade"], "contract_end": "2028-12-31"},
  {"name": "Marcelo Ajul", "birth_year": 2002, "height": 187, "tier": "B-", "contract_status": "OK", "current_club": "Sport", "youth_club": "Sport", "tactical_dna": ["Velocidade", "Construtor"], "contract_end": "2028-12-31"},
  {"name": "Marcos Tiburcio", "birth_year": 2000, "height": 184, "tier": "D", "contract_status": "Vencendo", "current_club": "Maranhao", "youth_club": "Vila Nova", "tactical_dna": ["Construtor"], "contract_end": "2026-10-30"},
  {"name": "Matheus Felipe", "birth_year": 1998, "height": 186, "tier": "B-", "contract_status": "OK", "current_club": "Remo", "youth_club": "Mirassol", "tactical_dna": ["Agressivo", "Estrategico"], "contract_end": "2027-12-31"},
  {"name": "Max Miller", "birth_year": 1998, "height": 185, "tier": "C", "contract_status": "OK", "current_club": "Uberlandia", "youth_club": "Desportiva Ferroviaria", "tactical_dna": ["Velocidade", "Agressivo"], "contract_end": "2027-11-30"},
  {"name": "Miranda", "birth_year": 2000, "height": 182, "tier": "B", "contract_status": "Vencendo", "current_club": "Operario", "youth_club": "Vasco da Gama", "tactical_dna": ["Construtor", "Velocidade"], "contract_end": "2026-11-30"},
  {"name": "Pedro Jorge", "birth_year": 2002, "height": 196, "tier": "C", "contract_status": "Atencao", "current_club": "QFC", "loan_details": "America-RN", "youth_club": "Nautico", "tactical_dna": ["Construtor", "Dominio Aereo"], "contract_end": "2027-03-31"},
  {"name": "Pedro Romano", "birth_year": 2000, "height": 189, "tier": "B+", "contract_status": "OK", "current_club": "Kawasaki Frontale", "youth_club": "Tupi", "tactical_dna": ["Agressivo", "Velocidade"], "contract_end": "2029-07-31"},
  {"name": "Rafael Thyere", "birth_year": 1993, "height": 190, "tier": "B+", "contract_status": "Vencendo", "current_club": "Chapecoense", "youth_club": "Gremio", "tactical_dna": ["Estrategico", "Velocidade"], "contract_end": "2026-12-10"},
  {"name": "Renilson", "birth_year": 1999, "height": 190, "tier": "B", "contract_status": "OK", "current_club": "Desportiva Aracaju", "loan_details": "Confianca", "youth_club": "Sem Base", "tactical_dna": ["Dominio Aereo", "Velocidade"], "contract_end": "2028-12-07"},
  {"name": "Rodrigues", "birth_year": 1997, "height": 188, "tier": "A", "contract_status": "Vencendo", "current_club": "Mirassol", "youth_club": "Gremio", "tactical_dna": ["Agressivo"], "contract_end": "2026-12-10"},
  {"name": "Ronald Carvalho", "birth_year": 2000, "height": 187, "tier": "C+", "contract_status": "Vencendo", "current_club": "Maringa", "youth_club": "Corinthians", "tactical_dna": ["Construtor", "Estrategico"], "contract_end": "2026-11-30"},
  {"name": "Thallison", "birth_year": 2002, "height": 190, "tier": "B", "contract_status": "OK", "current_club": "Coritiba", "youth_club": "Coritiba", "tactical_dna": ["Velocidade", "Construtor"], "contract_end": "2027-12-31"},
  {"name": "Tiago Santana", "birth_year": 1998, "height": 189, "tier": "C", "contract_status": "Vencendo", "current_club": "Ferroviario-CE", "loan_details": "Metropolitano-SC", "youth_club": "Gremio-RS", "tactical_dna": ["Construtor"], "contract_end": "2026-12-31"},
  {"name": "Tito", "birth_year": 2000, "height": 184, "tier": "B", "contract_status": "OK", "current_club": "Atletico-GO", "youth_club": null, "tactical_dna": ["Velocidade"], "contract_end": "2029-01-05"},
  {"name": "Victor Araujo", "birth_year": 2004, "height": 187, "tier": "B", "contract_status": "Vencendo", "current_club": "Pouso Alegre", "youth_club": "Vasco da Gama", "tactical_dna": ["Construtor"], "contract_end": "2026-12-31"},
  {"name": "Vitor Mendes", "birth_year": 1999, "height": 186, "tier": "B", "contract_status": "Vencendo", "current_club": "Cuiaba", "youth_club": "Santos", "tactical_dna": ["Construtor"], "contract_end": "2026-11-30"},
  {"name": "Wilker Angel", "birth_year": 1993, "height": 188, "tier": null, "contract_status": "Desconhecido", "current_club": null, "youth_club": "Trujillanos", "tactical_dna": [], "contract_end": null},
  {"name": "Yago Lincoln", "birth_year": 2003, "height": 190, "tier": "B", "contract_status": "OK", "current_club": "Londrina", "youth_club": "Ceara", "tactical_dna": ["Velocidade", "Construtor"], "contract_end": "2028-11-30"}
];

export const CURATED_CENTRE_BACKS = RAW_CENTRE_BACKS.map(raw => {
  const cleanIdName = raw.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const id = `zag_d_${cleanIdName}_${raw.birth_year || 'atleta'}`;
  const idade = raw.birth_year ? (2026 - raw.birth_year) : null;
  const altFormatted = raw.height ? (raw.height >= 100 ? (raw.height / 100).toFixed(2) + 'm' : raw.height + 'm') : null;

  return {
    // 1. Carga Estruturada Oficial Requisitada
    position: 'Zagueiro Destro',
    preferred_foot: 'Destro',
    name: raw.name,
    birth_year: raw.birth_year,
    height: raw.height,
    tier: raw.tier,
    contract_status: raw.contract_status,
    current_club: raw.current_club,
    loan_details: raw.loan_details || null,
    youth_club: raw.youth_club,
    tactical_dna: raw.tactical_dna || [],
    contract_end: raw.contract_end,

    // 2. Mapeamento de Compatibilidade Ampla (UI, Filtros, Supabase, LocalStorage)
    id,
    nome: raw.name,
    posicao: 'zagueiro',
    posicaoOriginal: 'Zagueiro Destro',
    posicaoLabel: 'Zag. Destro',
    pe: 'Destro',
    pePreferencial: 'Destro',
    idade: idade,
    an: raw.birth_year,
    anoNascimento: raw.birth_year,
    alt: altFormatted,
    altura: altFormatted,
    nivel: raw.tier || 'B',
    situacao: raw.contract_status || 'OK',
    alerta: raw.contract_status || 'OK',
    clubeAtual: raw.current_club || '',
    ca: raw.current_club || '',
    clube: raw.current_club || '',
    emprestimo: raw.loan_details || null,
    clubeEmprestimo: raw.loan_details || null,
    clubeFormador: raw.youth_club || '',
    origem: raw.youth_club || 'Base',
    caracteristicas: raw.tactical_dna || [],
    contrato: raw.contract_end || '',
    nacionalidade: (raw.name === 'Franco Romero' ? 'Argentino' : (raw.name === 'Wilker Angel' ? 'Venezuelano' : 'Brasileiro')),
    agente: '',
    isProvisorio: false,
    is_provisorio: false
  };
});
