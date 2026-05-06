import React from 'react'
import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { AmbientBackground } from "@/components/AmbientBackground"
import { getVisiblePPTs } from "@/app/actions/ppts"
import { getSetting } from "@/app/actions/settings"
import { Presentation } from "lucide-react"
import { PPTList } from "@/components/PPTList"

export const revalidate = 3600 // Revalidate every hour

export default async function PPTsPage() {
  // Load 30 items initially as requested
  const initialPPTs = await getVisiblePPTs(true, 0, 30)
  const whatsappNumber = await getSetting('contact_phone', true)
  const globalWhatsappText = await getSetting('ppt_whatsapp_text', true) || 'I want to buy '

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      
      <main className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/50 backdrop-blur-md rounded-full text-blue-600 border border-blue-100 mb-2">
              <Presentation className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Visual Learning</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              PPT Masterclass & <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Study Guides</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Master English concepts through visual slides, summaries, and structured learning guides designed for fast retention.
            </p>
          </div>

          {/* List Section with Infinite Scroll */}
          <PPTList 
            initialPPTs={initialPPTs}
            whatsappNumber={whatsappNumber || ""}
            globalWhatsappText={globalWhatsappText}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
