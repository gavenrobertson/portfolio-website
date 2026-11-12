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

export const SKILLS = [
    { name: 'Frontend', items: ['React', 'JavaScript', 'HTML', 'Vite', 'SASS', 'Tailwind'] },
    { name: '3D & design', items: ['three.js', 'SVG', 'UX/UI design'] },
    { name: 'Systems & security', items: ['C++', 'IT support', 'TS/SCI clearance', 'CJIS certified'] },
];

export const FACTS = [
    ['Role', 'Software Developer @ BESPIN'],
    ['Supporting', 'AFSOC Special Warfare'],
    ['Education', 'B.S. CS, Oregon State · M.S. CS, ASU (in progress)'],
    ['Based in', 'Montgomery, AL'],
];

export const ABOUT = {
    heading: 'Interfaces with personality.',
    lede: "I'm Gaven, a software developer. I like interfaces with personality, code that stays out of its own way, and the occasional 3D detour.",
    now: [
        'Software developer at BESPIN, supporting AFSOC as a Special Warfare Operations Integrator.',
        'Front-end roots in React, SASS and Tailwind, plus a habit of building things in 3D.',
    ],
};

export const HISTORY = [
    { when: 'Feb 2025 – Now', items: [{ title: 'Software Developer · AFSOC Special Warfare Operations Integrator', org: 'BESPIN' }] },
    { when: 'Jan – Jun 2024', items: [{ title: 'Frontend Developer', org: 'Oregon State University', text: 'Built the main chatbot and its design and style architecture with React, Vite and Tailwind, on a team of 11.' }] },
    { when: 'Jun – Aug 2023', items: [{ title: 'Frontend Developer', org: 'Siten JSC · Hanoi, Vietnam', text: 'Template sites in HTML, SASS and React; moved the company site to React with better UX/UI.' }] },
    { when: 'Oct 2021 – Feb 2025', items: [{ title: 'Information Technology', org: 'Oregon State University', text: 'Supported 45,000+ students and faculty and trained new staff.' }] },
    {
        when: 'Education',
        items: [
            { title: 'M.S. Computer Science · Arizona State University', org: '2026 – 2028 · in progress' },
            { title: 'B.S. Computer Science · Oregon State University', org: '2019 – 2024' },
        ],
    },
];
