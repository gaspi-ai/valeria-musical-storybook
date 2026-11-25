/**
 * LessonArt.ts
 * Custom, high-contrast, expressive storybook SVG artwork for the 1-Year-Old Learning Studio.
 * Zero dependency on inconsistent OS emojis — renders crisply on iPhone & iPad Retina screens.
 */

export function getWordSvg(id: string): string {
  switch (id) {
    case 'ball':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <circle cx="80" cy="80" r="64" fill="#FF6B6B" stroke="#C92A2A" stroke-width="6"/>
        <path d="M 32 40 Q 80 80 32 120" fill="none" stroke="#FFD166" stroke-width="14" stroke-linecap="round"/>
        <path d="M 128 40 Q 80 80 128 120" fill="none" stroke="#4ECDC4" stroke-width="14" stroke-linecap="round"/>
        <circle cx="80" cy="80" r="18" fill="#FFFFFF" stroke="#1D3557" stroke-width="5"/>
        <ellipse cx="56" cy="46" rx="14" ry="8" fill="#FFFFFF" opacity="0.45" transform="rotate(-25 56 46)"/>
      </svg>`;
    case 'apple':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <path d="M 80 42 C 55 24 22 44 26 84 C 30 122 58 144 80 134 C 102 144 130 122 134 84 C 138 44 105 24 80 42 Z" fill="#EF233C" stroke="#9B1B30" stroke-width="6"/>
        <path d="M 80 42 Q 82 20 96 14" fill="none" stroke="#6F4E37" stroke-width="8" stroke-linecap="round"/>
        <path d="M 82 32 Q 112 12 122 36 Q 98 44 82 32 Z" fill="#52B788" stroke="#2D6A4F" stroke-width="4"/>
        <ellipse cx="52" cy="70" rx="10" ry="18" fill="#FFFFFF" opacity="0.35" transform="rotate(-18 52 70)"/>
      </svg>`;
    case 'cup':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <path d="M 116 66 C 142 66 142 108 114 108" fill="none" stroke="#48CAE4" stroke-width="12" stroke-linecap="round"/>
        <path d="M 38 48 L 122 48 L 112 128 Q 80 140 48 128 Z" fill="#48CAE4" stroke="#0077B6" stroke-width="6" stroke-linejoin="round"/>
        <ellipse cx="80" cy="48" rx="42" ry="12" fill="#CAF0F8" stroke="#0077B6" stroke-width="5"/>
        <circle cx="66" cy="88" r="6" fill="#1D3557"/>
        <circle cx="94" cy="88" r="6" fill="#1D3557"/>
        <path d="M 68 102 Q 80 114 92 102" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round"/>
      </svg>`;
    case 'book':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <rect x="20" y="34" width="60" height="96" rx="10" fill="#FFF8E7" stroke="#4361EE" stroke-width="7"/>
        <rect x="80" y="34" width="60" height="96" rx="10" fill="#FFF8E7" stroke="#4361EE" stroke-width="7"/>
        <line x1="80" y1="34" x2="80" y2="130" stroke="#3A0CA3" stroke-width="6"/>
        <polygon points="50,62 55,75 68,75 58,83 62,96 50,88 38,96 42,83 32,75 45,75" fill="#FFBD00"/>
        <line x1="94" y1="64" x2="126" y2="64" stroke="#FF6B6B" stroke-width="6" stroke-linecap="round"/>
        <line x1="94" y1="84" x2="126" y2="84" stroke="#06D6A0" stroke-width="6" stroke-linecap="round"/>
        <line x1="94" y1="104" x2="118" y2="104" stroke="#4CC9F0" stroke-width="6" stroke-linecap="round"/>
      </svg>`;
    case 'car':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <path d="M 22 98 L 28 74 Q 36 52 60 52 L 100 52 Q 124 52 132 74 L 138 98 Q 144 102 144 114 L 16 114 Q 16 102 22 98 Z" fill="#FF9F1C" stroke="#D97706" stroke-width="6" stroke-linejoin="round"/>
        <path d="M 44 74 L 54 58 L 106 58 L 116 74 Z" fill="#CAF0F8" stroke="#0077B6" stroke-width="4"/>
        <circle cx="46" cy="116" r="18" fill="#2B2D42" stroke="#111" stroke-width="4"/>
        <circle cx="46" cy="116" r="7" fill="#FFD166"/>
        <circle cx="114" cy="116" r="18" fill="#2B2D42" stroke="#111" stroke-width="4"/>
        <circle cx="114" cy="116" r="7" fill="#FFD166"/>
        <circle cx="134" cy="96" r="7" fill="#FFF3B0"/>
      </svg>`;
    case 'flower':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <line x1="80" y1="88" x2="80" y2="148" stroke="#52B788" stroke-width="10" stroke-linecap="round"/>
        <ellipse cx="60" cy="126" rx="18" ry="10" fill="#52B788" transform="rotate(-25 60 126)"/>
        <ellipse cx="100" cy="126" rx="18" ry="10" fill="#52B788" transform="rotate(25 100 126)"/>
        <circle cx="80" cy="36" r="22" fill="#FF6B8B"/>
        <circle cx="116" cy="60" r="22" fill="#FF6B8B"/>
        <circle cx="104" cy="98" r="22" fill="#FF6B8B"/>
        <circle cx="56" cy="98" r="22" fill="#FF6B8B"/>
        <circle cx="44" cy="60" r="22" fill="#FF6B8B"/>
        <circle cx="80" cy="68" r="26" fill="#FFD166" stroke="#F4A261" stroke-width="5"/>
        <circle cx="71" cy="64" r="4" fill="#1D3557"/>
        <circle cx="89" cy="64" r="4" fill="#1D3557"/>
        <path d="M 72 74 Q 80 82 88 74" fill="none" stroke="#1D3557" stroke-width="4" stroke-linecap="round"/>
      </svg>`;
    case 'sun':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <g fill="#FF9F1C">
          <polygon points="80,8 72,30 88,30"/><polygon points="80,152 72,130 88,130"/>
          <polygon points="8,80 30,72 30,88"/><polygon points="152,80 130,72 130,88"/>
          <polygon points="28,28 46,38 38,46"/><polygon points="132,132 114,122 122,114"/>
          <polygon points="132,28 122,46 114,38"/><polygon points="28,132 38,114 46,122"/>
        </g>
        <circle cx="80" cy="80" r="44" fill="#FFD166" stroke="#F4A261" stroke-width="6"/>
        <circle cx="64" cy="74" r="6" fill="#1D3557"/><circle cx="96" cy="74" r="6" fill="#1D3557"/>
        <circle cx="56" cy="86" r="7" fill="#FF758F" opacity="0.5"/>
        <circle cx="104" cy="86" r="7" fill="#FF758F" opacity="0.5"/>
        <path d="M 64 90 Q 80 108 96 90" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round"/>
      </svg>`;
    case 'moon':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <path d="M 106 24 A 58 58 0 1 0 134 114 A 46 46 0 1 1 106 24 Z" fill="#FFE066" stroke="#F4A261" stroke-width="6" stroke-linejoin="round"/>
        <circle cx="62" cy="74" r="5" fill="#1D3557"/>
        <path d="M 56 90 Q 68 98 78 88" fill="none" stroke="#1D3557" stroke-width="4" stroke-linecap="round"/>
        <polygon points="122,42 126,52 136,52 128,58 131,68 122,62 113,68 116,58 108,52 118,52" fill="#FFF3B0"/>
      </svg>`;
    default:
      return `<svg viewBox="0 0 160 160" class="lesson-svg"><circle cx="80" cy="80" r="56" fill="#FFD166"/></svg>`;
  }
}

export function getAnimalSvg(id: string): string {
  switch (id) {
    case 'cow':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <ellipse cx="32" cy="54" rx="18" ry="10" fill="#2B2D42" transform="rotate(-20 32 54)"/>
        <ellipse cx="128" cy="54" rx="18" ry="10" fill="#2B2D42" transform="rotate(20 128 54)"/>
        <path d="M 48 34 Q 44 16 58 24" fill="none" stroke="#FFD166" stroke-width="9" stroke-linecap="round"/>
        <path d="M 112 34 Q 116 16 102 24" fill="none" stroke="#FFD166" stroke-width="9" stroke-linecap="round"/>
        <rect x="34" y="34" width="92" height="92" rx="40" fill="#FFFFFF" stroke="#2B2D42" stroke-width="6"/>
        <circle cx="54" cy="56" r="16" fill="#2B2D42"/>
        <ellipse cx="80" cy="102" rx="44" ry="28" fill="#FFB3C1" stroke="#E07A5F" stroke-width="5"/>
        <circle cx="64" cy="98" r="6" fill="#6D597A"/><circle cx="96" cy="98" r="6" fill="#6D597A"/>
        <circle cx="62" cy="68" r="7" fill="#1D3557"/><circle cx="98" cy="68" r="7" fill="#1D3557"/>
        <circle cx="60" cy="65" r="2.5" fill="#FFF"/><circle cx="96" cy="65" r="2.5" fill="#FFF"/>
      </svg>`;
    case 'dog':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <ellipse cx="32" cy="82" rx="18" ry="38" fill="#8D5524" stroke="#5C3A21" stroke-width="5" transform="rotate(14 32 82)"/>
        <ellipse cx="128" cy="82" rx="18" ry="38" fill="#8D5524" stroke="#5C3A21" stroke-width="5" transform="rotate(-14 128 82)"/>
        <circle cx="80" cy="82" r="48" fill="#E09F3E" stroke="#8D5524" stroke-width="6"/>
        <ellipse cx="80" cy="96" rx="28" ry="22" fill="#FFF3B0"/>
        <ellipse cx="80" cy="88" rx="11" ry="8" fill="#2B2D42"/>
        <path d="M 74 102 Q 80 116 86 102" fill="#FF6B8B" stroke="#C92A2A" stroke-width="3"/>
        <circle cx="62" cy="68" r="7" fill="#1D3557"/><circle cx="98" cy="68" r="7" fill="#1D3557"/>
        <circle cx="60" cy="65" r="2.5" fill="#FFF"/><circle cx="96" cy="65" r="2.5" fill="#FFF"/>
      </svg>`;
    case 'cat':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <polygon points="36,74 42,24 76,48" fill="#FF9F1C" stroke="#C86D00" stroke-width="6" stroke-linejoin="round"/>
        <polygon points="124,74 118,24 84,48" fill="#FF9F1C" stroke="#C86D00" stroke-width="6" stroke-linejoin="round"/>
        <polygon points="44,64 47,36 66,50" fill="#FFB3C1"/>
        <polygon points="116,64 113,36 94,50" fill="#FFB3C1"/>
        <circle cx="80" cy="88" r="48" fill="#FFBF69" stroke="#C86D00" stroke-width="6"/>
        <circle cx="62" cy="80" r="7" fill="#1D3557"/><circle cx="98" cy="80" r="7" fill="#1D3557"/>
        <polygon points="74,92 86,92 80,100" fill="#FF6B8B"/>
        <path d="M 68 104 Q 74 112 80 104 Q 86 112 92 104" fill="none" stroke="#1D3557" stroke-width="4" stroke-linecap="round"/>
        <line x1="22" y1="88" x2="48" y2="92" stroke="#1D3557" stroke-width="4" stroke-linecap="round"/>
        <line x1="22" y1="102" x2="48" y2="100" stroke="#1D3557" stroke-width="4" stroke-linecap="round"/>
        <line x1="138" y1="88" x2="112" y2="92" stroke="#1D3557" stroke-width="4" stroke-linecap="round"/>
        <line x1="138" y1="102" x2="112" y2="100" stroke="#1D3557" stroke-width="4" stroke-linecap="round"/>
      </svg>`;
    case 'duck':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <circle cx="80" cy="82" r="48" fill="#FFD166" stroke="#E29500" stroke-width="6"/>
        <path d="M 72 34 Q 80 16 90 32" fill="none" stroke="#FFD166" stroke-width="10" stroke-linecap="round"/>
        <ellipse cx="80" cy="100" rx="28" ry="15" fill="#FF6B00" stroke="#C84B00" stroke-width="5"/>
        <circle cx="62" cy="70" r="7" fill="#1D3557"/><circle cx="98" cy="70" r="7" fill="#1D3557"/>
        <circle cx="60" cy="67" r="2.5" fill="#FFF"/><circle cx="96" cy="67" r="2.5" fill="#FFF"/>
        <circle cx="48" cy="84" r="8" fill="#FF758F" opacity="0.5"/>
        <circle cx="112" cy="84" r="8" fill="#FF758F" opacity="0.5"/>
      </svg>`;
    case 'sheep':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <g fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4">
          <circle cx="80" cy="40" r="24"/><circle cx="46" cy="58" r="24"/><circle cx="114" cy="58" r="24"/>
          <circle cx="40" cy="94" r="24"/><circle cx="120" cy="94" r="24"/><circle cx="80" cy="116" r="26"/>
        </g>
        <ellipse cx="80" cy="86" rx="34" ry="38" fill="#3D405B"/>
        <ellipse cx="42" cy="74" rx="14" ry="8" fill="#3D405B" transform="rotate(-20 42 74)"/>
        <ellipse cx="118" cy="74" rx="14" ry="8" fill="#3D405B" transform="rotate(20 118 74)"/>
        <circle cx="68" cy="78" r="6" fill="#FFFFFF"/><circle cx="92" cy="78" r="6" fill="#FFFFFF"/>
        <circle cx="68" cy="78" r="3" fill="#111"/><circle cx="92" cy="78" r="3" fill="#111"/>
        <path d="M 70 98 Q 80 108 90 98" fill="none" stroke="#FFB3C1" stroke-width="4" stroke-linecap="round"/>
      </svg>`;
    case 'monkey':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <circle cx="30" cy="78" r="20" fill="#8D5524" stroke="#5C3A21" stroke-width="5"/>
        <circle cx="30" cy="78" r="11" fill="#F4C095"/>
        <circle cx="130" cy="78" r="20" fill="#8D5524" stroke="#5C3A21" stroke-width="5"/>
        <circle cx="130" cy="78" r="11" fill="#F4C095"/>
        <circle cx="80" cy="82" r="48" fill="#8D5524" stroke="#5C3A21" stroke-width="6"/>
        <circle cx="64" cy="68" r="20" fill="#F4C095"/><circle cx="96" cy="68" r="20" fill="#F4C095"/>
        <ellipse cx="80" cy="98" rx="36" ry="26" fill="#F4C095"/>
        <circle cx="64" cy="68" r="6.5" fill="#1D3557"/><circle cx="96" cy="68" r="6.5" fill="#1D3557"/>
        <path d="M 62 96 Q 80 116 98 96" fill="none" stroke="#5C3A21" stroke-width="5" stroke-linecap="round"/>
      </svg>`;
    default:
      return `<svg viewBox="0 0 160 160" class="lesson-svg"><circle cx="80" cy="80" r="50" fill="#FFD166"/></svg>`;
  }
}

export function getShapeSvg(shape: string, fill: string, stroke: string): string {
  const face = `
    <circle cx="66" cy="74" r="6" fill="#1D3557"/>
    <circle cx="94" cy="74" r="6" fill="#1D3557"/>
    <circle cx="64" cy="72" r="2" fill="#FFFFFF"/>
    <circle cx="92" cy="72" r="2" fill="#FFFFFF"/>
    <path d="M 68 90 Q 80 104 92 90" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round"/>
  `;
  switch (shape) {
    case 'circle':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <circle cx="80" cy="80" r="60" fill="${fill}" stroke="${stroke}" stroke-width="8"/>
        ${face}
      </svg>`;
    case 'star':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <polygon points="80,14 99,56 146,61 110,92 121,138 80,114 39,138 50,92 14,61 61,56" fill="${fill}" stroke="${stroke}" stroke-width="7" stroke-linejoin="round"/>
        ${face}
      </svg>`;
    case 'triangle':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <polygon points="80,20 144,132 16,132" fill="${fill}" stroke="${stroke}" stroke-width="8" stroke-linejoin="round"/>
        <circle cx="68" cy="92" r="6" fill="#1D3557"/><circle cx="92" cy="92" r="6" fill="#1D3557"/>
        <path d="M 68 106 Q 80 118 92 106" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round"/>
      </svg>`;
    case 'square':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <rect x="24" y="24" width="112" height="112" rx="22" fill="${fill}" stroke="${stroke}" stroke-width="8"/>
        ${face}
      </svg>`;
    case 'heart':
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <path d="M 80 138 C 20 98 16 42 50 32 C 68 26 80 44 80 54 C 80 44 92 26 110 32 C 144 42 140 98 80 138 Z" fill="${fill}" stroke="${stroke}" stroke-width="7" stroke-linejoin="round"/>
        ${face}
      </svg>`;
    default:
      return `<svg viewBox="0 0 160 160" class="lesson-svg">
        <path d="M 38 118 A 26 26 0 0 1 42 68 A 34 34 0 0 1 106 58 A 28 28 0 0 1 124 118 Z" fill="${fill}" stroke="${stroke}" stroke-width="7" stroke-linejoin="round"/>
        <circle cx="68" cy="86" r="6" fill="#1D3557"/><circle cx="92" cy="86" r="6" fill="#1D3557"/>
        <path d="M 68 98 Q 80 110 92 98" fill="none" stroke="#1D3557" stroke-width="5" stroke-linecap="round"/>
      </svg>`;
  }
}

/**
 * Interactive Baby Bear with oversized tappable body parts for Lesson 4 (My Body Parts).
 */
export function getBodyBearSvg(): string {
  return `<svg viewBox="0 0 320 380" class="body-bear-svg" aria-label="Friendly Baby Bear">
    <!-- Ears (tappable) -->
    <g class="body-part-zone" data-part="ears" role="button" aria-label="Ears">
      <circle cx="88" cy="76" r="34" fill="#C68642" stroke="#8D5524" stroke-width="7"/>
      <circle cx="88" cy="76" r="18" fill="#FFB3C1"/>
      <circle cx="232" cy="76" r="34" fill="#C68642" stroke="#8D5524" stroke-width="7"/>
      <circle cx="232" cy="76" r="18" fill="#FFB3C1"/>
    </g>

    <!-- Torso & Belly (tappable) -->
    <g class="body-part-zone" data-part="belly" role="button" aria-label="Belly">
      <ellipse cx="160" cy="256" rx="84" ry="86" fill="#C68642" stroke="#8D5524" stroke-width="7"/>
      <ellipse cx="160" cy="264" rx="54" ry="56" fill="#FDE2C4"/>
    </g>

    <!-- Arms / Hands (tappable) -->
    <g class="body-part-zone" data-part="hands" role="button" aria-label="Hands">
      <ellipse cx="64" cy="236" rx="34" ry="24" fill="#C68642" stroke="#8D5524" stroke-width="7" transform="rotate(-25 64 236)"/>
      <circle cx="48" cy="242" r="12" fill="#FFB3C1"/>
      <ellipse cx="256" cy="236" rx="34" ry="24" fill="#C68642" stroke="#8D5524" stroke-width="7" transform="rotate(25 256 236)"/>
      <circle cx="272" cy="242" r="12" fill="#FFB3C1"/>
    </g>

    <!-- Feet (tappable) -->
    <g class="body-part-zone" data-part="feet" role="button" aria-label="Feet">
      <ellipse cx="106" cy="340" rx="34" ry="24" fill="#C68642" stroke="#8D5524" stroke-width="7"/>
      <ellipse cx="106" cy="340" rx="18" ry="12" fill="#FFB3C1"/>
      <ellipse cx="214" cy="340" rx="34" ry="24" fill="#C68642" stroke="#8D5524" stroke-width="7"/>
      <ellipse cx="214" cy="340" rx="18" ry="12" fill="#FFB3C1"/>
    </g>

    <!-- Head Base -->
    <circle cx="160" cy="134" r="76" fill="#C68642" stroke="#8D5524" stroke-width="7"/>
    <ellipse cx="160" cy="156" rx="40" ry="30" fill="#FDE2C4"/>
    <circle cx="112" cy="148" r="12" fill="#FF758F" opacity="0.45"/>
    <circle cx="208" cy="148" r="12" fill="#FF758F" opacity="0.45"/>

    <!-- Eyes (tappable) -->
    <g class="body-part-zone" data-part="eyes" role="button" aria-label="Eyes">
      <circle cx="128" cy="120" r="20" fill="transparent"/>
      <circle cx="192" cy="120" r="20" fill="transparent"/>
      <ellipse cx="128" cy="120" rx="11" ry="14" fill="#1D3557"/>
      <circle cx="124" cy="115" r="4" fill="#FFFFFF"/>
      <ellipse cx="192" cy="120" rx="11" ry="14" fill="#1D3557"/>
      <circle cx="188" cy="115" r="4" fill="#FFFFFF"/>
    </g>

    <!-- Nose (tappable) -->
    <g class="body-part-zone" data-part="nose" role="button" aria-label="Nose">
      <circle cx="160" cy="146" r="22" fill="transparent"/>
      <ellipse cx="160" cy="146" rx="16" ry="12" fill="#3D2B1F"/>
      <ellipse cx="155" cy="142" rx="5" ry="3" fill="#FFFFFF" opacity="0.5"/>
    </g>

    <!-- Mouth (tappable) -->
    <g class="body-part-zone" data-part="mouth" role="button" aria-label="Mouth">
      <circle cx="160" cy="172" r="22" fill="transparent"/>
      <path d="M 138 166 Q 160 188 182 166" fill="none" stroke="#3D2B1F" stroke-width="6" stroke-linecap="round"/>
    </g>
  </svg>`;
}

/**
 * Expressive Storybook Emotion Face SVG for Lesson 6 (Emotions & Faces).
 */
export function getEmotionSvg(emotion: string): string {
  switch (emotion) {
    case 'happy':
      return `<svg viewBox="0 0 200 200" class="emotion-svg">
        <circle cx="100" cy="100" r="82" fill="#FFD166" stroke="#F4A261" stroke-width="8"/>
        <circle cx="56" cy="116" r="14" fill="#FF758F" opacity="0.55"/>
        <circle cx="144" cy="116" r="14" fill="#FF758F" opacity="0.55"/>
        <path d="M 56 84 Q 70 68 84 84" fill="none" stroke="#1D3557" stroke-width="8" stroke-linecap="round"/>
        <path d="M 116 84 Q 130 68 144 84" fill="none" stroke="#1D3557" stroke-width="8" stroke-linecap="round"/>
        <path d="M 60 116 Q 100 162 140 116 Z" fill="#EF476F" stroke="#1D3557" stroke-width="6" stroke-linejoin="round"/>
      </svg>`;
    case 'silly':
      return `<svg viewBox="0 0 200 200" class="emotion-svg">
        <circle cx="100" cy="100" r="82" fill="#06D6A0" stroke="#049A73" stroke-width="8"/>
        <circle cx="68" cy="82" r="16" fill="#FFFFFF" stroke="#1D3557" stroke-width="5"/>
        <circle cx="72" cy="82" r="7" fill="#1D3557"/>
        <path d="M 116 82 Q 132 68 148 82" fill="none" stroke="#1D3557" stroke-width="8" stroke-linecap="round"/>
        <path d="M 64 122 Q 100 144 136 122" fill="none" stroke="#1D3557" stroke-width="8" stroke-linecap="round"/>
        <path d="M 96 130 Q 112 168 128 130" fill="#FF6B8B" stroke="#C92A2A" stroke-width="5"/>
      </svg>`;
    case 'surprised':
      return `<svg viewBox="0 0 200 200" class="emotion-svg">
        <circle cx="100" cy="100" r="82" fill="#4CC9F0" stroke="#0077B6" stroke-width="8"/>
        <path d="M 52 58 Q 68 46 84 58" fill="none" stroke="#1D3557" stroke-width="6" stroke-linecap="round"/>
        <path d="M 116 58 Q 132 46 148 58" fill="none" stroke="#1D3557" stroke-width="6" stroke-linecap="round"/>
        <circle cx="68" cy="86" r="16" fill="#FFFFFF" stroke="#1D3557" stroke-width="5"/>
        <circle cx="68" cy="86" r="7" fill="#1D3557"/>
        <circle cx="132" cy="86" r="16" fill="#FFFFFF" stroke="#1D3557" stroke-width="5"/>
        <circle cx="132" cy="86" r="7" fill="#1D3557"/>
        <ellipse cx="100" cy="134" rx="18" ry="22" fill="#EF476F" stroke="#1D3557" stroke-width="6"/>
      </svg>`;
    case 'sleepy':
      return `<svg viewBox="0 0 200 200" class="emotion-svg">
        <circle cx="100" cy="100" r="82" fill="#9D4EDD" stroke="#5A189A" stroke-width="8"/>
        <path d="M 54 90 Q 70 104 86 90" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
        <path d="M 114 90 Q 130 104 146 90" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="100" cy="134" rx="12" ry="10" fill="#FFB3C1" stroke="#FFFFFF" stroke-width="4"/>
        <text x="142" y="54" font-size="28" font-weight="900" fill="#FFE066">Zzz</text>
      </svg>`;
    default: // loved
      return `<svg viewBox="0 0 200 200" class="emotion-svg">
        <circle cx="100" cy="100" r="82" fill="#FF85A1" stroke="#E05780" stroke-width="8"/>
        <path d="M 68 96 C 50 82 50 64 62 62 C 66 61 68 66 68 68 C 68 66 70 61 74 62 C 86 64 86 82 68 96 Z" fill="#EF233C"/>
        <path d="M 132 96 C 114 82 114 64 126 62 C 130 61 132 66 132 68 C 132 66 134 61 138 62 C 150 64 150 82 132 96 Z" fill="#EF233C"/>
        <path d="M 68 124 Q 100 152 132 124" fill="none" stroke="#1D3557" stroke-width="8" stroke-linecap="round"/>
      </svg>`;
  }
}
