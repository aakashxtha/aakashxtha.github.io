// Page sections: hero, about, work, CV, contact

function SectionHead({ num, label, title, aside }) {
  return (
    <header className="sec-head grid12">
      <div className="sec-label">
        <span className="sq" aria-hidden="true" />
        <Scramble text={`${num} — ${label}`} />
      </div>
      <div className="sec-head-main">
        <MaskText as="h2" className="sec-title" parts={title} />
        {aside && <Reveal as="p" className="sec-aside" delay={200}>{aside}</Reveal>}
      </div>
    </header>
  );
}

/* ---------------- HERO ---------------- */

function Hero({ onNavigate, onOpenProject }) {
  const p = window.PROFILE;
  const hm = p.heroModel;
  const [stats, setStats] = React.useState(null);

  return (
    <section id="top" className="hero" data-section="top">
      <div className="wrap hero-wrap">
        <div className="hero-copy">
          <div className="hero-kicker rv in" style={{ '--d': '100ms' }}>
            <span className="sq" aria-hidden="true" />
            <Scramble text="Computational biophysics" />
            <span className="hide-sm" aria-hidden="true">·</span>
            <span className="hide-sm"><Scramble text="Protein design" delay={120} /></span>
          </div>
          <MaskText
            as="h1"
            className="hero-title"
            delay={250}
            stagger={55}
            parts={['I turn molecular questions into ', { em: 'simulations,' }, ' and simulations into ', { em: 'answers.' }]}
          />
          <Reveal as="p" className="hero-sub" delay={900}>
            <strong>{p.name}</strong> — biomedical engineer working on protein design, molecular dynamics,
            and the research software that connects them. Currently a Molecular Modeling Intern at the
            National Laboratory of the Rockies.
          </Reveal>
          <Reveal className="hero-ctas" delay={1050}>
            <a href="#work" className="btn btn-primary" onClick={e => { e.preventDefault(); onNavigate('work'); }}>
              <span className="btn-label">Selected work</span>
              <span className="btn-icon" aria-hidden="true">↓</span>
            </a>
            <a href="#console" className="btn btn-ghost" onClick={e => { e.preventDefault(); onNavigate('console'); }}>
              <span className="btn-label">Open the lab console</span>
              <span className="btn-icon" aria-hidden="true">›_</span>
            </a>
          </Reveal>
        </div>

        <figure className="hero-fig">
          <span className="crop tl" /><span className="crop tr" /><span className="crop bl" /><span className="crop br" />
          <ProteinCloud src={hm.file} onStats={setStats} />
          <figcaption className="hero-cap">
            <span className="cap-no">Fig. 1</span>
            <span>
              {hm.name}, {hm.variant}
              {stats && <> — {stats.atoms.toLocaleString()} heavy atoms, {stats.residues} residues.</>}{' '}
              Folded live in your browser from a model I designed with PyRosetta.{' '}
              <a href="#work" onClick={e => { e.preventDefault(); onOpenProject(hm.project); }}>Read the project →</a>
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="wrap">
        <Reveal className="hero-foot" delay={1200}>
          <div className="hf-cell">
            <span className="hf-k">Now</span>
            <span className="hf-v">Modeling Intern, National Laboratory of the Rockies</span>
          </div>
          <div className="hf-cell">
            <span className="hf-k">Next</span>
            <span className="hf-v"><span className="live-dot" aria-hidden="true" />Open to PhD (Fall 2027) &amp; industry roles</span>
          </div>
          <div className="hf-cell">
            <span className="hf-k">Based</span>
            <span className="hf-v">{p.location}</span>
          </div>
          <div className="hf-cell">
            <span className="hf-k">Local time</span>
            <span className="hf-v mono"><LocalTime /></span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- ABOUT ---------------- */

function About({ onOpenProject }) {
  const p = window.PROFILE;
  return (
    <section id="about" className="sec" data-section="about">
      <div className="wrap">
        <div className="grid12 about-grid">
          <div className="sec-label about-label">
            <span className="sq" aria-hidden="true" />
            <Scramble text="01 — About" />
          </div>
          <div className="about-main">
            <ScrubText className="about-text" text={p.about} />
            {p.personal && <Reveal as="p" className="about-personal">{p.personal}</Reveal>}
          </div>
        </div>

        <div className="stats">
          {(p.stats || []).map((s, i) => (
            <Reveal key={s.label} className="stat" delay={i * 90}>
              <div className="stat-v"><CountUp value={s.value} /></div>
              <p className="stat-l">{s.label}</p>
              {s.project && (
                <button className="stat-link" onClick={() => onOpenProject(s.project)}>
                  open {s.project} <span aria-hidden="true">→</span>
                </button>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WORK ---------------- */

const WORK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'protein', label: 'Protein' },
  { id: 'materials', label: 'Materials' },
  { id: 'polymer', label: 'Polymer' },
  { id: 'composite', label: 'Composite' },
  { id: 'software', label: 'Software' },
];

function Work({ focus, onViewModel, onViewStructure }) {
  const ps = window.PROFILE.projects;
  const [filter, setFilter] = React.useState('all');
  const [openId, setOpenId] = React.useState(null);
  const rowRefs = React.useRef({});

  React.useEffect(() => {
    if (!focus || !ps.some(p => p.id === focus.id)) return;
    setFilter('all');
    setOpenId(focus.id);
    // let the section scroll settle, then bring the row into view
    const t = setTimeout(() => {
      rowRefs.current[focus.id]?.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
    }, 650);
    return () => clearTimeout(t);
  }, [focus]);

  const counts = WORK_FILTERS.reduce((acc, f) => {
    acc[f.id] = f.id === 'all' ? ps.length : ps.filter(p => p.category === f.id).length;
    return acc;
  }, {});
  const list = filter === 'all' ? ps : ps.filter(p => p.category === filter);

  return (
    <section id="work" className="sec" data-section="work">
      <div className="wrap">
        <SectionHead
          num="02"
          label="Selected work"
          title={['Enzymes, peptides, polymers — and the ', { em: 'code' }, ' that ties them together.']}
          aside="Research and engineering from national labs, university groups, and one stubborn side project. Open any row for the details."
        />

        <div className="filters" role="tablist" aria-label="Filter projects">
          {WORK_FILTERS.filter(f => counts[f.id] > 0).map(f => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={`filter ${filter === f.id ? 'on' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}<sup>{counts[f.id]}</sup>
            </button>
          ))}
        </div>

        <ol className="work-list">
          {list.map((p, i) => {
            const open = openId === p.id;
            return (
              <li key={p.id} className={`work-item ${open ? 'open' : ''}`} ref={el => (rowRefs.current[p.id] = el)}>
                <button
                  className="work-row"
                  aria-expanded={open}
                  aria-controls={`wd-${p.id}`}
                  onClick={() => setOpenId(open ? null : p.id)}
                >
                  <span className="wr-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="wr-title">
                    <span className="wr-t">{p.title}</span>
                    <span className="wr-k">{p.kicker}</span>
                  </span>
                  <span className="wr-hook">{p.hook}</span>
                  <span className="wr-meta">
                    {p.year !== p.status && <span className="wr-year">{p.year}</span>}
                    <span className={`wr-status s-${p.status}`}>{p.status}</span>
                  </span>
                  <span className="wr-plus" aria-hidden="true" />
                </button>
                <div className="work-detail" id={`wd-${p.id}`} role="region" aria-label={p.title}>
                  <div className="wd-clip">
                    {open && <ProjectDetail project={p} onViewModel={onViewModel} onViewStructure={onViewStructure} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function ProjectDetail({ project: p, onViewModel, onViewStructure }) {
  const models = window.PROFILE.models || [];
  const related = (p.relatedModels || []).map(id => models.find(m => m.id === id)).filter(Boolean);

  return (
    <div className="wd">
      <div className="wd-main">
        {p.affiliation && <div className="wd-affil">{p.affiliation}</div>}
        <p className="wd-summary">{p.summary}</p>
        {p.highlights?.length > 0 && (
          <ol className="wd-hl">
            {p.highlights.map((h, i) => <li key={i}><span>{String.fromCharCode(97 + i)}.</span>{h}</li>)}
          </ol>
        )}
        {(related.length > 0 || p.relatedPdb || p.repo) && (
          <div className="wd-actions">
            {related.map(m => (
              <button key={m.id} className="link-arrow" onClick={() => onViewModel(m.id)}>View {m.name}</button>
            ))}
            {p.relatedPdb && (
              <button className="link-arrow" onClick={() => onViewStructure(p.relatedPdb)}>Load {p.relatedPdb} in the console</button>
            )}
            {p.repo && <a className="link-arrow ext" href={p.repo} target="_blank" rel="noreferrer">Source on GitHub</a>}
            {p.relatedPdb && (
              <a className="link-arrow ext" href={`https://www.rcsb.org/structure/${p.relatedPdb}`} target="_blank" rel="noreferrer">PDB {p.relatedPdb} on RCSB</a>
            )}
          </div>
        )}
      </div>
      <aside className="wd-side">
        {p.metrics?.map(m => (
          <div key={m.label} className="wd-metric">
            <div className="wd-mv"><CountUp value={m.value} duration={1100} /></div>
            <div className="wd-ml">{m.label}</div>
          </div>
        ))}
        {p.presentation && (
          <div className="wd-pres">
            <div className="wd-ml">Presented</div>
            <div className="wd-pt">{p.presentation.title}</div>
            <div className="wd-pv">{p.presentation.venue} · {p.presentation.where}</div>
          </div>
        )}
        {p.tags?.length > 0 && <div className="wd-tags">{p.tags.join(' / ')}</div>}
      </aside>
    </div>
  );
}

/* ---------------- CV ---------------- */

function CV() {
  const p = window.PROFILE;
  const ed = p.education;
  return (
    <section id="cv" className="sec" data-section="cv">
      <div className="wrap">
        <SectionHead
          num="05"
          label="Curriculum vitae"
          title={['Five roles, three states, ', { em: 'one' }, ' through-line.']}
          aside="Simulation first, wet-lab literate, and always writing the tooling."
        />

        <div className="cv-block">
          <div className="cv-h">Experience</div>
          {p.experience.map((e, i) => (
            <Reveal key={e.id} className="cv-row" delay={i * 60}>
              <div className="cv-when">{e.period}</div>
              <div className="cv-what">
                <div className="cv-role">{e.role}</div>
                <div className="cv-org">{e.company} <span>· {e.location}</span></div>
              </div>
              <ul className="cv-bul">
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="cv-block">
          <div className="cv-h">Education</div>
          <Reveal className="cv-row">
            <div className="cv-when">{ed.date}</div>
            <div className="cv-what">
              <div className="cv-role">{ed.degree}</div>
              <div className="cv-org">{ed.school}</div>
            </div>
            <div className="cv-bul cv-ed">
              <div className="cv-honors">{ed.honors.join('  ·  ')}</div>
              <div className="cv-course"><span>Coursework</span> {ed.coursework.join(', ')}</div>
            </div>
          </Reveal>
        </div>

        <div className="cv-block">
          <div className="cv-h">Presentations</div>
          {p.presentations.map((pr, i) => (
            <Reveal key={i} className="cv-row">
              <div className="cv-when">{pr.date}</div>
              <div className="cv-what">
                <div className="cv-role cv-pres">{pr.title}</div>
                <div className="cv-org">{pr.venue} <span>· {pr.where}</span></div>
              </div>
              <div />
            </Reveal>
          ))}
        </div>

        <div className="cv-block">
          <div className="cv-h">Toolkit</div>
          <div className="skills">
            {Object.entries(p.skills).map(([k, v], i) => (
              <Reveal key={k} className="skill-col" delay={i * 80}>
                <div className="skill-k">{k.replace(/_/g, ' ')}</div>
                <ul>{v.map(t => <li key={t}>{t}</li>)}</ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT ---------------- */

function CopyEmail({ email }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button className={`copy ${copied ? 'done' : ''}`} onClick={copy} aria-live="polite">
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  );
}

function ProteinFact() {
  const facts = window.PROFILE?.proteinFacts || [];
  const [idx, setIdx] = React.useState(() => (facts.length ? Math.floor(Math.random() * facts.length) : 0));
  const [show, setShow] = React.useState(true);
  React.useEffect(() => {
    if (!facts.length || REDUCED_MOTION) return;
    let t;
    const id = setInterval(() => {
      setShow(false);
      t = setTimeout(() => { setIdx(i => (i + 1) % facts.length); setShow(true); }, 450);
    }, 7000);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);
  if (!facts.length) return null;
  return (
    <div className="fact">
      <span className="fact-k">Did you know</span>
      <span className={`fact-v ${show ? 'on' : ''}`} aria-live="polite">{facts[idx]}</span>
    </div>
  );
}

function Contact() {
  const p = window.PROFILE;
  return (
    <section id="contact" className="sec contact" data-section="contact">
      <div className="wrap">
        <div className="sec-label">
          <span className="sq" aria-hidden="true" />
          <Scramble text="06 — Contact" />
        </div>
        <MaskText as="h2" className="contact-title" stagger={70} parts={["Let's talk ", { em: 'molecules.' }]} />
        {p.homeCta && <Reveal as="p" className="contact-sub">{p.homeCta} Questions about a project, a PhD position, or a role — my inbox is open.</Reveal>}

        <Reveal className="contact-rows" delay={150}>
          <div className="c-row">
            <span className="c-k">Email</span>
            <a className="c-v" href={`mailto:${p.email}`}>{p.email}</a>
            <CopyEmail email={p.email} />
          </div>
          <div className="c-row">
            <span className="c-k">LinkedIn</span>
            <a className="c-v" href={p.linkedin} target="_blank" rel="noreferrer">/in/aakashshrestha395</a>
            <span className="c-arrow" aria-hidden="true">↗</span>
          </div>
          <div className="c-row">
            <span className="c-k">GitHub</span>
            <a className="c-v" href={p.github} target="_blank" rel="noreferrer">@aakashxtha</a>
            <span className="c-arrow" aria-hidden="true">↗</span>
          </div>
        </Reveal>

        <ProteinFact />

        <footer className="foot">
          <span>© {new Date().getFullYear()} {p.name}</span>
          <span>Built by hand. Structures rendered with 3Dmol.js.</span>
          <span>Updated {p.updated}</span>
          <span>{p.coords}</span>
        </footer>
      </div>
    </section>
  );
}

Object.assign(window, { SectionHead, Hero, About, Work, CV, Contact });
