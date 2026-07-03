/* ==========================================================================
   NIVIN GROUP — Digital Wedding Invitation
   js/main.js — Page bootstrapping shared by index.html and invitation.html:
   loading screen, envelope open choreography + navigation handoff,
   scroll indicator, and the "Add to Calendar" .ics generator.
   ========================================================================== */

(() => {
  'use strict';

  /* -----------------------------------------------------------------
     0. Small utilities
  ----------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------
     1. LOADING SCREEN
     Simulates a short, elegant progress fill then fades the overlay.
     Real asset loading (fonts/images) also gates the minimum hide time
     so the screen never disappears before fonts have painted.
  ----------------------------------------------------------------- */
  function initLoadingScreen() {
    const screen = $('#loading-screen');
    if (!screen) return;

    const fill = $('#loading-bar-fill', screen);
    const MIN_DISPLAY_MS = prefersReducedMotion ? 200 : 1100;
    const start = performance.now();

    let progress = 0;
    const tick = () => {
      progress = Math.min(100, progress + (2 + Math.random() * 6));
      if (fill) fill.style.width = progress + '%';
      if (progress < 100) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);

    const fontsReady = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.catch(() => {})
      : Promise.resolve();

    Promise.all([
      fontsReady,
      new Promise((resolve) => {
        const elapsed = performance.now() - start;
        setTimeout(resolve, Math.max(0, MIN_DISPLAY_MS - elapsed));
      })
    ]).then(() => {
      if (fill) fill.style.width = '100%';
      requestAnimationFrame(() => {
        screen.classList.add('is-hidden');
        setTimeout(() => { screen.style.display = 'none'; }, 750);
      });
    });
  }

  /* -----------------------------------------------------------------
     2. ENVELOPE OPEN CHOREOGRAPHY (index.html only)
     Tap -> seal compresses -> seal lifts -> flap rotates ->
     card slides upward -> camera zoom -> hand off to invitation.html
  ----------------------------------------------------------------- */
  function initEnvelope() {
    const stage = $('#envelope-stage');
    if (!stage) return;

    const scene = $('#envelope-scene');
    const envelope3d = $('#envelope-3d');
    const seal = $('#wax-seal');
    const flap = $('#envelope-flap');
    const card = $('#envelope-card');
    const tapBtn = $('#tap-to-open-btn');

    let hasOpened = false;

    // gentle idle float once loading screen clears
    setTimeout(() => envelope3d && envelope3d.classList.add('is-idle'), 900);

    const openInvitation = () => {
      if (hasOpened) return;
      hasOpened = true;

      stage.classList.add('is-opening');
      envelope3d.classList.remove('is-idle');

      seal.classList.add('is-pressing');
      seal.setAttribute('aria-disabled', 'true');

      // Timing is owned entirely by animation.css's `animation-delay` values
      // now (each stage waits for the previous one to visibly finish before
      // starting — see the comments there). JS only needs to (a) swap the
      // seal from "pressing" to "lifting" once the press has actually
      // finished, and (b) fire every other stage's class right away so
      // each one's own CSS delay can stage it correctly, and (c) navigate
      // once the very last stage (scene zoom) has fully completed.
      const timings = prefersReducedMotion
        ? { pressDone: 0, sceneZoomEnd: 300 }
        : { pressDone: 380, sceneZoomEnd: 4400 };

      setTimeout(() => {
        seal.classList.remove('is-pressing');
        seal.classList.add('is-lifting');
      }, timings.pressDone);

      flap.classList.add('is-open');
      card.classList.add('is-sliding');
      scene.classList.add('is-zooming');

      setTimeout(() => {
        sessionStorage.setItem('nivin_envelope_opened', '1');
        window.location.href = 'invitation.html';
      }, timings.sceneZoomEnd);
    };

    seal.addEventListener('click', openInvitation);
    tapBtn.addEventListener('click', openInvitation);

    // If the visitor already opened the envelope this session (e.g. used
    // browser back button from the invitation), skip straight through.
    if (sessionStorage.getItem('nivin_envelope_opened') === '1') {
      tapBtn.querySelector('span').textContent = 'Open Again';
    }
  }

  /* -----------------------------------------------------------------
     3. SCROLL INDICATOR (invitation.html hero)
  ----------------------------------------------------------------- */
  function initScrollIndicator() {
    const indicator = $('#scroll-indicator');
    if (!indicator) return;

    indicator.addEventListener('click', () => {
      const story = $('#story');
      if (story) {
        story.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /* -----------------------------------------------------------------
     4. ADD TO CALENDAR (.ics download, no external service)
  ----------------------------------------------------------------- */
  function initAddToCalendar() {
    const btn = $('#add-to-calendar');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const start = '20260823T180000';
      const end = '20260823T230000';
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//NIVIN GROUP//Wedding Invitation//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:' + 'siraj-enjli-wedding-' + Date.now() + '@nivingroup.com',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        'DTSTART:' + start,
        'DTEND:' + end,
        "SUMMARY:Siraj & Enjli's Wedding",
        'DESCRIPTION:Together with their families\\, Siraj & Enjli request the pleasure of your company to celebrate their wedding.',
        'LOCATION:The Royal Garden Hall\\, Mosul\\, Iraq',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Siraj-Enjli-Wedding.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }

  /* -----------------------------------------------------------------
     5. BOOT
  ----------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initEnvelope();
    initScrollIndicator();
    initAddToCalendar();
  });
})();





