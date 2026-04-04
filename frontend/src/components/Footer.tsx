import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/50 bg-white/30 backdrop-blur-md mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-2xl font-black bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent tracking-tight mb-2">
            English Pesalam
          </div>
          <p className="text-sm text-slate-500 max-w-sm">
            Empowering Tamil speakers to master the English language with ease and confidence.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end text-sm text-slate-500 space-y-2">
          <p>Questions? Reach out on WhatsApp:</p>
          <a href="https://wa.me/917667268610" className="font-semibold text-brand-blue hover:text-brand-green transition-colors">
            +91 76672 68610
          </a>
          <p className="mt-4 pt-4 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} English pesalam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
