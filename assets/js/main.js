/* ==========================================================================
   Colegio Los Ilinizas — Portal Educativo
   JavaScript vanilla — sin dependencias, sin frameworks
   Funciones: menú móvil, header sticky, reveal on scroll, acordeón,
   año dinámico, botón "volver arriba"
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------------
     1. Header sticky (sombra al hacer scroll)
  ------------------------------------------------------------------ */
  var header = document.querySelector('.header');
  var toTop = document.querySelector('.to-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     2. Menú móvil
  ------------------------------------------------------------------ */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Cerrar menú al hacer clic en un enlace
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Reveal on scroll (IntersectionObserver)
  ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     4. Contadores animados (estadísticas)
  ------------------------------------------------------------------ */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ------------------------------------------------------------------
     5. Acordeón (FAQ)
  ------------------------------------------------------------------ */
  document.querySelectorAll('.accordion__item').forEach(function (item) {
    var trigger = item.querySelector('.accordion__trigger');
    var panel = item.querySelector('.accordion__panel');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      var panelInner = panel.querySelector('.accordion__panel-inner');

      // Cerrar todos los demás
      document.querySelectorAll('.accordion__item.is-open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          var otherPanel = other.querySelector('.accordion__panel');
          if (otherPanel) otherPanel.style.maxHeight = null;
          var otherTrigger = other.querySelector('.accordion__trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panelInner.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  });

  /* ------------------------------------------------------------------
     6. Año dinámico en footer
  ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     7. Botón volver arriba
  ------------------------------------------------------------------ */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     8. Formulario de contacto (demo — sin backend)
  ------------------------------------------------------------------ */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = document.getElementById('form-success');
      var card = document.getElementById('form-card-body');
      if (success) success.classList.add('is-visible');
      if (card) card.style.display = 'none';
      window.scrollTo({ top: form.offsetTop - 120, behavior: 'smooth' });
    });
  }
})();
