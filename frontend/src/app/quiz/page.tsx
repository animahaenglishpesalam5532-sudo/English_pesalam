import React from 'react'
import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { AmbientBackground } from "@/components/AmbientBackground"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getQuizzes } from "@/app/actions/quiz"
import { Brain, ArrowRight, HelpCircle, GraduationCap } from "lucide-react"
import Link from 'next/link'

export const revalidate = 0 // Dynamic/No caching for live admin quiz updates

export default async function QuizListPage() {
  const quizzes = await getQuizzes()

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      
      <main className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={[{ label: 'Quizzes' }]} />
          
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/50 backdrop-blur-md rounded-full text-indigo-600 border border-indigo-100 mb-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold uppercase tracking-wider">Test Your English</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Interactive <span className="bg-gradient-to-r from-brand-blue to-indigo-600 bg-clip-text text-transparent">English Quizzes</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Test your grammar, vocabulary, and sentence structure with our fun quizzes. Get instant score tracking and analysis!
            </p>
          </div>

          {/* Quiz Grid */}
          {quizzes.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 p-12 text-center max-w-xl mx-auto shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <GraduationCap className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">No Quizzes Available Yet</h2>
              <p className="text-slate-500 mb-6">Our admin is currently working on crafting grammar and vocabulary tests. Check back shortly!</p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-200"
              >
                Go Back Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {quizzes.map((quiz, index) => {
                // Different gradients for icons based on index
                const gradients = [
                  'from-blue-500 to-indigo-600 text-blue-600',
                  'from-emerald-400 to-teal-600 text-emerald-600',
                  'from-violet-500 to-purple-600 text-violet-600',
                  'from-amber-400 to-orange-500 text-amber-600',
                ]
                const iconGradient = gradients[index % gradients.length]

                return (
                  <div 
                    key={quiz.id}
                    className="group bg-white/70 backdrop-blur-lg rounded-3xl border border-white/60 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      {/* Top Info */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconGradient.split(' ')[0]} ${iconGradient.split(' ')[1]} p-3 flex items-center justify-center text-white shadow-md`}>
                          <Brain className="w-6 h-6" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                          <HelpCircle className="w-3.5 h-3.5" />
                          {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>
                      
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">
                        {quiz.description || 'Ready to check your understanding? Click below to begin the quiz. Remember to complete all questions!'}
                      </p>
                    </div>

                    {/* Start Button */}
                    <Link
                      href={`/quiz/${quiz.id}`}
                      className="w-full flex items-center justify-center py-3.5 px-5 rounded-2xl bg-[#0B256B] group-hover:bg-[#2962FF] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#0B256B]/15 group-hover:shadow-[#2962FF]/20 transition-all duration-300"
                    >
                      Start Quiz
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
