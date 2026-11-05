import { portfolioData } from '../../config/portfolioData.ts'
import { castleById } from '../../store/gameStore.ts'
import { ContactModal, ExperienceModal, ProjectModal, SkillsModal } from './PortfolioSections.tsx'

export function PortfolioModal({ castleId }: { castleId: string }) {
  const castle = castleById(castleId)
  if (!castle) return null

  if (castle.section === 'project') {
    const project = portfolioData.projects.find((item) => item.id === castle.projectId)
    if (!project) return null
    return <ProjectModal project={project} castleTitle={castle.title} />
  }
  if (castle.section === 'experience') return <ExperienceModal castleTitle={castle.title} />
  if (castle.section === 'skills') return <SkillsModal castleTitle={castle.title} />
  return <ContactModal castleTitle={castle.title} />
}
