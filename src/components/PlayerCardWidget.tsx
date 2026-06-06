/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerCard, CardRarity } from '../types';
import { Sparkles, Trophy, Flame, Shield, Swords, Zap, Heart } from 'lucide-react';

interface PlayerCardWidgetProps {
  card: PlayerCard;
  onClick?: () => void;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isRevealing?: boolean;
  simpleMode?: boolean;
}

// Map roles to iconic lucide icons
const ROLE_ICONS = {
  Top: Shield,
  Jng: Zap,
  Mid: Swords,
  Bot: Flame,
  Sup: Heart,
};

// Map team names to consistent Tailwind border/background theme schemes
const TEAM_THEMES: { [key: string]: { bg: string; text: string; glow: string; border: string } } = {
  "paiN Gaming": {
    bg: "from-neutral-950 via-red-950 to-neutral-900",
    text: "text-red-500",
    glow: "shadow-red-500/30",
    border: "border-red-600/50"
  },
  "LOUD": {
    bg: "from-neutral-950 via-lime-950 to-neutral-900",
    text: "text-lime-500",
    glow: "shadow-lime-500/30",
    border: "border-lime-500/50"
  },
  "INTZ Esports": {
    bg: "from-neutral-950 via-neutral-800 to-neutral-950",
    text: "text-neutral-200",
    glow: "shadow-neutral-400/20",
    border: "border-neutral-500/50"
  },
  "INTZ": {
    bg: "from-neutral-950 via-neutral-800 to-neutral-950",
    text: "text-neutral-200",
    glow: "shadow-neutral-400/20",
    border: "border-neutral-500/50"
  },
  "KaBuM! e-Sports": {
    bg: "from-neutral-950 via-orange-950 to-neutral-900",
    text: "text-orange-500",
    glow: "shadow-orange-500/30",
    border: "border-orange-500/50"
  },
  "Flamengo Esports": {
    bg: "from-red-950 via-neutral-900 to-red-950",
    text: "text-red-500",
    glow: "shadow-red-600/35",
    border: "border-red-600/60"
  },
  "RED Canids": {
    bg: "from-neutral-950 via-rose-950 to-neutral-900",
    text: "text-rose-500",
    glow: "shadow-rose-600/35",
    border: "border-rose-600/50"
  },
  default: {
    bg: "from-neutral-950 via-indigo-950 to-neutral-900",
    text: "text-indigo-400",
    glow: "shadow-indigo-500/20",
    border: "border-indigo-500/40"
  }
};

export const PlayerCardWidget: React.FC<PlayerCardWidgetProps> = ({
  card,
  onClick,
  hoverable = true,
  size = 'md',
  isRevealing = false,
  simpleMode = false
}) => {
  const RoleIconComponent = ROLE_ICONS[card.role] || Swords;
  const theme = TEAM_THEMES[card.team] || TEAM_THEMES.default;

  // Determine border styles and effects depending on card rarity
  const getRarityDecorations = (rarity: CardRarity) => {
    switch (rarity) {
      case 'legendary':
        return {
          borderClass: "border-[#c89b3c] bg-[#c89b3c]/10 shadow-[#c89b3c]/40",
          textClass: "text-[#c89b3c] font-bold",
          bgOverlay: "bg-gradient-to-tr from-[#c89b3c]/35 via-[#010a13] to-neutral-900/40",
          glowBanner: "from-[#c89b3c] to-yellow-600",
          sparkles: true
        };
      case 'epic':
        return {
          borderClass: "border-purple-500/80 bg-purple-500/10 shadow-purple-500/35",
          textClass: "text-purple-400 font-bold",
          bgOverlay: "bg-gradient-to-tr from-purple-950/30 via-neutral-900 to-fuchsia-950/30",
          glowBanner: "from-purple-500 to-fuchsia-600",
          sparkles: false
        };
      case 'rare':
        return {
          borderClass: "border-[#00cfbc]/80 bg-[#00cfbc]/5 shadow-[#00cfbc]/30",
          textClass: "text-[#00cfbc] font-semibold",
          bgOverlay: "bg-gradient-to-tr from-[#00cfbc]/20 via-neutral-900 to-teal-950/20",
          glowBanner: "from-[#00cfbc] to-teal-600",
          sparkles: false
        };
      case 'common':
      default:
        return {
          borderClass: "border-neutral-500/40 bg-neutral-800/10 shadow-neutral-500/10",
          textClass: "text-neutral-400",
          bgOverlay: "bg-neutral-900/50",
          glowBanner: "from-neutral-600 to-neutral-700",
          sparkles: false
        };
    }
  };

  const decors = getRarityDecorations(card.rarity);

  const sizeClasses = {
    sm: {
      card: "w-40 h-56 text-xs",
      avatar: "w-14 h-14",
      overText: "text-2xl",
      logo: "w-5 h-5",
      metrics: "mt-1 gap-1 text-[10px]",
    },
    md: {
      card: "w-56 h-80 text-sm",
      avatar: "w-20 h-20",
      overText: "text-4xl",
      logo: "w-7 h-7",
      metrics: "mt-2 gap-2 text-xs",
    },
    lg: {
      card: "w-64 h-96 text-md-lg",
      avatar: "w-24 h-24",
      overText: "text-5xl",
      logo: "w-9 h-9",
      metrics: "mt-3 gap-3 text-sm",
    },
  };

  const selectedSize = sizeClasses[size];

  if (simpleMode) {
    const sizeClassesSimple = {
      sm: "w-36 h-52 text-xs",
      md: "w-44 h-64 text-sm",
      lg: "w-52 h-72 text-md",
    };
    const cardSize = sizeClassesSimple[size] || sizeClassesSimple.sm;

    return (
      <div
        id={`card-simple-${card.id}`}
        onClick={onClick}
        className={`
          relative select-none rounded-xl overflow-hidden border-2 flex flex-col items-center justify-between font-sans transition-all duration-300 p-4 text-center
          ${decors.borderClass} ${theme.bg} ${theme.glow}
          ${hoverable ? 'hover:scale-[1.04] hover:-translate-y-1 cursor-pointer hover:shadow-2xl' : ''}
          ${cardSize}
          ${isRevealing ? 'animate-pulse border-amber-300' : ''}
        `}
      >
        {/* Dynamic Background Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-30" />
        <div className={`absolute inset-0 opacity-15 pointer-events-none ${decors.bgOverlay}`} />

        {/* 1. POSITION (Role Badge) */}
        <div className="z-10 bg-black/60 px-3 py-1 rounded-full border border-neutral-700/50 flex items-center gap-1.5 shrink-0">
          <RoleIconComponent className={`w-3.5 h-3.5 ${theme.text}`} />
          <span className="text-[10px] uppercase font-bold text-neutral-200 tracking-wider font-mono">
            {card.role}
          </span>
        </div>

        {/* 2. NICKNAME */}
        <div className="z-10 flex flex-col justify-center items-center my-auto">
          <span className="text-base font-serif font-black tracking-wider text-white uppercase truncate max-w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-1">
            {card.nickname}
          </span>
          <span className="text-[9px] text-[#a09b8c] font-mono uppercase tracking-widest mt-0.5">
            {card.team}
          </span>
        </div>

        {/* 3. OVERALL */}
        <div className="z-10 flex flex-col items-center justify-center shrink-0">
          <span className={`font-black tracking-tight leading-none text-4xl ${decors.textClass} drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)]`}>
            {card.overall}
          </span>
          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
            GERAL
          </span>
        </div>

        {/* Glowing bottom rarity strip */}
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${decors.glowBanner}`} />
      </div>
    );
  }

  return (
    <div
      id={`card-${card.id}`}
      onClick={onClick}
      className={`
        relative select-none rounded-xl overflow-hidden border-2 flex flex-col font-sans transition-all duration-300
        ${decors.borderClass} ${theme.bg} ${theme.glow}
        ${hoverable ? 'hover:scale-105 hover:-translate-y-1 cursor-pointer hover:shadow-2xl' : ''}
        ${selectedSize.card}
        ${isRevealing ? 'animate-pulse border-amber-300' : ''}
      `}
    >
      {/* Dynamic Background Grid Pattern overlay */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-40`} />

      {/* Radiant Glow overlays based on rarity */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none ${decors.bgOverlay}`} />

      {/* Rarity sparkles for Legendary cards */}
      {decors.sparkles && (
        <div className="absolute top-2 right-2 animate-bounce z-10 text-amber-300">
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
      )}

      {/* CARD HEADER: Role logo, Overall Score, Card Sticker */}
      <div className="flex items-center justify-between p-3 z-10 w-full">
        {/* Role & Split Sticker Tag */}
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full border border-neutral-700/50">
            <RoleIconComponent className={`w-3.5 h-3.5 ${theme.text}`} />
            <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider">
              {card.role}
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 font-mono tracking-tighter truncate max-w-[90px] block mt-0.5">
            {card.splitName.replace("CBLOL ", "")}
          </span>
        </div>

        {/* Big Overall rating score */}
        <div className="flex flex-col items-center">
          <span className={`font-black tracking-tight leading-none ${selectedSize.overText} ${decors.textClass} drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]`}>
            {card.overall}
          </span>
          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
            OVR
          </span>
        </div>
      </div>

      {/* CARD BODY: Artistic Avatar Placeholder built strictly with css */}
      <div className="flex-1 flex flex-col items-center justify-center relative mt-1 z-10">
        <div className={`
          relative rounded-full border-2 flex items-center justify-center p-2 overflow-hidden bg-neutral-900/40
          ${decors.borderClass} ${selectedSize.avatar}
        `}>
          <div className={`absolute inset-0 bg-gradient-to-b ${theme.bg} opacity-20`} />
          <RoleIconComponent className={`w-3/5 h-3/5 ${theme.text} drop-shadow-lg opacity-80`} />
          
          {/* Subtle glowing halo */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-transparent animate-[pulse_3s_infinite]`} />
        </div>

        {/* Team Sub-Tag Sticker */}
        <div className="mt-2.5 px-3 py-0.5 max-w-[90%] truncate rounded bg-black/75 border border-neutral-800 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold tracking-tight text-neutral-100`}>
            {card.team}
          </span>
        </div>
      </div>

      {/* CARD FOOTER: Nickname & Info Panel */}
      <div className="bg-black/80 px-2.5 py-3 z-10 text-center flex flex-col border-t border-neutral-800/80 gap-1">
        <span className="text-sm font-serif font-bold tracking-wider text-white uppercase truncate px-1 font-sans">
          {card.nickname}
        </span>

        {/* Optional Tribute Lines for historic flavor */}
        {card.flavor && size !== 'sm' && (
          <p className="text-[10px] text-neutral-400 font-sans italic line-clamp-2 mt-1 px-1 text-center opacity-70 leading-normal">
            "{card.flavor}"
          </p>
        )}
      </div>

      {/* Glowing rarity bottom strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${decors.glowBanner} mt-auto`} />
    </div>
  );
};
