import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  User,
  BookOpen,
  Sliders,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';
import { sound } from '../utils/soundEngine';

interface OnboardingFlowProps {
  initialProfile: UserProfile;
  initialSettings: AppSettings;
  soundMuted: boolean;
  onComplete: (profile: UserProfile, settings: AppSettings) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialProfile,
  initialSettings,
  soundMuted,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Form states
  const [username, setUsername] = useState(initialProfile.username || '');
  const [targetHours, setTargetHours] = useState(initialProfile.dailyGoalHours || 3);
  const [primarySubject, setPrimarySubject] = useState(initialProfile.primarySubject || 'General Studies');
  const [customSubject, setCustomSubject] = useState('');
  const [selectedRhythm, setSelectedRhythm] = useState<'classic' | 'extended' | 'deep' | 'custom'>('classic');
  const [customFocusTime, setCustomFocusTime] = useState(initialSettings.focusTime || 25);
  const [customBreakTime, setCustomBreakTime] = useState(initialSettings.shortBreakTime || 5);
  const [motto, setMotto] = useState(initialProfile.bio || 'Deep Work & Continuous Growth');

  // Subjects presets
  const subjectPresets = [
    'Computer Science',
    'Medicine & Health',
    'Mathematics & Physics',
    'Law & Governance',
    'Engineering',
    'Finance & Economics',
    'Languages & Literature',
    'General Studies',
  ];

  // Rhythms
  const rhythms = [
    {
      id: 'classic',
      name: 'Classic Pomodoro',
      focus: 25,
      break: 5,
      desc: '25 min focus + 5 min break • Ideal for steady pace & anti-fatigue',
    },
    {
      id: 'extended',
      name: 'Extended Flow',
      focus: 50,
      break: 10,
      desc: '50 min focus + 10 min break • Great for complex problem solving',
    },
    {
      id: 'deep',
      name: 'Deep Ultradian',
      focus: 90,
      break: 20,
      desc: '90 min focus + 20 min rest • Maximum cognitive immersion block',
    },
    {
      id: 'custom',
      name: 'Custom Duration',
      focus: customFocusTime,
      break: customBreakTime,
      desc: 'Configure your own preferred focus and rest intervals',
    },
  ];

  // Calculate pomodoro sessions based on target hours and selected rhythm
  const getFocusMinutes = () => {
    if (selectedRhythm === 'classic') return 25;
    if (selectedRhythm === 'extended') return 50;
    if (selectedRhythm === 'deep') return 90;
    return customFocusTime;
  };

  const getBreakMinutes = () => {
    if (selectedRhythm === 'classic') return 5;
    if (selectedRhythm === 'extended') return 10;
    if (selectedRhythm === 'deep') return 20;
    return customBreakTime;
  };

  const currentFocusMin = getFocusMinutes();
  const calculatedPomodoros = Math.max(1, Math.round((targetHours * 60) / currentFocusMin));
  const calculatedTotalMinutes = targetHours * 60;

  const handleNext = () => {
    if (!soundMuted) sound.playClick();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (!soundMuted) sound.playClick();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    if (!soundMuted) sound.playClick();

    const finalSubject = customSubject.trim() || primarySubject;
    const finalProfile: UserProfile = {
      username: username.trim() || 'Focus Scholar',
      dailyGoalHours: targetHours,
      dailyGoalPomodoros: calculatedPomodoros,
      dailyGoalMinutes: calculatedTotalMinutes,
      primarySubject: finalSubject,
      focusRhythm: selectedRhythm,
      bio: motto.trim() || 'Deep Work & Continuous Growth',
      joinedAt: initialProfile.joinedAt || new Date().toISOString(),
      hasCompletedOnboarding: true,
    };

    const finalSettings: AppSettings = {
      ...initialSettings,
      focusTime: currentFocusMin,
      shortBreakTime: getBreakMinutes(),
      longBreakTime: selectedRhythm === 'deep' ? 25 : 15,
    };

    onComplete(finalProfile, finalSettings);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between p-4 sm:p-8 selection:bg-zinc-900 selection:text-white">
      {/* Top Header Navigation */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between py-4 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs tracking-tighter">
            P
          </div>
          <span className="font-bold text-sm tracking-tight font-display">PomoStudy</span>
          <span className="text-[11px] font-mono text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50">
            Setup
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-600 font-medium">
            0{step} <span className="text-zinc-500">/</span> 0{totalSteps}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? 'w-6 bg-zinc-950'
                    : i + 1 < step
                    ? 'w-2 bg-zinc-400'
                    : 'w-2 bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Form Center Box */}
      <main className="w-full max-w-xl mx-auto my-auto py-8 sm:py-12">
        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 font-bold">
                Step 01 • Personalize
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 font-display tracking-tight">
                What should we call you?
              </h1>
              <p className="text-sm text-zinc-600 mt-1.5">
                Set up your profile to track your study streaks and personalized analytics.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  Your Name / Handle <span className="text-zinc-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Alex, Maya, or Dr. Chen"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && username.trim()) handleNext();
                    }}
                    className="w-full bg-white border border-zinc-300 focus:border-zinc-950 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  Study Motto or Semester Objective (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master algorithms, Ace MCAT, or Build daily focus habit"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && username.trim()) handleNext();
                  }}
                  className="w-full bg-white border border-zinc-300 focus:border-zinc-950 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TARGET HOURS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 font-bold">
                Step 02 • Daily Commitment
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 font-display tracking-tight">
                How many hours do you want to study daily?
              </h1>
              <p className="text-sm text-zinc-600 mt-1.5">
                We will calculate your target sessions and track your daily streak milestones.
              </p>
            </div>

            {/* Target Hours Visual Card */}
            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 text-center space-y-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-extrabold font-mono tracking-tighter text-zinc-950">
                  {targetHours}
                </span>
                <span className="text-xl font-bold text-zinc-600">
                  {targetHours === 1 ? 'hour' : 'hours'} / day
                </span>
              </div>

              {/* Slider */}
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={targetHours}
                  onChange={(e) => setTargetHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg cursor-pointer accent-zinc-950"
                />
                <div className="flex justify-between text-[11px] font-mono text-zinc-600 mt-1">
                  <span>1h</span>
                  <span>3h</span>
                  <span>6h</span>
                  <span>9h</span>
                  <span>12h</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {[1, 2, 3, 4, 6, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      if (!soundMuted) sound.playClick();
                      setTargetHours(h);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      targetHours === h
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>

              {/* Converted Stats Summary */}
              <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-around text-xs text-zinc-600 font-mono">
                <div>
                  <span className="block font-extrabold text-sm text-zinc-950">
                    {calculatedPomodoros}
                  </span>
                  <span>Target Pomodoros</span>
                </div>
                <div className="w-px h-6 bg-zinc-200" />
                <div>
                  <span className="block font-extrabold text-sm text-zinc-950">
                    {calculatedTotalMinutes}m
                  </span>
                  <span>Total Focus Mins</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FOCUS SUBJECTS */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 font-bold">
                Step 03 • Study Domain
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 font-display tracking-tight">
                What are you focusing on?
              </h1>
              <p className="text-sm text-zinc-600 mt-1.5">
                Select your primary discipline or type a custom tag to organize your study logs.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                {subjectPresets.map((sub) => {
                  const isSelected = primarySubject === sub && !customSubject.trim();
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        if (!soundMuted) sound.playClick();
                        setPrimarySubject(sub);
                        setCustomSubject('');
                      }}
                      className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                          : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    >
                      <span className="truncate">{sub}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Subject Input */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  Or enter a specific topic / course
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry, USMLE Step 1, LeetCode..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full bg-white border border-zinc-300 focus:border-zinc-950 rounded-xl px-4 py-2.5 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FOCUS RHYTHM & SUMMARY */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 font-bold">
                Step 04 • Timer Rhythm
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 font-display tracking-tight">
                Choose your focus cadence
              </h1>
              <p className="text-sm text-zinc-600 mt-1.5">
                Pick a session length that matches your cognitive stamina. You can adjust this anytime.
              </p>
            </div>

            <div className="space-y-2.5">
              {rhythms.map((r) => {
                const isSelected = selectedRhythm === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      if (!soundMuted) sound.playClick();
                      setSelectedRhythm(r.id as any);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{r.name}</span>
                        <span
                          className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {r.focus}m / {r.break}m
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {r.desc}
                      </p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Interval inputs if 'custom' selected */}
            {selectedRhythm === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Focus Time (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customFocusTime}
                    onChange={(e) => setCustomFocusTime(Math.max(1, parseInt(e.target.value) || 25))}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-mono font-bold text-zinc-950 text-center"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Break Time (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customBreakTime}
                    onChange={(e) => setCustomBreakTime(Math.max(1, parseInt(e.target.value) || 5))}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-mono font-bold text-zinc-950 text-center"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Navigation Bar */}
      <footer className="w-full max-w-2xl mx-auto flex items-center justify-between pt-4 border-t border-zinc-200">
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <span className="text-xs text-zinc-600 font-mono">100% Offline Local Storage</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {step === 1 && (
            <button
              type="button"
              onClick={() => {
                setUsername('Focus Scholar');
                handleNext();
              }}
              className="px-3 py-2 text-xs text-zinc-600 hover:text-zinc-950 font-medium transition-colors"
            >
              Skip
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <span>{step === totalSteps ? 'Start Focusing' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
