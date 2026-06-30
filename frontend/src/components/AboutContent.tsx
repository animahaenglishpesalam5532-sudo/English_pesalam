"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  MessageCircle, 
  Trophy, 
  Mail, 
  GraduationCap, 
  PhoneCall, 
  FileText, 
  Video, 
  Sparkles 
} from 'lucide-react';

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 0 1 1.772 1.153 4.902 4.902 0 0 1 1.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 0 1-1.772-1.153 4.902 4.902 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 0 1 1.772-1.153 4.902 4.902 0 0 1 1.153 1.772A4.902 4.902 0 0 1 5.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 1.802a3.333 3.333 0 1 0 0 6.666 3.333 3.333 0 0 0 0-6.666zm5.338-3.205a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" clipRule="evenodd" />
  </svg>
);

interface AboutContentProps {
  tagline: string
  title: string
  description1: string
  description2: string
  description3: string
  description4: string
  trainerName: string
  trainerTitle: string
  trainerBio1: string
  trainerBio2: string
  trainerBio3: string
  visionStatement: string
  visionDesc1: string
  visionDesc2: string
  visionDesc3: string
  whatWeTeach: string
  whyEnglishPesalam: string
  whatYouWillGet: string
  ourImpact: string
}

export function AboutContent({
  tagline,
  title,
  description1,
  description2,
  description3,
  description4,
  trainerName,
  trainerTitle,
  trainerBio1,
  trainerBio2,
  trainerBio3,
  visionStatement,
  visionDesc1,
  visionDesc2,
  visionDesc3,
  whatWeTeach,
  whyEnglishPesalam,
  whatYouWillGet,
  ourImpact
}: AboutContentProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  interface TopicItem {
    title: string;
    desc: string;
  }

  interface FeatureItem {
    title: string;
    desc: string;
  }

  interface ImpactItem {
    val: string;
    label: string;
    desc: string;
  }

  // Safe JSON Parsing helper
  const parseJson = (jsonStr: string, fallback: string) => {
    try {
      return JSON.parse(jsonStr || fallback);
    } catch {
      try {
        return JSON.parse(fallback);
      } catch {
        return [];
      }
    }
  };

  const topics = parseJson(whatWeTeach, '[]') as TopicItem[];
  const featuresRaw = parseJson(whyEnglishPesalam, '[]') as FeatureItem[];
  const benefits = parseJson(whatYouWillGet, '[]') as string[];
  const impacts = parseJson(ourImpact, '[]') as ImpactItem[];

  // Style rotation for dynamic features
  const featureStyles = [
    { icon: <MessageCircle className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50 border-blue-100" },
    { icon: <Target className="w-6 h-6 text-rose-600" />, bg: "bg-rose-50 border-rose-100" },
    { icon: <Users className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100" },
    { icon: <Trophy className="w-6 h-6 text-amber-600" />, bg: "bg-amber-50 border-amber-100" },
    { icon: <Sparkles className="w-6 h-6 text-indigo-600" />, bg: "bg-indigo-50 border-indigo-100" }
  ];

  const features = featuresRaw.map((feat, idx) => {
    const style = featureStyles[idx % featureStyles.length];
    return {
      ...feat,
      icon: style.icon,
      bg: style.bg
    };
  });

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${targetId === 'online-class' ? '#online-class' : ''}`;
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. About English Pesalam */}
      <section className="max-w-4xl mx-auto text-center px-6">
        <motion.div {...fadeIn}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs md:text-sm font-semibold mb-6 border border-blue-100 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>{tagline}</span>
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black text-[#0B256B] mb-8 tracking-tight leading-tight">
            {title}
          </h1>
          
          <div className="space-y-6 text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto text-left md:text-center">
            {description1 && (
              <p className="font-extrabold text-[#0B256B] text-lg md:text-xl border-l-4 md:border-l-0 md:border-y border-blue-100 py-3 pl-4 md:pl-0">
                {description1}
              </p>
            )}
            {description2 && <p>{description2}</p>}
            {description3 && <p>{description3}</p>}
            {description4 && (
              <p className="font-semibold text-slate-800">
                English Pesalam-ன் main goal simple: <span className="text-[#2563EB]">{description4}</span>
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* 2. About the Trainer */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div {...fadeIn} className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br from-blue-100 via-white to-blue-200 p-2 shadow-xl border border-blue-100">
              <div className="relative bg-white/90 rounded-[2.2rem] p-8 overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full" />
                <div className="p-5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 mb-6">
                  <GraduationCap className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-black text-[#0B256B] mb-2">{trainerName}</h3>
                <p className="text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full">
                  {trainerTitle}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 w-full border-t border-slate-100 pt-6">
                  <div>
                    <p className="text-2xl font-extrabold text-[#0B256B]">1M+</p>
                    <p className="text-xs text-slate-400 font-medium uppercase">Subscribers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#0B256B]">500+</p>
                    <p className="text-xs text-slate-400 font-medium uppercase">Lessons</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div {...fadeIn} className="lg:col-span-7 space-y-6">
            <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
              Your Guide & Instructor
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0B256B] tracking-tight">About the Trainer</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              {trainerBio1 && <p>{trainerBio1}</p>}
              {trainerBio2 && <p>{trainerBio2}</p>}
              {trainerBio3 && (
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl font-semibold text-slate-700 italic">
                  {trainerBio3}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. What We Teach */}
      {topics.length > 0 && (
        <section className="max-w-6xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur-3xl border border-blue-100 rounded-[3rem] p-8 md:p-14 shadow-xl shadow-blue-900/5">
            <motion.div {...fadeIn} className="text-center mb-12">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                Curriculum & Topics
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0B256B] tracking-tight mt-3 mb-4">What We Teach</h2>
              <p className="text-sm md:text-base text-slate-500">English Pesalam-ல் நீங்கள் கற்றுக்கொள்ளக்கூடிய முக்கியமான topics:</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {topics.map((topic, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group"
                >
                  <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 mt-1 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {topic.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {topic.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Why English Pesalam? */}
      {features.length > 0 && (
        <section className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeIn} className="text-center mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Our Core Strengths
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0B256B] tracking-tight mt-3 mb-4">Why English Pesalam?</h2>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              நம்ம channel grammar மட்டும் teach பண்ணாது — real-life-ல் English confidently பேச உதவும் communication skills-ஐ develop பண்ண உதவும்.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="p-8 rounded-[2rem] bg-white border border-slate-150 shadow-md shadow-slate-100/50 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
              >
                <div className={`mb-6 p-4 rounded-2xl w-fit border ${feature.bg}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-[#0B256B] mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm md:text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 6. What You Will Get */}
      {benefits.length > 0 && (
        <section className="max-w-4xl mx-auto px-6">
          <div className="bg-white/80 border border-blue-100 rounded-[3rem] p-8 md:p-12 shadow-xl shadow-blue-900/5">
            <motion.div {...fadeIn} className="text-center mb-10">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                Student Value
              </span>
              <h2 className="text-3xl font-black text-[#0B256B] mt-3 mb-3">What You Will Get from English Pesalam</h2>
              <p className="text-sm text-slate-500">English Pesalam-ஐ follow பண்ணினால்:</p>
            </motion.div>

            <div className="space-y-4">
              {benefits.map((benefit: string, i: number) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex-shrink-0 mt-0.5 p-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-slate-700 text-sm md:text-base font-semibold">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Our Vision */}
      <section className="max-w-6xl mx-auto px-4">
        <motion.div 
          {...fadeIn}
          className="relative rounded-[3rem] bg-gradient-to-r from-blue-700 to-indigo-900 p-8 md:p-16 overflow-hidden text-center text-white shadow-xl shadow-blue-900/10"
        >
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="p-3.5 w-fit rounded-2xl bg-white/10 border border-white/20 mb-8 mx-auto shadow-inner">
              <Target className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6">Our Vision</h2>
            {visionStatement && (
              <p className="text-xl md:text-2xl text-yellow-300 font-extrabold mb-8 tracking-wide">
                “{visionStatement}”
              </p>
            )}
            <div className="space-y-4 text-indigo-100/90 text-sm md:text-base leading-relaxed">
              {visionDesc1 && <p>{visionDesc1}</p>}
              {visionDesc2 && <p>{visionDesc2}</p>}
              {visionDesc3 && (
                <p className="text-white font-bold bg-white/10 border border-white/10 px-6 py-3 rounded-2xl inline-block mt-4">
                  {visionDesc3}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 8. Our Impact */}
      {impacts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[3.5rem] bg-[#090C21] p-8 md:p-16 text-center shadow-2xl">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-bold mb-8 backdrop-blur-md text-xs md:text-sm">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Our Impact</span>
              </div>

              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-10 tracking-wide leading-tight">
                10 லட்சம் பேரின் நம்பிக்கையை வென்ற <br className="hidden md:block" />
                <span className="text-blue-400">தமிழகத்தின் மாபெரும் ஆங்கிலக் கற்றல் தளம்!</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12 border-t border-white/10 pt-12">
                {impacts.map((imp, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <p className="text-3xl md:text-4xl font-black text-white mb-2">{imp.val}</p>
                    <p className="text-blue-400 font-bold text-sm tracking-wide mb-2 uppercase">{imp.label}</p>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{imp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. Join Our Learning Family */}
      <section className="max-w-4xl mx-auto px-6">
        <motion.div 
          {...fadeIn}
          className="p-8 md:p-14 rounded-[2.5rem] bg-white border border-blue-100 shadow-xl shadow-blue-900/5 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/20" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-[#0B256B] mb-6">Join Our Learning Family</h2>
            
            <div className="max-w-2xl mx-auto space-y-2 mb-8 text-slate-600 font-medium text-sm md:text-base">
              <p>• English பேச கற்றுக்கொள்ள வேண்டும் என்று நினைக்கிறீர்களா?</p>
              <p>• Confidence-ஆ communicate பண்ண வேண்டும் என்று ஆசையா?</p>
              <p>• Career, studies, personal growth-க்கு English improve பண்ண வேண்டுமா?</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 font-bold text-blue-600 mb-8 bg-blue-50/60 border border-blue-100/50 py-3.5 px-6 rounded-2xl w-fit mx-auto text-xs md:text-sm">
              <span>Learn Easy • Speak Confidently • Grow Successfully</span>
            </div>

            <h3 className="text-lg md:text-xl font-extrabold text-[#0B256B] mb-8">
              Start your English learning journey with English Pesalam today.
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              <a 
                href="https://www.youtube.com/@English-pesalam" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-full font-bold text-sm md:text-base shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all hover:scale-[1.02]"
              >
                <YoutubeIcon className="w-5 h-5" />
                Start Learning on YouTube
              </a>
              
              <a 
                href="#online-class"
                onClick={(e) => handleSmoothScroll(e, 'online-class')}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-full font-bold text-sm md:text-base shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all hover:scale-[1.02]"
              >
                <PhoneCall className="w-5 h-5" />
                Join WhatsApp Class
              </a>

              <a 
                href="/pdfs" 
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-full font-bold text-sm md:text-base shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02]"
              >
                <FileText className="w-5 h-5" />
                Download PDF Guides
              </a>

              <a 
                href="/video-courses" 
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-full font-bold text-sm md:text-base shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
              >
                <Video className="w-5 h-5" />
                Explore Video Course
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 10. Contact English Pesalam */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <motion.div {...fadeIn}>
          <h2 className="text-3xl font-black text-[#0B256B] mb-4">Contact English Pesalam</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            உங்களுக்கு questions இருந்தால் WhatsApp அல்லது Email மூலம் contact பண்ணலாம்.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Email Contact Card */}
            <a 
              href="mailto:englishpesalam11@gmail.com"
              className="p-6 rounded-2xl bg-white border border-slate-150 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all flex flex-col items-center group"
            >
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">Email Us</span>
              <span className="text-xs text-slate-400 mt-2 truncate w-full">englishpesalam11@gmail.com</span>
            </a>

            {/* YouTube Contact Card */}
            <a 
              href="https://www.youtube.com/@English-pesalam"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-white border border-slate-150 hover:border-red-100 hover:shadow-lg hover:shadow-red-900/5 transition-all flex flex-col items-center group"
            >
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 mb-4 group-hover:scale-110 transition-transform">
                <YoutubeIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">YouTube</span>
              <span className="text-xs text-slate-400 mt-2">@English-pesalam</span>
            </a>

            {/* Instagram Contact Card */}
            <a 
              href="https://instagram.com/englishpesalam"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-white border border-slate-150 hover:border-pink-100 hover:shadow-lg hover:shadow-pink-900/5 transition-all flex flex-col items-center group"
            >
              <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 mb-4 group-hover:scale-110 transition-transform">
                <InstagramIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">Instagram</span>
              <span className="text-xs text-slate-400 mt-2">@englishpesalam</span>
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
