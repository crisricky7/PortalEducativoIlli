/* ==========================================================================
   Colegio Los Ilinizas — Portal Educativo
   Interacciones accesibles sin dependencias
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.header');
  var toTop = document.querySelector('.to-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menú móvil */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  function setMobileMenu(open, restoreFocus) {
    if (!navToggle || !nav) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    document.body.classList.toggle('nav-open', open);
    if (open) {
      var firstLink = nav.querySelector('a, button');
      if (firstLink) firstLink.focus();
    } else if (restoreFocus) {
      navToggle.focus();
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setMobileMenu(!nav.classList.contains('is-open'), false);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMobileMenu(false, false); });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && nav.classList.contains('is-open')) setMobileMenu(false, false);
    });
  }

  /* Dropdown de oferta académica */
  document.querySelectorAll('.nav__item').forEach(function (item, index) {
    var dropdown = item.querySelector('.dropdown');
    var trigger = item.querySelector(':scope > .nav__link[aria-haspopup="true"]');
    if (!dropdown || !trigger) return;

    var dropdownId = dropdown.id || 'academic-menu-' + index;
    dropdown.id = dropdownId;
    trigger.setAttribute('aria-controls', dropdownId);

    function setDropdown(open) {
      item.classList.toggle('is-dropdown-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    trigger.addEventListener('click', function () {
      setDropdown(!item.classList.contains('is-dropdown-open'));
    });

    item.addEventListener('focusout', function (event) {
      if (!item.contains(event.relatedTarget)) setDropdown(false);
    });

    item.addEventListener('mouseleave', function () {
      if (!item.contains(document.activeElement)) setDropdown(false);
    });
  });

  document.addEventListener('click', function (event) {
    document.querySelectorAll('.nav__item.is-dropdown-open').forEach(function (item) {
      if (!item.contains(event.target)) {
        item.classList.remove('is-dropdown-open');
        var trigger = item.querySelector('[aria-haspopup="true"]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.nav__item.is-dropdown-open').forEach(function (item) {
      item.classList.remove('is-dropdown-open');
      var trigger = item.querySelector('[aria-haspopup="true"]');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
    if (nav && nav.classList.contains('is-open')) setMobileMenu(false, true);
  });

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if (!reducedMotion && 'IntersectionObserver' in window && revealEls.length) {
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

  /* Contadores animados con valor final disponible sin JavaScript */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var duration = 1400;
    var start = null;
    el.textContent = '0';

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if (!reducedMotion && 'IntersectionObserver' in window && counters.length) {
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

  /* Acordeón FAQ */
  function setAccordionState(item, open) {
    var trigger = item.querySelector('.accordion__trigger');
    var panel = item.querySelector('.accordion__panel');
    var panelInner = panel && panel.querySelector('.accordion__panel-inner');
    if (!trigger || !panel || !panelInner) return;
    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    panel.style.maxHeight = open ? panelInner.scrollHeight + 'px' : null;
  }

  document.querySelectorAll('.accordion__item').forEach(function (item, index) {
    var trigger = item.querySelector('.accordion__trigger');
    var panel = item.querySelector('.accordion__panel');
    if (!trigger || !panel) return;

    trigger.id = trigger.id || 'faq-trigger-' + index;
    panel.id = panel.id || 'faq-panel-' + index;
    trigger.setAttribute('aria-controls', panel.id);
    panel.setAttribute('aria-labelledby', trigger.id);
    setAccordionState(item, false);

    trigger.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      document.querySelectorAll('.accordion__item.is-open').forEach(function (other) {
        if (other !== item) setAccordionState(other, false);
      });
      setAccordionState(item, willOpen);
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.accordion__item.is-open').forEach(function (item) {
      setAccordionState(item, true);
    });
  });

  /* Año dinámico */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Volver arriba */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* Formulario estático: valida y abre un correo real, sin simular un envío */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var course = data.get('curso') || 'No especificado';
      var subject = 'Consulta web - ' + course;
      var body = [
        'Nombres: ' + data.get('nombres'),
        'Correo: ' + data.get('email'),
        'Curso al que aplica: ' + course,
        '',
        'Mensaje:',
        data.get('mensaje')
      ].join('\n');
      var mailto = 'mailto:colegioilinizas@hotmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var status = document.getElementById('form-success');
      if (status) {
        status.classList.add('is-visible');
        status.focus();
      }
      window.location.href = mailto;
    });
  }
})();
