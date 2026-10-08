import React, { useCallback, useEffect, useRef, useState } from "react";
import projects from "../retro/projects";
import { STEPS, FRONTEND, ALSO_RUNNING, HISTORY } from "../gavenos/content";
import { useFlatMode } from "../shared/motion";
import DeskScene from "./DeskScene";
import "./toybox.scss";

// Toybox: the GavenOS 2000 story drawn as chunky cartoon toys. Scroll to build the PC
// on an isometric desk, then load projects from CDs. No three.js; it's all SVG + CSS.

const HEADER_H = 80;
const STEP_BUBBLES = ['', '+ Processor', '+ Cooling', '+ Memory', '+ Graphics', '+ CD-ROM', 'Case closed!', ''];
const WALLET = [[205, 190], [290, 190], [205, 275], [290, 275]];
const DRIVE_BAY = [618, 371];

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (x) => x * x * (3 - 2 * x);
const backOut = (x) => (x <= 0 ? 0 : 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2));

function useScrollProgress(enabled) {
    const trackRef = useRef(null);
    const stageRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!enabled) return undefined;
        let raf = 0;
        const read = () => {
            raf = 0;
            const track = trackRef.current;
            const stage = stageRef.current;
            if (!track || !stage) return;
            const r = track.getBoundingClientRect();
            const total = r.height - stage.clientHeight;
            const next = total > 0 ? clamp((HEADER_H - r.top) / total, 0, 1) : 0;
            setProgress((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
        };
        const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
        window.addEventListener('scroll', onScroll, { passive: true, capture: true });
        window.addEventListener('resize', onScroll);
        read();
        return () => {
            window.removeEventListener('scroll', onScroll, { capture: true });
            window.removeEventListener('resize', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [enabled]);

    return { trackRef, stageRef, progress };
}

// Where every part of the desk sits for a given scroll progress p (0..1).
function sceneStyles(p) {
    const seg = (a, b) => clamp((p - a) / (b - a), 0, 1);
    const ease = { transition: 'transform 120ms linear, opacity 120ms linear' };
    const drop = (a, b) => ({ ...ease, transform: `translate(0px, ${(-(1 - backOut(seg(a, b))) * 240).toFixed(1)}px)`, opacity: p > a ? 1 : 0 });
    const slide = (a, b, dx, dy) => {
        const k = smooth(seg(a, b));
        return { ...ease, transform: `translate(${((1 - k) * dx).toFixed(1)}px, ${((1 - k) * dy).toFixed(1)}px)`, opacity: p > a ? 1 : 0 };
    };

    // camera: close on the open tower first, then pull back to the whole desk
    const f = 1 - smooth(seg(0.6, 0.76));
    const z = 1 + 0.5 * f;
    const zoom = {
        transformBox: 'view-box',
        transformOrigin: '0px 0px',
        transform: `translate(${(f * (500 - z * 667)).toFixed(1)}px, ${(f * (370 - z * 400)).toFixed(1)}px) scale(${z.toFixed(3)})`,
    };

    const parts = {
        board: drop(0.06, 0.14), cpu: drop(0.12, 0.2), fan: drop(0.2, 0.3),
        ram1: drop(0.3, 0.36), ram2: drop(0.33, 0.39), gpu: drop(0.4, 0.49),
        drive: slide(0.5, 0.59, -150, 75), panel: slide(0.6, 0.67, 120, 60),
        monitor: drop(0.66, 0.74), keyboard: drop(0.7, 0.77), mouse: drop(0.72, 0.79),
    };
    return { zoom, parts };
}

function discStyles(p, selected, loaded, phase) {
    return projects.map((project, i) => {
        const [wx, wy] = WALLET[i % WALLET.length];
        const k = backOut(clamp((p - (0.78 + i * 0.02)) / 0.06, 0, 1));
        let x = wx;
        let y = wy;
        let scale = k;
        let opacity = k > 0 ? 1 : 0;
        if (i === selected && loaded !== i && phase !== 'load') y -= 12;
        if ((phase === 'load' && i === selected) || loaded === i) {
            [x, y] = DRIVE_BAY;
            scale = 0.35;
            opacity = phase === 'load' ? 1 : 0;
        }
        return {
            color: project.color,
            style: {
                transform: `translate(${x}px, ${y}px) scale(${scale.toFixed(3)})`,
                opacity,
                transition: `transform .9s cubic-bezier(.5,0,.3,1), opacity .25s ${phase === 'load' ? '.85s' : '0s'}`,
            },
        };
    });
}

const ExternalIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
);
const linkProps = (href) => (/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export default function ToyboxSite() {
    const [flat, toggleScene] = useFlatMode();
    const { trackRef, stageRef, progress: p } = useScrollProgress(!flat);
    const [selected, setSelected] = useState(0);
    const [loaded, setLoaded] = useState(-1);
    const [phase, setPhase] = useState('idle');
    const timer = useRef(0);

    useEffect(() => () => clearTimeout(timer.current), []);

    const select = useCallback((i) => {
        if (phase === 'load') return;
        setSelected(((i % projects.length) + projects.length) % projects.length);
    }, [phase]);
    const play = () => {
        if (phase === 'load' || loaded === selected) return;
        setLoaded(-1);
        setPhase('load');
        clearTimeout(timer.current);
        timer.current = setTimeout(() => { setLoaded(selected); setPhase('play'); }, 1500);
    };
    const eject = () => {
        if (phase === 'load') return;
        setLoaded(-1);
        setPhase('idle');
    };

    const step = p < 0.08 ? 0 : p < 0.2 ? 1 : p < 0.3 ? 2 : p < 0.4 ? 3 : p < 0.5 ? 4 : p < 0.6 ? 5 : p < 0.78 ? 6 : 7;
    const pct = Math.round(clamp(p / 0.78, 0, 1) * 100);
    const { zoom, parts } = sceneStyles(p);
    const current = projects[loaded >= 0 ? loaded : selected];
    const screen = {
        mode: phase === 'load' ? 'load' : loaded >= 0 ? 'play' : p > 0.75 ? 'idle' : 'off',
        project: loaded >= 0 ? projects[loaded] : null,
    };
    const lcdText = phase === 'load' ? 'READING DISC…' : loaded >= 0 ? `▶ NOW PLAYING: ${current.name}` : `SELECTED: ${current.name} — press PLAY`;

    return (
        <div id="top" className="toybox-site">
            <header className="tb-header">
                <nav aria-label="Primary" className="tb-nav">
                    <a href="#top" className="tb-brand">
                        <span className="tb-brand-badge">GR</span>
                        <span className="tb-brand-text">
                            <span className="tb-brand-name">Gaven Robertson</span>
                            <span className="tb-brand-sub">software_developer.exe</span>
                        </span>
                    </a>
                    <div className="tb-marquee" aria-hidden="true">
                        <div className="tb-marquee-track">
                            <span>NOW LOADING: PORTFOLIO.EXE ••• SCROLL TO BUILD THE MACHINE ••• INSERT A DISC TO VIEW A PROJECT •••</span>
                            <span>NOW LOADING: PORTFOLIO.EXE ••• SCROLL TO BUILD THE MACHINE ••• INSERT A DISC TO VIEW A PROJECT •••</span>
                        </div>
                    </div>
                    <div className="tb-nav-actions">
                        <button className="tb-btn tb-btn--nav" type="button" aria-pressed={!flat} onClick={toggleScene}>
                            <span aria-hidden="true" className={`tb-toggle-dot${flat ? '' : ' is-on'}`} />
                            {flat ? 'Scene: OFF' : 'Scene: ON'}
                        </button>
                        <a className="tb-btn tb-btn--nav tb-nav-link" href="#projects">Projects</a>
                        <a className="tb-btn tb-btn--nav tb-nav-link" href="#about">About</a>
                        <a className="tb-btn tb-btn--nav tb-btn--orange" href="#contact">Contact</a>
                    </div>
                </nav>
            </header>

            {!flat ? (
                <section id="projects" ref={trackRef} className="tb-track">
                    <div ref={stageRef} className="tb-stage">
                        <div aria-hidden="true" className="tb-bgtext" style={{ transform: `translate(${(-p * 55).toFixed(2)}%, -50%)` }}>
                            GAVENOS 2000 • GAVENOS 2000 •
                        </div>
                        <DeskScene zoom={zoom} parts={parts} discs={discStyles(p, selected, loaded, phase)} screen={screen} />
                        <div className="tb-overlay">
                            {step < 7 && (
                                <div className="tb-panel tb-setup" role="status" aria-live="polite">
                                    <div className="tb-tbar">
                                        <span className="tb-tbar-title">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" /></svg>
                                            GavenOS 2000 Setup
                                        </span>
                                        <span className="tb-tdots" aria-hidden="true"><span /><span /></span>
                                    </div>
                                    <div className="tb-setup-body">
                                        <span className="tb-setup-label">{step === 0 ? 'C:\\> setup.exe' : `Step ${step} of ${STEPS.length - 2}`}</span>
                                        <span className="tb-setup-title">{STEPS[step].t}</span>
                                        <span className="tb-setup-text">{STEPS[step].b}</span>
                                        <span className="tb-bar"><span className="tb-bar-fill" style={{ width: `${pct}%` }} /></span>
                                        <span className="tb-setup-pct">{pct}% complete</span>
                                    </div>
                                </div>
                            )}
                            {step > 0 && step < 7 && (
                                <div className="tb-bubble-wrap" aria-hidden="true"><span key={step} className="tb-bubble">{STEP_BUBBLES[step]}</span></div>
                            )}
                            {step === 0 && (
                                <div className="tb-hint">
                                    <span>Scroll to boot<span className="blink">_</span></span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            )}
                            {step === 7 && (
                                <div className="tb-panel tb-player" role="region" aria-label="Project player">
                                    <div className="tb-player-body">
                                        <div className="tb-row">
                                            <span className="tb-amp">GAVEN<span>AMP</span></span>
                                            <div className="tb-screen tb-lcd" aria-live="polite">
                                                <span className="tb-lcd-track">TRK 0{(loaded >= 0 ? loaded : selected) + 1}</span>
                                                <span className="tb-lcd-text">{lcdText}</span>
                                            </div>
                                        </div>
                                        <div className="tb-row tb-row--controls">
                                            <button className="tb-btn tb-btn--icon" type="button" aria-label="Previous disc" onClick={() => select(selected - 1)}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 5L9 12l10 7zM5 5v14" /></svg>
                                            </button>
                                            <button className="tb-btn tb-btn--orange" type="button" onClick={play}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>Play
                                            </button>
                                            <button className="tb-btn" type="button" onClick={eject}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5l7 9H5zM5 19h14" /></svg>Eject
                                            </button>
                                            <button className="tb-btn tb-btn--icon" type="button" aria-label="Next disc" onClick={() => select(selected + 1)}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 5l10 7-10 7zM19 5v14" /></svg>
                                            </button>
                                            <div className="tb-spacer" />
                                            {loaded >= 0 && phase === 'play' && (
                                                <a className="tb-btn tb-btn--blue" href={projects[loaded].url} {...linkProps(projects[loaded].url)}>Open project<ExternalIcon /></a>
                                            )}
                                        </div>
                                        <div className="tb-tracks">
                                            {projects.map((project, i) => (
                                                <button
                                                    key={project.name + i}
                                                    className={`tb-trackbtn${i === selected ? ' is-selected' : ''}`}
                                                    type="button"
                                                    aria-pressed={i === selected}
                                                    onClick={() => select(i)}
                                                >
                                                    <span className="tb-trackdot" style={{ '--dot': project.color }} />
                                                    <span className="tb-tracknum">0{i + 1}</span>
                                                    <span className="tb-trackname">{project.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            ) : (
                <section id="projects" className="tb-section tb-section--flat">
                    <div className="tb-head">
                        <div className="tb-stack">
                            <span className="tb-prompt">C:\GAVEN\&gt; dir D:\PROJECTS</span>
                            <h2 className="tb-display">Projects.</h2>
                            <p className="tb-lede">Every project ships on its own disc. Pick one to open it.</p>
                        </div>
                        <button className="tb-btn" type="button" onClick={toggleScene}>Switch the scene on</button>
                    </div>
                    <div className="tb-cards">
                        {projects.map((project, i) => (
                            <div key={project.name + i} className="tb-panel tb-card">
                                <span aria-hidden="true" className="tb-disc" style={{ '--disc': project.color }} />
                                <div className="tb-card-info">
                                    <span className="tb-card-label">TRACK 0{i + 1} · {project.year}</span>
                                    <span className="tb-card-name">{project.name}</span>
                                    <span className="tb-card-blurb">{project.blurb}</span>
                                    <span className="tb-card-stack">{project.stack}</span>
                                    <a className="tb-btn tb-btn--orange" href={project.url} {...linkProps(project.url)}>Open project<ExternalIcon /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section id="about" className="tb-section tb-section--about">
                <div className="tb-intro">
                    <div className="tb-stack tb-stack--about">
                        <span className="tb-prompt">C:\GAVEN\&gt; whoami</span>
                        <h2 className="tb-display">Built different. Built to last.</h2>
                        <p className="tb-lede">I'm Gaven, a software developer. I like interfaces with personality, code that stays out of its own way, and the occasional 3D detour.</p>
                    </div>
                    <div className="tb-screen tb-sysinfo">
                        {[
                            ['HOSTNAME', 'GAVEN-ROBERTSON'],
                            ['ROLE', 'Software Developer @ BESPIN'],
                            ['SUPPORTING', 'AFSOC Special Warfare'],
                            ['EDUCATION', 'B.S. CS, Oregon State · M.S. CS, ASU (in progress)'],
                            ['LOCATION', 'Montgomery, AL'],
                        ].map(([k, v]) => (
                            <div key={k} className="tb-sysrow"><span className="tb-syskey">{k}</span><span>{v}</span></div>
                        ))}
                        <div className="tb-sysrow">
                            <span className="tb-syskey">STATUS</span>
                            <span className="tb-status"><span aria-hidden="true" className="flick tb-status-led" />online</span>
                        </div>
                    </div>
                </div>

                {[
                    { id: 'SLOT 1', name: 'FRONTEND', color: '#3BA7F0', ports: FRONTEND },
                    { id: 'SLOT 2', name: 'ALSO RUNNING', color: '#FF9F1C', ports: ALSO_RUNNING },
                ].map((slot) => (
                    <div key={slot.id} className="tb-panel tb-slot">
                        <div className="tb-slot-label" style={{ '--slot': slot.color }}>
                            <span className="tb-slot-id">{slot.id}</span>
                            <span className="tb-slot-name">{slot.name}</span>
                            <span className="tb-slot-status">PCI · ready</span>
                        </div>
                        <div className="tb-ports">
                            {slot.ports.map((port) => <span key={port} className="tb-chip">{port}<span className="tb-led" /></span>)}
                            <span className="tb-chip is-pending">[ADD MORE]<span className="tb-led" /></span>
                        </div>
                    </div>
                ))}

                <div className="tb-windows">
                    <div className="tb-panel">
                        <div className="tb-tbar"><span>history.log</span><span className="tb-tdots" aria-hidden="true"><span /><span /></span></div>
                        <div className="tb-log">
                            {HISTORY.map((entry) => (
                                <div key={entry.when} className="tb-log-row">
                                    <span className="tb-when">{entry.when}</span>
                                    <div className="tb-log-detail">
                                        {entry.items.map((item) => (
                                            <React.Fragment key={item.title}>
                                                <span className="tb-log-title">{item.title}</span>
                                                {item.org && <span className="tb-log-org">{item.org}</span>}
                                                {item.text && <span className="tb-log-text">{item.text}</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="tb-log-prompt">C:\GAVEN\&gt; <span className="blink">█</span></div>
                    </div>
                    <div className="tb-panel">
                        <div className="tb-tbar tb-tbar--green"><span>autoexec.bat</span><span className="tb-tdots" aria-hidden="true"><span /><span /></span></div>
                        <div className="tb-screen tb-script">
                            <span className="tb-script-kw">@ECHO OFF</span>
                            <span>ECHO Software developer at BESPIN, supporting AFSOC as a Special Warfare Operations Integrator.</span>
                            <span>ECHO Front-end roots: React, SASS and Tailwind, plus a habit of building things in 3D.</span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact" className="tb-contact">
                <div className="tb-contact-inner">
                    <span className="tb-guestbook">Sign my guestbook!</span>
                    <h2 className="tb-contact-title">Let's build something.</h2>
                    <p className="tb-contact-text">Got a project, a role, or just want to talk shop? My inbox is open.</p>
                    <div className="tb-contact-links">
                        <a className="tb-btn tb-btn--orange tb-btn--big" href="mailto:gaven.robertson@gmail.com">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                            gaven.robertson@gmail.com
                        </a>
                        <a className="tb-btn tb-btn--big" href="https://github.com/gavenrobertson" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a className="tb-btn tb-btn--big" href="https://www.linkedin.com/in/gaven-robertson-b20887232" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
