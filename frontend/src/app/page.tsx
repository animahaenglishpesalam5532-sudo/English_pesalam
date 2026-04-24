import { GlassHeader } from "@/components/GlassHeader";
import { HeroSection } from "@/components/HeroSection";
import { LearningPaths } from "@/components/LearningPaths";
import { BlogNavigationCard } from "@/components/BlogNavigationCard";
import { Footer } from "@/components/Footer";
import { getVisibleBooks } from "@/app/actions/books";
import { AmbientBackground } from "@/components/AmbientBackground";

export const revalidate = 3600;

export default async function Home() {
  const books = await getVisibleBooks(true);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      <main className="flex flex-col gap-6 relative overflow-x-hidden pt-4 pb-10 z-10">
        <HeroSection books={books} />
        <LearningPaths />
        <BlogNavigationCard />
      </main>
      <Footer />
    </div>
  );
}
