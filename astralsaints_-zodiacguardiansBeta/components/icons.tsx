import React from 'react';
import { FormLevel, PowerUpType, ShipWeaponType } from '../types';
import {
  PEGASUS_SHIP_LV1,
  DRAGON_LVL1_B64,
  CYGNUS_LVL_III_B64,
  ANDROMEDA_LVL1_B64,
  PHOENIX_SHIP_1_B64,
  ASTRALSAINTS_LOGO_B64
} from '../assets';

interface ShipIconProps {
  form: FormLevel;
  isAwakened: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PegasusIcon: React.FC<ShipIconProps> = ({ className, style }) => {
  return (
    <img src={PEGASUS_SHIP_LV1} alt="Pegasus Ship" className={className} style={style} />
  );
};

export const DragonIcon: React.FC<ShipIconProps> = ({ className, style }) => (
  <img src={DRAGON_LVL1_B64} alt="Dragon Ship" className={className} style={style} />
);
export const CygnusIcon: React.FC<ShipIconProps> = ({ className, style }) => (
  <img src={CYGNUS_LVL_III_B64} alt="Cygnus Ship" className={className} style={style} />
);
export const AndromedaIcon: React.FC<ShipIconProps> = ({ className, style }) => (
  <img src={ANDROMEDA_LVL1_B64} alt="Andromeda Ship" className={className} style={style} />
);
export const PhoenixIcon: React.FC<ShipIconProps> = ({ className, style }) => (
  <img src={PHOENIX_SHIP_1_B64} alt="Phoenix Ship" className={className} style={style} />
);

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img src={ASTRALSAINTS_LOGO_B64} alt="Logo" className={className} />
);

// --- NEW ENEMY ICONS ---
export const EnemyScoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className}>
    <polygon points="32,8 56,56 8,56" fill="#1e1b4b" stroke="#6366f1" strokeWidth="4" />
    <polygon points="32,16 48,48 16,48" fill="#312e75" />
    <circle cx="32" cy="40" r="6" fill="#a5b4fc" />
  </svg>
);

export const EnemyStrikerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className}>
    <path d="M32 8 L56 32 L32 56 L8 32 Z" fill="#4a044e" stroke="#c026d3" strokeWidth="4" />
    <path d="M32 16 L48 32 L32 48 L16 32 Z" fill="#701a75" />
    <circle cx="32" cy="32" r="8" fill="#f0abfc" />
    <rect x="28" y="4" width="8" height="12" fill="#701a75" stroke="#c026d3" strokeWidth="2" />
  </svg>
);

export const EnemyBruiserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className}>
    <polygon points="32,4 60,20 60,52 32,68 4,52 4,20" fill="#7f1d1d" stroke="#ef4444" strokeWidth="4" />
    <polygon points="32,10 54,24 54,48 32,62 10,48 10,24" fill="#b91c1c" />
    <circle cx="32" cy="36" r="10" fill="#fca5a5" />
  </svg>
);

export const BossAriesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 180" className={className}>
    <path d="M60 40 C0 40, 0 140, 60 140" stroke="gold" strokeWidth="15" fill="none" />
    <path d="M140 40 C200 40, 200 140, 140 140" stroke="gold" strokeWidth="15" fill="none" />
    <path d="M100,20 L160,90 L100,160 L40,90Z" fill="#333" stroke="gold" strokeWidth="5" />
    <circle cx="100" cy="90" r="15" fill="red" />
  </svg>
);

const SpreadProjectile: React.FC<{ isAwakened?: boolean }> = ({ isAwakened }) => (
  <div className={`w-2 h-4 bg-cyan-400 rounded-sm shadow-[0_0_8px_2px_#22d3ee] ${isAwakened && 'bg-yellow-300 shadow-[0_0_12px_4px_#fde047]'}`}></div>
);
const TriBeamProjectile: React.FC<{ isAwakened?: boolean }> = ({ isAwakened }) => (
  <div className={`w-1 h-8 bg-green-400 rounded-full shadow-[0_0_8px_2px_#4ade80] ${isAwakened && 'bg-yellow-300 shadow-[0_0_12px_4px_#fde047]'}`}></div>
);
const PulseProjectile: React.FC<{ isAwakened?: boolean }> = ({ isAwakened }) => (
  <div className={`w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_8px_2px_#60a5fa] ${isAwakened && 'bg-yellow-300 shadow-[0_0_12px_4px_#fde047]'}`}></div>
);
const WaveProjectile: React.FC<{ isAwakened?: boolean }> = ({ isAwakened }) => (
  <div className={`w-8 h-2 bg-pink-400 rounded-full opacity-70 shadow-[0_0_8px_2px_#f472b6] ${isAwakened && 'bg-yellow-300 shadow-[0_0_12px_4px_#fde047]'}`}></div>
);
const ChargeProjectile: React.FC<{ isAwakened?: boolean }> = ({ isAwakened }) => (
  <div className={`w-4 h-4 bg-orange-400 rounded-full shadow-[0_0_12px_4px_#fb923c] ${isAwakened && 'bg-yellow-300 shadow-[0_0_12px_4px_#fde047]'}`}></div>
);

export const PlayerProjectileIcon: React.FC<{ className?: string; isAwakened?: boolean, weaponType?: ShipWeaponType }> = ({ className, isAwakened, weaponType }) => {
  let ProjectileComponent;
  switch (weaponType ?? ShipWeaponType.Spread) {
    case ShipWeaponType.TriBeam: ProjectileComponent = TriBeamProjectile; break;
    case ShipWeaponType.Pulse: ProjectileComponent = PulseProjectile; break;
    case ShipWeaponType.Wave: ProjectileComponent = WaveProjectile; break;
    case ShipWeaponType.Charge: ProjectileComponent = ChargeProjectile; break;
    case ShipWeaponType.Spread:
    default: ProjectileComponent = SpreadProjectile;
  }
  return <div className={className}><ProjectileComponent isAwakened={isAwakened} /></div>;
};

export const EnemyProjectileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`${className} w-3 h-3 bg-fuchsia-500 rounded-full shadow-[0_0_8px_2px_#d946ef]`}></div>
);

export const PowerUpIcon: React.FC<{ type: PowerUpType, className?: string }> = ({ type, className }) => {
  const isPower = type === PowerUpType.Power;
  const bgColor = isPower ? 'bg-red-500' : 'bg-blue-500';
  const shadowColor = isPower ? 'shadow-[0_0_15px_5px_#ef4444]' : 'shadow-[0_0_15px_5px_#3b82f6]';
  const letter = isPower ? 'P' : 'R';

  return (
    <div className={`${className} w-full h-full rounded-full flex items-center justify-center font-black text-2xl text-white ${bgColor} ${shadowColor} border-2 border-white/50`}>
      {letter}
    </div>
  );
};

export const SpecialWeaponIcon: React.FC<{ className?: string, isReady: boolean }> = ({ className, isReady }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
    className={`${className} transition-colors duration-300 ${isReady ? 'text-yellow-400' : 'text-gray-500'}`}>
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l2.06-9.75H4.192a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.923-.142z" clipRule="evenodd" />
  </svg>
);
