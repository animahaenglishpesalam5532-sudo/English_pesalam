import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GlassHeader } from "@/components/GlassHeader";
import { Footer } from "@/components/Footer";

export default function ComingSoon() {
  return (
    <>
      <GlassHeader />
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-lg border border-white/80 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-xl">
          <h1 className="text-3xl font-extrabold text-[#111827] mb-4">
            Coming Soon!
          </h1>
          <p className="text-slate-600 mb-8">
            We are working hard to build this feature. Please check back later!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5649E8] hover:bg-[#4338CA] text-white rounded-full font-semibold transition-all active:scale-95 w-full"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
