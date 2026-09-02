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
    <div className="w-full max-w-xl mx-auto my-3 p-4 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs select-none transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 flex items-center justify-center">
            {activeSound && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
          </div>
          <div>
            <span className="text-xs font-extrabold text-zinc-950 font-display">
              Ambient Focus Soundscape
            </span>
            <span className="text-[10px] text-zinc-600 block font-rounded">
              {activeSound ? 'Audio loop synthesized natively' : 'Click a sound to begin audio block'}
            </span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">
            {volume === 0 || soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-950"
            title="Ambient Volume"
          />
          <span className="text-[11px] font-mono font-bold text-zinc-600 w-7">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Sound Options Buttons with rounded pill styling */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {soundOptions.map((opt) => {
          const isSelected = activeSound === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleToggleSound(opt.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-1.5 active:scale-95 ${
                isSelected
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                  : 'bg-zinc-50/80 hover:bg-zinc-100 border-zinc-200/80 text-zinc-700'
              }`}
              title={opt.desc}
            >
              <div className="flex items-center justify-between">
                <span className={isSelected ? 'text-white' : 'text-zinc-500'}>
                  {opt.icon}
                </span>
                {isSelected && (
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-3.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
              <span className="text-xs font-bold font-rounded truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
