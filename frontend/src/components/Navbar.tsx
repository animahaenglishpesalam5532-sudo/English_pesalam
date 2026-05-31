"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  logoType: string;
  logoText: string;
  logoImageUrl: string;
}

export function Navbar({ logoType, logoText, logoImageUrl }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Blogs', href: '/blogs' },
    { name: 'PDF Guide', href: '/pdfs' },
    { name: 'PPT Masterclass', href: '/ppts' },
    { name: 'Video Course', href: '/video-courses' },
    { name: 'Quiz', href: '/quiz' },
    { name: 'About Us', href: '/about' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center z-50">
            {logoType === 'image' && logoImageUrl ? (
              <img src={logoImageUrl} alt={logoText || 'Logo'} className="h-9 md:h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent tracking-tight">
                {logoText}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold transition-all hover:text-indigo-600 ${
                  pathname === link.href ? 'text-indigo-600' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl bg-white/50 border border-white/50 text-slate-700 z-50"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 md:hidden pt-24 pb-8 px-4 bg-white/95 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                      pathname === link.href
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                        : 'bg-white/50 border-transparent text-slate-700 hover:bg-white hover:border-slate-100'
                    }`}
                  >
                    <span className="text-lg font-bold">{link.name}</span>
                    <ChevronRight className={`w-5 h-5 ${pathname === link.href ? 'text-indigo-400' : 'text-slate-300'}`} />
                  </Link>
                </motion.div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
