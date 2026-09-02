import React, { useState } from 'react';
import {
  X,
  Sliders,
  User,
  Volume2,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Save,
  HelpCircle,
} from 'lucide-react';
import { AppSettings, UserProfile, SoundEffectType } from '../types';
import { sound } from '../utils/soundEngine';
import { StorageService } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  profile: UserProfile;
  soundMuted: boolean;
  onClose: () => void;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
  onReopenOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  profile,
  soundMuted,
  onClose,
  onSaveSettings,
  onSaveProfile,
  onResetAllData,
  onReopenOnboarding,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [localProfile, setLocalProfile] = useState<UserProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<'timer' | 'profile' | 'sound' | 'backup'>('timer');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soundMuted) sound.playClick();
    onSaveSettings(localSettings);
    onSaveProfile(localProfile);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
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
          alert('Backup imported successfully! Reloading data...');
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
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-950 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-display">
                Settings & Preferences
              </h2>
              <p className="text-xs text-zinc-500">
                Customize timer intervals, student profile, and audio cues.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          {(
            [
              { id: 'timer', label: 'Timer Durations', icon: <Sliders className="w-3.5 h-3.5" /> },
              { id: 'profile', label: 'Profile & Target Hours', icon: <User className="w-3.5 h-3.5" /> },
              { id: 'sound', label: 'Audio & Cues', icon: <Volume2 className="w-3.5 h-3.5" /> },
              { id: 'backup', label: 'Storage & Backup', icon: <Download className="w-3.5 h-3.5" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (!soundMuted) sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="p-5 sm:p-6 space-y-5 bg-white">
            {/* TAB: TIMER */}
            {activeTab === 'timer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                      Focus Time (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={localSettings.focusTime}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          focusTime: Math.max(1, parseInt(e.target.value) || 25),
                        })
                      }
                      className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm font-mono text-zinc-950 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                      Short Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={localSettings.shortBreakTime}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          shortBreakTime: Math.max(1, parseInt(e.target.value) || 5),
                        })
                      }
                      className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm font-mono text-zinc-950 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                      Long Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={localSettings.longBreakTime}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          longBreakTime: Math.max(1, parseInt(e.target.value) || 15),
                        })
                      }
                      className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm font-mono text-zinc-950 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                    Long Break Interval (sessions)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={localSettings.longBreakInterval}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        longBreakInterval: Math.max(1, parseInt(e.target.value) || 4),
                      })
                    }
                    className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm font-mono text-zinc-950 outline-none max-w-[200px]"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Number of focus rounds before triggering an extended restorative break.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.autoStartBreaks}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, autoStartBreaks: e.target.checked })
                      }
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                    />
                    <span className="font-medium">Auto-start Breaks when Focus finishes</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.autoStartPomodoros}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, autoStartPomodoros: e.target.checked })
                      }
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                    />
                    <span className="font-medium">Auto-start next Focus round when Break finishes</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: PROFILE & TARGET HOURS */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                    Student / Scholar Name
                  </label>
                  <input
                    type="text"
                    value={localProfile.username}
                    onChange={(e) =>
                      setLocalProfile({ ...localProfile, username: e.target.value })
                    }
                    placeholder="Your Name"
                    className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm text-zinc-950 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                      Daily Goal (Hours)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="16"
                      step="0.5"
                      value={localProfile.dailyGoalHours || 3}
                      onChange={(e) => {
                        const h = parseFloat(e.target.value) || 3;
                        setLocalProfile({
                          ...localProfile,
                          dailyGoalHours: h,
                          dailyGoalMinutes: h * 60,
                          dailyGoalPomodoros: Math.round((h * 60) / localSettings.focusTime),
                        });
                      }}
                      className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm font-mono text-zinc-950 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                      Target Pomodoros
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={localProfile.dailyGoalPomodoros}
                      onChange={(e) =>
                        setLocalProfile({
                          ...localProfile,
                          dailyGoalPomodoros: Math.max(1, parseInt(e.target.value) || 6),
                        })
                      }
                      className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm font-mono text-zinc-950 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                    Primary Study Focus / Subject
                  </label>
                  <input
                    type="text"
                    value={localProfile.primarySubject || 'General Studies'}
                    onChange={(e) =>
                      setLocalProfile({ ...localProfile, primarySubject: e.target.value })
                    }
                    placeholder="e.g. Computer Science, Medicine, Law"
                    className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm text-zinc-950 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                    Study Motto / Intention
                  </label>
                  <input
                    type="text"
                    value={localProfile.bio}
                    onChange={(e) =>
                      setLocalProfile({ ...localProfile, bio: e.target.value })
                    }
                    placeholder="e.g. Deep Work & Continuous Growth"
                    className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-xl p-2.5 text-sm text-zinc-950 outline-none"
                  />
                </div>

                {onReopenOnboarding && (
                  <div className="pt-3 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onReopenOnboarding();
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Re-launch Onboarding Setup Wizard</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SOUND & CUES */}
            {activeTab === 'sound' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                    Alarm Completion Tone (Web Audio Synth)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={localSettings.soundAlertTone}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          soundAlertTone: e.target.value as SoundEffectType,
                        })
                      }
                      className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 text-sm text-zinc-950 outline-none cursor-pointer"
                    >
                      <option value="crystal">Crystal Chime (Peaceful bell)</option>
                      <option value="zen">Zen Temple Singing Bowl</option>
                      <option value="digital">Digital Beep (Classic)</option>
                      <option value="marimba">Warm Marimba Progression</option>
                      <option value="cosmic">Cosmic Harmonic Chord</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleTestSound}
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold"
                    >
                      Test Tone
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                    Alarm Volume: {Math.round(localSettings.soundVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={localSettings.soundVolume}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        soundVolume: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-zinc-200 rounded-lg cursor-pointer accent-zinc-950"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.tickingSoundEnabled}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          tickingSoundEnabled: e.target.checked,
                        })
                      }
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                    />
                    <span className="font-medium">Subtle mechanical clock ticking while timer is running</span>
                  </label>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">
                        Desktop Browser Notifications
                      </span>
                      <span className="text-xs text-zinc-500">
                        Alert when timer completes even if tab is in background.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestNotification}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold"
                    >
                      {localSettings.desktopNotifications ? 'Enabled ✓' : 'Enable Notifications'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BACKUP & STORAGE */}
            {activeTab === 'backup' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <h3 className="text-sm font-bold text-zinc-950 mb-1">
                    100% Client-Side Privacy
                  </h3>
                  <p className="text-xs text-zinc-600 mb-3">
                    All your tasks, daily study history, and preferences are stored exclusively in your browser (LocalStorage + IndexedDB).
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-2xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON Backup</span>
                    </button>

                    <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-semibold cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Restore from JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <h3 className="text-sm font-bold text-rose-950 mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-xs text-rose-700 mb-3">
                    Wipe all local session logs, streak records, and reset to initial setup.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you absolutely sure you want to clear all study history and reset settings?')) {
                        onResetAllData();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Local Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Actions */}
          <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
            <div>
              {saveToast && (
                <span className="text-xs text-zinc-900 font-bold flex items-center gap-1 animate-in fade-in">
                  ✓ Settings saved successfully
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
