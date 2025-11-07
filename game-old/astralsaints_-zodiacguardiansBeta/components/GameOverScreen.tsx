import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="w-full h-full bg-black bg-opacity-90 flex flex-col items-center justify-center p-8 text-white animate-fadeIn">
      <h1 className="text-8xl font-cinzel font-black text-red-600 drop-shadow-[0_0_10px_#dc2626]">
        GAME OVER
      </h1>
      <p className="mt-8 text-2xl font-orbitron">Final Score</p>
      <p className="text-6xl font-orbitron font-bold text-cyan-400 mt-2 drop-shadow-[0_0_10px_#22d3ee]">
        {score.toLocaleString()}
      </p>
      <button
        onClick={onRestart}
        className="mt-12 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-2xl font-cinzel rounded-md tracking-widest
                   hover:scale-105 hover:shadow-[0_0_25px_#0891b2] transition-all duration-300 transform"
      >
        PLAY AGAIN
      </button>
    </div>
  );
};

export default GameOverScreen;
