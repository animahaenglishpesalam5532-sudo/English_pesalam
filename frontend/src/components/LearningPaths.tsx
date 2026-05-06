import React from "react";
import Link from "next/link";
import { FileText, Video, ArrowRight, Presentation } from "lucide-react";

export function LearningPaths() {
  type CardConfig = {
    title: string;
    description: string;
    icon: React.ReactNode;
    theme: string;
    bgImage?: string;
    gradient?: string;
    iconBg: string;
    buttonText: string;
    buttonClass: string;
    textDark?: boolean;
    customHeader?: React.ReactNode;
  };

  const cards: CardConfig[] = [
    {
      title: "Digital PDF Guide",
      description: "Portable learning on any device. Instant access after purchase.",
      icon: <FileText className="w-5 h-5 text-brand-blue" />,
      theme: "bg-transparent",
      bgImage: "url('/pdf-bg.png')",
      gradient: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.15) 50%, rgba(255,255,255,0.1) 100%)",
      iconBg: "bg-blue-100",
      buttonText: "View PDFs",
      buttonClass: "bg-white/50 backdrop-blur-md text-[#111827] border border-white/50 hover:bg-white/60",
      href: "/pdfs"
    },
    {
      title: "PPT Masterclass",
      description: "Visual summaries and presentation slides for visual learners.",
      icon: <Presentation className="w-5 h-5 text-[#2962FF]" />,
      theme: "bg-transparent",
      bgImage: "url('/ppt-bg.png')",
      gradient: "linear-gradient(135deg, rgba(217,190,169,0.4) 0%, rgba(236,220,207,0.3) 50%, rgba(255,255,255,0.1) 100%)",
      iconBg: "bg-white/50",
      buttonText: "View PPTs",
      buttonClass: "bg-white/50 backdrop-blur-md text-slate-800 border border-white/50 hover:bg-white/60",
      href: "/ppts"
    },
    {
      title: "Full Video Course",
      description:
        "15+ hours of step-by-step video instruction by experts in English Pesalam.",
      icon: <Video className="w-5 h-5 text-white" />,
      theme: "bg-transparent",
      gradient: "linear-gradient(135deg, rgba(86,73,232,1) 0%, rgba(99,102,241,0.95) 50%, rgba(139,92,246,0.9) 100%)",
      iconBg: "bg-white/20",
      buttonText: "Join Course",
      buttonClass: "bg-white/80 backdrop-blur-md text-[#5649E8] border border-white/50 hover:bg-white",
      textDark: false,
      href: "/video-courses"
    },
  ];

  return (
    <section
      id="paths"
      className="px-4 w-full max-w-md md:max-w-6xl mx-auto mb-8"
    >
      <h2 className="text-xl md:text-3xl font-bold text-[#111827] mb-4 md:mb-8 tracking-tight">
        Choose Your Learning Path
      </h2>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-white/30 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 relative overflow-hidden bg-cover bg-center flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_0_rgba(31,38,135,0.1)]`}
            style={
              card.bgImage
                ? { backgroundImage: card.bgImage }
                : undefined
            }
          >
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none rounded-[2rem]" />
            {/* Gradient overlay */}
            {card.gradient && (
              <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{ background: card.gradient }}
              />
            )}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/20 blur-2xl rounded-full z-0 pointer-events-none" />

            {card.customHeader ? (
              card.customHeader
            ) : (
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div
                  className={`p-2.5 rounded-2xl ${card.iconBg} mb-2 flex items-center justify-center`}
                >
                  {card.icon}
                </div>
                <Link
                  href=""
                  className={`flex items-center gap-1 text-xs font-semibold ${card.textDark === false
                    ? "text-white/80"
                    : "text-brand-blue"
                    }`}
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <h3
              className={`text-lg font-bold mb-1 relative z-10 ${card.textDark === false
                ? "text-white"
                : "text-[#111827]"
                }`}
            >
              {card.title}
            </h3>

            <p
              className={`text-sm leading-relaxed mb-6 relative z-10 ${card.textDark === false
                ? "text-white/80"
                : "text-slate-500"
                }`}
            >
              {card.description}
            </p>

            <Link
              href={card.href || ""}
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