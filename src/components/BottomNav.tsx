import React from 'react';
import { Timer, CheckSquare, BarChart3, Sparkles, SlidersHorizontal } from 'lucide-react';
import { NavTab } from '../types';
import { sound } from '../utils/soundEngine';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onTabChange?: (tab: NavTab) => void;
  soundMuted: boolean;
  taskBadgeCount?: number;
  tasksPendingCount?: number;
  pokiBadgeLevel?: number;
  pokiHappiness?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onTabChange,
  soundMuted,
  taskBadgeCount,
  tasksPendingCount,
  pokiBadgeLevel,
  pokiHappiness,
}) => {
  const handleTabChange = (tab: NavTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (onTabChange) {
      onTabChange(tab);
    }
  };

  const pendingCount = taskBadgeCount ?? tasksPendingCount ?? 0;
  const pokiLevel = pokiBadgeLevel ?? (pokiHappiness && pokiHappiness >= 90 ? '✨' : undefined);

  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    { id: 'timer', label: 'Focus', icon: Timer },
    { id: 'tasks', label: 'Todo', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'poki', label: 'Poki', icon: Sparkles, badge: pokiLevel ? `Lv.${pokiLevel}` : undefined },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  ];

  return (
    <nav className="fixed bottom-3 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto liquid-glass-nav rounded-full p-1.5 flex items-center gap-1 shadow-2xl max-w-md w-full justify-between sm:justify-center sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!soundMuted && !isActive) sound.playClick();
                handleTabChange(tab.id);
              }}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 select-none ${
                isActive
                  ? 'liquid-pill-active text-white'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/5'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className={`tracking-wide font-rounded ${isActive ? 'inline' : 'hidden sm:inline'}`}>
                {tab.label}
              </span>

              {/* Badges */}
              {tab.badge && !isActive && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-zinc-900 text-[10px] font-bold text-white shadow-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
