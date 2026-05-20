import { z } from 'zod'

export const SavedNewsSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  article_url: z.string(),
  headline: z.string(),
  source: z.string(),
  summary: z.string().nullable(),
  category: z.string(),
  article_datetime: z.number().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type SavedNewsItem = z.infer<typeof SavedNewsSchema>
