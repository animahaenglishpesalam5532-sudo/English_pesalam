import { GlassHeader } from "@/components/GlassHeader";
import { HeroSection } from "@/components/HeroSection";
import { LearningPaths } from "@/components/LearningPaths";
import { BlogNavigationCard } from "@/components/BlogNavigationCard";
import { Footer } from "@/components/Footer";
import { getVisibleBooks } from "@/app/actions/books";
import { AmbientBackground } from "@/components/AmbientBackground";
import { OnlineClassCard } from "@/components/OnlineClassCard";
import { getSetting } from "@/app/actions/settings";
import { getQuizzes } from "@/app/actions/quiz";
import { HomeQuizzes } from "@/components/HomeQuizzes";

export const revalidate = 3600;

export default async function Home() {
  const books = await getVisibleBooks(true);
  const whatsappNumber = await getSetting('contact_phone') || '919345639627';
  const onlineClassText = await getSetting('online_class_whatsapp_text') || 'I want to join online class';
  const quizzes = await getQuizzes();

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      <main className="flex flex-col gap-6 relative overflow-x-hidden pt-4 pb-10 z-10">
        <HeroSection books={books} />
        <OnlineClassCard whatsappNumber={whatsappNumber} whatsappMessage={onlineClassText} />
        <LearningPaths />
        <HomeQuizzes quizzes={quizzes} />
        <BlogNavigationCard />
      </main>
      <Footer />
    </div>
  );
}
