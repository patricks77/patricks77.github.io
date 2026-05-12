import { useMemo, useState } from "react";

export default function ProjectConstellation({ disciplines }) {
  const [activeId, setActiveId] = useState(disciplines[0]?.id ?? "");
  const active = useMemo(
    () => disciplines.find((item) => item.id === activeId) ?? disciplines[0],
    [activeId, disciplines]
  );

  return (
    <section className="constellation" aria-labelledby="constellation-title">
      <div className="section-heading compact">
        <p className="eyebrow">Cartographie douce</p>
        <h2 id="constellation-title">Un même cerveau, plusieurs formes.</h2>
        <p>
          Le studio fonctionne comme un système vivant: une idée peut devenir application, livre,
          chanson, image ou note de laboratoire.
        </p>
      </div>

      <div className="constellation-shell">
        <div className="constellation-tabs" role="tablist" aria-label="Disciplines du studio">
          {disciplines.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active?.id === item.id}
              className={active?.id === item.id ? "active" : ""}
              onClick={() => setActiveId(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.signal}</small>
            </button>
          ))}
        </div>

        <article className="constellation-panel">
          <p className="panel-signature">{active.signature}</p>
          <h3>{active.label}</h3>
          <p>{active.summary}</p>
          <ul>
            {active.details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
          <a className="text-link" href={active.href}>Explorer {active.label.toLowerCase()}</a>
        </article>
      </div>
    </section>
  );
}
