/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Top' | 'Jng' | 'Mid' | 'Bot' | 'Sup';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PlayerCard {
  id: string;
  nickname: string;
  role: Role;
  team: string;
  splitName: string; // e.g. "CBLOL 2015 Split 1"
  imageUrl: string; // Character placeholder or styled graphic
  overall: number; // 70-99
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  rarity: CardRarity;
  kp?: number; // Kill Participation, useful for Jungler bonus calculation
  flavor?: string; // Icon or tribute line
}

export type DraftSquad = {
  [key in Role]: PlayerCard | null;
};

export interface ChemistryResult {
  score: number; // Final calculated chemistry bonus
  orgSynergies: { tag: string; count: number; bonus: number }[];
  epochSynergies: { yearSplit: string; count: number; bonus: number }[];
  specialSynergies: string[];
}

export interface MatchLog {
  minute: number;
  text: string;
  type: 'action' | 'kill' | 'objective' | 'outcome' | 'info';
}

export interface MatchSimulation {
  stage: 'Quarterfinals' | 'Semifinals' | 'Grand Finals';
  enemyTeam: string;
  enemyPower: number;
  userScore: number;
  enemyScore: number;
  winProbability: number;
  logs: MatchLog[];
  status: 'playing' | 'won' | 'lost';
}

export interface DraftHistoryEntry {
  id: string;
  date: string;
  teamName: string;
  squad: { [key in Role]: PlayerCard };
  totalOverall: number;
  chemistryBonus: number;
  finalScore: number;
  tournamentResult: 'Eliminado nas Quartas' | 'Eliminado nas Semis' | 'Vice-Campeão' | 'Campeão' | 'Não disputou';
}
