import { GlassHeader } from "@/components/GlassHeader";
import { HeroSection } from "@/components/HeroSection";
import { LearningPaths } from "@/components/LearningPaths";
import { BlogNavigationCard } from "@/components/BlogNavigationCard";
import { Footer } from "@/components/Footer";

export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className="bg-[#EAF0F6] min-h-screen">
      <GlassHeader />
      <main className="flex flex-col gap-6 relative overflow-x-hidden pt-4 pb-10">
        <HeroSection />
        <LearningPaths />
        <BlogNavigationCard />
      </main>
      <Footer />
    </div>
  );
}
