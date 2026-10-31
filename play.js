// تجربة قصيرة من اللعبة: ثلاث شركات وهمية، تسحب البطاقة أو تضغط الزر، فتنقلب وتكشف الحقيقة
(function () {
  var root = document.getElementById('demo');
  if (!root) return;
  var ar = document.documentElement.lang === 'ar';
  var STORE = root.ownerDocument.querySelector('.btn-store').outerHTML;
  var L = ar
    ? { pe: 'مكرر الربحية', avg: 'متوسط القطاع', g: 'نمو الأرباح السنوي', d: 'الديون ÷ حقوق المساهمين', buy: 'اشترِ', skip: 'تجاهل', next: 'التالي', done: 'النتيجة',
        win: 'ربحت!', lose: 'خسرت', dodged: 'أحسنت التجاهل!', missed: 'فاتتك فرصة!', again: 'أعد التجربة', card: 'بطاقة',
        score: 'أصبت {n} من 3', ends: ['البداية صعبة، واللعبة تعلّمك خطوة بخطوة.', 'بداية جيدة! أكمل الطريق في اللعبة.', 'قريب جدًا! أحيانًا تبدو الجوهرة غالية.', 'عين مستثمر! هل تصل إلى الجزيرة؟'] }
    : { pe: 'P/E ratio', avg: 'Sector avg', g: 'Annual earnings growth', d: 'Debt ÷ equity', buy: 'BUY', skip: 'SKIP', next: 'Next', done: 'See result',
        win: 'You won!', lose: 'You lost', dodged: 'Great skip!', missed: 'You missed it!', again: 'Play again', card: 'Card',
        score: 'You got {n} of 3 right', ends: ['A tough start. The game teaches you step by step.', 'A good start! Keep going in the game.', 'So close! Sometimes a gem looks expensive.', 'An investor’s eye! Can you reach the island?'] };
  var CARDS = ar ? [
    { c: 'س', n: 'مصرف سهيل', s: 'المصارف', sc: 's1', pe: 6.8, avg: 12, g: 9, d: .4, ret: 34, k: 'قيمة حقيقية', art: 'gem', why: 'مكرر 6.8 أقل بكثير مما يبرره نمو أرباحها 9%، ومتوسط المصارف نحو 12. كان السعر أقل من القيمة العادلة.' },
    { c: 'س', n: 'سنام للتقنية', s: 'التقنية', sc: 's0', pe: 105, avg: 26, g: 12, d: .3, ret: -37, k: 'فقاعة', art: 'bubble', why: 'مكرر 105 مقابل نمو 12% فقط، ومتوسط التقنية نحو 26. سبق السعر الأرباح بمراحل، ثم عاد إلى الواقع.' },
    { c: 'م', n: 'منارة الطبية', s: 'الرعاية الصحية', sc: 's6', pe: 41, avg: 25, g: 38, d: .1, ret: 31, k: 'جوهرة نمو', art: 'emerald', why: 'مكرر 41 يبدو غاليًا، لكن نمو 38% ونقدًا قويًا وديونًا قليلة تبرره. الجودة تستحق سعرها.' }
  ] : [
    { c: 'S', n: 'Sail Bank', s: 'Banking', sc: 's1', pe: 6.8, avg: 12, g: 9, d: .4, ret: 34, k: 'Real value', art: 'gem', why: 'A P/E of 6.8 is well below what its 9% earnings growth justifies, with the Banking average about 12. The price was below fair value.' },
    { c: 'D', n: 'Dew Tech', s: 'Technology', sc: 's0', pe: 105, avg: 26, g: 12, d: .3, ret: -37, k: 'Bubble', art: 'bubble', why: 'A P/E of 105 for only 12% growth, with the Technology average about 26. The price ran way ahead of earnings, then came back to reality.' },
    { c: 'B', n: 'Beacon Health', s: 'Healthcare', sc: 's6', pe: 41, avg: 25, g: 38, d: .1, ret: 31, k: 'Growth gem', art: 'emerald', why: 'A P/E of 41 looks expensive, but 38% growth, strong cash and little debt justify it. Quality earns its price.' }
  ];

  var i = 0, right = 0, picks = [], open = false, busy = false, dx = 0, sx = null, flip, front, stamps;
  var sgn = function (v) { return (v > 0 ? '+' : '') + v + '%'; };

  function dots() {
    var h = '';
    for (var k = 0; k < CARDS.length; k++) h += '<i class="' + (k < picks.length ? (picks[k] ? 'ok' : 'no') : k === picks.length ? 'now' : '') + '"></i>';
    return '<div class="d-top"><span>' + L.card + ' ' + (i + 1) + '/' + CARDS.length + '</span><div class="d-dots">' + h + '</div></div>';
  }

  function show() {
    var c = CARDS[i], pos = Math.min(92, Math.max(8, c.pe / (c.avg * 2) * 100));
    open = false; busy = false; dx = 0;
    root.innerHTML = dots() +
      '<div class="stage"><div class="flip"><div class="face front" role="group" aria-label="' + c.n + '">' +
        '<span class="d-stamp buy">' + L.buy + '</span><span class="d-stamp skip">' + L.skip + '</span>' +
        '<div class="d-scene"><img src="img/art/' + c.sc + '.webp" alt="" draggable="false"><div class="d-name"><span class="d-logo">' + c.c + '</span><div><small>' + c.s + '</small><b>' + c.n + '</b></div></div></div>' +
        '<div class="d-body"><div class="d-pe"><div class="d-pe-row"><div><b>' + L.pe + '</b><small>' + L.avg + ' ' + c.avg + '</small></div><strong>' + c.pe + '</strong></div><div class="gauge"><i style="left:' + pos + '%"></i></div></div>' +
        '<div class="d-tiles"><div class="d-tile"><small>' + L.g + '</small><b dir="ltr">' + sgn(c.g) + '</b></div><div class="d-tile"><small>' + L.d + '</small><b dir="ltr">' + c.d + 'x</b></div></div></div>' +
      '</div><div class="face back" aria-live="polite"></div></div></div>' +
      '<div class="d-actions" dir="ltr"><button class="btn btn-red" data-a="skip">' + L.skip + '</button><button class="btn btn-green" data-a="buy">' + L.buy + '</button></div>';
    flip = root.querySelector('.flip');
    front = root.querySelector('.front');
    stamps = { buy: root.querySelector('.d-stamp.buy'), skip: root.querySelector('.d-stamp.skip') };
    root.querySelector('[data-a=skip]').onclick = function () { decide(false); };
    root.querySelector('[data-a=buy]').onclick = function () { decide(true); };
    front.addEventListener('pointerdown', function (e) { if (open || busy) return; sx = e.clientX; nudging = false; flip.style.transition = 'none'; });
  }

  function drag(x, animate) {
    dx = x;
    flip.style.transition = animate ? 'transform .2s ease-out' : 'none';
    flip.style.transform = x ? 'translateX(' + x + 'px) rotate(' + x / 26 + 'deg)' : '';
    var a = Math.min(1, Math.max(0, (Math.abs(x) - 26) / 60));
    stamps.buy.style.opacity = x > 0 ? a : 0;
    stamps.skip.style.opacity = x < 0 ? a : 0;
  }

  window.addEventListener('pointermove', function (e) { if (sx !== null) drag(e.clientX - sx); });
  function up() {
    if (sx === null) return;
    sx = null;
    if (Math.abs(dx) > 80) decide(dx > 0); else drag(0, true);
  }
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', function () { dx = 0; up(); });

  function decide(buy) {
    if (open || busy) return;
    nudging = false;
    var c = CARDS[i], up = c.ret > 0, ok = buy === up, pops = c.art === 'bubble';
    busy = true;
    drag(0, true);
    picks.push(ok);
    if (ok) right++;
    var tone = ok ? '#16A34A' : '#DC2626', dark = ok ? '#0E6B33' : '#8E1B1B';
    var back = root.querySelector('.back');
    back.style.setProperty('--tone', tone);
    back.style.setProperty('--tone-dark', dark);
    back.innerHTML = '<div class="d-reveal"><span class="d-verdict">' + (buy ? (ok ? L.win : L.lose) : (ok ? L.dodged : L.missed)) + '</span>' +
      (pops ? '<img class="pop-out" src="img/art/bubble.webp" alt=""><img class="pop-late" src="img/art/boom.webp" alt="">' : '<img class="pop-in" src="img/art/' + c.art + '.webp" alt="">') +
      '<span class="d-kind">' + c.k + '</span></div>' +
      '<div class="d-why"><div class="d-why-top"><b>' + c.n + '</b><strong>' + sgn(c.ret) + '</strong></div><p>' + c.why + '</p></div>';
    setTimeout(function () {
      flip.style.transition = ''; flip.style.transform = '';
      flip.classList.add('on');
      open = true; busy = false;
      var last = i === CARDS.length - 1;
      root.querySelector('.d-top').outerHTML = dots();
      root.querySelector('.d-actions').innerHTML = '<button class="btn btn-green wide" data-a="next">' + (last ? L.done : L.next) + '</button>';
      root.querySelector('[data-a=next]').onclick = function () { i++; if (last) end(); else show(); };
    }, 200);
  }

  function end() {
    root.innerHTML = '<div class="win d-end"><img src="img/art/' + (right === 3 ? 'crown' : right ? 'star' : 'bubble') + '.webp" alt=""><h3>' + L.score.replace('{n}', right) + '</h3><p>' + L.ends[right] + '</p>' + STORE + '<button data-a="again">' + L.again + '</button></div>';
    root.querySelector('[data-a=again]').onclick = function () { i = 0; right = 0; picks = []; show(); };
  }

  // أول ظهور للبطاقة: تتمايل يمينًا ويسارًا، فيعرف الزائر أنها تُسحب
  var nudging = false;
  function nudge() {
    nudging = true;
    var seq = [[105, 0], [0, 650], [-105, 900], [0, 1550]];
    seq.forEach(function (p) { setTimeout(function () { if (nudging && !open) drag(p[0], true); if (p[1] === 1550) nudging = false; }, p[1]); });
  }

  show();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); setTimeout(nudge, 500); }
    }, { threshold: .7 });
    io.observe(root);
  }
})();
