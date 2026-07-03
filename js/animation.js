/* ==========================================================================
   NIVIN GROUP — Digital Wedding Invitation
   js/animation.js — Scroll-reveal engine (IntersectionObserver), parallax,
   and gold-shimmer/floating-particle wiring for invitation.html.
   No abrupt reveals: base state is transform-only (see animation.css)
   so content is never fully invisible before JS attaches.
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------
     1. SCROLL-REVEAL — fades every `.reveal-up` (and nested
     `.timeline-item`) upward into place the first time it enters
     the viewport. Uses a single shared observer for efficiency.
  ----------------------------------------------------------------- */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal-up, .timeline-item');
    if (!revealEls.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px'
    });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* -----------------------------------------------------------------
     2. HERO PARALLAX — subtle depth on the SVG scene as the user
     scrolls past the hero; disabled entirely for reduced motion.
     transform-only, rAF-throttled to stay off the layout thread.
  ----------------------------------------------------------------- */
  function initHeroParallax() {
    if (prefersReducedMotion) return;

    const hero = document.getElementById('hero');
    const scene = hero ? hero.querySelector('.hero-scene') : null;
    if (!hero || !scene) return;

    let ticking = false;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const heroHeight = rect.height || window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / heroHeight));
      const translate = progress * 60; // px of parallax drift
      const scale = 1 + progress * 0.08;
      scene.style.transform = `translate3d(0, ${translate}px, 0) scale(${scale})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* -----------------------------------------------------------------
     3. SECTION GOLD DIVIDER SHIMMER RESTART
     Re-triggers the CSS shimmer animation each time a flourish scrolls
     into view, so it always reads as a fresh reveal rather than a
     continuous background loop the visitor never notices.
  ----------------------------------------------------------------- */
  function initFlourishRestart() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const flourishes = document.querySelectorAll('.gold-flourish path');
    if (!flourishes.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const path = entry.target;
          path.style.animation = 'none';
          // Force reflow so the animation restarts cleanly.
          void path.offsetWidth;
          path.style.animation = '';
        }
      });
    }, { threshold: 0.4 });

    flourishes.forEach((path) => observer.observe(path));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initHeroParallax();
    initFlourishRestart();
  });
})();

