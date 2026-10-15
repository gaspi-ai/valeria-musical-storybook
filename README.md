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

### 3. Interactive Scenes (9 Storybook Worlds)

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

#### Scene 3: "Old MacDonald's Farm" (Animal Voice Soundboard)
- **Interactive Farm Animals:** Tap the Cow (moo), Fluffy Sheep (baa), Muddy Pig (oink & mud-roll), Duck Pond (quack & paddle), and Red Barn (chicken cluck).
- **Chugging Tractor:** Tap to chug across the pastures with puffy exhaust smoke.
- **Acoustic Banjo & Upright Bass:** Pentatonic chord changes synced to animal taps.

#### Scene 4: "Itsy Bitsy Spider" (Climbing Physics & Rain)
- **Spout Climbing Physics:** Drag or tap to slide the plush spider up and down the drain spout.
- **Storm & Sun Mechanics:** Tap rainclouds for gentle acoustic rain and thunder claps; tap the golden sun to dry up all the rain.
- **Acoustic Nylon Guitar:** Warm fingerpicking accompaniment following the toddler's touch.

#### Scene 5: "Twinkle, Twinkle, Little Star" (Lullaby Stargazer)
- **Constellation Chimes:** Tap twinkling stars to trigger sparkling celesta, glockenspiel, and music box chimes.
- **Sleeping Moon:** Tap the smiling crescent moon to hear gentle, peaceful snores with floating dream bubbles.
- **Shooting Stars:** Swipe across the night sky to launch glittering meteor showers.

#### Scene 6: "Row, Row, Row Your Boat" (Water Stream Sensory)
- **Wooden Rowboat with Oars:** Tap boat to row downstream through gentle river ripples with authentic wooden creaks.
- **River Wildlife:** Tap leaping fish, croaking frogs on lily pads, and floating driftwood.
- **Gentle Orchestral Harp:** Arpeggiated harp flourishes on every water ripple.

#### Scene 7: "Bath Time Splash & Clean" (Sensory Water & Bubbles)
- **Porcelain Clawfoot Tub:** Undulating water wave canvas with interactive splashes.
- **Draggable Scrubbing Sponge:** Scratch-off cleaning removes mud patches from a cute puppy to trigger happy tail wags and clean celebrations.
- **Squeaking Rubber Duck:** Bobs, dives underwater, and elastically rebounds.
- **Brass Water Faucet & Soap Bubbles:** Toggle flowing water and tap floating iridescent soap bubbles with crystal bell tones.

#### Scene 8: "Peek-a-Boo Meadow" (Object Permanence & Surprise)
- **3 Thumb-Sized Hiding Spots:** Hollow Log, Rustling Flowering Bush, and Wooden Fence Gate.
- **Hide-and-Seek Animals:** Baby Bear, Bunny, and Kitten peek their ears/tails, wiggling when nudged.
- **Vocal & Musical Flourish:** Uncovering the hiding animal triggers joyful giggles and xylophone fanfare.
- **Fluttering Butterflies:** Tap colorful butterflies scattering golden pollen dust.

#### Scene 9: "Sound Paint / Finger Trail" (Open-Ended Synesthetic Canvas)
- **Multi-Touch Polyphony:** Supports up to 5 concurrent fingers, each assigned a distinct pastel watercolor ribbon hue.
- **Glowing Fluid Ribbons:** Bezier-smoothed watercolor ribbons that self-clean into twinkling stardust over 2.5 seconds.
- **Pitch & Velocity Mapping:** Deep resonant C3/E3 cello and harp at the bottom; sparkling high C6 glockenspiel chimes at the top. Sustained touches trigger warm cello drone chords.

### 4. 3-Second Hold Parent Gate & Infant Lock
- Tucked in the top right corner behind a circular progress ring (or 2-finger top corner tap).
- **Grown-Ups Menu:** Full 9-Scene Carousel, Audio Modes (Studio Song, Live Acoustic Band, Free Play), 8 Instrument soundbanks, Volume slider, and Fullscreen toggle.
- **Infant Anti-Exit Lock:** Screen Wake Lock API keeps the display awake; optional 5-second hold lock and step-by-step Guided Access instructions for 100% toddler hardware lockout.

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
