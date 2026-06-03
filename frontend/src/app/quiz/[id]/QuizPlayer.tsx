'use client'

import React, { useState } from 'react'
import { Quiz, Question } from '@/app/actions/quiz'
import { Check, X, Trophy, RefreshCw, ChevronLeft, AlertTriangle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface QuizPlayerProps {
  quiz: Quiz
}

export default function QuizPlayer({ quiz }: QuizPlayerProps) {
  // Store user responses: { [questionId]: optionIndex }
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const totalQuestions = quiz.questions.length

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return // Prevent editing after submission
    if (answers[questionId] !== undefined) return // Prevent changing answer once selected
    
    const newAnswers = {
      ...answers,
      [questionId]: optionIndex
    }
    
    setAnswers(newAnswers)
    
    // Auto-trigger completion when all questions are answered
    if (Object.keys(newAnswers).length === totalQuestions) {
      setIsSubmitted(true)
      // Open results modal after a brief delay so they can see the feedback of the last question first
      setTimeout(() => {
        setShowModal(true)
      }, 1200)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setIsSubmitted(false)
    setShowModal(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate score
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

      {/* Questions Container */}
      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const hasAnswered = answers[question.id] !== undefined

          return (
            <div 
              key={question.id}
              id={`q-container-${question.id}`}
              className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
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

              {/* Options list */}
              <div className="flex flex-col gap-4">
                {question.options.map((option, oIndex) => {
                  const isSelected = answers[question.id] === oIndex
                  const isCorrectOption = question.correctOptionIndex === oIndex
                  const optionLetter = String.fromCharCode(65 + oIndex)

                  let btnClass = ""
                  let circleClass = ""
                  let circleContent: React.ReactNode = optionLetter

                  if (hasAnswered) {
                    if (isCorrectOption) {
                      btnClass = "bg-emerald-50/70 border-emerald-500 text-emerald-955 cursor-default"
                      circleClass = "bg-emerald-500 border-emerald-500 text-white"
                      circleContent = <Check className="w-3.5 h-3.5 stroke-[3]" />
                    } else if (isSelected) {
                      btnClass = "bg-red-50/70 border-red-500 text-red-955 cursor-default"
                      circleClass = "bg-red-500 border-red-500 text-white"
                      circleContent = <X className="w-3.5 h-3.5 stroke-[3]" />
                    } else {
                      btnClass = "bg-slate-50/40 border-slate-100 text-slate-400 opacity-60 cursor-default"
                      circleClass = "bg-slate-100 border-slate-200 text-slate-400"
                    }
                  } else {
                    btnClass = isSelected 
                      ? 'bg-indigo-50/60 border-indigo-500 shadow-sm text-indigo-900' 
                      : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700'
                    circleClass = isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }

                  return (
                    <div key={`play-o-wrapper-${question.id}-${oIndex}`} className="flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(question.id, oIndex)}
                        className={`flex items-center text-left p-4 rounded-2xl border-2 transition-all duration-200 ${btnClass}`}
                      >
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 transition-all ${circleClass}`}
                        >
                          {circleContent}
                        </div>
                        <span className="text-sm font-semibold">{option}</span>
                      </button>

                      {/* Explanation displayed directly below correct answer */}
                      {hasAnswered && isCorrectOption && question.explanation && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="ml-0 sm:ml-9 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 text-slate-700 text-sm leading-relaxed"
                        >
                          <div className="font-extrabold text-indigo-900 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Answer Explanation</span>
                          </div>
                          <p className="font-medium text-slate-600">{question.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Form Action Footer */}
        <div className="flex justify-between items-center bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <Link 
            href="/quiz" 
            className="flex items-center text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Quizzes
          </Link>
          <div className="flex gap-3">
            {isSubmitted && (
              <>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 border border-indigo-100 px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-100/50 transition-colors shadow-sm"
                >
                  <Trophy className="w-4 h-4" />
                  View Results
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Quiz
                </button>
              </>
            )}
          </div>
        </div>
      </div>

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
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                                <X className="w-3.5 h-3.5 stroke-[3]" />
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
