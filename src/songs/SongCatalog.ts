/**
 * SongCatalog.ts
 * Brand-new, freshly curated interactive nursery rhymes for Valeria's Songs Theater.
 * Every song has an exact, studio-accurate arrangement and dedicated interactive stage actors.
 */

import type { BilingualText } from '../learning/curriculum';

export type TheaterSongId =
  | 'happy_clap'
  | 'mary_lamb'
  | 'abc_blocks'
  | 'five_ducks'
  | 'baby_bee'
  | 'brahms_moon';

export interface TheaterSong {
  id: TheaterSongId;
  title: BilingualText;
  subtitle: BilingualText;
  icon: string;
  audioFile: string;
  bpm: number;
  themeColor: string;
  bgGradient: string;
  sparkleColor: string;
}

export const THEATER_SONGS: TheaterSong[] = [
  {
    id: 'happy_clap',
    title: { en: "If You're Happy!", fr: 'Si Tu As de la Joie' },
    subtitle: { en: 'Clap, Hop & Giggle', fr: 'Tape des Mains et Ris' },
    icon: '🐻',
    audioFile: 'songs/happy_and_you_know_it.mp3',
    bpm: 116,
    themeColor: '#FF6B6B',
    bgGradient: 'linear-gradient(165deg, #FFF3B0 0%, #FFD166 52%, #FF9F1C 100%)',
    sparkleColor: '#FF6B6B',
  },
  {
    id: 'mary_lamb',
    title: { en: 'Mary Had a Little Lamb', fr: 'Le Petit Mouton Blanc' },
    subtitle: { en: 'Pet Lamb & Bloom Flowers', fr: 'Caresse le Mouton' },
    icon: '🐑',
    audioFile: 'songs/mary_little_lamb.mp3',
    bpm: 108,
    themeColor: '#52B788',
    bgGradient: 'linear-gradient(165deg, #CAF0F8 0%, #E8F8EE 52%, #74C69D 100%)',
    sparkleColor: '#52B788',
  },
  {
    id: 'abc_blocks',
    title: { en: 'ABC Alphabet Song', fr: 'Chanson de l Alphabet' },
    subtitle: { en: 'Tap Bouncy ABC Blocks', fr: 'Touche les Lettres ABC' },
    icon: '🔤',
    audioFile: 'songs/abc_song.mp3',
    bpm: 104,
    themeColor: '#4361EE',
    bgGradient: 'linear-gradient(165deg, #E0E7FF 0%, #C7D2FE 55%, #A5B4FC 100%)',
    sparkleColor: '#4361EE',
  },
  {
    id: 'five_ducks',
    title: { en: 'Five Little Ducks', fr: 'Cinq Petits Canards' },
    subtitle: { en: 'Splash & Quack on Waves', fr: 'Plouf et Coin-Coin' },
    icon: '🦆',
    audioFile: 'songs/five_little_ducks.mp3',
    bpm: 112,
    themeColor: '#0096C7',
    bgGradient: 'linear-gradient(165deg, #CAF0F8 0%, #48CAE4 52%, #0077B6 100%)',
    sparkleColor: '#4CC9F0',
  },
  {
    id: 'baby_bee',
    title: { en: 'Baby Bumblebee', fr: 'Petite Abeille Joyeuse' },
    subtitle: { en: 'Tap Flowers to Fly Bee!', fr: 'Touche les Fleurs !' },
    icon: '🐝',
    audioFile: 'songs/baby_bumblebee.mp3',
    bpm: 118,
    themeColor: '#F59E0B',
    bgGradient: 'linear-gradient(165deg, #FEF9C3 0%, #FDE68A 50%, #86EFAC 100%)',
    sparkleColor: '#FFCA3A',
  },
  {
    id: 'brahms_moon',
    title: { en: "Brahms' Lullaby", fr: 'Berceuse Douce Nuit' },
    subtitle: { en: 'Rock Moon & Catch Stars', fr: 'Lune et Étoiles Douces' },
    icon: '🌙',
    audioFile: 'songs/brahms_lullaby.mp3',
    bpm: 82,
    themeColor: '#6366F1',
    bgGradient: 'radial-gradient(circle at 50% 25%, #312E81 0%, #1E1B4B 65%, #0F0A2E 100%)',
    sparkleColor: '#FFE066',
  },
];
