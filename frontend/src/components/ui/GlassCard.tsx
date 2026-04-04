import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export function GlassCard({ children, className = '', hoverGlow = false }: GlassCardProps) {
  return (
    <div
      className={`
        bg-white/30 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-6
        ${hoverGlow ? 'transition-all duration-300 hover:shadow-2xl hover:border-white/60 hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
