// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(), // "YYYY-MM-DD"
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const think = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    date: z.string(), // "YYYY-MM-DD"
    tags: z.array(z.string()).optional(),
  }),
});

const music = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    artist: z.string().optional(),
    date: z.string(), // "YYYY-MM-DD"
    link: z.string().url(),
    cover: z.string().url().optional(),
    embedCode: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog,
  think,
  music,
};
