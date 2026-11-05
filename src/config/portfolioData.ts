import type { PortfolioData } from '../types/portfolio.ts'

/**
 * Все тексты портфолио меняются здесь.
 * Пустые url и контакты — заглушки. Кнопки включатся, когда появятся настоящие адреса.
 */
export const portfolioData: PortfolioData = {
  site: {
    title: 'Kingdom of Code',
    slogan: 'Every great project begins with an adventure.',
    loadingText: 'Loading the Kingdom',
    heroName: 'Your Name',
  },
  profile: {
    name: 'Your Name',
    role: 'Frontend Developer',
    description: 'I build modern, interactive and user-friendly web applications.',
    stack: ['React', 'TypeScript', 'JavaScript', 'Next.js'],
  },
  projects: [
    {
      id: 'project-01',
      title: 'Interactive CRM',
      description: 'A modern CRM platform with interactive dashboards and data management.',
      technologies: ['React', 'TypeScript', 'Zustand'],
      url: '',
    },
    {
      id: 'project-02',
      title: 'Pharmacy Marketplace',
      description: 'A platform for managing shifts, employee requests and internal workflows.',
      technologies: ['React', 'TypeScript', 'REST API'],
      url: '',
    },
    {
      id: 'project-03',
      title: 'Social Feed',
      description: 'An interactive corporate feed with posts, reactions and filtering.',
      technologies: ['React', 'TypeScript', 'CSS Modules'],
      url: '',
    },
    {
      id: 'project-04',
      title: 'Web Application',
      description: 'A modern web application with responsive UI and reusable components.',
      technologies: ['React', 'Next.js', 'TypeScript'],
      url: '',
    },
  ],
  experience: [
    {
      id: 'job-01',
      company: 'Company Name',
      role: 'Frontend Developer',
      period: '2023 — Present',
      description: 'Replace this text with your day-to-day work: product UI, collaboration with design, and shipping features.',
      achievements: [
        'Replace with a real achievement.',
        'Replace with another achievement.',
      ],
    },
    {
      id: 'job-02',
      company: 'Previous Company',
      role: 'Junior Frontend Developer',
      period: '2021 — 2023',
      description: 'Replace this text with an earlier role. Add or remove jobs in this array.',
      achievements: ['Replace with a real achievement.'],
    },
  ],
  skills: [
    { id: 'frontend', title: 'Frontend', items: ['React', 'Next.js', 'HTML', 'CSS'] },
    { id: 'languages', title: 'Languages', items: ['TypeScript', 'JavaScript'] },
    { id: 'state', title: 'State Management', items: ['Zustand', 'Redux'] },
    { id: 'tools', title: 'Tools', items: ['Git', 'Vite', 'Webpack'] },
    { id: 'testing', title: 'Testing', items: [] },
    { id: 'other', title: 'Other', items: ['REST API'] },
  ],
  contacts: {
    email: '',
    github: '',
    telegram: '',
    linkedin: '',
    other: [],
  },
}
