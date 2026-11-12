import React, { useCallback, useRef } from "react";
import baseProjects from "../retro/projects";
import {
    useFlatMode, useTheme, useScrollScene, SiteNav, ScrollStage, PlayerPanel, FlatHeader, OpenProjectLink,
    SkillGroups, FactsCard, Experience, Card, ContactSection,
} from "../retro/RetroUI";
import { useActiveSection, useReveal, scrollToBuildEnd, scrollToId } from "../shared/ux";
import { HISTORY } from "../workstation/content";
import { createScene } from "./scene";

// GavenNET Lab: the network-engineer take. Scroll to rack up a lab, then patch a VLAN in to load a project.
// Not in the style menu right now; add 'gavennet' to SCHEMES in src/siteConfig.js (or visit ?site=gavennet).

const MODELS_URL = `${process.env.PUBLIC_URL}/models/gavennet-models.json`;
const HEADER_H = 72;

const projects = baseProjects.map((p, i) => ({ ...p, vlan: (i + 1) * 10 }));

const STEPS = [
    { label: 'Start', t: 'Scroll to rack up', b: 'Network engineer and software developer. Keep scrolling to build the lab.' },
    { label: 'Patch panel', t: 'Labeled and tidy', b: 'Every connection starts somewhere: labeled, tidy, documented.' },
    { label: 'Switch', t: 'Segmented traffic', b: '24 ports, four VLANs. Segmented traffic is happy traffic.' },
    { label: 'Router', t: 'Inter-VLAN routing', b: 'Routing over an 802.1Q trunk to the switch.' },
    { label: 'Server', t: 'The software side', b: 'Where the code lives: C++ and the web.' },
    { label: 'Cabling', t: 'Links coming up', b: 'VLAN 10, 20, 30 and 40 come up one by one.' },
    { label: 'Console', t: 'Console connected', b: 'Patch in a VLAN to load a project.' },
    { label: 'Done', t: 'Lab online', b: '' },
];

const SKILLS = [
    { name: 'Network', items: ['VLANs', 'Routing', 'Switching', 'Subnetting'] },
    { name: 'Software', items: ['C++', 'React', 'JavaScript', 'HTML', 'SASS', 'three.js'] },
    { name: 'Cleared', items: ['TS/SCI clearance', 'CJIS certified', 'IT support · 45,000+ users'] },
];

const FACTS = [
    ['Role', 'Network Engineer · Software Developer'],
    ['Now', 'Software Developer @ BESPIN (AFSOC)'],
    ['Looking for', 'Entry & mid-level network roles in Huntsville, AL'],
    ['Based in', 'Montgomery, AL'],
];

function screenText(phase, project, linked) {
    if (phase === 'load') return 'Negotiating link…';
    if (phase === 'eject') return 'Link down…';
    if (linked) return `Link up: ${project.name} · click the screen or Open project`;
    return `${project.name} · press Connect`;
}

export default function GavenNetSite() {
    const rootRef = useRef(null);
    const [flat, toggle3d, forceFlat] = useFlatMode();
    const [theme, toggleTheme] = useTheme();
    const scene = useScrollScene(createScene, { projects, modelsUrl: MODELS_URL, enabled: !flat, onUnavailable: forceFlat, theme });
    const { selected, loaded, phase } = scene.sceneState;
    const current = projects[loaded >= 0 ? loaded : selected];
    const active = useActiveSection(['lab', 'about', 'contact'], flat);
    useReveal(rootRef, flat);

    const { trackRef, stageRef } = scene;
    const showProjects = useCallback(() => {
        if (trackRef.current) scrollToBuildEnd(trackRef.current, stageRef.current, HEADER_H);
        else scrollToId('lab');
    }, [trackRef, stageRef]);
    const busy = phase === 'load' || phase === 'eject';

    return (
        <div id="top" ref={rootRef} className="retro-site">
            <SiteNav
                subtitle="Network Engineer · Software Developer"
                links={[
                    { id: 'lab', label: 'Projects', onClick: showProjects },
                    { id: 'about', label: 'About' },
                    { id: 'contact', label: 'Contact' },
                ]}
                active={active}
                flat={flat}
                onToggle3d={toggle3d}
                theme={theme}
                onToggleTheme={toggleTheme}
            />

            {!flat ? (
                <ScrollStage id="lab" scene={scene} bgText="GAVEN ROBERTSON · GAVEN ROBERTSON ·" steps={STEPS} onSkip={showProjects}>
                    <PlayerPanel
                        label="Patch bay"
                        eyebrow="Patch bay"
                        screenTag={`VLAN ${current.vlan}`}
                        screenText={screenText(phase, current, loaded >= 0)}
                        labels={{ prev: 'Previous VLAN', next: 'Next VLAN', play: 'Connect', eject: 'Disconnect' }}
                        tracks={projects.map((p) => ({ name: p.name, color: p.color, num: `VLAN ${p.vlan}` }))}
                        selected={selected}
                        canPlay={!busy && loaded !== selected}
                        canEject={!busy && loaded >= 0}
                        openHref={loaded >= 0 && phase === 'play' && projects[loaded].url !== '#' ? projects[loaded].url : null}
                        dotVariant="led"
                        api={scene.api}
                    />
                </ScrollStage>
            ) : (
                <section id="lab" className="r-section r-section--flat">
                    <FlatHeader eyebrow="Selected work" title="Projects" text="Every project lives on its own VLAN." onToggle3d={toggle3d} />
                    <div className="r-project-grid">
                        {projects.map((p, i) => (
                            <article key={p.name + i} className="r-card r-project-card" data-reveal style={{ '--reveal-delay': `${(i % 2) * 80}ms` }}>
                                <div className="r-project-info">
                                    <span className="r-project-label">VLAN {p.vlan} · Fa0/{13 + i}</span>
                                    <h3 className="r-project-name">{p.name}</h3>
                                    <p className="r-project-blurb">{p.blurb}</p>
                                    <span className="r-project-stack">{p.stack}</span>
                                    <OpenProjectLink href={p.url} />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <section id="about" className="r-section r-section--about">
                <div className="r-about-intro">
                    <div className="r-heading-stack" data-reveal>
                        <span className="r-eyebrow">About</span>
                        <h2 className="r-display">Packets &amp; programs.</h2>
                        <p className="r-lede">I'm Gaven, a network engineer and software developer. I like networks that are segmented, documented and quietly reliable, and software with a bit of personality.</p>
                    </div>
                    <FactsCard rows={FACTS} />
                </div>
                <SkillGroups groups={SKILLS} />
                <div className="r-columns">
                    <Experience entries={HISTORY} />
                    <Card title="Right now" data-reveal style={{ '--reveal-delay': '80ms' }}>
                        <div className="r-now">
                            <p>Software developer at BESPIN supporting AFSOC, building toward network engineering.</p>
                        </div>
                    </Card>
                </div>
            </section>

            <ContactSection heading="Let's get connected." text="Hiring for a network or software role, or just want to talk shop? My inbox is open." />
        </div>
    );
}
