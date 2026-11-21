import type { IconName } from '../lib/icons';
import {
  serviceCards,
  servicesPageCards,
  site,
  type ServiceCard,
  type ServiceCardId,
  type ServicesPageCard,
  type ServicesPageCardId,
} from './site';

/**
 * The shapes of the industry and service detail pages (the owner's brief, 2026-11-20). The pages
 * themselves live in src/data/industry-pages/ and src/data/service-pages/, one file each, and
 * render through src/pages/industries/[slug].astro and src/pages/services/[slug].astro.
 *
 * Everything here is proposed copy for the owner to confirm. It describes prospective work and
 * the needs of a kind of business; it never names a client, a result, a price, a turnaround time,
 * a certification, or an integration the studio has not established. Example journeys are
 * labelled as illustrative on the page.
 */

/** A question a prospective client asks, with the answer in one to four plain sentences. */
export interface Faq {
  readonly question: string;
  readonly answer: string;
}

/** One of the three problem-and-response rows on an industry page. */
export interface Challenge {
  /** The problem as the business experiences it, as a short heading. */
  readonly problem: string;
  /** What that looks like on the website or in the inbox. */
  readonly symptom: string;
  /** What the studio would do about it. */
  readonly response: string;
}

/** One step of a proposed engagement. Never completed client work. */
export interface EngagementStep {
  readonly title: string;
  readonly text: string;
}

/** The four-step process section. */
export interface Engagement {
  readonly heading: string;
  readonly intro: string;
  readonly steps: readonly EngagementStep[];
}

/** One thing the client receives. A service name alone is not a deliverable. */
export interface Deliverable {
  readonly title: string;
  readonly text: string;
}

/** A service page's deliverables section. */
export interface Deliverables {
  readonly heading: string;
  readonly intro: string;
  /** Four to six. */
  readonly items: readonly Deliverable[];
  /** What is agreed separately or offered only as it actually is, under the list. */
  readonly scopeNote: string;
}

/** A service recommended on an industry page, with why it matters for that kind of business. */
export interface RelatedService {
  readonly card: ServiceCardId;
  readonly relevance: string;
}

/** An industry page's recommended services. */
export interface RelatedServices {
  readonly heading: string;
  readonly intro: string;
  /** Three or four. */
  readonly items: readonly RelatedService[];
}

/** An industry page's three problem-and-response rows. */
export interface Challenges {
  readonly heading: string;
  readonly intro: string;
  readonly items: readonly [Challenge, Challenge, Challenge];
}

/** A heading, an introduction, and any number of questions: what DetailFaq.astro renders. */
export interface FaqList {
  readonly heading: string;
  readonly intro: string;
  readonly items: readonly Faq[];
}

/** A detail page's four questions. */
export interface FaqSection extends FaqList {
  readonly items: readonly [Faq, Faq, Faq, Faq];
}

/**
 * Blocks a distinctive module is composed from. Each page's module combines one to three of them
 * (src/components/sections/DetailModule.astro), so pages differ in structure, not only in words.
 */

/** A pathway, audience, or option in a `paths` block. */
export interface PathItem {
  /** A small label above the title: who takes this path, or when. */
  readonly label?: string;
  readonly title: string;
  readonly text: string;
  /** The one action the page offers on this path. */
  readonly action?: string;
  readonly icon?: IconName;
}

/** Two or three parallel pathways, audiences, or entry points. */
export interface PathsBlock {
  readonly kind: 'paths';
  readonly heading?: string;
  readonly intro?: string;
  readonly items: readonly PathItem[];
}

/** One step of a journey or workflow. */
export interface JourneyStep {
  /** A small label above the title: "Trigger", "Action", "Stage 1", "Edit". */
  readonly label: string;
  readonly title: string;
  readonly text: string;
}

/** A sequence of steps, read left to right from md and top to bottom below. */
export interface JourneyBlock {
  readonly kind: 'journey';
  readonly heading: string;
  readonly intro?: string;
  readonly steps: readonly JourneyStep[];
  /** Shown under the steps: that the journey is illustrative, or what it depends on. */
  readonly note?: string;
}

/** A group in a `directory` block. */
export interface DirectoryGroup {
  readonly title: string;
  readonly text: string;
  readonly items: readonly string[];
}

/** Grouped lists, such as the trades on the construction page. */
export interface DirectoryBlock {
  readonly kind: 'directory';
  readonly heading: string;
  readonly intro?: string;
  readonly groups: readonly DirectoryGroup[];
}

/** One side of a comparison. */
export interface ComparisonColumn {
  readonly title: string;
  readonly intro?: string;
  readonly items: readonly string[];
}

/** Two options side by side, as a decision guide. */
export interface ComparisonBlock {
  readonly kind: 'comparison';
  readonly heading: string;
  readonly intro?: string;
  readonly columns: readonly [ComparisonColumn, ComparisonColumn];
  readonly note?: string;
}

/** A short explanatory block: heading beside paragraphs, with optional points. */
export interface NoteBlock {
  readonly kind: 'note';
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly points?: readonly string[];
}

/** A labelled example of content, such as an answer section, set apart from the page's own copy. */
export interface ExampleBlock {
  readonly kind: 'example';
  readonly heading: string;
  /** The label on the example itself, such as "Illustrative example". */
  readonly label: string;
  /** The example's own heading, such as the question it answers. */
  readonly title: string;
  readonly paragraphs: readonly string[];
  /** What the example shows, under it. */
  readonly caption: string;
}

export type ModuleBlock =
  PathsBlock | JourneyBlock | DirectoryBlock | ComparisonBlock | NoteBlock | ExampleBlock;

/** The distinctive module of a page: one section built from the blocks above. */
export interface Module {
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  readonly blocks: readonly ModuleBlock[];
}

/** The page-specific invitation that closes the main content, before the contact banner. */
export interface Invitation {
  readonly heading: string;
  readonly text: string;
  /** What is useful to share in a first message, as a short list. */
  readonly bring: readonly string[];
}

/** What the hero and the document head need. */
export interface PageHead {
  /** The h1. */
  readonly title: string;
  /** Words of `title`, as written, set in the primary yellow. */
  readonly highlight?: string;
  /** One or two sentences under the h1. */
  readonly description: string;
  /** The document title without the site name: 10-52 characters. */
  readonly metaTitle: string;
  /** 50-160 characters. */
  readonly metaDescription: string;
}

/** The two-column introduction under the hero. */
export interface Introduction {
  readonly eyebrow: string;
  readonly heading: string;
  /** The first paragraph, set larger: the answer first. */
  readonly lead: string;
  readonly paragraphs: readonly string[];
  /** The second column's heading and items: who the page is for, or when the service fits. */
  readonly aside: {
    readonly heading: string;
    readonly items: readonly { readonly title: string; readonly text: string }[];
  };
}

export interface IndustryPage extends PageHead {
  /** The route segment under /industries/. */
  readonly slug: string;
  /** The name in `industries` (src/data/site.ts), which links here. */
  readonly name: string;
  readonly introduction: Introduction;
  readonly challenges: Challenges;
  readonly services: RelatedServices;
  readonly module: Module;
  /** Where the module should come before the related services, as the buying journey calls for. */
  readonly moduleFirst?: boolean;
  /** A brief process, only where it helps this industry's buyers. */
  readonly engagement?: Engagement;
  readonly faqs: FaqSection;
  readonly invitation: Invitation;
}

export interface ServicePage extends PageHead {
  /** The route segment under /services/, the end of the matching card's `href`. */
  readonly slug: string;
  /**
   * The service card this page belongs to, one of the six home cards or the three cards of the
   * services page; its title, icon, and description come from there.
   */
  readonly card: ServiceCardId | ServicesPageCardId;
  readonly introduction: Introduction;
  readonly deliverables: Deliverables;
  readonly module: Module;
  readonly engagement: Engagement;
  readonly faqs: FaqSection;
  readonly invitation: Invitation;
}

/**
 * The service card with the given id, from the home cards or the services page's own cards. Every
 * id in `ServiceCardId` and `ServicesPageCardId` has one.
 */
export function serviceCardById(
  id: ServiceCardId | ServicesPageCardId,
): ServiceCard | ServicesPageCard {
  const card =
    serviceCards.find((entry) => entry.id === id) ??
    servicesPageCards.find((entry) => entry.id === id);
  if (!card) throw new Error(`No service card with the id "${id}".`);
  return card;
}

/**
 * The head's limits, which tests/e2e/seo.spec.ts enforces on the built page: the document title
 * with the site name appended (BaseLayout) stays within 70 characters, the description within
 * 50-160, and the highlight is part of the title (PageIntro throws otherwise). Checked at build,
 * so a copy edit fails here rather than in the browser suite.
 */
export function checkPageHead(page: PageHead & { slug: string }): void {
  const title = `${page.metaTitle} | ${site.name}`;
  if (title.length < 10 || title.length > 70) {
    throw new Error(`${page.slug}: the document title is ${title.length} characters (10-70).`);
  }
  const { length } = page.metaDescription;
  if (length < 50 || length > 160) {
    throw new Error(`${page.slug}: the meta description is ${length} characters (50-160).`);
  }
  if (page.highlight && !page.title.includes(page.highlight)) {
    throw new Error(`${page.slug}: the highlight "${page.highlight}" is not in the title.`);
  }
}

/** The path of an industry page. */
export const industryPath = (slug: string) => `/industries/${slug}/`;

/** The path of a service page. */
export const servicePath = (slug: string) => `/services/${slug}/`;
