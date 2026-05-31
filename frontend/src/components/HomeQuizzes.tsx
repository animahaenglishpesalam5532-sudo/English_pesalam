import React from 'react'
import Link from 'next/link'
import { Brain, ArrowRight, HelpCircle } from 'lucide-react'
import { Quiz } from '@/app/actions/quiz'

export function HomeQuizzes({ quizzes }: { quizzes: Quiz[] }) {
  // Show up to 3 quizzes on home page
  const displayQuizzes = quizzes.slice(0, 3)

  if (displayQuizzes.length === 0) return null

  return (
    <section className="px-4 w-full max-w-md md:max-w-6xl mx-auto mb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
              <Brain className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Quick Assessments</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Practice &amp; Test Yourself
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mt-1 leading-relaxed">
            Check your understanding of English grammar, prepositions, and vocabulary with our bite-sized quizzes.
          </p>
        </div>
        <Link
          href="/quiz"
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View All Quizzes
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayQuizzes.map((quiz, index) => {
          return (
            <div
              key={quiz.id}
              className="group relative bg-white/30 backdrop-blur-2xl rounded-[2.2rem] p-6 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.04)] hover:shadow-[0_16px_40px_0_rgba(31,38,135,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Inner ambient light */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none rounded-[2.2rem]" />

              <div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'}
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                    Interactive
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 relative z-10">
                  {quiz.title}
                </h3>

                <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-2 relative z-10">
                  Quickly check your performance in {quiz.title}. Get instant score feedback with detailed review answers.
                </p>
              </div>

              <Link
                href={`/quiz/${quiz.id}`}
                className="w-full text-center py-3 rounded-full font-bold text-xs bg-slate-900 group-hover:bg-indigo-600 text-white transition-all active:scale-[0.98] shadow-md shadow-slate-900/10 group-hover:shadow-indigo-500/20 relative z-10 flex items-center justify-center gap-1.5"
              >
                Take Quiz
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
