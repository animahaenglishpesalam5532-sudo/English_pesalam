'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PDFCard } from "@/components/PDFCard"
import { getVisiblePDFs } from "@/app/actions/pdfs"
import { Loader2, FileText, Star } from "lucide-react"

interface PDFListProps {
  initialPDFs: any[]
  whatsappNumber: string
  globalWhatsappText: string
}

export function PDFList({ initialPDFs, whatsappNumber, globalWhatsappText }: PDFListProps) {
  const [pdfs, setPdfs] = useState(initialPDFs)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPDFs.length >= 30)
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const nextPDFs = await getVisiblePDFs(false, page, 30)
    
    if (nextPDFs.length === 0) {
      setHasMore(false)
    } else {
      setPdfs(prev => [...prev, ...nextPDFs])
      setPage(prev => prev + 1)
      if (nextPDFs.length < 30) setHasMore(false)
    }
    setLoading(false)
  }, [page, loading, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore])

  if (pdfs.length === 0) {
    return (
      <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-16 text-center shadow-xl">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">PDF Guides Coming Soon!</h2>
        <p className="text-slate-500">We are currently preparing our digital PDF guides for you. Check back shortly!</p>
      </div>
    )
  }

  const featuredPDFs = pdfs.filter(p => p.is_featured)
  const regularPDFs = pdfs.filter(p => !p.is_featured)

  return (
    <div className="space-y-16">
      {/* Featured Section */}
      {featuredPDFs.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured PDF Guides</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPDFs.map((pdf, index) => {
              const cleanPhone = (whatsappNumber || "919345639627").replace(/[^0-9]/g, '')
              const encodedMsg = encodeURIComponent(`${globalWhatsappText}${pdf.name}`)
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`

              return <PDFCard key={pdf.id || `f-${index}`} pdf={pdf} whatsappUrl={whatsappUrl} />
            })}
          </div>
        </div>
      )}

      {/* Regular Section */}
      {regularPDFs.length > 0 && (
        <div className="space-y-8">
          {featuredPDFs.length > 0 && (
            <div className="flex items-center gap-3 pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">All PDF Collection</h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPDFs.map((pdf, index) => {
              const cleanPhone = (whatsappNumber || "919345639627").replace(/[^0-9]/g, '')
              const encodedMsg = encodeURIComponent(`${globalWhatsappText}${pdf.name}`)
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`

              return <PDFCard key={pdf.id || index} pdf={pdf} whatsappUrl={whatsappUrl} />
            })}
          </div>
        </div>
      )}

      {/* Loading Trigger */}
      <div ref={observerTarget} className="flex justify-center py-10 h-20">
        {loading && (
          <div className="flex items-center gap-3 text-blue-600 font-medium">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
      </div>
    </div>
  )
}
