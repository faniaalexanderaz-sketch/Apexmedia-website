import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { editorialStories, type EditorialStory } from '../data/editorial'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from './ResponsiveImage'
import { SectionHeading } from './SectionHeading'
import { useInquiry } from './Inquiry'

/** Ispirazioni di stagione: impaginazione da magazine, un servizio principale e due brevi. */
export function SeasonalEditorial() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const [main, ...secondary] = editorialStories

  return (
    <section ref={root} id="ispirazioni" className="section editorial" data-header="light" aria-labelledby="editorial-title">
      <div className="container">
        <div className="editorial__masthead">
          <SectionHeading
            index={4}
            label="Quaderno di stile"
            id="editorial-title"
            title={
              <>
                Ispirazioni <em>di stagione.</em>
              </>
            }
          />
          <p className="editorial__issue" data-reveal="fade" aria-hidden="true">
            <span>Vol. I</span>
            <span>Autunno — Inverno</span>
          </p>
        </div>

        <div className="editorial__layout">
          <StoryCard story={main} variant="main" />
          <div className="editorial__side">
            {secondary.map((story) => (
              <StoryCard key={story.id} story={story} variant="side" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StoryCard({ story, variant }: { story: EditorialStory; variant: 'main' | 'side' }) {
  const openInquiry = useInquiry()
  const open = () =>
    openInquiry({
      kicker: `Ispirazioni · ${story.kicker}`,
      title: story.title,
      image: story.image,
      paragraphs: story.body,
      tips: story.tips,
      topic: `l'ispirazione "${story.title}"`,
    })

  return (
    <article className={`story-card story-card--${variant}`}>
      <button type="button" className="story-card__media" onClick={open} data-reveal="image" tabIndex={-1} aria-hidden="true">
        <span className="story-card__media-inner" data-reveal-inner>
          <ResponsiveImage
            image={story.image}
            sizes={variant === 'main' ? '(min-width: 900px) 52vw, 92vw' : '(min-width: 900px) 16vw, 36vw'}
          />
        </span>
      </button>
      <div className="story-card__body" data-reveal="fade">
        <p className="eyebrow story-card__kicker">{story.kicker}</p>
        <h3 className="story-card__title">{story.title}</h3>
        <p className="story-card__excerpt">{story.excerpt}</p>
        <button type="button" className="text-link" onClick={open} aria-label={`Leggi l'ispirazione: ${story.title}`}>
          Leggi l'ispirazione <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  )
}
