import React from "react";
import baseProjects from "../retro/projects";
import {
    useFlatMode, useTheme, useScrollScene, RetroNav, ScrollStage, PlayerPanel, FlatHeader, OpenProjectLink,
    RackPlate, SkillSlot, SysInfo, HistoryLog, RetroWindow, ContactSection,
} from "../retro/RetroUI";
import { createScene } from "./scene";

// GavenNET Lab: the network-engineer take. Scroll to rack up a lab, then patch a VLAN in to load a project.
// Not live right now; set PRIMARY_SITE in src/siteConfig.js to 'gavennet' (or visit ?site=gavennet) to use it.

const MODELS_URL = `${process.env.PUBLIC_URL}/models/gavennet-models.json`;

const projects = baseProjects.map((p, i) => ({ ...p, vlan: (i + 1) * 10 }));

const STEPS = [
    { t: 'Welcome to GavenOS 2000 · Network Edition', b: 'Network engineer and software developer. Scroll to rack up the lab.' },
    { t: 'Mounting patch panel…', b: 'Every connection starts somewhere: labeled, tidy, documented.' },
    { t: 'Installing the switch…', b: '24 ports, four VLANs. Segmented traffic is happy traffic.' },
    { t: 'Racking the router…', b: 'Inter-VLAN routing over an 802.1Q trunk to the switch.' },
    { t: 'Racking the build server…', b: 'Where the software side lives: C++ and the web.' },
    { t: 'Patching cables…', b: 'VLAN 10, 20, 30 and 40 come up one by one.' },
    { t: 'Connecting the console…', b: 'Blue console cable to the terminal. Next: patch in a VLAN to load a project.' },
    { t: 'Lab online', b: '' },
];

const NETWORK = [
    { name: 'VLANs' }, { name: 'Routing' }, { name: 'Switching' }, { name: 'Subnetting' },
    { name: '[CLOUD: AWS / AZURE]', pending: true }, { name: '[NETWORK CERTS]', pending: true },
];
const SOFTWARE = ['C++', 'React', 'JavaScript', 'HTML', 'SASS', 'three.js'].map((name) => ({ name }));
const CLEARED = ['TS/SCI clearance', 'CJIS certified', 'IT support · 45,000+ users'].map((name) => ({ name }));

const HISTORY = [
    { when: 'FEB 2025 – NOW', items: [{ title: 'Software Developer · AFSOC Special Warfare Operations Integrator', org: 'BESPIN' }] },
    { when: 'JAN – JUN 2024', items: [{ title: 'Frontend Developer', org: 'Oregon State University', text: 'Built the main chatbot and its design and style architecture with React, Vite and Tailwind, on a team of 11.' }] },
    { when: 'JUN – AUG 2023', items: [{ title: 'Frontend Developer', org: 'Siten JSC · Hanoi, Vietnam', text: 'Template sites in HTML, SASS and React; moved the company site to React with better UX/UI.' }] },
    { when: 'OCT 2021 – FEB 2025', items: [{ title: 'Information Technology', org: 'Oregon State University', text: 'Supported 45,000+ students and faculty and trained new staff.' }] },
    {
        when: 'EDUCATION',
        items: [
            { title: 'M.S. Computer Science · Arizona State University', org: '2026 – 2028 · in progress' },
            { title: 'B.S. Computer Science · Oregon State University', org: '2019 – 2024' },
        ],
    },
];

function lcdText(phase, project, linked) {
    if (phase === 'load') return 'NEGOTIATING LINK…';
    if (phase === 'eject') return 'LINK DOWN…';
    if (linked) return `▶ LINK UP: ${project.name} — click the screen to open`;
    return `SELECTED: ${project.name} — press CONNECT`;
}

export default function GavenNetSite() {
    const [flat, toggle3d, forceFlat] = useFlatMode();
    const [theme, toggleTheme] = useTheme();
    const scene = useScrollScene(createScene, { projects, modelsUrl: MODELS_URL, enabled: !flat, onUnavailable: forceFlat, theme });
    const { selected, loaded, phase } = scene.sceneState;
    const current = projects[loaded >= 0 ? loaded : selected];

    return (
        <div id="top" className="retro-site">
            <RetroNav
                subtitle="net_engineer + software_dev"
                marquee="NOW LOADING: GAVENNET LAB ••• SCROLL TO RACK THE NETWORK ••• PATCH A VLAN TO VIEW A PROJECT •••"
                projectsId="lab"
                flat={flat}
                onToggle3d={toggle3d}
                theme={theme}
                onToggleTheme={toggleTheme}
            />

            {!flat ? (
                <ScrollStage
                    id="lab"
                    scene={scene}
                    bgText="GAVENOS 2000 • GAVENOS 2000 •"
                    setupTitle="GavenNET Setup"
                    steps={STEPS}
                    firstStepLabel="GR-RTR1> enable"
                    hint="SCROLL TO RACK UP"
                >
                    <PlayerPanel
                        label="Patch bay"
                        brand={<>PATCH<span>BAY</span></>}
                        lcdTrack={`VLAN ${current.vlan}`}
                        lcdText={lcdText(phase, current, loaded >= 0)}
                        labels={{ prev: 'Previous VLAN', next: 'Next VLAN', play: 'Connect', eject: 'Disconnect' }}
                        tracks={projects.map((p) => ({ name: p.name, color: p.color, num: `VLAN ${p.vlan}` }))}
                        selected={selected}
                        openHref={loaded >= 0 && phase === 'play' ? projects[loaded].url : null}
                        dotVariant="led"
                        api={scene.api}
                    />
                </ScrollStage>
            ) : (
                <section id="lab" className="r-section r-section--flat">
                    <FlatHeader prompt="GR-RTR1# show vlan brief" text="Every project lives on its own VLAN. Pick one to open it." onToggle3d={toggle3d} />
                    {projects.map((p, i) => (
                        <RackPlate key={p.name + i}>
                            <div className="r-rack-body r-rack-body--project">
                                <div className="r-vlan-label" style={{ '--vlan-color': p.color }}>
                                    <span className="r-vlan-stripe" />
                                    <span className="r-vlan-id">VLAN {p.vlan}</span>
                                    <span className="r-vlan-port"><span aria-hidden="true" className="r-vlan-led" />Fa0/{13 + i} · up</span>
                                </div>
                                <div className="r-project-info r-project-info--vlan">
                                    <span className="r-project-name">{p.name}</span>
                                    <span className="r-project-blurb">{p.blurb}</span>
                                    <span className="r-project-stack">{p.stack}</span>
                                </div>
                                <OpenProjectLink href={p.url} className="r-open-btn--inline" />
                            </div>
                        </RackPlate>
                    ))}
                </section>
            )}

            <section id="about" className="r-section r-section--about">
                <div className="r-about-intro">
                    <div className="r-heading-stack r-heading-stack--about">
                        <span className="r-prompt">GR-RTR1# show interfaces gaven</span>
                        <h2 className="chrome r-display">Packets &amp; programs.</h2>
                        <p className="r-lede r-lede--about">I'm Gaven, a network engineer and software developer. I like networks that are segmented, documented and quietly reliable, and software with a bit of personality.</p>
                    </div>
                    <SysInfo
                        rows={[
                            ['HOSTNAME', 'GAVEN-ROBERTSON'],
                            ['ROLE', 'Network Engineer · Software Developer'],
                            ['NOW', 'Software Developer @ BESPIN (AFSOC)'],
                            ['LOOKING FOR', 'Entry & mid-level network roles in Huntsville, AL'],
                            ['LOCATION', 'Montgomery, AL'],
                        ]}
                        status="up / up"
                    />
                </div>
                <SkillSlot id="Gi0/1" name="NETWORK" status="up / up" ports={NETWORK} />
                <SkillSlot id="Gi0/2" name="SOFTWARE" status="up / up" ports={SOFTWARE} />
                <SkillSlot id="Gi0/3" name="CLEARED" status="up / up" ports={CLEARED} />
                <div className="r-windows">
                    <HistoryLog title="show logging" entries={HISTORY} prompt="GR-RTR1#" />
                    <RetroWindow title="running-config.txt">
                        <div className="r-script">
                            <span className="r-script-kw">interface Gaven0</span>
                            <span className="r-script-indent">description Software developer at BESPIN supporting AFSOC, building toward network engineering</span>
                            <span className="r-script-indent">no shutdown</span>
                            <span className="r-script-kw">end</span>
                        </div>
                    </RetroWindow>
                </div>
            </section>

            <ContactSection heading="Let's get connected." text="Hiring for a network or software role, or just want to talk shop? My inbox is open." />
        </div>
    );
}
