// Motion primitives + the hero protein figure.
// Everything here degrades to a static render under prefers-reduced-motion.

const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function useInView({ rootMargin = '0px 0px -10% 0px', once = true } = {}) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); if (once) io.disconnect(); }
      else if (!once) setSeen(false);
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

// Fade-and-rise on first view
function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag ref={ref} className={`rv ${seen ? 'in' : ''} ${className}`} style={{ ...style, '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

// Defer heavy children (WebGL viewers) until they are near the viewport
function Lazy({ minHeight, children }) {
  const [ref, seen] = useInView({ rootMargin: '700px 0px' });
  return <div ref={ref} style={seen ? null : { minHeight }}>{seen ? children : null}</div>;
}

// Words rise out of a mask. `parts` = ['plain text', { em: 'italic text' }, ...]
function MaskText({ parts, as: Tag = 'h2', className = '', delay = 0, stagger = 38 }) {
  const [ref, seen] = useInView();
  let idx = 0;
  const nodes = [];
  parts.forEach((part, pi) => {
    const isEm = typeof part === 'object';
    const text = isEm ? part.em : part;
    text.split(/(\s+)/).forEach((w, wi) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { nodes.push(' '); return; }
      const inner = <span className="mw-i" style={{ '--i': idx++ }}>{w}</span>;
      nodes.push(
        <span key={`${pi}-${wi}`} className={`mw ${isEm ? 'mw-em' : ''}`}>
          {isEm ? <em>{inner}</em> : inner}
        </span>
      );
    });
  });
  const label = parts.map(p => (typeof p === 'object' ? p.em : p)).join('');
  return (
    <Tag ref={ref} aria-label={label} className={`mask ${seen ? 'in' : ''} ${className}`}
      style={{ '--d0': `${delay}ms`, '--st': `${stagger}ms` }}>
      <span aria-hidden="true">{nodes}</span>
    </Tag>
  );
}

// Mono label that decodes itself — nucleotides and terminal glyphs, then the real text
const GLYPHS = 'ACGTU#%*+=<>/\\01';
function Scramble({ text, className = '', delay = 0 }) {
  const [ref, seen] = useInView();
  const [out, setOut] = React.useState(text);
  const [armed, setArmed] = React.useState(!REDUCED_MOTION);
  React.useEffect(() => {
    if (!seen || REDUCED_MOTION) return;
    let raf, t0;
    const dur = 520 + text.length * 14;
    const tick = (t) => {
      if (!t0) t0 = t + delay;
      const k = Math.max(0, (t - t0) / dur);
      const settled = Math.floor(k * text.length);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (i < settled || c === ' ' || c === '—' || c === '·') s += c;
        else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      setArmed(false);
      if (k < 1) raf = requestAnimationFrame(tick); else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);
  return <span ref={ref} className={`scr ${armed ? 'armed' : ''} ${className}`} aria-label={text}><span aria-hidden="true">{out}</span></span>;
}

// "~3 µs" → counts 0→3 keeping "~" and " µs". Leaves non-numeric values untouched.
function CountUp({ value, duration = 1500 }) {
  const str = String(value);
  const m = str.match(/^([~>≈<]?\s?)(\d+(?:\.\d+)?)(.*)$/);
  const [ref, seen] = useInView();
  const target = m ? parseFloat(m[2]) : 0;
  const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;
  const [n, setN] = React.useState(REDUCED_MOTION || !m ? target : 0);
  React.useEffect(() => {
    if (!m || !seen || REDUCED_MOTION) return;
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / duration);
      setN(target * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);
  if (!m) return <span>{str}</span>;
  return <span ref={ref}>{m[1]}{n.toFixed(decimals)}{m[3]}</span>;
}

// Paragraph whose words light up as it scrolls through the viewport
function ScrubText({ text, className = '' }) {
  const ref = React.useRef(null);
  const words = React.useMemo(() => text.split(/\s+/), [text]);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll('.sw');
    if (REDUCED_MOTION) { spans.forEach(s => s.classList.add('lit')); return; }
    let raf = 0, last = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const k = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (r.height + vh * 0.25)));
      const lit = Math.round(k * spans.length);
      if (lit === last) return;
      spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
      last = lit;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [words]);
  return (
    <p ref={ref} className={`scrub ${className}`}>
      {words.map((w, i) => <React.Fragment key={i}><span className="sw">{w}</span>{' '}</React.Fragment>)}
    </p>
  );
}

function Marquee({ items }) {
  const row = items.map((it, i) => (
    <span key={i} className="mq-item">{it}<i className="mq-sep" aria-hidden="true" /></span>
  ));
  return (
    <div className="mq" aria-hidden="true">
      <div className="mq-track" style={{ '--mq-dur': `${Math.max(40, items.length * 3.2)}s` }}>
        <div className="mq-row">{row}</div>
        <div className="mq-row">{row}</div>
      </div>
    </div>
  );
}

function LocalTime({ tz = 'America/New_York' }) {
  const fmt = () => {
    try {
      return new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' });
    } catch (e) { return ''; }
  };
  const [t, setT] = React.useState(fmt);
  React.useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return <span>{t}</span>;
}

/* ------------------------------------------------------------------
   ProteinCloud — the hero figure.
   Parses a local PDB, draws heavy atoms as a depth-shaded point cloud
   with a faint Cα trace, and animates the chain folding from an
   extended strand into the designed structure. Drag rotates; hovering
   picks out the nearest residue.
------------------------------------------------------------------- */
function ProteinCloud({ src, onStats }) {
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const angleRef = React.useRef(null);
  const [hover, setHover] = React.useState(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    let mol = null;
    let raf = 0, running = true, visible = true;
    let tStart = 0;

    const view = {
      yaw: -0.6, pitch: 0.18,
      dragYaw: 0, dragPitch: 0, vYaw: 0, vPitch: 0,
      mx: 0, my: 0, tmx: 0, tmy: 0,
      dragging: false, lx: 0, ly: 0,
      px: -1, py: -1, hoverRes: -1,
    };

    function resize() {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    function parse(text) {
      const xs = [], ys = [], zs = [], res = [], isBB = [];
      const residues = []; // { resn, resi, chain, ca: atomIndex, atoms: [] }
      let cur = null;
      for (const l of text.split('\n')) {
        if (!l.startsWith('ATOM')) continue;
        const name = l.slice(12, 16).trim();
        const el = (l.slice(76, 78).trim() || name[0]).toUpperCase();
        if (el === 'H') continue;
        const resi = parseInt(l.slice(22, 26), 10);
        const chain = l[21];
        if (!cur || cur.resi !== resi || cur.chain !== chain) {
          cur = { resn: l.slice(17, 20).trim(), resi, chain, ca: -1, atoms: [] };
          residues.push(cur);
        }
        const i = xs.length;
        xs.push(+l.slice(30, 38)); ys.push(+l.slice(38, 46)); zs.push(+l.slice(46, 54));
        res.push(residues.length - 1);
        isBB.push(name === 'N' || name === 'CA' || name === 'C' || name === 'O');
        if (name === 'CA') cur.ca = i;
        cur.atoms.push(i);
      }
      const n = xs.length;
      let cx = 0, cy = 0, cz = 0;
      for (let i = 0; i < n; i++) { cx += xs[i]; cy += ys[i]; cz += zs[i]; }
      cx /= n; cy /= n; cz /= n;
      let R = 0;
      for (let i = 0; i < n; i++) {
        xs[i] -= cx; ys[i] -= cy; zs[i] -= cz;
        R = Math.max(R, Math.hypot(xs[i], ys[i], zs[i]));
      }
      const nat = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { nat[i * 3] = xs[i] / R; nat[i * 3 + 1] = ys[i] / R; nat[i * 3 + 2] = zs[i] / R; }

      // Unfolded start: residues strung along a loose helix, side chains kept near their Cα
      const N = residues.length;
      const start = new Float32Array(n * 3);
      residues.forEach((r, k) => {
        const u = N > 1 ? k / (N - 1) : 0.5;
        const sx = (u - 0.5) * 3.2;
        const sy = 0.16 * Math.sin(u * Math.PI * 7) + 0.05 * Math.sin(u * 61);
        const sz = 0.16 * Math.cos(u * Math.PI * 7);
        const ca = r.ca >= 0 ? r.ca : r.atoms[0];
        for (const a of r.atoms) {
          start[a * 3] = sx + (nat[a * 3] - nat[ca * 3]) * 0.45;
          start[a * 3 + 1] = sy + (nat[a * 3 + 1] - nat[ca * 3 + 1]) * 0.45;
          start[a * 3 + 2] = sz + (nat[a * 3 + 2] - nat[ca * 3 + 2]) * 0.45;
        }
      });
      const delay = new Float32Array(n);
      for (let i = 0; i < n; i++) delay[i] = (res[i] / Math.max(1, N - 1));
      return {
        n, nat, start, delay, res: Int32Array.from(res), residues,
        bb: Uint8Array.from(isBB),
        cas: residues.map(r => r.ca).filter(i => i >= 0),
        screen: new Float32Array(n * 2), depth: new Float32Array(n),
        buckets: Array.from({ length: 20 }, () => []), // [side chain ×10 depths, backbone ×10 depths]
      };
    }

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function frame(now) {
      raf = 0;
      if (!running || !visible || !mol) return;
      if (!tStart) tStart = now;
      const t = now - tStart;

      // camera
      view.mx += (view.tmx - view.mx) * 0.05;
      view.my += (view.tmy - view.my) * 0.05;
      if (!view.dragging) {
        view.dragYaw += view.vYaw; view.dragPitch += view.vPitch;
        view.vYaw *= 0.94; view.vPitch *= 0.94;
        view.dragPitch *= 0.985; // ease back toward the resting tilt
      }
      if (!REDUCED_MOTION) view.yaw += 0.0016;
      const yaw = view.yaw + view.dragYaw + view.mx * 0.35;
      const pitch = Math.max(-1.2, Math.min(1.2, view.pitch + view.dragPitch + view.my * 0.22));
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);

      const D = 3.6;
      const S = Math.min(W, H) * 0.47 * dpr;
      const ox = W * dpr * 0.5, oy = H * dpr * 0.5;
      const { n, nat, start, delay, screen, depth, buckets, bb } = mol;
      const FOLD_DELAY = 350, SPREAD = 1300, DUR = 1500;
      const folding = !REDUCED_MOTION && t < FOLD_DELAY + SPREAD + DUR;

      for (const b of buckets) b.length = 0;
      for (let i = 0; i < n; i++) {
        let x, y, z;
        if (folding) {
          const k = ease(Math.min(1, Math.max(0, (t - FOLD_DELAY - delay[i] * SPREAD) / DUR)));
          const j = i * 3;
          x = start[j] + (nat[j] - start[j]) * k;
          y = start[j + 1] + (nat[j + 1] - start[j + 1]) * k;
          z = start[j + 2] + (nat[j + 2] - start[j + 2]) * k;
        } else {
          x = nat[i * 3]; y = nat[i * 3 + 1]; z = nat[i * 3 + 2];
        }
        const x1 = x * cyw + z * syw;
        const z1 = -x * syw + z * cyw;
        const y2 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp;
        const p = D / (D - z2);
        screen[i * 2] = ox + x1 * S * p;
        screen[i * 2 + 1] = oy - y2 * S * p;
        const d = Math.min(1, Math.max(0, (z2 + 1.1) / 2.2));
        depth[i] = d;
        buckets[(bb[i] ? 10 : 0) + Math.min(9, (d * 10) | 0)].push(i);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cα trace, split into three depth bands so the near strands read brighter
      ctx.lineWidth = 1.1 * dpr;
      ctx.lineCap = 'round';
      for (let band = 0; band < 3; band++) {
        ctx.strokeStyle = `rgba(255,190,110,${[0.08, 0.2, 0.42][band]})`;
        ctx.beginPath();
        const cas = mol.cas;
        for (let k = 1; k < cas.length; k++) {
          const a = cas[k - 1], c = cas[k];
          const dd = (depth[a] + depth[c]) / 2;
          if (Math.min(2, (dd * 3) | 0) !== band) continue;
          ctx.moveTo(screen[a * 2], screen[a * 2 + 1]);
          ctx.lineTo(screen[c * 2], screen[c * 2 + 1]);
        }
        ctx.stroke();
      }

      // atoms, back to front: dim side chains, then the brighter backbone
      for (let b = 0; b < 20; b++) {
        const list = buckets[b];
        if (!list.length) continue;
        const isBackbone = b >= 10;
        const d = ((b % 10) + 0.5) / 10;
        const r = (isBackbone ? 0.7 + d * 1.5 : 0.45 + d * 0.95) * dpr;
        const a = isBackbone ? 0.18 + d * 0.82 : 0.07 + d * 0.48;
        ctx.fillStyle = `rgba(255,${(150 + d * 45) | 0},${(70 + d * 50) | 0},${a.toFixed(3)})`;
        ctx.beginPath();
        for (const i of list) {
          const x = screen[i * 2], y = screen[i * 2 + 1];
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // hover pick (only when settled and not dragging)
      if (!folding && !view.dragging && view.px >= 0) {
        let best = -1, bd = (16 * dpr) ** 2;
        const px = view.px * dpr, py = view.py * dpr;
        for (let i = 0; i < n; i++) {
          const dx = screen[i * 2] - px, dy = screen[i * 2 + 1] - py;
          const dd = dx * dx + dy * dy;
          if (dd < bd && depth[i] > 0.35) { bd = dd; best = i; }
        }
        const ri = best >= 0 ? mol.res[best] : -1;
        if (ri !== view.hoverRes) {
          view.hoverRes = ri;
          const r = mol.residues[ri];
          setHover(r ? { resn: r.resn, resi: r.resi, chain: r.chain, atoms: r.atoms.length } : null);
        }
      } else if (view.hoverRes !== -1 && (view.px < 0 || view.dragging)) {
        view.hoverRes = -1; setHover(null);
      }

      if (view.hoverRes >= 0) {
        const r = mol.residues[view.hoverRes];
        ctx.fillStyle = '#7fffd4';
        ctx.beginPath();
        for (const i of r.atoms) {
          const x = screen[i * 2], y = screen[i * 2 + 1], rr = 2.4 * dpr;
          ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, Math.PI * 2);
        }
        ctx.fill();
        const a = r.ca >= 0 ? r.ca : r.atoms[0];
        const ax = screen[a * 2], ay = screen[a * 2 + 1];
        const lx = ax + 34 * dpr, ly = ay - 30 * dpr;
        ctx.strokeStyle = 'rgba(127,255,212,0.7)';
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lx, ly); ctx.lineTo(lx + 8 * dpr, ly); ctx.stroke();
        ctx.font = `${11 * dpr}px "JetBrains Mono", monospace`;
        ctx.fillStyle = '#7fffd4';
        ctx.fillText(`${r.resn} ${r.resi}`, lx + 12 * dpr, ly + 4 * dpr);
      }

      if (angleRef.current && ((t / 16) | 0) % 4 === 0) {
        const deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
        angleRef.current.textContent = `θ ${deg.toFixed(1).padStart(5, '0')}°  φ ${(pitch * 180 / Math.PI).toFixed(1)}°`;
      }

      raf = requestAnimationFrame(frame);
    }

    const kick = () => { if (!raf && running && visible && mol) raf = requestAnimationFrame(frame); };

    // pointer
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      view.tmx = Math.max(-1, Math.min(1, (x / r.width) * 2 - 1));
      view.tmy = Math.max(-1, Math.min(1, (y / r.height) * 2 - 1));
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      view.px = inside && e.pointerType !== 'touch' ? x : -1;
      view.py = inside ? y : -1;
      if (view.dragging) {
        const dx = e.clientX - view.lx, dy = e.clientY - view.ly;
        view.lx = e.clientX; view.ly = e.clientY;
        view.vYaw = dx * 0.006; view.vPitch = dy * 0.004;
        view.dragYaw += view.vYaw; view.dragPitch += view.vPitch;
      }
    };
    const onDown = (e) => {
      view.dragging = true; view.lx = e.clientX; view.ly = e.clientY;
      wrap.classList.add('grabbing');
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const onUp = () => { view.dragging = false; wrap.classList.remove('grabbing'); };
    const onLeave = () => { view.px = -1; view.py = -1; view.tmx = 0; view.tmy = 0; };

    window.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
    io.observe(wrap);
    const onVis = () => { running = !document.hidden; kick(); };
    document.addEventListener('visibilitychange', onVis);

    let cancelled = false;
    fetch(src)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(text => {
        if (cancelled) return;
        mol = parse(text);
        onStats && onStats({ atoms: mol.n, residues: mol.residues.length });
        setReady(true);
        kick();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`pc ${ready ? 'ready' : ''}`}>
      <canvas ref={canvasRef} className="pc-canvas" aria-label="Interactive point-cloud rendering of a designed TEM-1 β-lactamase. Drag to rotate." role="img" />
      <div className="pc-readout" aria-live="polite">
        {hover
          ? <><span className="pc-hl">{hover.resn} {hover.resi}</span> · chain {hover.chain} · {hover.atoms} heavy atoms</>
          : <span className="pc-hint">drag to rotate · hover to inspect a residue</span>}
      </div>
      <div className="pc-angle" ref={angleRef} aria-hidden="true">θ 000.0°  φ 0.0°</div>
    </div>
  );
}

Object.assign(window, { REDUCED_MOTION, useInView, Reveal, Lazy, MaskText, Scramble, CountUp, ScrubText, Marquee, LocalTime, ProteinCloud });
