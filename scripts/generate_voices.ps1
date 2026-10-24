Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft Zira Desktop')
$synth.Rate = 0
$synth.Volume = 100

$phrases = @{
    "voice_peekaboo.wav" = "Peek-a-boo! I see you!"
    "voice_bunny.wav" = "A cute little bunny!"
    "voice_bear.wav" = "A friendly teddy bear!"
    "voice_kitten.wav" = "A sweet little kitty! Meow!"
    "voice_wheels_horn.wav" = "Beep beep! The bus is coming!"
    "voice_wheels_doors.wav" = "Open and shut! All aboard!"
    "voice_splash.wav" = "Splish splash, bath time!"
    "voice_clean.wav" = "All clean and sparkling!"
    "voice_spider_climb.wav" = "Up, up, up the waterspout!"
    "voice_spider_rain.wav" = "Down came the rain!"
    "voice_spider_sun.wav" = "Out came the lovely sun!"
    "voice_twinkle_wish.wav" = "Make a wish on a star!"
    "voice_row_boat.wav" = "Row, row your boat! Merrily down the stream!"
    "voice_great_job.wav" = "Yay! Wonderful job!"
    "voice_sing_with_me.wav" = "Let's sing together!"
}

foreach ($item in $phrases.GetEnumerator()) {
    $outPath = Join-Path "public\audio" $item.Key
    $synth.SetOutputToWaveFile($outPath)
    $synth.Speak($item.Value)
    Write-Host "Generated: $outPath"
}

$synth.Dispose()
Write-Host "All voice audio files successfully generated!"
