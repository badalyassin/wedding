/* ==========================================================================
   NIVIN GROUP — Digital Wedding Invitation
   js/audio.js — Background music toggle shared by index.html and
   invitation.html. Autoplay-policy safe: audio only starts on a genuine
   user gesture (the toggle button itself, or the envelope tap), and the
   playing/muted state persists across the index -> invitation handoff
   via sessionStorage so the music doesn't restart/cut on navigation.
   ========================================================================== */

(() => {
  'use strict';

  function initAudio() {
    const audio = document.getElementById('bg-audio') || document.getElementById('bg-audio-inv');
    const toggle = document.getElementById('audio-toggle');
    if (!audio || !toggle) return;

    const STORAGE_KEY = 'nivin_audio_playing';
    audio.volume = 0.55;

    function setPlayingUI(isPlaying) {
      toggle.setAttribute('aria-pressed', String(isPlaying));
      toggle.classList.toggle('is-muted', !isPlaying);
      toggle.style.opacity = isPlaying ? '1' : '0.55';
    }

    function play() {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.then(() => {
          sessionStorage.setItem(STORAGE_KEY, '1');
          setPlayingUI(true);
        }).catch(() => {
          // Autoplay blocked — leave paused, UI reflects paused state.
          setPlayingUI(false);
        });
      }
    }

    function pause() {
      audio.pause();
      sessionStorage.setItem(STORAGE_KEY, '0');
      setPlayingUI(false);
    }

    toggle.addEventListener('click', () => {
      if (audio.paused) {
        play();
      } else {
        pause();
      }
    });

    // Resume automatically only if the visitor had explicitly turned music
    // on earlier in this session (e.g. moving from index.html to the
    // invitation) — never autoplay on a cold load without a prior gesture.
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      play();
    } else {
      setPlayingUI(false);
    }

    // If the envelope tap itself is the visitor's first gesture, start
    // music at that moment so it's already playing by the time the
    // invitation page loads (index.html only — no-op if absent).
    const sealBtn = document.getElementById('wax-seal');
    if (sealBtn) {
      sealBtn.addEventListener('click', () => {
        if (audio.paused) play();
      }, { once: true });
    }
  }

  document.addEventListener('DOMContentLoaded', initAudio);
})();

