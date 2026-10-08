import React from "react";
import projects from "../retro/projects";
import {
    useFlatMode, useTheme, useScrollScene, RetroNav, ScrollStage, PlayerPanel, FlatHeader, OpenProjectLink,
    SkillSlot, SysInfo, HistoryLog, RetroWindow, ContactSection,
} from "../retro/RetroUI";
import { createScene } from "./scene";
import { STEPS, FRONTEND, ALSO_RUNNING, HISTORY } from "./content";

// GavenOS 2000: scroll to build a beige-box PC, then load projects from CDs.

const MODELS_URL = `${process.env.PUBLIC_URL}/models/gavenos-models.json`;

function lcdText(phase, loaded, selected) {
    if (phase === 'load') return 'READING DISC…';
    if (phase === 'eject') return 'EJECTING…';
    if (loaded >= 0) return `▶ NOW PLAYING: ${projects[loaded].name} — click the screen to open`;
    return `SELECTED: ${projects[selected].name} — press PLAY`;
}

export default function GavenOSSite() {
    const [flat, toggle3d, forceFlat] = useFlatMode();
    const [theme, toggleTheme] = useTheme();
    const scene = useScrollScene(createScene, { projects, modelsUrl: MODELS_URL, enabled: !flat, onUnavailable: forceFlat, theme });
    const { selected, loaded, phase } = scene.sceneState;

    return (
        <div id="top" className="retro-site">
            <RetroNav
                subtitle="software_developer.exe"
                marquee="NOW LOADING: PORTFOLIO.EXE ••• SCROLL TO BUILD THE MACHINE ••• INSERT A DISC TO VIEW A PROJECT •••"
                projectsId="projects"
                flat={flat}
                onToggle3d={toggle3d}
                theme={theme}
                onToggleTheme={toggleTheme}
            />

            {!flat ? (
                <ScrollStage
                    id="projects"
                    scene={scene}
                    bgText="GAVENOS 2000 • GAVENOS 2000 •"
                    setupTitle="GavenOS 2000 Setup"
                    steps={STEPS}
                    firstStepLabel="C:\> setup.exe"
                    hint="SCROLL TO BOOT"
                >
                    <PlayerPanel
                        label="Project player"
                        brand={<>GAVEN<span>AMP</span></>}
                        lcdTrack={`TRK 0${(loaded >= 0 ? loaded : selected) + 1}`}
                        lcdText={lcdText(phase, loaded, selected)}
                        labels={{ prev: 'Previous disc', next: 'Next disc', play: 'Play', eject: 'Eject' }}
                        tracks={projects.map((p, i) => ({ name: p.name, color: p.color, num: `0${i + 1}` }))}
                        selected={selected}
                        openHref={loaded >= 0 && phase === 'play' ? projects[loaded].url : null}
                        api={scene.api}
                    />
                </ScrollStage>
            ) : (
                <section id="projects" className="r-section r-section--flat">
                    <FlatHeader prompt="C:\GAVEN\> dir D:\PROJECTS" text="Every project ships on its own disc. Pick one to open it." onToggle3d={toggle3d} />
                    <div className="r-disc-grid">
                        {projects.map((p, i) => (
                            <div key={p.name + i} className="r-disc-card">
                                <span aria-hidden="true" className="r-disc" style={{ '--disc-color': p.color }} />
                                <div className="r-project-info">
                                    <span className="r-project-label">TRACK 0{i + 1} · {p.year}</span>
                                    <span className="r-project-name">{p.name}</span>
                                    <span className="r-project-blurb">{p.blurb}</span>
                                    <span className="r-project-stack">{p.stack}</span>
                                    <OpenProjectLink href={p.url} className="r-open-btn--stacked" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section id="about" className="r-section r-section--about">
                <div className="r-about-intro">
                    <div className="r-heading-stack r-heading-stack--about">
                        <span className="r-prompt">C:\GAVEN\&gt; whoami</span>
                        <h2 className="chrome r-display">Built different. Built to last.</h2>
                        <p className="r-lede r-lede--about">I'm Gaven, a software developer. I like interfaces with personality, code that stays out of its own way, and the occasional 3D detour.</p>
                    </div>
                    <SysInfo
                        rows={[
                            ['HOSTNAME', 'GAVEN-ROBERTSON'],
                            ['ROLE', 'Software Developer @ BESPIN'],
                            ['SUPPORTING', 'AFSOC Special Warfare'],
                            ['EDUCATION', 'B.S. CS, Oregon State · M.S. CS, ASU (in progress)'],
                            ['LOCATION', 'Montgomery, AL'],
                        ]}
                        status="online"
                    />
                </div>
                <SkillSlot id="SLOT 1" name="FRONTEND" status="PCI · ready" ports={[...FRONTEND.map((name) => ({ name })), { name: '[ADD MORE]', pending: true }]} />
                <SkillSlot id="SLOT 2" name="ALSO RUNNING" status="PCI · ready" ports={[...ALSO_RUNNING.map((name) => ({ name })), { name: '[ADD MORE]', pending: true }]} />
                <div className="r-windows">
                    <HistoryLog title="history.log" entries={HISTORY} prompt="C:\GAVEN\>" />
                    <RetroWindow title="autoexec.bat">
                        <div className="r-script">
                            <span className="r-script-kw">@ECHO OFF</span>
                            <span>ECHO Software developer at BESPIN, supporting AFSOC as a Special Warfare Operations Integrator.</span>
                            <span>ECHO Front-end roots: React, SASS and Tailwind, plus a habit of building things in 3D.</span>
                        </div>
                    </RetroWindow>
                </div>
            </section>

            <ContactSection heading="Let's build something." text="Got a project, a role, or just want to talk shop? My inbox is open." />
        </div>
    );
}
