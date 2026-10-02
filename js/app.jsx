// App shell — one long page, fixed nav with scroll-spy, hash links kept working

const NAV = [
  { id: 'about', label: 'About', n: '01' },
  { id: 'work', label: 'Work', n: '02' },
  { id: 'structures', label: 'Structures', n: '03' },
  { id: 'console', label: 'Console', n: '04' },
  { id: 'cv', label: 'CV', n: '05' },
];

// Old routes from the previous site still resolve
const HASH_ALIASES = { home: 'top', projects: 'work', models: 'structures' };
const resolveSection = (id) => HASH_ALIASES[id] || id;

function App() {
  const p = window.PROFILE;
  const [active, setActive] = React.useState('top');
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [pdbToLoad, setPdbToLoad] = React.useState('6VXX');
  const [modelFocus, setModelFocus] = React.useState(null);
  const [projectFocus, setProjectFocus] = React.useState(null);
  const progressRef = React.useRef(null);

  const navigate = React.useCallback((id) => {
    const target = resolveSection(id);
    const el = document.getElementById(target);
    setMenuOpen(false);
    if (!el) return;
    el.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', target === 'top' ? location.pathname : `#${target}`);
  }, []);

  const openProject = React.useCallback((id) => {
    setProjectFocus({ id, n: Date.now() });
    navigate('work');
  }, [navigate]);

  const openStructure = React.useCallback((pdb) => {
    setPdbToLoad(pdb.toUpperCase());
    navigate('console');
  }, [navigate]);

  const viewModel = React.useCallback((id) => {
    setModelFocus({ id, n: Date.now() });
    navigate('structures');
  }, [navigate]);

  // boot: drop the static loader, honour any deep link
  React.useEffect(() => {
    document.body.classList.add('ready');
    const h = (location.hash || '').slice(1);
    if (h) {
      const target = resolveSection(h);
      requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }));
    }
    const onHash = () => {
      const id = (location.hash || '').slice(1);
      if (id) navigate(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // scroll-spy + nav state + progress hairline
  React.useEffect(() => {
    const sections = [...document.querySelectorAll('[data-section]')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.section); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  React.useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const link = (id) => (e) => { e.preventDefault(); navigate(id); };

  return (
    <>
      <a className="skip" href="#work" onClick={link('work')}>Skip to work</a>

      <div className="guides" aria-hidden="true">
        <div className="wrap guides-in"><i /><i /><i /><i /></div>
      </div>

      <header className={`nav ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'open' : ''}`}>
        <div className="wrap nav-in">
          <a href="#top" className="brand" onClick={link('top')} aria-label={`${p.name} — back to top`}>
            <span className="brand-mark" aria-hidden="true">AS</span>
            <span className="brand-name">{p.name}</span>
          </a>
          <nav className="nav-links" aria-label="Sections">
            {NAV.map(n => (
              <a key={n.id} href={`#${n.id}`} onClick={link(n.id)} className={active === n.id ? 'on' : ''}
                aria-current={active === n.id ? 'true' : undefined}>
                <span className="nl-n">{n.n}</span>{n.label}
              </a>
            ))}
          </nav>
          <a href="#contact" onClick={link('contact')} className={`nav-cta ${active === 'contact' ? 'on' : ''}`}>
            Get in touch <span aria-hidden="true">→</span>
          </a>
          <button className="nav-burger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}>
            <span /><span />
          </button>
        </div>
        <div className="nav-progress" ref={progressRef} aria-hidden="true" />
      </header>

      <div className={`menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="wrap menu-in" aria-label="Menu">
          {[...NAV, { id: 'contact', label: 'Contact', n: '06' }].map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={link(n.id)} style={{ '--i': i }} tabIndex={menuOpen ? 0 : -1}>
              <span className="nl-n">{n.n}</span>{n.label}
            </a>
          ))}
          <div className="menu-foot">
            <a href={`mailto:${p.email}`} tabIndex={menuOpen ? 0 : -1}>{p.email}</a>
          </div>
        </nav>
      </div>

      <main>
        <Hero onNavigate={navigate} onOpenProject={openProject} />
        <Marquee items={[
          ...(p.structures || []).map(s => `PDB ${s.id} — ${s.name}`),
          ...Object.values(p.skills).flat().filter((t, i, a) => a.indexOf(t) === i).slice(0, 18),
        ]} />
        <About onOpenProject={openProject} />
        <Work focus={projectFocus} onViewModel={viewModel} onViewStructure={openStructure} />
        <Structures focus={modelFocus} />

        <section id="console" className="sec" data-section="console">
          <div className="wrap">
            <SectionHead
              num="04"
              label="Lab console"
              title={['Load anything from the ', { em: 'Protein Data Bank.' }]}
              aside="A working viewer and a small shell. Type a 4-character PDB id, or try whoami, projects, open sbxat, measure."
            />
            <Lazy minHeight={640}>
              <StructureViewer key={pdbToLoad} initialStructure={pdbToLoad} onNavigate={navigate} onOpenProject={openProject} />
            </Lazy>
          </div>
        </section>

        <CV />
        <Contact />
      </main>
    </>
  );
}

window.App = App;

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
