// Projects, CV, and the home intro

const PROJECT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'protein', label: 'Protein' },
  { id: 'materials', label: 'Materials' },
  { id: 'polymer', label: 'Polymer' },
  { id: 'composite', label: 'Composite' },
  { id: 'software', label: 'Software' },
];

function ProjectsPane({ onViewModel, onViewStructure, initialProjectId = null, onInitialProjectApplied }) {
  const ps = window.PROFILE.projects;
  const [filter, setFilter] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState(initialProjectId || ps[0]?.id || null);

  const filtered = filter === 'all' ? ps : ps.filter(p => p.category === filter);
  const selected = filtered.find(p => p.id === selectedId) || filtered[0] || null;

  React.useEffect(() => {
    if (!initialProjectId) return;
    if (ps.some(p => p.id === initialProjectId)) {
      setFilter('all');
      setSelectedId(initialProjectId);
    }
    onInitialProjectApplied?.();
  }, [initialProjectId]);

  React.useEffect(() => {
    if (filtered.length && !filtered.some(p => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filter, filtered, selectedId]);

  return (
    <section className="pane projects-pane">
      <div className="pane-head">
        <h2>Projects</h2>
        <span className="pane-sub">Research and engineering · {ps.length} entries</span>
      </div>

      <div className="proj-filters">
        {PROJECT_FILTERS.map(f => (
          <button
            key={f.id}
            className={`proj-filter ${filter === f.id ? 'on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="proj-split">
        <ul className="proj-list">
          {filtered.map((p, i) => (
            <li
              key={p.id}
              className={`proj-row ${selected?.id === p.id ? 'on' : ''}`}
              onClick={() => setSelectedId(p.id)}
            >
              <div className="proj-row-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="proj-row-body">
                <div className="proj-row-title">
                  {p.title}
                  {p.featured && <span className="proj-row-star" title="Featured">★</span>}
                </div>
                {p.hook && <div className="proj-row-hook">{p.hook}</div>}
                <div className="proj-row-meta">
                  <span className="proj-year">{p.year}</span>
                  {p.status && (
                    <span className={`proj-status status-${p.status}`}>
                      {p.status === 'ongoing' ? 'ongoing' : 'completed'}
                    </span>
                  )}
                </div>
              </div>
              <div className="proj-row-arrow">›</div>
            </li>
          ))}
        </ul>

        <div className="proj-detail-col">
          {selected
            ? <ProjectDetail project={selected} onViewModel={onViewModel} onViewStructure={onViewStructure} />
            : <div className="proj-empty">Select a project from the list.</div>}
        </div>
      </div>
    </section>
  );
}

function ProjectDetail({ project: p, onViewModel, onViewStructure }) {
  const models = window.PROFILE.models || [];
  const related = (p.relatedModels || [])
    .map(id => models.find(m => m.id === id))
    .filter(Boolean);

  return (
    <div className="proj-detail">
      <div className="proj-detail-head">
        <div className="proj-detail-kicker">{p.kicker}</div>
        <h3 className="proj-detail-title">{p.title}</h3>
        {p.affiliation && <div className="proj-detail-affil">{p.affiliation}</div>}
      </div>

      <p className="proj-detail-summary">{p.summary}</p>

      {p.highlights?.length > 0 && (
        <div className="proj-block">
          <div className="proj-block-label">Highlights</div>
          <ul className="proj-highlights">
            {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}

      {p.metrics?.length > 0 && (
        <div className="proj-metrics">
          {p.metrics.map(m => (
            <div key={m.label} className="proj-metric">
              <div className="proj-metric-val">{m.value}</div>
              <div className="proj-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {p.tags?.length > 0 && (
        <div className="proj-tags">
          {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      {p.presentation && (
        <div className="proj-block">
          <div className="proj-block-label">Presentation</div>
          <div className="proj-pres-card">
            <div className="proj-pres-title">{p.presentation.title}</div>
            <div className="proj-pres-meta">
              {p.presentation.venue}
              {p.presentation.where && <> · {p.presentation.where}</>}
            </div>
          </div>
        </div>
      )}

      {(related.length > 0 || p.relatedPdb || p.repo) && (
        <div className="proj-actions">
          {related.map(m => (
            <button
              key={m.id}
              className="proj-action"
              onClick={() => onViewModel?.(m.id)}
            >
              View {m.name} →
            </button>
          ))}
          {p.relatedPdb && onViewStructure && (
            <button
              className="proj-action"
              onClick={() => onViewStructure(p.relatedPdb)}
            >
              View {p.relatedPdb} in 3D viewer →
            </button>
          )}
          {p.repo && (
            <a
              className="proj-action proj-action-link"
              href={p.repo}
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub ↗
            </a>
          )}
          {p.relatedPdb && (
            <a
              className="proj-action proj-action-link"
              href={`https://www.rcsb.org/structure/${p.relatedPdb}`}
              target="_blank"
              rel="noreferrer"
            >
              PDB {p.relatedPdb} on RCSB ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function CVPane() {
  const p = window.PROFILE;
  return (
    <section className="pane">
      <div className="pane-head">
        <h2>Curriculum Vitae</h2>
        <span className="pane-sub">Experience, education, and skills</span>
      </div>

      {/* Contact bar */}
      <div className="cv-contact-bar">
        <span className="cv-contact-name">{p.name}</span>
        <span className="cv-contact-sep">·</span>
        <a href={`mailto:${p.email}`}>{p.email}</a>
        <span className="cv-contact-sep">·</span>
        <a href={p.linkedin} target="_blank" rel="noreferrer">linkedin</a>
        <span className="cv-contact-sep">·</span>
        <a href={p.github} target="_blank" rel="noreferrer">github</a>
        <span className="cv-contact-sep">·</span>
        <span className="cv-contact-loc">{p.location}</span>
      </div>

      {/* Experience */}
      <div className="cv-section">
        <div className="cv-h">Experience</div>
        <div className="cv-timeline">
          {p.experience.map(e => (
            <div key={e.id} className="cv-entry">
              <div className="cv-entry-line" />
              <div className="cv-entry-dot" />
              <div className="cv-entry-body">
                <div className="cv-row">
                  <div>
                    <div className="cv-role">{e.role}</div>
                    <div className="cv-org">{e.company}<span className="cv-org-loc"> · {e.location}</span></div>
                  </div>
                  <div className="cv-date">{e.period}</div>
                </div>
                <ul className="cv-bullets">
                  {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="cv-section">
        <div className="cv-h">Education</div>
        <div className="cv-timeline">
          <div className="cv-entry cv-entry-last">
            <div className="cv-entry-dot" />
            <div className="cv-entry-body">
              <div className="cv-row">
                <div>
                  <div className="cv-role">{p.education.degree}</div>
                  <div className="cv-org">{p.education.school}</div>
                </div>
                <div className="cv-date">{p.education.date}</div>
              </div>
              <div className="cv-honors-row">
                {p.education.honors.map(h => (
                  <span key={h} className="cv-honor-pill">{h}</span>
                ))}
              </div>
              <div className="cv-coursework">Coursework: {p.education.coursework.join(', ')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Presentations */}
      <div className="cv-section">
        <div className="cv-h">Presentations</div>
        {p.presentations.map((pr, i) => (
          <div key={i} className="cv-pres">
            <div className="cv-pres-title">{pr.title}</div>
            <div className="cv-pres-meta">
              <span className="cv-pres-venue">{pr.venue}</span>
              <span className="cv-pres-sep"> · </span>
              {pr.where}
              <span className="cv-pres-sep"> · </span>
              {pr.date}
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="cv-section">
        <div className="cv-h">Skills</div>
        {Object.entries(p.skills).map(([k, v]) => (
          <div key={k} className="cv-skill-row">
            <span className="cv-skill-key">{k.replace(/_/g, ' ')}</span>
            <span className="cv-skill-vals">
              {v.map(t => <span key={t} className="tag">{t}</span>)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeIntro({ onNavigate, onOpenProject }) {
  const p = window.PROFILE;
  const featured = (p.projects || []).find(pr => pr.featured);
  return (
    <div className="home-intro">
      <Hero />

      <p className="home-about">{p.about}</p>
      {p.personal && <p className="home-personal">{p.personal}</p>}

      {featured && (
        <button
          className="home-featured"
          onClick={() => (onOpenProject ? onOpenProject(featured.id) : onNavigate('projects'))}
        >
          <span className="home-featured-tag">★ Featured</span>
          <span className="home-featured-title">{featured.title}</span>
          <span className="home-featured-hook">{featured.hook || featured.summary}</span>
          <span className="home-featured-go">view project →</span>
        </button>
      )}

      <StatusCard />

      {p.homeCta && <p className="home-cta">{p.homeCta}</p>}

      <div className="home-quick">
        <button onClick={() => onNavigate('projects')}>Projects</button>
        <button onClick={() => onNavigate('models')}>Models</button>
        <button onClick={() => onNavigate('cv')}>CV</button>
        <a className="home-quick-link" href={`mailto:${p.email}`}>Email</a>
      </div>

      <ProteinFact />
    </div>
  );
}

function ProteinFact() {
  const facts = window.PROFILE?.proteinFacts || [];
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [idx, setIdx] = React.useState(() =>
    facts.length ? Math.floor(Math.random() * facts.length) : 0
  );
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    if (!facts.length || prefersReduced) return;
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % facts.length);
        setShow(true);
      }, 450);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  if (!facts.length) return null;
  return (
    <div className="home-fact">
      <span className="home-fact-label">$ did you know</span>
      <span className={`home-fact-text ${show ? 'on' : ''}`} aria-live="polite">
        {facts[idx]}
      </span>
    </div>
  );
}

function Hero() {
  const p = window.PROFILE;
  const full = `$ whoami`;
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadyBooted = typeof sessionStorage !== 'undefined'
    && sessionStorage.getItem('booted') === '1';
  const skipAnim = prefersReduced || alreadyBooted;

  const [typed, setTyped] = React.useState(skipAnim ? full : '');
  const [revealed, setRevealed] = React.useState(skipAnim);

  React.useEffect(() => {
    if (skipAnim) return;
    let i = 0;
    const typer = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(typer);
        setTimeout(() => {
          setRevealed(true);
          try { sessionStorage.setItem('booted', '1'); } catch (e) {}
        }, 180);
      }
    }, 70);
    return () => clearInterval(typer);
  }, []);

  return (
    <div className="hero">
      <div className="hero-top">
        <span className="hero-prompt">aakash@portfolio</span>
        <span className="hero-cmd">{typed}</span>
      </div>
      <div className={`hero-reveal ${revealed ? 'on' : ''}`}>
        <h1 className="hero-name">{p.name}</h1>
        <div className="hero-role">{p.oneLiner}</div>
        {p.tagline && <div className="hero-tagline">{p.tagline}</div>}
        <div className="hero-tags">
          <span className="hero-tag">Biomedical Engineer</span>
          <span className="hero-dot">·</span>
          <span className="hero-tag">Molecular Modeling</span>
          <span className="hero-dot">·</span>
          <span className="hero-tag">{p.location}</span>
        </div>
      </div>
    </div>
  );
}

function CopyEmail({ email }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <a
      href={`mailto:${email}`}
      onClick={copy}
      className="copy-email"
      title={`Copy ${email}`}
      aria-label={copied ? 'Email copied to clipboard' : `Copy email ${email}`}
    >
      {copied ? 'Copied ✓' : 'Email'}
    </a>
  );
}

function StatusCard() {
  const p = window.PROFILE;

  const rows = [
    { k: 'Role',     v: 'Molecular Modeling Intern · National Laboratory of the Rockies' },
    { k: 'Focus',    v: 'Protein design, MD simulations, and research software' },
    { k: 'Status',   v: (
      <span className="status-pills">
        <span className="status-pill">Open to PhD positions · Fall 2027</span>
        <span className="status-pill">Open to industry roles</span>
      </span>
    ) },
    { k: 'Tools',    v: [...(p.highlightedTools || []), ...(p.statusTools || [])].join(' · ') },
  ];

  return (
    <div className="status-card">
      <div className="status-head">
        <span className="status-h-label">Currently</span>
      </div>
      <div className="status-body">
        {rows.map((r) => (
          <div key={r.k} className="status-row">
            <span className="status-k">{r.k}</span>
            <span className="status-v">{r.v}</span>
          </div>
        ))}
        <div className="status-row">
          <span className="status-k">Contact</span>
          <span className="status-v status-links">
            <CopyEmail email={p.email} />
            <span className="dim">/</span>
            <a href={p.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <span className="dim">/</span>
            <a href={p.github} target="_blank" rel="noreferrer">GitHub</a>
          </span>
        </div>
      </div>
    </div>
  );
}

window.ProjectsPane = ProjectsPane;
window.CVPane = CVPane;
window.HomeIntro = HomeIntro;
