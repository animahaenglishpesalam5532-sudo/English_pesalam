'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, MessageCircle } from "lucide-react"

interface PDFCardProps {
  pdf: {
    id: string
    name: string
    description: string
    image_url: string
    marked_price: string
    selling_price: string
    is_featured: boolean
  }
  whatsappUrl: string
}

export function PDFCard({ pdf, whatsappUrl }: PDFCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/60"
    >
      {/* Image Area */}
      <div className="relative h-56 overflow-hidden">
        {pdf.image_url ? (
          <img 
            src={pdf.image_url} 
            alt={pdf.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
            <FileText className="w-16 h-16 text-indigo-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
          {pdf.name}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
          {pdf.description}
        </p>

        {/* Pricing Area */}
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Price</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-900">{pdf.selling_price}</span>
              {pdf.marked_price && (
                <span className="text-sm text-slate-400 line-through font-medium">{pdf.marked_price}</span>
              )}
            </div>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
            Digital Guide
          </div>
        </div>

        {/* Premium CTA Button */}
        <motion.a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group w-full py-4 bg-gradient-to-r from-[#6366f1]/80 to-[#4F46E5]/90 backdrop-blur-md border border-white/30 hover:border-white/50 hover:to-[#4F46E5] text-white rounded-full font-bold text-base shadow-xl shadow-[#4F46E5]/30 flex items-center justify-center gap-3 z-10 transition-all overflow-hidden"
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

          <MessageCircle className="w-5 h-5 fill-current relative z-10 drop-shadow-md" />
          <span className="relative z-10 drop-shadow-md">Buy Now</span>
        </motion.a>
      </div>
    </motion.div>
  )
}
