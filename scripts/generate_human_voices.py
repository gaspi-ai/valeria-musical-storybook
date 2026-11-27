"""
generate_human_voices.py
Generates warm, crystal-clear, studio-quality human neural voice MP3 clips
for Valeria's Musical Storybook Learning Studio in BOTH English & French
using Microsoft Azure Neural Voices (en-US-AvaMultilingualNeural & fr-FR-DeniseNeural).

Output:
  public/audio/voices/en/<key>.mp3
  public/audio/voices/fr/<key>.mp3
"""

import asyncio
import os
import edge_tts

OUT_DIR = os.path.join("public", "audio", "voices")
VOICE_EN = "en-US-AvaMultilingualNeural"
VOICE_FR = "fr-FR-DeniseNeural"

# Key -> (English text, French text)
CLIPS = {
    # UI & Praise
    "ui_yay": ("Yay! Good job!", "Bravo ! Super !"),
    "ui_lang": ("English! Ready to play!", "Français ! Prêt à jouer !"),

    # 24 First Words (Spoken)
    "fw_ball": ("Ball! Bounce the ball!", "Balle ! La belle balle !"),
    "fw_book": ("Book! Let's read a book!", "Livre ! On lit un livre !"),
    "fw_car": ("Car! Beep beep goes the car!", "Voiture ! Tut tut la voiture !"),
    "fw_teddy": ("Teddy bear! Soft cuddly teddy!", "Doudou ! Doux petit doudou !"),
    "fw_duck_toy": ("Duck! Squeak squeak yellow duck!", "Canard ! Coin coin petit canard !"),
    "fw_blocks": ("Blocks! Stack the blocks up high!", "Cubes ! On empile les cubes !"),
    "fw_apple": ("Apple! Yummy red apple!", "Pomme ! Miam, la pomme rouge !"),
    "fw_banana": ("Banana! Sweet yellow banana!", "Banane ! Bonne banane jaune !"),
    "fw_milk": ("Milk! Warm yummy milk!", "Lait ! Bon petit lait !"),
    "fw_cup": ("Cup! Drink from the cup!", "Tasse ! Boire dans la tasse !"),
    "fw_strawberry": ("Strawberry! Sweet red berry!", "Fraise ! Jolie fraise sucrée !"),
    "fw_cookie": ("Cookie! Crunch crunch cookie!", "Biscuit ! Miam le bon biscuit !"),
    "fw_mama": ("Mama! I love you Mama!", "Maman ! Je t'aime Maman !"),
    "fw_dada": ("Dada! Hi Dada!", "Papa ! Coucou Papa !"),
    "fw_bed": ("Bed! Cozy sleepy bed!", "Lit ! Dodo dans le lit !"),
    "fw_bath": ("Bath! Splash splash in the bath!", "Bain ! Plouf plouf dans le bain !"),
    "fw_shoe": ("Shoe! Put on your little shoe!", "Chaussure ! Ta petite chaussure !"),
    "fw_hat": ("Hat! Pretty hat on your head!", "Chapeau ! Un joli chapeau !"),
    "fw_sun": ("Sun! Bright sunny sun!", "Soleil ! Beau soleil qui brille !"),
    "fw_moon": ("Moon! Goodnight little moon!", "Lune ! Bonne nuit petite lune !"),
    "fw_flower": ("Flower! Pretty pink flower!", "Fleur ! Jolie fleur rose !"),
    "fw_tree": ("Tree! Big green tree!", "Arbre ! Grand arbre vert !"),
    "fw_rain": ("Rain! Drip drop goes the rain!", "Pluie ! Plic ploc la pluie !"),
    "fw_star": ("Star! Twinkle little star!", "Étoile ! Petite étoile qui brille !"),

    # 24 First Words (Find It Prompts)
    "fw_find_ball": ("Where is the ball?", "Où est la balle ?"),
    "fw_find_book": ("Where is the book?", "Où est le livre ?"),
    "fw_find_car": ("Where is the car?", "Où est la voiture ?"),
    "fw_find_teddy": ("Where is the teddy?", "Où est le doudou ?"),
    "fw_find_duck_toy": ("Where is the duck?", "Où est le canard ?"),
    "fw_find_blocks": ("Where are the blocks?", "Où sont les cubes ?"),
    "fw_find_apple": ("Where is the apple?", "Où est la pomme ?"),
    "fw_find_banana": ("Where is the banana?", "Où est la banane ?"),
    "fw_find_milk": ("Where is the milk?", "Où est le lait ?"),
    "fw_find_cup": ("Where is the cup?", "Où est la tasse ?"),
    "fw_find_strawberry": ("Where is the berry?", "Où est la fraise ?"),
    "fw_find_cookie": ("Where is the cookie?", "Où est le biscuit ?"),
    "fw_find_mama": ("Where is Mama?", "Où est Maman ?"),
    "fw_find_dada": ("Where is Dada?", "Où est Papa ?"),
    "fw_find_bed": ("Where is the bed?", "Où est le lit ?"),
    "fw_find_bath": ("Where is the bath?", "Où est le bain ?"),
    "fw_find_shoe": ("Where is the shoe?", "Où est la chaussure ?"),
    "fw_find_hat": ("Where is the hat?", "Où est le chapeau ?"),
    "fw_find_sun": ("Where is the sun?", "Où est le soleil ?"),
    "fw_find_moon": ("Where is the moon?", "Où est la lune ?"),
    "fw_find_flower": ("Where is the flower?", "Où est la fleur ?"),
    "fw_find_tree": ("Where is the tree?", "Où est l'arbre ?"),
    "fw_find_rain": ("Where is the rain?", "Où est la pluie ?"),
    "fw_find_star": ("Where is the star?", "Où est l'étoile ?"),

    # Peekaboo Barn (8)
    "barn_cow": ("Peekaboo! It's a Cow! Moo!", "Coucou ! C'est la Vache ! Meuh !"),
    "barn_dog": ("Peekaboo! It's a Puppy! Woof woof!", "Coucou ! C'est le Chien ! Ouaf ouaf !"),
    "barn_cat": ("Peekaboo! It's a Kitty! Meow!", "Coucou ! C'est le Chat ! Miaou !"),
    "barn_duck": ("Peekaboo! It's a Duck! Quack quack!", "Coucou ! C'est le Canard ! Coin coin !"),
    "barn_sheep": ("Peekaboo! It's a Sheep! Baa!", "Coucou ! C'est le Mouton ! Bêê !"),
    "barn_elephant": ("Peekaboo! Big Elephant!", "Coucou ! Le grand Éléphant !"),
    "barn_bird": ("Peekaboo! Little Birdie! Tweet tweet!", "Coucou ! Le petit Oiseau ! Cui cui !"),
    "barn_monkey": ("Peekaboo! Silly Monkey!", "Coucou ! Le petit Singe !"),

    # Animal Friends (6)
    "animal_cow": ("Cow! The cow says Moo!", "La vache ! La vache fait Meuh !"),
    "animal_dog": ("Puppy! The puppy says Woof woof!", "Le chien ! Le chien fait Ouaf ouaf !"),
    "animal_cat": ("Kitty! The kitty says Meow!", "Le chat ! Le chat fait Miaou !"),
    "animal_duck": ("Duck! The duck says Quack quack!", "Le canard ! Le canard fait Coin coin !"),
    "animal_sheep": ("Sheep! The sheep says Baa!", "Le mouton ! Le mouton fait Bêê !"),
    "animal_monkey": ("Monkey! Silly little monkey!", "Le singe ! Petit singe rigolo !"),

    # Colors & Shapes (6)
    "shape_red_circle": ("Red! Red circle!", "Rouge ! Cercle rouge !"),
    "shape_blue_star": ("Blue! Blue star!", "Bleu ! Étoile bleue !"),
    "shape_yellow_triangle": ("Yellow! Yellow triangle!", "Jaune ! Triangle jaune !"),
    "shape_green_square": ("Green! Green square!", "Vert ! Carré vert !"),
    "shape_pink_heart": ("Pink! Pink heart!", "Rose ! Cœur rose !"),
    "shape_purple_cloud": ("Purple! Purple cloud!", "Violet ! Nuage violet !"),

    # ABC Phonics (26)
    "abc_A": ("A! A is for Apple!", "A ! Comme Arbre !"),
    "abc_B": ("B! B is for Ball!", "B ! Comme Ballon !"),
    "abc_C": ("C! C is for Cat!", "C ! Comme Chat !"),
    "abc_D": ("D! D is for Dog!", "D ! Comme Doudou !"),
    "abc_E": ("E! E is for Elephant!", "E ! Comme Étoile !"),
    "abc_F": ("F! F is for Flower!", "F ! Comme Fleur !"),
    "abc_G": ("G! G is for Giraffe!", "G ! Comme Gâteau !"),
    "abc_H": ("H! H is for Hat!", "H ! Comme Hibou !"),
    "abc_I": ("I! I is for Ice Cream!", "I ! Comme Île !"),
    "abc_J": ("J! J is for Juice!", "J ! Comme Jouet !"),
    "abc_K": ("K! K is for Kite!", "K ! Comme Koala !"),
    "abc_L": ("L! L is for Lion!", "L ! Comme Lune !"),
    "abc_M": ("M! M is for Moon!", "M ! Comme Maman !"),
    "abc_N": ("N! N is for Nose!", "N ! Comme Nuage !"),
    "abc_O": ("O! O is for Owl!", "O ! Comme Ours !"),
    "abc_P": ("P! P is for Puppy!", "P ! Comme Pomme !"),
    "abc_Q": ("Q! Q is for Queen!", "Q ! Comme Quatre !"),
    "abc_R": ("R! R is for Rainbow!", "R ! Comme Roi !"),
    "abc_S": ("S! S is for Sun!", "S ! Comme Soleil !"),
    "abc_T": ("T! T is for Train!", "T ! Comme Train !"),
    "abc_U": ("U! U is for Umbrella!", "U ! Comme Un !"),
    "abc_V": ("V! V is for Valeria!", "V ! Comme Vache !"),
    "abc_W": ("W! W is for Whale!", "W ! Comme Wagon !"),
    "abc_X": ("X! X is for Xylophone!", "X ! Comme Xylophone !"),
    "abc_Y": ("Y! Y is for Yo-yo!", "Y ! Comme Yaourt !"),
    "abc_Z": ("Z! Z is for Zebra!", "Z ! Comme Zèbre !"),

    # Things That Go (6)
    "veh_car": ("Car! Beep beep goes the red car!", "Voiture ! Tut tut la voiture rouge !"),
    "veh_bus": ("Bus! Yellow bus goes round and round!", "Le bus ! Le grand bus jaune !"),
    "veh_train": ("Train! Choo choo goes the train!", "Le train ! Tchou tchou le petit train !"),
    "veh_plane": ("Airplane! Flying high in the sky!", "Avion ! L'avion vole haut dans le ciel !"),
    "veh_boat": ("Boat! Sailing on the blue water!", "Bateau ! Le bateau glisse sur l'eau !"),
    "veh_rocket": ("Rocket! Zoom up to the stars!", "Fusée ! En route vers les étoiles !"),

    # Opposites (8)
    "opp_big": ("Big! Big elephant!", "Grand ! Un très grand éléphant !"),
    "opp_small": ("Small! Tiny little mouse!", "Petit ! Une toute petite souris !"),
    "opp_day": ("Daytime! Good morning sunny sun!", "Le jour ! Bonjour beau soleil !"),
    "opp_night": ("Nighttime! Shhh, goodnight moon!", "La nuit ! Chut, bonne nuit la lune !"),
    "opp_up": ("Up! Up goes the balloon!", "En haut ! Le ballon monte tout en haut !"),
    "opp_down": ("Down! Bounce down goes the ball!", "En bas ! La balle rebondit en bas !"),
    "opp_fast": ("Fast! Zoom zoom super fast rocket!", "Vite ! La fusée va très vite !"),
    "opp_slow": ("Slow... Gentle little turtle!", "Tout doucement... La petite tortue !"),

    # Mouth Gym (7)
    "mouth_mama": ("Ma... ma! Ma-ma!", "Ma... man ! Ma-man !"),
    "mouth_dada": ("Da... da! Da-da!", "Pa... pa ! Pa-pa !"),
    "mouth_baba": ("Ba! Ba! Ba-ba-ba!", "Ba ! Ba ! Ba-ba-ba !"),
    "mouth_ooooh": ("Oooooh! Look at the stars!", "Oooooh ! Regarde les étoiles !"),
    "mouth_aaaah": ("Aaaaah! Big happy open mouth!", "Aaaaah ! Ouvre grand la bouche !"),
    "mouth_mwah": ("Mwah! Big sweet kiss!", "Smack ! Un gros bisou !"),
    "mouth_shhh": ("Shhhh... Baby bear is sleeping!", "Chuuut... Petit ours fait dodo !"),

    # Body Parts (7)
    "body_eyes": ("Eyes! Blink blink your eyes!", "Les yeux ! Cligne des yeux !"),
    "body_nose": ("Nose! Boop your cute nose!", "Le nez ! Touche ton petit nez !"),
    "body_ears": ("Ears! Wiggle your ears!", "Les oreilles ! Bouge tes oreilles !"),
    "body_mouth": ("Mouth! Big happy smile!", "La bouche ! Un grand sourire !"),
    "body_belly": ("Belly! Tickle tickle belly!", "Le ventre ! Guili guili le ventre !"),
    "body_hands": ("Hands! Clap your hands!", "Les mains ! Bravo avec les mains !"),
    "body_feet": ("Feet! Tap tap your little feet!", "Les pieds ! Tape tes petits pieds !"),

    # Counting 1 to 5
    "num_1": ("One!", "Un !"),
    "num_2": ("Two!", "Deux !"),
    "num_3": ("Three!", "Trois !"),
    "num_4": ("Four!", "Quatre !"),
    "num_5": ("Five! Yay!", "Cinq ! Bravo !"),

    # Emotions (5)
    "emo_happy": ("Happy! Big happy smile!", "Content ! Un grand sourire !"),
    "emo_silly": ("Silly! Funny silly face!", "Rigolo ! Quelle grimace rigolote !"),
    "emo_surprised": ("Ooh! Surprised! Peekaboo!", "Oh ! Surpris ! Coucou !"),
    "emo_sleepy": ("Sleepy... Night night!", "Fatigué... Fais dodo !"),
    "emo_loved": ("I love you! Big hugs!", "Je t'aime ! Gros câlin !"),
}


async def gen_one(sem: asyncio.Semaphore, lang: str, key: str, text: str) -> None:
    voice = VOICE_EN if lang == "en" else VOICE_FR
    out_path = os.path.join(OUT_DIR, lang, f"{key}.mp3")
    if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return
    async with sem:
        comm = edge_tts.Communicate(text, voice, rate="-8%", pitch="+4Hz")
        await comm.save(out_path)


async def main() -> None:
    os.makedirs(os.path.join(OUT_DIR, "en"), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "fr"), exist_ok=True)
    sem = asyncio.Semaphore(8)
    tasks = []
    for key, (en_text, fr_text) in CLIPS.items():
        tasks.append(gen_one(sem, "en", key, en_text))
        tasks.append(gen_one(sem, "fr", key, fr_text))

    await asyncio.gather(*tasks)
    total_files = 0
    total_bytes = 0
    for lang in ("en", "fr"):
        d = os.path.join(OUT_DIR, lang)
        for f in os.listdir(d):
            if f.endswith(".mp3"):
                total_files += 1
                total_bytes += os.path.getsize(os.path.join(d, f))
    print(f"Generated {total_files} studio human voice MP3s ({total_bytes / (1024*1024):.2f} MB total)")


if __name__ == "__main__":
    asyncio.run(main())
