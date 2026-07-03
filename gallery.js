/* ==========================================================================
   NIVIN GROUP — Digital Wedding Invitation
   js/gallery.js — Horizontal touch-swipe slider (native scroll-snap driven,
   dots synced via scroll position) + fullscreen lightbox with swipe/keyboard
   navigation. No external libraries.
   ========================================================================== */

(() => {
  'use strict';

  function initGallery() {
    const track = document.getElementById('gallery-track');
    const dotsWrap = document.getElementById('gallery-dots');
    const lightbox = document.getElementById('lightbox');
    if (!track || !lightbox) return;

    const slides = Array.from(track.querySelectorAll('.gallery-slide'));
    if (!slides.length) return;

    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let currentIndex = 0;

    /* ---- build nav dots ---- */
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dotsWrap.appendChild(dot);
      });
    }
    const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

    /* ---- sync dots to native horizontal scroll position ---- */
    let scrollTicking = false;
    function updateActiveDotFromScroll() {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;

      let closestIndex = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const r = slide.getBoundingClientRect();
        const slideCenter = r.left + r.width / 2;
        const dist = Math.abs(slideCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });

      dots.forEach((d, i) => d.classList.toggle('active', i === closestIndex));
      scrollTicking = false;
    }

    track.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(updateActiveDotFromScroll);
        scrollTicking = true;
      }
    }, { passive: true });

    // initial sync (in case of restored scroll position)
    requestAnimationFrame(updateActiveDotFromScroll);

    /* ---- lightbox open/close/nav ---- */
    function openLightbox(index) {
      currentIndex = index;
      const img = slides[index].querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add('is-visible'));
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-visible');
      document.body.style.overflow = '';
      setTimeout(() => { lightbox.hidden = true; }, 350);
    }

    function showAt(index) {
      const wrapped = (index + slides.length) % slides.length;
      currentIndex = wrapped;
      const img = slides[wrapped].querySelector('img');
      if (img) {
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || '';
          lightboxImg.style.opacity = '1';
        }, 120);
      }
    }

    slides.forEach((slide, i) => {
      slide.addEventListener('click', () => openLightbox(i));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => showAt(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showAt(currentIndex + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showAt(currentIndex - 1);
      if (e.key === 'ArrowRight') showAt(currentIndex + 1);
    });

    /* ---- swipe within the lightbox itself ---- */
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) showAt(currentIndex + 1);
        else showAt(currentIndex - 1);
      }
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', initGallery);
})();

