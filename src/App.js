import { lazy, Suspense, useCallback, useLayoutEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { SITES, SITE_COMPONENTS, SCHEMES, CLASSIC_SITE, initialSite, lastScheme, rememberSite } from "./siteConfig";
import DesignSwitcher from "./switcher/DesignSwitcher";
import "./app.scss";

// Loaded after the page itself so three.js never blocks the first paint.
const SitePortal = lazy(() => import("./portal/SitePortal"));

function App() {
    const [site, setSite] = useState(initialSite);
    // The design the portal leads back to from the classic site.
    const [scheme, setScheme] = useState(() => (site === CLASSIC_SITE ? lastScheme() : site));
    const Site = SITE_COMPONENTS[site];
    const destination = site === CLASSIC_SITE ? scheme : CLASSIC_SITE;

    // Site-wide styles (html/body) are keyed off this attribute.
    useLayoutEffect(() => {
        document.documentElement.dataset.site = SITES[site].theme;
    }, [site]);

    const goTo = useCallback((key) => {
        rememberSite(key);
        if (key !== CLASSIC_SITE) setScheme(key);
        setSite(key);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const enterPortal = useCallback(() => goTo(destination), [goTo, destination]);

    return (
        <>
            <SpeedInsights/>
            <Analytics/>
            <Suspense fallback={<div className={`site-loading site-loading--${SITES[site].theme}`}/>}>
                <Site/>
            </Suspense>
            {site !== CLASSIC_SITE && (
                <DesignSwitcher schemes={SCHEMES.includes(site) ? SCHEMES : [site, ...SCHEMES]} current={site} onSwitch={goTo}/>
            )}
            <Suspense fallback={null}>
                <SitePortal
                    destinationLabel={SITES[destination].label}
                    toClassic={destination === CLASSIC_SITE}
                    preload={SITES[destination].load}
                    onEnter={enterPortal}
                />
            </Suspense>
        </>
    );
}

export default App;
