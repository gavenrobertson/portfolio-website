import React, { useCallback, useRef } from "react";
import projects from "../retro/projects";
import {
    useFlatMode, useTheme, useScrollScene, SiteNav, ScrollStage, PlayerPanel, FlatHeader, OpenProjectLink,
    SkillGroups, FactsCard, Experience, ContactSection, Bio, Likes, EducationCard, NowCard, StudioSection,
} from "../retro/RetroUI";
import { useActiveSection, useReveal, scrollToBuildEnd, scrollToId } from "../shared/ux";
import { createScene } from "./scene";
import { STEPS, SKILLS, FACTS, ABOUT, HISTORY, EDUCATION, STUDIO } from "./content";

// Workstation: scroll to build a PC in 3D, then load projects onto its monitor from CDs.

const MODELS_URL = `${process.env.PUBLIC_URL}/models/workstation-models.json`;
const HEADER_H = 72;

function screenText(phase, loaded, selected) {
    if (phase === 'load') return 'Loading…';
    if (phase === 'eject') return 'Ejecting…';
    if (loaded >= 0) return `${projects[loaded].name} · click the screen or Open project`;
    return `${projects[selected].name} · press Play to load it`;
}

export default function WorkstationSite() {
    const rootRef = useRef(null);
    const [flat, toggle3d, forceFlat] = useFlatMode();
    const [theme, toggleTheme] = useTheme();
    const scene = useScrollScene(createScene, { projects, modelsUrl: MODELS_URL, enabled: !flat, onUnavailable: forceFlat, theme });
    const { selected, loaded, phase } = scene.sceneState;
    const active = useActiveSection(['projects', 'about', 'studio', 'contact'], flat);
    useReveal(rootRef, flat);

    const { trackRef, stageRef } = scene;
    const showProjects = useCallback(() => {
        if (trackRef.current) scrollToBuildEnd(trackRef.current, stageRef.current, HEADER_H);
        else scrollToId('projects');
    }, [trackRef, stageRef]);

    const busy = phase === 'load' || phase === 'eject';

    return (
        <div id="top" ref={rootRef} className="retro-site">
            <SiteNav
                subtitle="Software Engineer"
                links={[
                    { id: 'projects', label: 'Projects', onClick: showProjects },
                    { id: 'about', label: 'About' },
                    { id: 'studio', label: 'Studio' },
                    { id: 'contact', label: 'Contact' },
                ]}
                active={active}
                flat={flat}
                onToggle3d={toggle3d}
                theme={theme}
                onToggleTheme={toggleTheme}
            />

            {!flat ? (
                <ScrollStage
                    id="projects"
                    scene={scene}
                    bgText="GAVEN ROBERTSON · GAVEN ROBERTSON ·"
                    steps={STEPS}
                    onSkip={showProjects}
                >
                    <PlayerPanel
                        label="Project player"
                        eyebrow="Projects"
                        screenTag={`${String((loaded >= 0 ? loaded : selected) + 1).padStart(2, '0')}/${String(projects.length).padStart(2, '0')}`}
                        screenText={screenText(phase, loaded, selected)}
                        labels={{ prev: 'Previous project', next: 'Next project', play: 'Play', eject: 'Eject' }}
                        tracks={projects.map((p, i) => ({ name: p.name, color: p.color, num: String(i + 1).padStart(2, '0') }))}
                        selected={selected}
                        canPlay={!busy && loaded !== selected}
                        canEject={!busy && loaded >= 0}
                        openHref={loaded >= 0 && phase === 'play' && projects[loaded].url !== '#' ? projects[loaded].url : null}
                        api={scene.api}
                    />
                </ScrollStage>
            ) : (
                <section id="projects" className="r-section r-section--flat">
                    <FlatHeader eyebrow="Selected work" title="Projects" text="A few things I've built recently." onToggle3d={toggle3d} />
                    <div className="r-project-grid">
                        {projects.map((p, i) => (
                            <article key={p.name + i} className="r-card r-project-card" data-reveal style={{ '--reveal-delay': `${(i % 2) * 80}ms` }}>
                                <span aria-hidden="true" className="r-disc" style={{ '--disc-color': p.color }} />
                                <div className="r-project-info">
                                    <span className="r-project-label">{String(i + 1).padStart(2, '0')} · {p.year}</span>
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
                        <h2 className="r-display chrome">{ABOUT.heading}</h2>
                        <p className="r-lede">{ABOUT.lede}</p>
                    </div>
                    <FactsCard rows={FACTS} />
                </div>
                <Bio paragraphs={ABOUT.bio} />
                <h3 className="r-eyebrow r-subhead" data-reveal>What I like building</h3>
                <Likes items={ABOUT.likes} />
                <h3 className="r-eyebrow r-subhead" data-reveal>Stack</h3>
                <SkillGroups groups={SKILLS} />
                <div className="r-columns">
                    <Experience entries={HISTORY} />
                    <div className="r-side">
                        <EducationCard entries={EDUCATION} />
                        <NowCard items={ABOUT.now} />
                    </div>
                </div>
            </section>

            <StudioSection studio={STUDIO} />

            <ContactSection heading="Let's build something." text="Got a project, a role, or just want to talk shop? My inbox is open." />
        </div>
    );
}
