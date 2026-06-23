// floui · reveal on scroll — progressive enhancement, never traps content hidden.
(function () {
  var els = [].slice.call(document.querySelectorAll('.reveal'));
  if (!els.length) return;

  function showAll() { els.forEach(function (el) { el.classList.add('in'); }); }

  // No observer or reduced motion → just show everything.
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showAll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });

  // Failsafe: if anything is still hidden shortly after load (e.g. headless
  // capture that doesn't scroll), reveal it so content is never lost.
  setTimeout(showAll, 1200);
})();
