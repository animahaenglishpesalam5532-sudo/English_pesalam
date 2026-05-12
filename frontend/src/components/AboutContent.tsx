"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  MessageCircle, 
  BookOpen, 
  Trophy, 
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function AboutContent() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const topics = [
    "Spoken English for beginners",
    "Daily use English conversations",
    "Easy English grammar",
    "Vocabulary building",
    "Pronunciation improvement",
    "Interview preparation",
    "Workplace communication",
    "Tamil to English translation practice",
    "Public speaking confidence",
    "Common English mistakes & corrections"
  ];

  const features = [
    {
      title: "Easy Tamil Explanation",
      description: "Complex concepts explained in simple Tamil for better understanding.",
      icon: <MessageCircle className="w-6 h-6 text-indigo-500" />
    },
    {
      title: "Practical Focus",
      description: "Real-life situations focused lessons that you can use immediately.",
      icon: <Target className="w-6 h-6 text-rose-500" />
    },
    {
      title: "Beginner Friendly",
      description: "Designed for those starting from scratch with step-by-step guidance.",
      icon: <Users className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "Confident Growth",
      description: "Removing the fear of English and building your speaking confidence.",
      icon: <Trophy className="w-6 h-6 text-amber-500" />
    }
  ];

  return (
    <>
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-20 px-6">
          <motion.div {...fadeIn}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-6 border border-indigo-100">
              <Sparkles className="w-4 h-4" />
              <span>Learn Easy. Speak Confidently.</span>
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
                English Pesalam
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              English learning-ஐ simple, practical, and confident ஆக மாற்ற உருவாக்கப்பட்ட ஒரு learning platform.
            </p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="max-w-6xl mx-auto mb-24 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn} className="space-y-6">
              <div className="p-3 w-fit rounded-2xl bg-rose-50 text-rose-500">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                நம்முடைய mission என்னனா, English பேச பயப்படுற Tamil learners எல்லாருக்கும் easy-ஆ, understandable-ஆ, real-life examples மூலம் English கற்றுக்கொடுக்க வேண்டும் என்பதுதான்.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                English Pesalam channel-ல், beginners இருந்து intermediate learners வரை எல்லாரும் easy-ஆ follow பண்ணக்கூடிய lessons and communication practice videos regularly upload பண்ணப்படுகின்றன.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-indigo-100 flex items-center justify-center border border-white/50"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10" />
               <BookOpen className="w-24 h-24 text-indigo-400 opacity-50" />
               <div className="absolute inset-0 backdrop-blur-[2px]" />
               <div className="relative z-10 text-center p-8">
                  <p className="text-indigo-900 font-bold text-2xl italic">"English நாமலும் பேசலாம்"</p>
               </div>
            </motion.div>
          </div>
        </section>

        {/* What We Teach */}
        <section className="max-w-6xl mx-auto mb-24 px-6">
          <div className="bg-white/40 backdrop-blur-2xl border border-white/50 rounded-[3rem] p-8 md:p-16 shadow-xl shadow-slate-200/50">
            <motion.div {...fadeIn} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">What We Teach</h2>
              <p className="text-lg text-slate-500">நம்ம channel-ல் நீங்கள் கற்றுக்கொள்ளக்கூடிய முக்கியமான topics</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-white/50 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-slate-700 font-medium group-hover:text-indigo-600 transition-colors">{topic}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why English Pesalam? */}
        <section className="max-w-6xl mx-auto mb-24 px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Why English Pesalam?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              நம்ம channel grammar மட்டும் teach பண்ணாது — real-life-ல் English confidently பேச உதவும் communication skills-ஐ develop பண்ண உதவும்.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-white/40 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="mb-6 p-4 rounded-2xl bg-white w-fit shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Vision Section */}
        <section className="max-w-6xl mx-auto mb-24 px-4">
          <motion.div 
            {...fadeIn}
            className="relative rounded-[3rem] bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 md:p-16 overflow-hidden text-center text-white"
          >
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="p-3 w-fit rounded-2xl bg-white/10 mb-8 mx-auto">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-8">Our Vision</h2>
              <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed mb-8">
                “Everyone should speak English with confidence.”
              </p>
              <p className="text-lg text-indigo-100/80 leading-relaxed">
                பல பேருக்கு English பேசணும் என்ற ஆசை இருக்கும், ஆனா fear, hesitation, அல்லது confidence இல்லாமலே நிறுத்திக்கொள்வார்கள். அந்த fear-ஐ remove பண்ணி, <span className="text-white font-bold">“English நாமலும் பேசலாம்”</span> என்ற confidence உருவாக்குவது தான் English Pesalam-ன் முக்கிய நோக்கம்.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Community Section - Re-designed for 1M+ */}
        <section className="max-w-6xl mx-auto mb-24 px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-8 md:p-20 text-center shadow-2xl"
          >
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-bold mb-8 backdrop-blur-md"
              >
                <Sparkles className="w-5 h-5" />
                <span>Our Impact</span>
              </motion.div>

              <div className="mb-12 relative inline-block">
                <motion.h2 
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-2"
                >
                  1,000,000+
                </motion.h2>
                <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl -z-10 rounded-full" />
                <p className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                  ஆங்கிலம் பயில்பவர்கள்!
                </p>
              </div>

              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
                10 லட்சம் பேரின் நம்பிக்கையை வென்ற <br className="hidden md:block" />
                <span className="text-indigo-400">தமிழகத்தின் மாபெரும் ஆங்கிலக் கற்றல் தளம்!</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16 border-t border-white/10 pt-16">
                <div>
                  <p className="text-4xl font-black text-white mb-2">1M+</p>
                  <p className="text-slate-400 font-medium">Subscribers on YouTube</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white mb-2">500+</p>
                  <p className="text-slate-400 font-medium">Detailed Lessons</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white mb-2">100%</p>
                  <p className="text-slate-400 font-medium">Tamil-to-English Focus</p>
                </div>
              </div>

              <p className="mt-16 text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto italic">
                "English Pesalam என்பது வெறும் YouTube சேனல் அல்ல, இது ஒரு தலைமுறையின் கனவுகளை நனவாக்கும் ஒரு மாபெரும் கற்றல் களம்."
              </p>
            </div>
          </motion.div>
        </section>

        {/* Join Us Section */}
        <section className="max-w-4xl mx-auto px-6">
          <motion.div 
            {...fadeIn}
            className="p-12 rounded-[2.5rem] bg-white border border-indigo-100 shadow-xl shadow-indigo-500/5 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/30" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Join Our Family</h2>
              <p className="text-lg text-slate-600 mb-10">
                English பேச கற்றுக்கொள்ள வேண்டும்... Confidence-ஆ communicate பண்ண வேண்டும்... Career மற்றும் personal growth improve பண்ண வேண்டும்...
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 font-bold text-indigo-600 mb-10">
                <span>Learn Easy.</span>
                <span className="hidden md:inline">•</span>
                <span>Speak Confidently.</span>
                <span className="hidden md:inline">•</span>
                <span>Grow Successfully.</span>
              </div>
              <a 
                href="https://youtube.com/@EnglishPesalam" 
                target="_blank" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:scale-105"
              >
                Join Us on YouTube
                <ArrowRight className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        </section>
    </>
  );
}
