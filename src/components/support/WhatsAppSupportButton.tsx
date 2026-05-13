'use client';

import { MessageCircle } from 'lucide-react';
import { getWhatsAppSupportUrl } from '@/lib/support';

export default function WhatsAppSupportButton() {
  return (
    <a
      href={getWhatsAppSupportUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Inkaa support on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#d64238] text-white shadow-[0_18px_45px_rgba(214,66,56,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#c43830] md:bottom-6 md:right-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#d64238]/35" />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  );
}
