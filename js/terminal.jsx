// Interactive structure viewer — 3Dmol canvas + a small command console

// Quick-load structures
const FAV_PDBS = [
  { id: '6VXX' },
  { id: '8ED3' },
  { id: '1TIM' },
  { id: '3LJ5' },
  { id: '1BTL' },
];

const STYLES = ['cartoon', 'stick', 'sphere', 'line'];
const COLORS = ['spectrum', 'chain', 'amber', 'green', 'cyan', 'ssPyMOL'];

const COMMAND_HELP = [
  { cmd: 'help', desc: 'show commands' },
  { cmd: 'whoami', desc: 'who is this?' },
  { cmd: 'about', desc: 'short bio' },
  { cmd: 'projects', desc: 'list research projects' },
  { cmd: 'cv', desc: 'open the CV page' },
  { cmd: 'goto <page>', desc: 'home | projects | models | cv' },
  { cmd: 'open <id>', desc: 'open a project (e.g. open sbxat)' },
  { cmd: 'contact', desc: 'email · github · linkedin' },
  { cmd: 'load <pdb>', desc: 'load a 4-character PDB id (e.g. load 1btl)' },
  { cmd: 'favorites', desc: 'list favorite PDB ids' },
  { cmd: 'random', desc: 'load a random favorite' },
  { cmd: 'style <s>', desc: 'cartoon | stick | sphere | line' },
  { cmd: 'color <c>', desc: 'spectrum | chain | amber | green | cyan | ssPyMOL' },
  { cmd: 'spin on|off', desc: 'toggle rotation' },
  { cmd: 'reset', desc: 'recenter and refit' },
  { cmd: 'info', desc: 'metadata for the current structure' },
  { cmd: 'measure', desc: 'click two atoms to measure distance (Å)' },
  { cmd: 'pwd', desc: 'print working directory' },
  { cmd: 'hostname', desc: 'print host name' },
  { cmd: 'ls', desc: 'list favorites and loaded structure' },
  { cmd: 'date', desc: 'current date and time' },
  { cmd: 'cowsay <msg>', desc: 'important announcements' },
  { cmd: 'echo <msg>', desc: 'echo text back' },
  { cmd: 'sudo <cmd>', desc: 'nice try' },
  { cmd: 'coffee', desc: 'fuel status' },
  { cmd: 'clear', desc: 'clear the console' },
];

const ALL_COMMANDS = [
  'help', 'whoami', 'about', 'projects', 'cv', 'goto', 'open', 'contact',
  'load', 'favorites', 'random', 'style', 'color', 'spin', 'reset',
  'info', 'measure', 'pwd', 'hostname', 'ls', 'date', 'cowsay', 'echo',
  'sudo', 'coffee', 'clear',
];

const COW = [
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
];

function StructureViewer({ initialStructure = '1BTL', onNavigate, onOpenProject }) {
  const myModels = React.useMemo(() => {
    const all = window.PROFILE?.models || [];
    const ids = window.PROFILE?.homeModels || [];
    return ids.map(id => all.find(m => m.id === id)).filter(Boolean);
  }, []);
  const [activeModel, setActiveModel] = React.useState(null);
  const [pdbId, setPdbId] = React.useState(initialStructure.toUpperCase());
  const [renderStyle, setRenderStyle] = React.useState('cartoon');
  const [colorMode, setColorMode] = React.useState('spectrum');
  const [spin, setSpin] = React.useState(true);
  const [meta, setMeta] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [pdbField, setPdbField] = React.useState(initialStructure.toUpperCase());
  const [logLines, setLogLines] = React.useState(() => {
    const motds = window.PROFILE?.motd || [];
    const motd = motds.length ? motds[Math.floor(Math.random() * motds.length)] : null;
    return [
      { kind: 'sys', text: 'console ready — try whoami, projects, or help' },
      ...(motd ? [{ kind: 'dim', text: motd }] : []),
      { kind: 'sys', text: `→ fetching ${initialStructure.toUpperCase()} from rcsb.org…` },
    ];
  });
  const [input, setInput] = React.useState('');
  const [history, setHistory] = React.useState([]);
  const [histIdx, setHistIdx] = React.useState(-1);
  const [measureMode, setMeasureMode] = React.useState(false);
  const measureAtomsRef = React.useRef([]);
  const measureModeRef = React.useRef(false);

  const viewerHostRef = React.useRef(null);
  const viewerRef = React.useRef(null);
  const logRef = React.useRef(null);

  React.useEffect(() => { measureModeRef.current = measureMode; }, [measureMode]);

  const log = React.useCallback((kind, text) => {
    setLogLines(prev => [...prev.slice(-200), { kind, text }]);
  }, []);

  // init viewer once
  React.useEffect(() => {
    if (!window.$3Dmol || !viewerHostRef.current) return;
    const v = window.$3Dmol.createViewer(viewerHostRef.current, {
      backgroundColor: 'rgba(0,0,0,0)',
      antialias: true,
    });
    viewerRef.current = v;
    attachAtomClick(v);
    return () => { try { v.clear(); } catch (e) {} };
  }, []);

  // load PDB on id change (RCSB) or local model
  React.useEffect(() => {
    if (!viewerRef.current) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const v = viewerRef.current;
    v.clear();
    measureAtomsRef.current = [];

    const isLocal = !!activeModel;
    const url = isLocal ? activeModel.file : `https://files.rcsb.org/download/${pdbId}.pdb`;
    const displayId = isLocal ? activeModel.id : pdbId;
    const notFoundMsg = isLocal ? `couldn't load ${activeModel.file}` : `PDB ${pdbId} not found on RCSB`;

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(notFoundMsg); return r.text(); })
      .then(pdbText => {
        if (cancelled) return;
        v.addModel(pdbText, 'pdb');
        applyStyle(v, renderStyle, colorMode);
        v.zoomTo();
        v.render();
        if (spin) v.spin('y', 0.4);
        const m = parseMeta(pdbText, displayId);
        if (isLocal) { m.local = true; m.name = activeModel.name; }
        setMeta(m);
        setLoading(false);
        const label = isLocal ? (activeModel.name || displayId) : displayId;
        log('ok', `loaded ${label} — ${m.title ? m.title.slice(0,60) : 'structure'}`);
        log('dim', `  ${m.atoms.toLocaleString()} atoms · ${m.residues} residues · ${m.chains.length} chain${m.chains.length>1?'s':''}${m.resolution?` · ${m.resolution} Å`:''}`);
        attachAtomClick(v);
      })
      .catch(err => {
        if (cancelled) return;
        setLoading(false);
        setError(err.message);
        log('err', `error: ${err.message}`);
      });
    return () => { cancelled = true; };
  }, [pdbId, activeModel]);

  React.useEffect(() => {
    const v = viewerRef.current;
    if (!v || loading) return;
    applyStyle(v, renderStyle, colorMode);
    v.render();
  }, [renderStyle, colorMode, loading]);

  React.useEffect(() => {
    const v = viewerRef.current;
    if (!v || loading) return;
    if (spin) v.spin('y', 0.4); else v.spin(false);
  }, [spin, loading]);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  function attachAtomClick(v) {
    v.setClickable({}, true, function(atom) {
      if (measureModeRef.current) {
        measureAtomsRef.current.push(atom);
        v.addSphere({ center: { x: atom.x, y: atom.y, z: atom.z }, radius: 0.45, color: '#7fffd4' });
        if (measureAtomsRef.current.length === 2) {
          const [a, b] = measureAtomsRef.current;
          const d = Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z);
          v.addLine({ start: a, end: b, color: '#7fffd4', dashed: true, linewidth: 2 });
          v.addLabel(`${d.toFixed(2)} Å`, {
            position: { x:(a.x+b.x)/2, y:(a.y+b.y)/2, z:(a.z+b.z)/2 },
            backgroundColor: 'rgba(0,0,0,0.9)', fontColor: '#7fffd4', fontSize: 13,
            borderColor: '#7fffd4', borderThickness: 1,
          });
          log('ok', `measure: ${a.resn}${a.resi}.${a.atom} ↔ ${b.resn}${b.resi}.${b.atom} = ${d.toFixed(2)} Å`);
          measureAtomsRef.current = [];
          setMeasureMode(false);
        } else {
          log('sys', `measure: pick atom 2/2`);
        }
        v.render();
        return;
      }
      const label = `${atom.resn}${atom.resi}:${atom.chain}.${atom.atom}`;
      v.addLabel(label, {
        position: { x: atom.x, y: atom.y, z: atom.z },
        backgroundColor: 'rgba(0,0,0,0.9)',
        fontColor: '#ffb454', fontSize: 12,
        borderColor: '#ffb454', borderThickness: 1,
      });
      v.render();
      log('ok', `clicked ${label}`);
    });
  }

  function loadPdb(id) {
    setActiveModel(null);
    setRenderStyle('cartoon');
    setPdbField(id);
    setPdbId(id);
  }

  function loadMyModel(model) {
    setPdbField(model.id.toUpperCase().slice(0, 4));
    setRenderStyle(model.defaultStyle || 'cartoon');
    setActiveModel(model);
  }

  function submitPdbField(e) {
    e.preventDefault();
    const id = pdbField.trim().toUpperCase();
    if (!/^[0-9A-Z]{4}$/.test(id)) { log('err', 'PDB id must be exactly 4 alphanumeric characters'); return; }
    loadPdb(id);
    log('cmd', `> load ${id}`);
  }

  function exec(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    log('cmd', `> ${cmd}`);
    setHistory(h => [...h, cmd]);
    setHistIdx(-1);

    const [head, ...rest] = cmd.split(/\s+/);
    switch (head.toLowerCase()) {
      case 'help':
      case '?':
        log('out', '  navigate');
        COMMAND_HELP.filter(c => ['whoami', 'about', 'projects', 'cv', 'goto', 'open', 'contact'].some(k => c.cmd.startsWith(k)))
          .forEach(c => log('out', `  ${c.cmd.padEnd(20)} ${c.desc}`));
        log('out', '  viewer');
        COMMAND_HELP.filter(c => ['load', 'favorites', 'random', 'style', 'color', 'spin', 'reset', 'info', 'measure'].some(k => c.cmd.startsWith(k)))
          .forEach(c => log('out', `  ${c.cmd.padEnd(20)} ${c.desc}`));
        log('out', '  shell');
        COMMAND_HELP.filter(c => ['pwd', 'hostname', 'ls', 'date', 'cowsay', 'echo', 'sudo', 'coffee', 'clear'].some(k => c.cmd.startsWith(k)))
          .forEach(c => log('out', `  ${c.cmd.padEnd(20)} ${c.desc}`));
        break;
      case 'cv':
        if (onNavigate) { onNavigate('cv'); log('ok', 'opening cv…'); }
        else log('err', 'navigation unavailable here');
        break;
      case 'goto': {
        const pages = ['home', 'projects', 'models', 'cv'];
        const dest = (rest[0] || '').toLowerCase();
        if (!pages.includes(dest)) { log('err', `goto: ${pages.join(' | ')}`); break; }
        if (onNavigate) { onNavigate(dest); log('ok', `→ ${dest}`); }
        else log('err', 'navigation unavailable here');
        break;
      }
      case 'open': {
        const id = (rest[0] || '').toLowerCase();
        const proj = (window.PROFILE?.projects || []).find(pr => pr.id === id);
        if (!id) { log('err', 'usage: open <project-id> — try `projects` for ids'); break; }
        if (!proj) { log('err', `no project '${id}'. type 'projects' to list ids`); break; }
        if (onOpenProject) { onOpenProject(proj.id); log('ok', `opening ${proj.title}…`); }
        else log('err', 'navigation unavailable here');
        break;
      }
      case 'sudo':
        log('err', `aakash is not in the sudoers file. This incident will be reported. 🚨`);
        break;
      case 'coffee':
        log('out', '  ( (');
        log('out', '   ) )');
        log('out', '  ........');
        log('out', '  |      |]');
        log('out', '  \\      /');
        log('out', '   `----\'');
        log('dim', '  caffeine: optimal · trajectories: running');
        break;
      case 'whoami': {
        const p = window.PROFILE;
        if (!p) { log('err', 'profile not loaded'); break; }
        log('ok', p.name);
        log('out', `  ${p.oneLiner}`);
        if (p.tagline) log('dim', `  "${p.tagline}"`);
        log('out', `  ${p.location}`);
        log('dim', '  Molecular Modeling Intern · National Laboratory of the Rockies');
        log('dim', '  Open to PhD positions · Fall 2027 · Open to industry positions');
        break;
      }
      case 'about': {
        const p = window.PROFILE;
        if (!p) { log('err', 'profile not loaded'); break; }
        p.about.split('\n').forEach(line => log('out', `  ${line.trim()}`));
        if (p.personal) { log('out', '  '); log('dim', `  ${p.personal}`); }
        break;
      }
      case 'projects': {
        const ps = window.PROFILE?.projects || [];
        ps.forEach((pr, i) => {
          const yr = pr.year === 'ongoing' ? 'ongoing' : pr.year;
          log('out', `  ${String(i + 1).padStart(2, '0')}  [${yr}]  ${pr.title}  ${pr.featured ? '★' : ''}`);
          log('dim', `        id: ${pr.id}`);
        });
        log('dim', `  ${ps.length} entries — type 'open <id>' to jump to one`);
        break;
      }
      case 'contact': {
        const p = window.PROFILE;
        if (!p) { log('err', 'profile not loaded'); break; }
        log('out', `  email     ${p.email}`);
        log('out', `  github    ${p.github.replace('https://github.com/', '')}`);
        log('out', `  linkedin  ${p.linkedin.replace('https://www.linkedin.com/in/', '')}`);
        break;
      }
      case 'favorites':
        FAV_PDBS.forEach(f => log('out', `  ${f.id}${f.note ? `  — ${f.note}` : ''}`));
        log('dim', '  load one with: load <id>');
        break;
      case 'random': {
        const pick = FAV_PDBS[Math.floor(Math.random() * FAV_PDBS.length)];
        loadPdb(pick.id);
        log('ok', `random → ${pick.id}`);
        break;
      }
      case 'pwd':
        log('out', `  /home/aakash/structures/${pdbId.toLowerCase()}.pdb`);
        break;
      case 'hostname':
        log('out', '  nlr-golden');
        break;
      case 'ls':
        log('out', `  ${pdbId.toLowerCase()}.pdb  ← loaded`);
        FAV_PDBS.forEach(f => {
          if (f.id !== pdbId) log('dim', `  ${f.id.toLowerCase()}.pdb`);
        });
        break;
      case 'date':
        log('out', `  ${new Date().toString()}`);
        break;
      case 'echo':
        log('out', `  ${rest.join(' ') || ''}`);
        break;
      case 'cowsay': {
        const msg = rest.join(' ') || 'proteins go brrr';
        const inner = msg.length > 40 ? msg.slice(0, 37) + '...' : msg;
        log('out', `  ${'_'.repeat(inner.length + 2)}`);
        log('out', `  < ${inner} >`);
        log('out', `  ${'-'.repeat(inner.length + 2)}`);
        COW.forEach(line => log('out', `  ${line}`));
        break;
      }
      case 'load': {
        const id = (rest[0] || '').toUpperCase();
        if (!/^[0-9A-Z]{4}$/.test(id)) { log('err', 'usage: load <4-char pdb id>'); break; }
        loadPdb(id);
        break;
      }
      case 'style': {
        if (!STYLES.includes(rest[0])) { log('err', `style: ${STYLES.join(' | ')}`); break; }
        setRenderStyle(rest[0]);
        log('ok', `style → ${rest[0]}`);
        break;
      }
      case 'color': {
        if (!COLORS.includes(rest[0])) { log('err', `color: ${COLORS.join(' | ')}`); break; }
        setColorMode(rest[0]);
        log('ok', `color → ${rest[0]}`);
        break;
      }
      case 'spin': {
        const v = rest[0];
        if (v !== 'on' && v !== 'off') { log('err', 'spin on | off'); break; }
        setSpin(v === 'on');
        log('ok', `spin → ${v}`);
        break;
      }
      case 'reset':
        viewerRef.current?.zoomTo();
        viewerRef.current?.render();
        log('ok', 'view reset');
        break;
      case 'measure':
        setMeasureMode(true);
        log('sys', 'measure: pick atom 1/2 (click in viewer)');
        break;
      case 'info': {
        if (!meta) { log('err', 'no structure loaded'); break; }
        log('out', `  pdb id      ${meta.id}`);
        log('out', `  title       ${meta.title || '—'}`);
        log('out', `  chains      ${meta.chains.join(', ') || '—'}`);
        log('out', `  residues    ${meta.residues}`);
        log('out', `  atoms       ${meta.atoms.toLocaleString()}`);
        log('out', `  resolution  ${meta.resolution ? meta.resolution + ' Å' : '—'}`);
        log('out', `  ligands     ${meta.ligands.length ? meta.ligands.slice(0,8).join(', ') : '—'}`);
        break;
      }
      case 'clear':
        setLogLines([]);
        break;
      default:
        log('err', `command not found: ${head}. type 'help'`);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') { exec(input); setInput(''); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next); setInput(history[next] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < 0) return;
      const next = histIdx + 1;
      if (next >= history.length) { setHistIdx(-1); setInput(''); }
      else { setHistIdx(next); setInput(history[next]); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const m = ALL_COMMANDS.find(c => c.startsWith(input.trim().toLowerCase()));
      if (m) setInput(m + ' ');
    }
  }

  return (
    <div className="th-shell">
      {/* viewer */}
      <div className="th-viewer">
        <div className="th-viewer-head">
          <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
          <span className="th-vfile">{activeModel ? activeModel.file : `rcsb.org / ${pdbId.toLowerCase()}.pdb`}</span>
          <span className={`th-status ${loading ? 'loading' : error ? 'err' : 'ok'}`}>
            {loading ? '● loading' : error ? '● error' : '● ready'}
          </span>
        </div>

        {/* direct PDB input bar */}
        <form className="th-pdb-bar" onSubmit={submitPdbField}>
          <span className="th-pdb-label">PDB</span>
          <input
            className="th-pdb-input"
            value={pdbField}
            onChange={e => setPdbField(e.target.value.toUpperCase().slice(0,4))}
            maxLength={4}
            spellCheck={false}
            placeholder="e.g. 1BTL"
            aria-label="PDB identifier"
          />
          <button type="submit" className="th-pdb-go">load</button>
          <span className="th-pdb-favs-label">favorites:</span>
          <div className="th-pdb-favs">
            {FAV_PDBS.map(f => (
              <button
                type="button"
                key={f.id}
                className={`th-pdb-fav ${!activeModel && pdbId === f.id ? 'on' : ''}`}
                onClick={() => loadPdb(f.id)}
                title={f.note ? `load ${f.id} — ${f.note}` : `load ${f.id}`}
              >
                {f.id}
              </button>
            ))}
          </div>
          {myModels.length > 0 && (
            <>
              <span className="th-pdb-favs-label">my models:</span>
              <div className="th-pdb-favs">
                {myModels.map(m => (
                  <button
                    type="button"
                    key={m.id}
                    className={`th-pdb-fav th-pdb-mine ${activeModel?.id === m.id ? 'on' : ''}`}
                    onClick={() => loadMyModel(m)}
                    title={`load ${m.name}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </form>

        <div className="th-viewer-body">
          <div ref={viewerHostRef} className="th-viewer-canvas" />
          {meta && !loading && (
            <div className="th-meta">
              {meta.local && meta.name && <div className="th-meta-title">{meta.name}</div>}
              {!meta.local && meta.title && <div className="th-meta-title">{meta.title.slice(0, 80)}</div>}
              {meta.local
                ? <div className="th-meta-row"><span>model</span><b>mine</b></div>
                : <div className="th-meta-row"><span>pdb</span><b>{meta.id}</b></div>}
              <div className="th-meta-row"><span>chains</span><b>{meta.chains.join(', ') || '—'}</b></div>
              <div className="th-meta-row"><span>residues</span><b>{meta.residues}</b></div>
              <div className="th-meta-row"><span>atoms</span><b>{meta.atoms.toLocaleString()}</b></div>
              {meta.resolution && <div className="th-meta-row"><span>resolution</span><b>{meta.resolution} Å</b></div>}
              {meta.ligands.length > 0 && <div className="th-meta-row"><span>ligands</span><b>{meta.ligands.slice(0,4).join(', ')}</b></div>}
              {!meta.local && <a className="th-meta-link" href={`https://www.rcsb.org/structure/${meta.id}`} target="_blank" rel="noreferrer">open on rcsb.org ↗</a>}
            </div>
          )}
          <div className="th-controls">
            <div className="th-ctl-group">
              <span className="th-ctl-label">style</span>
              {STYLES.map(s => (
                <button key={s} className={`th-pill ${renderStyle===s?'on':''}`} onClick={() => setRenderStyle(s)}>{s}</button>
              ))}
            </div>
            <div className="th-ctl-group">
              <span className="th-ctl-label">color</span>
              {['spectrum','chain','amber','ssPyMOL'].map(c => (
                <button key={c} className={`th-pill ${colorMode===c?'on':''}`} onClick={() => setColorMode(c)}>{c}</button>
              ))}
            </div>
            <div className="th-ctl-group">
              <button className={`th-pill ${spin?'on':''}`} onClick={() => setSpin(s=>!s)}>↻ spin</button>
              <button className={`th-pill ${measureMode?'on':''}`} onClick={() => {
                setMeasureMode(m => {
                  const next = !m;
                  if (next) log('sys','measure: pick atom 1/2 (click in viewer)');
                  return next;
                });
              }}>⊹ measure</button>
              <button className="th-pill" onClick={() => { viewerRef.current?.zoomTo(); viewerRef.current?.render(); }}>⤢ reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* console */}
      <div className="th-shell-pane">
        <div className="th-shell-head">
          <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
          <span className="th-vfile">console</span>
          <span className="th-shell-hint">try <code>whoami</code> · <code>open sbxat</code> · <code>random</code> · <code>tab</code> complete</span>
        </div>
        <div className="th-log" ref={logRef} onClick={() => { const i = logRef.current?.querySelector('input'); i?.focus(); }}>
          {logLines.map((l, i) => (
            <div key={i} className={`th-line th-${l.kind}`}>{l.text}</div>
          ))}
          <div className="th-line th-input">
            <span className="th-prompt">&gt;</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              placeholder={measureMode ? 'measure mode — click atoms in viewer' : "type 'help'"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function applyStyle(v, style, color) {
  v.setStyle({}, {});
  const colorSpec = (() => {
    if (color === 'spectrum') return { color: 'spectrum' };
    if (color === 'chain') return { colorscheme: 'chainHetatm' };
    if (color === 'ssPyMOL') return { colorscheme: 'ssPyMOL' };
    if (color === 'amber') return { color: '#ffb454' };
    if (color === 'green') return { color: '#7fff95' };
    if (color === 'cyan') return { color: '#7fffd4' };
    return { color: 'spectrum' };
  })();
  if (style === 'cartoon') v.setStyle({ hetflag: false }, { cartoon: colorSpec });
  else if (style === 'stick') v.setStyle({ hetflag: false }, { stick: { ...colorSpec, radius: 0.18 } });
  else if (style === 'sphere') v.setStyle({ hetflag: false }, { sphere: { ...colorSpec, scale: 0.35 } });
  else v.setStyle({ hetflag: false }, { line: colorSpec });

  // Hide ligands, ions, and solvent (HETATM) by default
  v.setStyle({ hetflag: true }, {});
}

function parseMeta(pdb, id) {
  const lines = pdb.split('\n');
  let title = '';
  let resolution = null;
  const chains = new Set();
  const ligands = new Set();
  let atoms = 0;
  const resKey = new Set();
  for (const l of lines) {
    if (l.startsWith('TITLE')) title += ' ' + l.slice(10, 80).trim();
    if (l.startsWith('REMARK   2 RESOLUTION.')) {
      const m = l.match(/(\d+\.\d+)/);
      if (m) resolution = parseFloat(m[1]);
    }
    if (l.startsWith('ATOM') || l.startsWith('HETATM')) {
      atoms++;
      const chain = l[21];
      if (chain && chain !== ' ') chains.add(chain);
      const resi = l.slice(22, 27).trim();
      const resn = l.slice(17, 20).trim();
      resKey.add(`${chain}|${resi}`);
      if (l.startsWith('HETATM') && resn !== 'HOH') ligands.add(resn);
    }
  }
  return {
    id,
    title: title.trim().replace(/\s+/g, ' '),
    chains: [...chains].sort(),
    residues: resKey.size,
    atoms,
    resolution,
    ligands: [...ligands],
  };
}

window.StructureViewer = StructureViewer;
window.applyMolStyle = applyStyle;
