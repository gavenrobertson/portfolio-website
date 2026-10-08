import React, { useEffect, useRef, useState } from "react";
import { SITES } from "../siteConfig";
import "./switcher.scss";

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const idle = () => new Promise((resolve) => (
    window.requestIdleCallback ? window.requestIdleCallback(resolve, { timeout: 600 }) : setTimeout(resolve, 150)
));

const ENTER_MS = 450;
const MIN_HOLD_MS = 900;
const EXIT_MS = 450;

// Loading screen shown while swapping designs, styled after the design being loaded.
function LoadingScreen({ siteKey, phase }) {
    const site = SITES[siteKey];
    if (site.theme === 'toybox') {
        return (
            <div className={`ds-loader ds-loader--toybox is-${phase}`} role="status" aria-live="polite">
                <div className="ds-blocks" aria-hidden="true">
                    <span /><span /><span /><span />
                </div>
                <span className="ds-toybox-title">Loading {site.label}…</span>
                <span className="ds-toybox-bar" aria-hidden="true"><span /></span>
            </div>
        );
    }
    return (
        <div className={`ds-loader ds-loader--crt is-${phase}`} role="status" aria-live="polite">
            <div className="ds-crt-screen">
                <span className="ds-crt-line">C:\&gt; BOOT {site.label.toUpperCase()}</span>
                <span className="ds-crt-line ds-crt-dim">Loading design scheme<span className="ds-crt-cursor">_</span></span>
                <span className="ds-crt-blocks" aria-hidden="true"><span /></span>
            </div>
        </div>
    );
}

// Bottom-left "Style" button: pick a design scheme, swap to it behind a themed loading screen.
export default function DesignSwitcher({ schemes, current, onSwitch }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(null); // { key, phase: 'in' | 'hold' | 'out' }
    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const busy = useRef(false);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('pointerdown', onPointer);
        return () => document.removeEventListener('pointerdown', onPointer);
    }, [open]);

    const choose = async (key) => {
        setOpen(false);
        if (key === current || busy.current) return;
        busy.current = true;
        const ready = SITES[key].load().catch(() => null);
        try {
            if (reducedMotion()) {
                await ready;
                onSwitch(key);
                return;
            }
            setLoading({ key, phase: 'in' });
            await wait(ENTER_MS);
            setLoading({ key, phase: 'hold' });
            await Promise.all([ready, wait(MIN_HOLD_MS)]);
            onSwitch(key);
            await nextFrame();
            await idle();
            setLoading({ key, phase: 'out' });
            await wait(EXIT_MS);
        } finally {
            setLoading(null);
            busy.current = false;
        }
    };

    const onMenuKey = (e) => {
        if (e.key === 'Escape') {
            setOpen(false);
            if (buttonRef.current) buttonRef.current.focus();
        }
    };

    return (
        <>
            <div ref={rootRef} className={`ds-root ds-root--${SITES[current].theme}`} onKeyDown={onMenuKey}>
                {open && (
                    <div className="ds-menu" id="ds-menu" aria-label="Design schemes">
                        <span className="ds-menu-title">Design scheme</span>
                        {schemes.map((key) => {
                            const site = SITES[key];
                            const active = key === current;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={`ds-option${active ? ' is-active' : ''}`}
                                    aria-current={active ? 'true' : undefined}
                                    onClick={() => choose(key)}
                                    onPointerEnter={() => site.load().catch(() => null)}
                                    onFocus={() => site.load().catch(() => null)}
                                >
                                    <span className="ds-swatch" aria-hidden="true">
                                        {site.swatch.map((c) => <span key={c} style={{ background: c }} />)}
                                    </span>
                                    <span className="ds-option-text">
                                        <span className="ds-option-name">{site.label}</span>
                                        <span className="ds-option-blurb">{site.blurb}</span>
                                    </span>
                                    {active && <span className="ds-option-tag">Current</span>}
                                </button>
                            );
                        })}
                    </div>
                )}
                <button
                    ref={buttonRef}
                    type="button"
                    className="ds-button"
                    aria-expanded={open}
                    aria-controls="ds-menu"
                    aria-label={`Change design (current: ${SITES[current].label})`}
                    onClick={() => setOpen((o) => !o)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z" />
                        <circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" /><circle cx="10.5" cy="7.5" r="1.2" fill="currentColor" /><circle cx="15.5" cy="7.5" r="1.2" fill="currentColor" />
                    </svg>
                    <span className="ds-button-label">Style</span>
                </button>
            </div>
            {loading && <LoadingScreen siteKey={loading.key} phase={loading.phase} />}
        </>
    );
}
