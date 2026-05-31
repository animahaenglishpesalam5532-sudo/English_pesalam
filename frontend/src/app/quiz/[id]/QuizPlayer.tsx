'use client'

import React, { useState } from 'react'
import { Quiz, Question } from '@/app/actions/quiz'
import { Check, X, Trophy, RefreshCw, ChevronLeft, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface QuizPlayerProps {
  quiz: Quiz
}

export default function QuizPlayer({ quiz }: QuizPlayerProps) {
  // Store user responses: { [questionId]: optionIndex }
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // Validation tracking to highlight unanswered questions
  const [unansweredQuestions, setUnansweredQuestions] = useState<string[]>([])

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return // Prevent editing after submission
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
    
    // Remove from unanswered list if selected
    if (unansweredQuestions.includes(questionId)) {
      setUnansweredQuestions(prev => prev.filter(id => id !== questionId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if all questions are answered
    const unanswered: string[] = []
    quiz.questions.forEach(q => {
      if (answers[q.id] === undefined) {
        unanswered.push(q.id)
      }
    })

    if (unanswered.length > 0) {
      setUnansweredQuestions(unanswered)
      toast.error(`Please answer all ${unanswered.length} remaining question(s) before saving!`)
      // Scroll to the first unanswered question
      const firstUnansweredEl = document.getElementById(`q-container-${unanswered[0]}`)
      if (firstUnansweredEl) {
        firstUnansweredEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // All answered, compute score and open modal
    setIsSubmitted(true)
    setShowModal(true)
    toast.success('Quiz submitted successfully!')
  }

  const handleReset = () => {
    setAnswers({})
    setIsSubmitted(false)
    setShowModal(false)
    setUnansweredQuestions([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate score
  const totalQuestions = quiz.questions.length
  let score = 0
  quiz.questions.forEach(q => {
    if (answers[q.id] === q.correctOptionIndex) {
      score++
    }
  })
  
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0

  // Message based on percentage
  const getFeedbackMessage = () => {
    if (percentage === 100) return { title: 'Perfect Score!', desc: 'Outstanding! You have mastered this lesson. Keep it up! 🎉' }
    if (percentage >= 75) return { title: 'Great Job!', desc: 'Fantastic work! You have a strong understanding of this topic. 🌟' }
    if (percentage >= 50) return { title: 'Good Effort!', desc: 'Good attempt. Review the incorrect answers and try again to improve. 👍' }
    return { title: 'Keep Practicing!', desc: 'Don\'t give up! Revision and practice will make you perfect. Read the guide and try again. 📚' }
  }

  const feedback = getFeedbackMessage()

  // Radial SVG calculation
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="space-y-8 mt-6">
      {/* Quiz Info Header */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">
          {quiz.title}
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          Please read each question carefully and select the best option. All questions are mandatory.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
            <span>ANSWERED STATUS</span>
            <span>
              {Object.keys(answers).length} of {totalQuestions} answered
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-gradient-to-r from-brand-blue to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, index) => {
          const isUnanswered = unansweredQuestions.includes(question.id)
          return (
            <div 
              key={question.id}
              id={`q-container-${question.id}`}
              className={`bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border transition-all duration-300 ${
                isUnanswered 
                  ? 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                  : 'border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)]'
              }`}
            >
              {/* Question Text */}
              <div className="flex items-start gap-4 mb-6">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm mt-0.5">
                  {index + 1}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
                  {question.questionText}
                </h3>
              </div>

              {isUnanswered && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold mb-4 bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100 max-w-max">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Please select an option for this question
                </div>
              )}

              {/* Options list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, oIndex) => {
                  const isSelected = answers[question.id] === oIndex
                  const optionLetter = String.fromCharCode(65 + oIndex)

                  return (
                    <button
                      key={`play-o-${question.id}-${oIndex}`}
                      type="button"
                      onClick={() => handleSelectOption(question.id, oIndex)}
                      className={`flex items-center text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-indigo-50/60 border-indigo-500 shadow-sm text-indigo-900' 
                          : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 transition-all ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        {optionLetter}
                      </div>
                      <span className="text-sm font-semibold">{option}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Form Action Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <Link 
            href="/quiz" 
            className="flex items-center text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Quizzes
          </Link>
          <div className="flex gap-3 w-full sm:w-auto">
            {isSubmitted && (
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Quiz
              </button>
            )}
            <button
              type="submit"
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-blue to-indigo-600 px-8 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.01]"
            >
              {isSubmitted ? 'Show Results' : 'Submit & Save Answers'}
            </button>
          </div>
        </div>
      </form>

      {/* RESULTS MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
            >
              {/* Modal Body (Scrollable container) */}
              <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-8">
                {/* Header details */}
                <div className="text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="#F1F5F9"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke={percentage >= 50 ? "#10B981" : "#EF4444"}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        fill="transparent"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center Text */}
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-slate-800 tracking-tight">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                      {feedback.title}
                      {percentage >= 75 && <Trophy className="w-6 h-6 text-amber-500 fill-amber-100" />}
                    </h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                      You scored {score} out of {totalQuestions}
                    </p>
                    <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mt-2">
                      {feedback.desc}
                    </p>
                  </div>
                </div>

                {/* Question Review Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b pb-2">
                    Review Your Answers
                  </h3>
                  
                  <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
                    {quiz.questions.map((q, idx) => {
                      const userSelection = answers[q.id]
                      const isCorrect = userSelection === q.correctOptionIndex
                      
                      return (
                        <div 
                          key={`rev-${q.id}`}
                          className={`p-4 rounded-2xl border transition-all ${
                            isCorrect 
                              ? 'bg-emerald-50/30 border-emerald-100' 
                              : 'bg-red-50/30 border-red-100'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 mb-3">
                            {isCorrect ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                                <X className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                            <span className="text-sm font-bold text-slate-800 leading-snug">
                              {idx + 1}. {q.questionText}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2 pl-7">
                            {/* User Selection if incorrect */}
                            {!isCorrect && (
                              <div className="flex items-center text-xs font-semibold text-red-700 bg-red-50/50 px-3 py-2 rounded-xl border border-red-100">
                                <span className="mr-1.5 uppercase font-bold text-red-500">Your Answer:</span>
                                {q.options[userSelection]}
                              </div>
                            )}
                            {/* Correct Selection */}
                            <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50/50 px-3 py-2 rounded-xl border border-emerald-100">
                              <span className="mr-1.5 uppercase font-bold text-emerald-500">Correct Answer:</span>
                              {q.options[q.correctOptionIndex]}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end rounded-b-[32px]">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <Link
                  href="/quiz"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3 text-sm font-bold text-white transition-colors"
                >
                  Back to Quizzes
                </Link>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white transition-colors shadow-md shadow-indigo-100"
                >
                  Close Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
