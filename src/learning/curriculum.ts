/**
 * curriculum.ts
 * Upgraded Bilingual (English & Français) Early Learning Curriculum
 * tailored for 1-year-olds (12 to 24 months), uniting best practices from
 * top-rated infant apps (Their First Words, Peekaboo Barn, Bimi Boo,
 * Fisher-Price Laugh & Learn, Pok Pok, and Speech Blubs).
 *
 * Zero-failure design: every tap gives immediate warm voice modeling,
 * joyful visual motion, and musical reinforcement.
 */

import type { AppLanguage } from '../state/AppPreferences';

export type LessonId =
  | 'first_words'
  | 'peekaboo_barn'
  | 'animal_friends'
  | 'shape_sorter'
  | 'colors_shapes'
  | 'abc_phonics'
  | 'vehicles_go'
  | 'body_parts'
  | 'counting_1_5'
  | 'opposites_play'
  | 'mouth_gym'
  | 'emotions';

export interface BilingualText {
  en: string;
  fr: string;
}

export interface LessonCardMeta {
  id: LessonId;
  title: BilingualText;
  subtitle: BilingualText;
  coPlayTip: BilingualText;
  icon: string;
  themeColor: string;
  accentColor: string;
  badge?: BilingualText;
}

export const LESSONS_META: LessonCardMeta[] = [
  {
    id: 'first_words',
    title: { en: 'First Words', fr: 'Premiers Mots' },
    subtitle: { en: '24 Words · 3 Modes', fr: '24 Mots · 3 Modes' },
    coPlayTip: {
      en: 'Try 1-Card mode: say the word slowly, smile, and wait 3 seconds for baby to babble back!',
      fr: 'Essayez le mode 1 Carte : dites le mot doucement et attendez 3 secondes que bébé réponde !',
    },
    icon: '🍎',
    themeColor: '#FF6B6B',
    accentColor: '#FFE5E5',
    badge: { en: 'UPDATED', fr: 'AMÉLIORÉ' },
  },
  {
    id: 'peekaboo_barn',
    title: { en: 'Peekaboo Barn', fr: 'Coucou la Grange' },
    subtitle: { en: 'Who Is Inside?', fr: 'Qui Est Caché ?' },
    coPlayTip: {
      en: 'Ask "Who is inside?" before tapping the barn doors to build anticipation and giggles!',
      fr: 'Demandez « Qui est caché ? » avant d’ouvrir les portes pour stimuler la surprise !',
    },
    icon: '🏠',
    themeColor: '#E63946',
    accentColor: '#FFE3E6',
    badge: { en: 'NEW', fr: 'NOUVEAU' },
  },
  {
    id: 'shape_sorter',
    title: { en: 'Shape Sorter', fr: 'Boîte à Formes' },
    subtitle: { en: 'Match & Snap', fr: 'Associe & Clique' },
    coPlayTip: {
      en: 'Point to the glowing cutout and say the shape name together as it snaps in!',
      fr: 'Montrez le trou lumineux et répétez le nom de la forme ensemble !',
    },
    icon: '🧩',
    themeColor: '#F4A261',
    accentColor: '#FFF1E0',
    badge: { en: 'NEW', fr: 'NOUVEAU' },
  },
  {
    id: 'mouth_gym',
    title: { en: 'Baby Sound Mirror', fr: 'Miroir des Sons' },
    subtitle: { en: 'Ba-ba, Ma-ma & Ooh!', fr: 'Ba-ba, Ma-ma & Oh !' },
    coPlayTip: {
      en: 'Face your baby and copy the animated mouth shape together—exaggerated lips spark imitation!',
      fr: 'Faites face à bébé et imitez ensemble la forme de la bouche pour encourager les premiers sons !',
    },
    icon: '🗣️',
    themeColor: '#FF6B8B',
    accentColor: '#FFE4EE',
    badge: { en: 'NEW', fr: 'NOUVEAU' },
  },
  {
    id: 'abc_phonics',
    title: { en: 'ABC Blocks', fr: 'Cubes ABC' },
    subtitle: { en: 'Tap Letters A–Z', fr: 'Lettres A à Z' },
    coPlayTip: {
      en: 'Start with letters in your baby’s name (like V for Valeria!) and celebrate every tap.',
      fr: 'Commencez par les lettres du prénom de bébé et célébrez chaque touche !',
    },
    icon: '🔤',
    themeColor: '#4361EE',
    accentColor: '#E0E7FF',
    badge: { en: 'NEW', fr: 'NOUVEAU' },
  },
  {
    id: 'vehicles_go',
    title: { en: 'Things That Go!', fr: 'Les Véhicules' },
    subtitle: { en: 'Beep, Choo-Choo!', fr: 'Tut-tut, Tchou !' },
    coPlayTip: {
      en: 'Make the vehicle sounds together ("Vroom!", "Choo-choo!")—playful sounds come before words.',
      fr: 'Faites les bruits ensemble (« Vroum ! », « Tchou-tchou ! ») : les onomatopées préparent la parole.',
    },
    icon: '🚗',
    themeColor: '#FF9F1C',
    accentColor: '#FFF3D6',
    badge: { en: 'NEW', fr: 'NOUVEAU' },
  },
  {
    id: 'opposites_play',
    title: { en: 'Big & Small', fr: 'Grand & Petit' },
    subtitle: { en: 'Play Opposites', fr: 'Les Contraires' },
    coPlayTip: {
      en: 'Use big arm gestures for BIG / UP and tiny hands for SMALL / DOWN while tapping!',
      fr: 'Ouvrez grands les bras pour GRAND / HAUT et rapprochez les mains pour PETIT / BAS !',
    },
    icon: '🐘',
    themeColor: '#06D6A0',
    accentColor: '#D8FBF0',
    badge: { en: 'NEW', fr: 'NOUVEAU' },
  },
  {
    id: 'animal_friends',
    title: { en: 'Animal Sounds', fr: 'Cris des Animaux' },
    subtitle: { en: 'Listen & Imitate', fr: 'Écoute et Imite' },
    coPlayTip: {
      en: 'Animal sounds like "Moo" and "Woof" are officially counted as babies’ very first words!',
      fr: 'Les cris d’animaux (« Meuh », « Ouaf ») comptent comme de vrais premiers mots !',
    },
    icon: '🐮',
    themeColor: '#52B788',
    accentColor: '#D8F3DC',
  },
  {
    id: 'colors_shapes',
    title: { en: 'Colors & Shapes', fr: 'Couleurs & Formes' },
    subtitle: { en: 'Pop & Glow', fr: 'Touche et Brille' },
    coPlayTip: {
      en: 'Point to something in the room with the same color after tapping a glowing shape.',
      fr: 'Montrez un objet de la même couleur dans la pièce après avoir touché une forme !',
    },
    icon: '⭐',
    themeColor: '#FFB703',
    accentColor: '#FFF6CC',
  },
  {
    id: 'body_parts',
    title: { en: 'My Body Parts', fr: 'Mon Corps' },
    subtitle: { en: 'Boop Baby Bear!', fr: 'Touche Petit Ours !' },
    coPlayTip: {
      en: 'Boop Baby Bear’s nose, then gently boop your baby’s nose so they connect screen to self!',
      fr: 'Touchez le nez de Petit Ours puis doucement le nez de bébé pour faire le lien !',
    },
    icon: '🐻',
    themeColor: '#48CAE4',
    accentColor: '#CAF0F8',
  },
  {
    id: 'counting_1_5',
    title: { en: 'Count 1 to 5', fr: 'Compter 1 à 5' },
    subtitle: { en: 'Tap & Count', fr: 'Touche et Compte' },
    coPlayTip: {
      en: 'Count on your fingers alongside the screen—1, 2, 3, 4, 5—and clap at 5!',
      fr: 'Comptez sur vos doigts en même temps que l’écran (1, 2, 3, 4, 5) puis applaudissez !',
    },
    icon: '🎈',
    themeColor: '#7209B7',
    accentColor: '#E0AAFF',
  },
  {
    id: 'emotions',
    title: { en: 'Happy & Silly', fr: 'Émotions' },
    subtitle: { en: 'Peek-a-Boo Faces', fr: 'Visages Rigolos' },
    coPlayTip: {
      en: 'Make the same happy, surprised, or sleepy face with your baby to build early empathy!',
      fr: 'Faites la même grimace joyeuse, surprise ou fatiguée avec bébé !',
    },
    icon: '😊',
    themeColor: '#F72585',
    accentColor: '#FFD1DC',
  },
];

// ============================================================================
// 1. FIRST WORDS (24 Words across 4 Toddler Categories)
// ============================================================================
export type WordCategoryId = 'everyday' | 'food' | 'home' | 'nature';

export interface WordCategoryMeta {
  id: WordCategoryId;
  icon: string;
  label: BilingualText;
}

export const WORD_CATEGORIES: WordCategoryMeta[] = [
  { id: 'everyday', icon: '🧸', label: { en: 'Toys & Play', fr: 'Jouets' } },
  { id: 'food', icon: '🍓', label: { en: 'Yummy Food', fr: 'Miam' } },
  { id: 'home', icon: '🏡', label: { en: 'Family & Home', fr: 'Maison' } },
  { id: 'nature', icon: '🌞', label: { en: 'Nature', fr: 'Nature' } },
];

export interface WordItem {
  id: string;
  category: WordCategoryId;
  emoji?: string; // Used when custom SVG isn't present in LessonArt
  label: BilingualText;
  spoken: BilingualText;
  findPrompt: BilingualText;
  color: string;
  sfx: string;
}

export const FIRST_WORDS: WordItem[] = [
  // Everyday / Toys & Play
  {
    id: 'ball',
    category: 'everyday',
    label: { en: 'Ball', fr: 'Balle' },
    spoken: { en: 'Ball! Bounce the ball!', fr: 'Balle ! La belle balle !' },
    findPrompt: { en: 'Where is the ball?', fr: 'Où est la balle ?' },
    color: '#FF6B6B',
    sfx: 'boing.mp3',
  },
  {
    id: 'book',
    category: 'everyday',
    label: { en: 'Book', fr: 'Livre' },
    spoken: { en: 'Book! Let us read a book!', fr: 'Livre ! On lit un livre !' },
    findPrompt: { en: 'Where is the book?', fr: 'Où est le livre ?' },
    color: '#4361EE',
    sfx: 'chime.mp3',
  },
  {
    id: 'car',
    category: 'everyday',
    label: { en: 'Car', fr: 'Voiture' },
    spoken: { en: 'Car! Beep beep goes the car!', fr: 'Voiture ! Tut tut la voiture !' },
    findPrompt: { en: 'Where is the car?', fr: 'Où est la voiture ?' },
    color: '#FF9F1C',
    sfx: 'horn_car.mp3',
  },
  {
    id: 'teddy',
    category: 'everyday',
    emoji: '🧸',
    label: { en: 'Teddy', fr: 'Doudou' },
    spoken: { en: 'Teddy bear! Soft cuddly teddy!', fr: 'Doudou ! Doux petit doudou !' },
    findPrompt: { en: 'Where is the teddy?', fr: 'Où est le doudou ?' },
    color: '#D4A373',
    sfx: 'squeak.mp3',
  },
  {
    id: 'duck_toy',
    category: 'everyday',
    emoji: '🦆',
    label: { en: 'Duck', fr: 'Canard' },
    spoken: { en: 'Duck! Squeak squeak yellow duck!', fr: 'Canard ! Coin coin petit canard !' },
    findPrompt: { en: 'Where is the duck?', fr: 'Où est le canard ?' },
    color: '#FFD166',
    sfx: 'duck.mp3',
  },
  {
    id: 'blocks',
    category: 'everyday',
    emoji: '🧱',
    label: { en: 'Blocks', fr: 'Cubes' },
    spoken: { en: 'Blocks! Stack the blocks up high!', fr: 'Cubes ! On empile les cubes !' },
    findPrompt: { en: 'Where are the blocks?', fr: 'Où sont les cubes ?' },
    color: '#06D6A0',
    sfx: 'woodblock.mp3',
  },

  // Yummy Food
  {
    id: 'apple',
    category: 'food',
    label: { en: 'Apple', fr: 'Pomme' },
    spoken: { en: 'Apple! Yummy red apple!', fr: 'Pomme ! Miam, la pomme rouge !' },
    findPrompt: { en: 'Where is the apple?', fr: 'Où est la pomme ?' },
    color: '#EF233C',
    sfx: 'chime.mp3',
  },
  {
    id: 'banana',
    category: 'food',
    emoji: '🍌',
    label: { en: 'Banana', fr: 'Banane' },
    spoken: { en: 'Banana! Sweet yellow banana!', fr: 'Banane ! Bonne banane jaune !' },
    findPrompt: { en: 'Where is the banana?', fr: 'Où est la banane ?' },
    color: '#FFCA3A',
    sfx: 'chime.mp3',
  },
  {
    id: 'milk',
    category: 'food',
    emoji: '🍼',
    label: { en: 'Milk', fr: 'Lait' },
    spoken: { en: 'Milk! Warm yummy milk!', fr: 'Lait ! Bon petit lait !' },
    findPrompt: { en: 'Where is the milk?', fr: 'Où est le lait ?' },
    color: '#4CC9F0',
    sfx: 'bubbles.mp3',
  },
  {
    id: 'cup',
    category: 'food',
    label: { en: 'Cup', fr: 'Tasse' },
    spoken: { en: 'Cup! Drink from the cup!', fr: 'Tasse ! Boire dans la tasse !' },
    findPrompt: { en: 'Where is the cup?', fr: 'Où est la tasse ?' },
    color: '#48CAE4',
    sfx: 'bubbles.mp3',
  },
  {
    id: 'strawberry',
    category: 'food',
    emoji: '🍓',
    label: { en: 'Berry', fr: 'Fraise' },
    spoken: { en: 'Strawberry! Sweet red berry!', fr: 'Fraise ! Jolie fraise sucrée !' },
    findPrompt: { en: 'Where is the berry?', fr: 'Où est la fraise ?' },
    color: '#F72585',
    sfx: 'chime.mp3',
  },
  {
    id: 'cookie',
    category: 'food',
    emoji: '🍪',
    label: { en: 'Cookie', fr: 'Biscuit' },
    spoken: { en: 'Cookie! Crunch crunch cookie!', fr: 'Biscuit ! Miam le bon biscuit !' },
    findPrompt: { en: 'Where is the cookie?', fr: 'Où est le biscuit ?' },
    color: '#C98A5B',
    sfx: 'woodblock.mp3',
  },

  // Family & Home
  {
    id: 'mama',
    category: 'home',
    emoji: '👩',
    label: { en: 'Mama', fr: 'Maman' },
    spoken: { en: 'Mama! I love you Mama!', fr: 'Maman ! Je t aime Maman !' },
    findPrompt: { en: 'Where is Mama?', fr: 'Où est Maman ?' },
    color: '#FF6B8B',
    sfx: 'chime.mp3',
  },
  {
    id: 'dada',
    category: 'home',
    emoji: '👨',
    label: { en: 'Dada', fr: 'Papa' },
    spoken: { en: 'Dada! Hi Dada!', fr: 'Papa ! Coucou Papa !' },
    findPrompt: { en: 'Where is Dada?', fr: 'Où est Papa ?' },
    color: '#4361EE',
    sfx: 'chime.mp3',
  },
  {
    id: 'bed',
    category: 'home',
    emoji: '🛏️',
    label: { en: 'Bed', fr: 'Lit' },
    spoken: { en: 'Bed! Cozy sleepy bed!', fr: 'Lit ! Dodo dans le lit !' },
    findPrompt: { en: 'Where is the bed?', fr: 'Où est le lit ?' },
    color: '#9D4EDD',
    sfx: 'snore.mp3',
  },
  {
    id: 'bath',
    category: 'home',
    emoji: '🛁',
    label: { en: 'Bath', fr: 'Bain' },
    spoken: { en: 'Bath! Splash splash in the bath!', fr: 'Bain ! Plouf plouf dans le bain !' },
    findPrompt: { en: 'Where is the bath?', fr: 'Où est le bain ?' },
    color: '#48CAE4',
    sfx: 'splash.mp3',
  },
  {
    id: 'shoe',
    category: 'home',
    emoji: '👟',
    label: { en: 'Shoe', fr: 'Chaussure' },
    spoken: { en: 'Shoe! Put on your little shoe!', fr: 'Chaussure ! Ta petite chaussure !' },
    findPrompt: { en: 'Where is the shoe?', fr: 'Où est la chaussure ?' },
    color: '#06D6A0',
    sfx: 'boing.mp3',
  },
  {
    id: 'hat',
    category: 'home',
    emoji: '👒',
    label: { en: 'Hat', fr: 'Chapeau' },
    spoken: { en: 'Hat! Pretty hat on your head!', fr: 'Chapeau ! Un joli chapeau !' },
    findPrompt: { en: 'Where is the hat?', fr: 'Où est le chapeau ?' },
    color: '#F4A261',
    sfx: 'squeak.mp3',
  },

  // Nature
  {
    id: 'sun',
    category: 'nature',
    label: { en: 'Sun', fr: 'Soleil' },
    spoken: { en: 'Sun! Bright sunny sun!', fr: 'Soleil ! Beau soleil qui brille !' },
    findPrompt: { en: 'Where is the sun?', fr: 'Où est le soleil ?' },
    color: '#FFD166',
    sfx: 'chime.mp3',
  },
  {
    id: 'moon',
    category: 'nature',
    label: { en: 'Moon', fr: 'Lune' },
    spoken: { en: 'Moon! Goodnight little moon!', fr: 'Lune ! Bonne nuit petite lune !' },
    findPrompt: { en: 'Where is the moon?', fr: 'Où est la lune ?' },
    color: '#7209B7',
    sfx: 'chime.mp3',
  },
  {
    id: 'flower',
    category: 'nature',
    label: { en: 'Flower', fr: 'Fleur' },
    spoken: { en: 'Flower! Pretty pink flower!', fr: 'Fleur ! Jolie fleur rose !' },
    findPrompt: { en: 'Where is the flower?', fr: 'Où est la fleur ?' },
    color: '#FF6B8B',
    sfx: 'chime.mp3',
  },
  {
    id: 'tree',
    category: 'nature',
    emoji: '🌳',
    label: { en: 'Tree', fr: 'Arbre' },
    spoken: { en: 'Tree! Big green tree!', fr: 'Arbre ! Grand arbre vert !' },
    findPrompt: { en: 'Where is the tree?', fr: 'Où est l arbre ?' },
    color: '#52B788',
    sfx: 'chime.mp3',
  },
  {
    id: 'rain',
    category: 'nature',
    emoji: '🌧️',
    label: { en: 'Rain', fr: 'Pluie' },
    spoken: { en: 'Rain! Drip drop goes the rain!', fr: 'Pluie ! Plic ploc la pluie !' },
    findPrompt: { en: 'Where is the rain?', fr: 'Où est la pluie ?' },
    color: '#1982C4',
    sfx: 'rain.mp3',
  },
  {
    id: 'star',
    category: 'nature',
    emoji: '⭐',
    label: { en: 'Star', fr: 'Étoile' },
    spoken: { en: 'Star! Twinkle little star!', fr: 'Étoile ! Petite étoile qui brille !' },
    findPrompt: { en: 'Where is the star?', fr: 'Où est l étoile ?' },
    color: '#FFB703',
    sfx: 'crystal_ping.mp3',
  },
];

// ============================================================================
// 2. PEEKABOO BARN ANIMALS (Cloned from Peekaboo Barn)
// ============================================================================
export interface BarnAnimalItem {
  id: string;
  emoji: string;
  label: BilingualText;
  soundWord: BilingualText;
  revealSpeech: BilingualText;
  sfx: string;
  bgTint: string;
}

export const BARN_ANIMALS: BarnAnimalItem[] = [
  {
    id: 'cow',
    emoji: '🐮',
    label: { en: 'Cow', fr: 'Vache' },
    soundWord: { en: 'MOO!', fr: 'MEUH !' },
    revealSpeech: { en: 'Peekaboo! It is a Cow! Moo!', fr: 'Coucou ! C est la Vache ! Meuh !' },
    sfx: 'cow.mp3',
    bgTint: '#D8F3DC',
  },
  {
    id: 'dog',
    emoji: '🐶',
    label: { en: 'Puppy', fr: 'Chien' },
    soundWord: { en: 'WOOF!', fr: 'OUAF !' },
    revealSpeech: { en: 'Peekaboo! It is a Puppy! Woof woof!', fr: 'Coucou ! C est le Chien ! Ouaf ouaf !' },
    sfx: 'dog.mp3',
    bgTint: '#FFE8D6',
  },
  {
    id: 'cat',
    emoji: '🐱',
    label: { en: 'Kitty', fr: 'Chat' },
    soundWord: { en: 'MEOW!', fr: 'MIAOU !' },
    revealSpeech: { en: 'Peekaboo! It is a Kitty! Meow!', fr: 'Coucou ! C est le Chat ! Miaou !' },
    sfx: 'meow.mp3',
    bgTint: '#FFF3B0',
  },
  {
    id: 'duck',
    emoji: '🦆',
    label: { en: 'Duck', fr: 'Canard' },
    soundWord: { en: 'QUACK!', fr: 'COIN !' },
    revealSpeech: { en: 'Peekaboo! It is a Duck! Quack quack!', fr: 'Coucou ! C est le Canard ! Coin coin !' },
    sfx: 'duck.mp3',
    bgTint: '#CAF0F8',
  },
  {
    id: 'sheep',
    emoji: '🐑',
    label: { en: 'Sheep', fr: 'Mouton' },
    soundWord: { en: 'BAA!', fr: 'BÊÊ !' },
    revealSpeech: { en: 'Peekaboo! It is a Sheep! Baa!', fr: 'Coucou ! C est le Mouton ! Bêê !' },
    sfx: 'sheep.mp3',
    bgTint: '#E0FBFC',
  },
  {
    id: 'elephant',
    emoji: '🐘',
    label: { en: 'Elephant', fr: 'Éléphant' },
    soundWord: { en: 'TOOT!', fr: 'POUET !' },
    revealSpeech: { en: 'Peekaboo! Big Elephant!', fr: 'Coucou ! Le grand Éléphant !' },
    sfx: 'elephant.mp3',
    bgTint: '#E0E7FF',
  },
  {
    id: 'bird',
    emoji: '🐦',
    label: { en: 'Birdie', fr: 'Oiseau' },
    soundWord: { en: 'CUCKOO!', fr: 'COUCOU !' },
    revealSpeech: { en: 'Peekaboo! Little Birdie! Tweet tweet!', fr: 'Coucou ! Le petit Oiseau ! Cui cui !' },
    sfx: 'cuckoo.mp3',
    bgTint: '#D8F3DC',
  },
  {
    id: 'monkey',
    emoji: '🐵',
    label: { en: 'Monkey', fr: 'Singe' },
    soundWord: { en: 'OOH AAH!', fr: 'OUH AH !' },
    revealSpeech: { en: 'Peekaboo! Silly Monkey!', fr: 'Coucou ! Le petit Singe !' },
    sfx: 'monkey.mp3',
    bgTint: '#F2E5FF',
  },
];

// ============================================================================
// 3. ANIMAL FRIENDS
// ============================================================================
export interface AnimalItem {
  id: string;
  label: BilingualText;
  soundWord: BilingualText;
  spoken: BilingualText;
  color: string;
  sfx: string;
}

export const ANIMAL_FRIENDS: AnimalItem[] = [
  {
    id: 'cow',
    label: { en: 'Cow', fr: 'Vache' },
    soundWord: { en: 'MOO!', fr: 'MEUH !' },
    spoken: { en: 'Cow! The cow says Moo!', fr: 'La vache ! La vache fait Meuh !' },
    color: '#52B788',
    sfx: 'cow.mp3',
  },
  {
    id: 'dog',
    label: { en: 'Puppy', fr: 'Chien' },
    soundWord: { en: 'WOOF!', fr: 'OUAF !' },
    spoken: { en: 'Puppy! The puppy says Woof woof!', fr: 'Le chien ! Le chien fait Ouaf ouaf !' },
    color: '#F4A261',
    sfx: 'dog.mp3',
  },
  {
    id: 'cat',
    label: { en: 'Kitty', fr: 'Chat' },
    soundWord: { en: 'MEOW!', fr: 'MIAOU !' },
    spoken: { en: 'Kitty! The kitty says Meow!', fr: 'Le chat ! Le chat fait Miaou !' },
    color: '#FF9F1C',
    sfx: 'meow.mp3',
  },
  {
    id: 'duck',
    label: { en: 'Duck', fr: 'Canard' },
    soundWord: { en: 'QUACK!', fr: 'COIN !' },
    spoken: { en: 'Duck! The duck says Quack quack!', fr: 'Le canard ! Le canard fait Coin coin !' },
    color: '#FFD166',
    sfx: 'duck.mp3',
  },
  {
    id: 'sheep',
    label: { en: 'Sheep', fr: 'Mouton' },
    soundWord: { en: 'BAA!', fr: 'BÊÊ !' },
    spoken: { en: 'Sheep! The sheep says Baa!', fr: 'Le mouton ! Le mouton fait Bêê !' },
    color: '#4CC9F0',
    sfx: 'sheep.mp3',
  },
  {
    id: 'monkey',
    label: { en: 'Monkey', fr: 'Singe' },
    soundWord: { en: 'OOH AAH!', fr: 'OUH AH !' },
    spoken: { en: 'Monkey! Silly little monkey!', fr: 'Le singe ! Petit singe rigolo !' },
    color: '#A06CD5',
    sfx: 'monkey.mp3',
  },
];

// ============================================================================
// 4. COLORS & SHAPES + SHAPE SORTER BOARDS
// ============================================================================
export interface ColorShapeItem {
  id: string;
  shape: 'circle' | 'star' | 'triangle' | 'square' | 'heart' | 'cloud';
  fill: string;
  stroke: string;
  bgTint: string;
  label: BilingualText;
  spoken: BilingualText;
  note: string;
}

export const COLORS_SHAPES: ColorShapeItem[] = [
  {
    id: 'red_circle',
    shape: 'circle',
    fill: '#FF595E',
    stroke: '#C92A2A',
    bgTint: '#FFE3E3',
    label: { en: 'Red Circle', fr: 'Cercle Rouge' },
    spoken: { en: 'Red! Red circle!', fr: 'Rouge ! Cercle rouge !' },
    note: 'C5',
  },
  {
    id: 'blue_star',
    shape: 'star',
    fill: '#1982C4',
    stroke: '#005082',
    bgTint: '#DFF3FF',
    label: { en: 'Blue Star', fr: 'Étoile Bleue' },
    spoken: { en: 'Blue! Blue star!', fr: 'Bleu ! Étoile bleue !' },
    note: 'D5',
  },
  {
    id: 'yellow_triangle',
    shape: 'triangle',
    fill: '#FFCA3A',
    stroke: '#D99B00',
    bgTint: '#FFF8D6',
    label: { en: 'Yellow Triangle', fr: 'Triangle Jaune' },
    spoken: { en: 'Yellow! Yellow triangle!', fr: 'Jaune ! Triangle jaune !' },
    note: 'E5',
  },
  {
    id: 'green_square',
    shape: 'square',
    fill: '#52B788',
    stroke: '#2D6A4F',
    bgTint: '#E2F8EC',
    label: { en: 'Green Square', fr: 'Carré Vert' },
    spoken: { en: 'Green! Green square!', fr: 'Vert ! Carré vert !' },
    note: 'G5',
  },
  {
    id: 'pink_heart',
    shape: 'heart',
    fill: '#FF6B8B',
    stroke: '#C9184A',
    bgTint: '#FFE4EC',
    label: { en: 'Pink Heart', fr: 'Cœur Rose' },
    spoken: { en: 'Pink! Pink heart!', fr: 'Rose ! Cœur rose !' },
    note: 'A5',
  },
  {
    id: 'purple_cloud',
    shape: 'cloud',
    fill: '#9D4EDD',
    stroke: '#5A189A',
    bgTint: '#F2E5FF',
    label: { en: 'Purple Cloud', fr: 'Nuage Violet' },
    spoken: { en: 'Purple! Purple cloud!', fr: 'Violet ! Nuage violet !' },
    note: 'C6',
  },
];

// ============================================================================
// 5. ABC LETTER BLOCKS (Bilingual Phonics A–Z in Baby-Friendly Sets)
// ============================================================================
export interface AbcItem {
  letter: string;
  color: string;
  enWord: string;
  enEmoji: string;
  frWord: string;
  frEmoji: string;
  note: string;
}

export const ABC_ITEMS: AbcItem[] = [
  { letter: 'A', color: '#FF595E', enWord: 'Apple', enEmoji: '🍎', frWord: 'Arbre', frEmoji: '🌳', note: 'C5' },
  { letter: 'B', color: '#FF9F1C', enWord: 'Ball', enEmoji: '⚽', frWord: 'Ballon', frEmoji: '🎈', note: 'D5' },
  { letter: 'C', color: '#FFCA3A', enWord: 'Cat', enEmoji: '🐱', frWord: 'Chat', frEmoji: '🐱', note: 'E5' },
  { letter: 'D', color: '#52B788', enWord: 'Dog', enEmoji: '🐶', frWord: 'Doudou', frEmoji: '🧸', note: 'G5' },
  { letter: 'E', color: '#1982C4', enWord: 'Elephant', enEmoji: '🐘', frWord: 'Étoile', frEmoji: '⭐', note: 'A5' },
  { letter: 'F', color: '#9D4EDD', enWord: 'Flower', enEmoji: '🌸', frWord: 'Fleur', frEmoji: '🌸', note: 'C6' },

  { letter: 'G', color: '#06D6A0', enWord: 'Giraffe', enEmoji: '🦒', frWord: 'Gâteau', frEmoji: '🎂', note: 'C5' },
  { letter: 'H', color: '#FF6B8B', enWord: 'Hat', enEmoji: '👒', frWord: 'Hibou', frEmoji: '🦉', note: 'D5' },
  { letter: 'I', color: '#48CAE4', enWord: 'Ice Cream', enEmoji: '🍦', frWord: 'Île', frEmoji: '🏝️', note: 'E5' },
  { letter: 'J', color: '#F4A261', enWord: 'Juice', enEmoji: '🧃', frWord: 'Jouet', frEmoji: '🪀', note: 'G5' },
  { letter: 'K', color: '#E63946', enWord: 'Kite', enEmoji: '🪁', frWord: 'Koala', frEmoji: '🐨', note: 'A5' },
  { letter: 'L', color: '#FFB703', enWord: 'Lion', enEmoji: '🦁', frWord: 'Lune', frEmoji: '🌙', note: 'C6' },

  { letter: 'M', color: '#F72585', enWord: 'Moon', enEmoji: '🌙', frWord: 'Maman', frEmoji: '👩', note: 'C5' },
  { letter: 'N', color: '#4361EE', enWord: 'Nose', enEmoji: '👃', frWord: 'Nuage', frEmoji: '☁️', note: 'D5' },
  { letter: 'O', color: '#FF9F1C', enWord: 'Owl', enEmoji: '🦉', frWord: 'Ours', frEmoji: '🐻', note: 'E5' },
  { letter: 'P', color: '#52B788', enWord: 'Puppy', enEmoji: '🐶', frWord: 'Pomme', frEmoji: '🍎', note: 'G5' },
  { letter: 'Q', color: '#9D4EDD', enWord: 'Queen', enEmoji: '👑', frWord: 'Quatre', frEmoji: '4️⃣', note: 'A5' },
  { letter: 'R', color: '#FF595E', enWord: 'Rainbow', enEmoji: '🌈', frWord: 'Roi', frEmoji: '👑', note: 'C6' },

  { letter: 'S', color: '#FFCA3A', enWord: 'Sun', enEmoji: '☀️', frWord: 'Soleil', frEmoji: '☀️', note: 'C5' },
  { letter: 'T', color: '#1982C4', enWord: 'Train', enEmoji: '🚂', frWord: 'Train', frEmoji: '🚂', note: 'D5' },
  { letter: 'U', color: '#7209B7', enWord: 'Umbrella', enEmoji: '☂️', frWord: 'Un', frEmoji: '1️⃣', note: 'E5' },
  { letter: 'V', color: '#FF6B8B', enWord: 'Valeria', enEmoji: '💖', frWord: 'Vache', frEmoji: '🐮', note: 'G5' },
  { letter: 'W', color: '#48CAE4', enWord: 'Whale', enEmoji: '🐳', frWord: 'Wagon', frEmoji: '🚃', note: 'A5' },
  { letter: 'X', color: '#06D6A0', enWord: 'Xylophone', enEmoji: '🎹', frWord: 'Xylophone', frEmoji: '🎹', note: 'C6' },
  { letter: 'Y', color: '#FFB703', enWord: 'Yo-yo', enEmoji: '🪀', frWord: 'Yaourt', frEmoji: '🥣', note: 'D5' },
  { letter: 'Z', color: '#4361EE', enWord: 'Zebra', enEmoji: '🦓', frWord: 'Zèbre', frEmoji: '🦓', note: 'E5' },
];

// ============================================================================
// 6. THINGS THAT GO! (Vehicles)
// ============================================================================
export interface VehicleItem {
  id: string;
  emoji: string;
  label: BilingualText;
  soundWord: BilingualText;
  spoken: BilingualText;
  color: string;
  bgTint: string;
  sfx: string;
  motion: 'drive' | 'fly' | 'sail' | 'blast';
}

export const VEHICLES: VehicleItem[] = [
  {
    id: 'car',
    emoji: '🚗',
    label: { en: 'Car', fr: 'Voiture' },
    soundWord: { en: 'BEEP BEEP!', fr: 'TUT TUT !' },
    spoken: { en: 'Car! Beep beep goes the red car!', fr: 'Voiture ! Tut tut la voiture rouge !' },
    color: '#EF476F',
    bgTint: '#FFE3EC',
    sfx: 'horn_car.mp3',
    motion: 'drive',
  },
  {
    id: 'bus',
    emoji: '🚌',
    label: { en: 'Bus', fr: 'Bus' },
    soundWord: { en: 'HONK HONK!', fr: 'POUET POUET !' },
    spoken: { en: 'Bus! Yellow bus goes round and round!', fr: 'Le bus ! Le grand bus jaune !' },
    color: '#FFB703',
    bgTint: '#FFF6CC',
    sfx: 'horn_bulb.mp3',
    motion: 'drive',
  },
  {
    id: 'train',
    emoji: '🚂',
    label: { en: 'Train', fr: 'Train' },
    soundWord: { en: 'CHOO CHOO!', fr: 'TCHOU TCHOU !' },
    spoken: { en: 'Train! Choo choo goes the train!', fr: 'Le train ! Tchou tchou le petit train !' },
    color: '#4361EE',
    bgTint: '#E0E7FF',
    sfx: 'door_bell.mp3',
    motion: 'drive',
  },
  {
    id: 'plane',
    emoji: '✈️',
    label: { en: 'Airplane', fr: 'Avion' },
    soundWord: { en: 'WHOOSH!', fr: 'VROUM !' },
    spoken: { en: 'Airplane! Flying high in the sky!', fr: 'Avion ! L avion vole haut dans le ciel !' },
    color: '#48CAE4',
    bgTint: '#DFF6FF',
    sfx: 'slide_whistle.mp3',
    motion: 'fly',
  },
  {
    id: 'boat',
    emoji: '⛵',
    label: { en: 'Boat', fr: 'Bateau' },
    soundWord: { en: 'SPLASH!', fr: 'PLOUF !' },
    spoken: { en: 'Boat! Sailing on the blue water!', fr: 'Bateau ! Le bateau glisse sur l eau !' },
    color: '#06D6A0',
    bgTint: '#D8FBF0',
    sfx: 'splash.mp3',
    motion: 'sail',
  },
  {
    id: 'rocket',
    emoji: '🚀',
    label: { en: 'Rocket', fr: 'Fusée' },
    soundWord: { en: 'BLAST OFF!', fr: 'DÉCOLLAGE !' },
    spoken: { en: 'Rocket! Zoom up to the stars!', fr: 'Fusée ! En route vers les étoiles !' },
    color: '#9D4EDD',
    bgTint: '#F2E5FF',
    sfx: 'fanfare.mp3',
    motion: 'blast',
  },
];

// ============================================================================
// 7. BIG & SMALL (Interactive Opposites)
// ============================================================================
export interface OppositeSide {
  id: string;
  emoji: string;
  label: BilingualText;
  spoken: BilingualText;
  color: string;
  sfx: string;
  effect: 'big' | 'small' | 'day' | 'night' | 'up' | 'down' | 'fast' | 'slow' | 'open' | 'closed';
}

export interface OppositePair {
  id: string;
  title: BilingualText;
  left: OppositeSide;
  right: OppositeSide;
}

export const OPPOSITES_PAIRS: OppositePair[] = [
  {
    id: 'big_small',
    title: { en: 'Big & Small', fr: 'Grand & Petit' },
    left: {
      id: 'big',
      emoji: '🐘',
      label: { en: 'BIG!', fr: 'GRAND !' },
      spoken: { en: 'Big! Big elephant!', fr: 'Grand ! Un très grand éléphant !' },
      color: '#4361EE',
      sfx: 'elephant.mp3',
      effect: 'big',
    },
    right: {
      id: 'small',
      emoji: '🐭',
      label: { en: 'Small', fr: 'Petit' },
      spoken: { en: 'Small! Tiny little mouse!', fr: 'Petit ! Une toute petite souris !' },
      color: '#FF6B8B',
      sfx: 'squeak.mp3',
      effect: 'small',
    },
  },
  {
    id: 'day_night',
    title: { en: 'Day & Night', fr: 'Jour & Nuit' },
    left: {
      id: 'day',
      emoji: '☀️',
      label: { en: 'DAY!', fr: 'JOUR !' },
      spoken: { en: 'Daytime! Good morning sunny sun!', fr: 'Le jour ! Bonjour beau soleil !' },
      color: '#FFB703',
      sfx: 'cuckoo.mp3',
      effect: 'day',
    },
    right: {
      id: 'night',
      emoji: '🌙',
      label: { en: 'NIGHT', fr: 'NUIT' },
      spoken: { en: 'Nighttime! Shhh, goodnight moon!', fr: 'La nuit ! Chut, bonne nuit la lune !' },
      color: '#7209B7',
      sfx: 'snore.mp3',
      effect: 'night',
    },
  },
  {
    id: 'up_down',
    title: { en: 'Up & Down', fr: 'Haut & Bas' },
    left: {
      id: 'up',
      emoji: '🎈',
      label: { en: 'UP!', fr: 'EN HAUT !' },
      spoken: { en: 'Up! Up goes the balloon!', fr: 'En haut ! Le ballon monte tout en haut !' },
      color: '#EF476F',
      sfx: 'slide_whistle.mp3',
      effect: 'up',
    },
    right: {
      id: 'down',
      emoji: '⚽',
      label: { en: 'DOWN!', fr: 'EN BAS !' },
      spoken: { en: 'Down! Bounce down goes the ball!', fr: 'En bas ! La balle rebondit en bas !' },
      color: '#06D6A0',
      sfx: 'boing.mp3',
      effect: 'down',
    },
  },
  {
    id: 'fast_slow',
    title: { en: 'Fast & Slow', fr: 'Vite & Lent' },
    left: {
      id: 'fast',
      emoji: '🚀',
      label: { en: 'FAST!', fr: 'VITE !' },
      spoken: { en: 'Fast! Zoom zoom super fast rocket!', fr: 'Vite ! La fusée va très vite !' },
      color: '#FF9F1C',
      sfx: 'fanfare.mp3',
      effect: 'fast',
    },
    right: {
      id: 'slow',
      emoji: '🐢',
      label: { en: 'Slow...', fr: 'Lent...' },
      spoken: { en: 'Slow... Gentle little turtle!', fr: 'Tout doucement... La petite tortue !' },
      color: '#52B788',
      sfx: 'woodblock.mp3',
      effect: 'slow',
    },
  },
];

// ============================================================================
// 8. BABY SOUND MIRROR / MOUTH GYM (Speech Blubs-Inspired Early Sounds)
// ============================================================================
export type MouthShape = 'open_o' | 'open_a' | 'lips_b' | 'smile_e' | 'shhh' | 'kiss';

export interface MouthSoundItem {
  id: string;
  syllable: BilingualText;
  prompt: BilingualText;
  spoken: BilingualText;
  mouthShape: MouthShape;
  emoji: string;
  color: string;
  sfx: string;
}

export const MOUTH_SOUNDS: MouthSoundItem[] = [
  {
    id: 'mama',
    syllable: { en: 'MA-MA!', fr: 'MA-MAN !' },
    prompt: { en: 'Press lips together: Ma-ma!', fr: 'Colle tes lèvres : Ma-man !' },
    spoken: { en: 'Ma... ma! Ma-ma!', fr: 'Ma... man ! Ma-man !' },
    mouthShape: 'lips_b',
    emoji: '👩',
    color: '#FF6B8B',
    sfx: 'chime.mp3',
  },
  {
    id: 'dada',
    syllable: { en: 'DA-DA!', fr: 'PA-PA !' },
    prompt: { en: 'Tap your tongue: Da-da!', fr: 'Fais claquer les lèvres : Pa-pa !' },
    spoken: { en: 'Da... da! Da-da!', fr: 'Pa... pa ! Pa-pa !' },
    mouthShape: 'open_a',
    emoji: '👨',
    color: '#4361EE',
    sfx: 'chime.mp3',
  },
  {
    id: 'baba',
    syllable: { en: 'BA-BA-BA!', fr: 'BA-BA-BA !' },
    prompt: { en: 'Pop your lips: Ba-ba-ba!', fr: 'Fais pop avec les lèvres : Ba-ba-ba !' },
    spoken: { en: 'Ba! Ba! Ba-ba-ba!', fr: 'Ba ! Ba ! Ba-ba-ba !' },
    mouthShape: 'lips_b',
    emoji: '🫧',
    color: '#48CAE4',
    sfx: 'bubbles.mp3',
  },
  {
    id: 'ooooh',
    syllable: { en: 'OOOOH!', fr: 'OOOOH !' },
    prompt: { en: 'Make a round O mouth!', fr: 'Fais une belle bouche ronde !' },
    spoken: { en: 'Oooooh! Look at the stars!', fr: 'Oooooh ! Regarde les étoiles !' },
    mouthShape: 'open_o',
    emoji: '✨',
    color: '#9D4EDD',
    sfx: 'crystal_ping.mp3',
  },
  {
    id: 'aaaah',
    syllable: { en: 'AAAAH!', fr: 'AAAAH !' },
    prompt: { en: 'Open wide like a lion!', fr: 'Ouvre grand comme un lion !' },
    spoken: { en: 'Aaaaah! Big happy open mouth!', fr: 'Aaaaah ! Ouvre grand la bouche !' },
    mouthShape: 'open_a',
    emoji: '🦁',
    color: '#FF9F1C',
    sfx: 'laugh.mp3',
  },
  {
    id: 'mwah',
    syllable: { en: 'MWAH! 💋', fr: 'SMACK ! 💋' },
    prompt: { en: 'Blow a big kiss: Mwah!', fr: 'Envoie un gros bisou : Smack !' },
    spoken: { en: 'Mwah! Big sweet kiss!', fr: 'Smack ! Un gros bisou !' },
    mouthShape: 'kiss',
    emoji: '💖',
    color: '#F72585',
    sfx: 'squeak.mp3',
  },
  {
    id: 'shhh',
    syllable: { en: 'SHHHH...', fr: 'CHUUUT...' },
    prompt: { en: 'Soft sleepy whisper: Shhh!', fr: 'Tout doucement : Chuuut !' },
    spoken: { en: 'Shhhh... Baby bear is sleeping!', fr: 'Chuuut... Petit ours fait dodo !' },
    mouthShape: 'shhh',
    emoji: '🤫',
    color: '#52B788',
    sfx: 'snore.mp3',
  },
];

// ============================================================================
// 9. BODY PARTS, COUNTING, EMOTIONS (Existing Core Lessons)
// ============================================================================
export interface BodyPartItem {
  id: 'eyes' | 'nose' | 'ears' | 'mouth' | 'belly' | 'hands' | 'feet';
  label: BilingualText;
  spoken: BilingualText;
  sfx: string;
  color: string;
}

export const BODY_PARTS: Record<BodyPartItem['id'], BodyPartItem> = {
  eyes: {
    id: 'eyes',
    label: { en: 'Eyes', fr: 'Les Yeux' },
    spoken: { en: 'Eyes! Blink blink your eyes!', fr: 'Les yeux ! Cligne des yeux !' },
    sfx: 'chime.mp3',
    color: '#4CC9F0',
  },
  nose: {
    id: 'nose',
    label: { en: 'Nose', fr: 'Le Nez' },
    spoken: { en: 'Nose! Boop your cute nose!', fr: 'Le nez ! Touche ton petit nez !' },
    sfx: 'squeak.mp3',
    color: '#FF6B8B',
  },
  ears: {
    id: 'ears',
    label: { en: 'Ears', fr: 'Les Oreilles' },
    spoken: { en: 'Ears! Wiggle your ears!', fr: 'Les oreilles ! Bouge tes oreilles !' },
    sfx: 'boing.mp3',
    color: '#FF9F1C',
  },
  mouth: {
    id: 'mouth',
    label: { en: 'Mouth', fr: 'La Bouche' },
    spoken: { en: 'Mouth! Big happy smile!', fr: 'La bouche ! Un grand sourire !' },
    sfx: 'laugh.mp3',
    color: '#EF476F',
  },
  belly: {
    id: 'belly',
    label: { en: 'Belly', fr: 'Le Ventre' },
    spoken: { en: 'Belly! Tickle tickle belly!', fr: 'Le ventre ! Guili guili le ventre !' },
    sfx: 'laugh.mp3',
    color: '#FFD166',
  },
  hands: {
    id: 'hands',
    label: { en: 'Hands', fr: 'Les Mains' },
    spoken: { en: 'Hands! Clap your hands!', fr: 'Les mains ! Bravo avec les mains !' },
    sfx: 'woodblock.mp3',
    color: '#06D6A0',
  },
  feet: {
    id: 'feet',
    label: { en: 'Feet', fr: 'Les Pieds' },
    spoken: { en: 'Feet! Tap tap your little feet!', fr: 'Les pieds ! Tape tes petits pieds !' },
    sfx: 'boing.mp3',
    color: '#A06CD5',
  },
};

export const COUNTING_WORDS: Record<number, BilingualText> = {
  1: { en: 'One!', fr: 'Un !' },
  2: { en: 'Two!', fr: 'Deux !' },
  3: { en: 'Three!', fr: 'Trois !' },
  4: { en: 'Four!', fr: 'Quatre !' },
  5: { en: 'Five! Yay!', fr: 'Cinq ! Bravo !' },
};

export const COUNTING_THEMES = [
  { id: 'balloons', emoji: '🎈', color: '#FF6B6B', label: { en: 'Balloons', fr: 'Ballons' } },
  { id: 'stars', emoji: '⭐', color: '#FFD166', label: { en: 'Stars', fr: 'Étoiles' } },
  { id: 'ducks', emoji: '🦆', color: '#4CC9F0', label: { en: 'Ducks', fr: 'Canards' } },
  { id: 'apples', emoji: '🍎', color: '#EF233C', label: { en: 'Apples', fr: 'Pommes' } },
];

export interface EmotionItem {
  id: 'happy' | 'silly' | 'surprised' | 'sleepy' | 'loved';
  label: BilingualText;
  spoken: BilingualText;
  bgGradient: string;
  sfx: string;
}

export const EMOTIONS: EmotionItem[] = [
  {
    id: 'happy',
    label: { en: 'Happy!', fr: 'Content !' },
    spoken: { en: 'Happy! Big happy smile!', fr: 'Content ! Un grand sourire !' },
    bgGradient: 'linear-gradient(160deg, #FFF3B0 0%, #FFD166 100%)',
    sfx: 'laugh.mp3',
  },
  {
    id: 'silly',
    label: { en: 'Silly!', fr: 'Rigolo !' },
    spoken: { en: 'Silly! Funny silly face!', fr: 'Rigolo ! Quelle grimace rigolote !' },
    bgGradient: 'linear-gradient(160deg, #CAFFBF 0%, #06D6A0 100%)',
    sfx: 'boing.mp3',
  },
  {
    id: 'surprised',
    label: { en: 'Surprised!', fr: 'Surpris !' },
    spoken: { en: 'Ooh! Surprised! Peek a boo!', fr: 'Oh ! Surpris ! Coucou !' },
    bgGradient: 'linear-gradient(160deg, #CAF0F8 0%, #48CAE4 100%)',
    sfx: 'chime.mp3',
  },
  {
    id: 'sleepy',
    label: { en: 'Sleepy...', fr: 'Fatigué...' },
    spoken: { en: 'Sleepy... Night night!', fr: 'Fatigué... Fais dodo !' },
    bgGradient: 'linear-gradient(160deg, #E0AAFF 0%, #7209B7 100%)',
    sfx: 'snore.mp3',
  },
  {
    id: 'loved',
    label: { en: 'Loved!', fr: 'Aimé !' },
    spoken: { en: 'I love you! Big hugs!', fr: 'Je t aime ! Gros câlin !' },
    bgGradient: 'linear-gradient(160deg, #FFD1DC 0%, #FF6B8B 100%)',
    sfx: 'chime.mp3',
  },
];

export const UI_STRINGS = {
  studioTitle: { en: 'Little Learner Studio', fr: 'Atelier Petit Explorateur' },
  studioSubtitle: { en: '12 gentle bilingual lessons for 1-year-olds', fr: '12 leçons douces bilingues pour tout-petits' },
  backToStorybook: { en: 'STORYBOOK', fr: 'HISTOIRES' },
  focusMode: { en: '1-CARD', fr: '1 CARTE' },
  exploreMode: { en: 'EXPLORE', fr: 'DÉCOUVRIR' },
  findMode: { en: 'FIND IT!', fr: 'TROUVE !' },
  hearSlow: { en: '🐢 SLOW', fr: '🐢 DOUX' },
  hearAgain: { en: '🔊 SAY IT', fr: '🔊 RÉPÉTER' },
  yay: { en: 'Yay! Good job!', fr: 'Bravo ! Super !' },
  tapAnyPart: { en: 'Tap Baby Bear!', fr: 'Touche Petit Ours !' },
  tapToCount: { en: 'Tap to count 1 to 5!', fr: 'Touche pour compter !' },
  tapFace: { en: 'Tap the face!', fr: 'Touche le visage !' },
  whoIsInside: { en: 'Tap the barn! Who is inside?', fr: 'Touche la grange ! Qui est là ?' },
  tapNextAnimal: { en: 'Tap again for a new friend!', fr: 'Touche encore pour un autre ami !' },
  tapShapeMatch: { en: 'Tap a block to snap it in!', fr: 'Touche un bloc pour le placer !' },
  tapVehicle: { en: 'Tap a vehicle to zoom!', fr: 'Touche un véhicule !' },
  tapOpposite: { en: 'Tap both sides to compare!', fr: 'Touche chaque côté !' },
  tapSaySound: { en: 'Tap face to practice!', fr: 'Touche le visage pour imiter !' },
  yayISaidIt: { en: '🌟 YAY! BABY TRIED!', fr: '🌟 BRAVO BÉBÉ !' },
  next: { en: 'NEXT ➔', fr: 'SUIVANT ➔' },
};

export function t(text: BilingualText, lang: AppLanguage): string {
  return lang === 'fr' ? text.fr : text.en;
}
