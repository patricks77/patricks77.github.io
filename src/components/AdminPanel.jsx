import { useEffect, useState } from "react";

const OWNER = "patricks77";
const REPO = "patricks77.github.io";
const PATH = "src/content/journal";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 60);
}

function parseFrontmatter(text) {
  const lines = text.split("\n");
  const meta = {};
  lines.forEach((line) => {
    const match = line.match(/^(\w+):\s*"(.*)"$/);
    if (match) meta[match[1]] = match[2];
  });
  return meta;
}

export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem("gh_token") || "");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [date, setDate] = useState("");
  const [tag, setTag] = useState("Studio");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  useEffect(() => {
    if (token) loadEntries();
  }, [token]);

  async function loadEntries() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
        { headers }
      );
      if (res.status === 401) throw new Error("Token invalide.");
      if (res.status === 404) {
        setEntries([]);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const files = await res.json();
      const items = await Promise.all(
        files.map(async (file) => {
          const r = await fetch(file.url, { headers });
          const d = await r.json();
          const raw = atob(d.content.replace(/\n/g, ""));
          const meta = parseFrontmatter(raw);
          const bodyText = raw.replace(/---\n[\s\S]*?\n---\n?/, "").trim();
          return { ...meta, body: bodyText, sha: d.sha, name: file.name };
        })
      );
      setEntries(items.sort((a, b) => b.name.localeCompare(a.name)));
    } catch (e) {
      setMessage(e.message);
    }
    setLoading(false);
  }

  async function publish(e) {
    e.preventDefault();
    if (!date || !title) return;
    const filename = `${slugify(date + " " + title)}.md`;
    const content = `---\ndate: "${date}"\ntag: "${tag}"\ntitle: "${title}"\n---\n\n${body.trim()}\n`;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}/${filename}`,
        {
          method: "PUT",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `journal: ${title}`,
            content: btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1))),
          }),
        }
      );
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setMessage("✓ Publié. Le site se rebuild automatiquement (1–2 min).");
      setDate("");
      setTitle("");
      setBody("");
      loadEntries();
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  }

  async function remove(sha, name) {
    if (!confirm(`Supprimer ${name} ?`)) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}/${name}`,
        {
          method: "DELETE",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `journal: suppression ${name}`,
            sha,
          }),
        }
      );
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      loadEntries();
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 20 }}>
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 400, fontSize: "2rem" }}>
          Accès admin
        </h2>
        <p style={{ color: "var(--text-soft)", marginTop: 8 }}>
          Entre ton Personal Access Token GitHub. Il reste dans ton navigateur,
          jamais dans le code.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxx"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginTop: 16,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--text)",
            fontFamily: "var(--mono)",
            fontSize: "0.9rem",
          }}
        />
        <button
          onClick={() => {
            localStorage.setItem("gh_token", token);
            window.location.reload();
          }}
          className="button primary"
          style={{ marginTop: 16, width: "100%" }}
        >
          Connexion
        </button>
        <p style={{ marginTop: 20, fontSize: "0.8rem", color: "var(--muted)" }}>
          Pour créer un token : GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → générer avec le scope <strong>repo</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 400, fontSize: "2.2rem" }}>
          Journal — Admin
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem("gh_token");
            window.location.reload();
          }}
          className="button quiet"
        >
          Déconnexion
        </button>
      </div>

      {message && (
        <p
          style={{
            color: "var(--gold)",
            marginBottom: 20,
            padding: "12px 16px",
            background: "rgba(245, 182, 101, 0.08)",
            borderRadius: 8,
            border: "1px solid rgba(245, 182, 101, 0.2)",
          }}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={publish}
        style={{
          display: "grid",
          gap: 14,
          marginBottom: 48,
          padding: "28px",
          background: "var(--surface)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3 style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 400 }}>
          Nouvelle entrée
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Date (ex: 2026 · 05 · 12)"
            required
            style={{
              padding: "12px 14px",
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              color: "var(--text)",
              fontFamily: "inherit",
            }}
          />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{
              padding: "12px 14px",
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              color: "var(--text)",
              fontFamily: "inherit",
            }}
          >
            <option>Studio</option>
            <option>Applications</option>
            <option>Design</option>
            <option>Musique</option>
            <option>Écrits</option>
            <option>Récit</option>
          </select>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          required
          style={{
            padding: "12px 14px",
            background: "var(--bg-soft)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Contenu de l'entrée..."
          rows={6}
          style={{
            padding: "12px 14px",
            background: "var(--bg-soft)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--text)",
            fontFamily: "inherit",
            lineHeight: 1.6,
            resize: "vertical",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="button primary"
          style={{ justifySelf: "start" }}
        >
          {loading ? "Publication..." : "Publier l'entrée"}
        </button>
      </form>

      <h3 style={{ fontFamily: "var(--display)", fontWeight: 400, marginBottom: 16 }}>
        Entrées existantes
      </h3>

      {loading && entries.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Chargement...</p>
      ) : entries.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Aucune entrée pour l'instant.</p>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {entries.map((entry) => (
            <div
              key={entry.name}
              style={{
                padding: "20px 24px",
                background: "var(--surface)",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  gap: 12,
                }}
              >
                <div>
                  <strong style={{ fontFamily: "var(--display)", fontSize: "1.3rem", fontWeight: 400 }}>
                    {entry.title}
                  </strong>
                  <p style={{ margin: "6px 0 0", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "0.75rem" }}>
                    {entry.date} · {entry.tag}
                  </p>
                </div>
                <button
                  onClick={() => remove(entry.sha, entry.name)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: "var(--copper)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  Supprimer
                </button>
              </div>
              {entry.body && (
                <p style={{ margin: "12px 0 0", color: "var(--text-soft)", lineHeight: 1.6 }}>
                  {entry.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
