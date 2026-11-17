import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Editorial content for auralinkstudio.com.
 *
 * Every collection carries a `draft` flag. Draft entries are excluded from
 * builds by the page code that queries them and are ignored by
 * `npm run check:content`. Files whose name starts with `_` are never loaded.
 *
 * Content integrity: do not publish invented clients, outcomes, testimonials,
 * certifications, pricing, or statistics. See docs/content-strategy.md.
 */

const serviceSlugs = [
  'static-websites',
  'wordpress-development',
  'shopify-development',
  'email-design-development',
  'lifecycle-email-marketing',
  'seo',
  'aeo',
  'geo',
] as const;

export const serviceSlug = z.enum(serviceSlugs);

const services = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(3).max(80),
      /** Short, plain-language summary used in cards and meta descriptions. */
      summary: z.string().min(40).max(200),
      /** Which planned route group the service belongs to. */
      group: z.enum(['website-development', 'email', 'search-visibility']),
      order: z.number().int().nonnegative().default(100),
      cover: image().optional(),
      /** Related FAQ entries, by id. */
      faqs: z.array(reference('faqs')).default([]),
      draft: z.boolean().default(false),
    }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(3).max(100),
      client: z.string().min(1),
      industry: z.string().min(1),
      services: z.array(serviceSlug).min(1),
      summary: z.string().min(40).max(240),
      publishedDate: z.coerce.date(),
      website: z.url().optional(),
      cover: image().optional(),
      /**
       * Measured outcomes. Only include numbers you can trace to a source;
       * `resultsSource` is required whenever `results` is present.
       */
      results: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      resultsSource: z.string().optional(),
      /** Publishing a case study requires the client's approval on record. */
      approvedByClient: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const insights = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/insights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(3).max(110),
      description: z.string().min(50).max(160),
      publishedDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Auralink Studio'),
      topics: z.array(serviceSlug).default([]),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/faqs' }),
  schema: z.object({
    /** The question exactly as a prospective client would ask it. */
    question: z.string().min(10).max(160),
    topics: z.array(serviceSlug).default([]),
    order: z.number().int().nonnegative().default(100),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, work, insights, faqs };
