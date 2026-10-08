import React from "react";

// The isometric desk for the Toybox design: a cartoon PC tower that builds itself as
// you scroll, then a monitor, keyboard and a CD wallet. Pure SVG; every moving part
// gets its transform from ToyboxSite (see partStyles / discStyles).

const O = '#1E2A4A';
const line = { stroke: O, strokeLinejoin: 'round' };
// Planes of the isometric projection, for drawing flat details onto box faces.
const FRONT_TOWER = 'matrix(0.894 0.447 0 1 576 319)';
const SIDE_TOWER = 'matrix(-0.894 0.447 0 1 758 312)';
const FRONT_MONITOR = 'matrix(0.894 0.447 0 1 380 241)';
const TOP_KEYBOARD = 'matrix(0.894 0.447 -0.894 0.447 352 383)';

function Poly({ points, fill, w = 3 }) {
    return <polygon points={points} fill={fill} strokeWidth={w} {...line} />;
}

function Disc({ color, style }) {
    return (
        <g style={style}>
            <circle r="36" fill="#EEF2F8" stroke={O} strokeWidth="3" />
            <circle r="26" fill="none" stroke={color} strokeWidth="12" strokeDasharray="64 100" />
            <circle r="14" fill="#C9CCD2" stroke={O} strokeWidth="2" />
            <circle r="6" fill="#CFEFFF" stroke={O} strokeWidth="2" />
        </g>
    );
}

export default function DeskScene({ zoom, parts, discs, screen }) {
    return (
        <svg className="tb-scene" viewBox="120 100 760 540" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
                <pattern id="tb-keys" width="12" height="10" patternUnits="userSpaceOnUse">
                    <rect x="1" y="1" width="10" height="8" rx="2" fill="#FFFFFF" stroke={O} strokeWidth="1.5" />
                </pattern>
            </defs>
            <g style={zoom}>
                <ellipse cx="540" cy="612" rx="330" ry="40" fill="#A9DDF5" />

                {/* desk */}
                <Poly points="254,424 618,606 618,580 254,398" fill="#C48B45" w={4} />
                <Poly points="814,508 618,606 618,580 814,482" fill="#D9A25A" w={4} />
                <Poly points="450,300 814,482 618,580 254,398" fill="#F4C27A" w={4} />

                {/* tower shell, open on the side */}
                <Poly points="758,482 660,531 660,361 758,312" fill="#2B3550" w={4} />
                <Poly points="576,489 660,531 660,361 576,319" fill="#E9E2CC" w={4} />
                <Poly points="674,270 758,312 660,361 576,319" fill="#F7F1DE" w={4} />
                <g transform={FRONT_TOWER}>
                    <rect x="12" y="20" width="70" height="22" rx="3" fill="#2B3550" stroke={O} strokeWidth="2.5" />
                    <rect x="12" y="52" width="70" height="12" rx="3" fill="#DCD3B8" stroke={O} strokeWidth="2.5" />
                    <rect x="30" y="56" width="34" height="3" rx="1.5" fill={O} />
                    <text x="47" y="94" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="14" fill={O}>GavenOS</text>
                    <rect x="31" y="100" width="32" height="13" rx="3" fill="#FFFFFF" stroke={O} strokeWidth="2" />
                    <text x="47" y="110" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="9" fill={O}>2000</text>
                    <circle cx="47" cy="140" r="10" fill="#FF9F1C" stroke={O} strokeWidth="2.5" />
                    <circle className="flick" cx="20" cy="140" r="3.5" fill="#4CC36A" stroke={O} strokeWidth="1.5" />
                    <circle cx="74" cy="140" r="3.5" fill="#FFD23F" stroke={O} strokeWidth="1.5" />
                </g>

                {/* parts, drawn on the open side panel */}
                <g transform={SIDE_TOWER}>
                    <g style={parts.board}>
                        <rect x="8" y="10" width="94" height="150" rx="5" fill="#2E9E5B" stroke={O} strokeWidth="3" />
                        <path d="M18 24h40v20h20M18 70h56M30 150v-20h50M90 30v60" fill="none" stroke="#B4F25A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                        <rect x="12" y="132" width="58" height="24" rx="3" fill="#2B3550" stroke={O} strokeWidth="2.5" />
                    </g>
                    <g style={parts.cpu}><rect x="28" y="28" width="32" height="28" rx="3" fill="#C9CCD2" stroke={O} strokeWidth="2.5" /></g>
                    <g style={parts.fan}>
                        <circle cx="44" cy="42" r="21" fill="#3BA7F0" stroke={O} strokeWidth="3" />
                        <g className="spin">
                            <ellipse cx="44" cy="31" rx="5" ry="10" fill="#FFFFFF" stroke={O} strokeWidth="1.5" />
                            <ellipse cx="34.5" cy="47.5" rx="5" ry="10" transform="rotate(120 34.5 47.5)" fill="#FFFFFF" stroke={O} strokeWidth="1.5" />
                            <ellipse cx="53.5" cy="47.5" rx="5" ry="10" transform="rotate(240 53.5 47.5)" fill="#FFFFFF" stroke={O} strokeWidth="1.5" />
                        </g>
                        <circle cx="44" cy="42" r="4" fill={O} />
                    </g>
                    {[74, 86].map((x, i) => (
                        <g key={x} style={i ? parts.ram2 : parts.ram1}>
                            <rect x={x} y="20" width="8" height="62" rx="2" fill="#1D5C34" stroke={O} strokeWidth="2" />
                            <rect x={x} y="20" width="8" height="6" fill="#B4F25A" stroke={O} strokeWidth="1.5" />
                        </g>
                    ))}
                    <g style={parts.gpu}>
                        <rect x="10" y="92" width="90" height="24" rx="4" fill="#F25C54" stroke={O} strokeWidth="3" />
                        <circle cx="34" cy="104" r="8" fill={O} /><circle cx="34" cy="104" r="3" fill="#FFD23F" />
                        <circle cx="72" cy="104" r="8" fill={O} /><circle cx="72" cy="104" r="3" fill="#FFD23F" />
                    </g>
                </g>

                {/* CD drive slides into the front bay */}
                <g style={parts.drive}>
                    <g transform={FRONT_TOWER}>
                        <rect x="12" y="20" width="70" height="22" rx="3" fill="#F7F1DE" stroke={O} strokeWidth="2.5" />
                        <rect x="18" y="29" width="44" height="4" rx="2" fill={O} />
                        <rect x="66" y="27" width="10" height="7" rx="2" fill="#FFD23F" stroke={O} strokeWidth="1.5" />
                    </g>
                </g>

                {/* side panel closes */}
                <g style={parts.panel}>
                    <Poly points="758,482 660,531 660,361 758,312" fill="#DCD3B8" w={4} />
                    <g transform={SIDE_TOWER}>
                        {[40, 56, 72].map((y) => <rect key={y} x="20" y={y} width="70" height="8" rx="4" fill="#C9C0A6" />)}
                    </g>
                </g>

                {/* monitor */}
                <g style={parts.monitor}>
                    <Poly points="433.2,392.4 475.2,413.4 475.2,387.4 433.2,366.4" fill="#C9C0A6" />
                    <Poly points="503.2,399.4 475.2,413.4 475.2,387.4 503.2,373.4" fill="#D8D0B6" />
                    <Poly points="461.2,352.4 503.2,373.4 475.2,387.4 433.2,366.4" fill="#E9E2CC" />
                    <Poly points="380,351 506,414 506,304 380,241" fill="#F7F1DE" w={4} />
                    <Poly points="562,386 506,414 506,304 562,276" fill="#D8D0B6" w={4} />
                    <Poly points="436,213 562,276 506,304 380,241" fill="#E9E2CC" w={4} />
                    <g transform={FRONT_MONITOR}>
                        <rect x="11" y="10" width="119" height="76" rx="9" fill="#14203A" stroke={O} strokeWidth="3" />
                        {screen.mode === 'idle' && (
                            <g>
                                <text x="20" y="27" fontFamily="VT323, monospace" fontSize="12" fill="#B4F25A">GavenOS 2000 [v1.0]</text>
                                <text x="20" y="40" fontFamily="VT323, monospace" fontSize="9" fill="#7FAF3E">Memory ....... OK</text>
                                <text x="20" y="50" fontFamily="VT323, monospace" fontSize="9" fill="#7FAF3E">CD-ROM ....... READY</text>
                                <text x="20" y="68" fontFamily="VT323, monospace" fontSize="11" fill="#B4F25A">C:\&gt; INSERT DISC<tspan className="blink">_</tspan></text>
                            </g>
                        )}
                        {screen.mode === 'load' && (
                            <g>
                                <text x="20" y="38" fontFamily="VT323, monospace" fontSize="13" fill="#B4F25A">READING DISC<tspan className="blink">...</tspan></text>
                                <rect x="20" y="50" width="100" height="10" rx="5" fill="#2B3A66" stroke="#B4F25A" strokeWidth="1.5" />
                                <rect x="22" y="52" width="60" height="6" rx="3" fill="#B4F25A" />
                            </g>
                        )}
                        {screen.mode === 'play' && screen.project && (
                            <g>
                                <rect x="14" y="13" width="113" height="14" rx="5" fill={screen.project.color} />
                                <text x="20" y="23.5" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="9" fill="#0E1630">{screen.project.name}</text>
                                <text x="20" y="42" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="7" fill="#FFFFFF">{screen.project.stack}</text>
                                <text x="20" y="55" fontFamily="VT323, monospace" fontSize="9" fill="#B4F25A">YEAR: {screen.project.year}</text>
                                <text x="20" y="76" fontFamily="VT323, monospace" fontSize="10" fill="#FFD23F">&#9658; OPEN PROJECT<tspan className="blink">_</tspan></text>
                            </g>
                        )}
                        <text x="70" y="100" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="9" fill={O}>GavenOS</text>
                        <circle cx="122" cy="98" r="3" fill="#4CC36A" stroke={O} strokeWidth="1.5" />
                    </g>
                </g>

                {/* keyboard + mouse */}
                <g style={parts.keyboard}>
                    <Poly points="315.6,409.2 455.6,479.2 455.6,471.2 315.6,401.2" fill="#D8D0B6" />
                    <Poly points="492,461 455.6,479.2 455.6,471.2 492,453" fill="#E9E2CC" />
                    <Poly points="352,383 492,453 455.6,471.2 315.6,401.2" fill="#F7F1DE" />
                    <g transform={TOP_KEYBOARD}><rect x="6" y="6" width="144" height="30" fill="url(#tb-keys)" /></g>
                </g>
                <g style={parts.mouse}>
                    <Poly points="478,490.4 497.6,500.2 497.6,493.2 478,483.4" fill="#D8D0B6" />
                    <Poly points="525.6,486.2 497.6,500.2 497.6,493.2 525.6,479.2" fill="#E9E2CC" />
                    <Poly points="506,469.4 525.6,479.2 497.6,493.2 478,483.4" fill="#F7F1DE" />
                </g>

                {/* CD wallet */}
                {discs.map((d, i) => <Disc key={i} color={d.color} style={d.style} />)}
            </g>
        </svg>
    );
}
