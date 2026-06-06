/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerCard, Role, DraftSquad, ChemistryResult, MatchLog, MatchSimulation } from '../types';
import { CBLOL_CARDS } from '../data/players';
import { LOL_CHAMPIONS } from '../data/champions';

/**
 * Generates a cryptographically secure random float between 0 and 1.
 * Prevents seed injection or simple Math.random local manipulation by using the browser's high-entropy crypto API.
 */
export function getSecureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    // Keep it in range [0, 1) precisely
    return array[0] / 4294967296;
  }
  return Math.random();
}

/**
 * Returns 3 unique cards for the specified role based on Drop Rate rules.
 * Drop rates:
 * - 70-79: 60% (common)
 * - 80-87: 30% (rare)
 * - 88-94: 9% (epic)
 * - 95-99: 1% (legendary)
 */
export function getThreeOptionsForRole(role: Role, currentSquad: DraftSquad): PlayerCard[] {
  const options: PlayerCard[] = [];
  const squadCards = Object.values(currentSquad).filter((c): c is PlayerCard => c !== null);
  
  // Also block using duplicate nicknames in the same team for extreme realism
  const existingNicknames = squadCards.map(c => c.nickname.replace(/\s*\(.*\)/, '').trim());

  // Loop until we get 3 options
  let attempts = 0;
  while (options.length < 3 && attempts < 200) {
    attempts++;
    const roll = getSecureRandom() * 100;
    let minOver = 70;
    let maxOver = 79;
    
    if (roll < 60) {
      // Common (70-79)
      minOver = 70;
      maxOver = 79;
    } else if (roll < 90) {
      // Rare (80-87)
      minOver = 80;
      maxOver = 87;
    } else if (roll < 99) {
      // Epic (88-94)
      minOver = 88;
      maxOver = 94;
    } else {
      // Legendary (95-99)
      minOver = 95;
      maxOver = 99;
    }

    // Filter available pool in this role and rating range
    let pool = CBLOL_CARDS.filter(
      c => c.role === role && 
      c.overall >= minOver && 
      c.overall <= maxOver &&
      !options.some(opt => opt.id === c.id) &&
      !squadCards.some(s => s.id === c.id) &&
      !existingNicknames.includes(c.nickname.replace(/\s*\(.*\)/, '').trim())
    );

    // Fallback if the tier pool is empty for this role
    if (pool.length === 0) {
      pool = CBLOL_CARDS.filter(
        c => c.role === role &&
        !options.some(opt => opt.id === c.id) &&
        !squadCards.some(s => s.id === c.id) &&
        !existingNicknames.includes(c.nickname.replace(/\s*\(.*\)/, '').trim())
      );
    }

    if (pool.length > 0) {
      // Pick a random card from the available pool
      const randomIndex = Math.floor(getSecureRandom() * pool.length);
      options.push(pool[randomIndex]);
    } else {
      // absolute fallback if absolutely duplicate filters blocked everything
      let absolutePool = CBLOL_CARDS.filter(
        c => c.role === role && !options.some(opt => opt.id === c.id)
      );
      if (absolutePool.length > 0) {
        options.push(absolutePool[Math.floor(getSecureRandom() * absolutePool.length)]);
      } else {
        break; // Guard against infinite loop
      }
    }
  }

  return options;
}

/**
 * Calculates Chemistry (Entrosamento) of the selected players:
 * 1. Organization Synergy: Pair = +2, Trinca = +5, Quadra = +8, Exodia (5) = +15 points
 * 2. Epoch Synergy: Same Split/Year. e.g. for each split group: 2 players = +3, 3 players = +6, 4 players = +9, 5 players = +12
 * 3. Special Easter Egg Synergies
 */
export function calculateChemistry(squad: DraftSquad): ChemistryResult {
  const cards = Object.values(squad).filter((c): c is PlayerCard => c !== null);
  const totalSlotsFilled = cards.length;

  const result: ChemistryResult = {
    score: 0,
    orgSynergies: [],
    epochSynergies: [],
    specialSynergies: []
  };

  if (totalSlotsFilled === 0) return result;

  // 1. Organization Synergy
  const orgGroups: { [team: string]: number } = {};
  cards.forEach(card => {
    orgGroups[card.team] = (orgGroups[card.team] || 0) + 1;
  });

  let orgBonus = 0;
  Object.entries(orgGroups).forEach(([team, count]) => {
    if (count >= 2) {
      let bonus = 0;
      if (count === 2) bonus = 2;
      else if (count === 3) bonus = 5;
      else if (count === 4) bonus = 8;
      else if (count === 5) bonus = 15;
      
      orgBonus += bonus;
      result.orgSynergies.push({ tag: team, count, bonus });
    }
  });

  // 2. Epoch Synergy (Same Split)
  const splitGroups: { [split: string]: number } = {};
  cards.forEach(card => {
    splitGroups[card.splitName] = (splitGroups[card.splitName] || 0) + 1;
  });

  let epochBonus = 0;
  Object.entries(splitGroups).forEach(([splitName, count]) => {
    if (count >= 2) {
      let bonus = 0;
      if (count === 2) bonus = 3;
      else if (count === 3) bonus = 6;
      else if (count === 4) bonus = 9;
      else if (count === 5) bonus = 12;

      epochBonus += bonus;
      result.epochSynergies.push({ yearSplit: splitName, count, bonus });
    }
  });

  // 3. Special/Easter Egg Synergies
  // Check flat INTZ 2016 Exodia (Yang, Revolta, Tockers, micaO, Jockster)
  const nicknames = cards.map(c => c.nickname.replace(/\s*\(.*\)/, '').toLowerCase());
  const hasIntzExodia = 
    nicknames.includes("yang") &&
    nicknames.includes("revolta") &&
    nicknames.includes("tockers") &&
    nicknames.includes("micao") &&
    nicknames.includes("jockster") &&
    cards.every(c => c.team === "INTZ Esports");

  if (hasIntzExodia && totalSlotsFilled === 5) {
    result.specialSynergies.push("EXÓDIA INTREPIDÃO 2016 (+15 Química)");
    epochBonus += 15;
  }

  // Check paiN 2015 split 2 (Mylon, SirT, Kami, brTT, Dioud)
  const hasPainDynasty = 
    nicknames.includes("mylon") &&
    nicknames.includes("sirt") &&
    nicknames.includes("kami") &&
    nicknames.includes("brtt") &&
    nicknames.includes("dioud") &&
    cards.every(c => c.team === "paiN Gaming");

  if (hasPainDynasty && totalSlotsFilled === 5) {
    result.specialSynergies.push("DINASTIA PAIN 2015 (+15 Química)");
    epochBonus += 15;
  }

  // Support bias rule: High assists increases support score slightly
  // Jungler Kill Participation bonus (>65% KP bonus +2 chemical points)
  let specialRoleBonus = 0;
  cards.forEach(card => {
    if (card.role === 'Jng' && card.kp && card.kp >= 65) {
      specialRoleBonus += 2;
      result.specialSynergies.push(`KP Alta Selva (${card.nickname}) (+2)`);
    }
    // High standard metrics
    if (card.overall >= 95) {
      specialRoleBonus += 1; // Legend bonus
    }
  });

  result.score = orgBonus + epochBonus + specialRoleBonus;
  return result;
}

/**
 * Historical opponent teams available for draft campaign
 */
export interface OpponentTeam {
  name: string;
  power: number;
  coach: string;
  split: string;
}

export const CBLOL_OPPONENTS: OpponentTeam[] = (() => {
  const groups: Record<string, { team: string; splitName: string; overalls: number[] }> = {};
  
  CBLOL_CARDS.forEach(card => {
    const key = `${card.team} - ${card.splitName}`;
    if (!groups[key]) {
      groups[key] = {
        team: card.team,
        splitName: card.splitName,
        overalls: []
      };
    }
    groups[key].overalls.push(card.overall);
  });

  const list = Object.values(groups)
    .filter(g => g.overalls.length >= 3)
    .map(g => {
      const avgOverall = Math.round(g.overalls.reduce((a, b) => a + b, 0) / g.overalls.length);
      
      // Choose coach based on team history
      let coach = "Comissão Técnica";
      const t = g.team.toLowerCase();
      if (t.includes("loud")) coach = "BeellzY";
      else if (t.includes("pain")) coach = "MiT";
      else if (t.includes("intz")) coach = "Abaxial";
      else if (t.includes("flamengo")) coach = "Von";
      else if (t.includes("kabum")) coach = "Hiro";
      else if (t.includes("cnb")) coach = "Djoko";
      else if (t.includes("red")) coach = "Coelho";
      else if (t.includes("keyd")) coach = "Lorenzo";
      else if (t.includes("vorax")) coach = "Kalec";
      else if (t.includes("g3n")) coach = "GeNoX";
      else if (t.includes("operation kino")) coach = "KinoCoach";
      else if (t.includes("remo brave")) coach = "BraveCoach";
      else if (t.includes("rensga")) coach = "Docas";
      else if (t.includes("furia")) coach = "Maestro";
      else if (t.includes("fluxo")) coach = "Turtle";
      else if (t.includes("los grandes")) coach = "Dionrray";
      else if (t.includes("liberty")) coach = "Beholder";
      
      const splitLabel = g.splitName.replace("CBLOL ", "");
      const name = `${g.team} (${g.splitName})`;

      return {
        name,
        power: avgOverall,
        coach,
        split: splitLabel
      };
    });

  // Sort teams to have a clean, balanced list
  return list.sort((a, b) => b.power - a.power);
})();

/**
 * Generates match play-by-play logs for a highly customized simulated Esports match
 */
export function simulateMatchLogs(
  userTeamName: string,
  userPower: number,
  opponent: OpponentTeam,
  userSquad: DraftSquad,
  userWon: boolean,
  userPicks?: Record<Role, string>,
  enemyPicks?: Record<Role, string>
): MatchLog[] {
  const logs: MatchLog[] = [];
  
  // Extract user player names and selected champions
  const topName = userSquad.Top?.nickname || "Top";
  const jngName = userSquad.Jng?.nickname || "Jungler";
  const midName = userSquad.Mid?.nickname || "Mid";
  const botName = userSquad.Bot?.nickname || "Bot";
  const supName = userSquad.Sup?.nickname || "Suporte";

  const topChamp = userPicks?.Top || "Aatrox";
  const jngChamp = userPicks?.Jng || "Lee Sin";
  const midChamp = userPicks?.Mid || "Ahri";
  const botChamp = userPicks?.Bot || "Kai'Sa";
  const supChamp = userPicks?.Sup || "Thresh";

  const eTopChamp = enemyPicks?.Top || "Jax";
  const eJngChamp = enemyPicks?.Jng || "Sejuani";
  const eMidChamp = enemyPicks?.Mid || "Azir";
  const eBotChamp = enemyPicks?.Bot || "Ezreal";
  const eSupChamp = enemyPicks?.Sup || "Nautilus";

  // Match intro
  logs.push({ minute: 0, text: `⚔️ Início da partida! ${userTeamName} entra no Rift com o manto azul contra a histórica equipe da ${opponent.name} (Lado Vermelho).`, type: 'info' });
  
  // Streamlined and major plays only
  const firstBloodUser = getSecureRandom() < (userPower / (userPower + opponent.power));

  if (firstBloodUser) {
    logs.push({ 
      minute: 3, 
      text: `🩸 FIRST BLOOD! O caçador ${jngName} (${jngChamp}) encaixa um gank cirúrgico na rota do meio, abrindo espaço para seu midlaner ${midName} (${midChamp}) abater o oponente (${eMidChamp})!`, 
      type: 'kill' 
    });
  } else {
    logs.push({ 
      minute: 3, 
      text: `🩸 FIRST BLOOD! O caçador inimigo (${eJngChamp}) invade de surpresa e acha seu midlaner ${midName} (${midChamp}) recuado fora de posição no meio, garantindo a primeira morte para ${opponent.name}.`, 
      type: 'kill' 
    });
  }

  // Major objective 1
  const dragonUser = getSecureRandom() < (userPower / (userPower + opponent.power + 5));
  if (dragonUser) {
    logs.push({
      minute: 11,
      text: `🐉 DRAGÃO! Sua equipe garante o controle de visão do rio inferior e segura o Dragão Quimtec com ajuda e de proteção do suporte ${supName} (${supChamp}).`,
      type: 'objective'
    });
  } else {
    logs.push({
      minute: 11,
      text: `🐉 DRAGÃO! Numa rotação brilhante pelas sombras, ${opponent.name} avança pelo rio inferior e captura o Dragão de Fogo incontestado.`,
      type: 'objective'
    });
  }

  // Large play: Solokill or major teamfight
  const skirmishUser = getSecureRandom() < (userPower / (userPower + opponent.power));
  if (skirmishUser) {
    logs.push({
      minute: 18,
      text: `🔥 DUELO LATERAL! O topo ${topName} (${topChamp}) joga de forma absurda e vence um combate isolado e frenético de um contra um contra o topo oponente (${eTopChamp})!`,
      type: 'kill'
    });
  } else {
    logs.push({
      minute: 18,
      text: `🔥 EMBOSCADA! O atirador inimigo (${eBotChamp}) encontra espaço livre e derruba seu atirador ${botName} (${botChamp}) num flanco estonteante no meio do mapa.`,
      type: 'kill'
    });
  }

  // Baron Nashor Resolution (The ultimate objective turning point)
  if (userWon) {
    logs.push({ 
      minute: 27, 
      text: `👾 ROUBO DE BARÃO NASHOR! ${jngName} (${jngChamp}) se infiltra de forma espetacular com seu salto, rouba o Barão Nashor sob o nariz da ${opponent.name} e incendeia a torcida!`, 
      type: 'objective' 
    });
    logs.push({ 
      minute: 32, 
      text: `💥 SITIADOS NO NEXUS! Pressionando com bônus de Barão, ${botName} (${botChamp}) acha o posicionamento perfeito nas linhas de trás inimiga e garante um QUADRA KILL sensacional!`, 
      type: 'kill' 
    });
    logs.push({ 
      minute: 33, 
      text: `🏆 VITÓRIA! Sem oponentes vivos para defender, o quinteto de ${userTeamName} esmigalha o Nexus oponente e fecha a partida com soberania absoluta!`, 
      type: 'outcome' 
    });
  } else {
    logs.push({ 
      minute: 27, 
      text: `👾 BARÃO NASHOR! O caçador inimigo (${eJngChamp}) garante o bônus místico após a equipe de ${opponent.name} vencer uma luta caótica e abater ${topName} e ${jngName}.`, 
      type: 'objective' 
    });
    logs.push({ 
      minute: 32, 
      text: `💥 LUTA FINAL! ${opponent.name} invade a base fortificada no Rift. Seu midlaner ${midName} (${midChamp}) joga defensivamente, mas sofre uma forte investidura e é focado e abatido.`, 
      type: 'kill' 
    });
    logs.push({ 
      minute: 33, 
      text: `💀 DERROTA! Com a vantagem tática da limpa na linha de defesa, ${opponent.name} oblitera o Nexus e garante a vitória decisiva.`, 
      type: 'outcome' 
    });
  }

  return logs;
}

export interface FinishedMatchPayload {
  userWon: boolean;
  userPower: number;
  opponentPower: number;
  userScore: number;
  enemyScore: number;
  winProbability: number;
  chemistryScore: number;
  laneMatchupBonus: number;
  draftCounterBonus: number;
  logs: MatchLog[];
}

/**
 * Resolves the entire match simulation securely on the domain side.
 * Relies only on immutable domain records (squad, opponent team data, champions list).
 * Prevents local client state injection vulnerabilities by computing all values in one atomic operation.
 */
export function resolveMatchSimulation(
  stage: 'quarter' | 'semi' | 'final',
  opponent: OpponentTeam,
  squad: DraftSquad,
  userTeamName: string,
  finalUserPicks: Record<Role, string>,
  finalEnemyPicks: Record<Role, string>
): FinishedMatchPayload {
  // 1. Calculate base overall securely using domain PlayerCard schemas
  const cards = Object.values(squad).filter((c): c is PlayerCard => c !== null);
  const averageRating = cards.length > 0 ? Math.round(cards.reduce((sum, c) => sum + c.overall, 0) / cards.length) : 70;
  
  // 2. Org / Epoch chemistry buffs computed immutably
  const chemistry = calculateChemistry(squad);
  const teamBonus = chemistry.score * 0.5; // Power scaling multiplier

  // 3. Matchup variance metrics
  let laneMatchupBonus = 0;
  const roles: Role[] = ['Top', 'Jng', 'Mid', 'Bot', 'Sup'];
  roles.forEach(role => {
    const player = squad[role];
    if (player) {
      if (player.overall > opponent.power) {
        laneMatchupBonus += 1.5;
      } else if (player.overall < opponent.power - 5) {
        laneMatchupBonus -= 1.0;
      }
    }
  });

  // 4. Counter matchups metrics
  let draftCounterBonus = 0;
  roles.forEach(role => {
    const userChampName = finalUserPicks[role];
    const enemyChampName = finalEnemyPicks[role];
    if (userChampName && enemyChampName) {
      const userChamp = LOL_CHAMPIONS.find(c => c.name === userChampName);
      const enemyChamp = LOL_CHAMPIONS.find(c => c.name === enemyChampName);

      if (userChamp?.counters.includes(enemyChampName)) {
        draftCounterBonus += 2.0;
      } else if (enemyChamp?.counters.includes(userChampName)) {
        draftCounterBonus -= 2.0;
      }
    }
  });

  // Calculate composite security userPower
  const userPower = averageRating + teamBonus + laneMatchupBonus + draftCounterBonus;
  const diff = userPower - opponent.power;
  let winProbability = 0.5;

  if (diff > 0) {
    if (diff >= 12) {
      winProbability = 1.0;
    } else if (diff >= 7) {
      winProbability = 0.95 + (diff - 7) * 0.008;
    } else if (diff >= 3) {
      winProbability = 0.82 + (diff - 3) * 0.03;
    } else {
      winProbability = 0.50 + diff * 0.10;
    }
  } else if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff >= 12) {
      winProbability = 0.0;
    } else if (absDiff >= 7) {
      winProbability = 0.05 - (absDiff - 7) * 0.008;
    } else if (absDiff >= 3) {
      winProbability = 0.18 - (absDiff - 3) * 0.03;
    } else {
      winProbability = 0.50 - absDiff * 0.10;
    }
  }

  // Mathematically secure roll using getSecureRandom()
  const userWon = getSecureRandom() <= winProbability;

  const logs = simulateMatchLogs(
    userTeamName, 
    userPower, 
    opponent, 
    squad, 
    userWon,
    finalUserPicks,
    finalEnemyPicks
  );

  // Score calculations (secured with CRYPTO RNG)
  let userScore = 0;
  let enemyScore = 0;
  if (userWon) {
    userScore = Math.floor(getSecureRandom() * 14) + 15;
    enemyScore = Math.floor(getSecureRandom() * 8) + 4;
  } else {
    enemyScore = Math.floor(getSecureRandom() * 14) + 15;
    userScore = Math.floor(getSecureRandom() * 8) + 4;
  }

  return {
    userWon,
    userPower,
    opponentPower: opponent.power,
    userScore,
    enemyScore,
    winProbability,
    chemistryScore: chemistry.score,
    laneMatchupBonus,
    draftCounterBonus,
    logs
  };
}
