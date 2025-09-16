(function () {
  // Screen
  const selectScreen = document.getElementById('selectScreen');

  // Audio
  const bgmSelect = document.getElementById('bgmSelect');
  const sfxMove = document.getElementById('sfxMove');
  const sfxConfirm = document.getElementById('sfxConfirm');
  const sfxAnnouncer = document.getElementById('sfxAnnouncer');

  const roster = document.getElementById('roster');
  const p1Portrait = document.getElementById('p1Portrait');
  const p2Portrait = document.getElementById('p2Portrait');
  const p1Name = document.getElementById('p1Name');
  const p2Name = document.getElementById('p2Name');
  const p1ConfirmBtn = document.getElementById('p1Confirm');
  const p2ConfirmBtn = document.getElementById('p2Confirm');

  const nameById = {
    ryu: 'AICNARF',
    ken: 'AICY',
    chunli: 'TL LISTOR',
    guile: 'OH AICY',
    blanka: 'D-VEL AICNARF',
    dhalsim: 'JANNAH',
    zangief: 'PRINCESS AICNARF',
    ehonda: 'RETARD AICNARF'
  };

  let p1Pick = null;
  let p2Pick = null;
  let p1Locked = null;
  let p2Locked = null;
  let p1Index = 0;
  let p2Index = 1;
  let p1Confirmed = false;
  let p2Confirmed = false;

  function getTiles() {
    return Array.from(roster.querySelectorAll('.tile'));
  }

  function refreshCursors() {
    const tiles = getTiles();
    tiles.forEach(t => t.classList.remove('active-p1', 'active-p2'));
    tiles[p1Index]?.classList.add('active-p1');
    tiles[p2Index]?.classList.add('active-p2');
  }

  // Click moves P2 cursor only if not confirmed
  roster.addEventListener('click', (e) => {
    const tiles = getTiles();
    const tile = e.target.closest?.('.tile');
    if (!tile) return;
    const idx = tiles.indexOf(tile);
    if (idx >= 0 && !p2Confirmed) { p2Index = idx; previewByPlayer(2); refreshCursors(); }
  });

  function pick(tile, player) {
    const id = tile.getAttribute('data-id');
    if (isLockedByOther(id, player)) return; // prevent picking locked char by other player
    const imgSrc = resolvePortraitSrc(id, tile.querySelector('img')?.getAttribute('src'));
    const display = nameById[id] || id?.toUpperCase() || '';
    if (player === 1) {
      p1Pick = id;
      p1Portrait.src = imgSrc || p1Portrait.src;
      p1Name.textContent = display || '1P';
      markSelected(tile, 'p1');
      p1ConfirmBtn.disabled = false;
    } else {
      p2Pick = id;
      p2Portrait.src = imgSrc || p2Portrait.src;
      p2Name.textContent = display || '2P';
      markSelected(tile, 'p2');
      p2ConfirmBtn.disabled = false;
    }
    refreshCursors();
  }

  function markSelected(tile, player) {
    const cls = player === 'p1' ? 'selected-p1' : 'selected-p2';
    tile.classList.add(cls);
  }

  function lockSelection(player) {
    const id = player === 1 ? p1Pick : p2Pick;
    if (!id) return;
    const tile = findTileById(id);
    if (!tile) return;
    const lockedCls = player === 1 ? 'locked locked-p1' : 'locked locked-p2';
    tile.classList.add(...lockedCls.split(' '));
    if (player === 1) { p1Locked = id; p1ConfirmBtn.disabled = true; p1Confirmed = true; p1Portrait.parentElement.classList.add('confirmed-p1'); }
    if (player === 2) { p2Locked = id; p2ConfirmBtn.disabled = true; p2Confirmed = true; p2Portrait.parentElement.classList.add('confirmed-p2'); }
    maybeStartVersus();
  }

  function isLockedByOther(id, player) {
    return (player === 1 && p2Locked === id) || (player === 2 && p1Locked === id);
  }

  function findTileById(id) { return getTiles().find(t => t.getAttribute('data-id') === id); }

  // Keyboard navigation: P2 Arrows, P1 WASD; Enter/Space confirm P2; F confirm P1; Esc reset
  // Listen globally so controls work even if focus is outside the roster
  document.addEventListener('keydown', (e) => {
    const tiles = getTiles();
    const columns = computeColumns(roster, tiles[0]);

    let handled = true;
    switch (e.key) {
      // P2 Arrows control P2 cursor
      case 'ArrowRight': if (!p2Confirmed) { p2Index = Math.min(tiles.length - 1, p2Index + 1); sfxMovePlay(); previewByPlayer(2); } break;
      case 'ArrowLeft': if (!p2Confirmed) { p2Index = Math.max(0, p2Index - 1); sfxMovePlay(); previewByPlayer(2); } break;
      case 'ArrowDown': if (!p2Confirmed) { p2Index = Math.min(tiles.length - 1, p2Index + columns); sfxMovePlay(); previewByPlayer(2); } break;
      case 'ArrowUp': if (!p2Confirmed) { p2Index = Math.max(0, p2Index - columns); sfxMovePlay(); previewByPlayer(2); } break;
      // P1 WASD control P1 cursor
      case 'd': case 'D': if (!p1Confirmed) { p1Index = Math.min(tiles.length - 1, p1Index + 1); sfxMovePlay(); previewByPlayer(1); } break;
      case 'a': case 'A': if (!p1Confirmed) { p1Index = Math.max(0, p1Index - 1); sfxMovePlay(); previewByPlayer(1); } break;
      case 's': case 'S': if (!p1Confirmed) { p1Index = Math.min(tiles.length - 1, p1Index + columns); sfxMovePlay(); previewByPlayer(1); } break;
      case 'w': case 'W': if (!p1Confirmed) { p1Index = Math.max(0, p1Index - columns); sfxMovePlay(); previewByPlayer(1); } break;
      // Confirm (locks and plays announcer)
      case 'Enter':
      case ' ': {
        // P2 confirm
        if (!p2Confirmed) {
          pick(tiles[p2Index], 2);
          if (p2Pick && p2Locked !== p2Pick) { sfxConfirmPlay(); lockSelection(2); playAnnouncer(p2Pick); }
        }
        break;
      }
      case 'f':
      case 'F': {
        // P1 confirm
        if (!p1Confirmed) {
          pick(tiles[p1Index], 1);
          if (p1Pick && p1Locked !== p1Pick) { sfxConfirmPlay(); lockSelection(1); playAnnouncer(p1Pick); }
        }
        break;
      }
      case 'Escape': resetPicks(); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
    refreshCursors();
    // Move focus to last moved tile for accessibility
    if (["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(e.key)) {
      tiles[p2Index]?.focus();
    }
    if (["d","D","a","A","s","S","w","W"].includes(e.key)) {
      tiles[p1Index]?.focus();
    }
  });

  function resetPicks() {
    p1Pick = null; p2Pick = null;
    p1Portrait.src = 'assets/placeholders/placeholder.png';
    p2Portrait.src = 'assets/placeholders/placeholder.png';
    p1Name.textContent = '1P';
    p2Name.textContent = '2P';
    getTiles().forEach(t => t.classList.remove('selected-p1', 'selected-p2'));
  }

  function computeColumns(container, firstTile) {
    if (!firstTile) return 1;
    const w = firstTile.getBoundingClientRect().width;
    const cw = container.getBoundingClientRect().width;
    if (!w || !cw) return 1;
    return Math.max(1, Math.round(cw / w));
  }

  // Initialize focus
  window.addEventListener('DOMContentLoaded', () => {
    const first = getTiles()[0];
    if (first) first.focus({ preventScroll: true });
    setupSelectBgmAutoplayGuard();
    // Initialize cursors on first two tiles
    const tiles = getTiles();
    p1Index = 0;
    p2Index = Math.min(1, tiles.length - 1);
    refreshCursors();
    previewByPlayer(1);
    previewByPlayer(2);
  });

  function resolvePortraitSrc(id, fallbackThumb) {
    // Prefer large portrait if exists; otherwise use thumbnail
    const portraitUrl = `assets/portraits/${id}.png`;
    // Preload check
    const img = new Image();
    img.src = portraitUrl;
    // If not available, browser will error; we still return URL and let <img> onerror keep previous src
    img.onerror = function () { /* no-op */ };
    return fallbackThumb || portraitUrl;
  }

  function previewByPlayer(player) {
    if ((player === 1 && p1Confirmed) || (player === 2 && p2Confirmed)) return; // stop hover after confirm
    const tiles = getTiles();
    const idx = player === 1 ? p1Index : p2Index;
    const tile = tiles[idx];
    if (!tile) return;
    const id = tile.getAttribute('data-id');
    if (isLockedByOther(id, player)) return;
    const src = resolvePortraitSrc(id, tile.querySelector('img')?.getAttribute('src'));
    const display = nameById[id] || id?.toUpperCase() || '';
    if (player === 1) { p1Portrait.src = src; p1Name.textContent = display || '1P'; }
    else { p2Portrait.src = src; p2Name.textContent = display || '2P'; }
  }

  function sfxMovePlay() { try { sfxMove.currentTime = 0; sfxMove.play(); } catch (_) {} }
  function sfxConfirmPlay() { try { sfxConfirm.currentTime = 0; sfxConfirm.play(); } catch (_) {} }
  function safePlay(audio, loop) { try { if (!audio) return; audio.loop = !!loop; audio.currentTime = 0; audio.play(); } catch (_) {} }
  function safeStop(audio) { try { if (!audio) return; audio.pause(); } catch (_) {} }

  // Defer select BGM until first user gesture to avoid NotAllowedError
  function setupSelectBgmAutoplayGuard() {
    let started = false;
    function start() {
      if (started) return;
      started = true;
      try { bgmSelect.loop = true; bgmSelect.currentTime = 0; bgmSelect.play(); } catch (_) {}
      document.removeEventListener('keydown', start);
      document.removeEventListener('pointerdown', start);
      document.removeEventListener('click', start);
    }
    document.addEventListener('keydown', start, { once: true });
    document.addEventListener('pointerdown', start, { once: true });
    document.addEventListener('click', start, { once: true });
  }

  // Confirm button handlers
  if (p1ConfirmBtn) p1ConfirmBtn.addEventListener('click', () => { if (p1Pick && !p1Confirmed) { sfxConfirmPlay(); lockSelection(1); playAnnouncer(p1Pick); } });
  if (p2ConfirmBtn) p2ConfirmBtn.addEventListener('click', () => { if (p2Pick && !p2Confirmed) { sfxConfirmPlay(); lockSelection(2); playAnnouncer(p2Pick); } });

  function playAnnouncer(characterId) {
    if (!characterId || !sfxAnnouncer) return;
    const wav = `assets/audio/announcer/${characterId}.wav`;
    const mp3 = `assets/audio/announcer/${characterId}.mp3`;
    try {
      // Prefer WAV; if it fails to play, fall back to MP3 silently
      sfxAnnouncer.src = wav;
      sfxAnnouncer.currentTime = 0;
      const p = sfxAnnouncer.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { try { sfxAnnouncer.src = mp3; sfxAnnouncer.currentTime = 0; sfxAnnouncer.play().catch(() => {}); } catch (_) {} });
      }
    } catch (_) { try { sfxAnnouncer.src = mp3; sfxAnnouncer.currentTime = 0; sfxAnnouncer.play().catch(() => {}); } catch (_) {} }
  }

  function maybeStartVersus() {
    if (p1Confirmed && p2Confirmed) {
      const p1 = encodeURIComponent(p1Locked || p1Pick || '');
      const p2 = encodeURIComponent(p2Locked || p2Pick || '');
      const url = `versus.html?p1=${p1}&p2=${p2}`;
      setTimeout(() => { window.location.href = url; }, 600); // small delay to let SFX play
    }
  }
})();


