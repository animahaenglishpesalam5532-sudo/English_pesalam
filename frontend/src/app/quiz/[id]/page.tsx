import React from 'react'
import { getQuizzes } from '@/app/actions/quiz'
import { redirect } from 'next/navigation'
import QuizPlayer from './QuizPlayer'
import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { AmbientBackground } from "@/components/AmbientBackground"
import { Breadcrumbs } from "@/components/Breadcrumbs"

export const revalidate = 0 // No caching for live quiz edits

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params
  const quizzes = await getQuizzes()
  const quiz = quizzes.find(q => q.id === id)
  
  if (!quiz) {
    redirect('/quiz')
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      
      <main className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs 
            items={[
              { label: 'Quizzes', href: '/quiz' },
              { label: quiz.title }
            ]} 
          />
          
          <QuizPlayer quiz={quiz} />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
