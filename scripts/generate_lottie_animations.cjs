/**
 * generate_lottie_animations.cjs
 * Generates lightweight, beautiful, 60 FPS Lottie JSON animations for Valeria's Toddler Jukebox.
 */

const fs = require('fs');
const path = require('path');

const animDir = path.join(__dirname, '..', 'public', 'animations');
fs.mkdirSync(animDir, { recursive: true });

function createBaseLottie(name, layers, width = 400, height = 400, frames = 180) {
  return {
    v: '5.5.7',
    fr: 60,
    ip: 0,
    op: frames,
    w: width,
    h: height,
    nm: name,
    ddd: 0,
    assets: [],
    layers: layers
  };
}

// Helper to make an animated shape layer
function makeEllipseLayer(name, cx, cy, rx, ry, colorRgba, animType = 'pulse', layerIndex = 0) {
  let scaleProp;
  if (animType === 'pulse') {
    scaleProp = {
      a: 1,
      k: [
        { t: 0, s: [100, 100], e: [112, 112] },
        { t: 45, s: [112, 112], e: [95, 95] },
        { t: 90, s: [95, 95], e: [110, 110] },
        { t: 135, s: [110, 110], e: [98, 98] },
        { t: 180, s: [98, 98], e: [100, 100] }
      ]
    };
  } else if (animType === 'bounce') {
    scaleProp = {
      a: 1,
      k: [
        { t: 0, s: [100, 100], e: [90, 115] },
        { t: 45, s: [90, 115], e: [115, 88] },
        { t: 90, s: [115, 88], e: [92, 112] },
        { t: 135, s: [92, 112], e: [108, 94] },
        { t: 180, s: [108, 94], e: [100, 100] }
      ]
    };
  } else {
    scaleProp = { a: 0, k: [100, 100] };
  }

  let posProp;
  if (animType === 'sway') {
    posProp = {
      a: 1,
      k: [
        { t: 0, s: [cx, cy], e: [cx + 12, cy - 4] },
        { t: 60, s: [cx + 12, cy - 4], e: [cx - 12, cy - 4] },
        { t: 120, s: [cx - 12, cy - 4], e: [cx + 8, cy - 2] },
        { t: 180, s: [cx + 8, cy - 2], e: [cx, cy] }
      ]
    };
  } else if (animType === 'float') {
    posProp = {
      a: 1,
      k: [
        { t: 0, s: [cx, cy], e: [cx, cy - 16] },
        { t: 90, s: [cx, cy - 16], e: [cx, cy] },
        { t: 180, s: [cx, cy], e: [cx, cy - 16] }
      ]
    };
  } else {
    posProp = { a: 0, k: [cx, cy] };
  }

  return {
    ddd: 0,
    ind: layerIndex,
    ty: 4, // shape layer
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: posProp,
      a: { a: 0, k: [0, 0] },
      s: scaleProp
    },
    shapes: [
      {
        ty: 'gr',
        it: [
          {
            ty: 'el',
            d: 1,
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [rx * 2, ry * 2] }
          },
          {
            ty: 'fl',
            c: { a: 0, k: colorRgba },
            o: { a: 0, k: 100 }
          },
          {
            ty: 'tr',
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 }
          }
        ]
      }
    ]
  };
}

// 1. Mommy Bear & Baby Bear (Pastel Pink & Warm Caramel Brown)
const mommyLayers = [
  makeEllipseLayer('BlossomTreeCanopy', 200, 130, 110, 80, [1, 0.75, 0.85, 0.85], 'sway', 1),
  makeEllipseLayer('MamaBearBody', 160, 260, 55, 65, [0.72, 0.45, 0.2, 1], 'pulse', 2),
  makeEllipseLayer('MamaBearHead', 160, 190, 42, 40, [0.72, 0.45, 0.2, 1], 'sway', 3),
  makeEllipseLayer('BabyBearBody', 245, 280, 36, 42, [0.85, 0.62, 0.35, 1], 'pulse', 4),
  makeEllipseLayer('BabyBearHead', 245, 230, 28, 26, [0.85, 0.62, 0.35, 1], 'sway', 5),
  makeEllipseLayer('FloatingHeart1', 205, 175, 18, 18, [1, 0.25, 0.45, 0.95], 'float', 6),
  makeEllipseLayer('FloatingHeart2', 225, 140, 14, 14, [1, 0.4, 0.6, 0.9], 'float', 7)
];
fs.writeFileSync(path.join(animDir, 'mommy_lottie.json'), JSON.stringify(createBaseLottie('MommyBear', mommyLayers), null, 2));

// 2. You Are My Sunshine (Sun + Sunglasses + Sunflowers)
const sunshineLayers = [
  makeEllipseLayer('SunAura', 200, 170, 95, 95, [1, 0.92, 0.4, 0.5], 'pulse', 1),
  makeEllipseLayer('SunCore', 200, 170, 75, 75, [1, 0.78, 0.1, 1], 'bounce', 2),
  makeEllipseLayer('SunGlassesL', 178, 160, 22, 16, [0.12, 0.15, 0.22, 0.95], 'bounce', 3),
  makeEllipseLayer('SunGlassesR', 222, 160, 22, 16, [0.12, 0.15, 0.22, 0.95], 'bounce', 4),
  makeEllipseLayer('SunflowerLeft', 90, 320, 38, 38, [1, 0.72, 0.1, 1], 'sway', 5),
  makeEllipseLayer('SunflowerRight', 310, 320, 38, 38, [1, 0.72, 0.1, 1], 'sway', 6),
  makeEllipseLayer('CloudFloat', 200, 290, 60, 24, [1, 1, 1, 0.9], 'sway', 7)
];
fs.writeFileSync(path.join(animDir, 'sunshine_lottie.json'), JSON.stringify(createBaseLottie('Sunshine', sunshineLayers), null, 2));

// 3. Five Little Monkeys (Bouncy Striped Bed + Jumping Monkeys)
const monkeysLayers = [
  makeEllipseLayer('BedMattress', 200, 310, 140, 42, [0.25, 0.65, 0.95, 1], 'bounce', 1),
  makeEllipseLayer('Monkey1Head', 140, 190, 26, 24, [0.58, 0.35, 0.18, 1], 'bounce', 2),
  makeEllipseLayer('Monkey2Head', 200, 150, 30, 28, [0.58, 0.35, 0.18, 1], 'float', 3),
  makeEllipseLayer('Monkey3Head', 260, 190, 26, 24, [0.58, 0.35, 0.18, 1], 'bounce', 4),
  makeEllipseLayer('PillowFluff', 100, 290, 35, 22, [1, 1, 1, 0.95], 'pulse', 5)
];
fs.writeFileSync(path.join(animDir, 'monkeys_lottie.json'), JSON.stringify(createBaseLottie('FiveMonkeys', monkeysLayers), null, 2));

// 4. Twinkle, Twinkle, Little Star (Constellations + Moon + Stars)
const twinkleLayers = [
  makeEllipseLayer('NightAura', 200, 200, 160, 160, [0.12, 0.18, 0.38, 0.45], 'pulse', 1),
  makeEllipseLayer('CrescentMoon', 290, 110, 38, 38, [1, 0.95, 0.7, 1], 'sway', 2),
  makeEllipseLayer('MainStarGlow', 200, 190, 35, 35, [1, 0.9, 0.3, 0.6], 'pulse', 3),
  makeEllipseLayer('MainStarCore', 200, 190, 22, 22, [1, 1, 1, 1], 'pulse', 4),
  makeEllipseLayer('StarSmall1', 110, 130, 14, 14, [1, 0.95, 0.6, 0.9], 'bounce', 5),
  makeEllipseLayer('StarSmall2', 130, 260, 16, 16, [1, 0.95, 0.6, 0.9], 'float', 6),
  makeEllipseLayer('StarSmall3', 270, 280, 14, 14, [1, 0.95, 0.6, 0.9], 'bounce', 7)
];
fs.writeFileSync(path.join(animDir, 'twinkle_lottie.json'), JSON.stringify(createBaseLottie('TwinkleStar', twinkleLayers), null, 2));

// 5. Old MacDonald Farm (Red Barn + Cow & Pig)
const farmLayers = [
  makeEllipseLayer('BarnRoof', 200, 170, 75, 45, [0.85, 0.22, 0.22, 1], 'pulse', 1),
  makeEllipseLayer('CowHead', 140, 260, 38, 34, [0.95, 0.95, 0.95, 1], 'sway', 2),
  makeEllipseLayer('CowSpot', 150, 255, 16, 14, [0.2, 0.2, 0.2, 1], 'sway', 3),
  makeEllipseLayer('PigHead', 260, 270, 32, 28, [1, 0.72, 0.8, 1], 'bounce', 4),
  makeEllipseLayer('PigSnout', 260, 276, 15, 10, [1, 0.55, 0.68, 1], 'bounce', 5),
  makeEllipseLayer('PastureGrass', 200, 340, 170, 45, [0.32, 0.72, 0.42, 1], 'pulse', 6)
];
fs.writeFileSync(path.join(animDir, 'farm_lottie.json'), JSON.stringify(createBaseLottie('FarmAnimals', farmLayers), null, 2));

// 6. Rock-a-Bye Baby (Cradle in Tree + Fireflies)
const lullabyLayers = [
  makeEllipseLayer('TreeBough', 200, 140, 110, 28, [0.45, 0.28, 0.15, 1], 'sway', 1),
  makeEllipseLayer('CradleBody', 200, 240, 65, 45, [0.85, 0.68, 0.42, 1], 'sway', 2),
  makeEllipseLayer('BabyBlanket', 200, 230, 48, 28, [0.65, 0.88, 1, 1], 'sway', 3),
  makeEllipseLayer('Firefly1', 110, 210, 12, 12, [0.95, 1, 0.4, 0.9], 'float', 4),
  makeEllipseLayer('Firefly2', 290, 190, 14, 14, [0.95, 1, 0.4, 0.9], 'float', 5),
  makeEllipseLayer('SleepingMoon', 90, 90, 32, 32, [1, 0.95, 0.75, 0.9], 'pulse', 6)
];
fs.writeFileSync(path.join(animDir, 'lullaby_lottie.json'), JSON.stringify(createBaseLottie('RockAByeBaby', lullabyLayers), null, 2));

console.log('✨ All 6 Lottie animation JSON files created in /public/animations/!');
