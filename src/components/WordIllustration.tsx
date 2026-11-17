import React from 'react';

interface WordIllustrationProps {
  imageUrl?: string;
  motifKey: string;
  word: string;
}

export const WordIllustration: React.FC<WordIllustrationProps> = ({
  imageUrl,
  motifKey,
  word,
}) => {
  if (imageUrl) {
    const resolvedSrc = imageUrl.startsWith('http')
      ? imageUrl
      : `${import.meta.env.BASE_URL}${imageUrl.replace(/^\//, '')}`;
    return (
      <img
        src={resolvedSrc}
        alt={`Editorial visual memory association for ${word}`}
        loading="lazy"
      />
    );
  }

  // Bespoke warm editorial risograph-style vector illustrations matching Warm White, Charcoal, Mustard & Sage
  switch (motifKey) {
    case 'keys-knot':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <circle cx="135" cy="112" r="54" fill="#EFE9DD" />
          <circle cx="270" cy="112" r="54" fill="#E5EFE8" />
          {/* Loose loop vs crisp brass key */}
          <circle cx="122" cy="98" r="20" stroke="#1E1E1C" strokeWidth="3" fill="#F8EDD6" />
          <circle cx="122" cy="98" r="7" stroke="#1E1E1C" strokeWidth="2.5" fill="#FAF8F4" />
          <path d="M138 110L178 142M166 132L157 143M175 139L166 150" stroke="#1E1E1C" strokeWidth="3" strokeLinecap="round" />
          <path d="M238 118C238 92 268 80 286 98C304 116 284 142 262 132C244 124 252 94 298 92" stroke="#52735D" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 5" />
          <circle cx="298" cy="92" r="6" fill="#CF9226" />
        </svg>
      );

    case 'playful-spark':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <ellipse cx="200" cy="168" rx="115" ry="22" fill="#EFE9DD" />
          {/* Playful origami fox / cat silhouette */}
          <path d="M150 155L166 86L194 112H212L238 84L252 155H150Z" fill="#CF9226" stroke="#1E1E1C" strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="186" cy="126" r="3.2" fill="#1E1E1C" />
          <path d="M212 125C216 121 222 121 225 125" stroke="#1E1E1C" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M198 136L204 141L210 136" stroke="#1E1E1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M276 74L280 86L292 90L280 94L276 106L272 94L260 90L272 86L276 74Z" fill="#52735D" />
          <circle cx="126" cy="88" r="6" fill="#E5EFE8" stroke="#52735D" strokeWidth="2" />
        </svg>
      );

    case 'stepping-stones':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <path d="M40 165Q200 135 360 165" stroke="#DDD4C2" strokeWidth="2" />
          <ellipse cx="105" cy="162" rx="34" ry="14" fill="#EFE9DD" stroke="#1E1E1C" strokeWidth="2.4" />
          <ellipse cx="195" cy="144" rx="38" ry="15" fill="#E5EFE8" stroke="#1E1E1C" strokeWidth="2.4" />
          <ellipse cx="290" cy="124" rx="42" ry="16" fill="#CF9226" stroke="#1E1E1C" strokeWidth="2.4" />
          <path d="M290 70V114M290 70L316 80L290 90" fill="#52735D" />
          <path d="M290 70V114M290 70L316 80L290 90" stroke="#1E1E1C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'tea-aroma':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <ellipse cx="200" cy="174" rx="76" ry="14" fill="#EFE9DD" stroke="#1E1E1C" strokeWidth="2.2" />
          <path d="M156 118H244L234 166C232 172 218 175 200 175C182 175 168 172 166 166L156 118Z" fill="#E5EFE8" stroke="#1E1E1C" strokeWidth="2.5" />
          <path d="M242 126H256C265 126 268 148 253 152H238" stroke="#1E1E1C" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M184 102C180 88 192 80 188 66" stroke="#CF9226" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M204 98C200 82 214 74 208 56" stroke="#52735D" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M222 104C218 92 228 84 224 72" stroke="#CF9226" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'fountain-nib':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <circle cx="200" cy="112" r="68" fill="#EFE9DD" />
          <path d="M126 154C162 154 176 118 208 118C240 118 250 148 286 136" stroke="#52735D" strokeWidth="3" strokeLinecap="round" />
          <path d="M168 62L214 108L182 140L138 144L142 100L168 62Z" fill="#CF9226" stroke="#1E1E1C" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="168" cy="114" r="4.5" fill="#FAF8F4" stroke="#1E1E1C" strokeWidth="2" />
          <path d="M138 144L165 117" stroke="#1E1E1C" strokeWidth="2.2" />
        </svg>
      );

    case 'camera-lens':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <rect x="128" y="74" width="144" height="92" rx="14" fill="#EFE9DD" stroke="#1E1E1C" strokeWidth="2.6" />
          <path d="M164 74L174 58H212L222 74" fill="#52735D" stroke="#1E1E1C" strokeWidth="2.4" />
          <circle cx="200" cy="120" r="28" fill="#FAF8F4" stroke="#1E1E1C" strokeWidth="2.6" />
          <circle cx="200" cy="120" r="15" fill="#CF9226" stroke="#1E1E1C" strokeWidth="2.2" />
          <circle cx="248" cy="92" r="5" fill="#52735D" />
        </svg>
      );

    case 'open-notebook':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <rect x="96" y="56" width="104" height="118" rx="6" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="2.4" />
          <rect x="200" y="56" width="104" height="118" rx="6" fill="#F8EDD6" stroke="#1E1E1C" strokeWidth="2.4" />
          <path d="M116 84H180M116 104H180M116 124H162" stroke="#52735D" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M220 84H284M220 104H284M220 124H266" stroke="#CF9226" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="200" cy="115" r="12" fill="#52735D" />
          <path d="M195 115L199 119L206 111" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'ripple-drop':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <ellipse cx="200" cy="148" rx="95" ry="26" stroke="#52735D" strokeWidth="2.2" fill="#E5EFE8" />
          <ellipse cx="200" cy="148" rx="56" ry="15" stroke="#1E1E1C" strokeWidth="2" fill="#FAF8F4" />
          <path d="M200 54C200 54 180 82 180 96C180 107 189 116 200 116C211 116 220 107 220 96C220 82 200 54 200 54Z" fill="#CF9226" stroke="#1E1E1C" strokeWidth="2.4" />
        </svg>
      );

    case 'route-map':
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <path d="M98 62L166 48L234 64L302 50V164L234 178L166 162L98 176V62Z" fill="#EFE9DD" stroke="#1E1E1C" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M166 48V162M234 64V178" stroke="#C8BCA5" strokeWidth="2" />
          <path d="M126 138C152 102 188 134 214 98C234 72 260 92 274 82" stroke="#52735D" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
          <circle cx="126" cy="138" r="6" fill="#1E1E1C" />
          <circle cx="274" cy="82" r="8" fill="#CF9226" stroke="#1E1E1C" strokeWidth="2" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={word}>
          <rect width="400" height="225" fill="#FAF8F4" />
          <circle cx="176" cy="112" r="46" fill="#F8EDD6" stroke="#1E1E1C" strokeWidth="2.4" />
          <circle cx="226" cy="112" r="46" fill="#E5EFE8" stroke="#1E1E1C" strokeWidth="2.4" fillOpacity="0.82" />
          <circle cx="201" cy="112" r="8" fill="#CF9226" />
        </svg>
      );
  }
};
