import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const logbook = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/logbook' }),
  schema: z.object({
    title:    z.string(),
    date:     z.coerce.date(),
    location: z.string(),
    country:  z.string(),
    flag:     z.string(),
    excerpt:  z.string(),
  }),
});

const orte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/orte' }),
  schema: z.object({
    title:      z.string(),
    stationId:  z.string(),
    country:    z.string(),
    flag:       z.string(),
    dateFrom:   z.string(),
    dateTo:     z.string(),
    nights:     z.number(),
    vibe:       z.string(),
    costLevel:  z.number().min(1).max(3),
    rating:     z.number().min(1).max(5),
    coverImage: z.string().optional(),
    highlights: z.array(z.string()),
    foodSpots: z.array(z.object({
      name:   z.string(),
      what:   z.string(),
      stars:  z.number().min(1).max(5),
      area:   z.string().optional(),
      tip:    z.string().optional(),
    })),
    markets: z.array(z.object({
      name: z.string(),
      type: z.string(),
      when: z.string().optional(),
      tip:  z.string().optional(),
    })).optional().default([]),
    skip: z.array(z.string()).optional().default([]),
    tips: z.array(z.string()),
    bestArea: z.string().optional(),
    draft:    z.boolean().optional().default(false),
  }),
});

export const collections = { logbook, orte };
