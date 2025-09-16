Announcer voice lines
=====================

Place one audio file per character here, named by roster id (prefer .wav; .mp3 is used as fallback):

- ryu.wav
- ken.wav
- chunli.wav
- guile.wav
- blanka.wav
- dhalsim.wav
- zangief.wav
- ehonda.wav

When a player confirms, the app loads `assets/audio/announcer/{id}.wav` and plays it once; if that fails, it tries `{id}.mp3`.
Use short, normalized audio (mono, 44.1kHz, -1 dB peak) for best results.

