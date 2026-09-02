import React, { useState, useEffect } from 'react';
import { PokiSpecies, PokiEvolutionStage } from '../types';

interface PokiCharacterProps {
  species: PokiSpecies;
  evolution: PokiEvolutionStage;
  happiness: number;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
  equippedAura?: string | null;
  isInteracting?: boolean;
  size?: number; // size in px
  className?: string;
  onClick?: () => void;
}

export const PokiCharacter: React.FC<PokiCharacterProps> = ({
  species = 'plant',
  evolution = 1,
  happiness = 85,
  equippedHat = null,
  equippedGlasses = null,
  equippedAura = null,
  isInteracting = false,
  size = 220,
  className = '',
  onClick,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bounceEffect, setBounceEffect] = useState(false);

  // Natural periodic blinking loop (every 3.5 - 5 seconds)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Trigger bounce on external interaction
  useEffect(() => {
    if (isInteracting) {
      setBounceEffect(true);
      const t = setTimeout(() => setBounceEffect(false), 650);
      return () => clearTimeout(t);
    }
  }, [isInteracting]);

  const handleClick = () => {
    setBounceEffect(true);
    setTimeout(() => setBounceEffect(false), 650);
    if (onClick) onClick();
  };

  // Color palettes tailored for each species and stage
  const isHighHappiness = happiness >= 75;

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 active:scale-95 ${className}`}
      style={{
        width: size,
        height: size,
        willChange: 'transform',
      }}
      title="Tap me to interact!"
    >
      {/* 1. BACKGROUND AURA (GPU ACCELERATED) */}
      {equippedAura === 'aura_sparkle' && (
        <div className="absolute inset-0 -m-6 rounded-full bg-radial from-cyan-400/30 via-indigo-300/15 to-transparent blur-xl animate-pulse pointer-events-none" />
      )}
      {equippedAura === 'aura_fire' && (
        <div className="absolute inset-0 -m-6 rounded-full bg-radial from-amber-500/35 via-rose-400/20 to-transparent blur-xl animate-pulse pointer-events-none" />
      )}
      {evolution === 5 && !equippedAura && (
        <div className="absolute inset-0 -m-8 rounded-full bg-radial from-indigo-500/25 via-purple-400/15 to-transparent blur-2xl animate-pulse pointer-events-none" />
      )}

      {/* 2. MAIN CHARACTER CONTAINER WITH BOUNCE & BREATHE */}
      <div
        className={`w-full h-full relative flex items-center justify-center transition-all duration-300 ${
          bounceEffect ? 'scale-110 -translate-y-3' : 'hover:scale-105'
        }`}
        style={{
          animation: bounceEffect
            ? 'pokiJoyJump 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'pokiSmoothFloat 4s ease-in-out infinite',
          willChange: 'transform',
        }}
      >
        {/* Render Specific Species & Evolution Stage */}
        {species === 'plant' && (
          <PlantCharacter evolution={evolution} isBlinking={isBlinking} isHappy={isHighHappiness || bounceEffect} />
        )}

        {species === 'bird' && (
          <BirdCharacter evolution={evolution} isBlinking={isBlinking} isHappy={isHighHappiness || bounceEffect} />
        )}

        {species === 'butterfly' && (
          <ButterflyCharacter evolution={evolution} isBlinking={isBlinking} isHappy={isHighHappiness || bounceEffect} />
        )}

        {/* 3. ACCESSORIES OVERLAY */}
        {/* Glasses */}
        {equippedGlasses === 'glass_specs' && (
          <div
            className="absolute z-20 pointer-events-none transition-transform"
            style={{
              top: evolution === 1 ? '40%' : evolution === 2 ? '38%' : '36%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <svg width="68" height="28" viewBox="0 0 68 28" fill="none" className="filter drop-shadow-sm">
              <circle cx="18" cy="14" r="11" stroke="#18181b" strokeWidth="2.5" fill="rgba(255,255,255,0.4)" />
              <circle cx="50" cy="14" r="11" stroke="#18181b" strokeWidth="2.5" fill="rgba(255,255,255,0.4)" />
              <line x1="29" y1="14" x2="39" y2="14" stroke="#18181b" strokeWidth="2.5" />
              {/* Glass glare */}
              <path d="M12 9 L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <path d="M44 9 L48 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            </svg>
          </div>
        )}

        {equippedGlasses === 'glass_shades' && (
          <div
            className="absolute z-20 pointer-events-none transition-transform"
            style={{
              top: evolution === 1 ? '40%' : evolution === 2 ? '38%' : '36%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <svg width="72" height="26" viewBox="0 0 72 26" fill="none" className="filter drop-shadow-md">
              <path d="M4 8 Q20 4 33 8 L32 20 Q18 22 6 18 Z" fill="#18181b" />
              <path d="M39 8 Q52 4 68 8 L66 18 Q54 22 40 20 Z" fill="#18181b" />
              <line x1="32" y1="9" x2="40" y2="9" stroke="#18181b" strokeWidth="3" />
              {/* Cool glare lines */}
              <path d="M10 10 L22 16" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M45 10 L57 16" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Hats */}
        {equippedHat === 'hat_grad' && (
          <div
            className="absolute z-30 pointer-events-none transition-transform"
            style={{
              top: '-6%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <svg width="90" height="48" viewBox="0 0 90 48" fill="none" className="filter drop-shadow-md">
              <polygon points="45,4 86,18 45,30 4,18" fill="#18181b" />
              <polygon points="45,6 82,18 45,28 8,18" fill="#27272a" />
              {/* Skull cap under */}
              <path d="M26 24 C26 34 64 34 64 24" fill="#18181b" />
              {/* Golden button and tassel */}
              <circle cx="45" cy="17" r="3.5" fill="#f59e0b" />
              <path d="M45 17 Q62 20 64 36" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="64" cy="38" r="3" fill="#d97706" />
            </svg>
          </div>
        )}

        {equippedHat === 'hat_sprout' && (
          <div
            className="absolute z-30 pointer-events-none transition-transform"
            style={{
              top: '0%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <svg width="44" height="36" viewBox="0 0 44 36" fill="none" className="filter drop-shadow-sm">
              <path d="M22 34 C22 20 20 14 12 10 C6 7 4 15 14 18 C18 19 22 22 22 34" fill="#22c55e" />
              <path d="M22 34 C22 18 26 12 34 8 C40 5 42 13 32 17 C27 18 22 22 22 34" fill="#16a34a" />
              <path d="M22 36 L22 24" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {equippedHat === 'hat_halo' && (
          <div
            className="absolute z-30 pointer-events-none animate-pulse"
            style={{
              top: '-12%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <svg width="80" height="24" viewBox="0 0 80 24" fill="none" className="filter drop-shadow-md">
              <ellipse cx="40" cy="12" rx="34" ry="7" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.9" />
              <ellipse cx="40" cy="12" rx="32" ry="5" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.8" />
            </svg>
          </div>
        )}

        {equippedHat === 'hat_wizard' && (
          <div
            className="absolute z-30 pointer-events-none transition-transform"
            style={{
              top: '-18%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <svg width="84" height="68" viewBox="0 0 84 68" fill="none" className="filter drop-shadow-lg">
              {/* Wizard Hat Cone */}
              <path d="M12 56 Q42 62 72 56 L46 6 Q40 4 36 10 Z" fill="#4f46e5" />
              {/* Brim */}
              <ellipse cx="42" cy="56" rx="38" ry="8" fill="#3730a3" />
              {/* Hat band & gold star */}
              <path d="M18 52 Q42 57 66 52" stroke="#fbbf24" strokeWidth="5" fill="none" />
              <circle cx="42" cy="54" r="3.5" fill="#fef08a" />
              {/* Little sparkle star on tip */}
              <polygon points="46,4 47,8 51,9 47,10 46,14 44,10 40,9 44,8" fill="#fef08a" />
            </svg>
          </div>
        )}
      </div>

      {/* INLINE CSS FOR 60FPS SMOOTH ACCELERATED KEYFRAMES */}
      <style>{`
        @keyframes pokiSmoothFloat {
          0%, 100% {
            transform: translate3d(0, 0px, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }
        @keyframes pokiJoyJump {
          0% { transform: scale3d(1, 1, 1) translate3d(0, 0, 0); }
          30% { transform: scale3d(1.18, 0.85, 1) translate3d(0, 6px, 0); }
          60% { transform: scale3d(0.92, 1.15, 1) translate3d(0, -18px, 0); }
          80% { transform: scale3d(1.05, 0.95, 1) translate3d(0, 2px, 0); }
          100% { transform: scale3d(1, 1, 1) translate3d(0, 0, 0); }
        }
        @keyframes leafSwayLeft {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes leafSwayRight {
          0%, 100% { transform: rotate(5deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes birdWingFlutter {
          0%, 100% { transform: scaleY(1) rotate(0deg); }
          50% { transform: scaleY(0.65) rotate(-18deg); }
        }
        @keyframes butterflyFlapLeft {
          0%, 100% { transform: scaleX(1) skewY(0deg); }
          50% { transform: scaleX(0.25) skewY(15deg); }
        }
        @keyframes butterflyFlapRight {
          0%, 100% { transform: scaleX(1) skewY(0deg); }
          50% { transform: scaleX(0.25) skewY(-15deg); }
        }
        @keyframes petalGlow {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
};

// =========================================================================
// 1. PLANT SPECIES COMPONENT (Sprout -> Blossom -> Bonsai -> Sakura -> Yggdrasil)
// =========================================================================
const PlantCharacter: React.FC<{ evolution: PokiEvolutionStage; isBlinking: boolean; isHappy: boolean }> = ({
  evolution,
  isBlinking,
  isHappy,
}) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-xl" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="plantPotGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="leafGreenGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="leafGreenGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="sakuraGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="cosmicGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* STAGE 1: SPROUT SEEDLING */}
      {evolution === 1 && (
        <g>
          {/* Pot */}
          <path d="M60 135 L70 178 Q100 188 130 178 L140 135 Z" fill="url(#plantPotGrad)" stroke="#9a3412" strokeWidth="2.5" />
          <path d="M54 130 Q100 136 146 130 L146 138 Q100 144 54 138 Z" fill="#fb923c" stroke="#9a3412" strokeWidth="2" />

          {/* Stem */}
          <path d="M100 132 Q98 95 100 75" stroke="#15803d" strokeWidth="6" fill="none" strokeLinecap="round" />

          {/* Left Leaf (Animated) */}
          <g style={{ transformOrigin: '100px 95px', animation: 'leafSwayLeft 3s ease-in-out infinite' }}>
            <path
              d="M100 95 C75 85 55 60 70 42 C88 40 102 70 100 95"
              fill="url(#leafGreenGrad1)"
              stroke="#15803d"
              strokeWidth="2"
            />
            {/* Dewdrop */}
            <circle cx="68" cy="46" r="3" fill="#bae6fd" opacity="0.9" />
          </g>

          {/* Right Leaf (Animated) */}
          <g style={{ transformOrigin: '100px 85px', animation: 'leafSwayRight 3.2s ease-in-out infinite' }}>
            <path
              d="M100 85 C125 75 148 50 132 35 C112 35 98 62 100 85"
              fill="url(#leafGreenGrad2)"
              stroke="#15803d"
              strokeWidth="2"
            />
            <circle cx="132" cy="40" r="2.5" fill="#bae6fd" opacity="0.8" />
          </g>

          {/* Pot Face */}
          {/* Cheeks */}
          <circle cx="78" cy="156" r="5" fill="#fda4af" opacity="0.75" />
          <circle cx="122" cy="156" r="5" fill="#fda4af" opacity="0.75" />

          {/* Eyes */}
          {isBlinking ? (
            <>
              <path d="M82 150 Q87 146 92 150" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M108 150 Q113 146 118 150" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : isHappy ? (
            <>
              <path d="M82 150 Q87 143 92 150" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M108 150 Q113 143 118 150" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="87" cy="148" r="4.5" fill="#18181b" />
              <circle cx="86" cy="146" r="1.5" fill="white" />
              <circle cx="113" cy="148" r="4.5" fill="#18181b" />
              <circle cx="112" cy="146" r="1.5" fill="white" />
            </>
          )}

          {/* Smile */}
          <path d="M96 156 Q100 162 104 156" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* STAGE 2: LEAFY BLOSSOM */}
      {evolution === 2 && (
        <g>
          {/* Pot */}
          <path d="M62 138 L72 178 Q100 188 128 178 L138 138 Z" fill="url(#plantPotGrad)" stroke="#9a3412" strokeWidth="2.5" />
          <path d="M56 133 Q100 139 144 133 L144 140 Q100 146 56 140 Z" fill="#fb923c" stroke="#9a3412" strokeWidth="2" />

          {/* Stem & Leaves */}
          <path d="M100 134 Q98 100 100 78" stroke="#15803d" strokeWidth="6.5" fill="none" strokeLinecap="round" />
          <path d="M100 105 Q70 100 68 82 Q88 78 100 105" fill="url(#leafGreenGrad1)" stroke="#15803d" strokeWidth="2" />
          <path d="M100 95 Q130 90 132 72 Q112 68 100 95" fill="url(#leafGreenGrad2)" stroke="#15803d" strokeWidth="2" />

          {/* Flower Petals (Blooming Animation) */}
          <g style={{ transformOrigin: '100px 70px', animation: 'petalGlow 2.8s ease-in-out infinite' }}>
            <circle cx="100" cy="52" r="16" fill="url(#sakuraGrad)" opacity="0.9" />
            <circle cx="118" cy="62" r="16" fill="url(#sakuraGrad)" opacity="0.9" />
            <circle cx="112" cy="82" r="16" fill="url(#sakuraGrad)" opacity="0.9" />
            <circle cx="88" cy="82" r="16" fill="url(#sakuraGrad)" opacity="0.9" />
            <circle cx="82" cy="62" r="16" fill="url(#sakuraGrad)" opacity="0.9" />
            {/* Flower Face Center */}
            <circle cx="100" cy="68" r="19" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
          </g>

          {/* Face on Flower */}
          <circle cx="91" cy="72" r="3.5" fill="#f43f5e" opacity="0.6" />
          <circle cx="109" cy="72" r="3.5" fill="#f43f5e" opacity="0.6" />

          {isBlinking ? (
            <>
              <path d="M91 66 Q94 63 97 66" stroke="#18181b" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M103 66 Q106 63 109 66" stroke="#18181b" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          ) : isHappy ? (
            <>
              <path d="M90 66 Q94 60 97 66" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M103 66 Q106 60 110 66" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="94" cy="66" r="3.5" fill="#18181b" />
              <circle cx="93" cy="64.5" r="1" fill="white" />
              <circle cx="106" cy="66" r="3.5" fill="#18181b" />
              <circle cx="105" cy="64.5" r="1" fill="white" />
            </>
          )}
          <path d="M98 72 Q100 76 102 72" stroke="#18181b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* STAGE 3: SCHOLAR BONSAI */}
      {evolution === 3 && (
        <g>
          {/* Ceramic Tray */}
          <path d="M45 155 L55 180 Q100 188 145 180 L155 155 Z" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
          <ellipse cx="100" cy="155" rx="58" ry="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
          {/* Moss */}
          <ellipse cx="100" cy="154" rx="50" ry="6" fill="#15803d" />

          {/* Bonsai Trunk */}
          <path
            d="M95 153 C92 125 78 115 88 92 C96 75 116 70 112 50"
            stroke="#78350f"
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M84 105 Q62 95 55 82" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M102 80 Q128 72 138 60" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />

          {/* Foliage Clouds */}
          <g fill="url(#leafGreenGrad1)" stroke="#15803d" strokeWidth="2">
            {/* Top Cloud */}
            <path d="M85 45 C75 30 135 25 130 48 C145 55 115 70 85 45" />
            {/* Left Cloud */}
            <path d="M38 78 C30 65 75 60 72 78 C80 88 50 95 38 78" />
            {/* Right Cloud */}
            <path d="M125 58 C118 45 160 40 158 58 C165 70 138 75 125 58" />
          </g>

          {/* Wise Face in Trunk */}
          <g transform="translate(0, -5)">
            {isBlinking ? (
              <>
                <path d="M88 108 L94 108" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M102 108 L108 108" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="91" cy="108" r="3" fill="#fef3c7" />
                <circle cx="105" cy="108" r="3" fill="#fef3c7" />
              </>
            )}
            <path d="M95 116 Q98 119 101 116" stroke="#fef3c7" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* STAGE 4: WISDOM SAKURA */}
      {evolution === 4 && (
        <g>
          {/* Floating Island Base */}
          <path d="M40 148 Q100 170 160 148 Q100 195 40 148" fill="#451a03" stroke="#78350f" strokeWidth="2" />
          <ellipse cx="100" cy="148" rx="60" ry="12" fill="#166534" />

          {/* Sakura Trunk */}
          <path
            d="M100 148 C95 118 80 98 100 70 C108 55 112 40 110 32"
            stroke="#5c2605"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sakura Blossom Clouds */}
          <g fill="url(#sakuraGrad)" opacity="0.95">
            <ellipse cx="100" cy="46" rx="42" ry="24" />
            <ellipse cx="65" cy="62" rx="30" ry="18" />
            <ellipse cx="135" cy="60" rx="32" ry="20" />
            <circle cx="100" cy="32" r="22" />
          </g>

          {/* Floating Sakura Petals */}
          <circle cx="50" cy="90" r="3.5" fill="#f43f5e" opacity="0.8" />
          <circle cx="145" cy="98" r="3" fill="#fbcfe8" opacity="0.9" />
          <circle cx="120" cy="120" r="4" fill="#fda4af" opacity="0.8" />

          {/* Peaceful Face */}
          <circle cx="90" cy="96" r="3" fill="#fed7aa" />
          <circle cx="106" cy="96" r="3" fill="#fed7aa" />
          <path d="M96 102 Q98 105 100 102" stroke="#fed7aa" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* STAGE 5: ASTRAL YGGDRASIL */}
      {evolution === 5 && (
        <g>
          {/* Celestial Halo Rings */}
          <ellipse cx="100" cy="100" rx="85" ry="85" stroke="url(#cosmicGrad)" strokeWidth="2.5" fill="none" opacity="0.6" strokeDasharray="6 4" />
          <ellipse cx="100" cy="100" rx="72" ry="72" stroke="url(#cosmicGrad)" strokeWidth="1.5" fill="none" opacity="0.4" />

          {/* Crystalline Celestial Tree */}
          <path
            d="M100 165 C95 125 75 105 100 70 C110 50 115 35 100 20"
            stroke="url(#cosmicGrad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />

          {/* Star Leaves Canopy */}
          <g fill="url(#cosmicGrad)" opacity="0.9">
            <ellipse cx="100" cy="45" rx="46" ry="28" />
            <ellipse cx="58" cy="68" rx="34" ry="22" />
            <ellipse cx="142" cy="68" rx="34" ry="22" />
            <circle cx="100" cy="28" r="24" />
          </g>

          {/* Stars & Stardust */}
          <circle cx="100" cy="28" r="5" fill="#ffffff" />
          <circle cx="62" cy="65" r="3.5" fill="#fef08a" />
          <circle cx="138" cy="65" r="3.5" fill="#bae6fd" />
          <circle cx="78" cy="115" r="2.5" fill="#fbcfe8" />
          <circle cx="125" cy="120" r="3" fill="#ffffff" />

          {/* Luminous Eyes */}
          <circle cx="92" cy="85" r="4" fill="#ffffff" />
          <circle cx="108" cy="85" r="4" fill="#ffffff" />
          <path d="M98 94 Q100 98 102 94" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

// =========================================================================
// 2. BIRD SPECIES COMPONENT (Pip Chick -> Bluebird -> Scholar Owl -> Falcon -> Astral Phoenix)
// =========================================================================
const BirdCharacter: React.FC<{ evolution: PokiEvolutionStage; isBlinking: boolean; isHappy: boolean }> = ({
  evolution,
  isBlinking,
  isHappy,
}) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-xl" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="chickYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        <linearGradient id="bluebirdGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="owlFeather" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="owlChest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="phoenixGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>

      {/* STAGE 1: PIP CHICK */}
      {evolution === 1 && (
        <g>
          {/* Twig Nest */}
          <ellipse cx="100" cy="165" rx="55" ry="18" fill="#78350f" stroke="#451a03" strokeWidth="2.5" />
          <path d="M50 162 Q100 178 150 162" stroke="#92400e" strokeWidth="3" fill="none" />

          {/* Fluffy Round Body */}
          <circle cx="100" cy="115" r="44" fill="url(#chickYellow)" stroke="#eab308" strokeWidth="2" />

          {/* Little Wings (Animated) */}
          <g style={{ transformOrigin: '65px 120px', animation: 'birdWingFlutter 1.6s ease-in-out infinite' }}>
            <ellipse cx="62" cy="120" rx="14" ry="9" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          </g>
          <g style={{ transformOrigin: '135px 120px', animation: 'birdWingFlutter 1.6s ease-in-out infinite' }}>
            <ellipse cx="138" cy="120" rx="14" ry="9" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          </g>

          {/* Cheeks */}
          <circle cx="78" cy="122" r="6" fill="#fda4af" opacity="0.8" />
          <circle cx="122" cy="122" r="6" fill="#fda4af" opacity="0.8" />

          {/* Eyes */}
          {isBlinking ? (
            <>
              <path d="M80 110 Q85 105 90 110" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M110 110 Q115 105 120 110" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : isHappy ? (
            <>
              <path d="M79 110 Q85 102 91 110" stroke="#18181b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M109 110 Q115 102 121 110" stroke="#18181b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="85" cy="108" r="5" fill="#18181b" />
              <circle cx="83" cy="106" r="1.8" fill="white" />
              <circle cx="115" cy="108" r="5" fill="#18181b" />
              <circle cx="113" cy="106" r="1.8" fill="white" />
            </>
          )}

          {/* Tiny Orange Beak */}
          <polygon points="100,112 93,121 107,121" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
        </g>
      )}

      {/* STAGE 2: FLEDGLING BLUEBIRD */}
      {evolution === 2 && (
        <g>
          {/* Perch Branch */}
          <path d="M30 165 Q100 155 170 165" stroke="#78350f" strokeWidth="7" fill="none" strokeLinecap="round" />
          {/* Leaves on branch */}
          <circle cx="50" cy="160" r="5" fill="#22c55e" />

          {/* Sleek Bluebird Body */}
          <ellipse cx="100" cy="115" rx="38" ry="44" fill="url(#bluebirdGrad)" stroke="#0369a1" strokeWidth="2" />
          {/* White / Peach Breast */}
          <ellipse cx="100" cy="126" rx="22" ry="26" fill="#fef3c7" />

          {/* Wings */}
          <g style={{ transformOrigin: '68px 115px', animation: 'birdWingFlutter 2s ease-in-out infinite' }}>
            <path d="M68 100 C45 110 40 145 70 135 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          </g>
          <g style={{ transformOrigin: '132px 115px', animation: 'birdWingFlutter 2s ease-in-out infinite' }}>
            <path d="M132 100 C155 110 160 145 130 135 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          </g>

          {/* Crest */}
          <path d="M100 72 Q90 52 104 55 Q100 68 100 72" fill="#0284c7" />

          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="82" y1="98" x2="90" y2="98" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="110" y1="98" x2="118" y2="98" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="86" cy="98" r="4.5" fill="#18181b" />
              <circle cx="85" cy="96" r="1.5" fill="white" />
              <circle cx="114" cy="98" r="4.5" fill="#18181b" />
              <circle cx="113" cy="96" r="1.5" fill="white" />
            </>
          )}

          {/* Beak */}
          <polygon points="100,102 94,110 106,110" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
        </g>
      )}

      {/* STAGE 3: SCHOLAR OWL */}
      {evolution === 3 && (
        <g>
          {/* Branch & Book */}
          <rect x="70" y="160" width="60" height="14" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <path d="M72 166 L128 166" stroke="#fef2f2" strokeWidth="2" strokeDasharray="3 2" />

          {/* Owl Body */}
          <ellipse cx="100" cy="115" rx="42" ry="46" fill="url(#owlFeather)" stroke="#27272a" strokeWidth="2" />
          {/* Feathered Chest */}
          <ellipse cx="100" cy="125" rx="26" ry="30" fill="url(#owlChest)" />

          {/* Ear Tufts */}
          <polygon points="68,78 60,48 82,72" fill="#78350f" />
          <polygon points="132,78 140,48 118,72" fill="#78350f" />

          {/* Large Intelligent Eye Rings */}
          <circle cx="82" cy="100" r="16" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="118" cy="100" r="16" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />

          {isBlinking ? (
            <>
              <line x1="72" y1="100" x2="92" y2="100" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
              <line x1="108" y1="100" x2="128" y2="100" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="82" cy="100" r="8" fill="#18181b" />
              <circle cx="80" cy="97" r="2.5" fill="#fef08a" />
              <circle cx="118" cy="100" r="8" fill="#18181b" />
              <circle cx="116" cy="97" r="2.5" fill="#fef08a" />
            </>
          )}

          {/* Hooked Beak */}
          <path d="M96 106 Q100 118 100 122 Q100 118 104 106 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        </g>
      )}

      {/* STAGE 4: SUNFIRE FALCON */}
      {evolution === 4 && (
        <g>
          {/* Majestic Outspread Wings */}
          <g style={{ transformOrigin: '70px 105px', animation: 'birdWingFlutter 2.4s ease-in-out infinite' }}>
            <path
              d="M70 110 C30 75 10 90 20 135 C38 135 60 125 70 110 Z"
              fill="url(#phoenixGrad)"
              stroke="#b45309"
              strokeWidth="2"
            />
          </g>
          <g style={{ transformOrigin: '130px 105px', animation: 'birdWingFlutter 2.4s ease-in-out infinite' }}>
            <path
              d="M130 110 C170 75 190 90 180 135 C162 135 140 125 130 110 Z"
              fill="url(#phoenixGrad)"
              stroke="#b45309"
              strokeWidth="2"
            />
          </g>

          {/* Raptor Body */}
          <ellipse cx="100" cy="115" rx="36" ry="46" fill="#9a3412" stroke="#7c2d12" strokeWidth="2" />
          <ellipse cx="100" cy="122" rx="22" ry="28" fill="#fed7aa" />

          {/* Crest Feathers */}
          <path d="M96 70 Q90 42 108 48 Q102 65 96 70" fill="#ea580c" />

          {/* Sharp Focus Eyes */}
          <circle cx="86" cy="96" r="5" fill="#fef08a" stroke="#18181b" strokeWidth="1.5" />
          <circle cx="86" cy="96" r="2.5" fill="#18181b" />
          <circle cx="114" cy="96" r="5" fill="#fef08a" stroke="#18181b" strokeWidth="1.5" />
          <circle cx="114" cy="96" r="2.5" fill="#18181b" />

          {/* Hooked Raptor Beak */}
          <path d="M95 102 Q100 116 100 120 Q105 116 105 102 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        </g>
      )}

      {/* STAGE 5: ASTRAL PHOENIX */}
      {evolution === 5 && (
        <g>
          {/* Cosmic Aura & Flaming Tail */}
          <path d="M100 150 C80 180 60 195 75 210 C90 195 100 170 100 150" fill="url(#phoenixGrad)" opacity="0.8" />
          <path d="M100 150 C120 180 140 195 125 210 C110 195 100 170 100 150" fill="url(#phoenixGrad)" opacity="0.8" />

          {/* Grand Ethereal Wings */}
          <path
            d="M65 105 C20 60 5 80 15 140 C35 140 55 125 65 105 Z"
            fill="url(#phoenixGrad)"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.95"
          />
          <path
            d="M135 105 C180 60 195 80 185 140 C165 140 145 125 135 105 Z"
            fill="url(#phoenixGrad)"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.95"
          />

          {/* Astral Phoenix Body */}
          <ellipse cx="100" cy="110" rx="34" ry="44" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
          <ellipse cx="100" cy="116" rx="20" ry="26" fill="#fff7ed" />

          {/* Crown of Starlight */}
          <polygon points="100,50 104,64 118,65 106,74 110,88 100,80 90,88 94,74 82,65 96,64" fill="#fef08a" />

          {/* Celestial Radiant Eyes */}
          <circle cx="88" cy="95" r="4.5" fill="#ffffff" />
          <circle cx="88" cy="95" r="2" fill="#0284c7" />
          <circle cx="112" cy="95" r="4.5" fill="#ffffff" />
          <circle cx="112" cy="95" r="2" fill="#0284c7" />

          {/* Golden Beak */}
          <polygon points="100,102 94,112 106,112" fill="#f59e0b" />
        </g>
      )}
    </svg>
  );
};

// =========================================================================
// 3. BUTTERFLY SPECIES COMPONENT (Caterpillar -> Chrysalis -> Monarch -> Morpho -> Prismwing)
// =========================================================================
const ButterflyCharacter: React.FC<{ evolution: PokiEvolutionStage; isBlinking: boolean; isHappy: boolean }> = ({
  evolution,
  isBlinking,
  isHappy,
}) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-xl" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="caterpillarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="chrysalisGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="monarchGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="morphoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="prismwingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="33%" stopColor="#a855f7" />
          <stop offset="66%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* STAGE 1: SILKY CATERPILLAR */}
      {evolution === 1 && (
        <g>
          {/* Big Juicy Leaf Platform */}
          <path
            d="M35 155 C70 145 130 145 165 155 C145 175 60 180 35 155 Z"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="2"
          />

          {/* Segmented Caterpillar Body */}
          <circle cx="65" cy="138" r="15" fill="url(#caterpillarGrad)" stroke="#16a34a" strokeWidth="1.5" />
          <circle cx="85" cy="132" r="16" fill="url(#caterpillarGrad)" stroke="#16a34a" strokeWidth="1.5" />
          <circle cx="106" cy="126" r="17" fill="url(#caterpillarGrad)" stroke="#16a34a" strokeWidth="1.5" />
          <circle cx="128" cy="118" r="20" fill="url(#caterpillarGrad)" stroke="#16a34a" strokeWidth="2" />

          {/* Antennae */}
          <path d="M125 100 Q118 78 112 80" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="112" cy="80" r="3.5" fill="#facc15" />
          <path d="M136 100 Q142 78 148 80" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="148" cy="80" r="3.5" fill="#facc15" />

          {/* Cheeks on Head */}
          <circle cx="120" cy="122" r="4" fill="#fda4af" opacity="0.8" />
          <circle cx="140" cy="122" r="4" fill="#fda4af" opacity="0.8" />

          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="120" y1="114" x2="126" y2="114" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="134" y1="114" x2="140" y2="114" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M119 114 Q123 108 127 114" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M133 114 Q137 108 141 114" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="123" cy="112" r="4" fill="#18181b" />
              <circle cx="122" cy="110" r="1.5" fill="white" />
              <circle cx="137" cy="112" r="4" fill="#18181b" />
              <circle cx="136" cy="110" r="1.5" fill="white" />
            </>
          )}

          {/* Smile */}
          <path d="M127 122 Q130 126 133 122" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* STAGE 2: CRYSTAL CHRYSALIS */}
      {evolution === 2 && (
        <g>
          {/* Twig Suspension */}
          <path d="M40 50 Q100 45 160 50" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M100 48 L100 70" stroke="#65a30d" strokeWidth="3" fill="none" />

          {/* Chrysalis Pod */}
          <path
            d="M100 70 C80 85 70 125 100 160 C130 125 120 85 100 70 Z"
            fill="url(#chrysalisGrad)"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Golden Rings / Patterns */}
          <path d="M85 95 Q100 100 115 95" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M82 115 Q100 122 118 115" stroke="#fbbf24" strokeWidth="2" fill="none" />

          {/* Glowing Aura within */}
          <circle cx="100" cy="115" r="12" fill="#ffffff" opacity="0.6" className="animate-pulse" />

          {/* Sleeping Cute Face */}
          <path d="M92 110 Q95 114 98 110" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M102 110 Q105 114 108 110" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="88" cy="114" r="3" fill="#fda4af" opacity="0.7" />
          <circle cx="112" cy="114" r="3" fill="#fda4af" opacity="0.7" />
        </g>
      )}

      {/* STAGE 3: MONARCH APPRENTICE */}
      {evolution === 3 && (
        <g>
          {/* Left Monarch Wing */}
          <g style={{ transformOrigin: '96px 105px', animation: 'butterflyFlapLeft 1.4s ease-in-out infinite' }}>
            <path
              d="M96 105 C70 50 25 55 35 105 C25 135 65 145 96 115 Z"
              fill="url(#monarchGrad)"
              stroke="#18181b"
              strokeWidth="2.5"
            />
            {/* Monarch Veins */}
            <path d="M96 105 Q60 85 45 68" stroke="#18181b" strokeWidth="2" fill="none" />
            <path d="M96 105 Q55 115 42 125" stroke="#18181b" strokeWidth="2" fill="none" />
            <circle cx="40" cy="80" r="2.5" fill="#ffffff" />
            <circle cx="48" cy="120" r="2" fill="#ffffff" />
          </g>

          {/* Right Monarch Wing */}
          <g style={{ transformOrigin: '104px 105px', animation: 'butterflyFlapRight 1.4s ease-in-out infinite' }}>
            <path
              d="M104 105 C130 50 175 55 165 105 C175 135 135 145 104 115 Z"
              fill="url(#monarchGrad)"
              stroke="#18181b"
              strokeWidth="2.5"
            />
            <path d="M104 105 Q140 85 155 68" stroke="#18181b" strokeWidth="2" fill="none" />
            <path d="M104 105 Q145 115 158 125" stroke="#18181b" strokeWidth="2" fill="none" />
            <circle cx="160" cy="80" r="2.5" fill="#ffffff" />
            <circle cx="152" cy="120" r="2" fill="#ffffff" />
          </g>

          {/* Butterfly Body & Head */}
          <ellipse cx="100" cy="110" rx="7" ry="24" fill="#18181b" />
          <circle cx="100" cy="86" r="8" fill="#18181b" />

          {/* Antennae */}
          <path d="M98 80 Q88 60 82 62" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="82" cy="62" r="2" fill="#f59e0b" />
          <path d="M102 80 Q112 60 118 62" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="118" cy="62" r="2" fill="#f59e0b" />

          {/* Glowing Eyes */}
          {isBlinking ? (
            <>
              <line x1="96" y1="86" x2="98" y2="86" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="102" y1="86" x2="104" y2="86" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="97" cy="86" r="2" fill="#ffffff" />
              <circle cx="103" cy="86" r="2" fill="#ffffff" />
            </>
          )}
        </g>
      )}

      {/* STAGE 4: MOONLIT MORPHO */}
      {evolution === 4 && (
        <g>
          {/* Bioluminescent Morpho Wings */}
          <g style={{ transformOrigin: '96px 105px', animation: 'butterflyFlapLeft 1.2s ease-in-out infinite' }}>
            <path
              d="M96 105 C65 40 10 45 25 110 C10 145 60 155 96 120 Z"
              fill="url(#morphoGrad)"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Glowing inner blue pattern */}
            <circle cx="55" cy="85" r="10" fill="#38bdf8" opacity="0.6" />
            <circle cx="50" cy="120" r="8" fill="#38bdf8" opacity="0.5" />
          </g>

          <g style={{ transformOrigin: '104px 105px', animation: 'butterflyFlapRight 1.2s ease-in-out infinite' }}>
            <path
              d="M104 105 C135 40 190 45 175 110 C190 145 140 155 104 120 Z"
              fill="url(#morphoGrad)"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <circle cx="145" cy="85" r="10" fill="#38bdf8" opacity="0.6" />
            <circle cx="150" cy="120" r="8" fill="#38bdf8" opacity="0.5" />
          </g>

          {/* Morpho Body */}
          <ellipse cx="100" cy="110" rx="7" ry="26" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="100" cy="84" r="8" fill="#0f172a" />

          {/* Antennae */}
          <path d="M98 78 Q84 55 76 58" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="76" cy="58" r="2.5" fill="#38bdf8" />
          <path d="M102 78 Q116 55 124 58" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="124" cy="58" r="2.5" fill="#38bdf8" />

          {/* Cyan Luminous Eyes */}
          <circle cx="97" cy="84" r="2.5" fill="#38bdf8" />
          <circle cx="103" cy="84" r="2.5" fill="#38bdf8" />
        </g>
      )}

      {/* STAGE 5: CELESTIAL PRISMWING */}
      {evolution === 5 && (
        <g>
          {/* Stardust particles */}
          <circle cx="35" cy="60" r="3" fill="#ffffff" />
          <circle cx="165" cy="60" r="3" fill="#ffffff" />
          <circle cx="30" cy="135" r="2" fill="#f472b6" />
          <circle cx="170" cy="135" r="2" fill="#38bdf8" />

          {/* Prismatic Transcendent Wings */}
          <g style={{ transformOrigin: '96px 105px', animation: 'butterflyFlapLeft 1s ease-in-out infinite' }}>
            <path
              d="M96 105 C60 30 0 35 15 115 C0 155 55 165 96 122 Z"
              fill="url(#prismwingGrad)"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.95"
            />
          </g>
          <g style={{ transformOrigin: '104px 105px', animation: 'butterflyFlapRight 1s ease-in-out infinite' }}>
            <path
              d="M104 105 C140 30 200 35 185 115 C200 155 145 165 104 122 Z"
              fill="url(#prismwingGrad)"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.95"
            />
          </g>

          {/* Celestial Body */}
          <ellipse cx="100" cy="108" rx="8" ry="26" fill="#ffffff" stroke="#a855f7" strokeWidth="2" />
          <circle cx="100" cy="82" r="9" fill="#ffffff" />

          {/* Antennae */}
          <path d="M98 76 Q82 50 72 52" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="72" cy="52" r="3" fill="#f472b6" />
          <path d="M102 76 Q118 50 128 52" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="128" cy="52" r="3" fill="#38bdf8" />

          {/* Cosmic Eyes */}
          <circle cx="97" cy="82" r="2.5" fill="#a855f7" />
          <circle cx="103" cy="82" r="2.5" fill="#a855f7" />
        </g>
      )}
    </svg>
  );
};
