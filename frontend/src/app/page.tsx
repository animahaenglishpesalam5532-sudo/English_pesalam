import { GlassHeader } from "@/components/GlassHeader";
import { HeroSection } from "@/components/HeroSection";
import { BookSection } from "@/components/BookSection";
import { LearningPaths } from "@/components/LearningPaths";
import { BlogNavigationCard } from "@/components/BlogNavigationCard";
import { Footer } from "@/components/Footer";
import { getVisibleBooks } from "@/app/actions/books";
import { AmbientBackground } from "@/components/AmbientBackground";
import { OnlineClassCard } from "@/components/OnlineClassCard";
import { getSettings } from "@/app/actions/settings";
import { getQuizzes } from "@/app/actions/quiz";
import { HomeQuizzes } from "@/components/HomeQuizzes";

export const revalidate = 3600;

const SETTING_KEYS = [
  'online_class_whatsapp_number',
  'online_class_whatsapp_text',
  'online_class_title',
  'online_class_description',
  'online_class_point_1',
  'online_class_point_2',
  'online_class_point_3',
  'online_class_point_4',
  'online_class_image_url',
  'online_class_price',
  'online_class_original_price',
  'online_class_button_text',
  'hero_subtitle',
  'hero_title',
  'hero_description_line_1',
  'hero_description_line_2',
  'trainer_name',
  'trainer_title',
  'trainer_image_url',
  'trainer_stat_1_value',
  'trainer_stat_1_label',
  'trainer_stat_2_value',
  'trainer_stat_2_label',
];

export default async function Home() {
  // All three reads use the static (cookie-free) Supabase client so this page
  // stays ISR-cacheable. Admin saves call revalidatePath('/', 'layout'), which
  // purges the cache immediately, so edits still show up straight away.
  const [books, settings, quizzes] = await Promise.all([
    getVisibleBooks(true),
    getSettings(SETTING_KEYS, true),
    getQuizzes(true),
  ]);

  const onlineClassWhatsapp = settings?.online_class_whatsapp_number || '6380513228';
  const onlineClassText = settings?.online_class_whatsapp_text || 'I want to join online class';

  const onlineClassTitle = settings?.online_class_title || '1 Month Spoken English Online Course';
  const onlineClassDescription = settings?.online_class_description || 'ஆங்கிலத்தில் பேச ஆரம்பிக்க இந்த 1 Month Spoken English Online Course உங்களுக்கு மிகவும் உதவியாக இருக்கும். இந்த ஒரு மாதத்தில் கற்றுக்கொடுக்கும் அனைத்து lessons-க்கும் PDF materials இலவசமாக வழங்கப்படும்.';
  const onlineClassPoint1 = settings?.online_class_point_1 || '1 Month Training';
  const onlineClassPoint2 = settings?.online_class_point_2 || 'Free PDF Materials';
  const onlineClassPoint3 = settings?.online_class_point_3 || 'குறைந்த மாணவர்கள் மட்டும்';
  const onlineClassPoint4 = settings?.online_class_point_4 || 'Direct WhatsApp Support';
  const onlineClassImageUrl = settings?.online_class_image_url || '';
  const onlineClassPrice = settings?.online_class_price || '₹999';
  const onlineClassOriginalPrice = settings?.online_class_original_price || '₹1999';
  const onlineClassButtonText = settings?.online_class_button_text || 'WhatsApp-ல் Course Details வாங்குங்கள்';

  // Hero and Trainer settings
  const heroSubtitle = settings?.hero_subtitle || '1M+ YOUTUBE FAMILY • TAMIL TO ENGLISH FOCUS';
  const heroTitle = settings?.hero_title || 'தமிழ் பேசும் மக்களுக்கான Practical Spoken English Platform';
  const heroDescriptionLine1 = settings?.hero_description_line_1 || 'English தெரிந்தும் பேச முடியாமல் தவிக்கிறீர்களா?';
  const heroDescriptionLine2 = settings?.hero_description_line_2 || 'Simple Tamil explanation, daily use sentences, grammar patterns, vocabulary, pronunciation practice மூலம் English-ஐ confidence-ஆ பேச ஆரம்பிக்க English Pesalam உங்களுக்கு உதவும்.';

  const trainerName = settings?.trainer_name || 'Maha JC';
  const trainerTitle = settings?.trainer_title || 'Founder & Spoken English Trainer';
  const trainerImageUrl = settings?.trainer_image_url || '';
  const trainerStat1Value = settings?.trainer_stat_1_value || '1M+';
  const trainerStat1Label = settings?.trainer_stat_1_label || 'Subscribers';
  const trainerStat2Value = settings?.trainer_stat_2_value || '500+';
  const trainerStat2Label = settings?.trainer_stat_2_label || 'Lessons';

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      <main className="flex flex-col gap-6 relative overflow-x-hidden pt-4 pb-10 z-10">
        <HeroSection
          heroSubtitle={heroSubtitle}
          heroTitle={heroTitle}
          heroDescriptionLine1={heroDescriptionLine1}
          heroDescriptionLine2={heroDescriptionLine2}
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
          whatsappNumber={onlineClassWhatsapp}
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
