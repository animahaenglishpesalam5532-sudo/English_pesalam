"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Sparkles, Calendar, FileText, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface OnlineClassCardProps {
  whatsappNumber: string;
  whatsappMessage: string;
  title?: string;
  description?: string;
  point1?: string;
  point2?: string;
  point3?: string;
  point4?: string;
  imageUrl?: string;
  price?: string;
  originalPrice?: string;
}

function LaptopPlaceholder() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto p-2 flex items-center justify-center">
      {/* Decorative ambient background glow */}
      <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
      
      {/* SVG Canvas */}
      <svg className="w-full h-auto drop-shadow-2xl select-none" viewBox="0 0 520 340" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glowing spots */}
        <circle cx="420" cy="80" r="4" fill="#A78BFA" opacity="0.6" className="animate-pulse" />
        <circle cx="90" cy="180" r="3" fill="#60A5FA" opacity="0.4" />
        <circle cx="120" cy="60" r="5" fill="#FBBF24" opacity="0.5" className="animate-pulse" />

        {/* Stack of books on the left */}
        <g id="books-stack">
          {/* Speaking Book */}
          <path d="M60 170 H130 V192 H60 Z" fill="#6366F1" />
          <path d="M56 170 C56 166 60 166 60 170 V192 C60 196 56 196 56 192 Z" fill="#4F46E5" />
          <path d="M60 190 H130 V192 H60 Z" fill="#E2E8F0" />
          <text x="95" y="185" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">SPEAKING</text>

          {/* Grammar Book */}
          <path d="M65 192 H135 V214 H65 Z" fill="#06B6D4" />
          <path d="M61 192 C61 188 65 188 65 192 V214 C65 218 61 218 61 214 Z" fill="#0891B2" />
          <path d="M65 212 H135 V214 H65 Z" fill="#E2E8F0" />
          <text x="100" y="207" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">GRAMMAR</text>

          {/* Vocabulary Book */}
          <path d="M58 214 H128 V236 H58 Z" fill="#EC4899" />
          <path d="M54 214 C54 210 58 210 58 214 V236 C58 240 54 240 54 236 Z" fill="#DB2777" />
          <path d="M58 234 H128 V236 H58 Z" fill="#E2E8F0" />
          <text x="93" y="229" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">VOCABULARY</text>
        </g>

        {/* Laptop Screen Frame (Outer) */}
        <rect x="140" y="70" width="280" height="175" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="3" />
        {/* Laptop Screen (Inner) */}
        <rect x="146" y="76" width="268" height="163" rx="8" fill="#0F0C24" />

        {/* Screen Content */}
        <g id="screen-content">
          <radialGradient id="screenGlow" cx="70%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#312E81" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#07041D" stopOpacity="0" />
          </radialGradient>
          <rect x="146" y="76" width="268" height="163" rx="8" fill="url(#screenGlow)" />

          {/* Grid lines inside video call interface */}
          <line x1="146" y1="210" x2="414" y2="210" stroke="#312E81" strokeWidth="1" opacity="0.4" />

          {/* Let's Speak English Badge */}
          <rect x="160" y="95" width="105" height="60" rx="8" fill="#1E1B4B" fillOpacity="0.7" stroke="#4338CA" strokeWidth="1.5" />
          <text x="170" y="115" fill="#FBBF24" fontSize="12" fontWeight="900">Let's</text>
          <text x="170" y="132" fill="#FFFFFF" fontSize="14" fontWeight="900">Speak</text>
          <text x="170" y="148" fill="#FFFFFF" fontSize="12" fontWeight="900">English!</text>

          {/* Teacher/Instructor avatar */}
          <circle cx="340" cy="140" r="38" fill="#312E81" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Avatar Graphic (Smiling woman) */}
          <path d="M305 140 C305 110 375 110 375 140 Z" fill="#111827" />
          <circle cx="340" cy="138" r="24" fill="#FDBA74" />
          <circle cx="332" cy="134" r="2" fill="#1F2937" />
          <circle cx="348" cy="134" r="2" fill="#1F2937" />
          <path d="M334 144 Q340 152 346 144" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M316 130 C316 115 330 115 340 122 C350 115 364 115 364 130 C364 148 358 152 358 152 C354 135 348 135 340 135 C332 135 326 135 322 152 C322 152 316 148 316 130 Z" fill="#111827" />
          <path d="M312 178 C312 165 325 158 340 158 C355 158 368 165 368 178" fill="#1E40AF" />
          
          {/* Video Control Buttons */}
          <circle cx="250" cy="222" r="7" fill="#EF4444" />
          <path d="M248 220 H252 V224 H248 Z" fill="#FFFFFF" />
          <circle cx="268" cy="222" r="7" fill="#4B5563" />
          <circle cx="286" cy="222" r="7" fill="#4B5563" />
        </g>

        {/* Laptop Base */}
        <path d="M110 245 H450 L465 258 C465 262 460 264 455 264 H105 C100 264 95 262 95 258 Z" fill="#475569" />
        <path d="M140 248 H420 V252 H140 Z" fill="#334155" />
        <rect x="250" y="254" width="60" height="8" rx="2" fill="#334155" />

        {/* Floating Speech Bubble */}
        <g id="floating-bubble" className="animate-bounce" style={{ transformOrigin: 'center' }}>
          <rect x="345" y="15" width="55" height="55" rx="16" fill="#818CF8" />
          <path d="M365 70 L370 78 L375 70 Z" fill="#818CF8" />
          <circle cx="372.5" cy="42.5" r="14" fill="#FFFFFF" opacity="0.2" />
          <circle cx="372.5" cy="42.5" r="11" fill="#FFFFFF" />
          <polygon points="369,37 379,42.5 369,48" fill="#4F46E5" />
        </g>
      </svg>
    </div>
  );
}

export function OnlineClassCard({
  whatsappNumber,
  whatsappMessage,
  title = "1 Month Spoken English Online Course",
  description = "ஆங்கிலத்தில் பேச ஆரம்பிக்க இந்த 1 Month Spoken English Online Course உங்களுக்கு மிகவும் உதவியாக இருக்கும். இந்த ஒரு மாதத்தில் கற்றுக்கொடுக்கும் அனைத்து lessons-க்கும் PDF materials இலவசமாக வழங்கப்படும்.",
  point1 = "1 Month Training",
  point2 = "Free PDF Materials",
  point3 = "குறைந்த மாணவர்கள் மட்டும்",
  point4 = "Direct WhatsApp Support",
  imageUrl = "",
  price = "₹999",
  originalPrice = "₹1999"
}: OnlineClassCardProps) {
  
  const handleJoinClick = () => {
    const phone = whatsappNumber.trim().replace(/\D/g, "") || "919345639627";
    const text = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const renderHighlightedTitle = (titleText: string) => {
    const highlightWord = "English Online Course";
    if (titleText.includes(highlightWord)) {
      const parts = titleText.split(highlightWord);
      return (
        <>
          {parts[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
            {highlightWord}
          </span>
          {parts[1]}
        </>
      );
    }

    const words = titleText.split(" ");
    if (words.length > 2) {
      const firstPart = words.slice(0, words.length - 3).join(" ");
      const lastPart = words.slice(words.length - 3).join(" ");
      return (
        <>
          {firstPart}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
            {lastPart}
          </span>
        </>
      );
    }
    return titleText;
  };

  return (
    <section className="px-4 w-full max-w-md md:max-w-6xl mx-auto mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2D1B69] via-[#1E1145] to-[#120A31] p-[1px] shadow-2xl shadow-indigo-950/40"
      >
        <div className="relative bg-[#09051E]/95 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-10 lg:p-12 overflow-hidden border border-white/5">
          {/* Decorative Background Glows */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-indigo-500/15 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
            {/* Left Content */}
            <div className="flex-1 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs md:text-sm font-medium mb-5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Live Interactive Sessions</span>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                {renderHighlightedTitle(title)}
              </h2>
              
              {/* Description */}
              <p className="text-sm md:text-base text-indigo-100/80 leading-relaxed mb-6 max-w-2xl font-normal">
                {description}
              </p>
              
              {/* Grid of Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Point 1 */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-white/90 text-sm font-semibold tracking-wide">{point1}</span>
                </div>

                {/* Point 2 */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-white/90 text-sm font-semibold tracking-wide">{point2}</span>
                </div>

                {/* Point 3 */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-white/90 text-sm font-semibold tracking-wide">{point3}</span>
                </div>

                {/* Point 4 */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-white/90 text-sm font-semibold tracking-wide">{point4}</span>
                </div>
              </div>

              {/* Price Section */}
              {(price || originalPrice) && (
                <div className="flex items-baseline gap-3 mb-6">
                  {price && (
                    <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      {price}
                    </span>
                  )}
                  {originalPrice && (
                    <span className="text-lg md:text-xl text-white/40 line-through font-medium">
                      {originalPrice}
                    </span>
                  )}
                  {price && originalPrice && (
                    <span className="px-2 py-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                      Offer Price
                    </span>
                  )}
                </div>
              )}

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinClick}
                className="group relative inline-flex items-center justify-between gap-8 px-6 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 rounded-full font-black text-sm md:text-base shadow-xl shadow-yellow-500/10 transition-all hover:brightness-105 active:brightness-95 w-full sm:w-auto"
              >
                <div className="flex items-center gap-3">
                  <WhatsAppIcon className="text-slate-950" size={24} />
                  <span className="tracking-wide">WhatsApp-ல் Course Details வாங்குங்கள்</span>
                </div>
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-950/10 transition-transform group-hover:translate-x-1">
                  <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3]" />
                </div>
              </motion.button>
            </div>

            {/* Right Visual Representation */}
            <div className="w-full lg:w-auto flex-shrink-0">
              {imageUrl ? (
                <div className="relative w-full max-w-[450px] mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={imageUrl}
                    alt="Online Course Presentation"
                    className="relative z-10 w-full h-auto object-contain rounded-3xl shadow-2xl border border-white/10 max-h-[300px] lg:max-h-[340px]"
                  />
                </div>
              ) : (
                <LaptopPlaceholder />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
