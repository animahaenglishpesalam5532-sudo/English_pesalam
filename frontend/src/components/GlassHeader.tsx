"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function GlassHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm">
      <div className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Mobile Burger Menu Toggle */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-brand-blue hover:bg-brand-blue/10 p-2 rounded-full transition-colors active:scale-95"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        {/* Centered or left aligned Logo */}
        <div className="flex-1 text-center md:text-left pr-10 md:pr-0">
          <Link href="/" className="text-xl font-bold text-brand-blue tracking-tight hover:opacity-80 transition-opacity inline-block cursor-pointer">
            English Peasalam
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-6 text-sm font-semibold text-slate-600">
          <Link href="#home" className="hover:text-brand-blue transition-colors">Home</Link>
          <Link href="#paths" className="hover:text-brand-blue transition-colors">Learning Paths</Link>
        </nav>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 absolute top-full left-0 w-full shadow-lg flex flex-col py-4 px-6 space-y-4">
          <Link 
            href="#home" 
            onClick={toggleMenu}
            className="text-lg font-semibold text-slate-700 hover:text-brand-blue py-2"
          >
            Home
          </Link>
          <Link 
            href="#paths" 
            onClick={toggleMenu}
            className="text-lg font-semibold text-slate-700 hover:text-brand-blue py-2"
          >
            Learning Paths
          </Link>
        </div>
      )}
    </header>
  );
}
