export interface Project {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  tech: string[];
  link?: string;
  github?: string;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
}

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Pulse Analytics',
    description: 'A real-time dashboard for monitoring distributed systems.',
    problem: 'DevOps teams struggled with high-latency metrics that delayed incident response.',
    solution: 'Built a custom WebSocket-based streaming engine that reduced metric lag by 85%.',
    tech: ['React', 'Node.js', 'Redis', 'D3.js'],
    link: '#',
    github: '#',
    image: 'https://picsum.photos/seed/pulse/800/600',
  },
  {
    id: '2',
    title: 'EcoRoute',
    description: 'Carbon-aware delivery routing for logistics fleets.',
    problem: 'Last-mile delivery accounts for 30% of supply chain emissions.',
    solution: 'Implemented a genetic algorithm to optimize routes for fuel efficiency rather than just distance.',
    tech: ['TypeScript', 'Python', 'Google Maps API', 'PostgreSQL'],
    link: '#',
    github: '#',
    image: 'https://picsum.photos/seed/eco/800/600',
  },
  {
    id: '3',
    title: 'Lumina Design System',
    description: 'An accessible, multi-brand design system for enterprise apps.',
    problem: 'Inconsistent UI across 12 different product teams led to user confusion.',
    solution: 'Created a tokenized system with automated accessibility testing integrated into the CI/CD pipeline.',
    tech: ['React', 'Tailwind', 'Storybook', 'Framer Motion'],
    link: '#',
    github: '#',
    image: 'https://picsum.photos/seed/lumina/800/600',
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Why I switched to a "Now" page',
    excerpt: 'Static portfolios feel dead. Here is how I keep mine alive and why it matters for your career.',
    date: 'March 15, 2024',
    readTime: '4 min read',
    slug: 'why-now-page',
  },
  {
    id: '2',
    title: 'The hidden cost of "Clean Code"',
    excerpt: 'Sometimes optimization is the enemy of progress. When to stop refactoring and start shipping.',
    date: 'February 28, 2024',
    readTime: '6 min read',
    slug: 'clean-code-cost',
  },
  {
    id: '3',
    title: 'Building Pulse: A technical deep dive',
    excerpt: 'How we handled 100k events per second with a single Node.js instance and some clever Redis usage.',
    date: 'January 12, 2024',
    readTime: '10 min read',
    slug: 'building-pulse',
  },
];
