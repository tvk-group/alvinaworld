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

  function initHeroPortraitParallax() {
    const portrait = document.getElementById('hero-portrait');
    if (!portrait || window.matchMedia('(max-width: 899px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const maxOffset = 10;
    portrait.addEventListener('mousemove', function (e) {
      const rect = portrait.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      portrait.style.setProperty('--parallax-x', (x * maxOffset) + 'px');
      portrait.style.setProperty('--parallax-y', (y * maxOffset) + 'px');
    });

    portrait.addEventListener('mouseleave', function () {
      portrait.style.setProperty('--parallax-x', '0px');
      portrait.style.setProperty('--parallax-y', '0px');
    });
  }

  function initPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
      });
    }

    const modal = document.getElementById('pwa-install-modal');
    const backdrop = document.getElementById('pwa-install-backdrop');
    const confirmBtn = document.getElementById('pwa-install-confirm');
    const cancelBtn = document.getElementById('pwa-install-cancel');
    const banner = document.getElementById('pwa-install-banner');
    const bannerBtn = document.getElementById('pwa-install-banner-btn');
    const iosHint = document.getElementById('pwa-ios-hint');
    const installSection = document.getElementById('app-install');
    let deferredPrompt = null;

    function isStandalone() {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    function isIos() {
      return /iphone|ipad|ipod/i.test(navigator.userAgent);
    }

    function isDismissed() {
      try {
        return sessionStorage.getItem('alvinaworld-pwa-dismissed') === '1';
      } catch (e) {
        return false;
      }
    }

    function setDismissed() {
      try {
        sessionStorage.setItem('alvinaworld-pwa-dismissed', '1');
      } catch (e) {}
    }

    function showIosHint() {
      if (iosHint && isIos()) iosHint.hidden = false;
    }

    function showInstallModal() {
      if (!modal || isStandalone() || isDismissed()) return;
      showIosHint();
      modal.hidden = false;
      document.body.classList.add('pwa-modal-open');
    }

    function hideInstallModal(showBanner) {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('pwa-modal-open');
      if (showBanner !== false) showInstallBanner();
    }

    function showInstallBanner() {
      if (!banner || isStandalone() || isDismissed()) return;
      banner.hidden = false;
    }

    function scrollToInstallGuide() {
      hideInstallModal(false);
      if (installSection) {
        const offset = 80;
        const top = installSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }

    function runNativeInstall() {
      if (!deferredPrompt) {
        scrollToInstallGuide();
        return;
      }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        deferredPrompt = null;
        hideInstallModal();
        if (choice.outcome === 'dismissed') setDismissed();
      });
    }

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;
      if (!isDismissed() && !isStandalone()) showInstallModal();
    });

    if (confirmBtn) confirmBtn.addEventListener('click', runNativeInstall);
    if (bannerBtn) bannerBtn.addEventListener('click', runNativeInstall);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        setDismissed();
        hideInstallModal();
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', function () {
        setDismissed();
        hideInstallModal();
      });
    }

    if (!isStandalone() && !isDismissed()) {
      showIosHint();
      setTimeout(showInstallModal, 500);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLanguage();
    initMobileNav();
    initScrollReveal();
    initHeaderScroll();
    initSmoothAnchors();
    initYear();
    initHeroPortraitParallax();
    initPwa();
  });
})();
