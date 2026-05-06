import React from 'react'
import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { AmbientBackground } from "@/components/AmbientBackground"
import { getVisibleVideoCourses } from "@/app/actions/video-courses"
import { getSetting } from "@/app/actions/settings"
import { Video } from "lucide-react"
import { VideoCourseList } from "@/components/VideoCourseList"

export const revalidate = 3600 // Revalidate every hour

export default async function VideoCoursesPage() {
  const initialCourses = await getVisibleVideoCourses(true, 0, 30)
  const whatsappNumber = await getSetting('contact_phone', true)
  const globalWhatsappText = await getSetting('video_course_whatsapp_text', true) || 'I want to buy '

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      
      <main className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50/50 backdrop-blur-md rounded-full text-red-600 border border-red-100 mb-2">
              <Video className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Premium Masterclasses</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Comprehensive <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Video Courses</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Learn English from experts with structured video modules, practical exercises, and lifetime access to high-quality lessons.
            </p>
          </div>

          {/* List Section with Infinite Scroll */}
          <VideoCourseList 
            initialCourses={initialCourses}
            whatsappNumber={whatsappNumber || ""}
            globalWhatsappText={globalWhatsappText}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
