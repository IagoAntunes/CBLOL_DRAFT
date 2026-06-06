/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CBLOL_CARDS } from '../data/players';
import { PlayerCard, Role, CardRarity } from '../types';
import { PlayerCardWidget } from './PlayerCardWidget';
import { Search, SlidersHorizontal, BookOpen, Star } from 'lucide-react';

export const CollectionBook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | 'All'>('All');
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | 'All'>('All');
  const [selectedTeam, setSelectedTeam] = useState<string | 'All'>('All');

  // Find unique teams available in pool for filters
  const teamsList = Array.from(new Set(CBLOL_CARDS.map(c => c.team)));

  // Filter cards
  const filteredCards = CBLOL_CARDS.filter(card => {
    const matchesSearch = card.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          card.splitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || card.role === selectedRole;
    const matchesRarity = selectedRarity === 'All' || card.rarity === selectedRarity;
    const matchesTeam = selectedTeam === 'All' || card.team === selectedTeam;
    return matchesSearch && matchesRole && matchesRarity && matchesTeam;
  });

  // Sort cards descending overall
  const sortedCards = [...filteredCards].sort((a, b) => b.overall - a.overall);

  // Statistics calculation for handbook
  const legendaryCount = CBLOL_CARDS.filter(c => c.rarity === 'legendary').length;

  return (
    <div className="w-full flex flex-col gap-6 font-sans mb-8" id="collection-book-view">
      {/* HEADER SECTION */}
      <div className="bg-[#010a13] border border-[#c89b3c]/35 rounded p-6 shadow-xl flex flex-col lg:flex-row justify-between items-center gap-6 relative">
        <div className="absolute top-0 right-0 bg-[#c89b3c]/15 text-[#c89b3c] border-b border-l border-[#c89b3c]/30 px-3.5 py-1.5 rounded-bl text-xs uppercase tracking-wider font-semibold font-mono flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Álbum de Craques
        </div>

        <div className="flex flex-col gap-1.5 text-center lg:text-left">
          <span className="text-2xl font-serif font-bold italic tracking-wide text-white uppercase flex items-center gap-2 justify-center lg:justify-start">
            Coleção Oficial CBLOL
          </span>
          <p className="text-xs text-[#a09b8c]">
            Navegue por todos os {CBLOL_CARDS.length} jogadores históricos inclusos na nossa base de dados. Procure por seus ídolos favoritos e confira seus atributos.
          </p>
        </div>

        {/* ALbum compilation stats */}
        <div className="flex gap-4 bg-[#050608] p-4 rounded border border-[#c89b3c]/20">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#a09b8c] font-bold uppercase tracking-widest font-mono">Total de Cards</span>
            <span className="text-2xl font-bold text-white font-mono">{CBLOL_CARDS.length}</span>
          </div>
          <div className="w-[1px] h-8 bg-[#c89b3c]/20" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#a09b8c] font-bold uppercase tracking-widest flex items-center gap-1 font-mono">
              <Star className="w-3 h-3 text-[#c89b3c] fill-[#c89b3c]" /> Lendários
            </span>
            <span className="text-2xl font-bold text-[#c89b3c] font-mono">{legendaryCount}</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-[#050608] border border-[#c89b3c]/25 rounded p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-[#c89b3c]/50" />
          <input
            type="text"
            placeholder="Buscar apelido ou split..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#010a13] border border-[#c89b3c]/20 pl-10 pr-4 py-2 rounded text-xs text-white placeholder-[#a09b8c]/40 focus:outline-none focus:border-[#c89b3c] transition-all font-sans"
          />
        </div>

        {/* Sliders icons */}
        <div className="flex items-center gap-1.5 text-xs text-[#c89b3c] font-bold uppercase tracking-wider shrink-0 mr-2 font-mono">
          <SlidersHorizontal className="w-4 h-4 text-[#c89b3c]" />
          Filtros
        </div>

        {/* Role filters select */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role | 'All')}
          className="bg-[#010a13] border border-[#c89b3c]/20 text-xs text-[#f0e6d2] py-2 px-3 rounded focus:outline-none focus:border-[#c89b3c] transition-colors cursor-pointer w-full md:w-36"
        >
          <option value="All">Todas as Rotas</option>
          <option value="Top">Top (Topo)</option>
          <option value="Jng">Jungle (Caçador)</option>
          <option value="Mid">Mid (Meio)</option>
          <option value="Bot">Bot (Atirador)</option>
          <option value="Sup">Support (Suporte)</option>
        </select>

        {/* Rarity select */}
        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value as CardRarity | 'All')}
          className="bg-[#010a13] border border-[#c89b3c]/20 text-xs text-[#f0e6d2] py-2 px-3 rounded focus:outline-none focus:border-[#c89b3c] transition-colors cursor-pointer w-full md:w-36"
        >
          <option value="All">Todas as Raridades</option>
          <option value="common">Comum (70-79)</option>
          <option value="rare">Raro (80-87)</option>
          <option value="epic">Épico (88-94)</option>
          <option value="legendary">Lendário (95-99)</option>
        </select>

        {/* Team list select */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="bg-[#010a13] border border-[#c89b3c]/20 text-xs text-[#f0e6d2] py-2 px-3 rounded focus:outline-none focus:border-[#c89b3c] transition-colors cursor-pointer w-full md:w-44"
        >
          <option value="All">Todas as Organizações</option>
          {teamsList.map(teamName => (
            <option key={teamName} value={teamName}>{teamName}</option>
          ))}
        </select>
      </div>

      {/* RENDER GRID CARDS LIST */}
      {sortedCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {sortedCards.map(card => (
            <div key={card.id} className="relative group">
              <PlayerCardWidget card={card} size="sm" hoverable={true} />
              
              {/* Overlay rating hover tool */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded text-center">
                <span className="text-[10px] text-[#a09b8c] italic block font-sans">
                  {card.splitName}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed border-[#c89b3c]/30 rounded bg-[#010a13]/50 gap-3">
          <BookOpen className="w-16 h-16 text-[#c89b3c]/30 animate-pulse" />
          <div className="flex flex-col gap-1 max-w-xs">
            <span className="text-sm font-bold text-[#c89b3c] uppercase tracking-wider font-mono">Nenhum craque encontrado</span>
            <p className="text-xs text-[#a09b8c]/60">
              Sua filtragem não retornou nenhum registro. Tente alterar os critérios de seleção ou apagar o termo de busca.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
