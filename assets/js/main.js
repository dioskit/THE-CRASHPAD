/**
 * THE CRASHPAD — v7
 * Loader, header, drawer, scroll reveal, project carousels, grade tabs,
 * lightbox, gallery drag-scroll, Formspree contact form.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── LOADER ───────────────────────────────────────────────────────────────
  const loader = document.getElementById('page-loader');
  const hideLoader = () => loader?.classList.add('hidden');
  if (document.readyState === 'complete') setTimeout(hideLoader, 300);
  else {
    window.addEventListener('load', () => setTimeout(hideLoader, 300));
    // Don't hold visitors on slow connections while every image finishes.
    setTimeout(hideLoader, 1500);
  }

  // ── HEADER + SCROLL SPY ──────────────────────────────────────────────────
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const spySections = [...navLinks]
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    let current = '';
    spySections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 160) current = sec.id; });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── MOBILE DRAWER ────────────────────────────────────────────────────────
  const toggle = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const setDrawer = open => {
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    drawer.toggleAttribute('inert', !open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle?.addEventListener('click', () => setDrawer(true));
  document.getElementById('drawer-close-btn')?.addEventListener('click', () => setDrawer(false));
  overlay?.addEventListener('click', () => setDrawer(false));
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false); });

  // ── SCROLL REVEAL ────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-revealed'));
  }

  // ── PROJECT CAROUSELS ────────────────────────────────────────────────────
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = track.querySelectorAll('img');
    const dotsWrap = carousel.querySelector('.car-dots');
    if (slides.length < 2 || !dotsWrap) return;

    const dots = [...slides].map(() => dotsWrap.appendChild(document.createElement('span')));
    // Track the intended slide separately so rapid clicks don't read a mid-scroll position.
    let current = 0;
    let settleTimer;
    const paint = () => dots.forEach((d, n) => d.classList.toggle('on', n === current));
    const goTo = i => {
      current = (i + slides.length) % slides.length;
      track.scrollTo({ left: current * track.clientWidth });
      paint();
    };

    carousel.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    carousel.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
    // Swipes: sync once scrolling settles
    track.addEventListener('scroll', () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => { current = Math.round(track.scrollLeft / track.clientWidth); paint(); }, 120);
    }, { passive: true });
    paint();
  });

  // Arrow keys move the carousel of a focused project card
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') card.querySelector('.next')?.click();
      if (e.key === 'ArrowLeft') card.querySelector('.prev')?.click();
    });
  });

  // ── GRADE TABS ───────────────────────────────────────────────────────────
  const tabs = document.querySelectorAll('.grade-tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.grade-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(`panel-${tab.dataset.grade}`)?.classList.add('active');
  }));

  // ── LIGHTBOX ─────────────────────────────────────────────────────────────
  const lightbox = document.getElementById('lightbox-dialog');
  const lbImg = document.getElementById('lightbox-image');
  let dragged = false;

  document.addEventListener('click', e => {
    const target = e.target.closest('img[data-zoom]');
    if (!target || dragged || !lightbox?.showModal) return;
    lbImg.src = target.currentSrc || target.src;
    lbImg.alt = target.alt;
    lightbox.showModal();
  });
  document.getElementById('lightbox-close-btn')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

  // ── COMMUNITY STRIP: drag to scroll ──────────────────────────────────────
  const strip = document.querySelector('.gallery-strip-scroll');
  if (strip) {
    let startX = 0, startLeft = 0, down = false;
    strip.addEventListener('mousedown', e => { down = true; dragged = false; startX = e.pageX; startLeft = strip.scrollLeft; });
    window.addEventListener('mouseup', () => { down = false; setTimeout(() => { dragged = false; }, 0); });
    strip.addEventListener('mousemove', e => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 5) dragged = true;
      strip.scrollLeft = startLeft - dx;
    });
  }

  // ── TEAM: tap a photo to show the name + Instagram ───────────────────────
  const portraits = document.querySelectorAll('.portrait');
  portraits.forEach(p => p.addEventListener('click', e => {
    if (e.target.closest('a')) return;          // let Instagram links open
    const wasOpen = p.classList.contains('open');
    portraits.forEach(o => o.classList.remove('open'));
    p.classList.toggle('open', !wasOpen);
  }));

  // ── ACTIVITIES: tap a card to flip it and read the description ───────────
  document.querySelectorAll('.activity-tile').forEach(tile => tile.addEventListener('click', () => {
    const flipped = tile.classList.toggle('flipped');
    tile.setAttribute('aria-expanded', String(flipped));
  }));

  // ── PARTNER / CLIENT LOGOS: phone sheet ──────────────────────────────────
  document.querySelectorAll('.logos-open').forEach(btn => {
    const sheet = document.getElementById(btn.dataset.open);
    const close = () => { sheet.hidden = true; document.body.style.overflow = ''; btn.focus(); };
    btn.addEventListener('click', () => {
      sheet.hidden = false;
      document.body.style.overflow = 'hidden';
      sheet.querySelector('.logo-sheet-close').focus();
    });
    sheet.querySelector('.logo-sheet-close').addEventListener('click', close);
    sheet.addEventListener('click', e => { if (e.target === sheet) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) close(); });
  });

  // ── TOAST ────────────────────────────────────────────────────────────────
  const toast = document.getElementById('toast-notice');
  const toastMsg = document.getElementById('toast-message');
  const showToast = msg => {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5500);
  };

  // ── CONTACT FORM ─────────────────────────────────────────────────────────
  // Submissions go to Formspree (the form's action). Until a real form ID is
  // set there, fall back to opening the visitor's mail app with the message.
  const form = document.getElementById('crashpad-contact-form');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const val = id => document.getElementById(id)?.value.trim() || '';

    const sendViaMailto = (name, interest) => {
      const body = [
        `Name: ${name}`,
        `Organisation / School: ${val('contact-org') || '-'}`,
        `Email: ${val('contact-email')}`,
        `Interested in: ${interest}`,
        '',
        val('contact-message')
      ].join('\n');
      window.location.href = `mailto:crashpadmangar@gmail.com?subject=${encodeURIComponent(`${interest} — ${name}`)}&body=${encodeURIComponent(body)}`;
      showToast(`Thanks, ${name}. Your email app should open with the message ready to send.`);
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const name = val('contact-name');
      const interest = val('contact-interest') || 'General enquiry';
      const endpoint = form.getAttribute('action') || '';

      if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint) || endpoint.endsWith('YOUR_FORM_ID')) {
        sendViaMailto(name, interest);
        return;
      }

      form.querySelector('input[name="_subject"]').value = `Crashpad website: ${interest} — ${name}`;
      const label = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
        showToast(`Thank you, ${name}. Your message has been sent — we'll be in touch soon.`);
        form.reset();
      } catch (err) {
        console.error(err);
        showToast('Sorry, the message could not be sent. Please email us at crashpadmangar@gmail.com.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = label;
      }
    });
  }
});
