import { portfolioData } from '../../config/portfolioData.ts'
import type { ProjectItem } from '../../types/portfolio.ts'
import { ModalFrame, OutLink, TechList } from './ModalFrame.tsx'

export function ProjectModal({ project, castleTitle }: { project: ProjectItem; castleTitle: string }) {
  return (
    <ModalFrame title={project.title} subtitle={castleTitle}>
      <p>{project.description}</p>
      <h3>Technologies</h3>
      <TechList items={project.technologies} />
      <OutLink href={project.url} label={project.url ? 'Open project' : 'Add a project URL'} />
    </ModalFrame>
  )
}

export function ExperienceModal({ castleTitle }: { castleTitle: string }) {
  return (
    <ModalFrame title="Experience" subtitle={castleTitle}>
      {portfolioData.experience.map((job) => (
        <article key={job.id} className="job">
          <h3>{job.role}</h3>
          <p className="muted">
            {job.company} · {job.period}
          </p>
          <p>{job.description}</p>
          <ul>
            {job.achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
    </ModalFrame>
  )
}

export function SkillsModal({ castleTitle }: { castleTitle: string }) {
  return (
    <ModalFrame title="Skills" subtitle={castleTitle}>
      <div className="skill-grid">
        {portfolioData.skills.map((group) => (
          <article key={group.id}>
            <h3>{group.title}</h3>
            <TechList items={group.items} />
          </article>
        ))}
      </div>
    </ModalFrame>
  )
}

export function ContactModal({ castleTitle }: { castleTitle: string }) {
  const contacts = portfolioData.contacts
  return (
    <ModalFrame title="Contact" subtitle={castleTitle}>
      <p>Buttons stay disabled until you add real addresses in the config file.</p>
      <div className="contact-list">
        <OutLink href={contacts.email ? `mailto:${contacts.email}` : ''} label="Email" />
        <OutLink href={contacts.github} label="GitHub" />
        <OutLink href={contacts.telegram} label="Telegram" />
        <OutLink href={contacts.linkedin} label="LinkedIn" />
        {contacts.other.map((item) => (
          <OutLink key={item.label} href={item.url} label={item.label} />
        ))}
      </div>
    </ModalFrame>
  )
}
