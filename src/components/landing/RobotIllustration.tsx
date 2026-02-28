'use client';

import { motion } from 'framer-motion';

export function RobotIllustration() {
  return (
    <div className="relative flex items-center justify-center w-full h-[400px] sm:h-[500px]">
      {/* Background Glowing Rings */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border-2 border-primary/20 border-dashed"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[250px] h-[250px] sm:w-[320px] sm:h-[320px] rounded-full border-2 border-primary/30"
      />

      {/* Radial soft light behind the robot */}
      <div className="absolute w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full bg-primary/20 blur-[60px]" />

      {/* Main Robot SVG floating */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] drop-shadow-2xl filter"
      >
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="robotBodyGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(var(--background))" />
              <stop offset="1" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="robotScreenGrad" x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Antennas */}
          <path d="M140 100 L110 50" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" />
          <circle cx="110" cy="50" r="12" fill="hsl(var(--primary))" />
          
          <path d="M260 100 L290 50" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" />
          <circle cx="290" cy="50" r="12" fill="hsl(var(--primary))" />

          {/* Main Body/Head */}
          <rect x="80" y="90" width="240" height="200" rx="60" fill="url(#robotBodyGrad)" filter="url(#shadow)" stroke="white" strokeWidth="4" />
          
          {/* Inner Screen */}
          <rect x="110" y="120" width="180" height="110" rx="35" fill="url(#robotScreenGrad)" />

          {/* Eyes (Animated via CSS/Framer if we wanted, but static SVGs here) */}
          <circle cx="160" cy="175" r="15" fill="hsl(var(--primary))" filter="url(#glow)" />
          <circle cx="240" cy="175" r="15" fill="hsl(var(--primary))" filter="url(#glow)" />
          
          {/* Happy curve/mouth */}
          <path d="M180 200 Q200 210 220 200" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#glow)" />

          {/* Chest Heart/Medical Cross Area */}
          <circle cx="200" cy="330" r="40" fill="white" filter="url(#shadow)" />
          <path d="M200 315 V345 M185 330 H215" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" />

          {/* Neck joining head and chest slightly */}
          <rect x="180" y="280" width="40" height="30" fill="#cbd5e1" />
        </svg>
      </motion.div>

      {/* Floating particles around it */}
      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-primary/60 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full bg-blue-400/50 blur-[2px]"
      />
    </div>
  );
}
