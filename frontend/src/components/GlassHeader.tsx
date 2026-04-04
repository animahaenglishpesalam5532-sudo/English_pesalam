import React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

export function GlassHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm">
      <div className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Mobile Burger Menu Toggle - No Action */}
        <button className="md:hidden text-brand-blue hover:bg-brand-blue/10 p-2 rounded-full transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        {/* Centered or left aligned Logo */}
        <div className="flex-1 text-center md:text-left pr-10 md:pr-0">
          <Link
            href="/"
            className="text-2xl font-black bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent hover:opacity-80 transition-opacity inline-block cursor-pointer tracking-tight"
          >
            English Pesalam
          </Link>
        </div>

      </div>
    </header>
  );
}
