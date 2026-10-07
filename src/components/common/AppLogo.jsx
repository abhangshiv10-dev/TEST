import React from 'react';
// `?inline` embeds the image as base64, so it also renders inside exported
// receipt images (PNG / JPG / PDF / WhatsApp) without any extra network request.
import logoSrc from '../../assets/app-logo.webp?inline';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AppLogo({
  className = 'w-10 h-10',
  rounded = 'rounded-xl',
  alt
}) {
  const { t } = useLanguage();
  return (
    <img
      src={logoSrc}
      alt={alt ?? t('app.name')}
      draggable={false}
      className={`${className} ${rounded} object-cover shrink-0 select-none`}
    />
  );
}
