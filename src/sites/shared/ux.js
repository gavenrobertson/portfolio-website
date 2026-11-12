import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./motion";

// Small UX helpers shared by every design.

// Fade elements marked with data-reveal in as they scroll into view.
// `key` re-scans when the page swaps sections (e.g. 3D on/off).
export function useReveal(rootRef, key) {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        const items = root.querySelectorAll('[data-reveal]:not(.is-revealed)');
        if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-revealed'));
            return undefined;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        items.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [rootRef, key]);
}

// Which of the given section ids is in the middle of the viewport (for nav highlighting).
export function useActiveSection(ids, key) {
    const [active, setActive] = useState(null);
    const idList = ids.join(',');
    useEffect(() => {
        if (!('IntersectionObserver' in window)) return undefined;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
        }, { rootMargin: '-45% 0px -50% 0px' });
        idList.split(',').forEach((id) => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, [idList, key]);
    return active;
}

// Scroll so a scroll-driven build (a tall track with a sticky stage) shows its finished state.
export function scrollToBuildEnd(track, stage, headerHeight) {
    if (!track || !stage) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const y = top - headerHeight + track.offsetHeight - stage.offsetHeight + 2;
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}
