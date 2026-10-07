import { lazy, Suspense, useCallback, useLayoutEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { SITES, SITE_COMPONENTS, PRIMARY_SITE, CLASSIC_SITE, initialSite, rememberSite } from "./siteConfig";
import "./app.scss";

// Loaded after the page itself so three.js never blocks the first paint.
const SitePortal = lazy(() => import("./portal/SitePortal"));

function App() {
    const [site, setSite] = useState(initialSite);
    const Site = SITE_COMPONENTS[site];
    const destination = site === CLASSIC_SITE ? PRIMARY_SITE : CLASSIC_SITE;

    // Site-wide styles (html/body) are keyed off this attribute.
    useLayoutEffect(() => {
        document.documentElement.dataset.site = SITES[site].theme;
    }, [site]);

    const enterPortal = useCallback(() => {
        rememberSite(destination);
        setSite(destination);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [destination]);

    return (
        <>
            <SpeedInsights/>
            <Analytics/>
            <Suspense fallback={<div className={`site-loading site-loading--${SITES[site].theme}`}/>}>
                <Site/>
            </Suspense>
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
