"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Sparkles, ArrowRight, MonitorPlay } from 'lucide-react';

interface OnlineClassCardProps {
  whatsappNumber: string;
  whatsappMessage: string;
}

export function OnlineClassCard({ whatsappNumber, whatsappMessage }: OnlineClassCardProps) {
  const handleJoinClick = () => {
    const phone = whatsappNumber.trim().replace(/\D/g, "") || "919345639627";
    const text = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <section className="px-4 w-full max-w-md md:max-w-6xl mx-auto mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-[1px] shadow-2xl shadow-indigo-500/20"
      >
        <div className="relative bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-12 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs md:text-sm font-medium mb-4 md:mb-6 backdrop-blur-md">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                <span>Live Interactive Sessions</span>
              </div>
              
              <h2 className="text-2xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tight leading-tight">
                Basic Spoken <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                  English Class
                </span>
              </h2>
              
              <p className="text-base md:text-lg text-indigo-50 leading-relaxed mb-6 md:mb-8 max-w-xl opacity-90">
                Join our expert-led online classes and transform your speaking confidence. 
                Personalized attention and practical conversations in a friendly environment.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-6 mb-6 md:mb-8 text-white/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 rounded-lg bg-white/10">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                  </div>
                  <span className="text-xs md:text-sm font-medium">Limited Batch Size</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 rounded-lg bg-white/10">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                  </div>
                  <span className="text-xs md:text-sm font-medium">Direct WhatsApp Support</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinClick}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 bg-white text-[#4F46E5] rounded-full font-bold text-base md:text-lg shadow-xl shadow-black/10 transition-all hover:bg-indigo-50"
              >
                Join Online Class
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* Right Side Visual (Mockup or Icon) */}
            <div className="hidden md:block flex-shrink-0 relative">
               <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                  {/* Floating effect for the icon */}
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10"
                  >
                    <div className="relative p-8 rounded-[3rem] bg-white/10 border border-white/20 backdrop-blur-2xl">
                      <MonitorPlay className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-2xl" />
                      
                      {/* Badge */}
                      <div className="absolute -top-4 -right-4 bg-yellow-400 text-indigo-900 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg transform rotate-12">
                        ENROLL NOW
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Rotating Outer Ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full"
                  />
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
