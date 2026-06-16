import { GlassHeader } from "@/components/GlassHeader";
import { HeroSection } from "@/components/HeroSection";
import { BookSection } from "@/components/BookSection";
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
  
  const onlineClassTitle = await getSetting('online_class_title') || '1 Month Spoken English Online Course';
  const onlineClassDescription = await getSetting('online_class_description') || 'ஆங்கிலத்தில் பேச ஆரம்பிக்க இந்த 1 Month Spoken English Online Course உங்களுக்கு மிகவும் உதவியாக இருக்கும். இந்த ஒரு மாதத்தில் கற்றுக்கொடுக்கும் அனைத்து lessons-க்கும் PDF materials இலவசமாக வழங்கப்படும்.';
  const onlineClassPoint1 = await getSetting('online_class_point_1') || '1 Month Training';
  const onlineClassPoint2 = await getSetting('online_class_point_2') || 'Free PDF Materials';
  const onlineClassPoint3 = await getSetting('online_class_point_3') || 'குறைந்த மாணவர்கள் மட்டும்';
  const onlineClassPoint4 = await getSetting('online_class_point_4') || 'Direct WhatsApp Support';
  const onlineClassImageUrl = await getSetting('online_class_image_url') || '';
  const onlineClassPrice = await getSetting('online_class_price') || '₹999';
  const onlineClassOriginalPrice = await getSetting('online_class_original_price') || '₹1999';
  const onlineClassButtonText = await getSetting('online_class_button_text') || 'WhatsApp-ல் Course Details வாங்குங்கள்';

  // Fetch Hero and Trainer Settings
  const heroSubtitle = await getSetting('hero_subtitle') || '1M+ YOUTUBE FAMILY • TAMIL TO ENGLISH FOCUS';
  const heroTitle = await getSetting('hero_title') || 'தமிழ் பேசும் மக்களுக்கான Practical Spoken English Platform';
  const heroDescription = await getSetting('hero_description') || 'English தெரிந்தும் பேச முடியாமல் தவிக்கிறீர்களா? Simple Tamil explanation, daily use sentences, grammar patterns, vocabulary, pronunciation practice மூலம் English-ஐ confidence-ஆ பேச ஆரம்பிக்க English Pesalam உங்களுக்கு உதவும்.';
  
  const trainerName = await getSetting('trainer_name') || 'Maha JC';
  const trainerTitle = await getSetting('trainer_title') || 'Founder & Spoken English Trainer';
  const trainerImageUrl = await getSetting('trainer_image_url') || '';
  const trainerStat1Value = await getSetting('trainer_stat_1_value') || '1M+';
  const trainerStat1Label = await getSetting('trainer_stat_1_label') || 'Subscribers';
  const trainerStat2Value = await getSetting('trainer_stat_2_value') || '500+';
  const trainerStat2Label = await getSetting('trainer_stat_2_label') || 'Lessons';

  const quizzes = await getQuizzes();

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      <main className="flex flex-col gap-6 relative overflow-x-hidden pt-4 pb-10 z-10">
        <HeroSection 
          heroSubtitle={heroSubtitle}
          heroTitle={heroTitle}
          heroDescription={heroDescription}
          trainerName={trainerName}
          trainerTitle={trainerTitle}
          trainerImageUrl={trainerImageUrl}
          trainerStat1Value={trainerStat1Value}
          trainerStat1Label={trainerStat1Label}
          trainerStat2Value={trainerStat2Value}
          trainerStat2Label={trainerStat2Label}
        />
        <BookSection books={books} />
        <OnlineClassCard 
          whatsappNumber={whatsappNumber} 
          whatsappMessage={onlineClassText}
          title={onlineClassTitle}
          description={onlineClassDescription}
          point1={onlineClassPoint1}
          point2={onlineClassPoint2}
          point3={onlineClassPoint3}
          point4={onlineClassPoint4}
          imageUrl={onlineClassImageUrl}
          price={onlineClassPrice}
          originalPrice={onlineClassOriginalPrice}
          buttonText={onlineClassButtonText}
        />
        <LearningPaths />
        <HomeQuizzes quizzes={quizzes} />
        <BlogNavigationCard />
      </main>
      <Footer />
    </div>
  );
}
