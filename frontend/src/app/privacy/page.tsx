import React from 'react'
import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { AmbientBackground } from "@/components/AmbientBackground"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Privacy Policy - English Pesalam",
  description: "How English Pesalam collects, uses and protects your personal information, including WhatsApp messaging.",
}

const CONTACT_EMAIL = 'englishpesalam11@gmail.com'
const LAST_UPDATED = '18 August 2026'

const sections: Array<{ heading: string; paragraphs?: string[]; bullets?: string[] }> = [
  {
    heading: 'Who we are',
    paragraphs: [
      'English Pesalam is a spoken English learning platform for Tamil speakers. We publish lessons, digital guides, online classes and books through this website and our WhatsApp channel.',
      `This policy explains what information we collect, why we collect it, and what you can do about it. If anything here is unclear, write to us at ${CONTACT_EMAIL}.`,
    ],
  },
  {
    heading: 'Information we collect',
    bullets: [
      'Contact details you give us — your name, phone number and email address when you enquire, place an order, or register for a class.',
      'Order and delivery details — the books or digital products you buy and the information needed to deliver them.',
      'Messages you send us — the content of WhatsApp messages, form submissions and emails you send to us.',
      'Basic usage data — pages visited and general analytics, collected automatically so we can improve the site.',
    ],
  },
  {
    heading: 'How we use your information',
    bullets: [
      'To reply to your enquiries and provide customer support.',
      'To process, confirm and deliver your orders.',
      'To send you updates about our books, classes and learning material, where you have contacted us or asked to hear from us.',
      'To improve our lessons, products and website.',
    ],
  },
  {
    heading: 'WhatsApp messaging',
    paragraphs: [
      'We use the WhatsApp Business Platform (WhatsApp Cloud API, provided by Meta) to communicate with learners and customers.',
      'When you message our WhatsApp number, we receive your phone number, your WhatsApp profile name and the content of your message. We use this only to reply to you, to process your order, and to send you information about our books and classes.',
      'Messages sent through WhatsApp are also handled by Meta under its own privacy policy. We do not sell your phone number or share it with advertisers.',
      `You can stop receiving messages from us at any time by replying STOP on WhatsApp or emailing ${CONTACT_EMAIL}. We will remove your number from our messaging list.`,
    ],
  },
  {
    heading: 'Sharing your information',
    paragraphs: [
      'We do not sell your personal information. We share it only where it is necessary to run the service:',
    ],
    bullets: [
      'Service providers that host our website, store our data and deliver our messages, such as Vercel, Supabase and Meta.',
      'Delivery partners, where we need to ship a physical book to you.',
      'Authorities, where we are required to do so by law.',
    ],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'We keep your information only for as long as we need it — to fulfil your order, to answer your questions, and to meet our legal and accounting obligations. After that it is deleted or anonymised.',
    ],
  },
  {
    heading: 'Your choices',
    bullets: [
      'You can ask us what personal information we hold about you.',
      'You can ask us to correct information that is wrong.',
      'You can ask us to delete your information, unless we are required to keep it.',
      'You can opt out of our WhatsApp and email updates at any time.',
    ],
    paragraphs: [
      `To make any of these requests, email ${CONTACT_EMAIL} from the address or with the phone number you gave us, and we will respond within a reasonable time.`,
    ],
  },
  {
    heading: 'Cookies and analytics',
    paragraphs: [
      'Our website uses cookies and similar technologies to keep the site working and to understand how it is used. You can block or delete cookies in your browser settings, though some parts of the site may not work as well.',
    ],
  },
  {
    heading: "Children's privacy",
    paragraphs: [
      'Our lessons are suitable for school and college students, but we do not knowingly collect personal information from children under 13 without the involvement of a parent or guardian. If you believe a child has given us their information, contact us and we will remove it.',
    ],
  },
  {
    heading: 'Security',
    paragraphs: [
      'We take reasonable technical and organisational measures to protect your information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. When we do, we will change the "Last updated" date at the top of this page.',
    ],
  },
  {
    heading: 'Contact us',
    paragraphs: [
      `If you have any questions about this privacy policy or about how we handle your information, email us at ${CONTACT_EMAIL}.`,
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />

      <main className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/50 backdrop-blur-md rounded-full text-indigo-600 border border-indigo-100 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Privacy <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-slate-600 text-sm">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="space-y-10">
            {sections?.map((section) => (
              <section key={section?.heading} className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">{section?.heading}</h2>

                {section?.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-slate-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {section?.bullets?.length ? (
                  <ul className="list-disc pl-6 space-y-2 text-slate-600 leading-relaxed">
                    {section?.bullets?.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
