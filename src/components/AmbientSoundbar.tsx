import React, { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Activity, Waves, Wind, Sparkles } from 'lucide-react';
import { AmbientSoundType } from '../types';
import { sound } from '../utils/soundEngine';

interface AmbientSoundbarProps {
  soundMuted: boolean;
}

export const AmbientSoundbar: React.FC<AmbientSoundbarProps> = ({ soundMuted }) => {
  const [activeSound, setActiveSound] = useState<AmbientSoundType | null>(null);
  const [volume, setVolume] = useState<number>(0.5);

  const soundOptions: { id: AmbientSoundType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'white',
      label: 'White Noise',
      icon: <Wind className="w-3.5 h-3.5" />,
      desc: 'Broad spectrum focus shield',
    },
    {
      id: 'brown',
      label: 'Brown Noise',
      icon: <Waves className="w-3.5 h-3.5" />,
      desc: 'Deep warm low-frequency rumble',
    },
    {
      id: 'binaural',
      label: '40Hz Gamma',
      icon: <Activity className="w-3.5 h-3.5" />,
      desc: 'Cognitive flow binaural frequency',
    },
    {
      id: 'rain',
      label: 'Rain Shower',
      icon: <CloudRain className="w-3.5 h-3.5" />,
      desc: 'Gentle rhythmic atmospheric rain',
    },
  ];

  const handleToggleSound = (type: AmbientSoundType) => {
    if (activeSound === type) {
      sound.stopAmbient();
      setActiveSound(null);
    } else {
      sound.startAmbient(type, soundMuted ? 0 : volume);
      setActiveSound(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (activeSound && !soundMuted) {
      sound.setAmbientVolume(newVol);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-2 p-3 sm:p-3.5 rounded-2xl bg-white/85 backdrop-blur-xl border border-zinc-200/80 shadow-2xs select-none transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeSound ? 'bg-zinc-950 animate-ping' : 'bg-zinc-300'}`} />
          <span className="text-xs font-extrabold text-zinc-900 font-display">
            Ambient Focus Audio
          </span>
          {activeSound && (
            <span className="px-2 py-0.2 rounded-full bg-zinc-100 text-zinc-900 text-[10px] font-bold font-rounded">
              Playing
            </span>
          )}
        </div>

        {/* Volume & Stop Control */}
        <div className="flex items-center gap-2">
          {activeSound && (
            <button
              onClick={() => {
                sound.stopAmbient();
                setActiveSound(null);
              }}
              className="text-[10px] font-bold text-zinc-600 hover:text-zinc-950 px-2 py-0.5 rounded-full hover:bg-zinc-100 transition-colors font-rounded"
            >
              Stop
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">
              {volume === 0 || soundMuted ? <VolumeX className="w-3 h-3 text-zinc-400" /> : <Volume2 className="w-3 h-3 text-zinc-800" />}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-18 h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-950"
              title="Ambient Volume"
            />
            <span className="text-[10px] font-mono font-semibold text-zinc-500 w-6">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Sound Options Buttons with compact rounded pill styling */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {soundOptions.map((opt) => {
          const isSelected = activeSound === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleToggleSound(opt.id)}
              className={`px-2.5 py-1.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-1.5 active:scale-95 ${
                isSelected
                  ? 'bg-zinc-950 text-white border-zinc-950 font-bold shadow-2xs'
                  : 'bg-white/70 hover:bg-white border-zinc-200/70 text-zinc-700 hover:text-zinc-950'
              }`}
              title={opt.desc}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={isSelected ? 'text-white' : 'text-zinc-500'}>
                  {opt.icon}
                </span>
                <span className="text-[11px] font-bold font-rounded truncate">{opt.label}</span>
              </div>
              {isSelected && (
                <span className="flex gap-0.5 items-end h-2.5 shrink-0">
                  <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
