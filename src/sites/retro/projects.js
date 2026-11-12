// Project list shared by every design: one disc (Workstation, Toybox) or VLAN (GavenNET) per entry.
// Keep `blurb` to one short line; it is drawn onto the 3D monitor. The 3D layouts fit four discs.
const projects = [
    {
        name: 'Dragon Warriors',
        blurb: 'Live guild hub with Battle.net login and roster sync',
        stack: 'Next.js · TypeScript · Cloudflare D1',
        year: '2026',
        url: 'https://dragonwarriors.app',
        color: '#B4F25A',
    },
    {
        name: 'LineWise',
        blurb: 'Open-source desktop app for Cisco-style network diagrams',
        stack: 'Tauri · React · TypeScript',
        year: '2026',
        url: 'https://gavenrobertson.github.io/LineWise/',
        color: '#5FD3FF',
    },
    {
        name: 'Meal at a Glance',
        blurb: 'AI meal planner that prices your grocery list',
        stack: 'React · Hono · Claude API',
        year: '2026',
        url: 'https://github.com/gavenrobertson/MealAtAGlance',
        color: '#FF8A4C',
    },
    {
        name: 'COB AI Chatbot',
        blurb: 'AI chatbot for OSU College of Business students',
        stack: 'React · Vite · Tailwind',
        year: '2024',
        url: 'https://github.com/COBTeam1/ComingSoon',
        color: '#C9A7FF',
    },
];

export default projects;
