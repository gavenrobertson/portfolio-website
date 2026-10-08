import { useCallback, useState } from "react";

// Motion preferences shared by every design (plain hooks, no styles attached).

const reducedMotionQuery = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

export function prefersReducedMotion() {
    return reducedMotionQuery ? reducedMotionQuery.matches : false;
}

// The 3D / scene on-off preference (one key, so every design remembers the same choice).
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
