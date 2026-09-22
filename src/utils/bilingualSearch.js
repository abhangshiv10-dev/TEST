/**
 * Bilingual (Marathi + English + Transliteration) Search Utility
 * Enables matching Marathi category names and expense details when user types in English, Transliterated Marathi, or Marathi script.
 */

export const CATEGORY_KEYWORDS_MAP = {
  'सिमेंट': [
    'cement', 'siment', 'seement', 'ambuja', 'ultratech', 'acc', 'birla', 'shree', 
    'coromandel', 'dalmia', 'jk', 'bag', 'bags', 'poti', 'potiya'
  ],
  'वाळू': [
    'sand', 'valu', 'vaalu', 'waloo', 'walu', 'reti', 'retee', 'crash sand', 'm-sand', 
    'm sand', 'river sand', 'crush sand', 'brass', 'trolley', 'tipper'
  ],
  'स्टील': [
    'steel', 'lohand', 'lokhand', 'tmt', 'iron', 'sariya', 'rod', 'rods', 'bars', 
    'steel bar', 'jindal', 'tata tiscon', 'sail', 'polad', 'binding wire', 'tar'
  ],
  'विटा': [
    'brick', 'bricks', 'vit', 'veet', 'vita', 'veeta', 'block', 'blocks', 'siporex', 
    'red brick', 'flyash', 'aac block', 'chira', 'hajar'
  ],
  'खडी': [
    'gravel', 'khadi', 'khadee', 'stone', 'gitti', 'aggregate', 'crushed stone', 
    'metal', '10mm', '20mm', '40mm', 'kapchi', 'brass'
  ],
  'माती': [
    'soil', 'mati', 'maati', 'murum', 'murrum', 'earth', 'mud', 'filling', 'bhrav', 
    'dumper'
  ],
  'मजुरी': [
    'labour', 'labor', 'majuri', 'majoori', 'kamgar', 'thekedar', 'contractor', 
    'mistry', 'mistri', 'kadiya', 'wage', 'wages', 'worker', 'workers', 
    'daily wage', 'roshana', 'roj', 'roji', 'hajari', 'salary'
  ],
  'वीज साहित्य': [
    'electrical', 'electric', 'electrician', 'veej', 'vij', 'wire', 'wires', 'switch', 
    'switches', 'socket', 'mcb', 'light', 'lights', 'fan', 'conduit', 'cable', 
    'finolex', 'polycab', 'anchor', 'havells', 'bulb'
  ],
  'प्लंबिंग साहित्य': [
    'plumbing', 'plumber', 'pipe', 'pipes', 'tap', 'taps', 'fitting', 'fittings', 
    'cpvc', 'pvc', 'upvc', 'swr', 'astral', 'supreme', 'prince', 'valve', 'drainage', 
    'water tank', 'sintex', 'commode', 'basin', 'sink', 'shower', 'sanitary'
  ],
  'टाइल्स': [
    'tiles', 'tile', 'marbonite', 'vitrified', 'ceramic', 'wall tiles', 'floor tiles', 
    'kajaria', 'somany', 'johnson', 'spacer', 'epoxy', 'chemical', 'adhesive'
  ],
  'फरशी': [
    'flooring', 'farshi', 'marble', 'granite', 'kota', 'kadappa', 
    'shahabad', 'paving', 'polishing', 'ghasai'
  ],
  'पेंट': [
    'paint', 'painting', 'panting', 'painter', 'color', 'colour', 'rang', 'rangkam', 'putty', 
    'primer', 'asian paints', 'nerolac', 'berger', 'dulux', 'distemper', 'laster', 
    'apex', 'tractor', 'brush', 'roller', 'thinner'
  ],
  'लाकूड': [
    'wood', 'lakud', 'laakud', 'lakad', 'timber', 'ply', 'plywood', 'teak', 
    'sagwan', 'pinewood', 'shuttering plate', 'fali', 'bamboo', 'balli'
  ],
  'दरवाजे': [
    'door', 'doors', 'darwaja', 'darwaje', 'flush door', 'safety door', 'main door', 
    'plywood door', 'pvc door', 'frame', 'choukhat'
  ],
  'खिडक्या': [
    'window', 'windows', 'khidki', 'khidkya', 'aluminium', 'aluminum', 'sliding', 
    'sliding window', 'glass', 'upvc window', 'grill', 'safety grill', 'mosquito net'
  ],
  'हार्डवेअर': [
    'hardware', 'hardwere', 'screw', 'screws', 'nut', 'bolt', 'hinges', 'kabja', 
    'lock', 'locks', 'godrej', 'handle', 'tower bolt', 'aldrop', 'channel', 'tools'
  ],
  'वाहतूक': [
    'transport', 'transportation', 'vahtuk', 'vaahatuk', 'tempo', 'truck', 'tractor', 
    'auto', 'delivery', 'freight', 'bhada', 'bhaden', 'bhade', 'loading', 'unloading', 'hamali'
  ],
  'पाणी / बोअरवेल': [
    'water', 'pani', 'paani', 'tanker', 'borewell', 'bore', 'bor', 'motor', 'submersible', 
    'pump', 'drilling'
  ],
  'शटरिंग / सेंट्रिंग': [
    'shuttering', 'centering', 'scaffolding', 'bhadem', 'plates', 'props', 'slab', 'rcc'
  ],
  'इंजिनिअर / आर्किटेक्ट': [
    'engineer', 'architect', 'plan', 'nakasha', 'drawing', 'permission', 'sanction', 
    'tax', 'supervision', 'consultant'
  ],
  'इतर': [
    'other', 'others', 'itar', 'miscellaneous', 'misc', 'extra', 'general', 'sundry'
  ]
};

/**
 * Returns primary English label for a Marathi category for nice UI hints
 */
export function getCategoryEnglishLabel(categoryName = '') {
  const cat = (categoryName || '').trim();
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS_MAP)) {
    if (cat.includes(key) || key.includes(cat)) {
      const primary = keywords[0];
      return primary.charAt(0).toUpperCase() + primary.slice(1);
    }
  }
  return null;
}

/**
 * Checks if a category matches the search query across Marathi, English, and transliterations.
 * @param {string} categoryName - e.g. "सिमेंट" or "स्टील"
 * @param {string} rawQuery - e.g. "cement" or "valu" or "स्टील"
 * @returns {boolean}
 */
export function matchesCategory(categoryName = '', rawQuery = '') {
  const query = (rawQuery || '').toLowerCase().trim();
  if (!query) return true;

  const catName = (categoryName || '').toLowerCase().trim();

  // 1. Direct Marathi match
  if (catName.includes(query)) {
    return true;
  }

  // 2. Keyword & English dictionary match
  for (const [keyCategory, keywords] of Object.entries(CATEGORY_KEYWORDS_MAP)) {
    const isMatchingCategory = 
      catName.includes(keyCategory.toLowerCase()) || 
      keyCategory.toLowerCase().includes(catName);

    if (isMatchingCategory) {
      const hasMatch = keywords.some(kw => {
        const normKw = kw.toLowerCase();
        return (
          normKw === query || 
          normKw.startsWith(query) || 
          query.startsWith(normKw) ||
          (query.length >= 3 && normKw.includes(query))
        );
      });

      if (hasMatch) {
        return true;
      }
    }
  }

  return false;
}
