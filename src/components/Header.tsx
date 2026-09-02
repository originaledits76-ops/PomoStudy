import React from 'react';
import { Flame, Maximize2, Sparkles, Volume2, VolumeX, Egg } from 'lucide-react';
import { UserProfile, StreakData, NavTab, PokiState } from '../types';
import { sound } from '../utils/soundEngine';

interface HeaderProps {
  profile: UserProfile;
  streak: StreakData;
  poki: PokiState;
  soundMuted: boolean;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onToggleMute: () => void;
  onOpenZen: () => void;
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  streak,
  poki,
  soundMuted,
  currentTab,
  onSelectTab,
  onToggleMute,
  onOpenZen,
  onOpenTour,
}) => {
  return (
    <header className="w-full liquid-glass border-b border-zinc-200/80 sticky top-0 z-30 select-none">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Identity */}
        <div 
          onClick={() => {
            if (!soundMuted) sound.playClick();
            onSelectTab('timer');
          }}
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0 tracking-tight transition-transform group-hover:scale-105">
            P
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-950 font-display truncate">
                PomoStudy
              </h1>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.2 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200/80 shrink-0 hidden xs:inline-block font-rounded">
                Student
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-500 font-medium truncate flex items-center gap-1 font-rounded">
              <span className="font-semibold text-zinc-700 truncate max-w-[80px] sm:max-w-[130px]">
                {profile.username || 'Scholar'}
              </span>
              <span className="text-zinc-300 shrink-0">•</span>
              <span className="text-zinc-600 font-mono shrink-0">
                {profile.dailyGoalHours || 3}h goal
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Tour Guide Button */}
          {onOpenTour && (
            <button
              onClick={() => {
                if (!soundMuted) sound.playClick();
                onOpenTour();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/90 text-zinc-900 text-xs font-bold transition-all active:scale-95 shadow-2xs font-rounded"
              title="Open Interactive Tour Guide"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-800" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          {/* Poki Quick Companion Pill */}
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onSelectTab('poki');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-2xs font-rounded ${
              currentTab === 'poki'
                ? 'liquid-pill-active text-white border-transparent'
                : 'bg-white/85 hover:bg-white border-zinc-200 text-zinc-800'
            }`}
            title="Poki Companion & Rewards"
          >
            <span className="text-xs">🌱</span>
            <span className="font-mono text-xs">Lv.{poki.level}</span>
            <span className="hidden md:inline text-zinc-500 font-normal text-[11px]">
              Poki
            </span>
          </button>

          {/* Streak Counter Pill */}
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onSelectTab('analytics');
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 shadow-2xs font-rounded ${
              currentTab === 'analytics'
                ? 'liquid-pill-active text-white border-transparent'
                : 'bg-white/85 hover:bg-white border-zinc-200 text-zinc-800'
            }`}
            title="Daily Study Streak"
          >
            <Flame className="w-3.5 h-3.5 text-zinc-900 fill-zinc-900" />
            <span className="font-mono text-xs text-zinc-950 font-extrabold">{streak.currentStreak}</span>
            <span className="hidden md:inline text-zinc-500 font-normal text-[11px]">
              {streak.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onToggleMute();
            }}
            className={`p-1.5 sm:p-2 rounded-full border transition-all active:scale-95 shadow-2xs ${
              soundMuted
                ? 'bg-zinc-100 border-zinc-300 text-zinc-400'
                : 'bg-white/85 hover:bg-white border-zinc-200 text-zinc-700'
            }`}
            title={soundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Zen Fullscreen Button */}
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onOpenZen();
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/85 hover:bg-white border border-zinc-200 text-zinc-800 text-xs font-bold transition-all active:scale-95 shadow-2xs font-rounded"
            title="Zen Fullscreen Focus Mode"
          >
            <Maximize2 className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">Zen</span>
          </button>
        </div>
      </div>
    </header>
  );
};

