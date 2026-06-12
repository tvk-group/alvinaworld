(function () {
  'use strict';

  const RTL_LANGS = ['ar'];
  const ORBIT_KEYS = [
    'world.core',
    'orbit.personal', 'orbit.flow', 'orbit.wellbeing', 'orbit.growth',
    'orbit.learning', 'orbit.family', 'orbit.reflection', 'orbit.daily'
  ];

  function t(key, lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }

  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = 'en';
    localStorage.setItem('alvina-lang', lang);
    document.documentElement.lang = lang;
    document.body.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key, lang);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key, lang);
    });

    const select = document.getElementById('lang-select');
    if (select) select.value = lang;

    buildMobileOrbitCards(lang);
  }

  function buildMobileOrbitCards(lang) {
    const container = document.getElementById('orbit-cards-mobile');
    if (!container) return;

    container.innerHTML = '';
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    container.setAttribute('aria-hidden', isMobile ? 'false' : 'true');

    ORBIT_KEYS.forEach(function (key, i) {
      const card = document.createElement('div');
      card.className = 'orbit-mobile-card' + (i === 0 ? ' orbit-mobile-card--core' : '');
      card.textContent = t(key, lang);
      container.appendChild(card);
    });
  }

  function initLanguage() {
    const saved = localStorage.getItem('alvina-lang');
    const browserLang = (navigator.language || 'en').slice(0, 2);
    const initial = saved || (TRANSLATIONS[browserLang] ? browserLang : 'en');
    setLanguage(initial);

    const select = document.getElementById('lang-select');
    if (select) {
      select.addEventListener('change', function () {
        setLanguage(this.value);
      });
    }
  }

  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.hidden = expanded;
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.hidden = true;
      });
    });
  }

  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const intelSteps = document.querySelectorAll('.intel-step');

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('visible'); });
      intelSteps.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { revealObserver.observe(el); });

    const intelObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const step = entry.target;
          const index = Array.from(intelSteps).indexOf(step);
          setTimeout(function () {
            step.classList.add('visible');
          }, index * 200);
          intelObserver.unobserve(step);
        }
      });
    }, { threshold: 0.5 });

    intelSteps.forEach(function (el) { intelObserver.observe(el); });
  }

  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', function () {
      const current = window.scrollY;
      if (current > 80) {
        header.style.boxShadow = '0 2px 20px rgba(61, 53, 48, 0.08)';
      } else {
        header.style.boxShadow = 'none';
      }
      lastScroll = current;
    }, { passive: true });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLanguage();
    initMobileNav();
    initScrollReveal();
    initHeaderScroll();
    initSmoothAnchors();
    initYear();
  });
})();
