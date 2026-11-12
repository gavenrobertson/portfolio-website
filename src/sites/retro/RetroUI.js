import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import './retro.scss';
import { prefersReducedMotion, useFlatMode } from "../shared/motion";

export { prefersReducedMotion, useFlatMode };

// Building blocks shared by the 3D designs (Workstation and GavenNET Lab).

// ---------- icons
const stroke = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icon = {
    Prev: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true"><path d="M19 5L9 12l10 7zM5 5v14" /></svg>
    ),
    Next: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true"><path d="M5 5l10 7-10 7zM19 5v14" /></svg>
    ),
    Play: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
    ),
    Eject: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true"><path d="M12 5l7 9H5zM5 19h14" /></svg>
    ),
    External: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} strokeWidth="2.4" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
    ),
    Cube: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true">
            <path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M12 22V12M21 7l-9 5-9-5" />
        </svg>
    ),
    Skip: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} strokeWidth="2.4" aria-hidden="true"><path d="M7 6l5 5 5-5M7 13l5 5 5-5" /></svg>
    ),
    Sun: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
    ),
    Moon: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
    ),
    Mail: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
        </svg>
    ),
    GitHub: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.84c.85 0 1.7.11 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>
    ),
    LinkedIn: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v6.2h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9v5.6h-4z" /></svg>
    ),
};

// ---------- light / dark theme
// Follows the system setting until the visitor picks one. public/index.html sets
// data-theme before React loads so the page never flashes the wrong theme.
const THEME_KEY = 'gaven-theme';
const THEME_COLORS = { dark: '#0B0B0D', light: '#F4F3EF' };
const darkQuery = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

function storedTheme() {
    try {
        const v = window.localStorage.getItem(THEME_KEY);
        if (v === 'light' || v === 'dark') return v;
    } catch (e) { /* storage unavailable */ }
    return null;
}

function systemTheme() {
    return darkQuery && !darkQuery.matches ? 'light' : 'dark';
}

export function useTheme() {
    const [theme, setTheme] = useState(() => storedTheme() || systemTheme());

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
    }, [theme]);

    useEffect(() => {
        if (!darkQuery) return undefined;
        const onChange = () => { if (!storedTheme()) setTheme(systemTheme()); };
        darkQuery.addEventListener('change', onChange);
        return () => darkQuery.removeEventListener('change', onChange);
    }, []);

    const toggle = useCallback(() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        try { window.localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
        setTheme(next);
    }, [theme]);

    return [theme, toggle];
}

// ---------- scroll-driven three.js scene
const INITIAL_SCENE_STATE = { step: 0, pct: 0, selected: 0, loaded: -1, phase: 'idle' };

export function useScrollScene(createScene, { projects, modelsUrl, enabled, onUnavailable, theme }) {
    const trackRef = useRef(null);
    const stageRef = useRef(null);
    const canvasRef = useRef(null);
    const bgRef = useRef(null);
    const sceneRef = useRef(null);
    const [sceneState, setSceneState] = useState(INITIAL_SCENE_STATE);
    const themeRef = useRef(theme);
    themeRef.current = theme;

    useEffect(() => {
        if (!enabled) return undefined;
        const scene = createScene({
            canvas: canvasRef.current,
            stage: stageRef.current,
            track: trackRef.current,
            bg: bgRef.current,
            projects,
            modelsUrl,
            onState: (patch) => setSceneState((s) => ({ ...s, ...patch })),
            isStill: prefersReducedMotion,
        });
        if (!scene) {
            if (onUnavailable) onUnavailable();
            return undefined;
        }
        sceneRef.current = scene;
        scene.setTheme(themeRef.current === 'light');
        return () => {
            scene.dispose();
            sceneRef.current = null;
            setSceneState(INITIAL_SCENE_STATE);
        };
    }, [createScene, projects, modelsUrl, enabled, onUnavailable]);

    useEffect(() => {
        if (sceneRef.current) sceneRef.current.setTheme(theme === 'light');
    }, [theme]);

    const api = useMemo(() => ({
        select: (i) => sceneRef.current && sceneRef.current.select(i),
        play: () => sceneRef.current && sceneRef.current.play(),
        eject: () => sceneRef.current && sceneRef.current.eject(),
        prev: () => sceneRef.current && sceneRef.current.step(-1),
        next: () => sceneRef.current && sceneRef.current.step(1),
    }), []);

    return { trackRef, stageRef, canvasRef, bgRef, sceneState, api };
}

// ---------- layout pieces
// links: [{ id, label, onClick? }] — onClick overrides the plain #anchor jump.
export function SiteNav({ subtitle, links, active, flat, onToggle3d, theme, onToggleTheme }) {
    const go = (link) => (e) => {
        if (!link.onClick) return;
        e.preventDefault();
        link.onClick();
    };
    return (
        <header className="r-header">
            <nav aria-label="Primary" className="r-nav">
                <a href="#top" className="r-brand" aria-label="Gaven Robertson, back to top">
                    <span className="r-brand-mark" aria-hidden="true">GR</span>
                    <span className="r-brand-text">
                        <span className="r-brand-name">Gaven Robertson</span>
                        <span className="r-brand-sub">{subtitle}</span>
                    </span>
                </a>
                <div className="r-nav-links">
                    {links.map((link) => (
                        <a
                            key={link.id}
                            className="r-navlink"
                            href={`#${link.id}`}
                            aria-current={active === link.id ? 'true' : undefined}
                            onClick={go(link)}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
                <div className="r-nav-actions">
                    <button
                        className="r-btn r-btn--sm r-toggle"
                        type="button"
                        aria-pressed={!flat}
                        onClick={onToggle3d}
                        title={flat ? 'Turn the 3D scene on' : 'Turn the 3D scene off'}
                    >
                        <span aria-hidden="true" className={`r-toggle-dot${flat ? '' : ' is-on'}`} />
                        3D
                    </button>
                    <button
                        className="r-btn r-btn--sm r-btn--icon"
                        type="button"
                        onClick={onToggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
                    </button>
                    <a className="r-btn r-btn--sm r-btn--primary" href="#contact" onClick={go(links.find((l) => l.id === 'contact') || {})}>Contact</a>
                </div>
            </nav>
        </header>
    );
}

// The sticky stage the scroll-driven build plays in: progress card, scroll hint, then the player.
export function ScrollStage({ id, scene, bgText, steps, onSkip, children }) {
    const { trackRef, stageRef, canvasRef, bgRef, sceneState } = scene;
    const { step, pct } = sceneState;
    const cur = steps[step];
    const last = steps.length - 1;
    const done = step >= last;
    return (
        <section id={id} ref={trackRef} className="r-track" aria-label="Projects">
            <div ref={stageRef} className="r-stage">
                <div aria-hidden="true" ref={bgRef} className="r-bgtext">{bgText}</div>
                <canvas ref={canvasRef} aria-hidden="true" className="r-canvas" />
                <div className="r-overlay">
                    {!done && (
                        <div className="r-build r-window" role="status" aria-live="polite">
                            <div className="r-card-head r-build-bar">
                                <span className="r-card-title">{step === 0 ? 'Projects' : `Building · ${cur.label}`}</span>
                                {step > 0 && <span className="r-card-meta">{String(step).padStart(2, '0')} / {String(last - 1).padStart(2, '0')}</span>}
                                <WindowButtons />
                            </div>
                            <div className="r-build-body">
                            <h2 className="r-build-title">{cur.t}</h2>
                            <p className="r-build-text">{cur.b}</p>
                            <div className="r-progress" aria-hidden="true"><div className="r-progress-bar" style={{ width: `${pct}%` }} /></div>
                            <div className="r-build-foot">
                                <span className="r-build-pct">{pct}%</span>
                                <button className="r-btn r-btn--sm r-btn--ghost" type="button" onClick={onSkip}>
                                    Skip to projects<Icon.Skip />
                                </button>
                            </div>
                            </div>
                        </div>
                    )}
                    {step === 0 && (
                        <div className="r-hint" aria-hidden="true">
                            <span className="r-hint-mouse"><span /></span>
                            Scroll to build
                        </div>
                    )}
                    {done && children}
                </div>
            </div>
        </section>
    );
}

// Project player shown once the build finishes.
export function PlayerPanel({ label, eyebrow, screenTag, screenText, labels, tracks, selected, canPlay, canEject, openHref, dotVariant, api }) {
    return (
        <div role="region" aria-label={label} className="r-player">
            <div className="r-player-head">
                <span className="r-eyebrow">{eyebrow}</span>
                <div aria-live="polite" className="r-lcd">
                    <span className="r-lcd-tag">{screenTag}</span>
                    <span className="r-lcd-text">{screenText}</span>
                </div>
            </div>
            <div className="r-player-controls">
                <button className="r-btn r-btn--icon" type="button" aria-label={labels.prev} title={labels.prev} onClick={api.prev}><Icon.Prev /></button>
                <button className="r-btn r-btn--primary" type="button" onClick={api.play} disabled={!canPlay}><Icon.Play />{labels.play}</button>
                <button className="r-btn" type="button" onClick={api.eject} disabled={!canEject}><Icon.Eject />{labels.eject}</button>
                <button className="r-btn r-btn--icon" type="button" aria-label={labels.next} title={labels.next} onClick={api.next}><Icon.Next /></button>
                <div className="r-spacer" />
                {openHref && (
                    <a className="r-btn r-btn--primary r-btn--pop" href={openHref} {...externalProps(openHref)}>Open project<Icon.External /></a>
                )}
            </div>
            <div className="r-tracks">
                {tracks.map((t, i) => (
                    <button
                        key={t.name + i}
                        className={`r-trackbtn${i === selected ? ' is-selected' : ''}`}
                        type="button"
                        aria-pressed={i === selected}
                        onClick={() => api.select(i)}
                    >
                        <span className={`r-trackbtn-dot${dotVariant === 'led' ? ' r-trackbtn-dot--led' : ''}`} style={{ '--dot-color': t.color }} />
                        <span className="r-trackbtn-num">{t.num}</span>
                        <span className="r-trackbtn-name">{t.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export function externalProps(href) {
    return /^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

export function FlatHeader({ eyebrow, title, text, onToggle3d }) {
    return (
        <div className="r-section-head" data-reveal>
            <div className="r-heading-stack">
                <span className="r-eyebrow">{eyebrow}</span>
                <h2 className="r-display chrome">{title}</h2>
                <p className="r-lede">{text}</p>
            </div>
            <button className="r-btn" type="button" onClick={onToggle3d}><Icon.Cube />View in 3D</button>
        </div>
    );
}

export function OpenProjectLink({ href, className = '' }) {
    const placeholder = !href || href === '#';
    if (placeholder) {
        return <span className={`r-btn r-btn--sm is-disabled ${className}`} aria-disabled="true">Coming soon</span>;
    }
    return (
        <a className={`r-btn r-btn--sm r-btn--primary ${className}`} href={href} {...externalProps(href)}>Open project<Icon.External /></a>
    );
}

// One card per skill group, each skill a chip.
export function SkillGroups({ groups }) {
    return (
        <div className="r-skills">
            {groups.map((group, i) => (
                <div key={group.name} className="r-card r-skill-card" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                    <div className="r-skill-head">
                        <h3 className="r-card-title">{group.name}</h3>
                        <span className="r-card-meta">{String(group.items.length).padStart(2, '0')}</span>
                    </div>
                    <ul className="r-chips">
                        {group.items.map((item) => <li key={item} className="r-chip">{item}</li>)}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export function FactsCard({ rows }) {
    return (
        <dl className="r-card r-facts" data-reveal>
            {rows.map(([k, v]) => (
                <div key={k} className="r-fact">
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                </div>
            ))}
        </dl>
    );
}

function WindowButtons() {
    return (
        <span className="r-winbtns" aria-hidden="true"><span /><span /><span /></span>
    );
}

// A card drawn as a classic desktop window: gel title bar, window buttons, body.
export function Card({ title, meta, className = '', children, ...rest }) {
    return (
        <div className={`r-card r-window ${className}`} {...rest}>
            <div className="r-card-head">
                <h3 className="r-card-title">{title}</h3>
                {meta && <span className="r-card-meta">{meta}</span>}
                <WindowButtons />
            </div>
            {children}
        </div>
    );
}

export function Experience({ entries }) {
    return (
        <Card title="Experience" meta={`${entries.length} roles`} data-reveal>
            <ol className="r-timeline">
                {entries.map((e) => (
                    <li key={e.when} className="r-timeline-row">
                        <span className="r-timeline-when">{e.when}</span>
                        <div className="r-timeline-detail">
                            {e.items.map((item) => (
                                <React.Fragment key={item.title}>
                                    <span className="r-timeline-title">{item.title}</span>
                                    {item.org && <span className="r-timeline-org">{item.org}</span>}
                                    {item.text && <span className="r-timeline-text">{item.text}</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </li>
                ))}
            </ol>
        </Card>
    );
}

// Portrait in a window frame plus the longer bio.
export function Bio({ photo, name, paragraphs }) {
    return (
        <div className="r-bio">
            <figure className="r-card r-window r-portrait" data-reveal>
                <div className="r-card-head">
                    <span className="r-card-title">{name}</span>
                    <WindowButtons />
                </div>
                <img src={photo} alt={`Portrait of ${name}`} loading="lazy" width="630" height="638" />
            </figure>
            <div className="r-bio-text" data-reveal style={{ '--reveal-delay': '80ms' }}>
                {paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
            </div>
        </div>
    );
}

export function Likes({ items }) {
    return (
        <div className="r-likes">
            {items.map((item, i) => (
                <div key={item.t} className="r-card r-like" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                    <span className="r-like-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="r-like-title">{item.t}</h3>
                    <p className="r-like-text">{item.b}</p>
                </div>
            ))}
        </div>
    );
}

export function EducationCard({ entries }) {
    return (
        <Card title="Education" meta={`${entries.length} degrees`} data-reveal style={{ '--reveal-delay': '80ms' }}>
            <ul className="r-edu">
                {entries.map((e) => (
                    <li key={e.degree} className="r-edu-row">
                        <span className="r-timeline-title">{e.degree}</span>
                        <span className="r-timeline-org">{e.school}</span>
                        <span className="r-timeline-when">{e.when}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

export function NowCard({ items }) {
    return (
        <Card title="Right now" data-reveal style={{ '--reveal-delay': '160ms' }}>
            <ul className="r-now">
                {items.map((line) => <li key={line}>{line}</li>)}
            </ul>
        </Card>
    );
}

// The studio and the live sites built through it.
export function StudioSection({ studio }) {
    return (
        <section id="studio" className="r-section r-section--studio">
            <div className="r-section-head" data-reveal>
                <div className="r-heading-stack">
                    <span className="r-eyebrow">Studio</span>
                    <h2 className="r-display chrome">{studio.name}</h2>
                    <p className="r-lede">{studio.blurb}</p>
                </div>
            </div>
            <div className="r-studio-grid">
                {studio.sites.map((site, i) => (
                    <a
                        key={site.name}
                        className="r-card r-window r-site"
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-reveal
                        style={{ '--reveal-delay': `${i * 80}ms`, '--site-color': site.color }}
                    >
                        <div className="r-card-head">
                            <span className="r-card-title">{site.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                            <WindowButtons />
                        </div>
                        <div className="r-site-body">
                            <span className="r-site-place">{site.place}</span>
                            <h3 className="r-site-name">{site.name}</h3>
                            <p className="r-site-text">{site.text}</p>
                            <span className="r-site-cta">Visit site<Icon.External /></span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}

export function ContactSection({ heading, text }) {
    return (
        <section id="contact" className="r-contact">
            <div className="r-contact-inner" data-reveal>
                <span className="r-eyebrow">Contact</span>
                <h2 className="r-contact-title chrome">{heading}</h2>
                <p className="r-contact-text">{text}</p>
                <div className="r-contact-links">
                    <a className="r-btn r-btn--lg r-btn--primary" href="mailto:gaven.robertson@gmail.com"><Icon.Mail />gaven.robertson@gmail.com</a>
                    <a className="r-btn r-btn--lg" href="https://github.com/gavenrobertson" target="_blank" rel="noopener noreferrer"><Icon.GitHub />GitHub</a>
                    <a className="r-btn r-btn--lg" href="https://www.linkedin.com/in/gaven-robertson-b20887232" target="_blank" rel="noopener noreferrer"><Icon.LinkedIn />LinkedIn</a>
                </div>
            </div>
        </section>
    );
}
