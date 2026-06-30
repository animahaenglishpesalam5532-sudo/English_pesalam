'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PPTCard } from "@/components/PPTCard"
import { getVisiblePPTs } from "@/app/actions/ppts"
import { Loader2, Presentation, Star } from "lucide-react"

interface PPTListProps {
  initialPPTs: any[]
  whatsappNumber: string
  globalWhatsappText: string
}

export function PPTList({ initialPPTs, whatsappNumber, globalWhatsappText }: PPTListProps) {
  const [ppts, setPpts] = useState(initialPPTs)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPPTs.length >= 30)
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const nextPPTs = await getVisiblePPTs(false, page, 30)
    
    if (nextPPTs.length === 0) {
      setHasMore(false)
    } else {
      setPpts(prev => [...prev, ...nextPPTs])
      setPage(prev => prev + 1)
      if (nextPPTs.length < 30) setHasMore(false)
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

  if (ppts.length === 0) {
    return (
      <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-16 text-center shadow-xl">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Presentation className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Very Soon!</h2>
        <p className="text-slate-500">We are currently preparing our high-quality PPT guides for you. Check back shortly!</p>
      </div>
    )
  }

  const featuredPPTs = ppts.filter(p => p.is_featured)
  const regularPPTs = ppts.filter(p => !p.is_featured)

  return (
    <div className="space-y-16">
      {/* Featured Section */}
      {featuredPPTs.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured PPT Masterclasses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPPTs.map((ppt, index) => {
              const cleanPhone = (whatsappNumber || "6380513228").replace(/[^0-9]/g, '')
              const encodedMsg = encodeURIComponent(`${globalWhatsappText}${ppt.name}`)
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`

              return <PPTCard key={ppt.id || `f-${index}`} ppt={ppt} whatsappUrl={whatsappUrl} />
            })}
          </div>
        </div>
      )}

      {/* Regular Section */}
      {regularPPTs.length > 0 && (
        <div className="space-y-8">
          {featuredPPTs.length > 0 && (
            <div className="flex items-center gap-3 pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">All Study Guides</h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPPTs.map((ppt, index) => {
              const cleanPhone = (whatsappNumber || "6380513228").replace(/[^0-9]/g, '')
              const encodedMsg = encodeURIComponent(`${globalWhatsappText}${ppt.name}`)
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`

              return <PPTCard key={ppt.id || index} ppt={ppt} whatsappUrl={whatsappUrl} />
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
