/* Interactive behavior for the Balanced Ketamine learning demo. */
(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const appointmentForm = document.querySelector('#appointment-form');
  const formStatus = document.querySelector('#form-status');
  const year = document.querySelector('#year');

  // Add a subtle shadow when the sticky header is no longer at page top.
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Mobile navigation toggle and close-on-selection behavior.
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation menu');
      });
    });
  }

  // Smooth-scroll same-page anchors; CSS also supplies smooth behavior.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });

  // Lightweight client-side validation for the non-submitting demo form.
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const requiredFields = [...appointmentForm.querySelectorAll('[required]')];
      let firstInvalid = null;
      requiredFields.forEach((field) => {
        const valid = field.checkValidity();
        field.setAttribute('aria-invalid', String(!valid));
        if (!valid && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        formStatus.textContent = 'Please complete the required fields with valid information.';
        firstInvalid.focus();
        return;
      }
      formStatus.textContent = 'Demo only: no appointment request was sent or stored.';
      appointmentForm.reset();
      requiredFields.forEach((field) => field.removeAttribute('aria-invalid'));
    });

    appointmentForm.querySelectorAll('input[required]').forEach((field) => {
      field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
    });
  }

  // Accessible previous/next and dot controls for the information carousel.
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.slider-dot')];
  let activeSlide = 0;

  const showSlide = (index) => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeSlide);
      slide.setAttribute('aria-hidden', String(i !== activeSlide));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeSlide);
      dot.setAttribute('aria-pressed', String(i === activeSlide));
    });
  };

  document.querySelectorAll('.slider-arrow').forEach((button) => {
    button.addEventListener('click', () => showSlide(activeSlide + (button.dataset.direction === 'next' ? 1 : -1)));
  });
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
  showSlide(0);

  // Set the copyright year from the current date.
  if (year) year.textContent = String(new Date().getFullYear());
})();
