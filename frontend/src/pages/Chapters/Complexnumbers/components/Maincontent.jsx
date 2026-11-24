import React, { useId, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import Tex from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import './Maincontent.css';

const rise = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const tidy = (n) => Math.round(n * 10) / 10;
const complex = (a, b) => `${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}i`;

function ArgandPlane() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const activePointer = useRef(null);
  const id = useId().replace(/:/g, '');
  const ox = 320, oy = 220, scale = 40;
  const x = ox + a * scale, y = oy - b * scale;
  const modulus = Math.hypot(a, b);
  const angle = Math.atan2(b, a) * 180 / Math.PI;
  const quadrant = !a && !b ? 'Origin' : !a ? 'Imaginary axis' : !b ? 'Real axis' : a > 0 && b > 0 ? 'Quadrant I' : a < 0 && b > 0 ? 'Quadrant II' : a < 0 && b < 0 ? 'Quadrant III' : 'Quadrant IV';
  const pointFromPointer = (event) => {
    const svg = event.currentTarget;
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    const local = p.matrixTransform(m.inverse());
    setA(tidy(Math.max(-7, Math.min(7, (local.x - ox) / scale))));
    setB(tidy(Math.max(-5, Math.min(5, (oy - local.y) / scale))));
  };
  return <Motion.section className="pc-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .12 }} variants={rise}>
    <div className="pc-section-head"><div><p className="pc-eyebrow">INTERACTIVE LABORATORY</p><h2>Explore the Argand Plane</h2><p>Drag the glowing point or adjust the sliders to explore complex numbers.</p></div><span className="pc-pill">● Live visualization</span></div>
    <div className="pc-lab">
      <div className="pc-lab-grid">
        <div className="pc-graph-col"><div className="pc-graph">
          <svg viewBox="0 0 640 440" aria-label={`Argand plane: z equals ${complex(a, b)}`} role="img" onPointerDown={e => { if (e.pointerType === 'mouse' && e.button !== 0) return; activePointer.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); pointFromPointer(e); }} onPointerMove={e => { if (activePointer.current === e.pointerId) pointFromPointer(e); }} onPointerUp={e => { if (activePointer.current === e.pointerId) activePointer.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => { activePointer.current = null; }} onLostPointerCapture={() => { activePointer.current = null; }}>
            <defs><marker id={`${id}-arrow`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6Z" fill="#94a3b8" /></marker><radialGradient id={`${id}-glow`}><stop offset="0%" stopColor="#2dd4bf" stopOpacity=".38" /><stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" /></radialGradient></defs>
            {Array.from({ length: 15 }, (_, i) => i - 7).map(n => <g key={`x${n}`}><line x1={ox + n * scale} x2={ox + n * scale} y1="18" y2="422" stroke="#243247" />{n !== 0 && <text x={ox + n * scale} y={oy + 20} textAnchor="middle" fill="#718198" fontSize="12">{n}</text>}</g>)}
            {Array.from({ length: 11 }, (_, i) => i - 5).map(n => <g key={`y${n}`}><line x1="18" x2="622" y1={oy - n * scale} y2={oy - n * scale} stroke="#243247" />{n !== 0 && <text x={ox - 12} y={oy - n * scale + 4} textAnchor="end" fill="#718198" fontSize="12">{n}</text>}</g>)}
            <line x1="18" y1={oy} x2="625" y2={oy} stroke="#94a3b8" strokeWidth="1.8" markerEnd={`url(#${id}-arrow)`} /><line x1={ox} y1="422" x2={ox} y2="15" stroke="#94a3b8" strokeWidth="1.8" markerEnd={`url(#${id}-arrow)`} />
            <text x="570" y={oy - 13} fill="#2dd4bf" fontSize="14">Real</text><text x={ox + 14} y="28" fill="#a78bfa" fontSize="14">Imaginary</text><text x={ox + 8} y={oy + 17} fill="#94a3b8" fontSize="12">O</text>
            <line x1={x} y1={y} x2={x} y2={oy} stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6 6" /><line x1={ox} y1={y} x2={x} y2={y} stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 6" /><line x1={ox} y1={oy} x2={x} y2={y} stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" /><circle cx={x} cy={y} r="29" fill={`url(#${id}-glow)`} /><circle cx={x} cy={y} r="8" fill="#2dd4bf" stroke="#ccfbf1" strokeWidth="2.5" /><text x={x + (a >= 0 ? 17 : -17)} y={y - 16} textAnchor={a >= 0 ? 'start' : 'end'} fill="#fff" fontWeight="bold" fontSize="17">z</text>
          </svg>
        </div><div className="pc-legend"><span><i className="pc-dot pc-teal" /> Real part</span><span><i className="pc-dot pc-purple" /> Imaginary part</span><span><i className="pc-line" /> Modulus vector</span></div></div>
        <div className="pc-controls"><div className="pc-current"><small>CURRENT COMPLEX NUMBER</small><strong>z = <em>{complex(a, b)}</em></strong><span>Coordinates ({a}, {b})</span></div>
          <div className="pc-slider-block"><label htmlFor={`${id}-a`}>Real part (a) <b>{a}</b></label><input id={`${id}-a`} className="pc-real-slider" type="range" min="-7" max="7" step="0.1" value={a} onChange={e => setA(Number(e.target.value))} /><div className="pc-range-labels"><span>−7</span><span>0</span><span>7</span></div></div>
          <div className="pc-slider-block"><label htmlFor={`${id}-b`}>Imaginary part (b) <b>{b}</b></label><input id={`${id}-b`} className="pc-imag-slider" type="range" min="-5" max="5" step="0.1" value={b} onChange={e => setB(Number(e.target.value))} /><div className="pc-range-labels"><span>−5</span><span>0</span><span>5</span></div></div>
          <div className="pc-results"><div><span>Modulus |z|</span><strong>{modulus.toFixed(2)}</strong></div><div><span>Argument θ</span><strong>{modulus === 0 ? 'Undefined' : `${angle.toFixed(1)}°`}</strong></div><div><span>Conjugate</span><strong>{complex(a, -b)}</strong></div><div><span>Location</span><strong className="pc-accent">{quadrant}</strong></div></div>
          <button className="pc-reset" type="button" onClick={() => { setA(3); setB(2) }}>↺ Reset visualization</button>
        </div>
      </div><div className="pc-remember"><b>Remember:</b> The horizontal coordinate is the real part and the vertical coordinate is the imaginary coefficient. Their distance from the origin is the modulus.</div>
    </div>
  </Motion.section>;
}

export default function Maincontent({ id, modules = [] }) {
  const chapter = modules[id];
  if (!chapter) return <div className="pc-page"><div className="pc-container">Chapter not found</div></div>;
  return <main className="pc-page"><div className="pc-ambient pc-ambient-a" /><div className="pc-ambient pc-ambient-b" /><div className="pc-container">
    <Motion.header className="pc-header" initial="hidden" animate="visible" variants={rise}>
      <div className="pc-breadcrumb"><b>PENCILCOPY</b><span>/</span><span>MATHEMATICS</span></div><span className="pc-pill">● Chapter study</span><h1>{chapter.title}</h1><p className="pc-description">{chapter.description}</p>
      <div className="pc-metadata"><div><small>DURATION</small><strong>{chapter.duration}</strong></div><div><small>DIFFICULTY</small><strong>{chapter.difficulty}</strong></div></div>
      <div className="pc-hero"><small>THE FUNDAMENTAL FORM</small><div>z = a + <span>bi</span></div><p>Every complex number combines a real part and an imaginary part — and can be plotted as a point.</p></div>
    </Motion.header>
    <ArgandPlane />
    <section className="pc-section" aria-labelledby="pc-concepts-heading"><div className="pc-section-head"><div><p className="pc-eyebrow pc-purple-text">LEARNING MATERIAL</p><h2 id="pc-concepts-heading">Understand the concepts</h2><p>Build your understanding, one concept at a time.</p></div></div>
      <div className="pc-concept-list">{chapter.concepts?.map((concept, index) => <Motion.article className="pc-concept" key={index} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .08 }} variants={rise}><div className="pc-concept-title"><div className="pc-number">{String(index + 1).padStart(2, '0')}</div><div><h3>{concept.heading}</h3><small>CONCEPT {String(index + 1).padStart(2, '0')}</small></div></div><div className="pc-paragraphs">{concept.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}</div>{concept.insight && <p className="pc-remember">{concept.insight}</p>}{concept.equations?.length > 0 && <div className="pc-equations">{concept.equations.map((e, i) => <div className="pc-equation" key={i}><Tex math={e.latex} block /></div>)}</div>}</Motion.article>)}</div>
    </section>
    {!chapter.concepts?.length && <p className="pc-remember">This module is being prepared. Explore the interactive plane above or practise in the Problem Arena.</p>}
    {chapter.examples?.length > 0 && <section className="pc-section"><h2>Worked examples</h2>{chapter.examples.map((example,i)=><article className="pc-concept" key={i}><h3>{example.question}</h3>{example.steps?.map((step,j)=><p key={j}>{step}</p>)}<p className="pc-remember">{example.answer}</p></article>)}</section>}
    <footer className="pc-footer"><span>PENCILCOPY · Learn by understanding</span><span>Mathematics / Complex numbers</span></footer>
  </div></main>;
}
