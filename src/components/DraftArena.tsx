/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerCard, Role, DraftSquad, ChemistryResult } from '../types';
import { PlayerCardWidget } from './PlayerCardWidget';
import { CBLOL_CARDS } from '../data/players';
import { Shield, Zap, Swords, Flame, Heart, Sparkles, RefreshCw, Trophy, AlertCircle, Lock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSecureRandom } from '../utils/draftEngine';

interface DraftArenaProps {
  squad: DraftSquad;
  onSelectPlayer: (role: Role, card: PlayerCard) => void;
  onClearSquad: () => void;
  chemistry: ChemistryResult;
  onStartSimulation: () => void;
}

const ROLE_DETAILS = {
  Top: { name: "Topo (Top)", desc: "Xerife e lutador da rota solo", icon: Shield, color: "text-red-400" },
  Jng: { name: "Caçador (Jungle)", desc: "Orquestrador de ganks e bônus", icon: Zap, color: "text-amber-400" },
  Mid: { name: "Meio (Mid)", desc: "Mago ou assassinos carregadores", icon: Swords, color: "text-indigo-400" },
  Bot: { name: "Atirador (AD Carry)", desc: "Dano físico contínuo de distância", icon: Flame, color: "text-rose-400" },
  Sup: { name: "Suporte", desc: "Controle de grupo e proteção", icon: Heart, color: "text-teal-400" },
};

export const DraftArena: React.FC<DraftArenaProps> = ({
  squad,
  onSelectPlayer,
  onClearSquad,
  chemistry,
  onStartSimulation
}) => {
  const [drawnTeam, setDrawnTeam] = useState<string>('');
  const [drawnSplitName, setDrawnSplitName] = useState<string>('');
  const [drawnPlayers, setDrawnPlayers] = useState<PlayerCard[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rerollsLeft, setRerollsLeft] = useState<number>(2);

  // Helper connection link check
  const getSynergyStatus = (roleA: Role, roleB: Role) => {
    const cardA = squad[roleA];
    const cardB = squad[roleB];
    if (!cardA || !cardB) return { connected: false, text: "", chem: 0 };
    
    let connected = false;
    let textList: string[] = [];
    let chemAdded = 0;

    // Team check
    if (cardA.team === cardB.team) {
      connected = true;
      textList.push(`Org (${cardA.team})`);
      chemAdded += 2;
    }
    // Epoch check
    if (cardA.splitName === cardB.splitName) {
      connected = true;
      textList.push(`Época (${cardA.splitName.replace("CBLOL ", "")})`);
      chemAdded += 3;
    }

    return { connected, text: textList.join(" | "), chem: chemAdded };
  };

  // Extract unique team combos from CBLOL_CARDS to draw randomly
  const rollRandomTeam = (isManual: boolean = false) => {
    if (isManual) {
      if (rerollsLeft <= 0) return;
      setRerollsLeft(prev => prev - 1);
    }
    setIsRolling(true);
    
    setTimeout(() => {
      const uniqueCombos: { team: string; splitName: string }[] = [];
      CBLOL_CARDS.forEach(card => {
        if (!uniqueCombos.some(c => c.team === card.team && c.splitName === card.splitName)) {
          // Exclude the icon tags from base pool names to look standard
          if (!card.id.endsWith("-icon")) {
            uniqueCombos.push({ team: card.team, splitName: card.splitName });
          }
        }
      });

      if (uniqueCombos.length === 0) {
        uniqueCombos.push({ team: "paiN Gaming", splitName: "CBLOL 2015 Split 2" });
      }

      // Pick any random combo
      const randomCombo = uniqueCombos[Math.floor(getSecureRandom() * uniqueCombos.length)];

      // Pull players from this team for all 5 roles
      const roles: Role[] = ['Top', 'Jng', 'Mid', 'Bot', 'Sup'];
      const pickedPlayers: PlayerCard[] = [];

      const squadCards = Object.keys(squad)
        .map(key => squad[key as Role])
        .filter((c): c is PlayerCard => c !== null);

      roles.forEach(role => {
        // Find exact matches
        let candidates = CBLOL_CARDS.filter(
          c => c.role === role && c.team === randomCombo.team && c.splitName === randomCombo.splitName
        );

        // Fallback: any split for that team
        if (candidates.length === 0) {
          candidates = CBLOL_CARDS.filter(c => c.role === role && c.team === randomCombo.team);
        }

        // Fallback: pick any player of this role who is not yet in the squad
        if (candidates.length === 0) {
          candidates = CBLOL_CARDS.filter(
            c => c.role === role && !squadCards.some(s => s.id === c.id)
          );
        }

        // Fallback: any card of that role
        if (candidates.length === 0) {
          candidates = CBLOL_CARDS.filter(c => c.role === role);
        }

        const chosen = candidates[Math.floor(getSecureRandom() * candidates.length)];
        pickedPlayers.push(chosen);
      });

      setDrawnTeam(randomCombo.team);
      setDrawnSplitName(randomCombo.splitName);
      setDrawnPlayers(pickedPlayers);
      setIsRolling(false);
    }, 400);
  };

  // Initial draw trigger safely
  useEffect(() => {
    if (drawnPlayers.length === 0) {
      rollRandomTeam(false);
    }
  }, []);

  // Handle player selection click
  const handleSelectPlayerFromDrawn = (card: PlayerCard) => {
    onSelectPlayer(card.role as Role, card);

    // Calculate future squad count
    const nextSquad = { ...squad, [card.role]: card };
    const filledCount = Object.values(nextSquad).filter(c => c !== null).length;

    // Automatically draw a new team if squad is still incomplete
    if (filledCount < 5) {
      setTimeout(() => {
        rollRandomTeam(false);
      }, 500);
    }
  };

  // Restart handler
  const handleResetDraft = () => {
    onClearSquad();
    setDrawnPlayers([]);
    setRerollsLeft(2);
    setTimeout(() => {
      rollRandomTeam(false);
    }, 150);
  };

  const cardsInSquad = Object.values(squad).filter((c): c is PlayerCard => c !== null);
  const isSquadComplete = cardsInSquad.length === 5;
  const averageRating = cardsInSquad.length > 0 
    ? Math.round(cardsInSquad.reduce((sum, c) => sum + c.overall, 0) / cardsInSquad.length)
    : 0;
  
  const teamPowerTotal = averageRating + chemistry.score;

  // Connections to map and render neon tubes
  const links: { source: Role; target: Role; label: string; x1: string; y1: string; x2: string; y2: string }[] = [
    { source: "Top", target: "Jng", label: "Controle da Selva Superior", x1: "18%", y1: "20%", x2: "35%", y2: "35%" },
    { source: "Jng", target: "Mid", label: "Sinergia Meio-Caçador", x1: "35%", y1: "35%", x2: "50%", y2: "50%" },
    { source: "Mid", target: "Bot", label: "Pressão de Rotas Coordenadas", x1: "50%", y1: "50%", x2: "72%", y2: "82%" },
    { source: "Bot", target: "Sup", label: "Sinergia Adc-Suporte", x1: "72%", y1: "82%", x2: "85%", y2: "75%" }
  ];

  return (
    <div className="w-full flex flex-col gap-6" id="draft-arena-view">
      {/* HUD DASHBOARD */}
      <div className="bg-[#010a13] border border-[#c89b3c]/35 rounded p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative">
        <div className="absolute top-0 right-0 bg-[#c89b3c]/15 text-[#c89b3c] border-b border-l border-[#c89b3c]/35 px-4 py-1.5 rounded-bl text-xs uppercase tracking-[0.2em] font-semibold font-mono flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Fase de Draft
        </div>

        <div className="flex flex-col gap-1.5 text-center md:text-left z-10 font-sans">
          <span className="text-3xl font-serif italic font-bold tracking-tight text-white">
            Seu Quinteto Virtual
          </span>
          <p className="text-xs text-[#a09b8c] max-w-lg">
            Sorteie equipes históricas do CBLOL, recrute um craque estrategicamente e complete as 5 vagas buscando bônus de entrosamento!
          </p>
        </div>

        {/* METRICS DISPLAY PANEL */}
        <div className="flex items-center gap-8 bg-[#050608]/90 p-4 rounded border border-[#c89b3c]/20 z-10">
          {/* OVR MEAN */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#a09b8c] uppercase tracking-widest font-mono">
              Geral Médio
            </span>
            <span className="text-3xl font-bold text-[#00cfbc] font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {averageRating > 0 ? averageRating : "--"}
            </span>
          </div>

          <div className="w-[1px] h-10 bg-[#c89b3c]/25" />

          {/* CHEMISTRY */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#a09b8c] uppercase tracking-widest font-mono">
              Química total
            </span>
            <span className="text-3xl font-bold text-[#c89b3c] font-mono drop-shadow-[0_2px_4px_rgba(200,155,60,0.2)] flex items-center gap-1">
              +{chemistry.score}
            </span>
          </div>

          <div className="w-[1px] h-10 bg-[#c89b3c]/25" />

          {/* TOTAL TEAM POWER */}
          <div className="flex flex-col items-center bg-[#c89b3c]/5 px-3 py-1.5 rounded border border-[#c89b3c]/30">
            <span className="text-[9px] text-[#c89b3c] font-bold uppercase tracking-widest flex items-center gap-1 font-mono">
              Força do Time
            </span>
            <span className="text-3xl font-bold text-[#c89b3c] font-mono drop-shadow-[0_0_10px_rgba(200,155,60,0.2)]">
              {teamPowerTotal > 0 ? teamPowerTotal : "--"}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
          <button
            id="btn-clear-draft"
            onClick={handleResetDraft}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded border border-[#c89b3c]/50 hover:bg-[#c89b3c]/10 text-[#c89b3c] bg-transparent transition-all text-xs font-bold uppercase tracking-widest cursor-pointer font-mono"
          >
            <RefreshCw className="w-4 h-4" />
            Reiniciar
          </button>
          
          <button
            id="btn-start-championship"
            onClick={onStartSimulation}
            disabled={!isSquadComplete}
            className={`
              flex items-center justify-center gap-2 px-8 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg font-mono
              ${isSquadComplete
                ? 'bg-[#c89b3c] hover:bg-[#c89b3c]/80 text-[#050608] hover:scale-[1.03] cursor-pointer'
                : 'bg-[#1e2328] text-[#a09b8c] cursor-not-allowed border border-[#a09b8c]/20'
              }
            `}
          >
            <Trophy className="w-4 h-4" />
            Simular CBLOL
          </button>
        </div>
      </div>

      {/* 3-COLUMN INTEGRATED BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: DRAFT SELECTION PANEL */}
        <div className="lg:col-span-12 xl:col-span-4 bg-[#010a13] border border-[#c89b3c]/30 rounded p-5 flex flex-col gap-4 shadow-lg relative min-h-[550px] font-sans">
          
          {/* Header */}
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c89b3c] font-mono leading-none">
              Sorteio de Elencos
            </span>
            <h3 className="text-lg font-serif font-bold italic text-white">
              Selecione 1 Jogador
            </h3>
          </div>

          {/* Complete versus Draft State Panel */}
          {isSquadComplete ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-[#050608]/80 border border-[#00cfbc]/25 rounded gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#00cfbc]/10 border border-[#00cfbc]/30 flex items-center justify-center text-[#00cfbc] animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold uppercase text-[#00cfbc] tracking-wider font-mono">
                  Quinteto Completo!
                </span>
                <p className="text-xs text-[#a09b8c]">
                  Seu Dream Team histórico do CBLOL está em campo. Pronto para disputar o campeonato e buscar o troféu!
                </p>
              </div>

              <button
                onClick={onStartSimulation}
                className="mt-2 bg-[#c89b3c] hover:bg-[#c89b3c]/90 text-[#050608] font-bold uppercase py-2 px-6 rounded text-xs tracking-wider cursor-pointer font-mono"
              >
                DISPUTAR CAMPEONATO 🏆
              </button>
            </motion.div>
          ) : (
            <>
              {/* Roll CTA Action */}
              <button
                onClick={() => rollRandomTeam(true)}
                disabled={isRolling || rerollsLeft <= 0}
                className="w-full bg-gradient-to-r from-[#c89b3c] to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-neutral-950 font-bold uppercase py-2.5 px-4 rounded text-xs tracking-wider transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-mono flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                {isRolling 
                  ? 'SORTEANDO TIME...' 
                  : rerollsLeft > 0 
                    ? `SORTEAR OUTRO TIME 🎲 (${rerollsLeft} restantes)` 
                    : 'LIMITE DE SORTEIOS ATINGIDO 🔒'}
              </button>

              {rerollsLeft === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded p-2.5 text-[10px] font-mono leading-relaxed flex items-start gap-1.5 shadow-inner">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Você atingiu o limite de sorteios extras (máximo de 2). Agora você deve escalar o seu quinteto escolhendo a partir das equipes que forem sorteadas automaticamente.
                  </span>
                </div>
              )}

              {/* Current drawn team panel indicator */}
              <div className="bg-[#050608] border border-[#c89b3c]/20 p-3 rounded flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#c89b3c]/5 to-transparent pointer-events-none" />
                <span className="text-[9px] text-[#a09b8c] font-bold uppercase tracking-widest font-mono">
                  {drawnSplitName ? drawnSplitName.replace("CBLOL ", "") : "Split da Temporada"}
                </span>
                <span className="text-base font-serif font-bold italic tracking-wide text-white uppercase mt-0.5">
                  {drawnTeam || "Carregando..."}
                </span>
              </div>

              {/* Vertical or compact grid listing of players */}
              <div className="flex-1 overflow-y-auto max-h-[480px] pr-1.5 custom-scrollbar">
                {isRolling ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#a09b8c]/50">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#c89b3c]" />
                    <span className="text-xs font-mono">Embaralhando arquivos históricos...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {drawnPlayers.map((card, idx) => {
                      return (
                        (() => {
                          const isFilled = squad[card.role as Role] !== null;
                          const roleDetail = ROLE_DETAILS[card.role as Role];
                          const RoleIcon = roleDetail?.icon || Swords;
                          const roleColor = roleDetail?.color || "text-[#c89b3c]";

                          // Get custom row decorations based on rarity (legendary, epic, rare, common)
                          let rowDecor = {
                            border: "border-neutral-800/60 hover:border-neutral-600 hover:shadow-neutral-600/10",
                            bg: "bg-[#050608]/50",
                            text: "text-neutral-300",
                            overallColor: "text-neutral-200"
                          };

                          if (card.rarity === 'legendary') {
                            rowDecor = {
                              border: "border-[#c89b3c]/35 hover:border-[#c89b3c] hover:shadow-[#c89b3c]/10",
                              bg: "bg-gradient-to-r from-[#c89b3c]/10 via-[#010a13] to-transparent",
                              text: "text-amber-100",
                              overallColor: "text-[#c89b3c] drop-shadow-[0_0_8px_rgba(200,155,60,0.4)]"
                            };
                          } else if (card.rarity === 'epic') {
                            rowDecor = {
                              border: "border-purple-500/35 hover:border-purple-500 hover:shadow-purple-500/10",
                              bg: "bg-gradient-to-r from-purple-500/10 via-[#010a13] to-transparent",
                              text: "text-purple-100",
                              overallColor: "text-purple-400"
                            };
                          } else if (card.rarity === 'rare') {
                            rowDecor = {
                              border: "border-[#00cfbc]/35 hover:border-[#00cfbc] hover:shadow-[#00cfbc]/10",
                              bg: "bg-gradient-to-r from-[#00cfbc]/10 via-[#010a13] to-transparent",
                              text: "text-teal-100",
                              overallColor: "text-[#00cfbc]"
                            };
                          }

                          return (
                            <div
                              key={card.id || idx}
                              onClick={() => !isFilled && handleSelectPlayerFromDrawn(card)}
                              className={`
                                relative flex items-center justify-between p-3 rounded-lg border transition-all duration-200 w-full group
                                ${rowDecor.border} ${rowDecor.bg}
                                ${isFilled ? 'grayscale opacity-30 brightness-75 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5'}
                              `}
                            >
                              {/* Position / Role Badge */}
                              <div className="flex items-center gap-2.5 shrink-0 select-none">
                                <span className={`p-1.5 rounded bg-black/60 border border-neutral-800 flex items-center justify-center ${roleColor}`}>
                                  <RoleIcon className="w-4 h-4" />
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-neutral-300 tracking-wider font-mono">
                                    {card.role.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Nickname without team */}
                              <div className="flex-1 text-left px-4 min-w-0">
                                <span className={`text-base font-serif font-black tracking-wide uppercase truncate block ${rowDecor.text}`}>
                                  {card.nickname}
                                </span>
                              </div>

                              {/* Overall stats and micro-select trigger */}
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex flex-col items-end">
                                  <span className={`text-2xl font-black font-mono leading-none ${rowDecor.overallColor}`}>
                                    {card.overall}
                                  </span>
                                  <span className="text-[8px] font-bold text-[#a09b8c] font-mono tracking-widest mt-0.5">
                                    GERAL
                                  </span>
                                </div>

                                <div className={`
                                  px-2 py-1.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider transition-all select-none
                                  ${isFilled 
                                    ? 'bg-transparent text-neutral-500'
                                    : 'bg-[#c89b3c]/15 group-hover:bg-[#c89b3c] text-[#c89b3c] group-hover:text-[#050608] shadow-sm'
                                  }
                                `}>
                                  Escalar
                                </div>
                              </div>

                              {/* If already selected / slot filled overlay */}
                              {isFilled && (
                                <div className="absolute inset-x-0 inset-y-0 bg-[#050608]/40 flex items-center justify-center rounded-lg pointer-events-none">
                                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider bg-black/95 px-2.5 py-1 rounded font-mono border border-neutral-800">
                                    Rota {card.role} Ocupada
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* CENTER COLUMN: SUMMONER'S RIFT FIELD BOARD */}
        <div className="lg:col-span-12 xl:col-span-5 bg-[#050608] border border-[#c89b3c]/25 rounded p-0 relative overflow-hidden min-h-[600px] flex items-center justify-center">
          {/* Tactical Background Overlay of Summoner's Rift Map */}
          <img
            src="https://raw.communitydragon.org/latest/game/assets/maps/map11/images/map11.png"
            alt="Summoner's Rift Map"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-50 filter brightness-[0.4] saturate-[0.7]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://raw.githubusercontent.com/g0ld-fr/league-minimap/master/src/assets/map11.png";
            }}
          />

          {/* SIFT MAP VECTOR DIAGRAM OVERLAY */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="100%" x2="100%" y2="0" stroke="#c89b3c" strokeWidth="1" strokeDasharray="6,6" />
              <rect x="8" y="8" width="calc(100% - 16px)" height="calc(100% - 16px)" fill="none" stroke="#c89b3c" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>

          {/* ACTIVE NEON CONNECTING LINES */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="activeSynergy" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c89b3c" />
                  <stop offset="100%" stopColor="#00cfbc" />
                </linearGradient>
              </defs>
              {links.map((link, idx) => {
                const stat = getSynergyStatus(link.source, link.target);
                return (
                  <g key={idx}>
                    <line
                      x1={link.x1}
                      y1={link.y1}
                      x2={link.x2}
                      y2={link.y2}
                      stroke={stat.connected ? "url(#activeSynergy)" : "#1e2328"}
                      strokeWidth={stat.connected ? "3" : "1.5"}
                      className={stat.connected ? "animate-pulse" : ""}
                      opacity={stat.connected ? 0.95 : 0.45}
                    />
                    {stat.connected && (
                      <foreignObject
                        x={`calc(${(parseFloat(link.x1) + parseFloat(link.x2)) / 2}% - 40px)`}
                        y={`calc(${(parseFloat(link.y1) + parseFloat(link.y2)) / 2}% - 14px)`}
                        width="80"
                        height="28"
                        className="overflow-visible"
                      >
                        <div className="bg-[#010a13]/95 text-[#00cfbc] border border-[#00cfbc]/35 text-[9px] font-bold rounded py-0.5 px-2 text-center shadow-lg font-mono tracking-tight whitespace-nowrap">
                          +{stat.chem} Chem
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* GRIDS OF SELECTION NODES WITH CENTROID ALIGNMENT */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {/* TOP LANE */}
            <div className="absolute flex flex-col items-center" style={{ left: "18%", top: "20%", transform: "translate(-50%, -50%)" }}>
              <DraftSlotNode
                role="Top"
                card={squad.Top}
              />
            </div>

            {/* JUNGLE LANE */}
            <div className="absolute flex flex-col items-center" style={{ left: "35%", top: "35%", transform: "translate(-50%, -50%)" }}>
              <DraftSlotNode
                role="Jng"
                card={squad.Jng}
              />
            </div>

            {/* MID LANE */}
            <div className="absolute flex flex-col items-center" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
              <DraftSlotNode
                role="Mid"
                card={squad.Mid}
              />
            </div>

            {/* BOTTOM AD CARRY */}
            <div className="absolute flex flex-col items-center" style={{ left: "72%", top: "82%", transform: "translate(-50%, -50%)" }}>
              <DraftSlotNode
                role="Bot"
                card={squad.Bot}
              />
            </div>

            {/* SUPPORT LANE */}
            <div className="absolute flex flex-col items-center" style={{ left: "85%", top: "75%", transform: "translate(-50%, -50%)" }}>
              <DraftSlotNode
                role="Sup"
                card={squad.Sup}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SQUAD LIST & ACTIVE SYNERGIES */}
        <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-5 font-sans">
          
          {/* SQUAD RUN DOWN TABLE LIST WITH POINTS */}
          <div className="bg-[#010a13] border border-[#c89b3c]/30 rounded p-4 shadow-lg flex flex-col gap-3">
            <span className="text-xs font-serif font-bold tracking-wider uppercase text-[#c89b3c] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Sua Escalação e Pontos
            </span>
            
            <div className="flex flex-col gap-2">
              {(['Top', 'Jng', 'Mid', 'Bot', 'Sup'] as Role[]).map(role => {
                const card = squad[role];
                if (!card) {
                  return (
                    <div key={role} className="flex gap-2.5 items-center bg-[#050608]/40 border border-[#c89b3c]/10 p-2 rounded opacity-50 relative">
                      <div className="w-7 h-7 rounded-sm bg-[#050608] flex items-center justify-center border border-[#c89b3c]/10 text-[#a09b8c]/50 font-mono text-[9px] font-bold shrink-0">
                        {role.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#a09b8c]/50 font-bold uppercase leading-none">VAGO</span>
                        <span className="text-[8px] text-[#a09b8c]/30 mt-0.5">Recrute no painel à esquerda.</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={role} className="flex gap-2.5 items-center bg-[#050608]/75 border border-[#c89b3c]/20 p-2 rounded relative">
                    <div className="w-7 h-7 rounded-sm bg-[#050608] flex items-center justify-center border border-[#c89b3c]/35 text-[#c89b3c] font-mono text-[9px] font-bold shrink-0">
                      {role.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[11px] font-serif font-bold text-white uppercase truncate pr-1">
                          {card.nickname}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#00cfbc]">
                          {card.overall} Pts
                        </span>
                      </div>
                      <div className="flex justify-between text-[8px] text-[#a09b8c] mt-0.5 font-mono">
                        <span className="truncate">{card.team}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE SYNERGIES REPORT */}
          <div className="bg-[#010a13] border border-[#c89b3c]/30 rounded p-4 shadow-lg flex-1 flex flex-col gap-3 justify-between">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-serif font-bold tracking-wider uppercase text-[#c89b3c]">
                Alinhamentos Ativos
              </span>

              {chemistry.orgSynergies.length === 0 && chemistry.epochSynergies.length === 0 && chemistry.specialSynergies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-[#a09b8c]/60 gap-1 text-center">
                  <AlertCircle className="w-6 h-6 opacity-40 text-[#c89b3c]" />
                  <span className="text-[11px]">Nenhuma sinergia ativa</span>
                  <p className="text-[9px] text-[#a09b8c]/50 leading-tight">Escolha craques com same org ou same split para ligar bônus.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {/* Orgs list */}
                  {chemistry.orgSynergies.map((synergy, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center bg-[#050608]/50 px-2.5 py-1.5 rounded border border-[#c89b3c]/15 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[#f0e6d2] font-semibold">{synergy.tag}</span>
                        <span className="text-[9px] text-[#a09b8c]">{synergy.count} Jogadores</span>
                      </div>
                      <span className="font-mono text-[#00cfbc] font-bold">+{synergy.bonus} Química</span>
                    </div>
                  ))}

                  {/* Epochs list */}
                  {chemistry.epochSynergies.map((synergy, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center bg-[#050608]/50 px-2.5 py-1.5 rounded border border-[#00cfbc]/25 text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-[#f0e6d2] font-semibold">{synergy.yearSplit.replace("CBLOL ", "")}</span>
                        <span className="text-[9px] text-[#a09b8c]">{synergy.count} Jogadores</span>
                      </div>
                      <span className="font-mono text-[#00cfbc] font-bold">+{synergy.bonus} Química</span>
                    </div>
                  ))}

                  {/* Special Easter Eggs */}
                  {chemistry.specialSynergies.map((synText, sIdx) => (
                    <div key={sIdx} className="bg-[#c89b3c]/10 border border-[#c89b3c]/30 text-[#c89b3c] px-2 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider text-center animate-pulse leading-none">
                      🌟 {synText}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HIGH END TRIVIA TIP */}
            <div className="text-[9px] text-neutral-500 italic bg-neutral-950/60 p-2 rounded border border-neutral-800 leading-tight shrink-0 mt-3">
              <Info className="w-3.5 h-3.5 inline text-[#c89b3c] mr-1" />
              Monstros de uma mesma line garantem bônus extras (Exódia INTZ ou paiN 2015 somam +15 pontos!).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified, highly polished, minimalist slot Node used inside Rift tactical board
const DraftSlotNode: React.FC<{
  role: Role;
  card: PlayerCard | null;
}> = ({ role, card }) => {
  const details = ROLE_DETAILS[role];
  const Icon = details.icon;
  const roleColor = details.color;

  if (card) {
    // Elegant, highly polished minimalist token instead of a large card
    let rarityColor = "border-neutral-500 text-neutral-300 shadow-neutral-500/20";
    let glowBg = "bg-neutral-900";
    let ratingColor = "text-neutral-200";

    if (card.rarity === 'legendary') {
      rarityColor = "border-[#c89b3c] text-[#c89b3c] shadow-[#c89b3c]/30";
      glowBg = "bg-gradient-to-b from-[#1a1204] to-neutral-950";
      ratingColor = "text-[#c89b3c] drop-shadow-[0_0_6px_rgba(200,155,60,0.6)]";
    } else if (card.rarity === 'epic') {
      rarityColor = "border-purple-500 text-purple-400 shadow-purple-500/30";
      glowBg = "bg-gradient-to-b from-[#1b0a24] to-neutral-950";
      ratingColor = "text-purple-300";
    } else if (card.rarity === 'rare') {
      rarityColor = "border-[#00cfbc] text-[#00cfbc] shadow-[#00cfbc]/30";
      glowBg = "bg-gradient-to-b from-[#02181a] to-neutral-950";
      ratingColor = "text-[#00cfbc]";
    }

    return (
      <div className="flex flex-col items-center justify-center select-none group relative">
        {/* Main Mastery-like Emblem Token */}
        <div 
          className={`
            w-14 h-14 rounded-full border-2 flex items-center justify-center relative shadow-lg transition-transform duration-300 group-hover:scale-110
            ${rarityColor} ${glowBg}
          `}
        >
          {/* Subtle interior glow ring */}
          <div className="absolute inset-0.5 rounded-full border border-neutral-800 pointer-events-none" />
          
          {/* Main big Overall Rating display */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className={`text-lg font-black font-mono leading-none tracking-tighter ${ratingColor}`}>
              {card.overall}
            </span>
            <span className="text-[7px] text-[#a09b8c] font-bold uppercase tracking-widest font-mono">
              OVR
            </span>
          </div>

          {/* Small Position role badge attached to top-right of circle */}
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black border border-current flex items-center justify-center ${roleColor} text-xs shadow-md`}>
            <Icon className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Player Name Display Tag (glassmorphism sleek panel) */}
        <div className="mt-1.5 bg-[#010a13]/90 border border-[#c89b3c]/25 rounded px-2.5 py-0.5 shadow-md flex flex-col items-center justify-center text-center backdrop-blur-sm min-w-[70px] max-w-[95px]">
          <span className="text-[10px] font-serif font-black tracking-wide text-white uppercase truncate text-center w-full">
            {card.nickname}
          </span>
          <span className="text-[6.5px] text-[#a09b8c] font-bold uppercase tracking-wider font-mono">
            {role.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  // Show vago / coordinates on Rift map (minimalist empty slot)
  return (
    <div
      className={`
        w-12 h-12 rounded-full border border-dashed border-[#c89b3c]/35 bg-[#010a13]/85 flex flex-col items-center justify-center text-[#a09b8c]/50 select-none pointer-events-none transition-all duration-300
      `}
    >
      <div className={`w-4 h-4 flex items-center justify-center text-[#a09b8c]/40 ${roleColor}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      
      <span className="text-[8px] font-black font-mono tracking-wider uppercase text-neutral-400 mt-0.5">
        {role}
      </span>
    </div>
  );
};
