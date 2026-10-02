// Structures section — local .pdb models in /models, list + live 3Dmol viewer

const TYPE_LABELS = { protein: 'protein', polymer: 'polymer', nucleic: 'nucleic acid', composite: 'composite' };

function Structures({ focus }) {
  const models = window.PROFILE.models || [];
  const [selectedId, setSelectedId] = React.useState(models[0]?.id || null);
  const selected = models.find(m => m.id === selectedId) || null;
  const idx = models.findIndex(m => m.id === selectedId);

  React.useEffect(() => {
    if (focus && models.some(m => m.id === focus.id)) setSelectedId(focus.id);
  }, [focus]);

  return (
    <section id="structures" className="sec" data-section="structures">
      <div className="wrap">
        <SectionHead
          num="03"
          label="Structures"
          title={['Models from the bench, ', { em: 'rendered live.' }]}
          aside="Systems I built for simulation, from a designed enzyme to cellulose–graphene composites. Pick one; drag to rotate, scroll to zoom."
        />

        <div className="st-grid">
          <ol className="st-list">
            {models.map((m, i) => (
              <li key={m.id}>
                <button
                  className={`st-row ${selectedId === m.id ? 'on' : ''}`}
                  aria-pressed={selectedId === m.id}
                  onClick={() => setSelectedId(m.id)}
                >
                  <span className="st-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="st-name">{m.name}</span>
                  <span className="st-type">{TYPE_LABELS[m.type] || m.type}</span>
                </button>
              </li>
            ))}
          </ol>

          <figure className="st-fig">
            <Lazy minHeight={560}>
              {selected && <ModelViewer key={selected.id} model={selected} />}
            </Lazy>
            {selected && (
              <figcaption className="fig-cap">
                <span className="cap-no">Fig. 3.{idx + 1}</span>
                <span><b>{selected.name}.</b> {selected.desc} <span className="cap-origin">{selected.origin}</span></span>
              </figcaption>
            )}
          </figure>
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
  const [spin, setSpin] = React.useState(!REDUCED_MOTION);
  const [meta, setMeta] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!window.$3Dmol || !hostRef.current) return;
    const v = window.$3Dmol.createViewer(hostRef.current, { backgroundColor: 'rgba(0,0,0,0)', antialias: true });
    viewerRef.current = v;
    return () => { try { v.clear(); } catch (e) {} };
  }, []);

  React.useEffect(() => {
    const v = viewerRef.current;
    if (!v || !model) return;
    let cancelled = false;
    setLoading(true); setError(null); setMeta(null);
    v.clear();
    fetch(model.file)
      .then(r => { if (!r.ok) throw new Error(`couldn't load ${model.file}`); return r.text(); })
      .then(text => {
        if (cancelled) return;
        v.addModel(text, 'pdb');
        window.applyMolStyle(v, renderStyle, colorMode);
        v.zoomTo(); v.render();
        if (spin) v.spin('y', 0.4);
        setMeta(parseModelMeta(text));
        setLoading(false);
      })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [model]);

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
    <div className="mv">
      <div className="mv-head">
        <span className="mv-file">{model.file}</span>
        <span className={`status ${loading ? 'loading' : error ? 'err' : 'ok'}`}>
          {loading ? 'loading' : error ? 'error' : 'ready'}
        </span>
      </div>
      <div className="mv-body">
        {loading && !error && (
          <div className="mv-loading">
            <span className="bar" />
            <span>reading {model.file.split('/').pop()}</span>
          </div>
        )}
        <div ref={hostRef} className="mv-canvas" />
        {error && (
          <div className="mv-error">
            <b>missing file</b>
            <span>{error}</span>
          </div>
        )}
        {meta && (
          <dl className="hud-meta">
            <div><dt>chains</dt><dd>{meta.chains.join(', ') || '—'}</dd></div>
            <div><dt>residues</dt><dd>{meta.residues.toLocaleString()}</dd></div>
            <div><dt>atoms</dt><dd>{meta.atoms.toLocaleString()}</dd></div>
          </dl>
        )}
        <ViewerControls
          style={renderStyle} setStyle={setRenderStyle}
          color={colorMode} setColor={setColorMode}
          spin={spin} setSpin={setSpin}
          onReset={() => { viewerRef.current?.zoomTo(); viewerRef.current?.render(); }}
        />
      </div>
    </div>
  );
}

// Shared control strip for both 3D viewers
function ViewerControls({ style, setStyle, color, setColor, spin, setSpin, onReset, extra }) {
  return (
    <div className="vc">
      <div className="vc-g">
        <span className="vc-k">style</span>
        {['cartoon', 'stick', 'sphere', 'line'].map(s => (
          <button key={s} className={`vc-b ${style === s ? 'on' : ''}`} onClick={() => setStyle(s)}>{s}</button>
        ))}
      </div>
      <div className="vc-g">
        <span className="vc-k">color</span>
        {['spectrum', 'chain', 'amber', 'ssPyMOL'].map(c => (
          <button key={c} className={`vc-b ${color === c ? 'on' : ''}`} onClick={() => setColor(c)}>{c}</button>
        ))}
      </div>
      <div className="vc-g">
        <button className={`vc-b ${spin ? 'on' : ''}`} onClick={() => setSpin(s => !s)}>spin</button>
        {extra}
        <button className="vc-b" onClick={onReset}>reset</button>
      </div>
    </div>
  );
}

function parseModelMeta(pdb) {
  const chains = new Set();
  const resKey = new Set();
  let atoms = 0;
  for (const l of pdb.split('\n')) {
    if (l.startsWith('ATOM') || l.startsWith('HETATM')) {
      atoms++;
      const chain = l[21];
      if (chain && chain !== ' ') chains.add(chain);
      resKey.add(`${chain}|${l.slice(22, 27).trim()}`);
    }
  }
  return { chains: [...chains].sort(), residues: resKey.size, atoms };
}

Object.assign(window, { Structures, ModelViewer, ViewerControls });
