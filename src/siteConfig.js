import { lazy } from "react";

// Every version of the site lives under src/sites/. Each one is code-split, so
// visitors only download the site they are looking at.
export const SITES = {
    gavenos: {
        label: 'GavenOS 2000',
        blurb: 'Y2K desktop, built in 3D',
        theme: 'retro',
        swatch: ['#0B0B0D', '#B4F25A', '#E9E2CC'],
        load: () => import('./sites/gavenos/GavenOSSite'),
    },
    toybox: {
        label: 'Toybox',
        blurb: 'Chunky cartoon toys',
        theme: 'toybox',
        swatch: ['#CFEFFF', '#FF9F1C', '#1E2A4A'],
        load: () => import('./sites/toybox/ToyboxSite'),
    },
    gavennet: {
        label: 'GavenNET Lab',
        blurb: 'Network rack, built in 3D',
        theme: 'retro',
        swatch: ['#0B0B0D', '#5FD3FF', '#B4F25A'],
        load: () => import('./sites/gavennet/GavenNetSite'),
    },
    classic: {
        label: 'Classic site',
        theme: 'classic',
        load: () => import('./sites/classic/ClassicSite'),
    },
};

// The design visitors land on the first time.
// Any site can also be previewed with ?site=<key>, e.g. ?site=gavennet.
export const PRIMARY_SITE = 'gavenos';

// Designs visitors can swap between with the style button (bottom-left). Add 'gavennet' to offer it too.
export const SCHEMES = ['gavenos', 'toybox'];

// Where the portal in the bottom-right corner leads from any design.
export const CLASSIC_SITE = 'classic';

export const SITE_COMPONENTS = Object.fromEntries(
    Object.entries(SITES).map(([key, site]) => [key, lazy(site.load)])
);

const SITE_KEY = 'gaven-site';
const SCHEME_KEY = 'gaven-scheme';

function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
}

export function initialSite() {
    const requested = new URLSearchParams(window.location.search).get('site');
    if (requested && SITES[requested]) return requested;
    const stored = read(SITE_KEY);
    return stored && SITES[stored] ? stored : PRIMARY_SITE;
}

// The design the portal returns to from the classic site.
export function lastScheme() {
    const stored = read(SCHEME_KEY);
    return stored && SITES[stored] && stored !== CLASSIC_SITE ? stored : PRIMARY_SITE;
}

// Remember where the visitor is, and drop any ?site= / #hash so a reload lands on
// the site they're looking at, from the top.
export function rememberSite(key) {
    try {
        if (key === PRIMARY_SITE) window.localStorage.removeItem(SITE_KEY);
        else window.localStorage.setItem(SITE_KEY, key);
        if (key !== CLASSIC_SITE) window.localStorage.setItem(SCHEME_KEY, key);
    } catch (e) { /* storage unavailable */ }
    const url = new URL(window.location.href);
    url.searchParams.delete('site');
    url.hash = '';
    window.history.replaceState(null, '', url.pathname + url.search);
}
