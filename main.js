(function () {
  "use strict";
  var cfg = window.BODA || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menú (flor) ---------- */
  var btn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = open ? "hidden" : "";
  }
  btn.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- Cuenta atrás ---------- */
  var target = new Date(cfg.fechaBoda || "2027-11-06T12:30:00-06:00").getTime();
  var elD = document.getElementById("cdDays"), elH = document.getElementById("cdH"),
      elM = document.getElementById("cdM"), elS = document.getElementById("cdS");
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var s = Math.floor(diff / 1000);
    elD.textContent = Math.floor(s / 86400);
    elH.textContent = pad(Math.floor((s % 86400) / 3600));
    elM.textContent = pad(Math.floor((s % 3600) / 60));
    elS.textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Avión siguiendo la línea discontinua ---------- */
  var path = document.getElementById("flightPath");
  var plane = document.getElementById("plane");
  var flight = document.querySelector(".merida__flight");
  var svg = path && path.ownerSVGElement;
  function flyTo(p) {
    var len = path.getTotalLength();
    var a = path.getPointAtLength(len * p);
    var b = path.getPointAtLength(Math.min(len, len * p + 4));
    var box = flight.getBoundingClientRect();
    var sx = box.width / 1000, sy = box.height / 420;
    var ang = Math.atan2((b.y - a.y) * sy, (b.x - a.x) * sx) * 180 / Math.PI;
    plane.style.transform = "translate(" + a.x * sx + "px," + a.y * sy + "px) rotate(" + Math.max(-18, Math.min(18, ang * 0.4)) + "deg)";
    // dibuja la estela solo hasta el avión
    path.style.strokeDasharray = "10 10";
    svg.style.clipPath = "inset(0 " + (100 - p * 100) + "% 0 0)";
  }
  function onScroll() {
    if (!path) return;
    var box = flight.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh - box.top) / (vh + box.height * 0.6);
    flyTo(Math.min(0.98, Math.max(0.1, p)));
    // la flor del menú gira con el scroll
    btn.style.setProperty("--spin", (window.scrollY * 0.15) % 360 + "deg");
  }
  if (path) {
    if (reduce) { flyTo(0.62); }
    else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    }
  }

  /* ---------- Pequeño "pop" al aparecer las ilustraciones ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-pop"); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll(".js-pop").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Confeti y corazones ---------- */
  var layer = document.getElementById("confetti");
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
  document.getElementById("stars").addEventListener("click", function (e) {
    var r = this.getBoundingClientRect();
    hearts(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
  });

  /* ---------- Formulario de asistencia ---------- */
  var form = document.getElementById("rsvpForm");
  var attending = form.querySelector(".js-attending");
  var errorEl = document.getElementById("formError");
  var submitBtn = document.getElementById("submitBtn");
  var thanks = document.getElementById("thanks");
  var thanksMsg = document.getElementById("thanksMsg");

  form.addEventListener("change", function (e) {
    if (e.target.name === "asistencia") attending.hidden = e.target.value === "no";
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
    if (!choice) return showError("Dinos si podrás venir.", document.getElementById("f-yes"));

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.enviado = new Date().toISOString();

    function done() {
      Array.prototype.forEach.call(form.children, function (el) { if (el !== thanks) el.hidden = true; });
      thanks.hidden = false;
      thanksMsg.textContent = choice.value === "si"
        ? "¡Qué ilusión! Nos vemos en Mérida, " + name.value.trim().split(" ")[0] + "."
        : "Te echaremos de menos. Gracias por avisarnos.";
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

  /* "Envíanos una nota" lleva al campo de mensaje */
  document.querySelector(".note-link").addEventListener("click", function (e) {
    e.preventDefault();
    var msg = document.getElementById("f-msg");
    if (msg.hidden || msg.closest("[hidden]")) { document.getElementById("rsvp").scrollIntoView({ behavior: "smooth" }); return; }
    msg.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () { msg.focus({ preventScroll: true }); }, 500);
  });
  /* ---------- Botones de copiar (IBAN, emails) ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy");
      var label = b.getAttribute("data-copy-label") || b.textContent;
      function ok() {
        b.textContent = "¡Copiado!"; b.classList.add("is-done");
        setTimeout(function () { b.textContent = label; b.classList.remove("is-done"); }, 1800);
      }
      function fallback() {
        var el = b.parentElement.querySelector(".iban__num, .person__email");
        if (!el) return;
        var r = document.createRange(); r.selectNodeContents(el);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        b.textContent = "Seleccionado: pulsa copiar";
        setTimeout(function () { b.textContent = label; }, 2400);
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
        else fallback();
      } catch (e) { fallback(); }
    });
  });
})();
