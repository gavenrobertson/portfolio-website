import React, { useCallback, useEffect, useRef, useState } from "react";
import projects from "../retro/projects";
import { STEPS, SKILLS, FACTS, ABOUT, HISTORY, EDUCATION, STUDIO } from "../workstation/content";
import portrait from "../shared/assets/gaven.webp";
import { useFlatMode } from "../shared/motion";
import { useActiveSection, useReveal, scrollToBuildEnd, scrollToId } from "../shared/ux";
import DeskScene from "./DeskScene";
import "./toybox.scss";

// Toybox: the build-the-machine story drawn as chunky cartoon toys. Scroll to build the PC
// on an isometric desk, then load projects from CDs. No three.js; it's all SVG + CSS.

const HEADER_H = 80;
const STEP_BUBBLES = ['', '+ Processor', '+ Cooling', '+ Memory', '+ Graphics', '+ Drive', 'All set!', ''];
const SLOT_COLORS = ['#3BA7F0', '#FF9F1C', '#4CC36A', '#F25C54', '#C9A7FF'];
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
    const rootRef = useRef(null);
    const [flat, toggleScene] = useFlatMode();
    const { trackRef, stageRef, progress: p } = useScrollProgress(!flat);
    const active = useActiveSection(['projects', 'about', 'studio', 'contact'], flat);
    useReveal(rootRef, flat);
    const showProjects = useCallback((e) => {
        if (e) e.preventDefault();
        if (trackRef.current) scrollToBuildEnd(trackRef.current, stageRef.current, HEADER_H);
        else scrollToId('projects');
    }, [trackRef, stageRef]);
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
    const screenText = phase === 'load' ? 'Loading…' : loaded >= 0 ? `${current.name} · ready to open` : `${current.name} · press Play`;
    const openUrl = loaded >= 0 && phase === 'play' && projects[loaded].url !== '#' ? projects[loaded].url : null;
    const pad2 = (n) => String(n).padStart(2, '0');
    const navLinks = [
        { id: 'projects', label: 'Projects', onClick: showProjects },
        { id: 'about', label: 'About' },
        { id: 'studio', label: 'Studio' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <div id="top" ref={rootRef} className="toybox-site">
            <header className="tb-header">
                <nav aria-label="Primary" className="tb-nav">
                    <a href="#top" className="tb-brand" aria-label="Gaven Robertson, back to top">
                        <span className="tb-brand-badge" aria-hidden="true">GR</span>
                        <span className="tb-brand-text">
                            <span className="tb-brand-name">Gaven Robertson</span>
                            <span className="tb-brand-sub">Software Engineer</span>
                        </span>
                    </a>
                    <div className="tb-navlinks">
                        {navLinks.map((link) => (
                            <a
                                key={link.id}
                                className="tb-navlink"
                                href={`#${link.id}`}
                                aria-current={active === link.id ? 'true' : undefined}
                                onClick={link.onClick}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="tb-nav-actions">
                        <button
                            className="tb-btn tb-btn--nav"
                            type="button"
                            aria-pressed={!flat}
                            onClick={toggleScene}
                            title={flat ? 'Turn the scene on' : 'Turn the scene off'}
                        >
                            <span aria-hidden="true" className={`tb-toggle-dot${flat ? '' : ' is-on'}`} />
                            Scene
                        </button>
                        <a className="tb-btn tb-btn--nav tb-btn--orange" href="#contact">Contact</a>
                    </div>
                </nav>
            </header>

            {!flat ? (
                <section id="projects" ref={trackRef} className="tb-track" aria-label="Projects">
                    <div ref={stageRef} className="tb-stage">
                        <div aria-hidden="true" className="tb-bgtext" style={{ transform: `translate(${(-p * 55).toFixed(2)}%, -50%)` }}>
                            GAVEN ROBERTSON · GAVEN ROBERTSON ·
                        </div>
                        <DeskScene zoom={zoom} parts={parts} discs={discStyles(p, selected, loaded, phase)} screen={screen} projects={projects} />
                        <div className="tb-overlay">
                            {step < 7 && (
                                <div className="tb-panel tb-setup" role="status" aria-live="polite">
                                    <div className="tb-tbar">
                                        <span className="tb-tbar-title">{step === 0 ? 'Projects' : `Building · ${STEPS[step].label}`}</span>
                                        {step > 0 && <span className="tb-count">{pad2(step)} / {pad2(STEPS.length - 2)}</span>}
                                    </div>
                                    <div className="tb-setup-body">
                                        <span className="tb-setup-title">{STEPS[step].t}</span>
                                        <span className="tb-setup-text">{STEPS[step].b}</span>
                                        <span className="tb-bar" aria-hidden="true"><span className="tb-bar-fill" style={{ width: `${pct}%` }} /></span>
                                        <div className="tb-setup-foot">
                                            <span className="tb-setup-pct">{pct}% built</span>
                                            <button className="tb-btn tb-btn--sm" type="button" onClick={() => showProjects()}>Skip to projects</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {step > 0 && step < 7 && (
                                <div className="tb-bubble-wrap" aria-hidden="true"><span key={step} className="tb-bubble">{STEP_BUBBLES[step]}</span></div>
                            )}
                            {step === 0 && (
                                <div className="tb-hint" aria-hidden="true">
                                    <span>Scroll to build</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            )}
                            {step === 7 && (
                                <div className="tb-panel tb-player" role="region" aria-label="Project player">
                                    <div className="tb-player-body">
                                        <div className="tb-row">
                                            <span className="tb-amp">Projects</span>
                                            <div className="tb-screen tb-lcd" aria-live="polite">
                                                <span className="tb-lcd-track">{pad2((loaded >= 0 ? loaded : selected) + 1)}/{pad2(projects.length)}</span>
                                                <span className="tb-lcd-text">{screenText}</span>
                                            </div>
                                        </div>
                                        <div className="tb-row tb-row--controls">
                                            <button className="tb-btn tb-btn--icon" type="button" aria-label="Previous project" title="Previous project" onClick={() => select(selected - 1)} disabled={phase === 'load'}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 5L9 12l10 7zM5 5v14" /></svg>
                                            </button>
                                            <button className="tb-btn tb-btn--orange" type="button" onClick={play} disabled={phase === 'load' || loaded === selected}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>Play
                                            </button>
                                            <button className="tb-btn" type="button" onClick={eject} disabled={phase === 'load' || loaded < 0}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5l7 9H5zM5 19h14" /></svg>Eject
                                            </button>
                                            <button className="tb-btn tb-btn--icon" type="button" aria-label="Next project" title="Next project" onClick={() => select(selected + 1)} disabled={phase === 'load'}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 5l10 7-10 7zM19 5v14" /></svg>
                                            </button>
                                            <div className="tb-spacer" />
                                            {openUrl && (
                                                <a className="tb-btn tb-btn--blue tb-btn--pop" href={openUrl} {...linkProps(openUrl)}>Open project<ExternalIcon /></a>
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
                                                    disabled={phase === 'load'}
                                                >
                                                    <span className="tb-trackdot" style={{ '--dot': project.color }} />
                                                    <span className="tb-tracknum">{pad2(i + 1)}</span>
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
                    <div className="tb-head" data-reveal>
                        <div className="tb-stack">
                            <span className="tb-tag">Selected work</span>
                            <h2 className="tb-display">Projects</h2>
                            <p className="tb-lede">A few things I've built recently.</p>
                        </div>
                        <button className="tb-btn" type="button" onClick={toggleScene}>Turn the scene on</button>
                    </div>
                    <div className="tb-cards">
                        {projects.map((project, i) => (
                            <article key={project.name + i} className="tb-panel tb-card" data-reveal style={{ '--reveal-delay': `${(i % 2) * 80}ms` }}>
                                <span aria-hidden="true" className="tb-disc" style={{ '--disc': project.color }} />
                                <div className="tb-card-info">
                                    <span className="tb-card-label">{pad2(i + 1)} · {project.year}</span>
                                    <h3 className="tb-card-name">{project.name}</h3>
                                    <p className="tb-card-blurb">{project.blurb}</p>
                                    <span className="tb-card-stack">{project.stack}</span>
                                    {project.url !== '#' ? (
                                        <a className="tb-btn tb-btn--orange" href={project.url} {...linkProps(project.url)}>Open project<ExternalIcon /></a>
                                    ) : (
                                        <span className="tb-btn is-disabled" aria-disabled="true">Coming soon</span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <section id="about" className="tb-section tb-section--about">
                <div className="tb-intro">
                    <div className="tb-stack tb-stack--about" data-reveal>
                        <span className="tb-tag">About</span>
                        <h2 className="tb-display tb-display--about">{ABOUT.heading}</h2>
                        <p className="tb-lede">{ABOUT.lede}</p>
                    </div>
                    <dl className="tb-screen tb-sysinfo" data-reveal style={{ '--reveal-delay': '80ms' }}>
                        {FACTS.map(([k, v]) => (
                            <div key={k} className="tb-sysrow"><dt className="tb-syskey">{k}</dt><dd>{v}</dd></div>
                        ))}
                    </dl>
                </div>

                <div className="tb-bio">
                    <figure className="tb-panel tb-portrait" data-reveal>
                        <div className="tb-tbar"><span>Gaven Robertson</span><span className="tb-tdots" aria-hidden="true"><span /><span /></span></div>
                        <img src={portrait} alt="Portrait of Gaven Robertson" loading="lazy" width="630" height="638" />
                    </figure>
                    <div className="tb-bio-text" data-reveal style={{ '--reveal-delay': '80ms' }}>
                        {ABOUT.bio.map((para) => <p key={para.slice(0, 24)}>{para}</p>)}
                    </div>
                </div>

                <h3 className="tb-subhead" data-reveal>What I like building</h3>
                <div className="tb-likes">
                    {ABOUT.likes.map((like, i) => (
                        <div key={like.t} className="tb-panel tb-like" data-reveal style={{ '--reveal-delay': `${i * 80}ms`, '--like': SLOT_COLORS[i % SLOT_COLORS.length] }}>
                            <span className="tb-like-num" aria-hidden="true">{pad2(i + 1)}</span>
                            <h4 className="tb-like-title">{like.t}</h4>
                            <p className="tb-like-text">{like.b}</p>
                        </div>
                    ))}
                </div>

                <h3 className="tb-subhead" data-reveal>Stack</h3>
                <div className="tb-skills">
                    {SKILLS.map((group, i) => (
                        <div key={group.name} className="tb-panel tb-slot" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                            <div className="tb-slot-label" style={{ '--slot': SLOT_COLORS[i % SLOT_COLORS.length] }}>
                                <span className="tb-slot-id">{pad2(i + 1)}</span>
                                <h3 className="tb-slot-name">{group.name}</h3>
                            </div>
                            <ul className="tb-ports">
                                {group.items.map((item) => <li key={item} className="tb-chip">{item}<span className="tb-led" aria-hidden="true" /></li>)}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="tb-windows">
                    <div className="tb-panel" data-reveal>
                        <div className="tb-tbar"><span>Experience</span><span className="tb-count">{pad2(HISTORY.length)} roles</span></div>
                        <ol className="tb-log">
                            {HISTORY.map((entry) => (
                                <li key={entry.when} className="tb-log-row">
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
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="tb-side">
                        <div className="tb-panel" data-reveal style={{ '--reveal-delay': '80ms' }}>
                            <div className="tb-tbar tb-tbar--orange"><span>Education</span></div>
                            <ul className="tb-now tb-edu">
                                {EDUCATION.map((e) => (
                                    <li key={e.degree}>
                                        <span className="tb-log-title">{e.degree}</span>
                                        <span className="tb-log-org">{e.school}</span>
                                        <span className="tb-edu-when">{e.when}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="tb-panel" data-reveal style={{ '--reveal-delay': '160ms' }}>
                            <div className="tb-tbar tb-tbar--green"><span>Right now</span></div>
                            <ul className="tb-now">
                                {ABOUT.now.map((line) => <li key={line}>{line}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section id="studio" className="tb-section tb-section--studio">
                <div className="tb-stack" data-reveal>
                    <span className="tb-tag">Studio</span>
                    <h2 className="tb-display">{STUDIO.name}</h2>
                    <p className="tb-lede">{STUDIO.blurb}</p>
                </div>
                <div className="tb-studio">
                    {STUDIO.sites.map((site, i) => (
                        <a
                            key={site.name}
                            className="tb-panel tb-site"
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-reveal
                            style={{ '--reveal-delay': `${i * 80}ms`, '--site': SLOT_COLORS[i % SLOT_COLORS.length] }}
                        >
                            <span className="tb-site-band">{site.place}</span>
                            <span className="tb-site-body">
                                <span className="tb-site-name">{site.name}</span>
                                <span className="tb-site-text">{site.text}</span>
                                <span className="tb-site-cta">Visit site<ExternalIcon /></span>
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            <section id="contact" className="tb-contact">
                <div className="tb-contact-inner" data-reveal>
                    <span className="tb-contact-tag">Contact</span>
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
