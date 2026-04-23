import { GlassHeader } from "@/components/GlassHeader";
import { HeroSection } from "@/components/HeroSection";
import { LearningPaths } from "@/components/LearningPaths";
import { BlogNavigationCard } from "@/components/BlogNavigationCard";
import { Footer } from "@/components/Footer";
import { getSetting } from "@/app/actions/settings";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const bookTitle1 = await getSetting('book_title_1');
  const bookTitle2 = await getSetting('book_title_2');
  const bookDescription = await getSetting('book_description');
  const bookPrice = await getSetting('book_price');
  const bookStrikethroughPrice = await getSetting('book_strikethrough_price');
  const bookImageUrl = await getSetting('book_image_url');
  const whatsappNumber = await getSetting('whatsapp_number');
  const whatsappMessage = await getSetting('whatsapp_message');

  return (
    <div className="bg-[#EAF0F6] min-h-screen">
      <GlassHeader />
      <main className="flex flex-col gap-6 relative overflow-x-hidden pt-4 pb-10">
        <HeroSection 
          bookTitle1={bookTitle1}
          bookTitle2={bookTitle2}
          bookDescription={bookDescription}
          bookPrice={bookPrice}
          bookStrikethroughPrice={bookStrikethroughPrice}
          bookImageUrl={bookImageUrl}
          whatsappNumber={whatsappNumber}
          whatsappMessage={whatsappMessage}
        />
        <LearningPaths />
        <BlogNavigationCard />
      </main>
      <Footer />
    </div>
  );
}
