'use server'

import { getSetting, setSetting } from './settings'
import { revalidatePath } from 'next/cache'

export interface Question {
  id: string
  questionText: string
  options: string[] // 4 items
  correctOptionIndex: number // 0, 1, 2, 3
  explanation?: string
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
        correctOptionIndex: 1,
        explanation: "We use the preposition 'at' after 'good' to describe skills or abilities (e.g., 'good at languages', 'good at chess')."
      },
      {
        id: "q-g2",
        questionText: "Identify the past tense form of 'run':",
        options: ["runs", "runned", "ran", "running"],
        correctOptionIndex: 2,
        explanation: "'Ran' is the irregular past tense form of the verb 'run' (Run - Ran - Run)."
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
        correctOptionIndex: 2,
        explanation: "For singular third-person pronouns (he, she, it), we use 'doesn't' (does not) followed by the base form of the verb ('like')."
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
        correctOptionIndex: 1,
        explanation: "We use 'on' with specific days (e.g., Friday) and parts of specific days (e.g., Friday morning)."
      },
      {
        id: "q-pa2",
        questionText: "He is looking for ____ honest response to his proposal.",
        options: ["a", "an", "the", "no article needed"],
        correctOptionIndex: 1,
        explanation: "Although 'honest' starts with the consonant letter 'h', it begins with a vowel sound (/ˈɒnɪst/), so we use the article 'an'."
      },
      {
        id: "q-pa3",
        questionText: "The keys are ____ the kitchen counter, next to the microwave.",
        options: ["in", "at", "on", "inside"],
        correctOptionIndex: 2,
        explanation: "We use 'on' to describe items placed on top of a flat surface (e.g., counter, table, shelf)."
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
        correctOptionIndex: 1,
        explanation: "'Look after' is a phrasal verb meaning to take care of, guard, or be responsible for someone or something."
      },
      {
        id: "q-vp2",
        questionText: "Select the word that is closest in meaning to 'generous':",
        options: ["selfish", "greedy", "kind / giving", "thrifty"],
        correctOptionIndex: 2,
        explanation: "'Generous' refers to someone who is happy to share, give, or help others, which is closest to 'kind / giving'."
      },
      {
        id: "q-vp3",
        questionText: "If a plan 'falls through', it means the plan:",
        options: ["succeeds unexpectedy", "fails to happen", "gets postponed", "is implemented smoothly"],
        correctOptionIndex: 1,
        explanation: "The phrasal verb 'fall through' means to fail, collapse, or not be completed successfully."
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
