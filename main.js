const WA_NUMBER = "522203199662";
const WA_DEFAULT_MSG = "Hola, quiero agendar una consulta";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

document.querySelectorAll(".js-wa").forEach((link) => {
  const msg = link.dataset.waMsg || WA_DEFAULT_MSG;
  link.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
});

document.querySelectorAll(".js-year").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

// ---------- Scroll suave (sensación de trackpad) ----------
let lenis = null;
const hasGsap = !!(window.gsap && window.ScrollTrigger);

if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
  if (hasGsap) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
});

// ---------- Menú ----------
const trigger = document.querySelector(".menu-trigger");
const icon = trigger.querySelector("i");
const panel = document.querySelector(".menu-panel");

function setMenu(open) {
  panel.classList.toggle("open", open);
  icon.classList.toggle("active", open);
  document.body.classList.toggle("menu-open", open);
  trigger.setAttribute("aria-expanded", String(open));
  trigger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  if (lenis) open ? lenis.stop() : lenis.start();
}

trigger.addEventListener("click", () => setMenu(!panel.classList.contains("open")));
panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// Solo una pregunta frecuente abierta a la vez
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) =>
  item.addEventListener("toggle", () => {
    if (item.open) faqItems.forEach((other) => other !== item && (other.open = false));
    if (hasGsap) ScrollTrigger.refresh();
  }),
);

// ---------- Animaciones ----------
const splitTargets = [
  ".hero-title",
  ".intro-statement",
  ".manifesto-title",
  ".section-heading",
  ".principles-title",
  ".team-heading",
  ".contact-inner > div > div",
];

// Envuelve cada palabra en una máscara para animarla desde abajo
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
          } else {
            const w = document.createElement("span");
            w.className = "w";
            const wi = document.createElement("span");
            wi.className = "wi";
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(el);
  return el.querySelectorAll(".wi");
}

if (hasGsap && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("motion");

  splitTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const words = splitWords(el);
      // el título deja de usar el fade simple: ahora entra palabra por palabra
      el.classList.remove("reveal");
      const isHero = el.classList.contains("hero-title");
      gsap.from(words, {
        yPercent: 115,
        rotate: 4,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.045,
        delay: isHero ? 0.25 : 0,
        scrollTrigger: isHero ? undefined : { trigger: el, start: "top 88%" },
      });
    });
  });

  // Entrada del hero
  gsap.from(".hero-kicker, .hero-bottom", { y: 30, opacity: 0, duration: 1.2, ease: "expo.out", delay: 0.6, stagger: 0.12 });
  gsap.from(".topbar", { y: -30, opacity: 0, duration: 1, ease: "expo.out", delay: 0.2 });

  // El texto del hero se aleja al hacer scroll
  gsap.to(".hero-content", {
    yPercent: -14,
    opacity: 0.15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // Parallax de la imagen
  gsap.fromTo(
    ".manifesto-image img",
    { yPercent: -7, scale: 1.16 },
    { yPercent: 7, scale: 1.16, ease: "none", scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true } },
  );

  // Contadores
  document.querySelectorAll(".manifesto-facts strong").forEach((el) => {
    const match = el.textContent.match(/(\d+)(.*)/);
    if (!match) return;
    const end = Number(match[1]);
    const suffix = match[2];
    const counter = { v: 0 };
    el.textContent = `0${suffix}`;
    gsap.to(counter, {
      v: end,
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => (el.textContent = `${Math.round(counter.v)}${suffix}`),
    });
  });

  // Franja de palabras que se mueve con el scroll
  gsap.fromTo(
    ".principles-track",
    { xPercent: 0 },
    { xPercent: -28, ease: "none", scrollTrigger: { trigger: ".principles", start: "top bottom", end: "bottom top", scrub: true } },
  );

  // "Hablemos" se desliza
  gsap.fromTo(
    ".contact-watermark",
    { xPercent: 6 },
    { xPercent: -14, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom bottom", scrub: true } },
  );

  // Las fotos de los especialistas suben un poco al hacer scroll
  document.querySelectorAll(".person-visual > img").forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: 8 },
      { yPercent: -2, ease: "none", scrollTrigger: { trigger: img.closest(".person"), start: "top bottom", end: "bottom top", scrub: true } },
    );
  });

  // Inclinación 3D de las tarjetas del equipo
  if (finePointer) {
    document.querySelectorAll(".person").forEach((card) => {
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      // la transición CSS de aparición frenaría el movimiento
      card.addEventListener("pointerenter", () => (card.style.transition = "opacity .8s ease"));
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 8);
        rx(-py * 8);
      });
      card.addEventListener("pointerleave", () => {
        rx(0);
        ry(0);
      });
    });

    // Botones magnéticos
    document.querySelectorAll(".pill-link, .wa-float, .circle-link").forEach((btn) => {
      const x = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      const y = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.25);
        y((e.clientY - (r.top + r.height / 2)) * 0.25);
      });
      btn.addEventListener("pointerleave", () => {
        x(0);
        y(0);
      });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

// Aparición suave del resto de elementos
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    }),
  { threshold: 0.15 },
);
document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
