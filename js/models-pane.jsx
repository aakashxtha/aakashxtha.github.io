// Models pane — .pdb files bundled in /site/models/
// Split view: compact list on left, rich 3D viewer on right

const TYPE_LABELS = { protein: 'protein', polymer: 'polymer', nucleic: 'nucleic', composite: 'composite' };

function ModelsPane({ initialModelId = null, onInitialModelApplied }) {
  const models = window.PROFILE.models || [];
  const [selectedId, setSelectedId] = React.useState(
    initialModelId || models[0]?.id || null
  );
  const selected = models.find(m => m.id === selectedId) || null;

  React.useEffect(() => {
    if (!initialModelId) return;
    if (models.some(m => m.id === initialModelId)) {
      setSelectedId(initialModelId);
    }
    onInitialModelApplied?.();
  }, [initialModelId]);

  return (
    <section className="pane models-pane">
      <div className="pane-head">
        <h2>Models</h2>
        <span className="pane-sub">Structures and designs · {models.length} entries</span>
      </div>

      <div className="models-split">
        <ul className="models-list">
          {models.map((m, i) => (
            <li
              key={m.id}
              className={`models-row ${selectedId === m.id ? 'on' : ''}`}
              onClick={() => setSelectedId(m.id)}
            >
              <div className="models-row-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="models-row-body">
                <div className="models-row-name">{m.name}</div>
                {m.type && <span className={`models-type-badge type-${m.type}`}>{TYPE_LABELS[m.type]}</span>}
              </div>
              <div className="models-row-arrow">›</div>
            </li>
          ))}
        </ul>

        <div className="models-viewer-col">
          {selected
            ? <ModelViewer key={selected.id} model={selected} />
            : <div className="models-empty">Select a model from the list to view.</div>}
        </div>
      </div>
    </section>
  );
}

function ModelViewer({ model }) {
  const hostRef = React.useRef(null);
  const viewerRef = React.useRef(null);
  const [renderStyle, setRenderStyle] = React.useState(model.defaultStyle || 'stick');
  const [colorMode, setColorMode] = React.useState('spectrum');
  const [spin, setSpin] = React.useState(true);
  const [meta, setMeta] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // init viewer
  React.useEffect(() => {
    if (!window.$3Dmol || !hostRef.current) return;
    const v = window.$3Dmol.createViewer(hostRef.current, {
      backgroundColor: 'rgba(0,0,0,0)',
      antialias: true,
    });
    viewerRef.current = v;
    return () => { try { v.clear(); } catch (e) {} };
  }, []);

  // load PDB
  React.useEffect(() => {
    const v = viewerRef.current;
    if (!v || !model) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMeta(null);
    v.clear();
    fetch(model.file)
      .then(r => {
        if (!r.ok) throw new Error(`couldn't load ${model.file}`);
        return r.text();
      })
      .then(text => {
        if (cancelled) return;
        v.addModel(text, 'pdb');
        window.applyMolStyle(v, renderStyle, colorMode);
        v.zoomTo();
        v.render();
        if (spin) v.spin('y', 0.4);
        setMeta(parseModelMeta(text));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [model]);

  // restyle
  React.useEffect(() => {
    const v = viewerRef.current;
    if (!v || loading) return;
    window.applyMolStyle(v, renderStyle, colorMode);
    v.render();
  }, [renderStyle, colorMode, loading]);

  React.useEffect(() => {
    const v = viewerRef.current;
    if (!v || loading) return;
    if (spin) v.spin('y', 0.4); else v.spin(false);
  }, [spin, loading]);

  return (
    <div className="model-viewer">
      <div className="model-viewer-head">
        <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
        <span className="th-vfile">{model.file}</span>
        <span className={`th-status ${loading ? 'loading' : error ? 'err' : 'ok'}`}>
          {loading ? '● loading' : error ? '● error' : '● ready'}
        </span>
      </div>
      <div className="model-viewer-body">
        {loading && !error && (
          <div className="model-loading">
            <div className="model-loading-spinner" />
            <div className="model-loading-text">loading {model.file.split('/').pop()}</div>
          </div>
        )}
        <div ref={hostRef} className="model-viewer-canvas" />
        {error && (
          <div className="model-error">
            <div className="model-error-title">missing file</div>
            <div className="model-error-msg">{error}</div>
            <div className="model-error-hint">
              expected at <code>{model.file}</code>
            </div>
          </div>
        )}
        {!error && (
          <div className="th-meta model-meta">
            <div className="model-meta-header">
              <div className="th-meta-title">{model.name}</div>
              {model.origin && <div className="model-meta-origin">{model.origin}</div>}
            </div>
            {model.desc && <div className="model-meta-desc">{model.desc}</div>}
            {meta && (
              <div className="model-meta-stats">
                <div className="th-meta-row"><span>chains</span><b>{meta.chains.join(', ') || '—'}</b></div>
                <div className="th-meta-row"><span>residues</span><b>{meta.residues}</b></div>
                <div className="th-meta-row"><span>atoms</span><b>{meta.atoms.toLocaleString()}</b></div>
              </div>
            )}
          </div>
        )}
        <div className="th-controls model-controls">
          <div className="th-ctl-group">
            <span className="th-ctl-label">style</span>
            {['cartoon','stick','sphere','line'].map(s => (
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
            <button className="th-pill" onClick={() => { viewerRef.current?.zoomTo(); viewerRef.current?.render(); }}>⤢ reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseModelMeta(pdb) {
  const lines = pdb.split('\n');
  const chains = new Set();
  const resKey = new Set();
  let atoms = 0;
  for (const l of lines) {
    if (l.startsWith('ATOM') || l.startsWith('HETATM')) {
      atoms++;
      const chain = l[21];
      if (chain && chain !== ' ') chains.add(chain);
      const resi = l.slice(22, 27).trim();
      resKey.add(`${chain}|${resi}`);
    }
  }
  return { chains: [...chains].sort(), residues: resKey.size, atoms };
}

window.ModelsPane = ModelsPane;


