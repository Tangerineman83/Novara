// js/avatars.js  v19.0
// Self-contained geometric SVG avatar library — zero external dependencies.
// 6 age bands, each a bold flat-design character evoking that life stage.
// Zero dependencies. Returns an SVG string ready for innerHTML injection.

export const AVATAR_BANDS = [
    { minAge: 18, maxAge: 25, label: "Just Launched",      bgColor: "#EEF2FF", accentA: "#4F46E5", accentB: "#818CF8", accentC: "#E0E7FF" },
    { minAge: 26, maxAge: 35, label: "Full Throttle",      bgColor: "#ECFDF5", accentA: "#059669", accentB: "#34D399", accentC: "#D1FAE5" },
    { minAge: 36, maxAge: 45, label: "In the Thick of It", bgColor: "#FFF7ED", accentA: "#D97706", accentB: "#FBBF24", accentC: "#FEF3C7" },
    { minAge: 46, maxAge: 55, label: "Eyes on the Horizon",bgColor: "#EFF6FF", accentA: "#1D4ED8", accentB: "#60A5FA", accentC: "#DBEAFE" },
    { minAge: 56, maxAge: 64, label: "Final Approach",     bgColor: "#F5F3FF", accentA: "#7C3AED", accentB: "#A78BFA", accentC: "#EDE9FE" },
    { minAge: 65, maxAge: 99, label: "Free Range",         bgColor: "#FFF1F2", accentA: "#BE123C", accentB: "#FB7185", accentC: "#FFE4E6" },
];

export function getAvatarBand(age) {
    const a = parseInt(age) || 25;
    return AVATAR_BANDS.find(b => a >= b.minAge && a <= b.maxAge) || AVATAR_BANDS[0];
}

// ─────────────────────────────────────────────
// Band 1: 18–25  "The Graduate"
// Bold geometric grad — mortarboard, laptop glow, wide alert eyes, energy lines
// ─────────────────────────────────────────────
function svgGraduate(b) {
    return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <!-- Background circle -->
  <circle cx="60" cy="65" r="55" fill="${b.accentC}"/>
  <!-- Energy spark lines -->
  <line x1="15" y1="30" x2="22" y2="38" stroke="${b.accentA}" stroke-width="3" stroke-linecap="round"/>
  <line x1="10" y1="50" x2="20" y2="50" stroke="${b.accentB}" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="98" y1="28" x2="105" y2="22" stroke="${b.accentA}" stroke-width="3" stroke-linecap="round"/>
  <line x1="100" y1="48" x2="110" y2="48" stroke="${b.accentB}" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Body -->
  <rect x="34" y="72" width="52" height="38" rx="18" fill="${b.accentA}"/>
  <!-- Neck -->
  <rect x="52" y="62" width="16" height="14" rx="6" fill="${b.accentB}"/>
  <!-- Head -->
  <ellipse cx="60" cy="50" rx="22" ry="22" fill="${b.accentB}"/>
  <!-- Eyes — wide and alert -->
  <circle cx="52" cy="47" r="5" fill="white"/>
  <circle cx="68" cy="47" r="5" fill="white"/>
  <circle cx="53" cy="48" r="2.8" fill="${b.accentA}"/>
  <circle cx="69" cy="48" r="2.8" fill="${b.accentA}"/>
  <circle cx="54" cy="47" r="1" fill="white"/>
  <circle cx="70" cy="47" r="1" fill="white"/>
  <!-- Big grin -->
  <path d="M50 56 Q60 64 70 56" stroke="${b.accentA}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Mortarboard base -->
  <rect x="40" y="28" width="40" height="8" rx="4" fill="${b.accentA}"/>
  <!-- Mortarboard top board -->
  <rect x="34" y="24" width="52" height="7" rx="3" fill="${b.accentA}"/>
  <!-- Tassel string -->
  <line x1="86" y1="27" x2="92" y2="38" stroke="${b.accentA}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="92" cy="40" r="3" fill="${b.accentB}"/>
  <!-- Laptop glow in lap area -->
  <rect x="38" y="95" width="44" height="10" rx="4" fill="${b.accentC}" stroke="${b.accentB}" stroke-width="1.5"/>
  <rect x="42" y="97" width="36" height="6" rx="2" fill="${b.accentB}" opacity="0.5"/>
</svg>`;
}

// ─────────────────────────────────────────────
// Band 2: 26–35  "The Climber"
// Confident upward pose — geometric figure mid-stride, coffee cup, upward arrow motif
// ─────────────────────────────────────────────
function svgClimber(b) {
    return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <circle cx="60" cy="65" r="55" fill="${b.accentC}"/>
  <!-- Upward arrow background motif -->
  <polygon points="60,12 72,30 64,30 64,48 56,48 56,30 48,30" fill="${b.accentA}" opacity="0.15"/>
  <!-- Body — slight forward lean -->
  <rect x="35" y="72" width="50" height="40" rx="18" fill="${b.accentA}"/>
  <!-- Collar / shirt detail -->
  <polygon points="60,72 52,80 60,78 68,80" fill="${b.accentC}"/>
  <!-- Neck -->
  <rect x="52" y="62" width="16" height="13" rx="6" fill="${b.accentB}"/>
  <!-- Head -->
  <ellipse cx="60" cy="50" rx="21" ry="21" fill="${b.accentB}"/>
  <!-- Eyes — focused, slightly narrowed -->
  <ellipse cx="52" cy="48" rx="4.5" ry="3.5" fill="white"/>
  <ellipse cx="68" cy="48" rx="4.5" ry="3.5" fill="white"/>
  <circle cx="53" cy="49" r="2.5" fill="${b.accentA}"/>
  <circle cx="69" cy="49" r="2.5" fill="${b.accentA}"/>
  <circle cx="54" cy="48" r="0.9" fill="white"/>
  <circle cx="70" cy="48" r="0.9" fill="white"/>
  <!-- Confident smile -->
  <path d="M52 57 Q60 63 68 57" stroke="${b.accentA}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Hair — short geometric wedge -->
  <ellipse cx="60" cy="31" rx="21" ry="10" fill="${b.accentA}"/>
  <!-- Coffee cup — right hand -->
  <rect x="82" y="85" width="14" height="16" rx="4" fill="white" stroke="${b.accentA}" stroke-width="2"/>
  <path d="M96 89 Q103 89 103 95 Q103 101 96 101" stroke="${b.accentA}" stroke-width="2" fill="none"/>
  <rect x="84" y="88" width="10" height="4" rx="1" fill="${b.accentB}" opacity="0.6"/>
  <!-- Steam lines above coffee -->
  <path d="M86 84 Q87 80 86 76" stroke="${b.accentB}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M91 83 Q92 79 91 75" stroke="${b.accentB}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>`;
}

// ─────────────────────────────────────────────
// Band 3: 36–45  "The Builder"
// Slightly harried but determined — hard hat (fun), tools motif, bold stance
// ─────────────────────────────────────────────
function svgBuilder(b) {
    return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <circle cx="60" cy="65" r="55" fill="${b.accentC}"/>
  <!-- Body — solid wide stance -->
  <rect x="33" y="73" width="54" height="40" rx="18" fill="${b.accentA}"/>
  <!-- Hi-vis stripe detail -->
  <rect x="33" y="85" width="54" height="6" rx="0" fill="${b.accentB}" opacity="0.5"/>
  <!-- Neck -->
  <rect x="52" y="63" width="16" height="13" rx="6" fill="${b.accentB}"/>
  <!-- Head -->
  <ellipse cx="60" cy="51" rx="21" ry="21" fill="${b.accentB}"/>
  <!-- Eyes — determined squint -->
  <ellipse cx="52" cy="49" rx="4" ry="3" fill="white"/>
  <ellipse cx="68" cy="49" rx="4" ry="3" fill="white"/>
  <circle cx="53" cy="50" r="2.5" fill="${b.accentA}"/>
  <circle cx="69" cy="50" r="2.5" fill="${b.accentA}"/>
  <circle cx="54" cy="49" r="0.9" fill="white"/>
  <circle cx="70" cy="49" r="0.9" fill="white"/>
  <!-- Slight wry smile -->
  <path d="M53 58 Q60 64 67 58" stroke="${b.accentA}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <!-- Hard hat -->
  <ellipse cx="60" cy="33" rx="24" ry="9" fill="${b.accentA}"/>
  <rect x="40" y="30" width="40" height="10" rx="5" fill="${b.accentA}"/>
  <rect x="38" y="36" width="44" height="5" rx="2" fill="${b.accentB}"/>
  <!-- Wrench in hand -->
  <rect x="82" y="80" width="6" height="22" rx="3" fill="${b.accentA}" transform="rotate(20 85 91)"/>
  <circle cx="83" cy="80" r="5" fill="none" stroke="${b.accentA}" stroke-width="3"/>
  <!-- Small sweat drop (harried!) -->
  <ellipse cx="78" cy="38" rx="3" ry="4.5" fill="${b.accentB}" opacity="0.7" transform="rotate(-15 78 38)"/>
</svg>`;
}

// ─────────────────────────────────────────────
// Band 4: 46–55  "The Strategist"
// Composed, thoughtful — reading glasses on head, neat geometric suit, calm expression
// ─────────────────────────────────────────────
function svgStrategist(b) {
    return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <circle cx="60" cy="65" r="55" fill="${b.accentC}"/>
  <!-- Suit body -->
  <rect x="34" y="73" width="52" height="40" rx="18" fill="${b.accentA}"/>
  <!-- Jacket lapels -->
  <polygon points="60,73 48,88 56,80" fill="${b.accentC}"/>
  <polygon points="60,73 72,88 64,80" fill="${b.accentC}"/>
  <!-- Tie -->
  <polygon points="60,78 56,95 60,98 64,95" fill="${b.accentB}"/>
  <!-- Neck -->
  <rect x="52" y="63" width="16" height="13" rx="6" fill="${b.accentB}"/>
  <!-- Head -->
  <ellipse cx="60" cy="51" rx="21" ry="21" fill="${b.accentB}"/>
  <!-- Eyes — calm, measured -->
  <ellipse cx="52" cy="49" rx="4.5" ry="3.5" fill="white"/>
  <ellipse cx="68" cy="49" rx="4.5" ry="3.5" fill="white"/>
  <circle cx="53" cy="50" r="2.5" fill="${b.accentA}"/>
  <circle cx="69" cy="50" r="2.5" fill="${b.accentA}"/>
  <circle cx="54" cy="49" r="0.9" fill="white"/>
  <circle cx="70" cy="49" r="0.9" fill="white"/>
  <!-- Subtle, composed smile -->
  <path d="M54 58 Q60 62 66 58" stroke="${b.accentA}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Hair — neat, greying at temples (lighter band) -->
  <ellipse cx="60" cy="32" rx="21" ry="9" fill="${b.accentA}"/>
  <ellipse cx="39" cy="40" rx="6" ry="8" fill="${b.accentC}" opacity="0.6"/>
  <ellipse cx="81" cy="40" rx="6" ry="8" fill="${b.accentC}" opacity="0.6"/>
  <!-- Glasses on head (not face — stylish) -->
  <rect x="45" y="30" width="12" height="6" rx="3" fill="none" stroke="${b.accentA}" stroke-width="2"/>
  <rect x="61" y="30" width="12" height="6" rx="3" fill="none" stroke="${b.accentA}" stroke-width="2"/>
  <line x1="57" y1="33" x2="61" y2="33" stroke="${b.accentA}" stroke-width="2"/>
  <line x1="43" y1="33" x2="45" y2="33" stroke="${b.accentA}" stroke-width="2"/>
  <line x1="73" y1="33" x2="75" y2="33" stroke="${b.accentA}" stroke-width="2"/>
</svg>`;
}

// ─────────────────────────────────────────────
// Band 5: 56–64  "The Coaster"
// Relaxed but sharp — open collar, slight lean back, knowing expression
// ─────────────────────────────────────────────
function svgCoaster(b) {
    return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <circle cx="60" cy="65" r="55" fill="${b.accentC}"/>
  <!-- Body — relaxed, slightly wider -->
  <rect x="32" y="74" width="56" height="40" rx="20" fill="${b.accentA}"/>
  <!-- Open collar shirt detail -->
  <polygon points="60,74 50,87 60,82 70,87" fill="${b.accentC}"/>
  <!-- Neck -->
  <rect x="52" y="64" width="16" height="13" rx="6" fill="${b.accentB}"/>
  <!-- Head — slightly rounder -->
  <ellipse cx="60" cy="52" rx="22" ry="21" fill="${b.accentB}"/>
  <!-- Eyes — relaxed, slightly crinkled -->
  <ellipse cx="51" cy="50" rx="4.5" ry="3" fill="white"/>
  <ellipse cx="69" cy="50" rx="4.5" ry="3" fill="white"/>
  <circle cx="52" cy="50" r="2.5" fill="${b.accentA}"/>
  <circle cx="70" cy="50" r="2.5" fill="${b.accentA}"/>
  <circle cx="53" cy="49" r="0.9" fill="white"/>
  <circle cx="71" cy="49" r="0.9" fill="white"/>
  <!-- Crow's feet (fun detail) -->
  <line x1="44" y1="48" x2="47" y2="52" stroke="${b.accentA}" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
  <line x1="44" y1="53" x2="47" y2="52" stroke="${b.accentA}" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
  <line x1="76" y1="48" x2="73" y2="52" stroke="${b.accentA}" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
  <line x1="76" y1="53" x2="73" y2="52" stroke="${b.accentA}" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
  <!-- Knowing smile -->
  <path d="M51 59 Q60 66 69 59" stroke="${b.accentA}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Hair — silver/lighter, thinner on top -->
  <ellipse cx="60" cy="33" rx="22" ry="7" fill="${b.accentA}" opacity="0.7"/>
  <ellipse cx="60" cy="34" rx="14" ry="5" fill="${b.accentC}" opacity="0.5"/>
  <!-- Sunset / horizon motif bottom -->
  <path d="M20 118 Q60 102 100 118" stroke="${b.accentB}" stroke-width="2" fill="none" opacity="0.5"/>
  <circle cx="60" cy="116" r="8" fill="${b.accentB}" opacity="0.3"/>
</svg>`;
}

// ─────────────────────────────────────────────
// Band 6: 65+  "The Enjoyer"
// Genuinely cheerful — sunglasses, open arms, sun motif, pure good vibes
// ─────────────────────────────────────────────
function svgEnjoyer(b) {
    return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <circle cx="60" cy="65" r="55" fill="${b.accentC}"/>
  <!-- Sun rays background -->
  <line x1="60" y1="8"  x2="60" y2="18"  stroke="${b.accentB}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="88" y1="16" x2="82" y2="24"  stroke="${b.accentB}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="32" y1="16" x2="38" y2="24"  stroke="${b.accentB}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="102" y1="40" x2="93" y2="44" stroke="${b.accentB}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  <line x1="18"  y1="40" x2="27" y2="44" stroke="${b.accentB}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  <!-- Body — relaxed wide open posture, arms out -->
  <rect x="34" y="74" width="52" height="38" rx="20" fill="${b.accentA}"/>
  <!-- Arms out wide -->
  <rect x="10" y="78" width="28" height="12" rx="6" fill="${b.accentA}" transform="rotate(-15 24 84)"/>
  <rect x="82" y="78" width="28" height="12" rx="6" fill="${b.accentA}" transform="rotate(15 96 84)"/>
  <!-- Neck -->
  <rect x="52" y="64" width="16" height="13" rx="6" fill="${b.accentB}"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="21" fill="${b.accentB}"/>
  <!-- Big beaming smile -->
  <path d="M48 60 Q60 72 72 60" stroke="${b.accentA}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- Cheek blush dots -->
  <circle cx="46" cy="57" r="5" fill="${b.accentA}" opacity="0.2"/>
  <circle cx="74" cy="57" r="5" fill="${b.accentA}" opacity="0.2"/>
  <!-- Cool sunglasses -->
  <rect x="42" y="45" width="14" height="9" rx="4" fill="${b.accentA}"/>
  <rect x="62" y="45" width="14" height="9" rx="4" fill="${b.accentA}"/>
  <line x1="56" y1="49" x2="62" y2="49" stroke="${b.accentA}" stroke-width="2.5"/>
  <line x1="38" y1="49" x2="42" y2="49" stroke="${b.accentA}" stroke-width="2"/>
  <line x1="76" y1="49" x2="80" y2="49" stroke="${b.accentA}" stroke-width="2"/>
  <!-- Highlight on lenses -->
  <rect x="44" y="47" width="5" height="3" rx="1.5" fill="white" opacity="0.35"/>
  <rect x="64" y="47" width="5" height="3" rx="1.5" fill="white" opacity="0.35"/>
  <!-- Hair — white/silver wisps -->
  <path d="M38 35 Q45 28 52 33" stroke="${b.accentA}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M68 33 Q75 28 82 35" stroke="${b.accentA}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
</svg>`;
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
const RENDERERS = [svgGraduate, svgClimber, svgBuilder, svgStrategist, svgCoaster, svgEnjoyer];

/**
 * Returns an SVG string for the given age.
 * @param {number} age
 * @returns {string} Raw SVG markup
 */
export function getAvatarSVG(age) {
    const idx = AVATAR_BANDS.findIndex(b => (parseInt(age) || 25) >= b.minAge && (parseInt(age) || 25) <= b.maxAge);
    const bandIdx = idx === -1 ? 0 : idx;
    return RENDERERS[bandIdx](AVATAR_BANDS[bandIdx]);
}

/**
 * Returns the background colour for the avatar's band — used to tint persona card headers.
 * @param {number} age
 * @returns {string} CSS colour string
 */
export function getAvatarBgColor(age) {
    return getAvatarBand(age).bgColor;
}

/**
 * Returns the band label ("The Graduate", etc.) for a given age.
 * @param {number} age
 * @returns {string}
 */
export function getAvatarLabel(age) {
    return getAvatarBand(age).label;
}
