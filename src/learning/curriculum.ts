/**
 * curriculum.ts
 * Data-driven Bilingual (English & Français) Early Learning Curriculum
 * tailored for 1-year-olds (12 to 24 months).
 *
 * Zero-failure design: every tap gives immediate warm voice modeling,
 * joyful visual motion, and musical reinforcement.
 */

import type { AppLanguage } from '../state/AppPreferences';

export type LessonId =
  | 'first_words'
  | 'animal_friends'
  | 'colors_shapes'
  | 'body_parts'
  | 'counting_1_5'
  | 'emotions';

export interface BilingualText {
  en: string;
  fr: string;
}

export interface LessonCardMeta {
  id: LessonId;
  title: BilingualText;
  subtitle: BilingualText;
  icon: string;
  themeColor: string;
  accentColor: string;
}

export const LESSONS_META: LessonCardMeta[] = [
  {
    id: 'first_words',
    title: { en: 'First Words', fr: 'Premiers Mots' },
    subtitle: { en: 'Tap & Discover', fr: 'Touche et Découvre' },
    icon: '🍎',
    themeColor: '#FF6B6B',
    accentColor: '#FFE5E5',
  },
  {
    id: 'animal_friends',
    title: { en: 'Animal Sounds', fr: 'Cris des Animaux' },
    subtitle: { en: 'Listen & Imitate', fr: 'Écoute et Imite' },
    icon: '🐮',
    themeColor: '#52B788',
    accentColor: '#D8F3DC',
  },
  {
    id: 'colors_shapes',
    title: { en: 'Colors & Shapes', fr: 'Couleurs & Formes' },
    subtitle: { en: 'Pop & Glow', fr: 'Touche et Brille' },
    icon: '⭐',
    themeColor: '#FF9F1C',
    accentColor: '#FFF3B0',
  },
  {
    id: 'body_parts',
    title: { en: 'My Body Parts', fr: 'Mon Corps' },
    subtitle: { en: 'Boop Baby Bear!', fr: 'Touche Petit Ours !' },
    icon: '🐻',
    themeColor: '#48CAE4',
    accentColor: '#CAF0F8',
  },
  {
    id: 'counting_1_5',
    title: { en: 'Count 1 to 5', fr: 'Compter 1 à 5' },
    subtitle: { en: 'Tap & Count', fr: 'Touche et Compte' },
    icon: '🎈',
    themeColor: '#7209B7',
    accentColor: '#E0AAFF',
  },
  {
    id: 'emotions',
    title: { en: 'Happy & Silly', fr: 'Émotions' },
    subtitle: { en: 'Peek-a-Boo Faces', fr: 'Visages Rigolos' },
    icon: '😊',
    themeColor: '#F72585',
    accentColor: '#FFD1DC',
  },
];

export interface WordItem {
  id: string;
  label: BilingualText;
  spoken: BilingualText;
  findPrompt: BilingualText;
  color: string;
  sfx: string;
}

export const FIRST_WORDS: WordItem[] = [
  {
    id: 'ball',
    label: { en: 'Ball', fr: 'Balle' },
    spoken: { en: 'Ball! Bounce the ball!', fr: 'Balle ! La belle balle !' },
    findPrompt: { en: 'Where is the ball?', fr: 'Où est la balle ?' },
    color: '#FF6B6B',
    sfx: 'boing.mp3',
  },
  {
    id: 'apple',
    label: { en: 'Apple', fr: 'Pomme' },
    spoken: { en: 'Apple! Yummy red apple!', fr: 'Pomme ! Miam, la pomme rouge !' },
    findPrompt: { en: 'Where is the apple?', fr: 'Où est la pomme ?' },
    color: '#EF233C',
    sfx: 'chime.mp3',
  },
  {
    id: 'cup',
    label: { en: 'Cup', fr: 'Tasse' },
    spoken: { en: 'Cup! Drink from the cup!', fr: 'Tasse ! Boire dans la tasse !' },
    findPrompt: { en: 'Where is the cup?', fr: 'Où est la tasse ?' },
    color: '#48CAE4',
    sfx: 'bubbles.mp3',
  },
  {
    id: 'book',
    label: { en: 'Book', fr: 'Livre' },
    spoken: { en: 'Book! Let us read a book!', fr: 'Livre ! On lit un livre !' },
    findPrompt: { en: 'Where is the book?', fr: 'Où est le livre ?' },
    color: '#4361EE',
    sfx: 'chime.mp3',
  },
  {
    id: 'car',
    label: { en: 'Car', fr: 'Voiture' },
    spoken: { en: 'Car! Beep beep goes the car!', fr: 'Voiture ! Tut tut la voiture !' },
    findPrompt: { en: 'Where is the car?', fr: 'Où est la voiture ?' },
    color: '#FF9F1C',
    sfx: 'horn_car.mp3',
  },
  {
    id: 'flower',
    label: { en: 'Flower', fr: 'Fleur' },
    spoken: { en: 'Flower! Pretty pink flower!', fr: 'Fleur ! Jolie fleur rose !' },
    findPrompt: { en: 'Where is the flower?', fr: 'Où est la fleur ?' },
    color: '#FF6B8B',
    sfx: 'chime.mp3',
  },
  {
    id: 'sun',
    label: { en: 'Sun', fr: 'Soleil' },
    spoken: { en: 'Sun! Bright sunny sun!', fr: 'Soleil ! Beau soleil qui brille !' },
    findPrompt: { en: 'Where is the sun?', fr: 'Où est le soleil ?' },
    color: '#FFD166',
    sfx: 'chime.mp3',
  },
  {
    id: 'moon',
    label: { en: 'Moon', fr: 'Lune' },
    spoken: { en: 'Moon! Goodnight little moon!', fr: 'Lune ! Bonne nuit petite lune !' },
    findPrompt: { en: 'Where is the moon?', fr: 'Où est la lune ?' },
    color: '#7209B7',
    sfx: 'chime.mp3',
  },
];

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
  studioSubtitle: { en: 'Gentle lessons for 1-year-olds', fr: 'Leçons douces pour les tout-petits' },
  backToStorybook: { en: 'STORYBOOK', fr: 'HISTOIRES' },
  exploreMode: { en: 'EXPLORE', fr: 'DÉCOUVRIR' },
  findMode: { en: 'FIND IT!', fr: 'TROUVE !' },
  yay: { en: 'Yay! Good job!', fr: 'Bravo ! Super !' },
  tapAnyPart: { en: 'Tap Baby Bear!', fr: 'Touche Petit Ours !' },
  tapToCount: { en: 'Tap to count 1 to 5!', fr: 'Touche pour compter !' },
  tapFace: { en: 'Tap the face!', fr: 'Touche le visage !' },
  next: { en: 'NEXT ➔', fr: 'SUIVANT ➔' },
};

export function t(text: BilingualText, lang: AppLanguage): string {
  return lang === 'fr' ? text.fr : text.en;
}
