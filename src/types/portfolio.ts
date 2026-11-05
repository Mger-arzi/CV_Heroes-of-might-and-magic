export interface Profile {
  name: string
  role: string
  description: string
  stack: string[]
}

export interface ProjectItem {
  id: string
  title: string
  description: string
  technologies: string[]
  /** Оставьте пустым, пока нет настоящей ссылки. */
  url: string
}

export interface ExperienceItem {
  id: string
  company: string
  role: string
  period: string
  description: string
  achievements: string[]
}

export interface SkillGroup {
  id: string
  title: string
  items: string[]
}

export interface Contacts {
  email: string
  github: string
  telegram: string
  linkedin: string
  other: { label: string; url: string }[]
}

export interface SiteCopy {
  title: string
  slogan: string
  loadingText: string
  heroName: string
}

export interface PortfolioData {
  site: SiteCopy
  profile: Profile
  projects: ProjectItem[]
  experience: ExperienceItem[]
  skills: SkillGroup[]
  contacts: Contacts
}
