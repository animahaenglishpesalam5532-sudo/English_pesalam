import React from 'react'
import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { AmbientBackground } from "@/components/AmbientBackground"
import { getVisiblePDFs } from "@/app/actions/pdfs"
import { getSetting } from "@/app/actions/settings"
import { FileText } from "lucide-react"
import { PDFList } from "@/components/PDFList"
import { Breadcrumbs } from "@/components/Breadcrumbs"

export const revalidate = 3600 // Revalidate every hour

export default async function PDFsPage() {
  const initialPDFs = await getVisiblePDFs(true, 0, 30)
  const whatsappNumber = await getSetting('contact_phone', true)
  const globalWhatsappText = await getSetting('pdf_whatsapp_text', true) || 'I want to buy '

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      
      <main className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={[{ label: 'Digital PDF Guides' }]} />
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/50 backdrop-blur-md rounded-full text-indigo-600 border border-indigo-100 mb-2">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Digital Guides</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Portable <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">PDF Guides</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Carry your learning everywhere. Expertly crafted PDF guides for quick reference and deep learning on any device.
            </p>
          </div>

          {/* List Section with Infinite Scroll */}
          <PDFList 
            initialPDFs={initialPDFs}
            whatsappNumber={whatsappNumber || ""}
            globalWhatsappText={globalWhatsappText}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
