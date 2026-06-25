// Main app shell — sidebar nav + routed panes

function App() {
  const p = window.PROFILE;
  const routes = ['home', 'projects', 'models', 'cv'];
  const [route, setRoute] = React.useState(() => {
    const h = (location.hash || '#home').slice(1);
    return routes.includes(h) ? h : 'home';
  });
  const [pdbToLoad, setPdbToLoad] = React.useState('6VXX');
  const [modelToSelect, setModelToSelect] = React.useState(null);
  const [projectToSelect, setProjectToSelect] = React.useState(null);

  const openProject = React.useCallback((id) => {
    setProjectToSelect(id);
    setRoute('projects');
  }, []);

  const openStructure = React.useCallback((pdb) => {
    setPdbToLoad(pdb.toUpperCase());
    setRoute('home');
  }, []);

  React.useEffect(() => {
    location.hash = route;
    const label = route === 'home' ? '' : ` · ${route}`;
    document.title = `Aakash Shrestha${label}`;
  }, [route]);

  React.useEffect(() => {
    function onHash() {
      const h = (location.hash || '#home').slice(1);
      if (routes.includes(h)) setRoute(h);
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const nav = [
    { id: 'home',     label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'models',   label: 'Models' },
    { id: 'cv',       label: 'CV' },
  ];

  const sectionLabel = (nav.find(n => n.id === route) || {}).label || 'Home';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-name">{p.name}</div>
          <div className="brand-sub">{p.oneLiner}</div>
        </div>
        <nav className="nav">
          {nav.map(n => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`nav-item ${route === n.id ? 'on' : ''}`}
              onClick={e => { e.preventDefault(); setRoute(n.id); }}
            >
              <span className="nav-label">{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-link"><span className="dim">LinkedIn</span> <a href={p.linkedin} target="_blank" rel="noreferrer">/in/aakashshrestha395</a></div>
          <div className="side-link"><span className="dim">GitHub</span> <a href={p.github} target="_blank" rel="noreferrer">@aakashxtha</a></div>
          <div className="side-link"><span className="dim">Email</span> <a href={`mailto:${p.email}`}>{p.email}</a></div>
          {p.updated && <div className="side-updated">last updated · {p.updated}</div>}
        </div>
      </aside>

      <main className="main">
        <div className="main-bar">
          <span className="bar-path">{p.name}</span>
          <span className="bar-stat">{sectionLabel}</span>
        </div>

        {route === 'home' && (
          <>
            <HomeIntro onNavigate={setRoute} onOpenProject={openProject} />
            <StructureViewer
              key={pdbToLoad}
              initialStructure={pdbToLoad}
              onNavigate={setRoute}
              onOpenProject={openProject}
            />
          </>
        )}
        {route === 'models' && (
          <ModelsPane
            initialModelId={modelToSelect}
            onInitialModelApplied={() => setModelToSelect(null)}
          />
        )}
        {route === 'projects' && (
          <ProjectsPane
            onViewModel={id => { setModelToSelect(id); setRoute('models'); }}
            onViewStructure={openStructure}
            initialProjectId={projectToSelect}
            onInitialProjectApplied={() => setProjectToSelect(null)}
          />
        )}
        {route === 'cv' && <CVPane />}
      </main>
    </div>
  );
}

window.App = App;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
