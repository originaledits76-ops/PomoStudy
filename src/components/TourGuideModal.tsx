import React, { useState } from 'react';
import {
  Sparkles,
  Timer,
  CheckSquare,
  BarChart3,
  Headphones,
  Maximize2,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Zap,
  Flame,
  BookOpen,
  Keyboard,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NavTab } from '../types';
import { sound } from '../utils/soundEngine';

interface TourGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  soundMuted: boolean;
}

interface TourStep {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  description: string;
  highlights: { icon: string; title: string; text: string }[];
  targetTab?: NavTab;
  tabCtaText?: string;
  visualPreview: React.ReactNode;
}

export const TourGuideModal: React.FC<TourGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  soundMuted,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      id: 'timer',
      badge: 'Step 1 of 5 • Core Focus',
      badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200/60',
      title: 'Smart Pomodoro Timer',
      tagline: 'Scientific work/rest intervals designed for students',
      description:
        'PomoStudy alternates between 25-minute deep focus sprints and 5-minute restorative breaks to maximize cognitive retention and eliminate mental fatigue.',
      highlights: [
        {
          icon: '⚡',
          title: 'Quick Nudges',
          text: 'Use the +/- 1m or +/- 5m pills to adjust timer duration anytime on the fly.',
        },
        {
          icon: '⌨️',
          title: 'Spacebar Shortcut',
          text: 'Press Space anywhere on your keyboard to instantly play or pause your session.',
        },
        {
          icon: '🔔',
          title: 'Crystal Chimes',
          text: 'Gentle, scientifically calibrated acoustic alerts sound when sessions finish.',
        },
      ],
      targetTab: 'timer',
      tabCtaText: 'View Timer',
      visualPreview: (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 via-purple-50/60 to-white border border-rose-100/80 flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="w-16 h-16 rounded-full border-4 border-rose-400/30 border-t-rose-500 border-r-purple-500 flex items-center justify-center bg-white shadow-sm">
            <span className="font-mono text-xs font-extrabold text-zinc-900">25:00</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">Focus</span>
            <span className="text-[11px] text-zinc-500 font-medium">Session 1 of 4</span>
          </div>
          <p className="text-[11px] text-zinc-600 font-rounded">Tap Start Focus or press Space</p>
        </div>
      ),
    },
    {
      id: 'tasks',
      badge: 'Step 2 of 5 • Task Management',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200/60',
      title: 'Todo & Assignment Planner',
      tagline: 'Break large syllabi into bite-sized Pomodoro objectives',
      description:
        'Organize assignments by subject, estimate the number of pomodoros needed, and pin your primary task right onto the timer view for zero-friction focus.',
      highlights: [
        {
          icon: '📌',
          title: 'Active Objective Pinning',
          text: 'Click the pin icon on any task to display it proudly on your main focus screen.',
        },
        {
          icon: '🍅',
          title: 'Estimated Tomatoes',
          text: 'Forecast effort per assignment and watch completed tomatoes fill in real-time.',
        },
        {
          icon: '🏷️',
          title: 'Subject Tagging',
          text: 'Color-code by Calculus, Biology, Computer Science, or custom courses.',
        },
      ],
      targetTab: 'tasks',
      tabCtaText: 'Open Todo Planner',
      visualPreview: (
        <div className="w-full p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-indigo-50/60 to-white border border-purple-100/80 space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-100 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-base">📌</span>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-900">Prepare Physics Midterm Summary</p>
                <p className="text-[10px] text-purple-700 font-semibold">Physics • 2/3 🍅</p>
              </div>
            </div>
            <span className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-800">✓</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-zinc-200/60 text-[11px] text-zinc-600">
            <span>Add assignment subtasks</span>
            <span className="text-[10px] text-zinc-400 font-mono">+ New Task</span>
          </div>
        </div>
      ),
    },
    {
      id: 'poki',
      badge: 'Step 3 of 5 • Study Companion',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
      title: 'Meet Poki: Your Virtual Companion',
      tagline: 'Earn study treats, level up, and evolve through 5 stages',
      description:
        'Poki is your dedicated virtual study buddy. Every completed pomodoro earns Study Treats (🫐) to feed Poki, level up, and unlock custom scholar wardrobe accessories!',
      highlights: [
        {
          icon: '🌱',
          title: '3 Species Archetypes',
          text: 'Switch freely between Botanical Scholar (Plant), Avian Bluebird (Bird), or Metamorphosis (Butterfly).',
        },
        {
          icon: '🎓',
          title: 'Scholar Wardrobe',
          text: 'Unlock Graduation Caps, Round Glasses, Sage Hats, and Stardust Auras.',
        },
        {
          icon: '🫧',
          title: 'Mindful Break Minigames',
          text: 'Pop Zen bubbles and sync diaphragm breathing during rest periods.',
        },
      ],
      targetTab: 'poki',
      tabCtaText: 'Meet Your Companion',
      visualPreview: (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-white border border-emerald-100/80 flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl animate-bounce">🌱</span>
            <span className="text-3xl">🐦</span>
            <span className="text-3xl">🦋</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold font-rounded">
            <span>🫐 3 Treats</span>
            <span>•</span>
            <span>Stage 1 of 5</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-rounded">Focus to earn XP & evolve your companion!</p>
        </div>
      ),
    },
    {
      id: 'sound',
      badge: 'Step 4 of 5 • Deep Immersion',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/60',
      title: 'Ambient Audio & Zen Mode',
      tagline: 'Built-in synthetic soundscapes and distraction-free full-screen',
      description:
        'Shield your cognitive focus with pure synthesized sound generators running entirely in your browser without external internet streaming, paired with Zen Fullscreen mode.',
      highlights: [
        {
          icon: '🧠',
          title: '40Hz Gamma Waves',
          text: 'Binaural flow-state frequencies scientifically linked to higher cognitive binding.',
        },
        {
          icon: '🌧️',
          title: 'Rain, Brown & White Noise',
          text: 'Warm low-frequency rumbles and atmospheric rain showers to mask noisy dorms and cafes.',
        },
        {
          icon: '🔲',
          title: 'Zen Fullscreen',
          text: 'Click Zen in the top header to enter an ultra-clean, minimal distraction-free screen.',
        },
      ],
      targetTab: 'timer',
      tabCtaText: 'Try Ambient Sound',
      visualPreview: (
        <div className="w-full p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-white border border-indigo-100/80 space-y-2">
          <div className="grid grid-cols-2 gap-1.5 text-left">
            <div className="p-2 rounded-xl bg-white border border-indigo-100 text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <span>🌧️</span>
              <span className="text-[11px]">Rain Shower</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-indigo-100 text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <span>🧠</span>
              <span className="text-[11px]">40Hz Gamma</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/70 border border-indigo-100/60 flex items-center justify-between text-[11px] text-zinc-600">
            <span>Zen Fullscreen Focus</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-bold">Zen Mode</span>
          </div>
        </div>
      ),
    },
    {
      id: 'analytics',
      badge: 'Step 5 of 5 • Mastery & Growth',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-200/60',
      title: 'Academic Analytics & Daily Streaks',
      tagline: 'Track study hours, consistency heatmaps, and exam prep',
      description:
        'Stay accountable to your daily hour targets. Watch your study streak grow and analyze peak productivity hours and subject breakdown graphs.',
      highlights: [
        {
          icon: '🔥',
          title: 'Unstoppable Streaks',
          text: 'Keep your streak alive with at least one completed session every single day.',
        },
        {
          icon: '📅',
          title: '60-Day GitHub-Style Heatmap',
          text: 'Visualize your daily study volume across weeks and months at a single glance.',
        },
        {
          icon: '📊',
          title: 'Data Privacy & CSV Export',
          text: 'All study data is saved securely in your browser. Export backup files anytime.',
        },
      ],
      targetTab: 'analytics',
      tabCtaText: 'View Analytics',
      visualPreview: (
        <div className="w-full p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-rose-50/50 to-white border border-amber-100/80 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-100 text-xs">
            <span className="font-bold text-zinc-800">Daily Study Target</span>
            <span className="font-mono font-extrabold text-amber-600">3.0 hrs / day</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-100 text-xs">
            <span className="font-bold text-zinc-800">Active Study Streak</span>
            <span className="font-mono font-extrabold text-rose-600">🔥 Day 1+</span>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = tourSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tourSteps.length - 1;

  const handleNext = () => {
    if (!soundMuted) sound.playClick();
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!soundMuted) sound.playClick();
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (!soundMuted) sound.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#a855f7', '#6366f1', '#10b981'],
      });
    } catch {}
    onClose();
  };

  const handleJumpToTab = (tab?: NavTab) => {
    if (tab && onNavigateTab) {
      if (!soundMuted) sound.playClick();
      onNavigateTab(tab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-rose-100/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-purple-50/50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 font-display">
                PomoStudy Quick Tour
              </h3>
              <p className="text-[10px] text-zinc-500 font-medium font-rounded">
                Interactive student guide & master tips
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-5 pt-3 flex items-center gap-1.5">
          {tourSteps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                if (!soundMuted) sound.playClick();
                setCurrentStepIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${
                idx === currentStepIndex
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 shadow-xs'
                  : idx < currentStepIndex
                  ? 'bg-purple-300'
                  : 'bg-zinc-200'
              }`}
              title={`Go to step ${idx + 1}: ${step.title}`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Badge & Title */}
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold font-rounded border mb-1.5 ${currentStep.badgeColor}`}
            >
              {currentStep.badge}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-950 font-display tracking-tight">
              {currentStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-rounded mt-0.5">
              {currentStep.tagline}
            </p>
          </div>

          {/* Visual Interactive Preview Box */}
          <div>{currentStep.visualPreview}</div>

          {/* Key Feature Highlights */}
          <div className="space-y-2 pt-1">
            {currentStep.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/60 hover:border-purple-200 transition-colors text-xs font-rounded"
              >
                <span className="text-base shrink-0 select-none mt-0.5">{h.icon}</span>
                <div className="min-w-0">
                  <span className="font-bold text-zinc-900 mr-1.5">{h.title}:</span>
                  <span className="text-zinc-600 leading-relaxed">{h.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/70 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold font-rounded transition-all active:scale-95 flex items-center gap-1 min-h-[38px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!soundMuted) sound.playClick();
                onClose();
              }}
              className="px-3 py-2 text-zinc-500 hover:text-zinc-900 text-xs font-medium font-rounded transition-colors"
            >
              Skip Tour
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep.targetTab && (
              <button
                onClick={() => handleJumpToTab(currentStep.targetTab)}
                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold font-rounded transition-all active:scale-95 flex items-center gap-1 min-h-[38px]"
                title="Jump directly to this tab"
              >
                <span>{currentStep.tabCtaText || 'Explore Tab'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:via-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold font-rounded transition-all active:scale-95 shadow-md shadow-purple-500/20 flex items-center gap-1.5 min-h-[38px]"
            >
              <span>{isLastStep ? 'Get Started 🎉' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
