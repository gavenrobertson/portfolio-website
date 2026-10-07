import { lazy } from "react";

// Every version of the site lives under src/sites/. Each one is code-split, so
// visitors only download the site they are looking at.
export const SITES = {
    gavenos: {
        label: 'GavenOS 2000',
        theme: 'retro',
        load: () => import('./sites/gavenos/GavenOSSite'),
    },
    gavennet: {
        label: 'GavenNET Lab',
        theme: 'retro',
        load: () => import('./sites/gavennet/GavenNetSite'),
    },
    classic: {
        label: 'Classic site',
        theme: 'classic',
        load: () => import('./sites/classic/ClassicSite'),
    },
};

// The design visitors land on. Swap to 'gavennet' to make the network design the live one.
// Any site can also be previewed with ?site=<key>, e.g. ?site=gavennet.
export const PRIMARY_SITE = 'gavenos';

// Where the portal in the bottom-right corner leads from the primary site.
export const CLASSIC_SITE = 'classic';

export const SITE_COMPONENTS = Object.fromEntries(
    Object.entries(SITES).map(([key, site]) => [key, lazy(site.load)])
);

const STORAGE_KEY = 'gaven-site';

export function initialSite() {
    const requested = new URLSearchParams(window.location.search).get('site');
    if (requested && SITES[requested]) return requested;
    try {
        if (window.localStorage.getItem(STORAGE_KEY) === CLASSIC_SITE) return CLASSIC_SITE;
    } catch (e) { /* storage unavailable */ }
    return PRIMARY_SITE;
}

// Remember whether the visitor went through the portal, and drop any ?site= / #hash
// so a reload lands on the site they're looking at, from the top.
export function rememberSite(key) {
    try {
        if (key === CLASSIC_SITE) window.localStorage.setItem(STORAGE_KEY, CLASSIC_SITE);
        else window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* storage unavailable */ }
    const url = new URL(window.location.href);
    url.searchParams.delete('site');
    url.hash = '';
    window.history.replaceState(null, '', url.pathname + url.search);
}
