'use client';
import React from 'react';

interface WAProps {
  phone?: string; // E.164 sin '+' ej: 34600000000
  text?: string;  // Mensaje prellenado
}

export default function WhatsAppFloat({ phone = process.env.NEXT_PUBLIC_WA_PHONE || '34600000000', text = 'Hola, me interesa su gestión' }: WAProps) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  return (
    <a
      href={href}
      aria-label="Hablar por WhatsApp"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center justify-center rounded-full shadow-lg border bg-white w-14 h-14 hover:scale-105 transition"
      target="_blank" rel="noopener noreferrer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M.057 24l1.687-6.163a11.94 11.94 0 01-1.62-6.003C.122 5.281 5.403 0 12.057 0c3.187 0 6.167 1.24 8.413 3.488A11.82 11.82 0 0124 11.94c-.003 6.662-5.284 11.94-11.94 11.94a11.95 11.95 0 01-6.003-1.62L.057 24zM6.6 20.013c1.676.995 3.276 1.591 5.392 1.593 5.448 0 9.886-4.434 9.889-9.885.003-5.463-4.415-9.89-9.88-9.893-5.45 0-9.887 4.434-9.89 9.885-.001 2.225.651 3.891 1.746 5.6l-.999 3.648 3.742-.948zM8.69 6.648c-.19-.423-.39-.432-.57-.44-.148-.006-.317-.005-.488-.005a.938.938 0 00-.674.316c-.232.25-.885.865-.885 2.11 0 1.244.906 2.447 1.033 2.615.127.168 1.77 2.835 4.29 3.855 2.52 1.02 2.52.68 2.975.64.455-.04 1.46-.595 1.667-1.17.207-.576.207-1.07.145-1.17-.06-.1-.232-.168-.485-.296-.255-.127-1.51-.743-1.74-.827-.232-.084-.4-.127-.57.128-.17.254-.655.826-.804.995-.147.17-.3.19-.555.064-.255-.127-1.078-.397-2.054-1.266-.76-.677-1.274-1.51-1.422-1.765-.148-.254-.015-.392.112-.519.115-.115.255-.3.382-.447.127-.149.17-.255.255-.425.085-.17.042-.318-.021-.446-.064-.127-.567-1.364-.803-1.86z" fill="currentColor" /></svg>
    </a>
  );
}
