'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { PlusCircle, Trash2, Edit2, ArrowLeft, Plus, Trash, Check, HelpCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Quiz, Question, getQuizzes, saveQuizzes } from '@/app/actions/quiz'
import { Modal } from '@/components/ui/Modal'

export default function AdminQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // View states: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  
  // Form states
  const [quizTitle, setQuizTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-1',
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0
    }
  ])
  
  // Delete state
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null)

  // Fetch quizzes on load
  const loadQuizzes = async () => {
    setIsLoading(true)
    try {
      const data = await getQuizzes()
      setQuizzes(data)
    } catch (e) {
      toast.error('Failed to load quizzes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuizzes()
  }, [])

  // Switch to list view and reset form
  const handleCancel = () => {
    setView('list')
    setActiveQuizId(null)
    setQuizTitle('')
    setQuestions([
      {
        id: 'q-' + Date.now(),
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0
      }
    ])
  }

  // Open Create Form
  const handleOpenCreate = () => {
    setQuizTitle('')
    setQuestions([
      {
        id: 'q-' + Date.now(),
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0
      }
    ])
    setView('create')
  }

  // Open Edit Form
  const handleOpenEdit = (quiz: Quiz) => {
    setActiveQuizId(quiz.id)
    setQuizTitle(quiz.title)
    // Deep clone questions to avoid direct state mutation issues
    setQuestions(
      quiz.questions.map(q => ({
        ...q,
        options: [...q.options]
      }))
    )
    setView('edit')
  }

  // Add Question to Form
  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: 'q-' + Date.now() + Math.random().toString(36).substr(2, 5),
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0
      }
    ])
  }

  // Remove Question from Form
  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Each quiz must have at least 1 question')
      return
    }
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  // Update Question text
  const handleQuestionTextChange = (index: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, questionText: text } : q))
  }

  // Update Option text
  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === qIndex) {
        const newOptions = [...q.options]
        newOptions[oIndex] = text
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  // Update Correct Option selection
  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, correctOptionIndex: oIndex } : q))
  }

  // Validate form and save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required')
      return
    }

    if (questions.length === 0) {
      toast.error('At least 1 question is required')
      return
    }

    // Check questions validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is empty`)
        return
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Option ${j + 1} for Question ${i + 1} is empty`)
          return
        }
      }
    }

    setIsSaving(true)
    try {
      let updatedQuizzes = [...quizzes]
      
      if (view === 'create') {
        const newQuiz: Quiz = {
          id: 'quiz-' + Date.now(),
          title: quizTitle,
          questions: questions,
          createdAt: new Date().toISOString()
        }
        updatedQuizzes.push(newQuiz)
      } else if (view === 'edit' && activeQuizId) {
        updatedQuizzes = updatedQuizzes.map(q => 
          q.id === activeQuizId 
            ? { ...q, title: quizTitle, questions: questions } 
            : q
        )
      }

      const res = await saveQuizzes(updatedQuizzes)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(view === 'create' ? 'Quiz created successfully!' : 'Quiz updated successfully!')
        setQuizzes(updatedQuizzes)
        handleCancel()
      }
    } catch (err) {
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete Quiz
  const handleDeleteConfirm = async () => {
    if (!deleteQuizId) return
    
    setIsSaving(true)
    try {
      const updatedQuizzes = quizzes.filter(q => q.id !== deleteQuizId)
      const res = await saveQuizzes(updatedQuizzes)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Quiz deleted successfully!')
        setQuizzes(updatedQuizzes)
      }
    } catch (e) {
      toast.error('Failed to delete quiz')
    } finally {
      setIsSaving(false)
      setDeleteQuizId(null)
    }
  }

  return (
    <AdminLayout>
      {view === 'list' ? (
        // LIST VIEW
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
              <p className="mt-1 text-sm text-gray-500">Manage learning quizzes for your students.</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center bg-blue-600 border border-transparent rounded-lg shadow-sm py-2.5 px-4 justify-center text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Quiz
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Loading quizzes...</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <HelpCircle className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Quizzes Found</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-sm">Create quizzes with custom questions and options to test user skills.</p>
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-4 py-2 rounded-lg transition-colors border border-blue-100"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create First Quiz
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz Title</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Created</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{quiz.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {quiz.questions.length} {quiz.questions.length === 1 ? 'Question' : 'Questions'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleOpenEdit(quiz)}
                            className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-blue-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteQuizId(quiz.id)}
                            className="text-red-600 hover:text-red-800 transition-colors inline-flex items-center gap-1 bg-red-50/50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        // CREATE / EDIT FORM VIEW
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all border border-gray-200 bg-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {view === 'create' ? 'Create New Quiz' : 'Edit Quiz'}
                </h1>
                <p className="text-sm text-gray-500">Define the quiz title and set of questions.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-none inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none inline-flex justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : 'Save Quiz'}
              </button>
            </div>
          </div>

          {/* Quiz Details Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Quiz Information</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 outline-none"
                placeholder="e.g. Tenses and Prepositions Grammar Test"
              />
            </div>
          </div>

          {/* Questions Container */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Questions ({questions.length})</h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors bg-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Question
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div 
                key={question.id} 
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 relative overflow-hidden transition-all hover:border-gray-300"
              >
                {/* Header of question card */}
                <div className="flex justify-between items-start gap-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                    {qIndex + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={e => handleQuestionTextChange(qIndex, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                      placeholder={`Enter question ${qIndex + 1} (e.g. Which preposition is correct: She is good ____ math?)`}
                    />
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      title="Delete Question"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Options Builder */}
                <div className="space-y-3 pl-0 sm:pl-10">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Options &amp; Correct Answer Selection
                  </label>
                  <p className="text-xs text-gray-400 mb-2">Fill in the 4 options below and select the checkmark corresponding to the correct answer.</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {question.options.map((option, oIndex) => {
                      const isCorrect = question.correctOptionIndex === oIndex
                      return (
                        <div 
                          key={`o-${qIndex}-${oIndex}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isCorrect 
                              ? 'bg-emerald-50/50 border-emerald-300 shadow-sm' 
                              : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`correct-ans-${question.id}`}
                              checked={isCorrect}
                              onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                              className="sr-only"
                            />
                            <div 
                              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                isCorrect 
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                                  : 'bg-white border-gray-300 text-transparent hover:border-emerald-400'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </label>
                          
                          <span className="text-sm font-bold text-gray-500 uppercase w-5">
                            {String.fromCharCode(65 + oIndex)}.
                          </span>

                          <input
                            type="text"
                            value={option}
                            onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder={`Enter Option ${String.fromCharCode(65 + oIndex)}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </span>
              ) : 'Save Quiz'}
            </button>
          </div>
        </form>
      )}

      {/* Delete Quiz Modal */}
      <Modal isOpen={!!deleteQuizId} onClose={() => setDeleteQuizId(null)} title="Delete Quiz">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this quiz? This action cannot be undone and the quiz will no longer be available to students.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setDeleteQuizId(null)}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isSaving}
              className="inline-flex justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
