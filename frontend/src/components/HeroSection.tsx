"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Book } from '@/app/actions/books';

interface HeroSectionProps {
  books?: Book[];
}

function BookCard({ book, index }: { book: Book; index: number }) {
  const handleBuyClick = () => {
    const phone = (book.whatsapp_number || "919345639627").trim().replace(/\D/g, "");
    const msg = (book.whatsapp_message || "I want to buy the English Pesalam book").trim();
    const text = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.55, delay: index * 0.12 }}
      className="bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex flex-col md:flex-row items-center gap-8 lg:gap-16 relative overflow-hidden"
    >
      {/* Inner subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none rounded-[2.5rem]" />

      {/* Left Side Content */}
      <div className="flex-1 flex flex-col items-start w-full order-2 md:order-1 relative z-10">
        {/* Title */}
        <h1 className="mb-4 md:mb-6 pb-2 leading-tight tracking-tight">
          <span
            className="block text-2xl md:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(to right, #0090F7 0%, #BA62FC 50%, #F2416B 100%)" }}
          >
            {book.title_1 || '1000 + English Words'}
          </span>
          {book.title_2 && (
            <span
              className="block text-lg md:text-xl lg:text-2xl font-semibold text-transparent bg-clip-text mt-1"
              style={{ backgroundImage: "linear-gradient(to right, #0090F7 0%, #BA62FC 50%, #F2416B 100%)" }}
            >
              {book.title_2}
            </span>
          )}
        </h1>

        {/* Description */}
        {book.description && (
          <p className="text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed mb-6 md:mb-8 max-w-lg">
            {book.description}
          </p>
        )}

        {/* Pricing */}
        <div className="flex flex-col mb-6 md:mb-8">
          <div className="flex items-end gap-3">
            <span className="text-3xl md:text-5xl font-black text-[#4F46E5] tracking-tighter">
              {book.price || '₹339'}
            </span>
            {book.strikethrough_price && (
              <span className="text-sm md:text-lg font-medium text-slate-400 line-through mb-1 md:mb-2">
                {book.strikethrough_price}
              </span>
            )}
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBuyClick}
          className="relative group w-full md:w-auto md:px-12 py-4 bg-gradient-to-r from-[#6366f1]/80 to-[#4F46E5]/90 backdrop-blur-md border border-white/30 hover:border-white/50 hover:to-[#4F46E5] text-white rounded-full font-bold text-base md:text-lg shadow-xl shadow-[#4F46E5]/30 flex items-center justify-center gap-3 z-10 transition-all overflow-hidden"
        >
          <div className="absolute inset-[1px] rounded-full bg-gradient-to-r from-white/30 to-transparent pointer-events-none" />

          {/* Shine Effect */}
          <motion.div
            className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 z-0 pointer-events-none"
            animate={{ left: ["-100%", "200%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.3,
              ease: "easeIn",
            }}
          />

          <span className="relative z-10 drop-shadow-md">Buy Now</span>
        </motion.button>
      </div>

      {/* Right Side Book Image */}
      <div className="flex-1 w-full order-1 md:order-2 relative z-10 flex justify-center items-center">
        <div className="relative w-[90%] max-w-sm mx-auto group perspective-1000">
          
          {/* Dynamic Color Shadow */}
          <div className="absolute inset-0 translate-y-8 scale-[0.85] opacity-60 blur-[40px] -z-10 transition-all duration-700 group-hover:scale-[0.9] group-hover:opacity-80 rounded-3xl bg-[#7c1416]">
            <img
              src={book.image_url || '/new-book-image1.jpeg'}
              alt=""
              className="w-full h-full object-contain mix-blend-overlay"
              aria-hidden="true"
            />
          </div>

          {/* Main Image Container */}
          <div className="relative rounded-[2rem] overflow-hidden bg-[#7c1416] border border-white/20 shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />
            <img
              src={book.image_url || '/new-book-image1.jpeg'}
              alt={book.title_1 || "English Pesalam Book"}
              className="w-full h-auto object-contain relative z-10"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Fallback book shown when DB has no entries
const fallbackBook: Book = {
  id: 'fallback',
  title_1: '1000 + English Words',
  title_2: '( Book 1 - விதை ) Basic Level',
  description: 'ஆங்கிலத்தை பயமில்லாமல் கற்றுக்கொள்ள விரும்பும் தமிழ் மக்களுக்காக உருவாக்கப்பட்ட எளிய மற்றும் பயனுள்ள புத்தகம். தினசரி வாழ்க்கையில் அதிகம் பயன்படும் முக்கியமான ஆங்கில வார்த்தைகள், தமிழ் அர்த்தத்துடன் தெளிவாகவும் எளிமையாகவும் வழங்கப்பட்டுள்ளன.',
  price: '₹339',
  strikethrough_price: '₹399',
  image_url: '/new-book-image1.jpeg',
  whatsapp_number: '919345639627',
  whatsapp_message: 'I want to buy the English Pesalam book',
  sort_order: 0,
  is_visible: true,
  created_at: '',
  updated_at: '',
};

export function HeroSection({ books = [] }: HeroSectionProps) {
  const displayBooks = books.length > 0 ? books.slice(0, 2) : [fallbackBook];

  return (
    <section id="home" className="pt-24 pb-8 px-4 w-full max-w-md md:max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        {displayBooks.map((book, i) => (
          <BookCard key={book.id} book={book} index={i} />
        ))}
      </div>
    </section>
  );
}
