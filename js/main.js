(function () {
  "use strict";
  var cfg = window.BODA || {};
  var guia = window.GUIA || {};
  // Las animaciones se muestran siempre, también con "Reducir movimiento" activado en el móvil.
  var reduce = false;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Menú (flor) ---------- */
  var btn = $("#menuBtn");
  var menu = $("#menu");
  function setMenu(open) {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.documentElement.classList.toggle("menu-open", open);
  }
  btn.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- Cuenta atrás ---------- */
  var target = new Date(cfg.fechaBoda || "2027-11-06T12:30:00-06:00").getTime();
  var elD = $("#cdDays"), elH = $("#cdH"), elM = $("#cdM"), elS = $("#cdS");
  // Dígitos dibujados en una retícula de 5x5 módulos, como el "365" del Canva (HK Modular)
  var DIGITS = {"0": "M0 1A1 1 0 0 1 1 0L4 0A1 1 0 0 1 5 1L5 4A1 1 0 0 1 4 5L1 5A1 1 0 0 1 0 4ZM1 1L1 4L4 4L4 1Z", "1": "M1 0L2 0A1 1 0 0 1 3 1L3 4L4 4L4 5L1 5L1 4L2 4L2 1L1 1Z", "2": "M0 0L4 0A1 1 0 0 1 5 1L5 2A1 1 0 0 1 4 3L1 3L1 4L5 4L5 5L0 5L0 3A1 1 0 0 1 1 2L4 2L4 1L0 1Z", "3": "M0 0L4 0A1 1 0 0 1 5 1L5 2A0.5 0.5 0 0 1 4.5 2.5L4.5 2.5L4.5 2.5A0.5 0.5 0 0 1 5 3L5 4A1 1 0 0 1 4 5L0 5L0 4L4 4L4 3L0 3L0 2L4 2L4 1L0 1Z", "4": "M0 0L1 0L1 2L4 2L4 0L5 0L5 5L4 5L4 3L1 3A1 1 0 0 1 0 2Z", "5": "M0 0L5 0L5 1L1 1L1 2L4 2A1 1 0 0 1 5 3L5 4A1 1 0 0 1 4 5L0 5L0 4L4 4L4 3L0 3Z", "6": "M0 1A1 1 0 0 1 1 0L5 0L5 1L1 1L1 2L4 2A1 1 0 0 1 5 3L5 4A1 1 0 0 1 4 5L1 5A1 1 0 0 1 0 4ZM1 3L1 4L4 4L4 3Z", "7": "M0 0L4 0A1 1 0 0 1 5 1L5 5L4 5L4 1L0 1Z", "8": "M0 1A1 1 0 0 1 1 0L4 0A1 1 0 0 1 5 1L5 2A0.5 0.5 0 0 1 4.5 2.5L4.5 2.5L4.5 2.5A0.5 0.5 0 0 1 5 3L5 4A1 1 0 0 1 4 5L1 5A1 1 0 0 1 0 4L0 3A0.5 0.5 0 0 1 0.5 2.5L0.5 2.5L0.5 2.5A0.5 0.5 0 0 1 0 2ZM1 1L1 2L4 2L4 1ZM1 3L1 4L4 4L4 3Z", "9": "M5 4A1 1 0 0 1 4 5L0 5L0 4L4 4L4 3L1 3A1 1 0 0 1 0 2L0 1A1 1 0 0 1 1 0L4 0A1 1 0 0 1 5 1ZM4 2L4 1L1 1L1 2Z"};
  var shownDays = null;
  function drawDays(n) {
    var str = String(n);
    if (str === shownDays) return;
    var prev = shownDays || "";
    elD.innerHTML = str.split("").map(function (ch, i) {
      var changed = prev.length === str.length && prev[i] !== ch;
      return '<svg viewBox="0 0 5 5" aria-hidden="true"' + (changed ? ' class="tick"' : "") + '><path d="' + DIGITS[ch] + '"/></svg>';
    }).join("");
    elD.setAttribute("aria-label", n + (n === 1 ? " día" : " días"));
    shownDays = str;
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var s = Math.floor(Math.max(0, target - Date.now()) / 1000);
    drawDays(Math.floor(s / 86400));
    elH.textContent = pad(Math.floor((s % 86400) / 3600));
    elM.textContent = pad(Math.floor((s % 3600) / 60));
    elS.textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Avión siguiendo la línea discontinua + flor que gira ---------- */
  var path = $("#flightPath"), plane = $("#plane"), flight = $(".merida__flight");
  var svg = path && path.ownerSVGElement;
  var pathLen = path ? path.getTotalLength() : 0;
  function flyTo(p) {
    var a = path.getPointAtLength(pathLen * p);
    var b = path.getPointAtLength(Math.min(pathLen, pathLen * p + 4));
    var w = flight.clientWidth, h = flight.clientHeight;
    var sx = w / 1000, sy = h / 420;
    var ang = Math.atan2((b.y - a.y) * sy, (b.x - a.x) * sx) * 180 / Math.PI;
    plane.style.transform = "translate(" + (a.x * sx).toFixed(1) + "px," + (a.y * sy).toFixed(1) + "px) rotate(" + Math.max(-18, Math.min(18, ang * 0.4)).toFixed(1) + "deg)";
    svg.style.clipPath = "inset(0 " + (100 - p * 100).toFixed(1) + "% 0 0)";
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (path) {
        var box = flight.getBoundingClientRect(), vh = window.innerHeight;
        if (box.bottom > -200 && box.top < vh + 200) {
          var p = (vh - box.top) / (vh + box.height * 0.6);
          flyTo(Math.min(0.97, Math.max(0.1, p)));
        }
      }
      btn.style.setProperty("--spin", ((window.scrollY * 0.15) % 360).toFixed(1) + "deg");
    });
  }
  if (path) {
    if (reduce) flyTo(0.6);
    else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    }
  }

  /* ---------- "Pop" al aparecer las ilustraciones ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-pop"); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    $$(".js-pop").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Confeti y corazones ---------- */
  var layer = $("#confetti");
  var colors = ["#e36f1c", "#eba79b", "#f6b90c", "#62211d", "#cfe2e6", "#9b9638", "#3d6fa8"];
  function confetti(n) {
    if (reduce) return;
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
    if (reduce) return;
    for (var i = 0; i < 14; i++) {
      var h = document.createElement("i");
      h.className = "heart";
      h.textContent = "♥";
      h.style.left = x + "px";
      h.style.setProperty("--y", y + "px");
      h.style.setProperty("--c", colors[i % 4]);
      h.style.setProperty("--s", 14 + Math.random() * 18 + "px");
      h.style.setProperty("--d", 0.9 + Math.random() * 0.6 + "s");
      var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 90;
      h.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      h.style.setProperty("--dy", Math.sin(ang) * dist - 40 + "px");
      layer.appendChild(h);
      setTimeout(function (el) { el.remove(); }.bind(null, h), 1800);
    }
  }
  $("#stars").addEventListener("click", function (e) {
    var r = this.getBoundingClientRect();
    hearts(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
  });

  /* ---------- Calendario Día de Muertos ---------- */
  var muertos = $("#muertos");
  var PLANS = {
    muertos: { start: "2027-10-29", end: "2027-11-09", note: "Del viernes 29 de octubre al martes 9 de noviembre, volviendo al trabajo el miércoles 10." },
    boda: { start: "2027-11-03", end: "2027-11-09", note: "Del miércoles 3 al martes 9 de noviembre, volviendo al trabajo el miércoles 10." }
  };
  var state = { plan: "muertos", work: "madrid" };
  function parseD(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function renderCal() {
    var plan = PLANS[state.plan];
    var a = parseD(plan.start), b = parseD(plan.end);
    var holidays = ["2027-11-01"];
    if (state.work === "madrid") holidays.push("2027-11-09");
    var trip = 0, vac = 0;
    $$(".cal__grid li").forEach(function (li) {
      var d = parseD(li.dataset.d);
      var inR = d >= a && d <= b;
      li.classList.toggle("in", inR);
      li.classList.toggle("start", +d === +a);
      li.classList.toggle("end", +d === +b);
      if (inR) {
        trip++;
        var wd = d.getDay();
        if (wd !== 0 && wd !== 6 && holidays.indexOf(li.dataset.d) === -1) vac++;
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
    t.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Guía: listas desde js/guia.js ---------- */
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  $$("[data-list]").forEach(function (box) {
    var items = guia[box.dataset.list] || [];
    if (!items.length) {
      var soon = el("p", "soon");
      soon.appendChild(el("span", "soon__stamp mono", "Muy pronto"));
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
      if (it.zona) li.appendChild(el("p", "spot__zone mono", it.zona));
      if (it.nota) li.appendChild(el("p", "spot__note", it.nota));
      if (it.descuento) li.appendChild(el("p", "spot__deal mono", it.descuento));
      ul.appendChild(li);
    });
    box.appendChild(ul);
  });

  /* ---------- Formulario de asistencia ---------- */
  var form = $("#rsvpForm");
  var attending = $(".js-attending", form);
  var errorEl = $("#formError"), submitBtn = $("#submitBtn"), thanks = $("#thanks"), thanksMsg = $("#thanksMsg");
  var guests = $("#f-guests");

  form.addEventListener("change", function (e) {
    if (e.target.name === "asistencia") attending.hidden = e.target.value === "no";
  });
  $$(".stepper__btn", form).forEach(function (b) {
    b.addEventListener("click", function () {
      var v = Math.min(10, Math.max(1, (parseInt(guests.value, 10) || 1) + Number(b.dataset.step)));
      guests.value = v;
    });
  });

  function showError(msg, field) {
    errorEl.textContent = msg; errorEl.hidden = false;
    if (field) field.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    var name = form.elements.nombre, email = form.elements.email;
    var choice = form.querySelector('input[name="asistencia"]:checked');
    if (!name.value.trim()) return showError("Escribe tu nombre para saber quién eres.", name);
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) return showError("Revisa el email: parece que falta algo.", email);
    if (!choice) return showError("Dinos si podrás venir.", $("#f-yes"));

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.enviado = new Date().toISOString();

    function done() {
      Array.prototype.forEach.call(form.children, function (c) { if (c !== thanks) c.hidden = true; });
      thanks.hidden = false;
      thanksMsg.textContent = choice.value === "si"
        ? "¡Qué ilusión! Nos vemos en Mérida, " + name.value.trim().split(" ")[0] + "."
        : "Te echaremos de menos. Gracias por avisarnos.";
      form.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      if (choice.value === "si") confetti(120);
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

  /* ---------- Botones de copiar (IBAN, emails...) ---------- */
  $$("[data-copy]").forEach(function (b) {
    var label = b.getAttribute("data-copy-label") || b.textContent;
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy");
      function ok() {
        b.textContent = "¡Copiado!"; b.classList.add("is-done");
        setTimeout(function () { b.textContent = label; b.classList.remove("is-done"); }, 1800);
      }
      function fallback() {
        var src = b.parentElement.querySelector(".copy-src");
        if (!src) return;
        var r = document.createRange(); r.selectNodeContents(src);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        b.textContent = "Seleccionado";
        setTimeout(function () { b.textContent = label; }, 2000);
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
        else fallback();
      } catch (err) { fallback(); }
    });
  });
})();
