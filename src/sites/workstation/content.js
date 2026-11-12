// Copy shared by the designs that tell the "build the machine" story (Workstation and Toybox).
// Plain data only, so importing it never pulls in three.js.

// One entry per build step; the last one is the finished state.
export const STEPS = [
    { label: 'Start', t: 'Scroll to build', b: 'Every project starts from the parts up. Keep scrolling to put the machine together.' },
    { label: 'Processor', t: 'Logic first', b: 'Understand the real problem before writing a line of code.' },
    { label: 'Cooling', t: 'Calm under load', b: 'Clean, readable code that stays fast as it grows.' },
    { label: 'Memory', t: 'Sweat the details', b: 'Edge cases, empty states and loading states handled, so users never have to think about them.' },
    { label: 'Graphics', t: 'The fun part', b: 'Interfaces with personality: motion, polish and a little 3D.' },
    { label: 'Drive', t: 'Ready to ship', b: 'Each project lives on its own disc.' },
    { label: 'Assembly', t: 'Plugged in', b: 'Monitor, keyboard, done. Pick a disc to load a project.' },
    { label: 'Done', t: 'Build complete', b: '' },
];

export const ABOUT = {
    heading: 'Software engineer, web designer, studio founder.',
    lede: "Hey, I'm Gaven. I like making things that feel good to use: clean front ends, offline-first desktop apps, and the occasional site that's a little weird on purpose.",
    bio: [
        "I'm from Oregon and now live in Montgomery, Alabama. I studied Computer Science at Oregon State, where I found my passion for web development, and I'm now working on my M.S. in Computer Science at Arizona State.",
        "By day I'm a software engineer at BESPIN, supporting AFSOC as a Special Warfare Operations Integrator. On the side I run Webfoot Software Studio, designing and building websites for churches and organizations.",
        "Before that I built the front end of Oregon State's College of Business AI chatbot on a team of 11, spent a summer in Hanoi building React sites for Siten JSC, and supported 45,000+ students and faculty on Oregon State's IT team.",
    ],
    likes: [
        { t: 'Clean front ends', b: 'Interfaces that are fast, accessible and feel good to use.' },
        { t: 'Offline-first desktop apps', b: 'Tools like LineWise: free, open-source and fully offline.' },
        { t: 'Sites with personality', b: 'The occasional site that is a little weird on purpose, like this one.' },
    ],
    now: [
        'Software engineer at BESPIN, supporting AFSOC.',
        'Running Webfoot Software Studio.',
        'M.S. Computer Science at Arizona State.',
        'Building Dragon Warriors, a guild hub for WoW Forever.',
    ],
};

export const FACTS = [
    ['Role', 'Software Engineer @ BESPIN'],
    ['Studio', 'Founder, Webfoot Software Studio'],
    ['Education', 'B.S. CS, Oregon State · M.S. CS, ASU (in progress)'],
    ['Clearance', 'TS/SCI · CJIS certified'],
    ['Based in', 'Montgomery, AL · from Oregon'],
];

export const SKILLS = [
    { name: 'Languages', items: ['C++', 'C', 'Python', 'TypeScript', 'JavaScript', 'SQL'] },
    { name: 'Apps & web', items: ['React', 'Next.js', 'Tauri', 'Tailwind', 'SASS', 'three.js', 'Cloudflare'] },
    { name: 'Systems & tooling', items: ['Linux', 'CMake', 'GDB', 'Git', 'Docker', 'Bash'] },
    { name: 'Networking', items: ['TCP/IP', 'Socket programming', 'Wireshark'] },
    { name: 'Design', items: ['UX/UI design', 'SVG', 'Blender'] },
];

// Live sites built through Webfoot Software Studio.
export const STUDIO = {
    name: 'Webfoot Software Studio',
    blurb: 'My studio. I design and build websites for churches and organizations, from first sketch to launch.',
    sites: [
        { name: 'Redemption Church', place: 'Montgomery, AL', text: 'Events, sermons and bulletins, with a Live Now badge on service days.', url: 'https://redemptionchurchfamily.com', color: '#B4F25A' },
        { name: 'Capital City Church of God', place: 'Salem, OR', text: 'Homepage redesign that puts visitors and service times first.', url: 'https://capitalcitychurchofgod.com', color: '#5FD3FF' },
        { name: 'EHS Now', place: 'Tri-Cities, WA', text: 'Environmental health and safety consulting, with a custom OSHA safety program builder.', url: 'https://www.ehsnow.net', color: '#FF8A4C' },
    ],
};

export const HISTORY = [
    { when: 'Feb 2025 – Now', items: [{ title: 'Software Engineer · AFSOC Special Warfare Operations Integrator', org: 'BESPIN' }] },
    { when: 'Now', items: [{ title: 'Founder', org: 'Webfoot Software Studio', text: 'Websites for churches and organizations, from design to launch.' }] },
    { when: 'Jan – Jun 2024', items: [{ title: 'Frontend Developer', org: 'Oregon State University', text: 'Built the main chatbot and its design and style architecture with React, Vite and Tailwind, on a team of 11.' }] },
    { when: 'Jun – Aug 2023', items: [{ title: 'Frontend Developer', org: 'Siten JSC · Hanoi, Vietnam', text: 'Template sites in HTML, SASS and React; moved the company site to React with better UX/UI.' }] },
    { when: 'Oct 2021 – Feb 2025', items: [{ title: 'Information Technology', org: 'Oregon State University', text: 'Supported 45,000+ students and faculty and trained new staff.' }] },
];

export const EDUCATION = [
    { school: 'Arizona State University', degree: 'M.S. Computer Science', when: '2026 – 2028 · in progress' },
    { school: 'Oregon State University', degree: 'B.S. Computer Science', when: '2019 – 2024' },
];
