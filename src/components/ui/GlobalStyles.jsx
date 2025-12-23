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

    /* Achievement Toast Animation with Happy Dance */
    @keyframes achievement-toast {
      0% { transform: translate(-50%, 150%); opacity: 0; }
      8% { transform: translate(-50%, 0); opacity: 1; }
      /* Happy dance/shake phase */
      12% { transform: translate(-50%, 0) rotate(-2deg) scale(1.02); }
      16% { transform: translate(-50%, -5px) rotate(2deg) scale(1.05); }
      20% { transform: translate(-50%, 0) rotate(-2deg) scale(1.02); }
      24% { transform: translate(-50%, -3px) rotate(1deg) scale(1.03); }
      28% { transform: translate(-50%, 0) rotate(0deg) scale(1); }
      /* Hold phase */
      82% { transform: translate(-50%, 0); opacity: 1; }
      100% { transform: translate(-50%, 150%); opacity: 0; }
    }
    .animate-achievement-toast {
      animation: achievement-toast 6s ease-in-out;
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

    @keyframes action {
        0% { transform: scale(1) rotate(0deg); filter: none; }
        10% { transform: scale(var(--action-scale, 0.9)) rotate(-5deg); filter: sepia(1) hue-rotate(var(--action-hue, -50deg)) saturate(5) brightness(var(--action-brightness, 0.8)); } 
        30% { transform: scale(var(--action-scale, 0.85)) rotate(5deg); filter: sepia(1) hue-rotate(var(--action-hue, -50deg)) saturate(5) brightness(var(--action-brightness, 0.8)); }
        100% { transform: scale(1) rotate(0deg); filter: none; }
    }
    .animate-action { animation: action 0.4s ease-out forwards; }
    .animate-knockback { animation: action 0.4s ease-out forwards; }
    
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
    
    /* Rainbow ring animation for verified parents */
    @keyframes rainbow-ring {
        0% { box-shadow: 0 0 0 4px #ff0000, 0 0 15px #ff0000; }
        14% { box-shadow: 0 0 0 4px #ff7f00, 0 0 15px #ff7f00; }
        28% { box-shadow: 0 0 0 4px #ffff00, 0 0 15px #ffff00; }
        42% { box-shadow: 0 0 0 4px #00ff00, 0 0 15px #00ff00; }
        57% { box-shadow: 0 0 0 4px #0000ff, 0 0 15px #0000ff; }
        71% { box-shadow: 0 0 0 4px #4b0082, 0 0 15px #4b0082; }
        85% { box-shadow: 0 0 0 4px #8f00ff, 0 0 15px #8f00ff; }
        100% { box-shadow: 0 0 0 4px #ff0000, 0 0 15px #ff0000; }
    }
    .ring-rainbow {
        animation: rainbow-ring 3s linear infinite;
    }
    
    /* Border Effect Animations for Skill Cards */
    
    /* Rainbow Border */
    @keyframes border-rainbow {
        0% { border-color: #ff0000; box-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000; }
        14% { border-color: #ff7f00; box-shadow: 0 0 20px #ff7f00, 0 0 40px #ff7f00; }
        28% { border-color: #ffff00; box-shadow: 0 0 20px #ffff00, 0 0 40px #ffff00; }
        42% { border-color: #00ff00; box-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00; }
        57% { border-color: #0000ff; box-shadow: 0 0 20px #0000ff, 0 0 40px #0000ff; }
        71% { border-color: #4b0082; box-shadow: 0 0 20px #4b0082, 0 0 40px #4b0082; }
        85% { border-color: #8f00ff; box-shadow: 0 0 20px #8f00ff, 0 0 40px #8f00ff; }
        100% { border-color: #ff0000; box-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000; }
    }
    .border-effect-rainbow {
        animation: border-rainbow 3s linear infinite;
    }
    
    /* Gradient Sweep */
    @keyframes border-gradient {
        0% { 
            border-image: linear-gradient(0deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4) 1;
            box-shadow: 0 0 20px #ff6b6b;
        }
        25% { 
            border-image: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4) 1;
            box-shadow: 0 0 20px #4ecdc4;
        }
        50% { 
            border-image: linear-gradient(180deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4) 1;
            box-shadow: 0 0 20px #45b7d1;
        }
        75% { 
            border-image: linear-gradient(270deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4) 1;
            box-shadow: 0 0 20px #96ceb4;
        }
        100% { 
            border-image: linear-gradient(360deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4) 1;
            box-shadow: 0 0 20px #ff6b6b;
        }
    }
    .border-effect-gradient {
        animation: border-gradient 3s linear infinite;
    }
    
    /* Particle Sparkle */
    @keyframes border-sparkle {
        0%, 100% { 
            box-shadow: 
                0 0 20px var(--border-color, #FFD700),
                10px 10px 5px rgba(255, 255, 255, 0.8),
                -10px -10px 5px rgba(255, 255, 255, 0.8);
        }
        25% { 
            box-shadow: 
                0 0 20px var(--border-color, #FFD700),
                -10px 10px 5px rgba(255, 255, 255, 0.8),
                10px -10px 5px rgba(255, 255, 255, 0.8);
        }
        50% { 
            box-shadow: 
                0 0 20px var(--border-color, #FFD700),
                0 15px 5px rgba(255, 255, 255, 0.8),
                0 -15px 5px rgba(255, 255, 255, 0.8);
        }
        75% { 
            box-shadow: 
                0 0 20px var(--border-color, #FFD700),
                15px 0 5px rgba(255, 255, 255, 0.8),
                -15px 0 5px rgba(255, 255, 255, 0.8);
        }
    }
    .border-effect-sparkle {
        animation: border-sparkle 1.5s linear infinite;
    }
    
    /* Electric/Lightning */
    @keyframes border-electric {
        0%, 100% { 
            box-shadow: 
                0 0 10px #00ffff,
                0 0 20px #00ffff,
                0 0 30px #00ffff,
                2px 2px 2px rgba(255, 255, 255, 0.9);
            filter: brightness(1);
        }
        10%, 20%, 30%, 40% {
            box-shadow: 
                0 0 5px #00ffff,
                0 0 10px #00ffff,
                0 0 15px #00ffff;
            filter: brightness(1.3);
        }
        15%, 25%, 35%, 45% {
            box-shadow: 
                0 0 15px #00ffff,
                0 0 30px #00ffff,
                0 0 45px #00ffff,
                -2px -2px 2px rgba(255, 255, 255, 0.9);
            filter: brightness(1.5);
        }
    }
    .border-effect-electric {
        animation: border-electric 1s linear infinite;
        border-color: #00ffff;
    }
    
    /* Fire/Flame */
    @keyframes border-fire {
        0%, 100% { 
            box-shadow: 
                0 0 20px #ff4500,
                0 0 40px #ff8c00,
                0 0 60px #ffd700;
            filter: hue-rotate(0deg);
        }
        25% { 
            box-shadow: 
                0 0 30px #ff8c00,
                0 0 50px #ffd700,
                0 0 70px #ff4500;
            filter: hue-rotate(5deg);
        }
        50% { 
            box-shadow: 
                0 0 25px #ffd700,
                0 0 45px #ff4500,
                0 0 65px #ff8c00;
            filter: hue-rotate(-5deg);
        }
        75% { 
            box-shadow: 
                0 0 35px #ff4500,
                0 0 55px #ff8c00,
                0 0 75px #ffd700;
            filter: hue-rotate(5deg);
        }
    }
    .border-effect-fire {
        animation: border-fire 1s ease-in-out infinite;
        border-color: #ff4500;
    }
    
    /* Frost/Ice */
    @keyframes border-frost {
        0%, 100% { 
            box-shadow: 
                0 0 20px #00ffff,
                0 0 40px #87ceeb,
                inset 0 0 10px rgba(255, 255, 255, 0.3);
            filter: brightness(1);
        }
        50% { 
            box-shadow: 
                0 0 30px #87ceeb,
                0 0 50px #00ffff,
                inset 0 0 20px rgba(255, 255, 255, 0.5);
            filter: brightness(1.2);
        }
    }
    .border-effect-frost {
        animation: border-frost 3s ease-in-out infinite;
        border-color: #87ceeb;
    }
    
    /* Shadow/Dark Aura */
    @keyframes border-shadow {
        0%, 100% { 
            box-shadow: 
                0 0 20px #4b0082,
                0 0 40px #2f1847,
                0 0 60px rgba(0, 0, 0, 0.8);
            filter: contrast(1.1);
        }
        50% { 
            box-shadow: 
                0 0 30px #2f1847,
                0 0 50px #4b0082,
                0 0 70px rgba(0, 0, 0, 0.9);
            filter: contrast(1.2);
        }
    }
    .border-effect-shadow {
        animation: border-shadow 2s ease-in-out infinite;
        border-color: #4b0082;
    }
    
    /* Lifestream - Swirling emerald energy tendrils */
    @keyframes border-lifestream {
        0% { 
            box-shadow: 
                0 0 20px #50C878,
                5px 5px 15px #3cb371,
                -5px -5px 15px #2e8b57,
                10px -10px 20px rgba(80, 200, 120, 0.6),
                -10px 10px 20px rgba(60, 179, 113, 0.6);
            filter: brightness(1) hue-rotate(0deg);
        }
        25% { 
            box-shadow: 
                0 0 25px #3cb371,
                -5px 10px 15px #50C878,
                10px -5px 15px #2e8b57,
                -10px -10px 20px rgba(60, 179, 113, 0.6),
                10px 10px 20px rgba(80, 200, 120, 0.6);
            filter: brightness(1.1) hue-rotate(5deg);
        }
        50% { 
            box-shadow: 
                0 0 30px #2e8b57,
                -10px -5px 15px #3cb371,
                5px 10px 15px #50C878,
                10px 10px 20px rgba(46, 139, 87, 0.6),
                -10px -10px 20px rgba(80, 200, 120, 0.6);
            filter: brightness(1.2) hue-rotate(-5deg);
        }
        75% { 
            box-shadow: 
                0 0 25px #50C878,
                10px -5px 15px #2e8b57,
                -5px 5px 15px #3cb371,
                -10px 10px 20px rgba(80, 200, 120, 0.6),
                10px -10px 20px rgba(46, 139, 87, 0.6);
            filter: brightness(1.1) hue-rotate(5deg);
        }
        100% { 
            box-shadow: 
                0 0 20px #50C878,
                5px 5px 15px #3cb371,
                -5px -5px 15px #2e8b57,
                10px -10px 20px rgba(80, 200, 120, 0.6),
                -10px 10px 20px rgba(60, 179, 113, 0.6);
            filter: brightness(1) hue-rotate(0deg);
        }
    }
    .border-effect-lifestream {
        animation: border-lifestream 3s ease-in-out infinite;
        border-color: #50C878;
    }
    
    /* Chevron Ebb and Flow Animation - Enhanced for curved carousel */
    @keyframes chevron-float {
        0%, 100% { transform: translateX(0) translateY(0); opacity: 0.8; }
        50% { transform: translateX(-4px) translateY(-2px); opacity: 1; }
    }
    @keyframes chevron-float-right {
        0%, 100% { transform: translateX(0) translateY(0); opacity: 0.8; }
        50% { transform: translateX(4px) translateY(-2px); opacity: 1; }
    }
    .animate-chevron-left {
        animation: chevron-float 2s ease-in-out infinite;
    }
    .animate-chevron-right {
        animation: chevron-float-right 2s ease-in-out infinite;
    }
    
    /* Spinning Aura Animation for Battle Mob Display */
    @keyframes spin-aura {
        0% { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(360deg) scale(1); }
    }
    .animate-spin-aura {
        animation: spin-aura 4s linear infinite;
    }
    
    /* Breathing/Pulsing Animation for Organic Auras */
    @keyframes aura-breathe {
        0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
        }
        50% { 
            transform: scale(1.1);
            opacity: 0.8;
        }
    }
    
    /* Frozen Aura Color-Cycling Animation */
    @keyframes aura-frost-cycle {
        0%, 100% {
            box-shadow: 
                0 0 40px rgba(135, 206, 235, 0.9),
                0 0 80px rgba(0, 255, 255, 0.6),
                0 0 120px rgba(173, 216, 230, 0.4),
                inset 0 0 40px rgba(255, 255, 255, 0.3);
        }
        25% {
            box-shadow: 
                0 0 50px rgba(0, 255, 255, 1),
                0 0 90px rgba(176, 224, 230, 0.7),
                0 0 130px rgba(135, 206, 235, 0.5),
                inset 0 0 45px rgba(255, 255, 255, 0.4);
        }
        50% {
            box-shadow: 
                0 0 45px rgba(173, 216, 230, 0.95),
                0 0 85px rgba(255, 255, 255, 0.65),
                0 0 125px rgba(0, 255, 255, 0.45),
                inset 0 0 50px rgba(176, 224, 230, 0.35);
        }
        75% {
            box-shadow: 
                0 0 55px rgba(176, 224, 230, 1),
                0 0 95px rgba(135, 206, 235, 0.75),
                0 0 135px rgba(255, 255, 255, 0.5),
                inset 0 0 40px rgba(0, 255, 255, 0.3);
        }
    }
    
    /* Volatile/Plasma Aura Electric Zapping Animation */
    @keyframes aura-plasma-cycle {
        0%, 100% {
            box-shadow: 
                0 0 30px rgba(0, 255, 255, 0.9),
                0 0 60px rgba(0, 255, 255, 0.7),
                0 0 90px rgba(255, 255, 255, 0.5),
                3px 3px 10px rgba(255, 255, 255, 0.8);
        }
        10%, 30%, 50%, 70%, 90% {
            box-shadow: 
                0 0 50px rgba(255, 255, 0, 1),
                0 0 100px rgba(0, 255, 255, 0.8),
                0 0 150px rgba(255, 255, 255, 0.6),
                5px 5px 15px rgba(255, 255, 255, 1);
        }
        20%, 40%, 60%, 80% {
            box-shadow: 
                0 0 40px rgba(255, 255, 255, 1),
                0 0 80px rgba(255, 255, 0, 0.9),
                0 0 120px rgba(0, 255, 255, 0.7),
                -3px -3px 12px rgba(255, 255, 0, 0.9);
        }
    }
    
    /* Flaming/Lava Aura Fire Animation */
    @keyframes aura-lava-cycle {
        0%, 100% {
            box-shadow: 
                0 0 50px rgba(255, 69, 0, 1),
                0 0 100px rgba(255, 140, 0, 0.8),
                0 0 150px rgba(255, 215, 0, 0.6);
        }
        20% {
            box-shadow: 
                0 0 60px rgba(255, 140, 0, 1),
                0 0 110px rgba(255, 0, 0, 0.85),
                0 0 160px rgba(255, 69, 0, 0.65);
        }
        40% {
            box-shadow: 
                0 0 55px rgba(255, 215, 0, 1),
                0 0 105px rgba(255, 140, 0, 0.9),
                0 0 155px rgba(255, 69, 0, 0.7);
        }
        60% {
            box-shadow: 
                0 0 65px rgba(255, 0, 0, 1),
                0 0 115px rgba(255, 69, 0, 0.9),
                0 0 165px rgba(255, 215, 0, 0.7);
        }
        80% {
            box-shadow: 
                0 0 58px rgba(255, 140, 0, 1),
                0 0 108px rgba(255, 215, 0, 0.85),
                0 0 158px rgba(255, 0, 0, 0.65);
        }
    }
    
    /* Overgrown/Nature Aura Green Animation */
    @keyframes aura-nature-cycle {
        0%, 100% {
            box-shadow: 
                0 0 45px rgba(80, 200, 120, 0.9),
                0 0 85px rgba(60, 179, 113, 0.7),
                0 0 125px rgba(144, 238, 144, 0.5),
                inset 0 0 35px rgba(144, 238, 144, 0.3);
        }
        25% {
            box-shadow: 
                0 0 50px rgba(60, 179, 113, 1),
                0 0 90px rgba(46, 139, 87, 0.75),
                0 0 130px rgba(80, 200, 120, 0.55),
                inset 0 0 40px rgba(60, 179, 113, 0.35);
        }
        50% {
            box-shadow: 
                0 0 55px rgba(144, 238, 144, 1),
                0 0 95px rgba(80, 200, 120, 0.8),
                0 0 135px rgba(60, 179, 113, 0.6),
                inset 0 0 45px rgba(80, 200, 120, 0.4);
        }
        75% {
            box-shadow: 
                0 0 48px rgba(46, 139, 87, 0.95),
                0 0 88px rgba(34, 139, 34, 0.7),
                0 0 128px rgba(144, 238, 144, 0.52),
                inset 0 0 38px rgba(46, 139, 87, 0.32);
        }
    }
    
    /* Shifting/Gradient Aura Rainbow-like Shifting */
    @keyframes aura-gradient-cycle {
        0%, 100% {
            box-shadow: 
                0 0 45px rgba(255, 107, 107, 0.8),
                0 0 85px rgba(78, 205, 196, 0.6),
                0 0 125px rgba(69, 183, 209, 0.4);
        }
        16% {
            box-shadow: 
                0 0 50px rgba(78, 205, 196, 0.85),
                0 0 90px rgba(69, 183, 209, 0.65),
                0 0 130px rgba(150, 206, 180, 0.45);
        }
        33% {
            box-shadow: 
                0 0 48px rgba(69, 183, 209, 0.9),
                0 0 88px rgba(150, 206, 180, 0.7),
                0 0 128px rgba(255, 107, 107, 0.5);
        }
        50% {
            box-shadow: 
                0 0 52px rgba(150, 206, 180, 0.85),
                0 0 92px rgba(255, 107, 107, 0.65),
                0 0 132px rgba(78, 205, 196, 0.45);
        }
        66% {
            box-shadow: 
                0 0 47px rgba(255, 107, 107, 0.8),
                0 0 87px rgba(150, 206, 180, 0.6),
                0 0 127px rgba(69, 183, 209, 0.4);
        }
        83% {
            box-shadow: 
                0 0 49px rgba(69, 183, 209, 0.88),
                0 0 89px rgba(255, 107, 107, 0.68),
                0 0 129px rgba(78, 205, 196, 0.48);
        }
    }
    
    /* Pulsing for Spiky Auras (no scale, just opacity) */
    @keyframes aura-pulse-spiky {
        0%, 100% { 
            opacity: 0.7;
        }
        50% { 
            opacity: 0.9;
        }
    }
    
    /* Base Aura Styles - Organic Shapes */
    .aura-rainbow,
    .aura-shadow,
    .aura-lava,
    .aura-gradient,
    .aura-sparkle,
    .aura-nature {
        position: relative;
        border-radius: 47% 53% 45% 55% / 52% 48% 52% 48%; /* Organic shape */
        filter: blur(3px);
    }
    
    /* Spiky Auras - Frost and Plasma */
    .aura-frost,
    .aura-plasma {
        position: relative;
        clip-path: polygon(
            50% 0%, 55% 10%, 65% 5%, 70% 15%, 80% 10%, 85% 20%, 95% 15%, 100% 25%,
            95% 35%, 100% 45%, 95% 55%, 100% 65%, 95% 75%, 100% 85%, 90% 90%, 85% 100%,
            75% 95%, 70% 100%, 60% 95%, 50% 100%, 40% 95%, 30% 100%, 25% 95%, 15% 100%,
            10% 90%, 0% 85%, 5% 75%, 0% 65%, 5% 55%, 0% 45%, 5% 35%, 0% 25%,
            5% 15%, 15% 10%, 20% 20%, 30% 5%, 35% 15%, 45% 10%
        ); /* Jagged, spiky shape */
        filter: blur(2px);
    }
    
    /* Organic aura layers with pseudo-elements */
    .aura-rainbow::before,
    .aura-shadow::before,
    .aura-lava::before,
    .aura-gradient::before,
    .aura-sparkle::before,
    .aura-nature::before {
        content: '';
        position: absolute;
        top: -15%;
        left: -15%;
        width: 130%;
        height: 130%;
        border-radius: 45% 55% 52% 48% / 48% 52% 48% 52%; /* Different organic shape */
        animation: aura-breathe 3s ease-in-out infinite;
        filter: blur(8px);
    }
    
    .aura-rainbow::after,
    .aura-shadow::after,
    .aura-lava::after,
    .aura-gradient::after,
    .aura-sparkle::after,
    .aura-nature::after {
        content: '';
        position: absolute;
        top: -8%;
        left: -8%;
        width: 116%;
        height: 116%;
        border-radius: 52% 48% 47% 53% / 55% 45% 55% 45%; /* Another organic shape */
        animation: aura-breathe 2.5s ease-in-out infinite 0.5s;
        filter: blur(5px);
    }
    
    /* Spiky aura layers - different clip-paths for variation */
    .aura-frost::before,
    .aura-plasma::before {
        content: '';
        position: absolute;
        top: -20%;
        left: -20%;
        width: 140%;
        height: 140%;
        clip-path: polygon(
            50% 5%, 53% 12%, 60% 8%, 67% 18%, 75% 12%, 82% 22%, 88% 18%, 95% 28%,
            92% 38%, 97% 48%, 92% 58%, 97% 68%, 92% 78%, 95% 88%, 88% 92%, 82% 95%,
            75% 90%, 67% 95%, 60% 90%, 50% 95%, 40% 90%, 33% 95%, 25% 90%, 18% 95%,
            12% 92%, 5% 88%, 8% 78%, 3% 68%, 8% 58%, 3% 48%, 8% 38%, 5% 28%,
            12% 18%, 18% 22%, 25% 12%, 33% 18%, 40% 8%, 47% 12%
        );
        animation: aura-pulse-spiky 2s ease-in-out infinite;
        filter: blur(6px);
    }
    
    .aura-frost::after,
    .aura-plasma::after {
        content: '';
        position: absolute;
        top: -10%;
        left: -10%;
        width: 120%;
        height: 120%;
        clip-path: polygon(
            50% 2%, 54% 12%, 62% 7%, 68% 17%, 77% 10%, 84% 20%, 90% 15%, 98% 25%,
            93% 35%, 98% 45%, 93% 55%, 98% 65%, 93% 75%, 98% 85%, 90% 88%, 84% 93%,
            77% 87%, 68% 93%, 62% 87%, 50% 98%, 38% 87%, 32% 93%, 23% 87%, 16% 93%,
            10% 88%, 2% 85%, 7% 75%, 2% 65%, 7% 55%, 2% 45%, 7% 35%, 2% 25%,
            10% 15%, 16% 20%, 23% 10%, 32% 17%, 38% 7%, 46% 12%
        );
        animation: aura-pulse-spiky 1.7s ease-in-out infinite 0.3s;
        filter: blur(4px);
    }
    
    /* Prismatic/Rainbow Aura */
    .aura-rainbow {
        background: radial-gradient(ellipse at center,
            rgba(255, 0, 0, 0.3) 0%,
            rgba(255, 127, 0, 0.3) 14%,
            rgba(255, 255, 0, 0.3) 28%,
            rgba(0, 255, 0, 0.3) 42%,
            rgba(0, 0, 255, 0.3) 57%,
            rgba(75, 0, 130, 0.3) 71%,
            rgba(143, 0, 255, 0.3) 85%,
            transparent 100%
        );
        box-shadow: 
            0 0 30px rgba(255, 0, 255, 0.6),
            0 0 60px rgba(0, 255, 255, 0.4),
            inset 0 0 30px rgba(255, 255, 255, 0.2);
    }
    
    .aura-rainbow::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 127, 0, 0.4) 0%,
            rgba(255, 255, 0, 0.3) 33%,
            rgba(0, 255, 255, 0.2) 66%,
            transparent 100%
        );
    }
    
    .aura-rainbow::after {
        background: radial-gradient(ellipse at center,
            rgba(143, 0, 255, 0.5) 0%,
            rgba(255, 0, 127, 0.3) 50%,
            transparent 100%
        );
    }
    
    /* Frozen/Frost Aura */
    .aura-frost {
        background: radial-gradient(ellipse at center,
            rgba(135, 206, 235, 0.5) 0%,
            rgba(0, 255, 255, 0.4) 50%,
            transparent 100%
        );
        animation: aura-frost-cycle 3s ease-in-out infinite;
    }
    
    .aura-frost::before {
        background: radial-gradient(ellipse at center,
            rgba(173, 216, 230, 0.6) 0%,
            rgba(135, 206, 235, 0.4) 60%,
            transparent 100%
        );
    }
    
    .aura-frost::after {
        background: radial-gradient(ellipse at center,
            rgba(0, 255, 255, 0.7) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
        );
    }
    
    /* Shadowy/Dark Aura */
    .aura-shadow {
        background: radial-gradient(ellipse at center,
            rgba(75, 0, 130, 0.5) 0%,
            rgba(47, 24, 71, 0.4) 50%,
            rgba(0, 0, 0, 0.6) 100%
        );
        box-shadow: 
            0 0 40px rgba(75, 0, 130, 0.9),
            0 0 80px rgba(47, 24, 71, 0.7),
            inset 0 0 30px rgba(0, 0, 0, 0.8);
    }
    
    .aura-shadow::before {
        background: radial-gradient(ellipse at center,
            rgba(75, 0, 130, 0.6) 0%,
            rgba(30, 0, 60, 0.4) 60%,
            transparent 100%
        );
    }
    
    .aura-shadow::after {
        background: radial-gradient(ellipse at center,
            rgba(47, 24, 71, 0.7) 0%,
            rgba(0, 0, 0, 0.5) 50%,
            transparent 100%
        );
    }
    
    /* Flaming/Lava Aura */
    .aura-lava {
        background: radial-gradient(ellipse at center,
            rgba(255, 69, 0, 0.6) 0%,
            rgba(255, 140, 0, 0.5) 40%,
            rgba(255, 215, 0, 0.4) 70%,
            transparent 100%
        );
        animation: aura-lava-cycle 2s ease-in-out infinite;
    }
    
    .aura-lava::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 140, 0, 0.7) 0%,
            rgba(255, 0, 0, 0.5) 50%,
            transparent 100%
        );
    }
    
    .aura-lava::after {
        background: radial-gradient(ellipse at center,
            rgba(255, 215, 0, 0.8) 0%,
            rgba(255, 69, 0, 0.4) 60%,
            transparent 100%
        );
    }
    
    /* Shifting/Gradient Aura */
    .aura-gradient {
        background: radial-gradient(ellipse at center,
            rgba(255, 107, 107, 0.5) 0%,
            rgba(78, 205, 196, 0.4) 33%,
            rgba(69, 183, 209, 0.4) 66%,
            transparent 100%
        );
        animation: aura-gradient-cycle 4s ease-in-out infinite;
    }
    
    .aura-gradient::before {
        background: radial-gradient(ellipse at center,
            rgba(78, 205, 196, 0.6) 0%,
            rgba(150, 206, 180, 0.4) 60%,
            transparent 100%
        );
    }
    
    .aura-gradient::after {
        background: radial-gradient(ellipse at center,
            rgba(69, 183, 209, 0.7) 0%,
            rgba(255, 107, 107, 0.3) 50%,
            transparent 100%
        );
    }
    
    /* Glittering/Sparkle Aura */
    .aura-sparkle {
        background: radial-gradient(ellipse at center,
            rgba(255, 215, 0, 0.5) 0%,
            rgba(255, 223, 128, 0.3) 50%,
            transparent 100%
        );
        box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.9),
            0 0 60px rgba(255, 215, 0, 0.6),
            5px 5px 15px rgba(255, 255, 255, 0.8),
            -5px -5px 15px rgba(255, 255, 255, 0.8),
            10px -10px 15px rgba(255, 215, 0, 0.6),
            -10px 10px 15px rgba(255, 215, 0, 0.6);
    }
    
    .aura-sparkle::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 215, 0, 0.4) 50%,
            transparent 100%
        );
    }
    
    .aura-sparkle::after {
        background: radial-gradient(ellipse at center,
            rgba(255, 215, 0, 0.7) 0%,
            rgba(255, 255, 200, 0.3) 60%,
            transparent 100%
        );
    }
    
    /* Volatile/Plasma Aura */
    .aura-plasma {
        background: radial-gradient(ellipse at center,
            rgba(0, 255, 255, 0.6) 0%,
            rgba(255, 255, 0, 0.5) 50%,
            transparent 100%
        );
        animation: aura-plasma-cycle 1.5s ease-in-out infinite;
    }
    
    .aura-plasma::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 255, 255, 0.7) 0%,
            rgba(0, 255, 255, 0.4) 60%,
            transparent 100%
        );
    }
    
    .aura-plasma::after {
        background: radial-gradient(ellipse at center,
            rgba(255, 255, 0, 0.8) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
        );
    }
    
    /* Overgrown/Nature Aura */
    .aura-nature {
        background: radial-gradient(ellipse at center,
            rgba(80, 200, 120, 0.6) 0%,
            rgba(60, 179, 113, 0.5) 50%,
            rgba(34, 139, 34, 0.4) 80%,
            transparent 100%
        );
        animation: aura-nature-cycle 3.5s ease-in-out infinite;
    }
    
    .aura-nature::before {
        background: radial-gradient(ellipse at center,
            rgba(144, 238, 144, 0.7) 0%,
            rgba(80, 200, 120, 0.4) 60%,
            transparent 100%
        );
    }
    
    .aura-nature::after {
        background: radial-gradient(ellipse at center,
            rgba(60, 179, 113, 0.8) 0%,
            rgba(46, 139, 87, 0.3) 50%,
            transparent 100%
        );
    }
    
    /* Composite MobWithAura Container Styles */
    /* The aura is rendered as a ::before pseudo-element that fills the container */
    /* The mob image is centered within the container using flexbox */
    /* This ensures perfect alignment because both share the same positioning context */
    
    .mob-with-aura-container::before {
        content: '';
        position: absolute;
        inset: 0; /* Fills entire container */
        opacity: 0.6;
        z-index: 0;
        animation: spin-aura 4s linear infinite;
    }
    
    /* Apply aura styles based on data-aura attribute */
    .mob-with-aura-container[data-aura="rainbow"]::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 0, 0, 0.3) 0%,
            rgba(255, 127, 0, 0.3) 14%,
            rgba(255, 255, 0, 0.3) 28%,
            rgba(0, 255, 0, 0.3) 42%,
            rgba(0, 0, 255, 0.3) 57%,
            rgba(75, 0, 130, 0.3) 71%,
            rgba(143, 0, 255, 0.3) 85%,
            transparent 100%
        );
        border-radius: 47% 53% 45% 55% / 52% 48% 52% 48%;
        filter: blur(3px);
        box-shadow: 
            0 0 30px rgba(255, 0, 255, 0.6),
            0 0 60px rgba(0, 255, 255, 0.4),
            inset 0 0 30px rgba(255, 255, 255, 0.2);
    }
    
    .mob-with-aura-container[data-aura="frost"]::before {
        background: radial-gradient(ellipse at center,
            rgba(135, 206, 235, 0.5) 0%,
            rgba(0, 255, 255, 0.4) 50%,
            transparent 100%
        );
        clip-path: polygon(
            50% 0%, 55% 10%, 65% 5%, 70% 15%, 80% 10%, 85% 20%, 95% 15%, 100% 25%,
            95% 35%, 100% 45%, 95% 55%, 100% 65%, 95% 75%, 100% 85%, 90% 90%, 85% 100%,
            75% 95%, 70% 100%, 60% 95%, 50% 100%, 40% 95%, 30% 100%, 25% 95%, 15% 100%,
            10% 90%, 0% 85%, 5% 75%, 0% 65%, 5% 55%, 0% 45%, 5% 35%, 0% 25%,
            5% 15%, 15% 10%, 20% 20%, 30% 5%, 35% 15%, 45% 10%
        );
        filter: blur(2px);
        animation: spin-aura 4s linear infinite, aura-frost-cycle 3s ease-in-out infinite;
    }
    
    .mob-with-aura-container[data-aura="shadow"]::before {
        background: radial-gradient(ellipse at center,
            rgba(75, 0, 130, 0.5) 0%,
            rgba(47, 24, 71, 0.4) 50%,
            rgba(0, 0, 0, 0.6) 100%
        );
        border-radius: 47% 53% 45% 55% / 52% 48% 52% 48%;
        filter: blur(3px);
        box-shadow: 
            0 0 40px rgba(75, 0, 130, 0.9),
            0 0 80px rgba(47, 24, 71, 0.7),
            inset 0 0 30px rgba(0, 0, 0, 0.8);
    }
    
    .mob-with-aura-container[data-aura="lava"]::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 69, 0, 0.6) 0%,
            rgba(255, 140, 0, 0.5) 40%,
            rgba(255, 215, 0, 0.4) 70%,
            transparent 100%
        );
        border-radius: 47% 53% 45% 55% / 52% 48% 52% 48%;
        filter: blur(3px);
        animation: spin-aura 4s linear infinite, aura-lava-cycle 2s ease-in-out infinite;
    }
    
    .mob-with-aura-container[data-aura="gradient"]::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 107, 107, 0.5) 0%,
            rgba(78, 205, 196, 0.4) 33%,
            rgba(69, 183, 209, 0.4) 66%,
            transparent 100%
        );
        border-radius: 47% 53% 45% 55% / 52% 48% 52% 48%;
        filter: blur(3px);
        animation: spin-aura 4s linear infinite, aura-gradient-cycle 4s ease-in-out infinite;
    }
    
    .mob-with-aura-container[data-aura="sparkle"]::before {
        background: radial-gradient(ellipse at center,
            rgba(255, 215, 0, 0.5) 0%,
            rgba(255, 223, 128, 0.3) 50%,
            transparent 100%
        );
        border-radius: 47% 53% 45% 55% / 52% 48% 52% 48%;
        filter: blur(3px);
        box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.9),
            0 0 60px rgba(255, 215, 0, 0.6),
            5px 5px 15px rgba(255, 255, 255, 0.8),
            -5px -5px 15px rgba(255, 255, 255, 0.8),
            10px -10px 15px rgba(255, 215, 0, 0.6),
            -10px 10px 15px rgba(255, 215, 0, 0.6);
    }
    
    .mob-with-aura-container[data-aura="plasma"]::before {
        background: radial-gradient(ellipse at center,
            rgba(0, 255, 255, 0.6) 0%,
            rgba(255, 255, 0, 0.5) 50%,
            transparent 100%
        );
        clip-path: polygon(
            50% 0%, 55% 10%, 65% 5%, 70% 15%, 80% 10%, 85% 20%, 95% 15%, 100% 25%,
            95% 35%, 100% 45%, 95% 55%, 100% 65%, 95% 75%, 100% 85%, 90% 90%, 85% 100%,
            75% 95%, 70% 100%, 60% 95%, 50% 100%, 40% 95%, 30% 100%, 25% 95%, 15% 100%,
            10% 90%, 0% 85%, 5% 75%, 0% 65%, 5% 55%, 0% 45%, 5% 35%, 0% 25%,
            5% 15%, 15% 10%, 20% 20%, 30% 5%, 35% 15%, 45% 10%
        );
        filter: blur(2px);
        animation: spin-aura 4s linear infinite, aura-plasma-cycle 1.5s ease-in-out infinite;
    }
    
    .mob-with-aura-container[data-aura="nature"]::before {
        background: radial-gradient(ellipse at center,
            rgba(80, 200, 120, 0.6) 0%,
            rgba(60, 179, 113, 0.5) 50%,
            rgba(34, 139, 34, 0.4) 80%,
            transparent 100%
        );
        border-radius: 47% 53% 45% 55% / 52% 48% 52% 48%;
        filter: blur(3px);
        animation: spin-aura 4s linear infinite, aura-nature-cycle 3.5s ease-in-out infinite;
    }
    
    /* Mob image styling within the container */
    .mob-with-aura-container .mob-image {
        position: relative;
        z-index: 1;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    
    /* New Achievement-Unlocked Border Effects */
    
    /* Live Wire - Electric sparks shooting out */
    @keyframes border-livewire {
        0%, 100% { 
            box-shadow: 
                0 0 15px #ffff00,
                3px 3px 8px rgba(255, 255, 0, 0.9),
                -3px -3px 8px rgba(255, 255, 0, 0.9),
                8px -8px 4px rgba(255, 255, 255, 0.8),
                -8px 8px 4px rgba(255, 255, 255, 0.8);
            filter: brightness(1.2);
        }
        10% {
            box-shadow: 
                0 0 25px #ffff00,
                -5px 5px 12px rgba(255, 255, 0, 0.9),
                5px -5px 12px rgba(255, 255, 0, 0.9),
                12px 12px 6px rgba(255, 255, 255, 0.9),
                -12px -12px 6px rgba(255, 255, 255, 0.9);
            filter: brightness(1.5);
        }
        20% {
            box-shadow: 
                0 0 15px #ffff00,
                5px -5px 8px rgba(255, 255, 0, 0.9),
                -5px 5px 8px rgba(255, 255, 0, 0.9),
                -8px 8px 4px rgba(255, 255, 255, 0.8),
                8px -8px 4px rgba(255, 255, 255, 0.8);
            filter: brightness(1.2);
        }
        35%, 65% {
            box-shadow: 
                0 0 20px #ffff00,
                0 10px 10px rgba(255, 255, 0, 0.9),
                0 -10px 10px rgba(255, 255, 0, 0.9);
            filter: brightness(1.3);
        }
    }
    .border-effect-livewire {
        animation: border-livewire 1.2s linear infinite;
        border-color: #ffff00;
    }
    
    /* Void/Cosmic - Stars and galaxies */
    @keyframes border-void {
        0%, 100% { 
            box-shadow: 
                0 0 20px #4b0082,
                0 0 40px #8b00ff,
                inset 0 0 15px rgba(138, 43, 226, 0.4),
                5px 5px 3px rgba(255, 255, 255, 0.8),
                -8px -8px 3px rgba(255, 255, 255, 0.6),
                10px -10px 3px rgba(255, 255, 255, 0.4);
            filter: brightness(1);
        }
        33% { 
            box-shadow: 
                0 0 25px #8b00ff,
                0 0 45px #4b0082,
                inset 0 0 20px rgba(75, 0, 130, 0.5),
                -5px 8px 3px rgba(255, 255, 255, 0.8),
                10px -5px 3px rgba(255, 255, 255, 0.6),
                -10px -10px 3px rgba(255, 255, 255, 0.4);
            filter: brightness(1.1);
        }
        66% { 
            box-shadow: 
                0 0 30px #4b0082,
                0 0 50px #8b00ff,
                inset 0 0 18px rgba(138, 43, 226, 0.45),
                8px -8px 3px rgba(255, 255, 255, 0.8),
                -5px 5px 3px rgba(255, 255, 255, 0.6),
                10px 10px 3px rgba(255, 255, 255, 0.4);
            filter: brightness(1.15);
        }
    }
    .border-effect-void {
        animation: border-void 4s ease-in-out infinite;
        border-color: #8b00ff;
    }
    
    /* Toxic/Acid - Dripping corrosive effect */
    @keyframes border-toxic {
        0%, 100% { 
            box-shadow: 
                0 0 20px #39ff14,
                0 5px 25px #7fff00,
                0 -2px 15px #32cd32,
                inset 0 3px 10px rgba(57, 255, 20, 0.3);
            filter: brightness(1) saturate(1.2);
        }
        25% { 
            box-shadow: 
                0 0 25px #7fff00,
                0 8px 30px #39ff14,
                0 0 15px #32cd32,
                inset 0 5px 15px rgba(127, 255, 0, 0.4);
            filter: brightness(1.1) saturate(1.3);
        }
        50% { 
            box-shadow: 
                0 0 30px #32cd32,
                0 10px 35px #7fff00,
                0 2px 20px #39ff14,
                inset 0 8px 20px rgba(50, 205, 50, 0.5);
            filter: brightness(1.2) saturate(1.4);
        }
        75% { 
            box-shadow: 
                0 0 25px #39ff14,
                0 6px 28px #32cd32,
                0 -2px 18px #7fff00,
                inset 0 4px 12px rgba(57, 255, 20, 0.35);
            filter: brightness(1.05) saturate(1.25);
        }
    }
    .border-effect-toxic {
        animation: border-toxic 2.5s ease-in-out infinite;
        border-color: #39ff14;
    }
    
    /* Holographic/Glitch - Digital cyberpunk feel */
    @keyframes border-holo {
        0%, 100% { 
            box-shadow: 
                0 0 20px #00ffff,
                2px 0 15px #ff00ff,
                -2px 0 15px #ffff00;
            filter: brightness(1);
            transform: translateX(0);
        }
        10% {
            box-shadow: 
                0 0 25px #ff00ff,
                3px 0 20px #00ffff,
                -3px 0 20px #ffff00;
            filter: brightness(1.3);
            transform: translateX(2px);
        }
        20% {
            box-shadow: 
                0 0 20px #ffff00,
                -2px 0 15px #ff00ff,
                2px 0 15px #00ffff;
            filter: brightness(1);
            transform: translateX(-2px);
        }
        30% {
            box-shadow: 
                0 0 22px #00ffff,
                1px 0 18px #ff00ff,
                -1px 0 18px #ffff00;
            filter: brightness(1.1);
            transform: translateX(0);
        }
        35%, 95% {
            box-shadow: 
                0 0 20px #00ffff,
                2px 0 15px #ff00ff,
                -2px 0 15px #ffff00;
            filter: brightness(1);
            transform: translateX(0);
        }
        96% {
            box-shadow: 
                0 0 30px #ff00ff,
                4px 0 25px #ffff00,
                -4px 0 25px #00ffff;
            filter: brightness(1.5);
            transform: translateX(3px);
        }
        98% {
            box-shadow: 
                0 0 20px #00ffff,
                -2px 0 15px #ff00ff,
                2px 0 15px #ffff00;
            filter: brightness(1);
            transform: translateX(-1px);
        }
    }
    .border-effect-holo {
        animation: border-holo 3s linear infinite;
        border-color: #00ffff;
    }
    
    /* Crystalline - Prismatic crystal formations */
    @keyframes border-crystal {
        0%, 100% { 
            box-shadow: 
                0 0 20px #b9f2ff,
                5px 5px 15px rgba(138, 43, 226, 0.6),
                -5px -5px 15px rgba(255, 105, 180, 0.6),
                10px -10px 10px rgba(0, 255, 255, 0.5),
                -10px 10px 10px rgba(255, 215, 0, 0.5);
            filter: brightness(1) hue-rotate(0deg);
        }
        20% { 
            box-shadow: 
                0 0 25px #b9f2ff,
                -5px 8px 15px rgba(255, 105, 180, 0.6),
                8px -5px 15px rgba(138, 43, 226, 0.6),
                -10px -10px 10px rgba(255, 215, 0, 0.5),
                10px 10px 10px rgba(0, 255, 255, 0.5);
            filter: brightness(1.1) hue-rotate(15deg);
        }
        40% { 
            box-shadow: 
                0 0 30px #b9f2ff,
                8px -8px 15px rgba(0, 255, 255, 0.6),
                -8px 8px 15px rgba(255, 215, 0, 0.6),
                5px 10px 10px rgba(138, 43, 226, 0.5),
                -5px -10px 10px rgba(255, 105, 180, 0.5);
            filter: brightness(1.2) hue-rotate(30deg);
        }
        60% { 
            box-shadow: 
                0 0 25px #b9f2ff,
                -8px -5px 15px rgba(255, 215, 0, 0.6),
                5px 8px 15px rgba(0, 255, 255, 0.6),
                -10px 5px 10px rgba(255, 105, 180, 0.5),
                10px -5px 10px rgba(138, 43, 226, 0.5);
            filter: brightness(1.1) hue-rotate(45deg);
        }
        80% { 
            box-shadow: 
                0 0 22px #b9f2ff,
                5px -8px 15px rgba(255, 105, 180, 0.6),
                -5px 5px 15px rgba(138, 43, 226, 0.6),
                8px 8px 10px rgba(255, 215, 0, 0.5),
                -8px -8px 10px rgba(0, 255, 255, 0.5);
            filter: brightness(1.05) hue-rotate(20deg);
        }
    }
    .border-effect-crystal {
        animation: border-crystal 5s ease-in-out infinite;
        border-color: #b9f2ff;
    }
  `}</style>
);

export default GlobalStyles;
