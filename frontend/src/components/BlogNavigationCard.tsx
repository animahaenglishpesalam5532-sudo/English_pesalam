import React from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'

export function BlogNavigationCard() {
  return (
    <section className="px-4 w-full max-w-md md:max-w-6xl mx-auto mb-10">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white/30 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_16px_40px_0_rgba(31,38,135,0.1)] hover:-translate-y-2 transition-all duration-300 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none rounded-[2.5rem]" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">English Pesalam Blog</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Explore Free English Lessons
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Enhance your spoken English with simple, step-by-step guides explained entirely in Tamil. Check out our free library of tips, tricks, and expert advice.
          </p>
        </div>
        
        <div className="relative z-10 w-full md:w-auto shrink-0">
          <Link 
            href="/blogs"
            className="flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-bold text-sm md:text-base transition-transform active:scale-95 shadow-lg shadow-blue-500/30"
          >
            Read Our Blogs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
