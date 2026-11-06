(function () {
  "use strict";
  var cfg = window.BODA || {};
  var guia = window.GUIA || {};
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Menú (flor) ---------- */
  var btn = $("#menuBtn"), menu = $("#menu");
  function setMenu(open) {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.documentElement.classList.toggle("menu-open", open);
  }
  btn.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); btn.focus(); } });
  var spinTick = false;
  window.addEventListener("scroll", function () {
    if (spinTick) return; spinTick = true;
    requestAnimationFrame(function () { spinTick = false; btn.style.setProperty("--spin", ((window.scrollY * 0.15) % 360).toFixed(1) + "deg"); });
  }, { passive: true });

  /* ---------- Cuenta atrás con tarjetas que giran ---------- */
  var target = new Date(cfg.fechaBoda || "2027-11-06T12:30:00-06:00").getTime();
  var flips = $("#flips"), elH = $("#cdH"), elM = $("#cdM"), elS = $("#cdS");
  var cards = [];
  function makeCard() {
    var c = document.createElement("div");
    c.className = "flip";
    c.innerHTML = '<span class="flip__label">Faltan</span>' +
      '<div class="flip__half flip__half--top"><span>0</span></div>' +
      '<div class="flip__half flip__half--bot"><span>0</span></div>';
    c._v = "0";
    flips.appendChild(c);
    return c;
  }
  function setDigit(c, v, animate) {
    if (c._v === v) return;
    var old = c._v; c._v = v;
    var top = c.querySelector(".flip__half--top span"), bot = c.querySelector(".flip__half--bot span");
    if (!animate) { top.textContent = v; bot.textContent = v; return; }
    top.textContent = v;
    var lt = document.createElement("div"); lt.className = "flip__leaf flip__leaf--top"; lt.innerHTML = "<span>" + old + "</span>";
    var lb = document.createElement("div"); lb.className = "flip__leaf flip__leaf--bot"; lb.innerHTML = "<span>" + v + "</span>";
    c.appendChild(lt); c.appendChild(lb);
    setTimeout(function () { bot.textContent = v; lt.remove(); lb.remove(); }, 540);
  }
  function showDays(n, animate) {
    var str = String(n);
    while (cards.length < str.length) cards.push(makeCard());
    while (cards.length > str.length) cards.pop().remove();
    str.split("").forEach(function (ch, i) { setDigit(cards[i], ch, animate); });
    flips.setAttribute("aria-label", "Faltan " + n + (n === 1 ? " día" : " días"));
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  var rolled = false;
  function secsLeft() { return Math.floor(Math.max(0, target - Date.now()) / 1000); }
  function tick() {
    var s = secsLeft();
    if (rolled) showDays(Math.floor(s / 86400), true);
    elH.textContent = pad(Math.floor((s % 86400) / 3600));
    elM.textContent = pad(Math.floor((s % 3600) / 60));
    elS.textContent = pad(s % 60);
  }
  showDays(Math.floor(secsLeft() / 86400), false);
  tick(); setInterval(tick, 1000);
  // al aparecer, las tarjetas "ruedan" hasta el número de días
  function rollDays() {
    if (rolled) return;
    var final = String(Math.floor(secsLeft() / 86400));
    cards.forEach(function (c, i) {
      var steps = 5 + i * 3, k = 0;
      var t = setInterval(function () {
        k++;
        if (k >= steps) { clearInterval(t); setDigit(c, final[i], true); if (i === cards.length - 1) rolled = true; return; }
        setDigit(c, String((Number(c._v) + 1) % 10), true);
      }, 560);
    });
  }

  /* ---------- Confeti y corazones ---------- */
  var layer = $("#confetti");
  var colors = ["#73151c", "#eeb1ad", "#ebceae", "#7c690b", "#839595", "#e0535d", "#0a2f69"];
  function confetti(n) {
    for (var i = 0; i < n; i++) {
      var c = document.createElement("i");
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      c.style.setProperty("--d", 2.2 + Math.random() * 2 + "s");
      c.style.setProperty("--dx", (Math.random() - 0.5) * 200 + "px");
      c.style.setProperty("--rot", Math.random() * 900 + "deg");
      c.style.animationDelay = Math.random() * 0.6 + "s";
      layer.appendChild(c);
      setTimeout(function (el) { el.remove(); }.bind(null, c), 5000);
    }
  }
  function hearts(x, y) {
    for (var i = 0; i < 14; i++) {
      var h = document.createElement("i");
      h.className = "heart"; h.textContent = "♥";
      h.style.left = x + "px"; h.style.setProperty("--y", y + "px");
      h.style.setProperty("--c", colors[i % 3]);
      h.style.setProperty("--s", 14 + Math.random() * 18 + "px");
      h.style.setProperty("--d", 0.9 + Math.random() * 0.6 + "s");
      var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 90;
      h.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      h.style.setProperty("--dy", Math.sin(ang) * dist - 40 + "px");
      layer.appendChild(h);
      setTimeout(function (el) { el.remove(); }.bind(null, h), 1800);
    }
  }
  $$(".us__stars, .env__seal, .sign__seal").forEach(function (el) {
    el.style.cursor = "pointer";
    el.addEventListener("click", function (e) { hearts(e.clientX, e.clientY); });
  });

  /* ---------- Calendario Día de Muertos ---------- */
  var muertos = $("#muertos");
  var PLANS = {
    muertos: { start: "2027-10-29", end: "2027-11-09", note: "Sales el viernes 29 después de trabajar y vuelves al trabajo el miércoles 10." },
    boda: { start: "2027-11-03", end: "2027-11-09", note: "Sales el miércoles 3 después de trabajar y vuelves al trabajo el miércoles 10." }
  };
  var state = { plan: "muertos", work: "madrid" };
  function parseD(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function renderCal() {
    var plan = PLANS[state.plan], a = parseD(plan.start), b = parseD(plan.end);
    var holidays = ["2027-11-01"];
    if (state.work === "madrid") holidays.push("2027-11-09");
    var trip = 0, vac = 0;
    $$(".cal__grid li").forEach(function (li) {
      var d = parseD(li.dataset.d), inR = d >= a && d <= b;
      li.classList.toggle("in", inR);
      li.classList.toggle("start", +d === +a);
      li.classList.toggle("end", +d === +b);
      if (inR) {
        trip++;
        var wd = d.getDay();
        // el día de salida no cuenta: los vuelos salen por la tarde-noche, después de trabajar
        if (+d !== +a && wd !== 0 && wd !== 6 && holidays.indexOf(li.dataset.d) === -1) vac++;
      }
    });
    muertos.classList.toggle("plan-muertos", state.plan === "muertos");
    muertos.classList.toggle("plan-boda", state.plan === "boda");
    muertos.classList.toggle("madrid", state.work === "madrid");
    $("#tripDays").textContent = trip;
    $("#vacDays").textContent = vac;
    $("#calNote").textContent = plan.note;
    $$(".seg__btn[data-plan]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.plan === state.plan)); });
    $$(".seg__btn[data-work]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.work === state.work)); });
  }
  $$(".seg__btn").forEach(function (x) {
    x.addEventListener("click", function () {
      if (x.dataset.plan) state.plan = x.dataset.plan;
      if (x.dataset.work) state.work = x.dataset.work;
      renderCal();
    });
  });
  renderCal();

  /* ---------- Guía: pestañas ---------- */
  var tabs = $$(".tab");
  function selectTab(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) t.focus();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Guía: listas desde js/guia.js ---------- */
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  $$("[data-list]").forEach(function (box) {
    var items = guia[box.dataset.list] || [];
    if (!items.length) {
      var soon = el("p", "soon");
      soon.appendChild(el("span", "soon__stamp", "Muy pronto"));
      soon.appendChild(el("span", "soon__txt", "Estamos haciendo la lista. Vuelve en unas semanas."));
      box.appendChild(soon);
      return;
    }
    var ul = el("ul", "spots");
    items.forEach(function (it) {
      var li = el("li", "spot");
      var head = el(it.enlace ? "a" : "p", "spot__name", it.nombre);
      if (it.enlace) { head.href = it.enlace; head.target = "_blank"; head.rel = "noopener"; head.textContent = it.nombre + " ↗"; }
      li.appendChild(head);
      if (it.zona) li.appendChild(el("p", "spot__zone", it.zona));
      if (it.nota) li.appendChild(el("p", "spot__note", it.nota));
      if (it.descuento) li.appendChild(el("p", "spot__deal", it.descuento));
      ul.appendChild(li);
    });
    box.appendChild(ul);
  });

  /* ---------- Formulario de asistencia ---------- */
  var form = $("#rsvpForm");
  var attending = $(".js-attending", form), plusOne = $(".js-plusone", form);
  var errorEl = $("#formError"), submitBtn = $("#submitBtn"), thanks = $("#thanks"), thanksMsg = $("#thanksMsg");
  form.addEventListener("change", function (e) {
    if (e.target.name === "asistencia") attending.hidden = e.target.value === "no";
    if (e.target.name === "acompanante") {
      plusOne.hidden = e.target.value !== "si";
      if (!plusOne.hidden) $("#f-guestnames").focus();
    }
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  function showError(msg, field) { errorEl.textContent = msg; errorEl.hidden = false; if (field) field.focus(); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    var name = form.elements.nombre, email = form.elements.email, plusVal = "no";
    var choice = form.querySelector('input[name="asistencia"]:checked');
    if (!name.value.trim()) return showError("Escribe tu nombre para saber quién eres.", name);
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) return showError("Revisa el email: parece que falta algo.", email);
    if (!choice) return showError("Dinos si podrás venir.", $("#f-yes"));
    if (choice.value === "si") {
      var plus = form.querySelector('input[name="acompanante"]:checked');
      if (!plus) return showError("Dinos si vienes con acompañante.", $("#f-plus-yes"));
      if (plus.value === "si" && !$("#f-guestnames").value.trim()) return showError("Escribe el nombre de tu acompañante.", $("#f-guestnames"));
      plusVal = plus.value;
    }
    var data = { personas: choice.value !== "si" ? 0 : (plusVal === "si" ? 2 : 1) };
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.enviado = new Date().toISOString();
    function done() {
      Array.prototype.forEach.call(form.children, function (c) { if (c !== thanks) c.hidden = true; });
      thanks.hidden = false;
      thanksMsg.textContent = choice.value === "si"
        ? "¡Qué ilusión! Nos vemos en Mérida, " + name.value.trim().split(" ")[0] + "."
        : "Te echaremos de menos. Gracias por avisarnos.";
      form.scrollIntoView({ block: "center", behavior: "smooth" });
      if (choice.value === "si") confetti(120);
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
    if (!cfg.rsvpEndpoint) { done(); return; }
    submitBtn.disabled = true; submitBtn.textContent = "Enviando…";
    fetch(cfg.rsvpEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) })
      .then(done)
      .catch(function () {
        submitBtn.disabled = false; submitBtn.textContent = "Enviar respuesta";
        showError("No hemos podido enviar tu respuesta. Comprueba tu conexión y vuelve a intentarlo.");
      });
  });

  /* ---------- Botones de copiar ---------- */
  $$("[data-copy]").forEach(function (b) {
    var label = b.getAttribute("data-copy-label") || b.textContent;
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy");
      function ok() { b.textContent = "¡Copiado!"; b.classList.add("is-done"); setTimeout(function () { b.textContent = label; b.classList.remove("is-done"); }, 1800); }
      function fallback() {
        var src = b.parentElement.querySelector(".copy-src");
        if (!src) return;
        var r = document.createRange(); r.selectNodeContents(src);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        b.textContent = "Seleccionado"; setTimeout(function () { b.textContent = label; }, 2000);
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
        else fallback();
      } catch (err) { fallback(); }
    });
  });

  /* =====================================================================
     ANIMACIONES DE SCROLL (sin librerías)
     1) "Entradas": cuando un elemento aparece en pantalla recibe la clase .is-in
        y el CSS hace la animación.
     2) "Scrub": algunos dibujos se mueven en proporción al scroll (sobre, avión,
        conejos, coche, vestidos...).
     ===================================================================== */
  var root = document.documentElement;
  root.classList.add("anim");
  var ENTER = "[data-reveal], [data-from], [data-zoom], [data-drop], [data-rise], .script-draw, .shrimp, [data-pill], .mari, .acc__i, .party, .garland, [data-clink], [data-kiss], .dress__legs, [data-crawl], .haci__lilies, .count";
  $$("[data-pill]").forEach(function (p, i) { p.style.setProperty("--i", i); });
  $$(".shrimp, .mari, .acc__i, .garland img, .us__links a").forEach(function (p) { p.style.setProperty("--i", Array.prototype.indexOf.call(p.parentElement.children, p)); });
  function enter(elx) {
    elx.classList.add("is-in");
    if (elx.classList.contains("count")) rollDays();
  }
  // Algunos elementos empiezan recortados o fuera de pantalla (texto manuscrito, pastillas, langosta):
  // para ellos se vigila al contenedor, porque el propio elemento "no se ve" hasta que entra.
  function triggerOf(elx) {
    return (elx.matches(".script-draw, [data-pill], [data-crawl]")) ? elx.parentElement : elx;
  }
  if ("IntersectionObserver" in window) {
    var map = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        (map.get(en.target) || []).forEach(enter);
        map.delete(en.target); io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$(ENTER).forEach(function (elx) {
      var t = triggerOf(elx);
      if (!map.has(t)) { map.set(t, []); io.observe(t); }
      map.get(t).push(elx);
    });
  } else {
    $$(ENTER).forEach(enter);
  }
  // la portada entra sola al cargar
  setTimeout(function () { $$(".hero .script-draw").forEach(enter); }, 200);

  // --- scrub ---
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  var scrubs = [];
  // progreso 0→1 entre "borde superior del elemento a s·vh" y "a e·vh" (useBottom: usa el borde inferior para el final)
  function scrub(elx, s, e, fn, useBottom) {
    if (!elx) return;
    scrubs.push({ el: elx, s: s, e: e, fn: fn, b: useBottom });
  }
  var vw = window.innerWidth, vh = window.innerHeight;
  function run() {
    vh = window.innerHeight; vw = window.innerWidth;
    scrubs.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      if (r.bottom < -vh * .5 || r.top > vh * 1.5) return;
      if (o.custom) { o.fn(o.custom(), r); return; }
      var startY = vh * o.s, endY = vh * o.e;
      var p = o.b ? clamp((startY - r.top) / (startY - endY + r.height)) : clamp((startY - r.top) / (startY - endY));
      o.fn(p, r);
    });
  }
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; run(); }); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // Sobre: el sello late, la solapa se abre y la tarjeta sale
  var env = $("#env"), flap = $(".env__flap"), card = $("#envCard"), seal = $(".env__seal"), hint = $("#heroHint");
  var track = $("#heroTrack");
  function envProgress() {
    var r = track.getBoundingClientRect();
    var dist = Math.max(1, r.height - vh * 1.05);
    return clamp(-r.top / dist);
  }
  scrubs.push({ el: env, s: 0, e: 0, custom: envProgress, fn: function (p) {
    var s1 = seg(p, 0, .18), f = ease(seg(p, .08, .45)), c = ease(seg(p, .42, 1));
    seal.style.transform = "scale(" + (1 + Math.sin(s1 * Math.PI) * .25) + ") rotate(" + (-12 * Math.sin(s1 * Math.PI)) + "deg)";
    flap.style.transform = "rotateX(" + (f * 180) + "deg)";
    flap.style.zIndex = f > .5 ? 1 : 4;
    card.style.transform = "translateY(" + (62 - 62 * c) + "%)";
    hint.style.opacity = String(1 - seg(p, 0, .3));
  } });

  // WITH · LOVE se juntan; el sello gira
  var wl = $(".withlove");
  scrub(wl, 1, .45, function (p) {
    var k = 1 - ease(p);
    $(".withlove__w").style.transform = "translateX(" + (-55 * k) + "%)";
    $(".withlove__l").style.transform = "translateX(" + (55 * k) + "%)";
    $(".withlove__w").style.opacity = $(".withlove__l").style.opacity = String(.15 + .85 * ease(p));
  });
  scrub(wl, 1, 0, function (p) { $("[data-spin]").style.transform = "rotate(" + (p * 360) + "deg)"; }, true);

  // Avión que cruza la cuenta atrás
  var plane = $("#plane"), count = $(".count");
  scrub(count, 1, 0, function (p) {
    var w = count.clientWidth;
    plane.style.transform = "translate(" + (-140 + p * (w + 280)) + "px," + (30 - p * 70) + "px) rotate(" + (-6 + p * 10) + "deg)";
  }, true);

  // Conejos corriendo
  var rab = $(".itin .rabbits");
  scrub($(".itin"), 1, 0, function (p) { rab.style.transform = "translateX(" + (-70 + p * 110) + "vw)"; }, true);
  var rab2 = $(".contact__rabbits");
  scrub($(".contact"), 1, .15, function (p) { rab2.style.transform = "translateX(" + (-30 + p * 125) + "vw)"; }, true);

  // Fila de vestidos en horizontal
  var row = $("#dressRow");
  scrub($(".dresses"), .95, .1, function (p) {
    var max = Math.max(0, row.scrollWidth - row.parentElement.clientWidth);
    row.style.transform = "translateX(" + (-max * p) + "px)";
  }, true);

  // Coche con la vaca y la paloma
  var car = $("#car"), road = $(".road");
  scrub(road, 1, .25, function (p) {
    var cw = car.offsetWidth, rw = road.clientWidth;
    car.style.transform = "translateX(" + (-cw * .9 + p * (rw - cw * .3 + cw * .9)) + "px)";
  }, true);

  // Parallax suave de piezas decorativas
  $$(".guia__corn, .rsvp__bottles, .muertos__mask, .hero__orn, .names__flower, .pix").forEach(function (elx, i) {
    var amp = (i % 2 ? -1 : 1) * 40;
    var base = elx.classList.contains("names__flower") ? "translateX(-50%) " : "";
    scrub(elx.parentElement, 1, 0, function (p) { elx.style.translate = (elx.classList.contains("names__flower") ? "-50% " : "0 ") + ((p - .5) * amp * 2) + "px"; }, true);
  });

  run();
  window.addEventListener("load", run);
})();
