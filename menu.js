(function () {
  const bgmMenu = document.getElementById('bgmMenu');
  const sfxCoin = document.getElementById('sfxCoin');
  const sfxConfirm = document.getElementById('sfxConfirm');
  const creditCountEl = document.getElementById('creditCount');
  const insertCoinText = document.getElementById('insertCoin');

  let credits = 0;
  let bgmStarted = false;

  window.addEventListener('DOMContentLoaded', () => {
    // Strategy to satisfy autoplay policies: start muted autoplay, then unmute on first gesture
    try {
      bgmMenu.muted = true;
      bgmMenu.loop = true;
      bgmMenu.play().catch(() => {});
    } catch (_) {}
    updateCredits();
  });

  document.addEventListener('keydown', (e) => {
    tryStartBgm();
    if (e.key === '5' || e.key === 'c' || e.key === 'C') { credits += 1; sfxCoinPlay(); updateCredits(); }
    if ((e.key === 'Enter' || e.key === ' ') && credits > 0) {
      credits -= 1; updateCredits(); sfxConfirmPlay();
      // Navigate to selection screen
      window.location.href = 'select.html';
    }
  });

  // Also start bgm on first click/touch
  document.addEventListener('pointerdown', tryStartBgm);
  document.addEventListener('click', tryStartBgm);

  function updateCredits() {
    if (creditCountEl) creditCountEl.textContent = String(credits);
    if (insertCoinText) insertCoinText.textContent = credits > 0 ? 'PRESS START' : 'INSERT COIN';
  }

  function safePlay(audio, loop) { try { if (!audio) return; audio.loop = !!loop; audio.currentTime = 0; audio.play(); } catch (_) {} }
  function sfxCoinPlay() { try { sfxCoin.currentTime = 0; sfxCoin.play(); } catch (_) {} }
  function sfxConfirmPlay() { try { sfxConfirm.currentTime = 0; sfxConfirm.play(); } catch (_) {} }

  function tryStartBgm() {
    if (bgmStarted) return;
    try {
      // If already playing muted, simply unmute; else attempt to play
      bgmMenu.loop = true;
      if (bgmMenu.currentTime === 0) bgmMenu.currentTime = 0;
      bgmMenu.muted = false;
      const playPromise = bgmMenu.paused ? bgmMenu.play() : Promise.resolve();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => { bgmStarted = true; }).catch(() => { bgmStarted = false; });
      } else {
        bgmStarted = true;
      }
    } catch (_) {
      bgmStarted = false;
    }
  }
})();


