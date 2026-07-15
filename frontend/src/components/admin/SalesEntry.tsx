'use client'

import React, { useState } from 'react'
import { MessageCircle, BookOpen, Files, Video } from 'lucide-react'
import { InteractionModal, EntryFormValues } from './InteractionModal'
import { logInteraction, type Category, type EntryProducts } from '@/app/actions/sales'

const CARDS: {
  category: Category
  title: string
  desc: string
  icon: React.ElementType
  color: string
}[] = [
  { category: 'general', title: 'General Inquiry', desc: 'Any general question or inquiry', icon: MessageCircle, color: 'from-sky-500 to-blue-600' },
  { category: 'book', title: 'Book', desc: 'Book inquiry or purchase', icon: BookOpen, color: 'from-emerald-500 to-green-600' },
  { category: 'pdf_ppt', title: 'PDF & PPT', desc: 'Digital PDF / PPT products', icon: Files, color: 'from-amber-500 to-orange-600' },
  { category: 'video_course', title: 'Online Video Course', desc: 'Video course inquiry or purchase', icon: Video, color: 'from-fuchsia-500 to-purple-600' },
]

export default function SalesEntry({ products }: { products: EntryProducts }) {
  const [active, setActive] = useState<Category | null>(null)
  const activeCard = CARDS.find((c) => c.category === active)

  const handleSubmit = async (values: EntryFormValues) => {
    return logInteraction({
      phone: values.phone,
      name: values.name,
      category: active!,
      items: values.items,
      notes: values.notes,
      callType: values.callType,
      amount: values.callType === 'purchase' ? parseFloat(values.amount) : null,
      callAt: new Date(values.callAt).toISOString(),
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Log a Call</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select the type of call to record an inquiry or purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.category}
              onClick={() => setActive(card.category)}
              className="group text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.color} text-white mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{card.desc}</p>
            </button>
          )
        })}
      </div>

      {activeCard && (
        <InteractionModal
          isOpen={!!active}
          onClose={() => setActive(null)}
          category={activeCard.category}
          title={activeCard.title}
          products={products}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
