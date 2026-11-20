/* =====================================================================
   Balanced Ketamine — script-v4.js
   Extends the v3 behavior (sticky header, mobile menu, smooth scroll,
   carousel) with: per-field form validation, post-submit redirect back to
   the home page, GA4 / Meta Pixel event hooks and click-to-load videos.
   ===================================================================== */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Conversion tracking helper ----------
     Always pushes to dataLayer (GTM-ready); also calls gtag()/fbq() if loaded. */
  const META_EVENTS = { generate_lead: 'Lead', click_to_call: 'Contact', whatsapp_click: 'Contact', book_appointment_click: 'Schedule' };
  const track = (event, params = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
    if (typeof window.gtag === 'function') window.gtag('event', event, params);
    if (typeof window.fbq === 'function' && META_EVENTS[event]) window.fbq('track', META_EVENTS[event], params);
  };
  $$('[data-track]').forEach((el) => {
    el.addEventListener('click', () => track(el.dataset.track, { link_url: el.getAttribute('href') || '', link_text: el.textContent.trim() }));
  });

  /* ---------- Sticky header shadow ---------- */
  const header = $('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ---------- Mobile navigation ---------- */
  const menuButton = $('.menu-toggle');
  const navLinks = $('.nav-links');
  const setMenu = (open) => {
    navLinks.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
    $$('a', navLinks).forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) { setMenu(false); menuButton.focus(); }
    });
  }

  /* ---------- Smooth scroll for same-page anchors ---------- */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Appointment form ---------- */
  const form = $('#appointment-form');
  const formStatus = $('#form-status');
  const success = $('#form-success');

  const messages = {
    firstName: 'Please enter your first name.',
    lastName: 'Please enter your last name.',
    phone: 'Please enter a valid phone number (at least 10 digits).',
    email: 'Please enter a valid email address.',
    consent: 'Please confirm we may contact you.'
  };

  const validateField = (field) => {
    let valid = field.checkValidity();
    if (field.name === 'phone' && valid) valid = field.value.replace(/\D/g, '').length >= 10;
    const error = $('#' + field.id + '-error');
    field.setAttribute('aria-invalid', String(!valid));
    if (error) error.textContent = valid ? '' : (messages[field.name] || 'This field is required.');
    return valid;
  };

  if (form) {
    const required = $$('[required]', form);
    required.forEach((field) => {
      field.addEventListener('blur', () => { if (field.value || field.type === 'checkbox') validateField(field); });
      field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validateField(field); });
      field.addEventListener('change', () => { if (field.type === 'checkbox') validateField(field); });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Spam honeypot: silently ignore bot submissions.
      if ($('#website', form)?.value) return;

      const invalid = required.filter((field) => !validateField(field));
      if (invalid.length) {
        formStatus.textContent = 'Please fix the highlighted fields.';
        invalid[0].focus();
        return;
      }

      const submitButton = $('button[type="submit"]', form);
      submitButton.disabled = true;
      formStatus.textContent = 'Sending…';

      try {
        // TODO(FORM): set data-endpoint on the <form> to a HIPAA-compliant handler.
        const endpoint = form.dataset.endpoint;
        if (endpoint) {
          const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error('Request failed');
        }
        // Flag a fresh conversion so the lead event fires once after redirect.
        try { sessionStorage.setItem('bk_lead', '1'); } catch (_) { /* storage blocked */ }
        // All submissions redirect back to the home page.
        window.location.href = form.dataset.redirect || 'index-v4.html?submitted=true#appointment';
      } catch (_) {
        formStatus.textContent = 'Something went wrong. Please call (816) 555-0123 and we will help right away.';
        submitButton.disabled = false;
      }
    });
  }

  /* ---------- Post-redirect success state + lead conversion ---------- */
  if (success && new URLSearchParams(window.location.search).get('submitted') === 'true') {
    success.hidden = false;
    form?.setAttribute('hidden', '');
    let fresh = false;
    try { fresh = sessionStorage.getItem('bk_lead') === '1'; sessionStorage.removeItem('bk_lead'); } catch (_) { /* storage blocked */ }
    if (fresh) track('generate_lead', { form_id: 'appointment-form' });
    success.focus({ preventScroll: true });
    // Clean the URL so refreshing doesn't show the message again.
    history.replaceState(null, '', window.location.pathname + '#appointment');
  }

  /* ---------- Click-to-load YouTube videos (keeps LCP/INP fast) ---------- */
  $$('.video-facade').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.videoId;
      if (!id || id.startsWith('REPLACE')) {
        button.querySelector('.video-label').textContent = 'Video coming soon';
        return;
      }
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      iframe.title = button.getAttribute('aria-label').replace('Play video: ', '');
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      button.replaceChildren(iframe);
      track('video_play', { video_id: id });
    });
  });

  /* ---------- Testimonial carousel ---------- */
  const slides = $$('.slide');
  const dots = $$('.slider-dot');
  let active = 0;
  const showSlide = (index) => {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      slide.setAttribute('aria-hidden', String(i !== active));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-pressed', String(i === active));
    });
  };
  $$('.slider-arrow').forEach((btn) => btn.addEventListener('click', () => showSlide(active + (btn.dataset.direction === 'next' ? 1 : -1))));
  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
  $('.slider')?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showSlide(active + 1);
    if (e.key === 'ArrowLeft') showSlide(active - 1);
  });
  showSlide(0);

  /* ---------- Copyright year ---------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
