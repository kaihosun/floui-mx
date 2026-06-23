// floui · mockup animations — chat thread + loyalty stamps.
// Motion-safe: if reduced motion, the HTML's final state is left as-is.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // ── Chat thread ────────────────────────────────────────────
  function setupChat(root) {
    var body = root.querySelector('.chat-body');
    var bubbles = [].slice.call(body.querySelectorAll('.bubble'));
    var typing = document.createElement('div');
    typing.className = 'typing b-hide';
    typing.innerHTML = '<span></span><span></span><span></span>';

    function reset() {
      bubbles.forEach(function (b) { b.classList.add('b-hide'); });
      if (typing.parentNode) typing.parentNode.removeChild(typing);
    }
    async function play() {
      reset();
      await wait(500);
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        var isOut = b.classList.contains('out');
        if (isOut) {
          body.insertBefore(typing, b);
          requestAnimationFrame(function () { typing.classList.remove('b-hide'); });
          await wait(950);
          typing.classList.add('b-hide');
          await wait(220);
          if (typing.parentNode) typing.parentNode.removeChild(typing);
        }
        b.classList.remove('b-hide');
        await wait(isOut ? 720 : 620);
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { play(); }
      });
    }, { threshold: 0.5 });
    reset();
    io.observe(root);
  }

  // ── Loyalty stamps ─────────────────────────────────────────
  function setupStamps(root) {
    var stamps = [].slice.call(root.querySelectorAll('.stamp'));
    var targets = stamps.filter(function (s) { return s.dataset.fill === '1'; });

    function reset() { targets.forEach(function (s) { s.classList.remove('filled'); }); }
    async function play() {
      reset();
      await wait(450);
      for (var i = 0; i < targets.length; i++) {
        targets[i].classList.add('filled');
        targets[i].animate(
          [{ transform: 'scale(0.5)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
          { duration: 320, easing: 'ease-out' }
        );
        await wait(360);
      }
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { play(); } });
    }, { threshold: 0.5 });
    reset();
    io.observe(root);
  }

  document.querySelectorAll('[data-chat]').forEach(setupChat);
  document.querySelectorAll('[data-stamps]').forEach(setupStamps);
})();
