'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { VideoCourseCard } from "@/components/VideoCourseCard"
import { getVisibleVideoCourses } from "@/app/actions/video-courses"
import { Loader2, Video, Star } from "lucide-react"

interface VideoCourseListProps {
  initialCourses: any[]
  whatsappNumber: string
  globalWhatsappText: string
}

export function VideoCourseList({ initialCourses, whatsappNumber, globalWhatsappText }: VideoCourseListProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialCourses.length >= 30)
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const nextCourses = await getVisibleVideoCourses(false, page, 30)
    
    if (nextCourses.length === 0) {
      setHasMore(false)
    } else {
      setCourses(prev => [...prev, ...nextCourses])
      setPage(prev => prev + 1)
      if (nextCourses.length < 30) setHasMore(false)
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

  if (courses.length === 0) {
    return (
      <div className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-16 text-center shadow-xl">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Video Courses Coming Soon!</h2>
        <p className="text-slate-500">We are currently preparing our high-quality video masterclasses for you. Check back shortly!</p>
      </div>
    )
  }

  const featuredCourses = courses.filter(c => c.is_featured)
  const regularCourses = courses.filter(c => !c.is_featured)

  return (
    <div className="space-y-16">
      {/* Featured Section */}
      {featuredCourses.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Masterclasses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => {
              const cleanPhone = (whatsappNumber || "919345639627").replace(/[^0-9]/g, '')
              const encodedMsg = encodeURIComponent(`${globalWhatsappText}${course.name}`)
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`

              return <VideoCourseCard key={course.id || `f-${index}`} course={course} whatsappUrl={whatsappUrl} />
            })}
          </div>
        </div>
      )}

      {/* Regular Section */}
      {regularCourses.length > 0 && (
        <div className="space-y-8">
          {featuredCourses.length > 0 && (
            <div className="flex items-center gap-3 pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">All Video Courses</h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularCourses.map((course, index) => {
              const cleanPhone = (whatsappNumber || "919345639627").replace(/[^0-9]/g, '')
              const encodedMsg = encodeURIComponent(`${globalWhatsappText}${course.name}`)
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`

              return <VideoCourseCard key={course.id || index} course={course} whatsappUrl={whatsappUrl} />
            })}
          </div>
        </div>
      )}

      {/* Loading Trigger */}
      <div ref={observerTarget} className="flex justify-center py-10 h-20">
        {loading && (
          <div className="flex items-center gap-3 text-red-600 font-medium">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
      </div>
    </div>
  )
}
