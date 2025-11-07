import React, { useState } from 'react';
import { ShipType, FormLevel } from '../types';
import { PegasusIcon, DragonIcon, CygnusIcon, AndromedaIcon, PhoenixIcon, LogoIcon } from './icons';

import { SHIP_DATA } from '../constants';

interface MainMenuProps {
  onStartGame: (ship: ShipType) => void;
}

const ships = Object.values(ShipType).map(type => ({
  type,
  ...SHIP_DATA[type]
}));

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [selectedShip, setSelectedShip] = useState(ships[0]);
  const [view, setView] = useState<'main' | 'hangar'>('main');

  const MainScreen = () => (
    <>
      <div className="text-center mb-12">
        <LogoIcon className="w-auto h-48 mb-2 mx-auto" />
      </div>

      <div className="flex flex-col items-center space-y-6">
        <button
          onClick={() => setView('hangar')}
          className="px-12 py-4 bg-sky-500/10 border-2 border-sky-400 text-sky-300 font-bold text-2xl font-cinzel rounded-md tracking-widest
                    hover:bg-sky-400 hover:text-black hover:shadow-[0_0_25px_#38bdf8] transition-all duration-300 transform hover:scale-105"
        >
          <span className="animate-text-glow-button">START</span>
        </button>
        <button
          onClick={() => setView('hangar')}
          className="px-10 py-3 bg-gray-500/10 border-2 border-gray-400 text-gray-300 font-bold text-xl font-cinzel rounded-md tracking-widest
                    hover:bg-gray-400 hover:text-black hover:shadow-[0_0_25px_#9ca3af] transition-all duration-300 transform hover:scale-105"
        >
          HANGAR
        </button>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-gray-400 font-orbitron text-sm">
        <p>CONTROLS: [W,A,S,D] or [ARROWS] to Move</p>
        <p>[J] for Special | [K] to Activate Awakening</p>
        <p>Ship fires automatically</p>
      </div>
    </>
  );

  const HangarScreen = () => (
    <>
      <div className="text-center mb-4">
        <h1 className="text-5xl font-cinzel font-black text-glow text-white">
          SELECT SHIP
        </h1>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="w-40 h-40 mb-4">
          <selectedShip.Icon 
            style={{ filter: selectedShip.hue ? `hue-rotate(${selectedShip.hue}deg) drop-shadow(0 0 15px_#fff)`: 'drop-shadow(0 0 15px_#fff)' }} 
            className={`w-full h-full`} 
            form={FormLevel.I} 
            isAwakened={false} 
          />
        </div>
        <h3 className={`text-3xl font-cinzel font-bold text-glow ${selectedShip.color}`}>{selectedShip.type}</h3>
        <p className="text-center text-gray-300 mt-2 h-16 w-3/4">{selectedShip.description}</p>
      </div>

      <div className="flex justify-center items-center space-x-3 mb-6">
        {ships.map((ship) => (
          <button
            key={ship.type}
            onClick={() => setSelectedShip(ship)}
            className={`w-16 h-16 p-2 rounded-lg border-2 transition-all duration-300 ${
              selectedShip.type === ship.type
                ? 'border-yellow-400 scale-110 bg-yellow-400/20'
                : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/60'
            } ${ship.shadow}`}
          >
            <ship.Icon 
              style={{ filter: ship.hue ? `hue-rotate(${ship.hue}deg)`: undefined }}
              className={`w-full h-full`} 
              form={FormLevel.I} 
              isAwakened={false} 
            />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-4">
         <button
          onClick={() => setView('main')}
          className="px-8 py-3 bg-gray-500/10 border-2 border-gray-400 text-gray-300 font-bold text-xl font-cinzel rounded-md tracking-widest
                    hover:bg-gray-400 hover:text-black hover:shadow-[0_0_25px_#9ca3af] transition-all duration-300 transform hover:scale-105"
        >
          BACK
        </button>
        <button
          onClick={() => onStartGame(selectedShip.type)}
          className="px-10 py-4 bg-sky-500/10 border-2 border-sky-400 text-sky-300 font-bold text-2xl font-cinzel rounded-md tracking-widest
                   hover:bg-sky-400 hover:text-black hover:shadow-[0_0_25px_#38bdf8] transition-all duration-300 transform hover:scale-110"
        >
           <span className="animate-text-glow-button">ENGAGE</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="w-full h-full relative overflow-hidden animate-fadeIn">
      {/* Background */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #1e2c5e, #000)' }}
      />
      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60" />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        {view === 'main' ? <MainScreen /> : <HangarScreen />}
      </div>
    </div>
  );
};

export default MainMenu;