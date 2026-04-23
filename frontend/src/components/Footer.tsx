import React from 'react';
import { getSetting } from '@/app/actions/settings';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 0 1 1.772 1.153 4.902 4.902 0 0 1 1.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 0 1-1.772-1.153 4.902 4.902 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 0 1 1.153-1.772A4.902 4.902 0 0 1 5.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 1.802a3.333 3.333 0 1 0 0 6.666 3.333 3.333 0 0 0 0-6.666zm5.338-3.205a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" clipRule="evenodd" />
  </svg>
);

export async function Footer() {
  const contactPhone = await getSetting('contact_phone') || '';
  const contactEmail = await getSetting('contact_email') || '';
  
  const socialFacebook = await getSetting('social_facebook') || '';
  const socialTwitter = await getSetting('social_twitter') || '';
  const socialYoutube = await getSetting('social_youtube') || '';
  const socialInstagram = await getSetting('social_instagram') || '';

  const hasContactInfo = contactPhone || contactEmail;
  const hasSocialLinks = socialFacebook || socialTwitter || socialYoutube || socialInstagram;
  return (
    <footer className="border-t border-slate-200/50 bg-white/30 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-2xl font-black bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent tracking-tight mb-2">
            English Pesalam
          </div>
          <p className="text-sm text-slate-500 max-w-sm">
            Empowering Tamil speakers to master the English language with ease and confidence.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end text-sm text-slate-500 space-y-4">
          
          {hasContactInfo && (
            <div className="flex flex-col items-center md:items-end space-y-1">
              <p className="mb-1">Questions? Reach out on WhatsApp or Email:</p>
              {contactPhone && (
                <a href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`} className="font-semibold text-brand-blue hover:text-brand-green transition-colors">
                  {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="font-semibold text-brand-blue hover:text-brand-green transition-colors">
                  {contactEmail}
                </a>
              )}
            </div>
          )}

          {hasSocialLinks && (
            <div className="flex items-center space-x-4 pt-2">
              {socialFacebook && (
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-blue transition-colors">
                  <span className="sr-only">Facebook</span>
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {socialTwitter && (
                <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-blue transition-colors">
                  <span className="sr-only">Twitter</span>
                  <TwitterIcon className="w-5 h-5" />
                </a>
              )}
              {socialYoutube && (
                <a href={socialYoutube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors">
                  <span className="sr-only">YouTube</span>
                  <YoutubeIcon className="w-5 h-5" />
                </a>
              )}
              {socialInstagram && (
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
          <p className="mt-4 pt-4 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} English pesalam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
