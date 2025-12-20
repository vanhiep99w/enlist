interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function Logo({ size = 48, className = '', animated = true }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Vibrant gradient - energy */}
        <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        
        {/* Cool accent gradient */}
        <linearGradient id="accentGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        
        {/* Deep gradient for contrast */}
        <linearGradient id="deepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <style>
        {`
          @keyframes morphPath {
            0%, 100% { transform: translateX(0) scaleX(1); }
            50% { transform: translateX(2px) scaleX(1.02); }
          }
          @keyframes floatUp {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes slideArrow {
            0%, 100% { transform: translateX(0); opacity: 1; }
            50% { transform: translateX(4px); opacity: 0.8; }
          }
          .morph { animation: morphPath 4s ease-in-out infinite; }
          .float { animation: floatUp 3s ease-in-out infinite; }
          .glow-pulse { animation: pulseGlow 2s ease-in-out infinite; }
          .arrow-slide { animation: slideArrow 1.5s ease-in-out infinite; }
        `}
      </style>
      
      {/* Main shape - Bold angular E transforming */}
      <g className={animated ? 'float' : ''}>
        {/* Back layer - shadow/depth */}
        <path
          d="M12 8 L52 8 L52 18 L26 18 L26 34 L48 34 L48 44 L26 44 L26 62 L54 62 L54 72 L12 72 Z"
          fill="url(#deepGradient)"
          transform="translate(3, 3)"
          opacity="0.3"
        />
        
        {/* Main E shape - bold and angular */}
        <path
          d="M12 8 L52 8 L52 18 L26 18 L26 34 L48 34 L48 44 L26 44 L26 62 L54 62 L54 72 L12 72 Z"
          fill="url(#energyGradient)"
          className={animated ? 'morph' : ''}
          style={{ transformOrigin: '32px 40px' }}
        />
        
        {/* Accent cut - dynamic slash through E */}
        <path
          d="M56 12 L72 12 L42 68 L26 68 Z"
          fill="url(#accentGradient)"
          filter="url(#glow)"
        />
        
        {/* Arrow accent - pointing forward (represents progress/translation) */}
        <g className={animated ? 'arrow-slide' : ''} style={{ transformOrigin: '64px 40px' }}>
          <path
            d="M58 32 L72 40 L58 48 L58 43 L50 43 L50 37 L58 37 Z"
            fill="white"
            opacity="0.95"
          />
        </g>
        
        {/* Small spark accents */}
        <g className={animated ? 'glow-pulse' : ''}>
          <rect x="54" y="6" width="4" height="4" fill="#fcd34d" rx="1" />
          <rect x="60" y="14" width="3" height="3" fill="#fcd34d" rx="0.5" opacity="0.7" />
        </g>
      </g>
    </svg>
  );
}

export function LogoAlt({ size = 48, className = '', animated = true }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="fireGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        
        <linearGradient id="iceGradient" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      
      <style>
        {`
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }
          @keyframes clash {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(2px); }
            75% { transform: translateX(-2px); }
          }
          .breathe { animation: breathe 3s ease-in-out infinite; transform-origin: 40px 40px; }
          .clash-left { animation: clash 2s ease-in-out infinite; transform-origin: 25px 40px; }
          .clash-right { animation: clash 2s ease-in-out infinite reverse; transform-origin: 55px 40px; }
        `}
      </style>
      
      {/* Two speech bubbles colliding/merging - representing language exchange */}
      <g className={animated ? 'breathe' : ''}>
        {/* Left bubble (Vietnamese - warm) */}
        <g className={animated ? 'clash-left' : ''}>
          <path
            d="M8 20 C8 12, 16 6, 32 6 C44 6, 48 12, 48 22 C48 32, 44 38, 32 38 L24 38 L18 50 L20 38 C12 38, 8 32, 8 22 Z"
            fill="url(#fireGradient)"
          />
          <text x="22" y="26" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">V</text>
        </g>
        
        {/* Right bubble (English - cool) */}
        <g className={animated ? 'clash-right' : ''}>
          <path
            d="M72 58 C72 66, 64 72, 48 72 C36 72, 32 66, 32 56 C32 46, 36 40, 48 40 L56 40 L62 28 L60 40 C68 40, 72 46, 72 56 Z"
            fill="url(#iceGradient)"
          />
          <text x="46" y="60" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">E</text>
        </g>
        
        {/* Connection sparks */}
        <g opacity="0.9">
          <circle cx="40" cy="39" r="3" fill="#fbbf24" />
          <circle cx="36" cy="42" r="2" fill="#67e8f9" />
          <circle cx="44" cy="36" r="2" fill="#f97316" />
        </g>
      </g>
    </svg>
  );
}

export function LogoMinimal({ size = 48, className = '', animated = true }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="minimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      
      <style>
        {`
          @keyframes draw {
            0% { stroke-dashoffset: 200; }
            100% { stroke-dashoffset: 0; }
          }
          .draw-line { 
            stroke-dasharray: 200; 
            animation: draw 2s ease-out forwards;
          }
        `}
      </style>
      
      {/* Abstract E with arrow integration */}
      <g stroke="url(#minimalGradient)" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M20 16 L20 64" className={animated ? 'draw-line' : ''} />
        <path d="M20 16 L52 16" className={animated ? 'draw-line' : ''} style={{ animationDelay: '0.2s' }} />
        <path d="M20 40 L44 40" className={animated ? 'draw-line' : ''} style={{ animationDelay: '0.4s' }} />
        <path d="M20 64 L52 64" className={animated ? 'draw-line' : ''} style={{ animationDelay: '0.6s' }} />
        {/* Arrow */}
        <path d="M52 40 L66 40 M58 32 L66 40 L58 48" className={animated ? 'draw-line' : ''} style={{ animationDelay: '0.8s' }} strokeWidth="5" />
      </g>
    </svg>
  );
}

export function LogoCompact({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="compactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      
      <path
        d="M8 6 L32 6 L32 12 L16 12 L16 20 L28 20 L28 26 L16 26 L16 36 L34 36 L34 42 L8 42 Z"
        fill="url(#compactGrad)"
      />
      <path
        d="M34 8 L44 8 L26 40 L16 40 Z"
        fill="#0ea5e9"
      />
      <path
        d="M36 20 L44 24 L36 28 L36 25 L32 25 L32 23 L36 23 Z"
        fill="white"
      />
    </svg>
  );
}
