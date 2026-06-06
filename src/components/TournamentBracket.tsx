/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlayerCard, DraftSquad, MatchLog, MatchSimulation, Role } from '../types';
import { CBLOL_OPPONENTS, OpponentTeam, resolveMatchSimulation, getSecureRandom } from '../utils/draftEngine';
import { LOL_CHAMPIONS, Champion } from '../data/champions';
import { Play, FastForward, Trophy, AlertTriangle, ShieldCheck, Zap, RefreshCw, Star, ArrowLeft, Heart, Swords, Flame, Sparkles, HelpCircle, FlameKindling, Info, Share2, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TournamentBracketProps {
  squad: DraftSquad;
  userTeamName: string;
  onExitTournament: (result: string) => void;
}

const ROLE_ICONS = {
  Top: ShieldCheck,
  Jng: Zap,
  Mid: Swords,
  Bot: Flame,
  Sup: Heart
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  squad,
  userTeamName,
  onExitTournament
}) => {
  const [currentStage, setCurrentStage] = useState<'quarter' | 'semi' | 'final' | 'completed' | 'failed'>('quarter');
  const [wins, setWins] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [activeMatch, setActiveMatch] = useState<MatchSimulation | null>(null);
  const [logIndex, setLogIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOpponents, setSelectedOpponents] = useState<{ quarter: OpponentTeam; semi: OpponentTeam; final: OpponentTeam } | null>(null);

  // Draft phase state variables
  const [draftPhaseActive, setDraftPhaseActive] = useState(false);
  const [currentDraftRole, setCurrentDraftRole] = useState<Role>('Top');
  const [userDraftPicks, setUserDraftPicks] = useState<Record<Role, string>>({
    Top: '', Jng: '', Mid: '', Bot: '', Sup: ''
  });
  const [enemyDraftPicks, setEnemyDraftPicks] = useState<Record<Role, string>>({
    Top: '', Jng: '', Mid: '', Bot: '', Sup: ''
  });
  const [selectedChampName, setSelectedChampName] = useState<string>('');
  const [blueBans, setBlueBans] = useState<string[]>([]);
  const [redBans, setRedBans] = useState<string[]>([]);

  // Auto-drafting simulation states
  const [draftingActive, setDraftingActive] = useState(false);
  const [currentDraftStep, setCurrentDraftStep] = useState(0);

  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize selected opponents randomly with weighted probabilities (higher power in Semis/Finals)
  useEffect(() => {
    if (!CBLOL_OPPONENTS || CBLOL_OPPONENTS.length === 0) return;

    // Helper for weighted selection based on power levels
    const selectOpponent = (pool: OpponentTeam[], bias: 'low' | 'medium-high' | 'elite'): OpponentTeam => {
      const weighted = pool.map(team => {
        let weight = 1;
        const normalizedPower = Math.max(1, team.power - 70); // powers are generally 74 - 94
        if (bias === 'elite') {
          // Extremely heavily favor higher power teams (clash of the titans!)
          weight = Math.pow(normalizedPower, 5);
        } else if (bias === 'medium-high') {
          // Favor higher power, but allow a slightly wider range for semifinals
          weight = Math.pow(normalizedPower, 2.5);
        } else {
          // Favor lower / moderate power teams for quarterfinals
          weight = Math.pow(100 - team.power, 2.5);
        }
        return { team, weight };
      });

      const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
      let randomVal = getSecureRandom() * totalWeight;
      for (const item of weighted) {
        randomVal -= item.weight;
        if (randomVal <= 0) {
          return item.team;
        }
      }
      return pool[0];
    };

    // Sequentially select distinct opponents to prevent duplicates
    const finalPool = [...CBLOL_OPPONENTS];
    
    // 1. Select the Finalist (elite tier bias)
    const final = selectOpponent(finalPool, 'elite');
    
    // 2. Remove chosen finalist from the pool
    const semiPool = finalPool.filter(t => t.name !== final.name);
    
    // 3. Select Semifinalist (medium-high tier bias)
    const semi = selectOpponent(semiPool, 'medium-high');
    
    // 4. Remove chosen semifinalist from the pool
    const quarterPool = semiPool.filter(t => t.name !== semi.name);
    
    // 5. Select Quarterfinalist (low tier bias)
    const quarter = selectOpponent(quarterPool, 'low');

    setSelectedOpponents({ quarter, semi, final });
  }, []);

  // Tick the simulated sequential draft of champions compatible with position
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (draftPhaseActive && draftingActive && currentDraftStep < 5) {
      timer = setTimeout(() => {
        const roleOrder: Role[] = ['Top', 'Jng', 'Mid', 'Bot', 'Sup'];
        const role = roleOrder[currentDraftStep];
        
        // Find pool of compatible champions for this position
        const available = LOL_CHAMPIONS.filter(c => c.role === role);
        const userPick = available[Math.floor(getSecureRandom() * available.length)]?.name || 'Aatrox';
        const remaining = available.filter(c => c.name !== userPick);
        const enemyPick = remaining[Math.floor(getSecureRandom() * remaining.length)]?.name || 'Jax';

        setUserDraftPicks(prev => ({ ...prev, [role]: userPick }));
        setEnemyDraftPicks(prev => ({ ...prev, [role]: enemyPick }));

        if (currentDraftStep < 4) {
          setCurrentDraftRole(roleOrder[currentDraftStep + 1]);
        }
        setCurrentDraftStep(prev => prev + 1);
        
        if (currentDraftStep === 4) {
          setDraftingActive(false);
        }
      }, 1500); // 1.5s delay for realistic tactical pacing
    }
    return () => clearTimeout(timer);
  }, [draftPhaseActive, draftingActive, currentDraftStep]);

  // Set up match details and probabilities securely via domain-level logic
  const prepareAndLaunchMatch = (
    stage: 'quarter' | 'semi' | 'final', 
    opponent: OpponentTeam,
    finalUserPicks: Record<Role, string>,
    finalEnemyPicks: Record<Role, string>
  ) => {
    // Encapsulated secure simulation calculated atomically from immutable metadata
    const result = resolveMatchSimulation(
      stage,
      opponent,
      squad,
      userTeamName,
      finalUserPicks,
      finalEnemyPicks
    );

    const stageLabelMap = {
      quarter: 'Quarterfinals' as const,
      semi: 'Semifinals' as const,
      final: 'Grand Finals' as const
    };

    setActiveMatch({
      stage: stageLabelMap[stage],
      enemyTeam: opponent.name,
      enemyPower: opponent.power,
      userScore: result.userScore,
      enemyScore: result.enemyScore,
      winProbability: result.winProbability,
      logs: result.logs,
      status: 'playing'
    });
    setLogIndex(0);
    setIsPlaying(true);
  };

  // Launch a match draft phase
  const handleStartMatch = () => {
    if (!selectedOpponents) return;

    // Sorteio de Bans realistas de Lol
    const defaultBlueBans = ["Yasuo", "Zed", "LeBlanc", "Katarina", "Nidalee", "Yuumi", "Teemo", "Master Yi"];
    const defaultRedBans = ["Jax", "Fiora", "Lee Sin", "Viego", "Aatrox", "Thresh", "Ezreal", "Twisted Fate"];
    
    const bBans: string[] = [];
    const rBans: string[] = [];
    
    while(bBans.length < 3) {
      const idx = Math.floor(getSecureRandom() * defaultBlueBans.length);
      const b = defaultBlueBans[idx];
      if (!bBans.includes(b)) bBans.push(b);
    }
    while(rBans.length < 3) {
      const idx = Math.floor(getSecureRandom() * defaultRedBans.length);
      const r = defaultRedBans[idx];
      if (!rBans.includes(r)) rBans.push(r);
    }

    setBlueBans(bBans);
    setRedBans(rBans);
    setUserDraftPicks({ Top: '', Jng: '', Mid: '', Bot: '', Sup: '' });
    setEnemyDraftPicks({ Top: '', Jng: '', Mid: '', Bot: '', Sup: '' });
    setCurrentDraftRole('Top');
    setCurrentDraftStep(0);
    
    // Auto-select first champion of Top
    const topChamps = LOL_CHAMPIONS.filter(c => c.role === 'Top');
    setSelectedChampName(topChamps[0]?.name || 'Aatrox');
    setDraftPhaseActive(true);
    setDraftingActive(true);
    setActiveMatch(null);
  };

  // Skip simulation straight to outcome
  const handleSkipSimulation = () => {
    if (activeMatch) {
      setLogIndex(activeMatch.logs.length);
      setIsPlaying(false);
      const isWinner = activeMatch.userScore > activeMatch.enemyScore;
      setActiveMatch(prev => prev ? { ...prev, status: isWinner ? 'won' : 'lost' } : null);
    }
  };

  // Tick the play-by-plays timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && activeMatch && logIndex < activeMatch.logs.length) {
      interval = setInterval(() => {
        setLogIndex(prev => prev + 1);
      }, 3000); // 3 seconds per high-stakes play for ultimate timing
    } else if (activeMatch && activeMatch.status === 'playing' && logIndex === activeMatch.logs.length) {
      setIsPlaying(false);
      const isWinner = activeMatch.userScore > activeMatch.enemyScore;
      setActiveMatch(prev => prev ? { ...prev, status: isWinner ? 'won' : 'lost' } : null);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeMatch, logIndex]);

  // Infinite scroll
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logIndex]);

  // Stage advancement
  const handleAdvance = () => {
    if (!activeMatch) return;
    const won = activeMatch.status === 'won';

    if (won) {
      setWins(prev => prev + 1);
      if (currentStage === 'quarter') {
        setCurrentStage('semi');
        setActiveMatch(null);
      } else if (currentStage === 'semi') {
        setCurrentStage('final');
        setActiveMatch(null);
      } else if (currentStage === 'final') {
        setCurrentStage('completed');
        setActiveMatch(null);
      }
    } else {
      setCurrentStage('failed');
      setActiveMatch(null);
    }
  };

  // Lock selected champion pick in manual draft
  const handleLockPick = () => {
    const roleOrder: Role[] = ['Top', 'Jng', 'Mid', 'Bot', 'Sup'];
    
    // Save user pick
    const nextUserDraft = { ...userDraftPicks, [currentDraftRole]: selectedChampName };
    setUserDraftPicks(nextUserDraft);

    // Save corresponding enemy pick
    const roleChamps = LOL_CHAMPIONS.filter(c => c.role === currentDraftRole && c.name !== selectedChampName);
    const randomEnemyPick = roleChamps[Math.floor(getSecureRandom() * roleChamps.length)]?.name || 'Aatrox';
    const nextEnemyDraft = { ...enemyDraftPicks, [currentDraftRole]: randomEnemyPick };
    setEnemyDraftPicks(nextEnemyDraft);

    // Advance to next draft role
    const currIdx = roleOrder.indexOf(currentDraftRole);
    if (currIdx < 4) {
      const nextRole = roleOrder[currIdx + 1];
      setCurrentDraftRole(nextRole);
      
      // Auto-select first champion of the incoming role
      const nextChamps = LOL_CHAMPIONS.filter(c => c.role === nextRole);
      setSelectedChampName(nextChamps[0]?.name || '');
    } else {
      // Finished all 5 roles!
      // Simply complete sequence by enabling confirmation state
    }
  };

  // Complete drafting automatically
  const handleAutoDraftAll = () => {
    const roles: Role[] = ['Top', 'Jng', 'Mid', 'Bot', 'Sup'];
    const finalUser: Record<Role, string> = { Top: '', Jng: '', Mid: '', Bot: '', Sup: '' };
    const finalEnemy: Record<Role, string> = { Top: '', Jng: '', Mid: '', Bot: '', Sup: '' };

    roles.forEach(role => {
      const available = LOL_CHAMPIONS.filter(c => c.role === role);
      const userPick = available[Math.floor(getSecureRandom() * available.length)]?.name || 'Aatrox';
      finalUser[role] = userPick;

      const remaining = available.filter(c => c.name !== userPick);
      const enemyPick = remaining[Math.floor(getSecureRandom() * remaining.length)]?.name || 'Jax';
      finalEnemy[role] = enemyPick;
    });

    setUserDraftPicks(finalUser);
    setEnemyDraftPicks(finalEnemy);
    setCurrentDraftRole('Sup'); // Set role to Sup to mark draft complete
    setCurrentDraftStep(5);
    setDraftingActive(false);
  };

  // Fire match launching simulation with the drafted teams
  const handleConfirmDraftAndPlay = () => {
    if (!selectedOpponents) return;
    
    let opponent = selectedOpponents.quarter;
    if (currentStage === 'semi') {
      opponent = selectedOpponents.semi;
    } else if (currentStage === 'final') {
      opponent = selectedOpponents.final;
    }

    setDraftPhaseActive(false);
    prepareAndLaunchMatch(currentStage, opponent, userDraftPicks, enemyDraftPicks);
  };

  const getStageTitlePortuguese = (stage: string) => {
    switch (stage) {
      case 'quarter': return 'Quartas de Final';
      case 'semi': return 'Semifinais';
      case 'final': return 'Grande Final';
      default: return stage;
    }
  };

  const handleDownloadCampaignImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient (Hextech Blue/Navy theme)
    const gradient = ctx.createLinearGradient(0, 0, 600, 800);
    gradient.addColorStop(0, '#0a1424');
    gradient.addColorStop(1, '#020610');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Dynamic metallic gold theme colors
    const goldColor = '#c89b3c';
    const darkGold = '#7a5c29';
    const blueColor = '#00cfbc';
    
    // Draw outer single gold border
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, 570, 770);

    // Draw inner thin gold border
    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 560, 760);

    // Banner Header text
    ctx.fillStyle = goldColor;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★  CBLOL DRAFT ARENA  ★', 300, 50);

    // Title divider line
    ctx.strokeStyle = 'rgba(200, 155, 60, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 70);
    ctx.lineTo(550, 70);
    ctx.stroke();

    // Team Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold italic 24px sans-serif';
    ctx.fillText(userTeamName.toUpperCase(), 300, 110);

    // Outcome Badge background
    const isChampion = currentStage === 'completed';
    ctx.fillStyle = isChampion ? 'rgba(200, 155, 60, 0.15)' : 'rgba(244, 63, 94, 0.15)';
    ctx.strokeStyle = isChampion ? goldColor : '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(100, 140, 400, 60, 8);
    } else {
      ctx.rect(100, 140, 400, 60);
    }
    ctx.fill();
    ctx.stroke();

    // Outcome Badge text
    ctx.fillStyle = isChampion ? goldColor : '#f43f5e';
    ctx.font = 'bold italic 22px sans-serif';
    ctx.fillText(isChampion ? 'CAMPEÃO DO CBLOL 🏆' : 'ELIMINADO DO TORNEIO', 300, 178);

    // Stats indicator
    ctx.fillStyle = '#a09b8c';
    ctx.font = '14px monospace';
    ctx.fillText(`Campanha: ${wins} ${wins === 1 ? 'Vitória' : 'Vitórias'} em 3 rodadas`, 300, 235);

    // Separator line
    ctx.strokeStyle = 'rgba(200, 155, 60, 0.15)';
    ctx.beginPath();
    ctx.moveTo(100, 260);
    ctx.lineTo(500, 260);
    ctx.stroke();

    // Lineup Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('ESCADA DE JOGADORES SELECIONADOS', 300, 295);

    // List 5 lanes with details
    const lanes: Role[] = ['Top', 'Jng', 'Mid', 'Bot', 'Sup'];
    const laneLabels = {
      Top: 'ROTA SUPERIOR (TOP)',
      Jng: 'CAÇADOR (JUNGLE)',
      Mid: 'ROTA DO MEIO (MID)',
      Bot: 'ATIRADOR (BOT)',
      Sup: 'SUPORTE (SUP)'
    };

    lanes.forEach((lane, i) => {
      const card = squad[lane];
      const champ = userDraftPicks[lane] || 'Sem Pick';
      const yPos = 345 + i * 75;

      // Card sub-container background
      ctx.fillStyle = 'rgba(1, 10, 19, 0.6)';
      ctx.strokeStyle = 'rgba(200, 155, 60, 0.1)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(60, yPos - 22, 480, 54, 4);
      } else {
        ctx.rect(60, yPos - 22, 480, 54);
      }
      ctx.fill();
      ctx.stroke();

      // Lane identifier
      ctx.fillStyle = goldColor;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(laneLabels[lane], 80, yPos - 5);

      // Player name & overall
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      const playerText = card ? `${card.nickname} (${card.overall} OVR)` : 'Sem Jogador';
      ctx.fillText(playerText, 80, yPos + 18);

      // Champion Pick
      ctx.fillStyle = blueColor;
      ctx.font = 'bold italic 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`as ${champ}`, 520, yPos + 11);
    });

    // Outer attribution footer
    ctx.fillStyle = '#a09b8c';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Monte seu elenco e dispute em ai.studio/build', 300, 740);
    ctx.fillStyle = 'rgba(200, 155, 60, 0.4)';
    ctx.fillText('★  GERADO COM SUCESSO  ★', 300, 760);

    // Trigger download
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userTeamName.replace(/\s+/g, '_')}_CBLOL_Campanha.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCampaignText = () => {
    const isChampion = currentStage === 'completed';
    const statusText = isChampion ? 'CAMPEÃO DO CBLOL! 🏆' : 'Eliminado do Torneio';
    const textToCopy = `🎮 CBLOL Draft Arena | Meu Elenco: ${userTeamName.toUpperCase()}
🏆 Resultado Final: ${statusText} (${wins} ${wins === 1 ? 'Vitória' : 'Vitórias'} em 3 rodadas!)

🛡️ Top: ${squad.Top?.nickname || 'Ninguém'} (${squad.Top?.overall || 0} OVR) - Pick: ${userDraftPicks.Top || 'Sem Pick'}
⚡ Jng: ${squad.Jng?.nickname || 'Ninguém'} (${squad.Jng?.overall || 0} OVR) - Pick: ${userDraftPicks.Jng || 'Sem Pick'}
⚔️ Mid: ${squad.Mid?.nickname || 'Ninguém'} (${squad.Mid?.overall || 0} OVR) - Pick: ${userDraftPicks.Mid || 'Sem Pick'}
🔥 Bot: ${squad.Bot?.nickname || 'Ninguém'} (${squad.Bot?.overall || 0} OVR) - Pick: ${userDraftPicks.Bot || 'Sem Pick'}
💖 Sup: ${squad.Sup?.nickname || 'Ninguém'} (${squad.Sup?.overall || 0} OVR) - Pick: ${userDraftPicks.Sup || 'Sem Pick'}

Monte seu próprio time lendário do CBLOL e dispute o título! O RIFT ESPERA POR VOCÊ! 🚀`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }).catch(err => {
      console.error('Falha ao copiar texto: ', err);
    });
  };

  const handleWebShare = () => {
    const isChampion = currentStage === 'completed';
    const statusText = isChampion ? 'CAMPEÃO DO CBLOL! 🏆' : 'Eliminado do Torneio';
    const textToCopy = `🎮 CBLOL Draft Arena | Meu Elenco: ${userTeamName.toUpperCase()}
🏆 Resultado Final: ${statusText} (${wins} ${wins === 1 ? 'Vitória' : 'Vitórias'} em 3 rodadas!)`;

    if (navigator.share) {
      navigator.share({
        title: 'CBLOL Draft Arena',
        text: textToCopy,
        url: window.location.href
      }).catch(err => console.error(err));
    }
  };

  const getCurrentOpponent = (): OpponentTeam | null => {
    if (!selectedOpponents) return null;
    if (currentStage === 'quarter') return selectedOpponents.quarter;
    if (currentStage === 'semi') return selectedOpponents.semi;
    if (currentStage === 'final') return selectedOpponents.final;
    return null;
  };

  const opponent = getCurrentOpponent();

  // Active role drafting choices
  const candidateChampions = LOL_CHAMPIONS.filter(c => c.role === currentDraftRole);
  const currentDraftPlayer = squad[currentDraftRole];

  // Check if draft has been completed (meaning and all 5 picked slots are filled)
  const isDraftComplete = Object.values(userDraftPicks).every(val => val !== '');

  return (
    <div className="w-full flex flex-col gap-6" id="tournament-view">
      {/* HEADER CONTROLS */}
      <div className="bg-[#010a13] border border-[#c89b3c]/35 rounded p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 relative">
        <button
          onClick={() => onExitTournament('Não disputou')}
          className="flex items-center gap-2 text-xs font-bold text-[#a09b8c] hover:text-[#f0e6d2] uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar pro Draft
        </button>

        <h2 className="text-xl font-serif font-bold italic text-white tracking-tight text-center sm:text-left flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#c89b3c]" />
          Simulador do Campeonato CBLOL
        </h2>
        <div className="text-xs bg-[#c89b3c]/15 text-[#c89b3c] px-3.5 py-1.5 rounded font-mono border border-[#c89b3c]/30 font-bold uppercase tracking-wider">
          Fase de Disputa & Champions Draft
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TOURNAMENT BRACKET VISUAL PROGRESS */}
        <div className="bg-[#050608] border border-[#c89b3c]/25 rounded p-6 flex flex-col gap-6 h-fit">
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#c89b3c] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#c89b3c]" />
            Chaves do Torneio
          </span>

          <div className="flex flex-col gap-4 relative mt-2 font-mono text-xs">
            {/* Connector vertical lines */}
            <div className="absolute left-[20px] top-4 bottom-4 w-[1px] bg-[#c89b3c]/20 pointer-events-none" />

            {/* QUARTERS ROW */}
            <div className="flex gap-4 items-center relative z-10">
              <div className={`
                w-10 h-10 rounded bg-[#1e2328] border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0
                ${currentStage === 'quarter' ? 'border-[#c89b3c] text-[#c89b3c] bg-[#c89b3c]/10 animate-pulse' : ''}
                ${currentStage === 'semi' || currentStage === 'final' || currentStage === 'completed' ? 'border-[#00cfbc] text-[#00cfbc]' : 'border-neutral-800 text-neutral-600'}
              `}>
                1/4
              </div>
              <div className="flex-1 bg-[#010a13] border border-[#c89b3c]/15 p-3 rounded">
                <span className="text-[9px] text-[#a09b8c] font-bold block uppercase font-sans tracking-wide">Quartas de Final</span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  {selectedOpponents?.quarter.name || "Adversário sorteado"}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono block">Overs: {selectedOpponents?.quarter.power} OVR • Coach: {selectedOpponents?.quarter.coach}</span>
              </div>
            </div>

            {/* SEMIS ROW */}
            <div className="flex gap-4 items-center relative z-10">
              <div className={`
                w-10 h-10 rounded bg-[#1e2328] border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0
                ${currentStage === 'semi' ? 'border-[#c89b3c] text-[#c89b3c] bg-[#c89b3c]/10 animate-pulse' : ''}
                ${currentStage === 'final' || currentStage === 'completed' ? 'border-[#00cfbc] text-[#00cfbc]' : 'border-neutral-800 text-neutral-600'}
              `}>
                1/2
              </div>
              <div className="flex-1 bg-[#010a13] border border-[#c89b3c]/15 p-3 rounded">
                <span className="text-[9px] text-[#a09b8c] font-bold block uppercase font-sans tracking-wide">Semifinais</span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  {selectedOpponents?.semi.name || "A definir"}
                </span>
                {selectedOpponents && (
                  <span className="text-[9px] text-zinc-500 font-mono block">Overs: {selectedOpponents.semi.power} OVR • Coach: {selectedOpponents.semi.coach}</span>
                )}
              </div>
            </div>

            {/* GRAND FINALS ROW */}
            <div className="flex gap-4 items-center relative z-10">
              <div className={`
                w-10 h-10 rounded bg-[#1e2328] border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0
                ${currentStage === 'final' ? 'border-[#c89b3c] text-[#c89b3c] bg-[#c89b3c]/10 animate-pulse' : ''}
                ${currentStage === 'completed' ? 'border-[#00cfbc] text-[#00cfbc]' : 'border-neutral-800 text-neutral-600'}
              `}>
                FIN
              </div>
              <div className="flex-1 bg-[#010a13] border border-[#c89b3c]/15 p-3 rounded">
                <span className="text-[9px] text-[#a09b8c] font-bold block uppercase font-sans tracking-wide">Grande Final</span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  {selectedOpponents?.final.name || "A definir"}
                </span>
                {selectedOpponents && (
                  <span className="text-[9px] text-zinc-500 font-mono block">Overs: {selectedOpponents.final.power} OVR • Coach: {selectedOpponents.final.coach}</span>
                )}
              </div>
            </div>
          </div>

          {/* ACTIVE DISPUTE TRIGGER PANEL */}
          {!draftPhaseActive && activeMatch === null && currentStage !== 'completed' && currentStage !== 'failed' && (
            <div className="mt-6 bg-[#010a13] border-2 border-dashed border-[#c89b3c]/30 p-4 rounded text-center flex flex-col gap-4 font-sans justify-center">
              <span className="text-xs text-[#a09b8c] leading-relaxed">
                Você chegou até as <strong className="text-white font-semibold">{getStageTitlePortuguese(currentStage)}</strong> contra a equipe do <strong className="text-amber-300 font-semibold">{opponent?.name}</strong>.
              </span>
              <button
                id="btn-trigger-match"
                onClick={handleStartMatch}
                className="bg-[#c89b3c] hover:bg-[#c89b3c]/80 text-[#050608] py-3.5 px-5 rounded font-black text-xs uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.03] cursor-pointer shadow-lg hover:shadow-[#c89b3c]/20"
              >
                COMEÇAR SELEÇÃO DE CAMPEÕES (DRAFT)
              </button>
            </div>
          )}

          {/* CHAMPIONSHIP CONCLUDED */}
          {currentStage === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-[#c89b3c]/10 border border-[#c89b3c]/40 p-5 rounded text-center flex flex-col gap-3 relative overflow-hidden font-sans"
            >
              <Trophy className="w-12 h-12 text-[#c89b3c] mx-auto animate-bounce mt-1" />
              <h4 className="text-lg font-serif font-bold italic text-[#c89b3c] uppercase leading-none">CAMPEÃO DO CBLOL!</h4>
              <p className="text-xs text-[#a09b8c] leading-relaxed">
                O seu time consagra-se como o maior elenco já montado no cenário nacional. Erga o troféu lendário de campeão!
              </p>
              <button
                onClick={() => onExitTournament('Campeão')}
                className="bg-[#c89b3c] hover:bg-[#c89b3c]/80 text-[#050608] font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded cursor-pointer mt-2 w-full transition-transform hover:scale-[1.02]"
              >
                Salvar Campanha no Trophy Case
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="bg-transparent border border-[#c89b3c] hover:bg-[#c89b3c]/10 text-[#c89b3c] font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded cursor-pointer w-full transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar Desempenho
              </button>
            </motion.div>
          )}

          {/* ELIMINATED STATEMENT COCH PILL */}
          {currentStage === 'failed' && (
            <div className="mt-6 bg-rose-500/10 border border-rose-500/30 p-5 rounded text-center flex flex-col gap-3 font-sans">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
              <h4 className="text-lg font-serif font-bold italic text-rose-400 uppercase leading-none">ELIMINADO!</h4>
              <p className="text-xs text-[#a09b8c] leading-relaxed">
                Lamentável! Seu elenco lutou bravamente no Rift, mas a estratégia adversária prevaleceu dessa vez.
              </p>
              <button
                onClick={() => onExitTournament('Eliminado')}
                className="bg-rose-500 hover:bg-rose-400 text-white font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded cursor-pointer mt-2 w-full transition-colors"
              >
                Sair do Torneio
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="bg-transparent border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 font-bold uppercase tracking-widest text-xs py-2.5 px-4 rounded cursor-pointer w-full transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar Desempenho
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE MATCH SIMULATOR OR ACTIVE CHAMPIONS DRAFT SELECTION LOBBY */}
        <div className="lg:col-span-2 bg-[#050608] border border-[#c89b3c]/25 rounded flex flex-col min-h-[580px] relative overflow-hidden font-sans">
          
          {draftPhaseActive ? (
            /* ========================================================= */
            /* CHAMPIONS DRAFT SELECTION MODE                            */
            /* ========================================================= */
            <div className="flex-1 flex flex-col justify-between p-6 bg-[#020509] relative">
              
              {/* Draft background decoration */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

              {/* DRAFT HEADER BAN STATUS */}
              <div className="border-b border-[#c89b3c]/25 pb-4 mb-4 flex flex-col gap-2 z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Champions Pick & Ban</span>
                  </div>
                  <button
                    onClick={handleAutoDraftAll}
                    className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold font-mono uppercase px-2.5 py-1 rounded hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    Draft Automático (Random)
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1 sm:mt-0">
                  {/* Blue Side Bans (3 bans) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide">Bans Azuis:</span>
                    <div className="flex gap-1.5">
                      {blueBans.map((ban, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-950/40 text-rose-400 border border-rose-500/30 text-[9px] font-mono rounded line-through">
                          {ban}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Red Side Bans (3 bans) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#f23c52] uppercase tracking-wide">Bans Vermelhos:</span>
                    <div className="flex gap-1.5">
                      {redBans.map((ban, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-950/40 text-rose-400 border border-rose-500/30 text-[9px] font-mono rounded line-through">
                          {ban}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* DRAFT PICK SIDE BY SIDE BOARDS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 z-10 items-stretch">
                
                {/* Your Blue Squad Picks (Left Col) */}
                <div className="md:col-span-3 flex flex-col gap-2.5 bg-black/40 p-3 rounded border border-sky-500/10">
                  <span className="text-[10px] font-bold text-[#00cfbc] uppercase tracking-widest text-center block mb-1">
                    {userTeamName}
                  </span>
                  
                  {['Top', 'Jng', 'Mid', 'Bot', 'Sup'].map((roleStr) => {
                    const r = roleStr as Role;
                    const card = squad[r];
                    const selectedChamp = userDraftPicks[r];
                    const RoleIcon = ROLE_ICONS[r];
                    const isCurrent = currentDraftRole === r && !isDraftComplete;

                    return (
                      <div 
                        key={r} 
                        className={`p-2 rounded border transition-all text-xs flex items-center justify-between
                          ${isCurrent ? 'bg-sky-500/10 border-sky-400' : 'bg-[#010a13] border-neutral-800'}
                        `}
                      >
                        <div className="flex items-center gap-1.5">
                          <RoleIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-sky-400 animate-pulse' : 'text-neutral-500'}`} />
                          <div className="flex flex-col">
                            <span className="text-[8px] text-zinc-500 font-mono tracking-wider font-bold uppercase">{r}</span>
                            <span className="font-bold text-white max-w-[80px] truncate">{card?.nickname || 'Recrutando'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          {selectedChamp ? (
                            <span className="text-[10px] text-sky-300 font-semibold bg-sky-950/30 px-2 py-0.5 rounded border border-sky-500/20 font-sans block">
                              {selectedChamp}
                            </span>
                          ) : (
                            <span className={`text-[9px] font-mono block ${isCurrent ? 'text-sky-400 animate-pulse font-bold' : 'text-zinc-600'}`}>
                              {isCurrent ? 'Picks...' : 'Aguardando'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Main Interactive Selector (Middle Column) */}
                <div className="md:col-span-6 bg-[#03070d] border border-amber-500/15 rounded p-4 flex flex-col justify-between min-h-[350px]">
                  {!isDraftComplete ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                      {/* Loading spinner with Swords logo */}
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-[#c89b3c]/20 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 animate-spin" style={{ animationDuration: '1.2s' }} />
                        <Swords className="w-6 h-6 text-amber-400" />
                      </div>

                      <div className="flex flex-col gap-1.5 max-w-sm">
                        <h3 className="text-white font-bold tracking-wide uppercase text-sm font-mono flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                          Simulando Draft CBLOL
                        </h3>
                        <p className="text-[11px] text-[#a09b8c] leading-relaxed">
                          Nossos analistas táticos estão analisando estatísticas históricas para selecionar campeões ideais compatíveis com a rota de cada jogador.
                        </p>
                      </div>

                      {/* Live Action/Sinergy logs */}
                      <div className="w-full bg-[#070b12] p-4 rounded border border-amber-500/15 text-left font-mono">
                        <span className="text-[9px] text-[#c89b3c] font-black uppercase tracking-widest block mb-1">
                          Telemetria em Tempo Real • Rota: {currentDraftRole}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-stone-300 font-sans">
                            Conectando escolha de campeão compatível para <strong className="text-white">{squad[currentDraftRole]?.nickname || 'Jogador'}</strong>...
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] text-zinc-500 border-t border-neutral-800/85 pt-1.5 font-sans italic leading-normal">
                          {currentDraftRole === 'Top' && "Rota Superior: Foco em tanques pesados e lutadores de investida (split-push)."}
                          {currentDraftRole === 'Jng' && "Selva: Foco em caçadores com controle de objetivos mundiais e iniciação."}
                          {currentDraftRole === 'Mid' && "Rota do Meio: Foco em magos de controle de grupo e assassinos explosivos."}
                          {currentDraftRole === 'Bot' && "Atirador: Foco em campeões de dano constante por segundo a longa distância."}
                          {currentDraftRole === 'Sup' && "Suporte: Foco em protetores ou pilares de engajamento do time."}
                        </div>
                      </div>

                      {/* Skip/Auto-draft button */}
                      <button
                        onClick={handleAutoDraftAll}
                        className="w-full mt-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono tracking-widest uppercase p-3 rounded transition-all cursor-pointer shadow-md"
                      >
                        Pular Animação (Draft Rápido)
                      </button>
                    </div>
                  ) : (
                    /* ======================================================== */
                    /* DECLARED LOBBY COMPLETE: ALL PICKS CHOSEN SUMMARY      */
                    /* ======================================================== */
                    <div className="flex-1 flex flex-col justify-between items-center text-center py-6 h-full font-sans">
                      <div className="flex flex-col gap-1 items-center">
                        <Sparkles className="w-10 h-10 text-amber-400 animate-bounce" />
                        <h4 className="text-sm font-serif font-bold italic text-white uppercase tracking-wider mt-2">DRAFT CONCLUÍDO!</h4>
                        <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                          Conselho técnico de draft finalizado com sucesso! Ambas as equipes selecionaram seus campeões de ofício e traçaram suas táticas para a batalha.
                        </p>
                      </div>

                      <div className="bg-[#0c0f13] border border-[#c89b3c]/20 rounded p-4 text-xs w-full max-w-xs mt-2 text-left shadow-lg">
                        <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest block border-b border-neutral-800 pb-1 mb-2">Composição do Rift</span>
                        <div className="flex flex-col gap-1.5 font-mono text-[10px] text-[#a09b8c]">
                          <span className="flex justify-between"><span>• Topo:</span> <span className="text-stone-300 font-semibold">{userDraftPicks.Top} <span className="text-zinc-600">vs</span> {enemyDraftPicks.Top}</span></span>
                          <span className="flex justify-between"><span>• Selva:</span> <span className="text-stone-300 font-semibold">{userDraftPicks.Jng} <span className="text-zinc-600">vs</span> {enemyDraftPicks.Jng}</span></span>
                          <span className="flex justify-between"><span>• Meio:</span> <span className="text-stone-300 font-semibold">{userDraftPicks.Mid} <span className="text-zinc-600">vs</span> {enemyDraftPicks.Mid}</span></span>
                          <span className="flex justify-between"><span>• Atirador:</span> <span className="text-stone-300 font-semibold">{userDraftPicks.Bot} <span className="text-zinc-600">vs</span> {enemyDraftPicks.Bot}</span></span>
                          <span className="flex justify-between"><span>• Suporte:</span> <span className="text-stone-300 font-semibold">{userDraftPicks.Sup} <span className="text-zinc-600">vs</span> {enemyDraftPicks.Sup}</span></span>
                        </div>
                      </div>

                      <button
                        onClick={handleConfirmDraftAndPlay}
                        className="w-full bg-[#c89b3c] hover:bg-[#c89b3c]/85 text-[#050608] font-black text-xs py-3.5 rounded tracking-widest uppercase cursor-pointer transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 mt-4 outline-none"
                      >
                        INICIAR ENFRENTAMENTO NO RIFT
                      </button>
                    </div>
                  )}
                </div>

                {/* Opponent Red Squad Picks (Right Col) */}
                <div className="md:col-span-3 flex flex-col gap-2.5 bg-black/40 p-3 rounded border border-rose-500/10">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center block mb-1 truncate">
                    {opponent?.name || "Adversário"}
                  </span>
                  
                  {['Top', 'Jng', 'Mid', 'Bot', 'Sup'].map((roleStr) => {
                    const r = roleStr as Role;
                    const selectedEnemyChamp = enemyDraftPicks[r];
                    const RoleIcon = ROLE_ICONS[r];
                    const isDrafted = selectedEnemyChamp !== '';

                    return (
                      <div 
                        key={r} 
                        className={`p-2 rounded border transition-all text-xs flex items-center justify-between bg-[#010a13] border-neutral-800`}
                      >
                        <div className="flex items-center gap-1.5">
                          <RoleIcon className={`w-3.5 h-3.5 text-rose-500/60`} />
                          <div className="flex flex-col">
                            <span className="text-[8px] text-zinc-500 font-mono tracking-wider font-bold uppercase">{r}</span>
                            <span className="font-bold text-white">Inimigo {r}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          {isDrafted ? (
                            <span className="text-[10px] text-rose-400 font-semibold bg-rose-950/20 px-2 py-0.5 rounded border border-rose-500/20 font-sans block">
                              {selectedEnemyChamp}
                            </span>
                          ) : (
                            <span className="text-[9px] text-[#a09b8c]/40 font-mono block animate-pulse">
                              ...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* OUTCOME BOX INTERIOR FOOTER CANNOT MOVE */}
              <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-xs text-neutral-500 z-10 font-mono">
                <span>Acompanhe a simulação de picks compatíveis por lane</span>
                <span className="text-amber-500/80">Draft Lobby • CBLOL</span>
              </div>

            </div>
          ) : activeMatch ? (
            /* ========================================================= */
            /* GAME COMMONTATOR PLAY BY PLAY                             */
            /* ========================================================= */
            <>
              {/* PLAYING HUB BAR */}
              <div className="bg-[#010a13] px-5 py-4 border-b border-[#c89b3c]/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#c89b3c] font-bold uppercase tracking-wider leading-none font-mono">
                      Simulação Ativa
                    </span>
                    <span className="text-sm font-serif font-bold italic text-white uppercase mt-1">
                      {activeMatch.stage === 'Quarterfinals' && 'Quartas de Final'}
                      {activeMatch.stage === 'Semifinals' && 'Semifinais'}
                      {activeMatch.stage === 'Grand Finals' && 'Grande Final'}
                    </span>
                  </div>
                </div>

                {/* Score panel */}
                <div className="flex items-center gap-4 bg-[#050608] px-4 py-1.5 rounded border border-[#c89b3c]/20 font-mono">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-[#a09b8c] uppercase font-sans">Seu Time</span>
                    <span className="text-lg font-bold text-[#00cfbc]">
                      {logIndex > 0 ? (logIndex >= activeMatch.logs.length ? activeMatch.userScore : Math.round(activeMatch.userScore * (logIndex / activeMatch.logs.length))) : 0}
                    </span>
                  </div>
                  <span className="text-[#a09b8c] font-bold font-sans">vs</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-[#a09b8c] uppercase truncate max-w-[80px] font-sans">{activeMatch.enemyTeam}</span>
                    <span className="text-lg font-bold text-rose-500">
                      {logIndex > 0 ? (logIndex >= activeMatch.logs.length ? activeMatch.enemyScore : Math.round(activeMatch.enemyScore * (logIndex / activeMatch.logs.length))) : 0}
                    </span>
                  </div>
                </div>

                {/* Rapid controllers */}
                {activeMatch.status === 'playing' && (
                  <button
                    onClick={handleSkipSimulation}
                    className="flex items-center gap-1.5 text-xs text-[#c89b3c] hover:text-white px-4 py-1.5 rounded border border-[#c89b3c]/30 bg-[#050608] hover:bg-[#c89b3c]/10 transition-colors uppercase tracking-widest font-bold cursor-pointer font-mono shadow-sm"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    Pular
                  </button>
                )}
              </div>

              {/* TIMELINE COMMENTARY ACTION LIST */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 font-mono select-none bg-[#050608]">
                {activeMatch.logs.slice(0, logIndex).map((log, index) => {
                  const getLogColor = (type: string) => {
                    switch (type) {
                      case 'kill': return 'text-rose-400 bg-rose-500/5 border-rose-500/15';
                      case 'objective': return 'text-[#00cfbc] bg-[#00cfbc]/5 border-[#00cfbc]/15';
                      case 'outcome': return 'text-[#c89b3c] bg-[#c89b3c]/5 border-[#c89b3c]/20';
                      case 'action': return 'text-sky-400 bg-sky-500/5 border-sky-500/15';
                      default: return 'text-[#a09b8c] bg-[#1e2328]/40 border-neutral-800/40';
                    }
                  };

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3.5 rounded border text-xs leading-relaxed flex items-start gap-3 ${getLogColor(log.type)}`}
                    >
                      <span className="opacity-50 text-[10px] font-bold bg-black/45 px-1.5 py-0.5 rounded shrink-0 font-mono">
                        {log.minute}'
                      </span>
                      <p className="flex-1 font-sans">{log.text}</p>
                    </motion.div>
                  );
                })}
                <div ref={logsEndRef} />
              </div>

              {/* BOTTOM OUTCOME BAR */}
              <AnimatePresence>
                {activeMatch.status !== 'playing' && (
                  <motion.div
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    className={`p-5 border-t flex justify-between items-center z-10 bg-[#010a13]
                      ${activeMatch.status === 'won' ? 'border-[#00cfbc]/30 bg-[#00cfbc]/5' : 'border-rose-500/30 bg-rose-950/20'}
                    `}
                  >
                    <div>
                      <span className={`text-sm font-bold uppercase block tracking-wider
                        ${activeMatch.status === 'won' ? 'text-[#00cfbc]' : 'text-rose-400'}
                      `}>
                        {activeMatch.status === 'won' ? 'Partida Encerrada - VITÓRIA!' : 'Partida Encerrada - DERROTA!'}
                      </span>
                    </div>

                    <button
                      id="btn-next-stage"
                      onClick={handleAdvance}
                      className={`font-bold uppercase tracking-widest text-xs py-3 px-6 rounded transition-transform hover:scale-[1.02] cursor-pointer shadow-lg font-mono
                        ${activeMatch.status === 'won'
                          ? 'bg-[#c89b3c] text-[#050608] hover:bg-[#c89b3c]/85'
                          : 'bg-rose-600 text-white hover:bg-rose-500'
                        }
                      `}
                    >
                      {activeMatch.status === 'won' ? 'Avançar no Campeonato' : 'Voltar ao Menu'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : currentStage === 'completed' ? (
            /* ========================================================= */
            /* CHAMPIONSHIP COMPLETED SCREEN SUMMARY                     */
            /* ========================================================= */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6 bg-gradient-to-b from-[#010a13] to-[#04111d] relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c89b3c]/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="w-20 h-20 rounded-full bg-[#c89b3c]/10 border-2 border-[#c89b3c] flex items-center justify-center text-[#c89b3c] shadow-lg shadow-[#c89b3c]/20 animate-pulse">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>

              <div className="flex flex-col gap-2 max-w-md">
                <span className="text-xs text-[#c89b3c] font-bold uppercase tracking-[0.2em] font-mono">
                  Campanha Gloriosa Concluída
                </span>
                <h3 className="text-2xl font-serif font-bold italic text-white uppercase tracking-tight">
                  {userTeamName}
                </h3>
                <p className="text-xs text-[#a09b8c] leading-relaxed">
                  História feita! Seu elenco resistiu à pressão extrema do draft, dominou as quartas, semis e a grande final, consagrando-se como os campeões indiscutíveis do CBLOL!
                </p>
              </div>

              <div className="bg-[#050608]/90 border border-[#c89b3c]/30 rounded p-4 text-left font-mono text-xs w-full max-w-sm shadow-inner flex flex-col gap-2.5">
                <div className="flex justify-between border-b border-white/5 pb-1 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                  <span>Estatísticas da Campanha</span>
                  <span className="text-[#c89b3c]">Sucesso de 100%</span>
                </div>
                <div className="flex justify-between items-center text-stone-200">
                  <span>Partidas Disputadas:</span>
                  <span className="font-bold text-white">3 / 3</span>
                </div>
                <div className="flex justify-between items-center text-stone-200">
                  <span>Vitórias Conquistadas:</span>
                  <span className="font-bold text-[#00cfbc] flex items-center gap-1">3 <Trophy className="w-3 h-3 text-[#c89b3c]" /></span>
                </div>
                <div className="flex justify-between items-center text-stone-200">
                  <span>Entrosamento da Composição:</span>
                  <span className="font-bold text-amber-400">Excelente</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex-1 bg-[#c89b3c] hover:bg-[#c89b3c]/85 text-[#050608] py-2.5 rounded font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
                <button
                  onClick={() => onExitTournament('Campeão')}
                  className="flex-1 bg-transparent hover:bg-white/5 text-white border border-neutral-700 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Voltar ao Menu
                </button>
              </div>
            </div>
          ) : currentStage === 'failed' ? (
            /* ========================================================= */
            /* CHAMPIONSHIP FAILED SCREEN SUMMARY                        */
            /* ========================================================= */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6 bg-[#050608] relative">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-500 shadow-md">
                <AlertTriangle className="w-10 h-10 animate-pulse" />
              </div>

              <div className="flex flex-col gap-2 max-w-md">
                <span className="text-xs text-rose-400 font-bold uppercase tracking-[0.2em] font-mono">
                  Fim de Jornada
                </span>
                <h3 className="text-2xl font-serif font-bold italic text-white uppercase tracking-tight">
                  {userTeamName}
                </h3>
                <p className="text-xs text-[#a09b8c] leading-relaxed">
                  A derrota faz parte do aprendizado dos grandes campeões. Analise seus picks, reestruture sua comissão técnica e tente novamente na Arena de Draft do CBLOL!
                </p>
              </div>

              <div className="bg-[#010a13] border border-neutral-800 rounded p-4 text-left font-mono text-xs w-full max-w-sm shadow-inner flex flex-col gap-2.5">
                <div className="flex justify-between border-b border-white/5 pb-1 text-[#f23c52] text-[10px] uppercase font-bold tracking-wider">
                  <span>Estatísticas da Campanha</span>
                  <span className="text-rose-400">Eliminado</span>
                </div>
                <div className="flex justify-between items-center text-[#a09b8c]">
                  <span>Fase de Parada:</span>
                  <span className="font-bold text-white uppercase">{getStageTitlePortuguese(currentStage)}</span>
                </div>
                <div className="flex justify-between items-center text-[#a09b8c]">
                  <span>Vitórias Totais:</span>
                  <span className="font-bold text-rose-400">{wins} {wins === 1 ? 'Vitória' : 'Vitórias'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex-1 bg-transparent hover:bg-rose-500/15 text-rose-400 border border-rose-500/40 py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
                <button
                  onClick={() => onExitTournament('Eliminado')}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-md font-sans"
                >
                  Voltar ao Menu
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* INACTIVE STAGE LOBBY PREVIEW                              */
            /* ========================================================= */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#a09b8c]/75 gap-4 bg-[#050608]">
              <Play className="w-16 h-16 text-[#c89b3c]/20 stroke-[1.5] animate-pulse" />
              <div className="flex flex-col gap-1 max-w-sm">
                <span className="text-xs text-[#c89b3c] font-bold uppercase tracking-widest font-mono">
                  Nenhuma partida ativa
                </span>
                <p className="text-xs text-[#a09b8c]/60 leading-relaxed mt-1">
                  Clique no botão "COMEÇAR SELEÇÃO DE CAMPEÕES (DRAFT)" na lateral esquerda para simular as escolhas e entrar no Summoner's Rift.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SHARING OUTCOME MODAL OVERLAY */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-[#010a13] border-2 border-[#c89b3c] max-w-2xl w-full rounded-lg shadow-2xl relative overflow-hidden flex flex-col md:flex-row text-neutral-200"
            >
              {/* Left-side decor strip */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#c89b3c]" />

              {/* Close Button top-right */}
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 text-[#a09b8c] hover:text-white font-mono text-xs uppercase cursor-pointer z-10"
              >
                ✕ Fechar
              </button>

              {/* 1. VISUAL CARD PREVIEW */}
              <div className="flex-1 p-6 flex flex-col gap-4 border-r border-[#c89b3c]/20 bg-gradient-to-b from-[#010a13] to-[#04111d]/75">
                <span className="text-[10px] font-mono text-[#c89b3c] block font-black uppercase tracking-widest">★ Preview do Card de Prestígio ★</span>
                <div className="bg-[#050608]/90 border border-[#c89b3c]/30 rounded p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#c89b3c]/40 to-transparent" />
                  
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-[#c89b3c] tracking-widest font-bold uppercase block mb-0.5">CBLOL DRAFT ARENA</span>
                    <h3 className="text-lg font-serif font-bold italic text-white leading-tight uppercase truncate">{userTeamName}</h3>
                  </div>

                  <div className={`py-2 px-3 border rounded text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5
                    ${currentStage === 'completed' ? 'bg-[#c89b3c]/10 border-[#c89b3c]/40 text-[#c89b3c]' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}
                  `}>
                    {currentStage === 'completed' ? (
                      <>
                        <Trophy className="w-3.5 h-3.5 animate-bounce text-[#c89b3c]" />
                        <span>Campeão do CBLOL 🏆</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                        <span>Eliminado do Torneio</span>
                      </>
                    )}
                  </div>

                  <p className="text-[11px] text-[#a09b8c] text-center font-mono font-medium -mt-1.5">
                    Campanha: <span className="text-white font-semibold">{wins} {wins === 1 ? 'Vitória' : 'Vitórias'}</span> em 3 rodadas
                  </p>

                  <div className="flex flex-col gap-2 mt-1">
                    {(['Top', 'Jng', 'Mid', 'Bot', 'Sup'] as Role[]).map((r) => {
                      const card = squad[r];
                      const champ = userDraftPicks[r] || 'Sem Pick';
                      return (
                        <div key={r} className="bg-[#010a13] border border-[#c89b3c]/10 p-2 rounded text-xs flex justify-between items-center font-mono">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-[#c89b3c] font-black uppercase leading-none">{r}</span>
                            <span className="text-white font-sans font-bold mt-1 max-w-[130px] truncate">{card?.nickname || 'Recrutado'}</span>
                          </div>
                          <span className="text-[10px] text-[#00cfbc] bg-[#00cfbc]/5 border border-[#00cfbc]/20 px-2.5 py-0.5 rounded font-semibold italic">
                            as {champ}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. ACTIONS SIDEBAR PANEL */}
              <div className="flex-1 p-6 flex flex-col justify-between gap-6 bg-[#030911]">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-serif font-bold italic text-white tracking-tight uppercase">Compartilhar</h3>
                  <p className="text-xs text-[#a09b8c] leading-relaxed">
                    Baixe uma imagem em alta resolução com o selo de prestígio do CBLOL, ou copie um resumo de texto formatado com os jogadores e seus picks!
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  {/* Action 1: Download Image */}
                  <button
                    onClick={handleDownloadCampaignImage}
                    className="bg-[#c89b3c] hover:bg-[#c89b3c]/85 text-[#050608] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-lg outline-none"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Imagem PNG
                  </button>

                  {/* Action 2: Copy Outline text to clipboard */}
                  <button
                    onClick={handleCopyCampaignText}
                    className="bg-transparent border border-[#c89b3c] hover:bg-[#c89b3c]/10 text-[#c89b3c] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Texto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Resumo em Texto
                      </>
                    )}
                  </button>

                  {/* Action 3: Web Share if possible */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                      onClick={handleWebShare}
                      className="bg-[#00cfbc]/20 hover:bg-[#00cfbc]/30 text-[#00cfbc] border border-[#00cfbc]/40 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Compartilhar no Celular
                    </button>
                  )}
                </div>

                <div className="text-[10px] font-mono text-zinc-550 leading-normal border-t border-neutral-900 pt-3 flex items-center gap-1">
                  <span>★ CBLOL Draft Arena.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
