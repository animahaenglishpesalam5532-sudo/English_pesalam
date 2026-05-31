'use server'

import { getSetting, setSetting } from './settings'
import { revalidatePath } from 'next/cache'

export interface Question {
  id: string
  questionText: string
  options: string[] // 4 items
  correctOptionIndex: number // 0, 1, 2, 3
}

export interface Quiz {
  id: string
  title: string
  questions: Question[]
  createdAt: string
}

const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: "quiz-tense-grammar",
    title: "English Grammar & Tenses Test",
    createdAt: "2026-05-31T14:00:00.000Z",
    questions: [
      {
        id: "q-g1",
        questionText: "Which preposition is correct: She is good ____ languages?",
        options: ["in", "at", "on", "for"],
        correctOptionIndex: 1
      },
      {
        id: "q-g2",
        questionText: "Identify the past tense form of 'run':",
        options: ["runs", "runned", "ran", "running"],
        correctOptionIndex: 2
      },
      {
        id: "q-g3",
        questionText: "Choose the correct sentence:",
        options: [
          "He don't like coffee.",
          "He doesn't likes coffee.",
          "He doesn't like coffee.",
          "He not like coffee."
        ],
        correctOptionIndex: 2
      }
    ]
  },
  {
    id: "quiz-prepositions-articles",
    title: "Prepositions & Articles Challenge",
    createdAt: "2026-05-31T15:00:00.000Z",
    questions: [
      {
        id: "q-pa1",
        questionText: "We need to discuss this meeting ____ Friday morning.",
        options: ["at", "on", "in", "for"],
        correctOptionIndex: 1
      },
      {
        id: "q-pa2",
        questionText: "He is looking for ____ honest response to his proposal.",
        options: ["a", "an", "the", "no article needed"],
        correctOptionIndex: 1
      },
      {
        id: "q-pa3",
        questionText: "The keys are ____ the kitchen counter, next to the microwave.",
        options: ["in", "at", "on", "inside"],
        correctOptionIndex: 2
      }
    ]
  },
  {
    id: "quiz-vocab-phrasal",
    title: "Vocabulary & Phrasal Verbs Masterclass",
    createdAt: "2026-05-31T16:00:00.000Z",
    questions: [
      {
        id: "q-vp1",
        questionText: "What does the phrasal verb 'look after' mean?",
        options: ["To search for something", "To take care of someone/something", "To look forward to an event", "To watch from a distance"],
        correctOptionIndex: 1
      },
      {
        id: "q-vp2",
        questionText: "Select the word that is closest in meaning to 'generous':",
        options: ["selfish", "greedy", "kind / giving", "thrifty"],
        correctOptionIndex: 2
      },
      {
        id: "q-vp3",
        questionText: "If a plan 'falls through', it means the plan:",
        options: ["succeeds unexpectedy", "fails to happen", "gets postponed", "is implemented smoothly"],
        correctOptionIndex: 1
      }
    ]
  }
]

export async function getQuizzes(): Promise<Quiz[]> {
  try {
    const value = await getSetting('quizzes')
    if (!value) return DEFAULT_QUIZZES
    const parsed = JSON.parse(value) as Quiz[]
    return parsed.length === 0 ? DEFAULT_QUIZZES : parsed
  } catch (error) {
    console.error('Failed to parse quizzes:', error)
    return DEFAULT_QUIZZES
  }
}

export async function saveQuizzes(quizzes: Quiz[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const value = JSON.stringify(quizzes)
    const result = await setSetting('quizzes', value)
    if (result.error) {
      return { error: result.error }
    }
    
    revalidatePath('/admin/quiz')
    revalidatePath('/quiz')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to save quizzes:', error)
    return { error: error.message || 'Failed to save quizzes' }
  }
}
