import React from "react";
import Link from "next/link";
import { FileText, MonitorPlay, Video, ArrowRight } from "lucide-react";

export function LearningPaths() {
  const cards = [
    {
      title: "Digital PDF Guide",
      description: "Portable learning on any device. Instant access after purchase.",
      icon: <FileText className="w-5 h-5 text-brand-blue" />,
      theme: "bg-transparent",
      bgImage: "url('/pdf-bg.png')",
      iconBg: "bg-blue-100",
      buttonText: "Get Started",
      buttonClass: "bg-white text-[#111827]",
    },
    {
      title: "PPT Masterclass",
      description: "Visual summaries and presentation slides for visual learners.",
      icon: null,
      theme: "bg-transparent",
      bgImage: "url('/ppt-bg.png')",
      iconBg: "bg-transparent",
      buttonText: "Access Now",
      buttonClass: "bg-white text-slate-800",
      customHeader: (
        <div className="flex justify-between items-start mb-4 relative z-10 ">
          <div className="text-[26px] sm:text-3xl font-light text-[#2962FF] flex items-center tracking-widest font-sans uppercase whitespace-nowrap">
            <span className="material-symbols-outlined mx-[1px] text-[32px] sm:text-[38px]" style={{ fontVariationSettings: "'wght' 300" }}>presentation</span>
          </div>
          <Link href="/coming-soon" className="flex items-center gap-1 text-xs font-semibold text-[#2962FF] whitespace-nowrap ml-2 absolute -top-1 -right-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
    {
      title: "Full Video Course",
      description: "15+ hours of step-by-step video instruction by experts in English Peasalam.",
      icon: <Video className="w-5 h-5 text-white" />,
      theme: "bg-[#5649E8]",
      iconBg: "bg-white/20",
      buttonText: "Enroll Now",
      buttonClass: "bg-white text-[#5649E8]",
      textDark: false,
    },
  ];

  return (
    <section id="paths" className="px-4 w-full max-w-md md:max-w-6xl mx-auto mb-8">
      <h2 className="text-xl md:text-3xl font-bold text-[#111827] mb-4 md:mb-8 tracking-tight">
        Choose Your Learning Path
      </h2>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.theme} backdrop-blur-md rounded-3xl p-5 shadow-sm border border-white/50 relative overflow-hidden bg-cover bg-center flex flex-col h-full`}
            style={card.bgImage ? { backgroundImage: card.bgImage } : undefined}
          >
            {/* Soft decorative background pattern */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/20 blur-2xl rounded-full z-0 pointer-events-none" />

            {card.customHeader ? (
              card.customHeader
            ) : (
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-2xl ${card.iconBg} mb-2 flex items-center justify-center`}>
                  {card.icon}
                </div>
                <Link href="/coming-soon" className={`flex items-center gap-1 text-xs font-semibold ${card.textDark === false ? "text-white/80" : "text-brand-blue"}`}>
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <h3 className={`text-lg font-bold mb-1 relative z-10 ${card.textDark === false ? "text-white" : "text-[#111827]"}`}>
              {card.title}
            </h3>

            <p className={`text-sm leading-relaxed mb-6 relative z-10 ${card.textDark === false ? "text-white/80" : "text-slate-500"}`}>
              {card.description}
            </p>

            <Link
              href="/coming-soon"
              className={`block w-full text-center py-3 rounded-full font-bold text-sm shadow-sm transition-transform active:scale-95 relative z-10 mt-auto ${card.buttonClass}`}
            >
              {card.buttonText}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
