/* ════════════════════════════════════════════════════════════════
   Tweaks panel — vanilla, dark-themed
   Implements the host edit-mode protocol.
   ════════════════════════════════════════════════════════════════ */
(() => {
    const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
        "accent": "copper",
        "typo": "editorial",
        "density": "regular"
    }/*EDITMODE-END*/;

    const STATE = { ...TWEAK_DEFAULTS };

    /* ── Accent palettes (oklch) ──────────────────────────────── */
    const ACCENTS = {
        copper:  { c: "oklch(0.78 0.14 55)",  c2: "oklch(0.88 0.10 70)",  ink: "oklch(0.18 0.05 55)"  },
        sage:    { c: "oklch(0.78 0.10 155)", c2: "oklch(0.88 0.08 150)", ink: "oklch(0.18 0.04 155)" },
        violet:  { c: "oklch(0.74 0.14 295)", c2: "oklch(0.85 0.10 290)", ink: "oklch(0.18 0.05 295)" },
        ice:     { c: "oklch(0.82 0.10 220)", c2: "oklch(0.90 0.06 215)", ink: "oklch(0.18 0.04 220)" }
    };
    const ACCENT_LABELS = { copper: "Cuivre", sage: "Sauge", violet: "Violet", ice: "Givre" };

    function applyAccent(key) {
        const a = ACCENTS[key] || ACCENTS.copper;
        const root = document.documentElement;
        root.style.setProperty("--accent",     a.c);
        root.style.setProperty("--accent-2",   a.c2);
        root.style.setProperty("--accent-ink", a.ink);
    }
    function applyTypo(key)    { document.body.dataset.typo = key; }
    function applyDensity(key) { document.body.dataset.density = key; }

    function applyAll() {
        applyAccent(STATE.accent);
        applyTypo(STATE.typo);
        applyDensity(STATE.density);
        renderActive();
    }

    /* ── Persistence ──────────────────────────────────────────── */
    function persist(edits) {
        try {
            window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
        } catch (e) { /* noop */ }
    }

    /* ── Build the panel ──────────────────────────────────────── */
    let panel;
    function buildPanel() {
        if (panel) return panel;
        panel = document.createElement("aside");
        panel.id = "tweaks-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "Tweaks");
        panel.innerHTML = `
            <header class="tw-head">
                <span class="tw-title">Tweaks</span>
                <button class="tw-close" type="button" aria-label="Fermer">×</button>
            </header>
            <section class="tw-section" data-section="accent">
                <span class="tw-label">Couleur signal</span>
                <div class="tw-swatches">
                    ${Object.keys(ACCENTS).map(k => `
                        <button type="button" data-accent="${k}" title="${ACCENT_LABELS[k]}">
                            <span class="sw" style="background:${ACCENTS[k].c}"></span>
                            <span class="lbl">${ACCENT_LABELS[k]}</span>
                        </button>
                    `).join("")}
                </div>
            </section>
            <section class="tw-section" data-section="typo">
                <span class="tw-label">Typographie</span>
                <div class="tw-segmented" data-group="typo">
                    <button type="button" data-typo="editorial">Éditorial</button>
                    <button type="button" data-typo="technical">Neutre</button>
                    <button type="button" data-typo="grotesque">Mono</button>
                </div>
                <p class="tw-hint">Éditorial = serif italique · Neutre = sans · Mono = display monospace.</p>
            </section>
            <section class="tw-section" data-section="density">
                <span class="tw-label">Densité</span>
                <div class="tw-segmented" data-group="density">
                    <button type="button" data-density="compact">Compact</button>
                    <button type="button" data-density="regular">Régulier</button>
                    <button type="button" data-density="spacious">Aéré</button>
                </div>
            </section>
            <footer class="tw-foot">
                <span class="tw-mono">DeePat Studio · Tweaks v1</span>
            </footer>
        `;
        document.body.appendChild(panel);

        // Wire interactions
        panel.querySelectorAll("[data-accent]").forEach(b => {
            b.addEventListener("click", () => {
                STATE.accent = b.dataset.accent;
                applyAccent(STATE.accent);
                renderActive();
                persist({ accent: STATE.accent });
            });
        });
        panel.querySelectorAll("[data-typo]").forEach(b => {
            b.addEventListener("click", () => {
                STATE.typo = b.dataset.typo;
                applyTypo(STATE.typo);
                renderActive();
                persist({ typo: STATE.typo });
            });
        });
        panel.querySelectorAll("[data-density]").forEach(b => {
            b.addEventListener("click", () => {
                STATE.density = b.dataset.density;
                applyDensity(STATE.density);
                renderActive();
                persist({ density: STATE.density });
            });
        });
        panel.querySelector(".tw-close").addEventListener("click", () => {
            hidePanel();
            try { window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*"); } catch(e){}
        });

        return panel;
    }

    function renderActive() {
        if (!panel) return;
        panel.querySelectorAll("[data-accent]").forEach(b =>
            b.classList.toggle("active", b.dataset.accent === STATE.accent));
        panel.querySelectorAll("[data-typo]").forEach(b =>
            b.classList.toggle("active", b.dataset.typo === STATE.typo));
        panel.querySelectorAll("[data-density]").forEach(b =>
            b.classList.toggle("active", b.dataset.density === STATE.density));
    }

    function showPanel() { buildPanel(); panel.classList.add("open"); renderActive(); }
    function hidePanel() { if (panel) panel.classList.remove("open"); }

    /* ── Inject panel styles ──────────────────────────────────── */
    const css = `
    #tweaks-panel {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 9999;
        width: 320px;
        max-width: calc(100vw - 40px);
        background: oklch(0.18 0.012 70 / 0.96);
        backdrop-filter: blur(20px) saturate(140%);
        border: 1px solid oklch(1 0 0 / 0.10);
        border-radius: 12px;
        color: oklch(0.96 0.012 80);
        font-family: "Geist", system-ui, sans-serif;
        box-shadow: 0 30px 80px oklch(0 0 0 / 0.5);
        opacity: 0;
        transform: translateY(12px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.22s ease, transform 0.22s ease;
    }
    #tweaks-panel.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    #tweaks-panel .tw-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid oklch(1 0 0 / 0.08);
    }
    #tweaks-panel .tw-title {
        font-family: "Instrument Serif", serif;
        font-size: 1.2rem;
        font-style: italic;
    }
    #tweaks-panel .tw-close {
        width: 26px; height: 26px;
        background: transparent; border: 1px solid oklch(1 0 0 / 0.10);
        border-radius: 6px; color: inherit; cursor: pointer;
        font-size: 1rem; line-height: 1;
        transition: background 0.18s ease, color 0.18s ease;
    }
    #tweaks-panel .tw-close:hover { background: oklch(1 0 0 / 0.06); }
    #tweaks-panel .tw-section {
        padding: 14px 16px;
        border-bottom: 1px solid oklch(1 0 0 / 0.06);
        display: flex; flex-direction: column; gap: 10px;
    }
    #tweaks-panel .tw-label {
        font-family: "JetBrains Mono", monospace;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: oklch(0.62 0.012 75);
    }
    #tweaks-panel .tw-swatches {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
    }
    #tweaks-panel .tw-swatches button {
        background: transparent; border: 1px solid oklch(1 0 0 / 0.08);
        border-radius: 8px; padding: 8px 4px; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        color: oklch(0.82 0.012 80); font-family: inherit; font-size: 0.74rem;
        transition: border-color 0.18s ease, background 0.18s ease;
    }
    #tweaks-panel .tw-swatches button:hover { background: oklch(1 0 0 / 0.04); }
    #tweaks-panel .tw-swatches button.active {
        border-color: var(--accent);
        background: oklch(from var(--accent) l c h / 0.10);
        color: oklch(0.96 0.012 80);
    }
    #tweaks-panel .tw-swatches .sw {
        width: 22px; height: 22px; border-radius: 50%;
        box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.18);
    }
    #tweaks-panel .tw-segmented {
        display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
        background: oklch(1 0 0 / 0.04);
        border: 1px solid oklch(1 0 0 / 0.08);
        border-radius: 8px;
        padding: 3px;
        gap: 2px;
    }
    #tweaks-panel .tw-segmented button {
        background: transparent; border: 0; cursor: pointer;
        padding: 7px 6px; border-radius: 6px;
        color: oklch(0.74 0.012 80);
        font-family: inherit; font-size: 0.82rem;
        transition: background 0.18s ease, color 0.18s ease;
    }
    #tweaks-panel .tw-segmented button:hover { color: oklch(0.96 0.012 80); }
    #tweaks-panel .tw-segmented button.active {
        background: var(--accent);
        color: var(--accent-ink);
    }
    #tweaks-panel .tw-hint {
        font-size: 0.74rem;
        color: oklch(0.55 0.012 75);
        margin: 0;
    }
    #tweaks-panel .tw-foot {
        padding: 10px 16px;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.66rem;
        color: oklch(0.46 0.012 75);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    /* ── Apply defaults immediately, before announcing ────────── */
    applyAll();

    /* ── Host protocol ─────────────────────────────────────────
       Order: register listener FIRST, then announce availability. */
    window.addEventListener("message", (ev) => {
        const t = ev.data && ev.data.type;
        if (t === "__activate_edit_mode")   showPanel();
        if (t === "__deactivate_edit_mode") hidePanel();
    });
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch(e){}
})();
