/* ==========================================================================
   NIVIN GROUP — Digital Wedding Invitation
   js/countdown.js — Live countdown to the wedding date, drives both the
   numeric readouts and the SVG ring progress (days/hours/mins/secs each
   ring depletes/fills against its own max unit span).
   ========================================================================== */

(() => {
  'use strict';

  const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52 per the SVG markup

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function initCountdown() {
    const grid = document.getElementById('countdown-grid');
    if (!grid) return;

    const targetISO = grid.dataset.weddingDate;
    const target = new Date(targetISO).getTime();
    if (Number.isNaN(target)) return;

    const numEls = {
      days: grid.querySelector('[data-count="days"]'),
      hours: grid.querySelector('[data-count="hours"]'),
      minutes: grid.querySelector('[data-count="minutes"]'),
      seconds: grid.querySelector('[data-count="seconds"]')
    };
    const ringEls = {
      days: grid.querySelector('.ring-fill[data-unit="days"]'),
      hours: grid.querySelector('.ring-fill[data-unit="hours"]'),
      minutes: grid.querySelector('.ring-fill[data-unit="minutes"]'),
      seconds: grid.querySelector('.ring-fill[data-unit="seconds"]')
    };

    let lastSeconds = -1;

    function setRing(el, fraction) {
      if (!el) return;
      const clamped = Math.min(1, Math.max(0, fraction));
      const offset = RING_CIRCUMFERENCE * (1 - clamped);
      el.style.strokeDasharray = String(RING_CIRCUMFERENCE);
      el.style.strokeDashoffset = String(offset);
    }

    function tick() {
      const now = Date.now();
      let diff = target - now;

      if (diff <= 0) {
        // Wedding day has arrived / passed — freeze at zero and swap copy.
        Object.values(numEls).forEach((el) => el && (el.textContent = '00'));
        Object.values(ringEls).forEach((el) => setRing(el, 0));
        const heading = document.getElementById('countdown-heading');
        if (heading && heading.textContent !== 'Together At Last') {
          heading.textContent = 'Together At Last';
        }
        return; // stop scheduling further ticks
      }

      const days = Math.floor(diff / 86400000);
      diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000);
      diff -= hours * 3600000;
      const minutes = Math.floor(diff / 60000);
      diff -= minutes * 60000;
      const seconds = Math.floor(diff / 1000);

      if (numEls.days) numEls.days.textContent = pad(days);
      if (numEls.hours) numEls.hours.textContent = pad(hours);
      if (numEls.minutes) numEls.minutes.textContent = pad(minutes);
      if (numEls.seconds && seconds !== lastSeconds) {
        numEls.seconds.textContent = pad(seconds);
        numEls.seconds.classList.remove('is-ticking');
        void numEls.seconds.offsetWidth; // restart the tick animation
        numEls.seconds.classList.add('is-ticking');
        lastSeconds = seconds;
      }

      // Ring fill fractions — each ring measures progress within its own
      // natural cycle so all four visibly animate rather than one dominating.
      setRing(ringEls.days, days / 365);
      setRing(ringEls.hours, hours / 24);
      setRing(ringEls.minutes, minutes / 60);
      setRing(ringEls.seconds, seconds / 60);

      requestAnimationFrame(() => setTimeout(tick, 250));
    }

    tick();
  }

  document.addEventListener('DOMContentLoaded', initCountdown);
})();

