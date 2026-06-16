import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import HeroSettingsForm from '@/components/admin/HeroSettingsForm'
import { getSetting } from '@/app/actions/settings'

export const revalidate = 0

export default async function HeroSettingsPage() {
  // Fetch Hero and Trainer Settings with default fallback values
  const heroSubtitle = await getSetting('hero_subtitle') || '1M+ YOUTUBE FAMILY • TAMIL TO ENGLISH FOCUS'
  const heroTitle = await getSetting('hero_title') || 'தமிழ் பேசும் மக்களுக்கான Practical Spoken English Platform'
  const heroDescription = await getSetting('hero_description') || 'English தெரிந்தும் பேச முடியாமல் தவிக்கிறீர்களா? Simple Tamil explanation, daily use sentences, grammar patterns, vocabulary, pronunciation practice மூலம் English-ஐ confidence-ஆ பேச ஆரம்பிக்க English Pesalam உங்களுக்கு உதவும்.'
  
  const trainerName = await getSetting('trainer_name') || 'Maha JC'
  const trainerTitle = await getSetting('trainer_title') || 'Founder & Spoken English Trainer'
  const trainerImageUrl = await getSetting('trainer_image_url') || ''
  const trainerStat1Value = await getSetting('trainer_stat_1_value') || '1M+'
  const trainerStat1Label = await getSetting('trainer_stat_1_label') || 'Subscribers'
  const trainerStat2Value = await getSetting('trainer_stat_2_value') || '500+'
  const trainerStat2Label = await getSetting('trainer_stat_2_label') || 'Lessons'

  return (
    <AdminLayout>
      <div className="max-w-4xl w-full space-y-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Homepage Hero Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the hero section tagline, title, description, CTAs, and trainer card details.</p>
        </div>

        <HeroSettingsForm 
          initialValues={{
            hero_subtitle: heroSubtitle,
            hero_title: heroTitle,
            hero_description: heroDescription,
            trainer_name: trainerName,
            trainer_title: trainerTitle,
            trainer_image_url: trainerImageUrl,
            trainer_stat_1_value: trainerStat1Value,
            trainer_stat_1_label: trainerStat1Label,
            trainer_stat_2_value: trainerStat2Value,
            trainer_stat_2_label: trainerStat2Label,
          }} 
        />
      </div>
    </AdminLayout>
  )
}
