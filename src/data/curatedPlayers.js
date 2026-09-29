/**
 * curatedPlayers.js
 * Registro Unificado de Atletas Curados (Goleiros, Zagueiros Destros, etc.)
 */
import { CURATED_GOALKEEPERS } from './curatedGoalkeepers.js';
import { CURATED_CENTRE_BACKS } from './curatedCentreBacks.js';

export const ALL_CURATED_PLAYERS = [
  ...CURATED_GOALKEEPERS,
  ...CURATED_CENTRE_BACKS
];

export { CURATED_GOALKEEPERS, CURATED_CENTRE_BACKS };
