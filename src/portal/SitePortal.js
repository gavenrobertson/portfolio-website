import React, { useEffect, useRef, useState } from "react";
import { createPortalScene } from "./portalScene";
import "./portal.scss";

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
// Wait for the incoming site to finish its first heavy setup (e.g. building the 3D scene)
// so the reveal animation doesn't stutter.
const idle = () => new Promise((resolve) => (
    window.requestIdleCallback ? window.requestIdleCallback(resolve, { timeout: 600 }) : setTimeout(resolve, 150)
));

// Fixed bottom-right portal that swaps between the new site and the classic one.
// Clicking it floods the screen from the portal, swaps sites underneath, then
// shrinks back into the portal.
export default function SitePortal({ destinationLabel, toClassic, preload, onEnter }) {
    const canvasRef = useRef(null);
    const buttonRef = useRef(null);
    const warpRef = useRef(null);
    const sceneRef = useRef(null);
    const busyRef = useRef(false);
    const [webgl, setWebgl] = useState(true);
    const [warping, setWarping] = useState(false);

    useEffect(() => {
        const scene = createPortalScene(canvasRef.current, { still: reducedMotion() });
        if (!scene) {
            setWebgl(false);
            return undefined;
        }
        sceneRef.current = scene;
        return () => {
            scene.dispose();
            sceneRef.current = null;
        };
    }, []);

    const setHover = (on) => sceneRef.current && sceneRef.current.setHover(on);

    const enter = async () => {
        if (busyRef.current) return;
        busyRef.current = true;
        const loading = preload().catch(() => null);
        const warp = warpRef.current;

        if (reducedMotion() || !warp || !warp.animate) {
            await loading;
            onEnter();
            busyRef.current = false;
            return;
        }

        const r = buttonRef.current.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        warp.style.setProperty('--warp-x', `${x}px`);
        warp.style.setProperty('--warp-y', `${y}px`);
        const closed = `circle(0px at ${x}px ${y}px)`;
        const open = `circle(150vmax at ${x}px ${y}px)`;

        let entered = false;
        const animations = [];
        try {
            if (sceneRef.current) sceneRef.current.setSurge(true);
            setWarping(true);
            await nextFrame();
            animations.push(warp.animate([{ clipPath: closed }, { clipPath: open }], {
                duration: 750, easing: 'cubic-bezier(.7, 0, .84, 0)', fill: 'forwards',
            }));
            await Promise.all([animations[0].finished, loading]);
            onEnter();
            entered = true;
            await nextFrame();
            await idle();
            animations.push(warp.animate([{ clipPath: open }, { clipPath: closed }], {
                duration: 650, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'forwards',
            }));
            await animations[1].finished;
        } catch (e) {
            // An interrupted animation still has to land on the other site.
            if (!entered) onEnter();
        } finally {
            animations.forEach((a) => a.cancel());
            setWarping(false);
            if (sceneRef.current) sceneRef.current.setSurge(false);
            busyRef.current = false;
        }
    };

    const label = toClassic ? 'Visit my old site' : `Back to ${destinationLabel}`;

    return (
        <>
            <div className={`site-portal${toClassic ? '' : ' site-portal--return'}`}>
                <span className="site-portal__label" aria-hidden="true">{label}</span>
                <button
                    ref={buttonRef}
                    type="button"
                    className="site-portal__button"
                    aria-label={`Portal: switch to the ${toClassic ? 'classic site' : destinationLabel}`}
                    title={label}
                    onClick={enter}
                    onPointerEnter={() => setHover(true)}
                    onPointerLeave={() => setHover(false)}
                    onFocus={() => setHover(true)}
                    onBlur={() => setHover(false)}
                    onMouseEnter={() => preload().catch(() => null)}
                >
                    <canvas ref={canvasRef} className="site-portal__canvas" aria-hidden="true" hidden={!webgl}/>
                    {!webgl && <span className="site-portal__fallback" aria-hidden="true"/>}
                </button>
            </div>
            <div ref={warpRef} className="site-portal__warp" aria-hidden="true" hidden={!warping}/>
        </>
    );
}
