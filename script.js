/*
  Portfolio UI behaviors:
  - Typing animation in hero
  - Smooth scrolling (with offset handled by scrollIntoView)
  - Mobile hamburger menu
  - Scroll reveal animations using Intersection Observer
  - Active section highlighting in navbar
  - Skills progress bar animation
  - Frontend-only contact form validation
*/

(() => {
  'use strict';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /** =====================
   *  Typing animation
   *  ===================== */
  const typingEl = document.querySelector('.typing');
  if (typingEl) {
    const words = ['Frontend Developer', 'UI Engineer', 'Web Designer', 'JavaScript Enthusiast'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';

    // Basic cursor style through inline CSS injection (to keep setup simple)
    const style = document.createElement('style');
    style.textContent = `.typing-cursor{display:inline-block;margin-left:6px;opacity:.9;animation:blink 1s steps(2,end) infinite;}@keyframes blink{0%,49%{opacity:.9}50%,100%{opacity:.1}}`;
    document.head.appendChild(style);

    typingEl.appendChild(cursor);

    const typeSpeed = 70;
    const deleteSpeed = 45;
    const pause = 900;

    const tick = () => {
      const current = words[wordIndex];
      const beforeCursor = typingEl.childNodes[0];

      // Ensure text node exists at index 0
      if (!beforeCursor || beforeCursor.nodeType !== Node.TEXT_NODE) {
        typingEl.insertBefore(document.createTextNode(''), cursor);
      }

      const textNode = typingEl.childNodes[0];

      if (!isDeleting) {
        // typing
        charIndex++;
        textNode.textContent = current.slice(0, charIndex);

        if (charIndex >= current.length) {
          isDeleting = true;
          setTimeout(tick, pause);
          return;
        }
      } else {
        // deleting
        charIndex--;
        textNode.textContent = current.slice(0, Math.max(0, charIndex));

        if (charIndex <= 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }

      setTimeout(tick, isDeleting ? deleteSpeed : typeSpeed);
    };

    // reduced motion: keep static
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typingEl.childNodes[0].textContent = words[0];
    } else {
      tick();
    }
  }

  /** =====================
   *  Mobile menu
   *  ===================== */
  const hamburgerBtn = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  const setMenuOpen = (open) => {
    if (!hamburgerBtn || !mobileMenu) return;
    hamburgerBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const open = hamburgerBtn.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(open);
    });

    // Close on link click
    mobileMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      setMenuOpen(false);
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    });
  }

  /** =====================
   *  Smooth scrolling
   *  ===================== */
  const handleSmoothScroll = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;

    // Use scrollIntoView for smooth behavior; navbar is sticky so offset is naturally handled.
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-scroll], a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    // Only for same-page anchors
    if (href.startsWith('#')) {
      e.preventDefault();
      const hash = href;
      handleSmoothScroll(hash);
      // Close mobile drawer if open
      setMenuOpen(false);
      history.pushState(null, '', hash);
    }
  });

  /** =====================
   *  Scroll reveal + active section
   *  ===================== */

  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const target = link.getAttribute('data-nav');
      link.classList.toggle('active', target === id);
    });
  };

  // Reveal observer
  const revealEls = Array.from(document.querySelectorAll('.section-reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // Active section observer
  // Use a "rootMargin" so the active link updates when the section is near the navbar
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      // Choose the most visible intersecting section
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

      if (!visible.length) return;
      setActiveNav(visible[0].target.id);
    },
    {
      threshold: [0.15, 0.3, 0.5],
      // Pull the observation box down so "active" aligns better with what user sees under navbar
      rootMargin: `-${document.querySelector('.navbar')?.offsetHeight ?? 72}px 0px -60% 0px`
    }
  );


  sections.forEach((s) => sectionObserver.observe(s));

  /** =====================
   *  Skills progress animation
   *  ===================== */
  const skillCards = Array.from(document.querySelectorAll('.skill-card[data-percent]'));

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const percent = Number(card.getAttribute('data-percent'));
        const fill = card.querySelector('.bar-fill');
        if (fill && Number.isFinite(percent)) {
          fill.style.width = `${percent}%`;
        }
        skillObserver.unobserve(card);
      });
    },
    { threshold: 0.25 }
  );

  skillCards.forEach((card) => skillObserver.observe(card));

  /** =====================
   *  Contact form (frontend only)
   *  ===================== */
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');
  if (form) {
    const getErrorEl = (fieldName) => document.querySelector(`.field-error[data-error-for="${fieldName}"]`);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

    const setError = (field, message) => {
      const el = getErrorEl(field);
      if (!el) return;
      el.textContent = message;
    };

    const clearErrors = () => {
      ['name', 'email', 'message'].forEach((f) => setError(f, ''));
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (note) note.textContent = '';
      clearErrors();

      const name = form.querySelector('#name')?.value.trim() ?? '';
      const email = form.querySelector('#email')?.value.trim() ?? '';
      const message = form.querySelector('#message')?.value.trim() ?? '';

      let ok = true;

      if (name.length < 2) {
        setError('name', 'Please enter your name.');
        ok = false;
      }
      if (!isValidEmail(email)) {
        setError('email', 'Please enter a valid email address.');
        ok = false;
      }
      if (message.length < 10) {
        setError('message', 'Message should be at least 10 characters.');
        ok = false;
      }

      if (!ok) {
        if (note) note.textContent = 'Fix the highlighted fields and try again.';
        return;
      }

      // Frontend-only confirmation
      if (note) {
        note.textContent = 'Message received (demo).';
      }
      form.reset();
    });
  }

  /** =====================
   *  Initial nav active state
   *  ===================== */
  const current = sections.find((s) => s.getBoundingClientRect().top >= 0 && s.getBoundingClientRect().top < 200);
  if (current) setActiveNav(current.id);
})();

