/* ─── Nav: hamburger + scrolled state ─────────────────── */
const hamburger = document.querySelector(".hamburger");
const navLinks  = document.querySelector(".nav-links");
const nav       = document.querySelector(".nav");

if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
        const open = navLinks.classList.toggle("active");
        hamburger.classList.toggle("active", open);
        hamburger.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
            navLinks.classList.remove("active");
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
        });
    });
}

window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 24);
}, { passive: true });

/* ─── Smooth-scroll anchor links ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 56, behavior: "smooth" });
    });
});

/* ─── Reveal-on-scroll ────────────────────────────────── */
const revealItems = document.querySelectorAll(
    ".sec-head, .index-row, .storilys-text, .storilys-mock, .design-card, .journal-entry, .about-side, .about-text, .contact-inner, .hero-card"
);
revealItems.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });
revealItems.forEach((el) => io.observe(el));

/* ─── Live clock + date in nav / hero foot ─────────────── */
function pad(n) { return String(n).padStart(2, "0"); }
function tick() {
    const now = new Date();
    const t = `${pad(now.getHours())}:${pad(now.getMinutes())} EST`;
    const c = document.getElementById("clock");
    if (c) c.textContent = t;

    const months = ["JAN","FÉV","MAR","AVR","MAI","JUN","JUL","AOÛ","SEP","OCT","NOV","DÉC"];
    const d = `${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const f = document.getElementById("hero-foot-date");
    if (f) f.textContent = d;
}
tick();
setInterval(tick, 30000);
