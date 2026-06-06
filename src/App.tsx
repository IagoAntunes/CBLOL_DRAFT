/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerCard, Role, DraftSquad, ChemistryResult, DraftHistoryEntry } from './types';
import { DraftArena } from './components/DraftArena';
import { TournamentBracket } from './components/TournamentBracket';
import { CollectionBook } from './components/CollectionBook';
import { calculateChemistry } from './utils/draftEngine';
import { Trophy, BookOpen, Swords, Landmark, Flame, Edit, Check, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EMPTY_SQUAD: DraftSquad = {
  Top: null,
  Jng: null,
  Mid: null,
  Bot: null,
  Sup: null
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DraftHistoryEntry }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#010a13] border border-[#c89b3c] p-3 text-xs rounded shadow-xl max-w-xs font-mono relative z-50">
        <p className="font-sans font-bold text-white mb-1.5 border-b border-[#c89b3c]/20 pb-1 uppercase">{data.teamName}</p>
        <div className="flex flex-col gap-1 text-[11px] text-[#f0e6d2]">
          <p className="text-zinc-400">Data: <span className="text-white font-bold">{data.date}</span></p>
          <p className="text-zinc-400">Poder Total: <span className="text-[#00cfbc] font-bold">{data.finalScore}</span></p>
          <p className="text-[#a09b8c]">Geral Jogadores: <span className="text-stone-200 font-bold">{data.totalOverall} OVR</span></p>
          <p className="text-[#a09b8c]">Química: <span className="text-[#c89b3c] font-bold">+{data.chemistryBonus}</span></p>
          <p className="text-zinc-400">Resultado: <span className={`font-bold ${data.tournamentResult === 'Campeão' ? 'text-[#c89b3c]' : 'text-rose-400'}`}>{data.tournamentResult}</span></p>
        </div>
      </div>
    );
  }
  return null;
};


export default function App() {
  const [activeTab, setActiveTab] = useState<'draft' | 'collection' | 'history'>('draft');
  const [squad, setSquad] = useState<DraftSquad>(EMPTY_SQUAD);
  const [userTeamName, setUserTeamName] = useState("Meu Dream Team");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("Meu Dream Team");
  const [tournamentActive, setTournamentActive] = useState(false);
  const [draftHistory, setDraftHistory] = useState<DraftHistoryEntry[]>([]);

  // Load history from localStorage on initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cblol_draft_history');
      if (stored) {
        setDraftHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro carregando histórico local de drafts:", e);
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: DraftHistoryEntry[]) => {
    setDraftHistory(newHistory);
    try {
      localStorage.setItem('cblol_draft_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Erro salvando histórico de drafts:", e);
    }
  };

  // Add individual player selection
  const handleSelectPlayer = (role: Role, card: PlayerCard) => {
    setSquad(prev => ({
      ...prev,
      [role]: card
    }));
  };

  // Clear current roster
  const handleClearSquad = () => {
    setSquad(EMPTY_SQUAD);
  };

  // Name changing confirm
  const handleSaveTeamName = () => {
    if (nameInput.trim().length > 0) {
      setUserTeamName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  // Exit simulated championship with results
  const handleExitTournament = (result: string) => {
    setTournamentActive(false);

    // If matches occurred, log run in the historical board
    if (result !== 'Não disputou') {
      const cards = Object.values(squad).filter((c): c is PlayerCard => c !== null);
      if (cards.length === 5) {
        const averageRating = Math.round(cards.reduce((sum, c) => sum + c.overall, 0) / cards.length);
        const chemistry = calculateChemistry(squad);
        
        const resultLabelMap: { [key: string]: DraftHistoryEntry['tournamentResult'] } = {
          'Campeão': 'Campeão',
          'Eliminado': 'Eliminado nas Semis' // fallback representation for quick exit states
        };

        let finalResultLabel: DraftHistoryEntry['tournamentResult'] = 'Não disputou';
        if (result === 'Campeão') {
          finalResultLabel = 'Campeão';
        } else if (result === 'Eliminado') {
          finalResultLabel = 'Eliminado nas Semis';
        }

        const newEntry: DraftHistoryEntry = {
          id: `history-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR'),
          teamName: userTeamName,
          squad: squad as { [key in Role]: PlayerCard },
          totalOverall: averageRating,
          chemistryBonus: chemistry.score,
          finalScore: averageRating + chemistry.score,
          tournamentResult: finalResultLabel
        };

        saveHistory([newEntry, ...draftHistory]);
      }
      // Clean squad after simulation
      setSquad(EMPTY_SQUAD);
    }
  };

  const chemistry = calculateChemistry(squad);

  // Quick statistics
  const trophyCount = draftHistory.filter(h => h.tournamentResult === 'Campeão').length;
  const bestRosterScore = draftHistory.reduce((max, entry) => Math.max(max, entry.finalScore), 0);
  const chartData = [...draftHistory].reverse();

  return (
    <div className="min-h-screen bg-[#050608] text-[#f0e6d2] flex flex-col font-sans select-none antialiased border-4 border-[#c89b3c]/20">
      {/* GLOBAL NAVBAR HEADER */}
      <header className="bg-[#010a13] border-b border-[#c89b3c]/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* LOGO TITLE BRANDING */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#c89b3c] flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-[#c89b3c]/20">
              <Swords className="w-5.5 h-5.5 text-[#050608]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[10px] uppercase tracking-[0.25em] text-[#c89b3c] font-bold leading-none">
                CBLOL Draft Simulator
              </h1>
              <span className="text-xl font-serif italic tracking-tight text-white mt-0.5">
                Championship Edition
              </span>
            </div>
          </div>

          {/* SQUAD NAME EDITOR (only visible on Draft tab) */}
          {activeTab === 'draft' && !tournamentActive && (
            <div className="flex items-center gap-2 bg-[#050608]/80 pl-3.5 pr-2.5 py-1.5 rounded border border-[#c89b3c]/30 shadow-inner">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={24}
                    className="bg-[#010a13] border border-[#c89b3c]/40 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-[#c89b3c] uppercase font-sans w-36"
                  />
                  <button
                    onClick={handleSaveTeamName}
                    className="p-1 text-[#00cfbc] hover:bg-neutral-900 rounded cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest text-[#f0e6d2] uppercase font-sans">
                    {userTeamName}
                  </span>
                  <button
                    onClick={() => {
                      setNameInput(userTeamName);
                      setIsEditingName(true);
                    }}
                    className="p-1 text-[#a09b8c] hover:text-white hover:bg-neutral-900 rounded cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB SWITCHERS NAVIGATION */}
          <nav className="flex bg-[#050608] p-1 rounded border border-[#c89b3c]/20 max-w-full">
            <button
              onClick={() => { setActiveTab('draft'); setTournamentActive(false); }}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeTab === 'draft' && !tournamentActive
                  ? 'bg-[#c89b3c] text-[#050608] shadow-md shadow-[#c89b3c]/20'
                  : 'text-[#a09b8c] hover:text-[#f0e6d2] hover:bg-[#c89b3c]/10'
                }
              `}
            >
              <Swords className="w-4 h-4 text-current" />
              Draft
            </button>
            
            <button
              id="tab-open-collection"
              onClick={() => { setActiveTab('collection'); setTournamentActive(false); }}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeTab === 'collection'
                  ? 'bg-[#c89b3c] text-[#050608] shadow-md shadow-[#c89b3c]/20'
                  : 'text-[#a09b8c] hover:text-[#f0e6d2] hover:bg-[#c89b3c]/10'
                }
              `}
            >
              <BookOpen className="w-4 h-4 text-current" />
              Álbum
            </button>

            <button
              id="tab-open-history"
              onClick={() => { setActiveTab('history'); setTournamentActive(false); }}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeTab === 'history'
                  ? 'bg-[#c89b3c] text-[#050608] shadow-md shadow-[#c89b3c]/20'
                  : 'text-[#a09b8c] hover:text-[#f0e6d2] hover:bg-[#c89b3c]/10'
                }
              `}
            >
              <Landmark className="w-4 h-4 text-current" />
              Trophy Case
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN LAYOUT CANVAS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {tournamentActive ? (
            <motion.div
              key="tournament-bracket"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <TournamentBracket
                squad={squad}
                userTeamName={userTeamName}
                onExitTournament={handleExitTournament}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'draft' && (
                <DraftArena
                  squad={squad}
                  onSelectPlayer={handleSelectPlayer}
                  onClearSquad={handleClearSquad}
                  chemistry={chemistry}
                  onStartSimulation={() => setTournamentActive(true)}
                />
              )}

              {activeTab === 'collection' && (
                <CollectionBook />
              )}

              {activeTab === 'history' && (
                <div className="flex flex-col gap-6" id="trophy-case-view">
                  {/* RETROSPECTIVE OVERVIEW DASHBOARD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#010a13] p-6 rounded border border-[#c89b3c]/30 flex items-center gap-5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#c89b3c]/5 animate-pulse" />
                      <div className="w-14 h-14 rounded bg-[#c89b3c]/10 border border-[#c89b3c]/35 flex items-center justify-center text-[#c89b3c] shrink-0">
                        <Trophy className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[#a09b8c] font-bold uppercase tracking-widest font-mono">Taças Erguidas</span>
                        <span className="text-3xl font-serif italic text-[#c89b3c] font-black">{trophyCount}</span>
                        <span className="text-[10px] text-[#a09b8c]/70 leading-none">Campeonatos mundiais e nacionais dominados.</span>
                      </div>
                    </div>

                    <div className="bg-[#010a13] p-6 rounded border border-[#c89b3c]/30 flex items-center gap-5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#00cfbc]/5 animate-pulse" />
                      <div className="w-14 h-14 rounded bg-[#00cfbc]/10 border border-[#00cfbc]/30 flex items-center justify-center text-[#00cfbc] shrink-0">
                        <Star className="w-7 h-7 fill-[#00cfbc]/15" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[#a09b8c] font-bold uppercase tracking-widest font-mono">Recorde de Força</span>
                        <span className="text-3xl font-mono font-black text-[#00cfbc]">{bestRosterScore > 0 ? bestRosterScore : "--"}</span>
                        <span className="text-[10px] text-[#a09b8c]/70 leading-none">Maior pontuação combinada de elenco.</span>
                      </div>
                    </div>
                  </div>

                  {/* RECHARTS EVOLUTION BAR CHART */}
                  {draftHistory.length > 0 && (
                    <div className="bg-[#010a13]/90 border border-[#c89b3c]/30 rounded p-6 shadow-xl flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-[#c89b3c]/20 pb-3">
                        <span className="text-sm font-serif font-bold text-white tracking-wider uppercase flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#c89b3c]" />
                          Evolução do Poder Total das Equipes
                        </span>
                        <span className="text-[10px] bg-[#c89b3c]/10 text-[#c89b3c] border border-[#c89b3c]/25 px-2.5 py-0.5 rounded font-mono uppercase">
                          {draftHistory.length} {draftHistory.length === 1 ? 'Equipe' : 'Equipes'}
                        </span>
                      </div>
                      
                      <div className="w-full h-72 pt-2 font-mono text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                            <defs>
                              <linearGradient id="barPowerGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c89b3c" stopOpacity={0.95}/>
                                <stop offset="95%" stopColor="#c89b3c" stopOpacity={0.2}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e2328" vertical={false} />
                            <XAxis 
                              dataKey="teamName" 
                              stroke="#a09b8c" 
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
                            />
                            <YAxis 
                              stroke="#a09b8c" 
                              domain={[0, 'auto']} 
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 155, 60, 0.05)' }} />
                            <Bar 
                              dataKey="finalScore" 
                              fill="url(#barPowerGrad)" 
                              stroke="#c89b3c"
                              strokeWidth={1}
                              radius={[4, 4, 0, 0]}
                              maxBarSize={45}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* RUN HISTORY LIST TABLE */}
                  <div className="bg-[#010a13]/90 border border-[#c89b3c]/30 rounded p-6 shadow-xl flex flex-col gap-4">
                    <span className="text-sm font-serif font-bold text-white tracking-wider uppercase">Histórico de Campanhas</span>

                    {draftHistory.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#a09b8c] text-center">
                        <Trophy className="w-16 h-16 opacity-30 stroke-[1] text-[#c89b3c]" />
                        <div className="flex flex-col gap-0.5 max-w-xs">
                          <span className="text-sm font-bold text-[#c89b3c] uppercase tracking-wider">Trophy Case Vazio</span>
                          <p className="text-xs text-[#a09b8c]">Você ainda não completou nenhuma campanha. Monte um elenco de 5 craques e dispute o simulador do CBLOL.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {draftHistory.map((entry) => (
                          <div
                            key={entry.id}
                            className={`p-4 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs relative overflow-hidden bg-[#050608]/80
                              ${entry.tournamentResult === 'Campeão' ? 'border-[#c89b3c]/60 bg-[#c89b3c]/5' : 'border-[#c89b3c]/20'}
                            `}
                          >
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm uppercase tracking-wide">{entry.teamName}</span>
                                <span className="text-[9px] text-[#a09b8c] font-mono">({entry.date})</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[#a09b8c] text-[10px]">
                                <span>Geral: <strong className="text-white">{entry.totalOverall}</strong></span>
                                <span>•</span>
                                <span>Química: <strong className="text-[#c89b3c]">+{entry.chemistryBonus}</strong></span>
                                <span>•</span>
                                <span className="text-[#00cfbc] font-bold">Força: {entry.finalScore}</span>
                              </div>
                            </div>

                            {/* Squad cards names array preview */}
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(entry.squad).map(([role, card]) => {
                                const player = card as PlayerCard;
                                return (
                                  <div key={role} className="flex flex-col items-center bg-[#1e2328] border border-[#c89b3c]/20 rounded px-2.5 py-1 text-[9px] font-bold text-[#f0e6d2]">
                                    <span className="text-[#c89b3c] text-[7px] uppercase font-serif tracking-widest">{role}</span>
                                    {player.nickname}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Badge result */}
                            <div className="shrink-0">
                              {entry.tournamentResult === 'Campeão' ? (
                                <span className="bg-[#c89b3c]/15 text-[#c89b3c] border border-[#c89b3c]/30 font-black uppercase text-[10px] tracking-widest px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-lg select-all">
                                  🏆 CAMPEÃO
                                </span>
                              ) : (
                                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase text-[10px] tracking-wider px-3.5 py-1.5 rounded block">
                                  {entry.tournamentResult}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER METRICS INFO */}
      <footer className="bg-[#050608] border-t border-[#c89b3c]/20 py-6 text-center text-[#a09b8c] text-xs">
        <p className="font-sans">
          Draft Simulator CBLOL © 2026 • Curadoria de Elencos e Simulação de Estatísticas Históricas.
        </p>
      </footer>
    </div>
  );
}
