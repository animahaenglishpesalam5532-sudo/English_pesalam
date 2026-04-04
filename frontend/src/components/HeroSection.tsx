"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function HeroSection() {
  const handleBuyClick = () => {
    const phoneNumber = "917667268610";
    const text = encodeURIComponent("I want to buy the English Pesalam book");
    window.location.href = `https://wa.me/${phoneNumber}?text=${text}`;
  };

  return (
    <section id="home" className="pt-24 pb-8 px-4 w-full max-w-md md:max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/60 backdrop-blur-lg border border-white/80 rounded-[2.5rem] p-6 md:p-10 shadow-md drop-shadow-sm flex flex-col md:flex-row items-center gap-8 lg:gap-16"
      >
        {/* Left Side Content */}
        <div className="flex-1 flex flex-col items-start w-full order-2 md:order-1">

          {/* Title */}
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4 md:mb-6 text-transparent bg-clip-text pb-2"
            style={{ backgroundImage: 'linear-gradient(to right, #0090F7 0%, #BA62FC 50%, #F2416B 100%)' }}
          >
            English Peasalam
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed mb-6 md:mb-8 max-w-lg">
            Master English through your native Tamil language. This comprehensive guide simplifies complex grammar into easy-to-understand conversational patterns.
          </p>

          {/* Pricing */}
          <div className="flex items-end gap-3 mb-6 md:mb-8">
            <span className="text-3xl md:text-5xl font-black text-[#4F46E5] tracking-tighter">₹499</span>
            <span className="text-sm md:text-lg font-medium text-slate-400 line-through mb-1 md:mb-2">₹999</span>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleBuyClick}
            className="w-full md:w-auto md:px-12 py-4 bg-gradient-to-r from-[#6366f1]/80 to-[#4F46E5]/90 backdrop-blur-md border border-white/30 hover:border-white/50 hover:to-[#4F46E5] text-white rounded-full font-bold text-base md:text-lg shadow-xl shadow-[#4F46E5]/30 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <span>Buy Now</span>
          </button>
        </div>

        {/* Right Side Book Image (Stays on top in mobile via order-1) */}
        <div className="flex-1 w-full order-1 md:order-2">
          <div className="w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-[#7c1416] rounded-3xl overflow-hidden shadow-md relative group max-w-sm md:max-w-none mx-auto">
            <img
              src="/book-mockup.png"
              alt="English Pesalam Book"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
