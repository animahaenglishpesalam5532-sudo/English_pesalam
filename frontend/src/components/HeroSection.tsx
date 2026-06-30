"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface HeroSectionProps {
  heroSubtitle?: string;
  heroTitle?: string;
  heroDescriptionLine1?: string;
  heroDescriptionLine2?: string;
  trainerName?: string;
  trainerTitle?: string;
  trainerImageUrl?: string;
  trainerStat1Value?: string;
  trainerStat1Label?: string;
  trainerStat2Value?: string;
  trainerStat2Label?: string;
}

export function HeroSection({
  heroSubtitle = "1M+ YOUTUBE FAMILY • TAMIL TO ENGLISH FOCUS",
  heroTitle = "தமிழ் பேசும் மக்களுக்கான Practical Spoken English Platform",
  heroDescriptionLine1 = "English தெரிந்தும் பேச முடியாமல் தவிக்கிறீர்களா?",
  heroDescriptionLine2 = "Simple Tamil explanation, daily use sentences, grammar patterns, vocabulary, pronunciation practice மூலம் English-ஐ confidence-ஆ பேச ஆரம்பிக்க English Pesalam உங்களுக்கு உதவும்.",
  trainerName = "Maha JC",
  trainerTitle = "Founder & Spoken English Trainer",
  trainerImageUrl = "",
  trainerStat1Value = "1M+",
  trainerStat1Label = "Subscribers",
  trainerStat2Value = "500+",
  trainerStat2Label = "Lessons",
}: HeroSectionProps) {

  // Split title if it has spaces, or render it directly.
  // To match the screenshot, we want clean lines.
  const renderTitle = (titleText: string) => {
    // If it's the default title, let's render it exactly like the screenshot.
    if (titleText === "தமிழ் பேசும் மக்களுக்கான Practical Spoken English Platform") {
      return (
        <>
          <span className="block text-slate-900 pb-1">தமிழ் பேசும்</span>
          <span className="block text-slate-900 mt-1 pb-1">மக்களுக்கான</span>
          <span className="block text-[#0B256B] mt-2 pb-2">Practical Spoken</span>
          <span className="block text-[#0B256B] mt-1 pb-2">English Platform</span>
        </>
      );
    }

    // Otherwise, split words into beautiful blocks
    return <span className="block text-slate-900 leading-tight pb-2">{titleText}</span>;
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-28 pb-12 px-4 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

      {/* Left Column - Content */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="flex-1 flex flex-col items-start w-full text-left"
      >
        {/* Tagline / Subtitle */}
        <div className="inline-block text-[11px] md:text-xs font-black tracking-widest text-[#FF5722] mb-4 uppercase">
          {heroSubtitle}
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 font-jakarta leading-tight">
          {renderTitle(heroTitle)}
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-sm md:text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
          {heroDescriptionLine1}
          {heroDescriptionLine2 && (
            <>
              <br />
              {heroDescriptionLine2}
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleScrollTo('paths')}
            className="px-8 py-4 bg-[#FF5722] hover:bg-[#E64A19] text-white font-extrabold rounded-full shadow-lg shadow-[#FF5722]/20 hover:shadow-xl transition-all text-center text-sm md:text-base"
          >
            Start Learning Free
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleScrollTo('online-class')}
            className="px-8 py-4 bg-[#0B256B] hover:bg-[#081B4E] text-white font-extrabold rounded-full shadow-lg shadow-[#0B256B]/20 hover:shadow-xl transition-all text-center text-sm md:text-base"
          >
            Join Online Class
          </motion.button>

          <Link
            href="/pdfs"
            className="px-8 py-4 bg-white hover:bg-slate-50 text-[#0B256B] border border-slate-200/80 font-extrabold rounded-full shadow-md hover:shadow-lg transition-all text-center text-sm md:text-base flex items-center justify-center"
          >
            Buy PDF Materials
          </Link>
        </div>

        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-default"
        >
          <span className="text-xs md:text-sm font-extrabold text-[#0B256B]">English நாமும் பேசலாம்!</span>
        </motion.div>
      </motion.div>

      {/* Right Column - Trainer Card */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full lg:w-auto flex justify-center items-center"
      >
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-6 relative group">

          {/* Trainer Image Box */}
          <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden flex items-center justify-center bg-gradient-to-tr from-[#FF5722]/5 via-[#FFFDFC] to-[#0B256B]/5 border border-slate-100 shadow-inner">
            {trainerImageUrl ? (
              <img
                src={trainerImageUrl}
                alt={trainerName}
                className="w-full h-full object-cover rounded-[1.5rem] transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-center w-full h-full border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-white/50">
                <div className="w-16 h-16 rounded-full border border-dashed border-[#0B256B]/30 flex items-center justify-center bg-white">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0B256B] border-dashed animate-spin duration-1000 opacity-20" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#0B256B] text-sm font-extrabold">Add Your Photo</span>
                </div>
              </div>
            )}
          </div>

          {/* Trainer Info */}
          <div className="text-left px-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-1">{trainerName}</h2>
            <p className="text-xs md:text-sm text-slate-500 font-bold tracking-wide uppercase">{trainerTitle}</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 bg-[#F6F9FD] rounded-[1.5rem] p-4 border border-slate-100/50">
            <div className="flex flex-col items-start px-2">
              <span className="text-xl md:text-2xl font-black text-[#0B256B] tracking-tight">{trainerStat1Value}</span>
              <span className="text-[10px] md:text-xs text-slate-500 font-bold tracking-wider uppercase mt-0.5">{trainerStat1Label}</span>
            </div>
            <div className="flex flex-col items-start px-2 border-l border-slate-200">
              <span className="text-xl md:text-2xl font-black text-[#0B256B] tracking-tight">{trainerStat2Value}</span>
              <span className="text-[10px] md:text-xs text-slate-500 font-bold tracking-wider uppercase mt-0.5">{trainerStat2Label}</span>
            </div>
          </div>
        </div>
      </motion.div>

    </section>
  );
}
