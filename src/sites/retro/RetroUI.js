import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import './retro.scss';

// Building blocks shared by the GavenOS 2000 and GavenNET Lab designs.

const reducedMotionQuery = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

export function prefersReducedMotion() {
    return reducedMotionQuery ? reducedMotionQuery.matches : false;
}

// ---------- icons
const stroke = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icon = {
    Chip: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} strokeWidth="2.2" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        </svg>
    ),
    ChevronDown: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    ),
    Prev: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true"><path d="M19 5L9 12l10 7zM5 5v14" /></svg>
    ),
    Next: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} strokeWidth="2" aria-hidden="true"><path d="M5 5l10 7-10 7zM19 5v14" /></svg>
    ),
    Play: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
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
};

// ---------- 3D on/off preference (shared key, so both designs remember the same choice)
const PREF_KEY = 'gaven-3d';

function initialFlat() {
    try {
        const v = window.localStorage.getItem(PREF_KEY);
        if (v === 'off') return true;
        if (v === 'on') return false;
    } catch (e) { /* storage unavailable */ }
    return prefersReducedMotion();
}

export function useFlatMode() {
    const [flat, setFlat] = useState(initialFlat);
    const toggle = useCallback(() => {
        const next = !flat;
        try { window.localStorage.setItem(PREF_KEY, next ? 'off' : 'on'); } catch (e) { /* ignore */ }
        setFlat(next);
    }, [flat]);
    // Used when WebGL isn't available: fall back without remembering it.
    const forceFlat = useCallback(() => setFlat(true), []);
    return [flat, toggle, forceFlat];
}

// ---------- light / dark theme
// Follows the system setting until the visitor picks one. public/index.html sets
// data-theme before React loads so the page never flashes the wrong theme.
const THEME_KEY = 'gaven-theme';
const THEME_COLORS = { dark: '#0B0B0D', light: '#E9E6DD' };
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
export function RetroNav({ subtitle, marquee, projectsId, flat, onToggle3d, theme, onToggleTheme }) {
    return (
        <header className="r-header">
            <nav aria-label="Primary" className="r-nav">
                <a href="#top" className="r-brand">
                    <span className="gloss r-brand-badge">GR</span>
                    <span className="r-brand-text">
                        <span className="r-brand-name">Gaven Robertson</span>
                        <span className="r-brand-sub">{subtitle}</span>
                    </span>
                </a>
                <div aria-hidden="true" className="r-marquee">
                    <div className="r-marquee-track"><span>{marquee}</span><span>{marquee}</span></div>
                </div>
                <div className="r-nav-actions">
                    <button className="glass r-pill r-pill--toggle" type="button" aria-pressed={!flat} onClick={onToggle3d} aria-label="Toggle 3D animations">
                        <span aria-hidden="true" className={`r-toggle-dot${flat ? '' : ' is-on'}`} />
                        {flat ? '3D: OFF' : '3D: ON'}
                    </button>
                    <button
                        className="glass r-pill r-pill--icon"
                        type="button"
                        onClick={onToggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
                    </button>
                    <a className="glass r-pill r-nav-link" href={`#${projectsId}`}>Projects</a>
                    <a className="glass r-pill r-nav-link" href="#about">About</a>
                    <a className="gloss r-pill r-pill--cta" href="#contact">Contact</a>
                </div>
            </nav>
        </header>
    );
}

export function RetroWindow({ title, className = '', titleIcon = null, children, ...rest }) {
    return (
        <div className={`r-window ${className}`} {...rest}>
            <div className="r-titlebar">
                <span className="r-titlebar-title">{titleIcon}{title}</span>
                <span aria-hidden="true" className="r-titlebar-buttons">
                    <span className="r-titlebar-btn" />
                    <span className="r-titlebar-btn r-titlebar-btn--close" />
                </span>
            </div>
            {children}
        </div>
    );
}

// The sticky stage the scroll animation plays in: setup dialog, scroll hint and player overlay.
export function ScrollStage({ id, scene, bgText, setupTitle, steps, firstStepLabel, hint, children }) {
    const { trackRef, stageRef, canvasRef, bgRef, sceneState } = scene;
    const { step, pct } = sceneState;
    const cur = steps[step];
    const done = step >= steps.length - 1;
    return (
        <section id={id} ref={trackRef} className="r-track">
            <div ref={stageRef} className="r-stage">
                <div aria-hidden="true" ref={bgRef} className="r-bgtext">{bgText}</div>
                <canvas ref={canvasRef} aria-hidden="true" className="r-canvas" />
                <div aria-hidden="true" className="r-scanlines" />
                <div className="r-overlay">
                    {!done && (
                        <RetroWindow title={setupTitle} titleIcon={<Icon.Chip />} className="r-window--setup" role="status" aria-live="polite">
                            <div className="r-setup-body">
                                <span className="r-setup-label">{step === 0 ? firstStepLabel : `Step ${step} of ${steps.length - 2}`}</span>
                                <span className="r-setup-title">{cur.t}</span>
                                <span className="r-setup-text">{cur.b}</span>
                                <div className="r-progress"><div className="r-progress-bar" style={{ width: `${pct}%` }} /></div>
                                <span className="r-setup-pct">{pct}% complete</span>
                            </div>
                        </RetroWindow>
                    )}
                    {step === 0 && (
                        <div className="r-hint">
                            <span>{hint}<span className="blink">_</span></span>
                            <Icon.ChevronDown />
                        </div>
                    )}
                    {done && children}
                </div>
            </div>
        </section>
    );
}

// Player / patch-bay console shown once the build finishes.
export function PlayerPanel({ label, brand, lcdTrack, lcdText, labels, tracks, selected, openHref, dotVariant, api }) {
    return (
        <div role="region" aria-label={label} className="r-player">
            <div className="r-player-row">
                <span className="r-player-brand">{brand}</span>
                <div aria-live="polite" className="r-lcd">
                    <span className="r-lcd-track">{lcdTrack}</span>
                    <span className="r-lcd-text">{lcdText}</span>
                </div>
            </div>
            <div className="r-player-row r-player-row--controls">
                <button className="glass r-ctrl r-ctrl--icon" type="button" aria-label={labels.prev} onClick={api.prev}><Icon.Prev /></button>
                <button className="gloss r-ctrl r-ctrl--play" type="button" onClick={api.play}><Icon.Play />{labels.play}</button>
                <button className="glass r-ctrl r-ctrl--eject" type="button" onClick={api.eject}><Icon.Eject />{labels.eject}</button>
                <button className="glass r-ctrl r-ctrl--icon" type="button" aria-label={labels.next} onClick={api.next}><Icon.Next /></button>
                <div className="r-spacer" />
                {openHref && (
                    <a className="gloss r-ctrl r-ctrl--open" href={openHref} {...externalProps(openHref)}>Open project<Icon.External /></a>
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

export function FlatHeader({ prompt, text, onToggle3d }) {
    return (
        <div className="r-section-head">
            <div className="r-heading-stack">
                <span className="r-prompt">{prompt}</span>
                <h2 className="chrome r-display">Projects.</h2>
                <p className="r-lede">{text}</p>
            </div>
            <button className="glass r-switch3d" type="button" onClick={onToggle3d}><Icon.Cube />Switch to 3D mode</button>
        </div>
    );
}

export function OpenProjectLink({ href, className }) {
    return (
        <a className={`gloss r-open-btn ${className}`} href={href} {...externalProps(href)}>Open project<Icon.External /></a>
    );
}

export function RackPlate({ children }) {
    return (
        <div className="r-rack">
            <RackEar />
            {children}
            <RackEar />
        </div>
    );
}

function RackEar() {
    return (
        <div aria-hidden="true" className="r-rack-ear"><span className="r-screw" /><span className="r-screw" /></div>
    );
}

// A rack card of "ports": one per skill. Pending ports get an amber, flickering LED.
export function SkillSlot({ id, name, status, ports }) {
    return (
        <RackPlate>
            <div className="r-rack-body">
                <div className="r-slot-label">
                    <span className="r-slot-id">{id}</span>
                    <span className="r-slot-name">{name}</span>
                    <span className="r-slot-status">{status}</span>
                </div>
                <div className="r-ports">
                    {ports.map((p) => (
                        <div key={p.name} className={`r-port${p.pending ? ' is-pending' : ''}`}>
                            <span aria-hidden="true" className="r-port-jack" />
                            <span className="r-port-name">{p.name}</span>
                            <span aria-hidden="true" className="r-port-led" />
                        </div>
                    ))}
                </div>
            </div>
        </RackPlate>
    );
}

export function SysInfo({ rows, status }) {
    return (
        <div className="r-sysinfo">
            {rows.map(([k, v]) => (
                <div key={k} className="r-sysinfo-row"><span className="r-sysinfo-key">{k}</span><span>{v}</span></div>
            ))}
            <div className="r-sysinfo-row">
                <span className="r-sysinfo-key">STATUS</span>
                <span className="r-status"><span aria-hidden="true" className="ledflick r-status-led" />{status}</span>
            </div>
        </div>
    );
}

export function HistoryLog({ title, entries, prompt }) {
    return (
        <RetroWindow title={title}>
            <div className="r-log">
                {entries.map((e) => (
                    <div key={e.when} className="r-log-row">
                        <span className="r-log-when">{e.when}</span>
                        <div className="r-log-detail">
                            {e.items.map((item) => (
                                <React.Fragment key={item.title}>
                                    <span className="r-log-title">{item.title}</span>
                                    {item.org && <span className="r-log-org">{item.org}</span>}
                                    {item.text && <span className="r-log-text">{item.text}</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="r-log-prompt">{prompt} <span className="blink">█</span></div>
            </div>
        </RetroWindow>
    );
}

export function ContactSection({ heading, text }) {
    return (
        <section id="contact" className="r-contact">
            <div className="r-contact-inner">
                <span className="r-prompt">♦ Sign my guestbook ♦</span>
                <h2 className="chrome r-contact-title">{heading}</h2>
                <p className="r-contact-text">{text}</p>
                <div className="r-contact-links">
                    <a className="gloss r-contact-btn r-contact-btn--primary" href="mailto:gaven.robertson@gmail.com"><Icon.Mail />gaven.robertson@gmail.com</a>
                    <a className="glass r-contact-btn" href="https://github.com/gavenrobertson" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a className="glass r-contact-btn" href="https://www.linkedin.com/in/gaven-robertson-b20887232" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
            </div>
        </section>
    );
}

export function RetroFooter({ badges }) {
    return (
        <footer className="r-footer">
            <div className="r-footer-inner">
                <div aria-label="Badges" className="r-badges">
                    {badges.map(([a, b, lime]) => (
                        <span key={a + b} className={`r-badge${lime ? ' r-badge--lime' : ''}`}>{a}<br />{b}</span>
                    ))}
                </div>
                <span className="r-footer-copy">© {new Date().getFullYear()} Gaven Robertson · Thanks for visiting!</span>
            </div>
        </footer>
    );
}
