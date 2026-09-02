import React, { useState } from 'react';
import {
  SlidersHorizontal,
  User,
  Volume2,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings, UserProfile, SoundEffectType } from '../types';
import { sound } from '../utils/soundEngine';
import { StorageService } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  profile: UserProfile;
  soundMuted: boolean;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
  onReopenOnboarding?: () => void;
  onOpenTour?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  profile,
  soundMuted,
  onSaveSettings,
  onSaveProfile,
  onResetAllData,
  onReopenOnboarding,
  onOpenTour,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [localProfile, setLocalProfile] = useState<UserProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<'timer' | 'profile' | 'sound' | 'backup'>('timer');
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soundMuted) sound.playClick();
    onSaveSettings(localSettings);
    onSaveProfile(localProfile);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  const handleTestSound = () => {
    sound.playAlert(localSettings.soundAlertTone, localSettings.soundVolume);
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setLocalSettings((s) => ({ ...s, desktopNotifications: true }));
        new Notification('PomoStudy Notifications Enabled!', {
          body: 'You will receive alerts when focus & break sessions complete.',
        });
      } else {
        setLocalSettings((s) => ({ ...s, desktopNotifications: false }));
      }
    }
  };

  const handleExportBackup = () => {
    if (!soundMuted) sound.playClick();
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomostudy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = StorageService.importBackup(text);
        if (success) {
          alert('Backup imported successfully! Reloading...');
          window.location.reload();
        } else {
          alert('Failed to import backup: invalid file format.');
        }
      } catch {
        alert('Error parsing backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-zinc-950 text-white text-xs font-bold font-rounded shadow-xs">
                Preferences & System
              </span>
              <span className="text-xs font-bold text-zinc-500 font-rounded">
                Offline First
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
              Settings & Customization
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-rounded">
              Fine-tune study rhythms, audio alert synthesizers, and profile targets.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold transition-all active:scale-95 shadow-md font-rounded"
          >
            {saveToast ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{saveToast ? 'Saved Successfully!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-center">
        <div className="liquid-glass-subtle rounded-full p-1 flex items-center gap-1 shadow-xs border border-zinc-200/70 flex-wrap justify-center">
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('timer');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'timer' ? 'liquid-pill-active text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timer & Durations</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('profile');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'profile' ? 'liquid-pill-active text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Daily Goals</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('sound');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'sound' ? 'liquid-pill-active text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio & Bell Tones</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('backup');
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'backup' ? 'liquid-pill-active text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup & Data</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. TIMER & DURATIONS */}
        {activeTab === 'timer' && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-zinc-900 font-display">
              Session Durations (Minutes)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/70 border border-zinc-200/80 space-y-2">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Focus Session
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={localSettings.focusTime}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, focusTime: Math.max(1, parseInt(e.target.value) || 25) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 font-mono font-bold text-center"
                  />
                  <span className="text-xs font-bold text-zinc-500 font-rounded">min</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-zinc-200/80 space-y-2">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Short Break
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.shortBreakTime}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, shortBreakTime: Math.max(1, parseInt(e.target.value) || 5) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 font-mono font-bold text-center"
                  />
                  <span className="text-xs font-bold text-zinc-500 font-rounded">min</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-zinc-200/80 space-y-2">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Long Break
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={localSettings.longBreakTime}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, longBreakTime: Math.max(1, parseInt(e.target.value) || 15) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 font-mono font-bold text-center"
                  />
                  <span className="text-xs font-bold text-zinc-500 font-rounded">min</span>
                </div>
              </div>
            </div>

            {/* Auto-start Switches */}
            <div className="pt-4 border-t border-zinc-200/80 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 font-rounded">
                Automation & Flow
              </h4>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 border border-zinc-200/80 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-zinc-900 font-rounded">Auto-start Breaks</p>
                  <p className="text-[11px] text-zinc-500 font-rounded">Automatically start break timer when focus ends</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.autoStartBreaks}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoStartBreaks: e.target.checked })}
                  className="w-4 h-4 rounded text-zinc-900"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 border border-zinc-200/80 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-zinc-900 font-rounded">Auto-start Next Focus Session</p>
                  <p className="text-[11px] text-zinc-500 font-rounded">Seamlessly transition into the next study block</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.autoStartFocus}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoStartFocus: e.target.checked })}
                  className="w-4 h-4 rounded text-zinc-900"
                />
              </label>
            </div>
          </div>
        )}

        {/* 2. PROFILE & DAILY GOALS */}
        {activeTab === 'profile' && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-zinc-900 font-display">
              User Profile & Daily Target
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Display Name
                </label>
                <input
                  type="text"
                  value={localProfile.username}
                  placeholder="e.g. Scholar Alok"
                  onChange={(e) => setLocalProfile({ ...localProfile, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-900 font-rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Primary Study Subject
                </label>
                <input
                  type="text"
                  value={localProfile.primarySubject}
                  placeholder="e.g. Medical Board Prep"
                  onChange={(e) => setLocalProfile({ ...localProfile, primarySubject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-900 font-rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Daily Goal (Pomodoros)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localProfile.dailyGoalPomodoros}
                  onChange={(e) => {
                    const pomos = parseInt(e.target.value) || 6;
                    setLocalProfile({
                      ...localProfile,
                      dailyGoalPomodoros: pomos,
                      dailyGoalMinutes: pomos * (localSettings.focusTime || 25),
                      dailyGoalHours: parseFloat(((pomos * (localSettings.focusTime || 25)) / 60).toFixed(1)),
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-zinc-200 text-xs font-mono font-bold text-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Focus Bio & Motto
                </label>
                <input
                  type="text"
                  value={localProfile.bio}
                  placeholder="e.g. Consistency beats motivation."
                  onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-900 font-rounded"
                />
              </div>
            </div>

            {onReopenOnboarding && (
              <div className="pt-4 border-t border-zinc-200/80">
                <button
                  type="button"
                  onClick={onReopenOnboarding}
                  className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all font-rounded"
                >
                  Restart Onboarding Guide
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. AUDIO & BELL TONES */}
        {activeTab === 'sound' && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-zinc-900 font-display">
              Synthesized Audio & Chimes
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block font-rounded">
                  Completion Bell Tone
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['crystal', 'bowl', 'digital', 'marimba', 'softChime'] as SoundEffectType[]).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => {
                        setLocalSettings({ ...localSettings, soundAlertTone: tone });
                        sound.playAlert(tone, localSettings.soundVolume);
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold capitalize transition-all font-rounded ${
                        localSettings.soundAlertTone === tone
                          ? 'liquid-pill-active text-white shadow-xs'
                          : 'bg-white/70 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700 font-rounded">
                  <span>Alert Volume</span>
                  <span className="font-mono">{Math.round(localSettings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localSettings.soundVolume}
                  onChange={(e) => setLocalSettings({ ...localSettings, soundVolume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Ticking Sound */}
              <div className="pt-4 border-t border-zinc-200/80 space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 border border-zinc-200/80 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-zinc-900 font-rounded">Analog Mechanical Clock Tick</p>
                    <p className="text-[11px] text-zinc-500 font-rounded">Subtle 1-second cadence during focus sessions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.tickingSoundEnabled}
                    onChange={(e) => setLocalSettings({ ...localSettings, tickingSoundEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-zinc-900"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 4. BACKUP & STORAGE */}
        {activeTab === 'backup' && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-zinc-900 font-display">
              Data Privacy & JSON Backup
            </h3>
            <p className="text-xs text-zinc-600 font-rounded">
              Your tasks, analytics, streaks, and Poki companion data are stored 100% on this device.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold transition-all active:scale-95 shadow-md font-rounded"
              >
                <Download className="w-4 h-4" />
                <span>Export Full Backup (JSON)</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs font-extrabold transition-all active:scale-95 shadow-2xs cursor-pointer font-rounded">
                <Upload className="w-4 h-4" />
                <span>Import Backup File</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

            {/* Tour & Onboarding Section */}
            <div className="pt-6 border-t border-purple-100/80 space-y-3">
              <h4 className="text-xs font-extrabold text-zinc-900 font-display">Guides & Setup</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onOpenTour && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-rose-50/50 border border-purple-200/60 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-purple-950 font-rounded">Interactive Tour Guide</p>
                      <p className="text-[11px] text-purple-700 font-rounded">Replay the 5-step walkthrough</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!soundMuted) sound.playClick();
                        onOpenTour();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-rounded transition-all active:scale-95 shadow-xs"
                    >
                      Start Tour
                    </button>
                  </div>
                )}

                {onReopenOnboarding && (
                  <div className="p-4 rounded-2xl bg-white/70 border border-zinc-200/80 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 font-rounded">Setup Wizard</p>
                      <p className="text-[11px] text-zinc-500 font-rounded">Redo companion & profile onboarding</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!soundMuted) sound.playClick();
                        onReopenOnboarding();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold font-rounded transition-all active:scale-95 shadow-xs"
                    >
                      Restart Wizard
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Factory Reset */}
            <div className="pt-6 border-t border-rose-200/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <div>
                  <h4 className="text-xs font-extrabold text-rose-900 font-rounded">Reset All Application Data</h4>
                  <p className="text-[11px] text-rose-700 font-rounded">
                    Erase all tasks, history logs, streaks, and reset Poki companion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently reset all study data and Poki progress?')) {
                      onResetAllData();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0 font-rounded"
                >
                  Factory Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
