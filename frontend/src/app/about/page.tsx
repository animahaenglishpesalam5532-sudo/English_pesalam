import React from 'react';
import { GlassHeader } from "@/components/GlassHeader";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { AboutContent } from "@/components/AboutContent";
import { getSetting } from '@/app/actions/settings';

export const metadata = {
  title: "About Us - English Pesalam",
  description: "Learn about English Pesalam's mission to make English learning simple and practical for everyone.",
};

export const revalidate = 0;

export default async function AboutPage() {
  // Fetch About page settings with default fallbacks
  const tagline = await getSetting('about_tagline') || 'Learn Easy • Speak Confidently • Grow Successfully';
  const title = await getSetting('about_title') || 'About English Pesalam';
  
  const description1 = await getSetting('about_description_1') || 'English தெரிந்தும் பேச முடியாமல் தவிக்கும் தமிழ் பேசும் மக்களுக்காக உருவாக்கப்பட்ட practical Spoken English learning platform தான் English Pesalam.';
  const description2 = await getSetting('about_description_2') || 'நிறைய பேருக்கு English words தெரியும். Grammar-ம் கொஞ்சம் தெரியும். ஆனாலும் யாரிடமாவது English பேச வேண்டிய நேரம் வந்தால் பயம், hesitation, confidence இல்லாமை காரணமாக பேச முடியாமல் நின்றுவிடுகிறார்கள்.';
  const description3 = await getSetting('about_description_3') || 'அந்த பயத்தை remove பண்ணி, simple Tamil explanation மூலமாக daily life English-ஐ step-by-step கற்றுக்கொடுக்க English Pesalam உருவாக்கப்பட்டது.';
  const description4 = await getSetting('about_description_4') || 'தமிழ் பேசும் மக்கள் English-ஐ கஷ்டமான subject மாதிரி இல்லாமல், நாள் தோறும் பேசக்கூடிய ஒரு simple communication skill ஆக கற்றுக்கொள்ள வேண்டும்.';

  const trainerName = await getSetting('about_trainer_name') || 'Maha JC';
  const trainerTitle = await getSetting('about_trainer_title') || 'Founder & Spoken English Trainer';
  
  const trainerBio1 = await getSetting('about_trainer_bio_1') || 'நான் Maha JC, English Pesalam மூலம் தமிழ் பேசும் மக்களுக்கு Spoken English-ஐ simple-ஆவும் practical-ஆவும் கற்றுக்கொடுத்து வருகிறேன்.';
  const trainerBio2 = await getSetting('about_trainer_bio_2') || 'என்னுடைய teaching style என்னவென்றால், கஷ்டமான grammar rules-ஐ மட்டும் சொல்லாமல், real life-ல் எப்படி English பேச வேண்டும் என்பதை Tamil explanation மூலமாக step-by-step கற்றுக்கொடுப்பது.';
  const trainerBio3 = await getSetting('about_trainer_bio_3') || 'School students, college students, job seekers, working people, homemakers — யாராக இருந்தாலும், “நானும் English பேச முடியும்” என்ற confidence உருவாக்குவதே English Pesalam-ன் முக்கிய நோக்கம்.';

  const visionStatement = await getSetting('about_vision_statement') || 'Every Tamil learner should speak English with confidence.';
  const visionDesc1 = await getSetting('about_vision_desc_1') || 'பல பேருக்கு English பேசணும் என்ற ஆசை இருக்கும். ஆனால் fear, hesitation, confidence இல்லாமை காரணமாக அவர்கள் பேச முயற்சி செய்யாமல் நிறுத்திக் கொள்கிறார்கள்.';
  const visionDesc2 = await getSetting('about_vision_desc_2') || 'அந்த fear-ஐ remove பண்ணி, “English நாமும் பேசலாம்” என்ற நம்பிக்கையை உருவாக்குவதே English Pesalam-ன் vision.';
  const visionDesc3 = await getSetting('about_vision_desc_3') || 'English Pesalam என்பது வெறும் YouTube channel மட்டும் அல்ல. இது தமிழ் பேசும் மக்களுக்கு English confidence கொடுக்கும் ஒரு learning family.';

  // Default values for arrays (stored as JSON string)
  const defaultWhatWeTeach = [
    { title: "Spoken English for Beginners", desc: "English பேச ஆரம்பிக்க தேவையான basic lessons." },
    { title: "Daily Use English Sentences", desc: "வீடு, school, college, office, travel, shopping போன்ற daily life situations-க்கு useful ஆன sentences." },
    { title: "Easy English Grammar", desc: "Grammar-ஐ கஷ்டமில்லாமல் Tamil explanation மூலம் easy-ஆ புரிய வைக்கும் lessons." },
    { title: "Tamil to English Translation Practice", desc: "Tamil-ல யோசிக்கும் sentences-ஐ English-ல் எப்படி சொல்ல வேண்டும் என்பதற்கான practice." },
    { title: "Vocabulary with Tamil Meaning", desc: "Daily life-ல் அதிகம் பயன்படுத்தப்படும் English words with Tamil meaning." },
    { title: "Pronunciation Practice", desc: "English words-ஐ தெளிவாகவும் confident-ஆவும் pronounce பண்ண உதவும் practice." },
    { title: "Interview English", desc: "Job interview-ல் பேச வேண்டிய useful English sentences and answers." },
    { title: "Workplace Communication", desc: "Office, business, meeting, work report போன்ற situations-க்கு தேவையான English." },
    { title: "Public Speaking Confidence", desc: "Stage, video, class, meeting போன்ற இடங்களில் English பேச confidence develop பண்ணும் guidance." },
    { title: "Common Mistakes Correction", desc: "Tamil learners பொதுவாக செய்யும் English mistakes-ஐ சரி செய்வதற்கான lessons." }
  ];

  const defaultWhyEnglishPesalam = [
    { title: "Easy Tamil Explanation", desc: "English concepts எல்லாம் simple Tamil explanation மூலம் easy-ஆ சொல்லிக் கொடுக்கப்படும்." },
    { title: "Practical Learning", desc: "Book English மட்டும் இல்லாமல், real life-ல் உடனே use பண்ணக்கூடிய English கற்றுக்கொடுக்கப்படும்." },
    { title: "Beginner Friendly", desc: "English பேச ஆரம்பிக்கவே முடியவில்லை என்று நினைக்கும் learners-க்கும் step-by-step guidance கிடைக்கும்." },
    { title: "Confidence Building", desc: "English பேசும் பயம், hesitation, confusion ஆகியவற்றை குறைத்து confidence develop பண்ண உதவும்." },
    { title: "Real-Life Examples", desc: "Daily life examples மூலம் sentence formation, grammar, vocabulary எல்லாம் natural-ஆ கற்றுக்கொள்ள முடியும்." }
  ];

  const defaultWhatYouWillGet = [
    "English பேசும் பயம் குறையும்",
    "Daily life sentences பேச கற்றுக்கொள்வீர்கள்",
    "Tamil-ல யோசித்து English sentence form பண்ண கற்றுக்கொள்வீர்கள்",
    "Grammar-ஐ கஷ்டமில்லாமல் practical-ஆ புரிந்துகொள்வீர்கள்",
    "Interview, office, public speaking situations-ல் confidence கிடைக்கும்",
    "English பேச ஆரம்பிக்க தேவையான basic foundation strong ஆகும்",
    "Mistakes-ஐ correct பண்ணி natural-ஆ பேச கற்றுக்கொள்வீர்கள்"
  ];

  const defaultOurImpact = [
    { val: "1,000,000+", label: "Learners", desc: "தமிழ் பேசும் learners English கற்றுக்கொள்ள English Pesalam-ஐ நம்புகிறார்கள்." },
    { val: "1M+", label: "YouTube Subscribers", desc: "English Pesalam YouTube channel தமிழ் learners மத்தியில் பெரிய நம்பிக்கையை பெற்றுள்ளது." },
    { val: "500+", label: "Detailed Lessons", desc: "Spoken English, grammar, vocabulary, translation, interview English போன்ற பல topics-ல் detailed lessons." },
    { val: "100%", label: "Tamil-to-English Focus", desc: "தமிழ் பேசும் மக்களுக்கு English easy-ஆ புரிய வேண்டும் என்பதற்காக உருவாக்கப்பட்ட focused learning platform." }
  ];

  const whatWeTeach = await getSetting('about_what_we_teach') || JSON.stringify(defaultWhatWeTeach);
  const whyEnglishPesalam = await getSetting('about_why_english_pesalam') || JSON.stringify(defaultWhyEnglishPesalam);
  const whatYouWillGet = await getSetting('about_what_you_will_get') || JSON.stringify(defaultWhatYouWillGet);
  const ourImpact = await getSetting('about_our_impact') || JSON.stringify(defaultOurImpact);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <GlassHeader />
      
      <main className="relative pt-24 md:pt-32 pb-10 z-10 overflow-x-hidden">
        <AboutContent 
          tagline={tagline}
          title={title}
          description1={description1}
          description2={description2}
          description3={description3}
          description4={description4}
          trainerName={trainerName}
          trainerTitle={trainerTitle}
          trainerBio1={trainerBio1}
          trainerBio2={trainerBio2}
          trainerBio3={trainerBio3}
          visionStatement={visionStatement}
          visionDesc1={visionDesc1}
          visionDesc2={visionDesc2}
          visionDesc3={visionDesc3}
          whatWeTeach={whatWeTeach}
          whyEnglishPesalam={whyEnglishPesalam}
          whatYouWillGet={whatYouWillGet}
          ourImpact={ourImpact}
        />
      </main>

      <Footer />
    </div>
  );
}
