import React from 'react';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

    body {
      margin: 0;
      font-family: 'VT323', monospace;
      overflow: hidden;
      background-color: #1c1917;
      user-select: none;
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* Animations */
    @keyframes toast-slide {
      0% { transform: translate(-50%, 150%); opacity: 0; }
      10% { transform: translate(-50%, 0); opacity: 1; }
      85% { transform: translate(-50%, 0); opacity: 1; }
      100% { transform: translate(-50%, 150%); opacity: 0; }
    }

    @keyframes shake-flipped { 
        0%, 100% { transform: translateX(0) rotateY(180deg); } 
        25% { transform: translateX(-5px) rotateY(180deg); } 
        75% { transform: translateX(5px) rotateY(180deg); } 
    }
    .animate-shake-flipped { animation: shake-flipped 0.4s ease-in-out; }

    @keyframes scroll-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }
    .animate-scroll-left { animation: scroll-left 60s linear infinite; }
    
    @keyframes rainbow { 
        0% { color: #ff0000; } 15% { color: #ff7f00; } 30% { color: #ffff00; } 
        45% { color: #00ff00; } 60% { color: #0000ff; } 75% { color: #4b0082; } 
        90% { color: #8f00ff; } 100% { color: #ff0000; }
    }
    .text-rainbow { animation: rainbow 2s linear infinite; }

    @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .animate-bob { animation: bob 2s ease-in-out infinite; }

    @keyframes knockback {
        0% { transform: scale(1) rotate(0deg); filter: none; }
        10% { transform: scale(0.9) rotate(-5deg); filter: sepia(1) hue-rotate(-50deg) saturate(5) brightness(0.8); } 
        30% { transform: scale(0.85) rotate(5deg); filter: sepia(1) hue-rotate(-50deg) saturate(5) brightness(0.8); }
        100% { transform: scale(1) rotate(0deg); filter: none; }
    }
    .animate-knockback { animation: knockback 0.4s ease-out forwards; }
    
    @keyframes shake { 
        0%, 100% { transform: translateX(0); } 
        25% { transform: translateX(-5px); } 
        75% { transform: translateX(5px); } 
    }
    .animate-shake { animation: shake 0.2s ease-in-out 3; }

    /* 3D Transform Classes */
    .perspective-1000 { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }

    /* Slider Styling */
    input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%;
        background: #FACC15; border: 2px solid #FFFFFF; cursor: pointer; margin-top: -8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    input[type=range]::-webkit-slider-runnable-track {
        width: 100%; height: 8px; cursor: pointer; background: #44403C;
        border-radius: 4px; border: 1px solid #78716C;
    }
    
    .gem-socket {
        position: absolute; top: -16px; left: 50%; transform: translateX(-50%); width: 32px; height: 32px;
        background: #222; border: 2px solid #FFD700; border-radius: 50%; z-index: 50;
        display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.5);
    }
    .gem-stone {
        width: 18px; height: 18px; border-radius: 2px; transform: rotate(45deg);
        box-shadow: inset 2px 2px 4px rgba(255,255,255,0.7), inset -2px -2px 4px rgba(0,0,0,0.5), 0 0 4px currentColor;
        border: 1px solid rgba(0,0,0,0.5);
    }
    
    /* Card glow and border styles */
    .selected-card-glow {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3);
    }
    
    .border-wood { border-color: #8B4513 !important; }
    .border-stone { border-color: #808080 !important; }
    .border-gold { border-color: #FFD700 !important; }
    .border-iron { border-color: #C0C0C0 !important; }
    .border-emerald { border-color: #50C878 !important; }
    .border-diamond { border-color: #00CED1 !important; }
    .border-netherite { border-color: #4A4A4A !important; }
  `}</style>
);

export default GlobalStyles;
