"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function HeroSection() {
  const handleBuyClick = () => {
    const phoneNumber = "919345639627";
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
          <h1 className="mb-4 md:mb-6 pb-2 leading-tight tracking-tight">
            <span
              className="block text-2xl md:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #0090F7 0%, #BA62FC 50%, #F2416B 100%)",
              }}
            >
              1000 + English Words
            </span>

            <span
              className="block text-lg md:text-xl lg:text-2xl font-semibold text-transparent bg-clip-text mt-1"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #0090F7 0%, #BA62FC 50%, #F2416B 100%)",
              }}
            >
              ( Book 1 - விதை ) Basic Level
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed mb-6 md:mb-8 max-w-lg">
            ஆங்கிலத்தை பயமில்லாமல் கற்றுக்கொள்ள விரும்பும் தமிழ் மக்களுக்காக உருவாக்கப்பட்ட எளிய மற்றும் பயனுள்ள புத்தகம். தினசரி வாழ்க்கையில் அதிகம் பயன்படும் முக்கியமான ஆங்கில வார்த்தைகள், தமிழ் அர்த்தத்துடன் தெளிவாகவும் எளிமையாகவும் வழங்கப்பட்டுள்ளன.
          </p>

          {/* Pricing */}
          <div className="flex flex-col mb-6 md:mb-8">
            <div className="flex items-end gap-3">
              <span className="text-3xl md:text-5xl font-black text-[#4F46E5] tracking-tighter ">₹339</span>
              <span className="text-sm md:text-lg font-medium text-slate-400 line-through mb-1 md:mb-2">₹399</span>
            </div>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full shadow-sm border border-emerald-500/20">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                  <path d="M195-195q-35-35-35-85H60l18-80h113q17-19 40-29.5t49-10.5q26 0 49 10.5t40 29.5h167l84-360H182l4-17q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35q-50 0-85-35Zm442-245h193l4-21-74-99h-95l-28 120Zm-19-273 2-7-84 360 2-7 34-146 46-200ZM20-427l20-80h220l-20 80H20Zm80-146 20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Z" />
                </svg>
                Including Shipping Charges
              </span>
            </div>
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
          <div className="w-[90%] max-w-sm mx-auto rounded-3xl overflow-hidden shadow-md bg-[#7c1416]">
            <img
              src="/new-book-image1.jpeg"
              alt="English Pesalam Book"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
