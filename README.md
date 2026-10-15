# Valeria's Musical Storybook 🚌🌸
> A mobile-first, zero-friction interactive musical storybook web app designed for toddlers aged 11 to 24 months, inspired by classic Duck Duck Moose apps (*"Wheels on the Bus"* and *"Musical Me"*).

---

## 📱 Live Web & Mobile App
Play the app online on any phone, tablet, iPad, or computer:
- **Live URL:** `https://gaspi-ai.github.io/valeria-musical-storybook/`

> **💡 Mobile Play Tip (Full-Screen Experience):**
> On iOS Safari, tap the **Share** button and select **"Add to Home Screen"**. On Android Chrome, tap the menu and choose **"Install App"** or **"Add to Home screen"**. This runs the storybook full-screen like a native app with zero browser address bars!

---

## ✨ Features & Age-Appropriate UX (11–24 Months)

### 1. Zero UI Friction & Hardware Lockout
- **No Text, Timers, or Menus:** Toddlers cannot get stuck, see "game over" states, or trigger confusing dialogs. Every tap or swipe produces an immediate audio and visual reward.
- **Palm & Multi-Touch Tolerant:** Toddlers slap screens with open palms or multiple fingers. The custom 60 FPS Canvas particle engine tracks all touches independently, producing bursts of acoustic ripple rings, stars, floating bubbles, and musical notes under each finger.
- **Hardware Touch Guard:** Disables browser pull-to-refresh, pinch-to-zoom, text selection, and right-click menus (`touch-action: none; user-select: none;`).

### 2. Real Acoustic Audio Pipeline
- **No Robotic Oscillators or AI Speech:** Studio-recorded acoustic instruments (grand piano, wooden marimba, metallic glockenspiel, music box) and authentic sound effects (car horn, bulb horn, door latch, wiper squeaks, puppy barks, kitten meows).
- **Rock-Solid Hardware Clock Scheduling:** Web Audio hardware clock (`AudioContext.currentTime`) with a 100ms lookahead / 25ms timer scheduler eliminates JavaScript timer drift.
- **Master Dynamics Compressor:** Prevents audio distortion or speaker clipping from enthusiastic toddler multi-touch slaps.
- **Dynamic Multi-Track Stem Control:** Spinning wheels adjusts the engine rumble pitch and rhythm tempo; tapping the grille sounds the brass horn.

### 3. Interactive Scenes

#### Scene 1: "Wheels on the Bus" (Mechanical Cause & Effect)
- **Rotatable Wheels:** Spinning wheels with momentum physics drive the parallax countryside and modulate the diesel engine sound.
- **Accordion Bus Doors:** Tap to open/shut the folding doors with mechanical latch sounds and reveal animal passengers.
- **Windshield Wipers:** Swipe back and forth with squeaky rubber sound on glass.
- **Squash-and-Stretch Bus Horn:** Brassy "beep-beep" with elastic bounce on the bus body.
- **Animated Passengers & Environment:** Tap the Puppy, Kitty, Monkey, and Driver for animal greetings; tap the smiling sun for a gentle chime; tap clouds for raindrops.
- **Sing-Along Mode:** Large friendly button toggles the studio vocal nursery track synced to the visual beat.

#### Scene 2: "Musical Me" (Storybook Pentatonic Garden)
- **Pentatonic Harmony (C, D, E, G, A, C, D):** 7 blooming flower sound pads with cute smiling faces. Because it is strictly pentatonic, every tap sounds harmonious and never dissonant.
- **Instrument Switcher:** Swap between Wooden Marimba, Sparkling Bells, Studio Grand Piano, and Dreamy Music Box.
- **Call & Response:** Tap the Singing Bluebird companion to hear a gentle motif and see the target flower pad light up with a golden halo; celebrating correct taps with acoustic fanfare and colorful confetti!

### 4. 3-Second Hold Parent Gate
- Tucked in the top right corner behind a circular progress ring.
- Requires continuous 3-second hold to open the Grown-Ups Menu (Scene Switcher, Audio Modes, Instruments, Volume slider, and Fullscreen toggle).

---

## 🛠️ Development & Building

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License
MIT License. Audio assets from open-source and creative commons archives (Tone.js Instruments, FluidR3 GM, SoundMonster, and Freesound/Archive.org).
