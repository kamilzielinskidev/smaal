import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const realizacje = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/realizacje' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      city: z.string(), // slug miasta z src/data/site.ts
      district: z.string(),
      area: z.number(),
      standard: z.enum(['Komfort', 'Premium', 'Signature']),
      weeks: z.number(),
      year: z.number(),
      summary: z.string(),
      scope: z.array(z.string()),
      cover: image(),
      gallery: z.array(image()),
      order: z.number(),
    }),
});

const miasta = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/miasta' }),
  schema: z.object({
    name: z.string(),
    locative: z.string(), // "w Katowicach"
    title: z.string(),
    description: z.string(),
    distance: z.string(),
    districts: z.array(z.string()),
  }),
});

export const collections = { realizacje, miasta };
