import React from 'react';
import Link from 'next/link';
import { getSetting } from '@/app/actions/settings';

export async function GlassHeader() {
  const logoType = await getSetting('logo_type') || 'text';
  const logoText = await getSetting('logo_text') || 'English Pesalam';
  const logoImageUrl = await getSetting('logo_image_url') || '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm">
      <div className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Centered or left aligned Logo */}
        <div className="flex-1 text-center md:text-left flex items-center justify-center md:justify-start">
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity inline-block cursor-pointer flex items-center"
          >
            {logoType === 'image' && logoImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoImageUrl} alt={logoText || 'Logo'} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-black bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent tracking-tight">
                {logoText}
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}
