import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const journal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/journal" }),
  schema: z.object({
    date: z.string(),
    tag: z.string(),
    title: z.string(),
  }),
});

export const collections = { journal };
