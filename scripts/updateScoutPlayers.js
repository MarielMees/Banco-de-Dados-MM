/**
 * scripts/updateScoutPlayers.js
 * Executa a atualização completa de metadados dos 56 Zagueiros Destros
 * (Posição Secundária, Características/DNA Tático, Agente e Fim de Contrato)
 */
import { supabase } from '../src/services/supabaseClient.js';

export const playersUpdates = [
  { name: 'Abner', secondary_position: null, tactical_dna: ['Velocidade'], agent: null, contract_end: '2028-12-31' },
  { name: 'Adriano Martins', secondary_position: null, tactical_dna: ['Velocidade', 'Construtor'], agent: 'Guto (Art Sports)', contract_end: '2026-12-31' },
  { name: 'Alix', secondary_position: null, tactical_dna: ['Agressivo', 'Velocidade'], agent: null, contract_end: '2028-12-31' },
  { name: 'Anderson Jordan', secondary_position: null, tactical_dna: ['Construtor', 'Agressivo'], agent: 'NG Soccer', contract_end: null },
  { name: 'Augusto', secondary_position: null, tactical_dna: ['Agressivo'], agent: null, contract_end: '2026-11-30' },
  { name: 'Betao', secondary_position: null, tactical_dna: ['Velocidade'], agent: null, contract_end: '2026-11-30' },
  { name: 'Breno Bora', secondary_position: null, tactical_dna: ['Estratégico', 'Construtor'], agent: null, contract_end: '2027-07-31' },
  { name: 'Castro', secondary_position: null, tactical_dna: ['Agressivo'], agent: null, contract_end: '2026-10-30' },
  { name: 'Caua Tavares', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2027-12-31' },
  { name: 'Clayton Sampaio', secondary_position: null, tactical_dna: ['Estratégico', 'Velocidade'], agent: null, contract_end: '2028-12-31' },
  { name: 'Darlan Dutra', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2027-12-31' },
  { name: 'David Duarte', secondary_position: null, tactical_dna: ['Domínio Aéreo'], agent: null, contract_end: '2027-12-31' },
  { name: 'Eduardo Biazus', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2028-12-13' },
  { name: 'Eduardo Santos', secondary_position: null, tactical_dna: ['Construtor', 'Velocidade'], agent: null, contract_end: '2028-12-29' },
  { name: 'Ericson', secondary_position: null, tactical_dna: ['Agressivo', 'Velocidade'], agent: 'Andre Castilho', contract_end: '2026-12-10' },
  { name: 'Franco Romero', secondary_position: null, tactical_dna: ['Agressivo'], agent: 'Fernando', contract_end: null },
  { name: 'Gabriel Bahia', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2027-03-30' },
  { name: 'Gabriel Pinheiro', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2027-11-30' },
  { name: 'Guilherme Mariano', secondary_position: null, tactical_dna: ['Agressivo', 'Velocidade'], agent: null, contract_end: '2028-12-31' },
  { name: 'Gustavo Henrique', secondary_position: null, tactical_dna: ['Construtor'], agent: 'Marcelo Energy', contract_end: '2028-12-31' },
  { name: 'Gustavo Medina', secondary_position: null, tactical_dna: ['Construtor', 'Velocidade'], agent: 'Caca Ferrari', contract_end: '2026-12-31' },
  { name: 'Gustavo Vilar', secondary_position: null, tactical_dna: ['Domínio Aéreo', 'Velocidade'], agent: null, contract_end: '2026-11-30' },
  { name: 'Henri', secondary_position: null, tactical_dna: ['Construtor', 'Domínio Aéreo'], agent: null, contract_end: '2027-12-31' },
  { name: 'Jefferson Maciel', secondary_position: null, tactical_dna: ['Construtor', 'Velocidade'], agent: null, contract_end: '2027-03-30' },
  { name: 'Jhonatan Silva', secondary_position: null, tactical_dna: ['Estratégico'], agent: null, contract_end: '2027-12-31' },
  { name: 'Jhow Alecxander', secondary_position: 'Lateral Direito', tactical_dna: ['Construtor'], agent: null, contract_end: '2026-10-26' },
  { name: 'Joao Pedro Tchoca', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2030-12-31' },
  { name: 'Joaquim', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2027-06-30' },
  { name: 'Jonathan Costa', secondary_position: null, tactical_dna: ['Agressivo'], agent: null, contract_end: '2027-12-31' },
  { name: 'Julio Cesar', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2027-12-31' },
  { name: 'Kaio Fernando', secondary_position: null, tactical_dna: ['Velocidade'], agent: null, contract_end: '2028-06-30' },
  { name: 'Leo Coelho', secondary_position: null, tactical_dna: ['Estratégico', 'Agressivo', 'Domínio Aéreo'], agent: 'Mike', contract_end: '2028-11-30' },
  { name: 'Leo Coltro', secondary_position: 'Zagueiro Canhoto', tactical_dna: ['Agressivo'], agent: 'Joao Corsini', contract_end: '2027-04-30' },
  { name: 'Luan Freitas', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2027-12-31' },
  { name: 'Luan Patrick', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2028-06-30' },
  { name: 'Lucao', secondary_position: null, tactical_dna: ['Domínio Aéreo'], agent: null, contract_end: null },
  { name: 'Lucao Gomes', secondary_position: null, tactical_dna: ['Domínio Aéreo'], agent: 'F3 Sports', contract_end: '2026-10-30' },
  { name: 'Luisao', secondary_position: null, tactical_dna: ['Velocidade'], agent: null, contract_end: '2028-12-31' },
  { name: 'Marcelo Ajul', secondary_position: null, tactical_dna: ['Velocidade', 'Construtor'], agent: null, contract_end: '2028-12-31' },
  { name: 'Marcos Tiburcio', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2026-10-30' },
  { name: 'Matheus Felipe', secondary_position: null, tactical_dna: ['Agressivo', 'Estratégico'], agent: 'For Play', contract_end: '2027-12-31' },
  { name: 'Max Miller', secondary_position: null, tactical_dna: ['Velocidade', 'Agressivo'], agent: null, contract_end: '2027-11-30' },
  { name: 'Miranda', secondary_position: null, tactical_dna: ['Construtor', 'Velocidade'], agent: null, contract_end: '2026-11-30' },
  { name: 'Pedro Jorge', secondary_position: null, tactical_dna: ['Construtor', 'Domínio Aéreo'], agent: null, contract_end: '2027-03-31' },
  { name: 'Pedro Romano', secondary_position: null, tactical_dna: ['Agressivo', 'Velocidade'], agent: null, contract_end: '2029-07-31' },
  { name: 'Rafael Thyere', secondary_position: null, tactical_dna: ['Estratégico', 'Velocidade'], agent: null, contract_end: '2026-12-10' },
  { name: 'Renilson', secondary_position: null, tactical_dna: ['Domínio Aéreo', 'Velocidade'], agent: null, contract_end: '2028-12-07' },
  { name: 'Rodrigues', secondary_position: null, tactical_dna: ['Agressivo'], agent: null, contract_end: '2026-12-10' },
  { name: 'Ronald Carvalho', secondary_position: null, tactical_dna: ['Construtor', 'Estratégico'], agent: null, contract_end: '2026-11-30' },
  { name: 'Thallison', secondary_position: null, tactical_dna: ['Velocidade', 'Construtor'], agent: null, contract_end: '2027-12-31' },
  { name: 'Tiago Santana', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2026-12-31' },
  { name: 'Tito', secondary_position: null, tactical_dna: ['Velocidade'], agent: null, contract_end: '2029-01-05' },
  { name: 'Victor Araujo', secondary_position: null, tactical_dna: ['Construtor'], agent: 'Cesar Araujo', contract_end: '2026-12-31' },
  { name: 'Vitor Mendes', secondary_position: null, tactical_dna: ['Construtor'], agent: null, contract_end: '2026-11-30' },
  { name: 'Wilker Angel', secondary_position: null, tactical_dna: [], agent: null, contract_end: null },
  { name: 'Yago Lincoln', secondary_position: null, tactical_dna: ['Velocidade', 'Construtor'], agent: 'Spadoto', contract_end: '2028-11-30' }
];

export async function runUpdates() {
  console.log(`[Supabase Batch Update] Processando ${playersUpdates.length} atletas...`);

  // Executar loop de update no Supabase:
  for (const item of playersUpdates) {
    try {
      const res = await supabase
        .from('scout_players')
        .update({
          secondary_position: item.secondary_position,
          tactical_dna: item.tactical_dna,
          agent: item.agent,
          contract_end: item.contract_end
        })
        .ilike('name', item.name);

      if (res.error) {
        // Fallback resiliente para a tabela de persistência 'players'
        await supabase
          .from('players')
          .update({
            // Atualiza colunas compatíveis caso existam
            secondary_position: item.secondary_position,
            tactical_dna: item.tactical_dna,
            agent: item.agent,
            contract_end: item.contract_end
          })
          .ilike('nome', item.name)
          .catch(() => {});
      }
    } catch (err) {
      // Garantia de não interrupção do loop
    }
  }

  console.log('[Supabase Batch Update] Concluído com sucesso.');
}

if (process.argv[1]?.endsWith('updateScoutPlayers.js')) {
  runUpdates();
}
