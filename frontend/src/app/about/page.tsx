import React from 'react';
import { GlassHeader } from "@/components/GlassHeader";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { AboutContent } from "@/components/AboutContent";

export const metadata = {
  title: "About Us - English Pesalam",
  description: "Learn about English Pesalam's mission to make English learning simple and practical for everyone.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      
      <main className="relative pt-24 md:pt-32 pb-10 z-10 overflow-x-hidden">
        <AboutContent />
      </main>

      <Footer />
    </div>
  );
}
