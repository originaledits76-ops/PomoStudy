import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Heart,
  Cookie,
  Award,
  Gamepad2,
  Wind,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Volume2,
  Edit2,
  Check,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import { PokiState, PokiSpecies, PokiEvolutionStage } from '../types';
import { StorageService } from '../utils/storage';
import { sound } from '../utils/soundEngine';
import { PokiCharacter } from './PokiCharacter';

interface PokiViewProps {
  poki: PokiState;
  onUpdatePoki: (updated: PokiState) => void;
  soundMuted: boolean;
  totalFocusMinutes: number;
  streakDays: number;
}

// Species metadata and 5-stage evolution trees
export const SPECIES_CONFIG: Record<
  PokiSpecies,
  {
    name: string;
    icon: string;
    description: string;
    themeColor: string;
    stages: Record<PokiEvolutionStage, { title: string; subtitle: string; icon: string; minLevel: number }>;
  }
> = {
  plant: {
    name: 'Botanical Scholar',
    icon: '🌱',
    description: 'A soothing plant companion that flourishes into an ancient tree of wisdom through dedicated study sessions.',
    themeColor: 'from-emerald-500 to-teal-600',
    stages: {
      1: { title: 'Sprout Seedling', subtitle: 'A gentle seedling of discipline planted in your study pot.', icon: '🌱', minLevel: 1 },
      2: { title: 'Leafy Blossom', subtitle: 'Blooming soft petals as daily study habits take firm root.', icon: '🌸', minLevel: 2 },
      3: { title: 'Scholar Bonsai', subtitle: 'Artfully shaped by deep work, holding notes of wisdom.', icon: '🪴', minLevel: 5 },
      4: { title: 'Wisdom Sakura', subtitle: 'Majestic flowering cherry tree with serene focus energy.', icon: '🌸', minLevel: 10 },
      5: { title: 'Astral Yggdrasil', subtitle: 'Cosmic world tree of supreme academic mastery and insight.', icon: '🌳', minLevel: 20 },
    },
  },
  bird: {
    name: 'Avian Scholar',
    icon: '🐦',
    description: 'A soaring feathered companion that evolves from a curious chick into a celestial phoenix of relentless drive.',
    themeColor: 'from-sky-500 to-indigo-600',
    stages: {
      1: { title: 'Pip Chick', subtitle: 'A fluffy nestling eager to absorb knowledge by your side.', icon: '🐣', minLevel: 1 },
      2: { title: 'Fledgling Bluebird', subtitle: 'Taking flight with sharp focus and enthusiastic curiosity.', icon: '🐦', minLevel: 2 },
      3: { title: 'Scholar Owl', subtitle: 'Erudite night and day reader with profound critical thinking.', icon: '🦉', minLevel: 5 },
      4: { title: 'Sunfire Falcon', subtitle: 'Razor-sharp raptor with unstoppable exam prep velocity.', icon: '🦅', minLevel: 10 },
      5: { title: 'Astral Phoenix', subtitle: 'Mythic celestial bird reborn from every difficult challenge.', icon: '🔥', minLevel: 20 },
    },
  },
  butterfly: {
    name: 'Metamorphosis',
    icon: '🦋',
    description: 'A transformative insect companion mirroring the student journey from arduous reading into brilliant intellectual clarity.',
    themeColor: 'from-purple-500 to-pink-600',
    stages: {
      1: { title: 'Silky Caterpillar', subtitle: 'Patiently munching through textbooks and lecture notes.', icon: '🐛', minLevel: 1 },
      2: { title: 'Crystal Chrysalis', subtitle: 'Quiet incubation and neural consolidation during deep rest.', icon: '🔮', minLevel: 2 },
      3: { title: 'Monarch Apprentice', subtitle: 'Spreading vibrant wings with new understanding and confidence.', icon: '🦋', minLevel: 5 },
      4: { title: 'Moonlit Morpho', subtitle: 'Bioluminescent cyan wings radiating calm, effortless focus.', icon: '✨', minLevel: 10 },
      5: { title: 'Celestial Prismwing', subtitle: 'Transcendent stardust wings representing effortless flow state.', icon: '🌌', minLevel: 20 },
    },
  },
};

const STUDENT_STUDY_DIALOGUES = [
  "Active recall and self-testing beats re-reading by over 50%! Keep testing yourself.",
  "You're making real cognitive progress today. 1% better every session!",
  "Take a sip of water — hydrated brains process complex concepts significantly faster.",
  "Deep breaths. Break difficult assignments into 15-minute bite-sized chunks.",
  "Spaced repetition is the secret to retaining formulas and vocabulary long-term.",
  "I'm super proud of your dedication today! Let's conquer this next pomodoro together.",
  "Resting during breaks without phone screens resets dopamine and prevents brain fog.",
  "Consistent daily effort compound into extraordinary exam scores and mastery.",
];

const SHOP_ITEMS = [
  { id: 'hat_sprout', name: 'Sprout Leaf', type: 'hat', cost: 0, icon: '🌱', desc: 'A fresh little seedling symbolizing daily growth.' },
  { id: 'hat_grad', name: 'Graduation Cap', type: 'hat', cost: 4, icon: '🎓', desc: 'Symbol of academic excellence and milestone achievement.' },
  { id: 'hat_halo', name: 'Zen Halo', type: 'hat', cost: 8, icon: '✨', desc: 'Radiates calm tranquility during intense exam cramming.' },
  { id: 'hat_wizard', name: 'Sage Hat', type: 'hat', cost: 12, icon: '🧙‍♂️', desc: 'Infused with ancient study spells and focus magic.' },
  { id: 'glass_specs', name: 'Round Glasses', type: 'glasses', cost: 3, icon: '👓', desc: 'For 20/20 critical thinking and deep reading.' },
  { id: 'glass_shades', name: 'Cool Shades', type: 'glasses', cost: 6, icon: '🕶️', desc: 'Stay calm and unflappable under exam pressure.' },
  { id: 'aura_sparkle', name: 'Stardust Aura', type: 'aura', cost: 10, icon: '💫', desc: 'Swirling celestial stardust particles.' },
  { id: 'aura_fire', name: 'Flame of Passion', type: 'aura', cost: 15, icon: '🔥', desc: 'Unstoppable academic drive and relentless study fire.' },
];

export const PokiView: React.FC<PokiViewProps> = ({
  poki,
  onUpdatePoki,
  soundMuted,
  totalFocusMinutes,
  streakDays,
}) => {
  const [activeTab, setActiveTab] = useState<'pet' | 'species' | 'wardrobe' | 'minigames'>('pet');
  const [speechBubble, setSpeechBubble] = useState<string>(
    "Hi there! I'm your student study companion! Focus with the timer to help me evolve! 🌟"
  );
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [customNameInput, setCustomNameInput] = useState<string>(poki.name || 'Poki');

  // Mini-game states
  const [bubbles, setBubbles] = useState<boolean[]>([false, false, false, false, false, false, false, false, false]);
  const [bubblesPoppedCount, setBubblesPoppedCount] = useState<number>(0);

  const currentSpecies = poki.species || 'plant';
  const speciesData = SPECIES_CONFIG[currentSpecies];
  const currentStageInfo = speciesData.stages[poki.evolution];

  const currentLevelBaseXp = (poki.level - 1) * 50;
  const xpInCurrentLevel = Math.max(0, poki.xp - currentLevelBaseXp);
  const xpNeededForLevel = 50;
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));

  // Change Species
  const handleSelectSpecies = (newSpecies: PokiSpecies) => {
    if (newSpecies === currentSpecies) return;
    if (!soundMuted) sound.playSuccess();

    const updated: PokiState = {
      ...poki,
      species: newSpecies,
    };
    StorageService.savePoki(updated);
    onUpdatePoki(updated);

    const speciesName = SPECIES_CONFIG[newSpecies].stages[poki.evolution].title;
    setSpeechBubble(`Transformed into ${speciesName}! Ready to study together! ✨`);

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  // Poke Poki interaction
  const handlePoke = () => {
    setIsInteracting(true);
    if (!soundMuted) sound.playClick();

    // Random student quote
    const randomQuote = STUDENT_STUDY_DIALOGUES[Math.floor(Math.random() * STUDENT_STUDY_DIALOGUES.length)];
    setSpeechBubble(randomQuote);

    // Sparkle confetti if happiness high
    if (poki.happiness >= 80) {
      try {
        confetti({
          particleCount: 18,
          spread: 45,
          origin: { y: 0.55 },
          colors: ['#10b981', '#38bdf8', '#fbbf24', '#a855f7'],
        });
      } catch {}
    }

    setTimeout(() => setIsInteracting(false), 600);
  };

  // Feed Poki
  const handleFeed = () => {
    const result = StorageService.feedPoki();
    if (result.success) {
      if (!soundMuted) sound.playSuccess();
      onUpdatePoki(result.poki);
      setSpeechBubble("Yummy! That focus treat was super energizing! (+15 XP, +20 Happiness) 🫐");
      setIsInteracting(true);
      setTimeout(() => setIsInteracting(false), 600);

      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#ec4899', '#8b5cf6', '#10b981'],
        });
      } catch {}
    } else {
      setSpeechBubble(result.message);
    }
  };

  // Rename Poki
  const handleSaveName = () => {
    const trimmed = customNameInput.trim();
    if (!trimmed) return;
    const updated = { ...poki, name: trimmed };
    StorageService.savePoki(updated);
    onUpdatePoki(updated);
    setIsEditingName(false);
    if (!soundMuted) sound.playClick();
    setSpeechBubble(`I love my name, ${trimmed}! Let's do some deep work! 📚`);
  };

  // Equip / Buy item
  const handleItemAction = (item: typeof SHOP_ITEMS[0]) => {
    const isUnlocked = poki.unlockedItems.includes(item.id);

    if (isUnlocked) {
      // Toggle equip
      let updatedHat = poki.equippedHat;
      let updatedGlasses = poki.equippedGlasses;
      let updatedAura = poki.equippedAura;

      if (item.type === 'hat') {
        updatedHat = poki.equippedHat === item.id ? null : item.id;
      } else if (item.type === 'glasses') {
        updatedGlasses = poki.equippedGlasses === item.id ? null : item.id;
      } else if (item.type === 'aura') {
        updatedAura = poki.equippedAura === item.id ? null : item.id;
      }

      const updated = {
        ...poki,
        equippedHat: updatedHat,
        equippedGlasses: updatedGlasses,
        equippedAura: updatedAura,
      };
      StorageService.savePoki(updated);
      onUpdatePoki(updated);
      if (!soundMuted) sound.playClick();
      setSpeechBubble(`Look at my new study outfit! Ready to ace exams! 🎓`);
    } else {
      // Purchase
      if (poki.treats < item.cost) {
        setSpeechBubble(`Need ${item.cost} Focus Treats to unlock this! Complete more Pomodoro focus cycles.`);
        return;
      }

      const updated: PokiState = {
        ...poki,
        treats: poki.treats - item.cost,
        unlockedItems: [...poki.unlockedItems, item.id],
      };
      if (item.type === 'hat') updated.equippedHat = item.id;
      if (item.type === 'glasses') updated.equippedGlasses = item.id;
      if (item.type === 'aura') updated.equippedAura = item.id;

      StorageService.savePoki(updated);
      onUpdatePoki(updated);
      if (!soundMuted) sound.playSuccess();
      setSpeechBubble(`Unlocked ${item.name}! Looking scholarly! 🎉`);

      try {
        confetti({
          particleCount: 30,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  };

  // Pop bubble in mindful game
  const handlePopBubble = (index: number) => {
    if (bubbles[index]) return;
    const newBubbles = [...bubbles];
    newBubbles[index] = true;
    setBubbles(newBubbles);
    setBubblesPoppedCount((prev) => prev + 1);
    if (!soundMuted) sound.playClick();

    if (newBubbles.every(Boolean)) {
      if (!soundMuted) sound.playSuccess();
      setSpeechBubble('All bubbles popped! Mind refreshed and ready for your next study block! 🫧');
      setTimeout(() => {
        setBubbles([false, false, false, false, false, false, false, false, false]);
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-28 px-2 sm:px-4">
      {/* Top Header Card */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-zinc-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-950 text-white text-xs font-bold font-rounded shadow-xs">
                Lv. {poki.level} • {currentStageInfo.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold font-rounded">
                {speciesData.icon} {speciesData.name}
              </span>
              <span className="text-xs font-bold text-zinc-500 font-rounded">
                Stage {poki.evolution} of 5
              </span>
            </div>

            {/* Companion Name with Inline Edit */}
            <div className="flex items-center gap-2 pt-1">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                    }}
                    maxLength={16}
                    autoFocus
                    className="px-3 py-1 text-lg sm:text-2xl font-extrabold text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-950 font-display"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
                    {poki.name || 'Poki'}
                  </h1>
                  <button
                    onClick={() => {
                      setCustomNameInput(poki.name || 'Poki');
                      setIsEditingName(true);
                    }}
                    className="opacity-60 hover:opacity-100 text-zinc-500 hover:text-zinc-900 transition-opacity p-1"
                    title="Rename Companion"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 font-rounded max-w-lg">
              {currentStageInfo.subtitle}
            </p>
          </div>

          {/* Currency and Happiness Pills */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl liquid-glass-subtle border border-amber-200/70 shadow-2xs">
              <span className="text-xl">🫐</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Study Treats</p>
                <p className="text-sm font-extrabold text-zinc-900 font-mono">{poki.treats}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl liquid-glass-subtle border border-rose-200/70 shadow-2xs">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Mood</p>
                <p className="text-sm font-extrabold text-zinc-900 font-mono">{poki.happiness}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* XP Level Progress Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-200/60">
          <div className="flex justify-between items-center text-xs font-bold text-zinc-700 mb-1.5 font-rounded">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Next Evolution Progress</span>
            </span>
            <span className="font-mono text-zinc-500">
              {xpInCurrentLevel} / {xpNeededForLevel} XP ({xpPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-center">
        <div className="liquid-glass-subtle rounded-full p-1.5 flex flex-wrap items-center justify-center gap-1 shadow-xs border border-zinc-200/70">
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('pet');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'pet' ? 'liquid-pill-active text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Companion</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('species');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'species' ? 'liquid-pill-active text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Choose Species</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('wardrobe');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'wardrobe' ? 'liquid-pill-active text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Scholar Wardrobe</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('minigames');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'minigames' ? 'liquid-pill-active text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Mindful Breaks</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PET MAIN VIEW */}
      {activeTab === 'pet' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Interactive Stage */}
          <div className="md:col-span-2 liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between min-h-[420px] relative text-center border border-zinc-200/80 shadow-sm">
            {/* Speech Bubble */}
            <div className="relative z-10 max-w-md px-5 py-3.5 rounded-2xl bg-white/95 border border-zinc-200 text-zinc-800 text-xs sm:text-sm font-semibold shadow-md mb-4 font-rounded">
              {speechBubble}
              {/* Little triangle arrow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-zinc-200 transform rotate-45" />
            </div>

            {/* Ultra-Smooth 60fps Vector Character Stage */}
            <div className="relative my-4 flex items-center justify-center select-none">
              <PokiCharacter
                species={currentSpecies}
                evolution={poki.evolution}
                happiness={poki.happiness}
                equippedHat={poki.equippedHat}
                equippedGlasses={poki.equippedGlasses}
                equippedAura={poki.equippedAura}
                isInteracting={isInteracting}
                size={230}
                onClick={handlePoke}
              />
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm mt-4">
              <button
                onClick={handleFeed}
                disabled={poki.treats <= 0}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all active:scale-95 shadow-md font-rounded min-h-[44px] ${
                  poki.treats > 0
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                }`}
              >
                <Cookie className="w-4 h-4 text-amber-300" />
                <span>Feed Treat ({poki.treats} left)</span>
              </button>

              <button
                onClick={handlePoke}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-bold transition-all active:scale-95 shadow-2xs font-rounded min-h-[44px]"
              >
                Study Poke ✨
              </button>
            </div>
          </div>

          {/* Right Stats & Quests Card */}
          <div className="space-y-4">
            {/* Student Study Stats */}
            <div className="liquid-glass rounded-3xl p-6 border border-zinc-200/80 shadow-sm">
              <h2 className="text-xs uppercase tracking-wider font-extrabold text-zinc-500 mb-3 font-rounded flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student Academic Lore</span>
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-zinc-200/80 text-xs font-rounded">
                  <span className="text-zinc-600">Total Study Time</span>
                  <span className="font-extrabold text-zinc-900 font-mono">{totalFocusMinutes} mins</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-zinc-200/80 text-xs font-rounded">
                  <span className="text-zinc-600">Active Study Streak</span>
                  <span className="font-extrabold text-amber-600 font-mono">🔥 {streakDays} days</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-zinc-200/80 text-xs font-rounded">
                  <span className="text-zinc-600">Companion Lifetime XP</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{poki.xp} XP</span>
                </div>
              </div>
            </div>

            {/* Evolution Milestones for Current Species */}
            <div className="liquid-glass rounded-3xl p-6 border border-zinc-200/80 shadow-sm">
              <h2 className="text-xs uppercase tracking-wider font-extrabold text-zinc-500 mb-3 font-rounded flex items-center justify-between">
                <span>{speciesData.name} Stages</span>
                <span className="text-[10px] text-zinc-500 font-normal">Level milestones</span>
              </h2>

              <div className="space-y-2.5">
                {([1, 2, 3, 4, 5] as PokiEvolutionStage[]).map((st) => {
                  const info = speciesData.stages[st];
                  const isReached = poki.evolution >= st;
                  const isCurrent = poki.evolution === st;

                  return (
                    <div
                      key={st}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border text-xs transition-all font-rounded ${
                        isCurrent
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                          : isReached
                          ? 'bg-white/70 border-zinc-200/80 text-zinc-700'
                          : 'bg-zinc-50/50 border-zinc-200/50 text-zinc-400 opacity-60'
                      }`}
                    >
                      <span className="text-lg">{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{info.title}</p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {st === 1 ? 'Starting stage' : `Unlocks at Lv. ${info.minLevel}`}
                        </p>
                      </div>
                      {isReached && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPECIES SELECTOR */}
      {activeTab === 'species' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-zinc-200/80 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 font-display tracking-tight">
              Select Your Study Companion Species
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-rounded mt-1">
              Choose the companion archetype that inspires your study rhythm. Your level, treats, and XP are fully preserved when switching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {(['plant', 'bird', 'butterfly'] as PokiSpecies[]).map((sp) => {
              const cfg = SPECIES_CONFIG[sp];
              const isSelected = currentSpecies === sp;

              return (
                <div
                  key={sp}
                  onClick={() => handleSelectSpecies(sp)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-white border-zinc-950 shadow-lg scale-[1.02]'
                      : 'bg-white/60 hover:bg-white/90 border-zinc-200/80 hover:border-zinc-300'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-zinc-950 text-white text-[10px] font-extrabold uppercase font-rounded shadow-xs">
                      Active
                    </div>
                  )}

                  <div>
                    {/* Species Vector Mini Preview */}
                    <div className="flex items-center justify-center my-4">
                      <div className="w-32 h-32 flex items-center justify-center">
                        <PokiCharacter
                          species={sp}
                          evolution={poki.evolution}
                          happiness={poki.happiness}
                          size={120}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{cfg.icon}</span>
                      <h3 className="text-base font-extrabold text-zinc-900 font-display">
                        {cfg.name}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 font-rounded leading-relaxed">
                      {cfg.description}
                    </p>

                    {/* Stage Preview List */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider font-rounded">
                        Evolution Path:
                      </p>
                      <div className="text-[11px] text-zinc-700 font-rounded space-y-1">
                        {Object.values(cfg.stages).map((st, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span>{st.icon}</span>
                            <span className="font-semibold">{st.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all font-rounded min-h-[44px] ${
                      isSelected
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    {isSelected ? 'Currently Selected' : `Select ${cfg.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WARDROBE & ACCESSORIES SHOP */}
      {activeTab === 'wardrobe' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-zinc-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 font-display">
                Scholar Wardrobe & Accessories
              </h2>
              <p className="text-xs text-zinc-600 font-rounded mt-0.5">
                Spend Study Treats earned from completed focus sessions to customize your companion.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold font-mono shadow-2xs">
              <span>🫐 {poki.treats} Study Treats</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHOP_ITEMS.map((item) => {
              const isUnlocked = poki.unlockedItems.includes(item.id);
              const isEquipped =
                poki.equippedHat === item.id ||
                poki.equippedGlasses === item.id ||
                poki.equippedAura === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                      : isUnlocked
                      ? 'bg-white/85 border-zinc-200 text-zinc-900 shadow-2xs'
                      : 'bg-white/55 border-zinc-200/80 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{item.icon}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isEquipped
                          ? 'bg-emerald-500 text-white'
                          : isUnlocked
                          ? 'bg-zinc-100 text-zinc-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isEquipped ? 'Equipped' : isUnlocked ? 'Owned' : `Cost: ${item.cost} 🫐`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold font-rounded">{item.name}</h3>
                    <p className={`text-xs mt-1 line-clamp-2 ${isEquipped ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleItemAction(item)}
                    className={`mt-4 w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 font-rounded min-h-[44px] ${
                      isEquipped
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : isUnlocked
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : poki.treats >= item.cost
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'Unequip' : isUnlocked ? 'Equip' : `Unlock (${item.cost} 🫐)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MINDFUL BREAK MINIGAMES */}
      {activeTab === 'minigames' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game 1: Zen Bubble Popper */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-zinc-200/80 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold font-rounded">
                  Decompression Pad
                </span>
                <span className="text-xs font-mono font-bold text-zinc-500">
                  {bubblesPoppedCount} Popped
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-zinc-900 font-display">
                Zen Bubble Popper
              </h2>
              <p className="text-xs text-zinc-600 font-rounded mt-1">
                Pop the bubbles during your short break to relax eye fatigue and release muscle tension.
              </p>
            </div>

            {/* Bubble Grid */}
            <div className="grid grid-cols-3 gap-3 my-6 max-w-xs mx-auto w-full">
              {bubbles.map((isPopped, i) => (
                <button
                  key={i}
                  onClick={() => handlePopBubble(i)}
                  className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 transform min-h-[44px] ${
                    isPopped
                      ? 'bg-zinc-100 border border-zinc-200 scale-90 opacity-40 shadow-inner'
                      : 'bg-gradient-to-tr from-cyan-200 via-sky-100 to-white border-2 border-white shadow-md hover:scale-105 active:scale-75'
                  }`}
                >
                  <span className="text-xl select-none">{isPopped ? '💨' : '🫧'}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setBubbles([false, false, false, false, false, false, false, false, false]);
                if (!soundMuted) sound.playClick();
              }}
              className="w-full py-2.5 rounded-2xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold transition-all active:scale-95 font-rounded flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Bubbles</span>
            </button>
          </div>

          {/* Game 2: Mindful Breath Sync */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center border border-zinc-200/80 shadow-sm">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold font-rounded">
                Vagus Nerve Reset
              </span>
              <h2 className="text-lg font-extrabold text-zinc-900 font-display mt-2">
                Mindful Breathing Sphere
              </h2>
              <p className="text-xs text-zinc-600 font-rounded mt-1">
                Synchronize your diaphragm with the expanding and contracting rhythm.
              </p>
            </div>

            {/* Animated Breath Ring */}
            <div className="my-8 relative flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-emerald-400/20 animate-ping absolute inset-0 -m-2 opacity-40" />
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-1 flex items-center justify-center shadow-xl animate-pulse">
                <div className="w-full h-full rounded-full bg-white/95 flex flex-col items-center justify-center p-4">
                  <Wind className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="text-sm font-extrabold text-zinc-900 font-rounded">Breathe</span>
                  <span className="text-[10px] text-zinc-500 font-mono">4s In • 4s Out</span>
                </div>
              </div>
            </div>

            <div className="w-full p-3 rounded-2xl bg-white/60 border border-zinc-200 text-xs text-zinc-700 font-rounded">
              <p className="font-semibold">Take 3 deep slow breaths to recharge oxygen levels.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
