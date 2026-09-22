import React from 'react';
import {
  Layers,
  Hammer,
  HardHat,
  Zap,
  Droplet,
  Paintbrush,
  Truck,
  Box,
  Home,
  Wrench,
  Sparkles,
  Mountain,
  Grid,
  Trees,
  DoorClosed,
  AppWindow,
  Package,
  CircleDollarSign,
  MoreHorizontal
} from 'lucide-react';

/**
 * Returns tailored Lucide icon and subtle color theme for Marathi category names
 * @param {string} categoryName
 */
export function getCategoryIconMeta(categoryName = '') {
  const name = categoryName.trim().toLowerCase();

  if (name.includes('सिमेंट')) {
    return {
      icon: Package,
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      barColor: 'bg-slate-700'
    };
  }
  if (name.includes('स्टील') || name.includes('लोखंड')) {
    return {
      icon: Hammer,
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      barColor: 'bg-blue-600'
    };
  }
  if (name.includes('वाळू') || name.includes('रेती')) {
    return {
      icon: Mountain,
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: 'bg-amber-500'
    };
  }
  if (name.includes('विटा') || name.includes('ब्लॉक')) {
    return {
      icon: Grid,
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      barColor: 'bg-orange-600'
    };
  }
  if (name.includes('खडी') || name.includes('माती')) {
    return {
      icon: Mountain,
      bg: 'bg-stone-50 text-stone-700 border-stone-200',
      barColor: 'bg-stone-600'
    };
  }
  if (name.includes('मजुरी') || name.includes('कामगार') || name.includes('लेबर')) {
    return {
      icon: HardHat,
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      barColor: 'bg-amber-600'
    };
  }
  if (name.includes('वीज') || name.includes('इलेक्ट्रिक') || name.includes('वायरिंग')) {
    return {
      icon: Zap,
      bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      barColor: 'bg-yellow-500'
    };
  }
  if (name.includes('प्लंबिंग') || name.includes('नळ') || name.includes('पाईप')) {
    return {
      icon: Droplet,
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      barColor: 'bg-cyan-600'
    };
  }
  if (name.includes('पेंट') || name.includes('रंग')) {
    return {
      icon: Paintbrush,
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      barColor: 'bg-purple-600'
    };
  }
  if (name.includes('टाइल्स') || name.includes('फरशी') || name.includes('मार्बल')) {
    return {
      icon: Grid,
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      barColor: 'bg-teal-600'
    };
  }
  if (name.includes('लाकूड') || name.includes('फर्निचर')) {
    return {
      icon: Trees,
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      barColor: 'bg-amber-800'
    };
  }
  if (name.includes('दरवाजे') || name.includes('दार')) {
    return {
      icon: DoorClosed,
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barColor: 'bg-emerald-700'
    };
  }
  if (name.includes('खिडक्या')) {
    return {
      icon: AppWindow,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      barColor: 'bg-indigo-600'
    };
  }
  if (name.includes('हार्डवेअर') || name.includes('फिटिंग')) {
    return {
      icon: Wrench,
      bg: 'bg-zinc-50 text-zinc-700 border-zinc-200',
      barColor: 'bg-zinc-600'
    };
  }
  if (name.includes('वाहतूक') || name.includes('ट्रान्सपोर्ट')) {
    return {
      icon: Truck,
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      barColor: 'bg-sky-600'
    };
  }

  // Default fallback
  return {
    icon: Layers,
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    barColor: 'bg-slate-600'
  };
}
