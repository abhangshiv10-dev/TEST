import React from 'react';
// `?inline` embeds the image as base64, so it also renders inside exported
// receipt images (PNG / JPG / PDF / WhatsApp) without any extra network request.
import logoSrc from '../../assets/app-logo.webp?inline';

export default function AppLogo({
  className = 'w-10 h-10',
  rounded = 'rounded-xl',
  alt = 'Home | Expenses'
}) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      draggable={false}
      className={`${className} ${rounded} object-cover shrink-0 select-none`}
    />
  );
}
