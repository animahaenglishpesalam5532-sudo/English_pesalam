import React from 'react';
import { getSetting } from '@/app/actions/settings';
import { Navbar } from './Navbar';

export async function GlassHeader() {
  const logoType = await getSetting('logo_type', true) || 'text';
  const logoText = await getSetting('logo_text', true) || 'English Pesalam';
  const logoImageUrl = await getSetting('logo_image_url', true) || '';

  return (
    <Navbar 
      logoType={logoType} 
      logoText={logoText} 
      logoImageUrl={logoImageUrl} 
    />
  );
}
