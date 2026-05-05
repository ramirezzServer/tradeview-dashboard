import { z } from 'zod'

export const WatchlistItemSchema = z.object({
  id: z.number(),
  watchlist_id: z.number(),
  symbol: z.string(),
  notes: z.string().nullable(),
  sort_order: z.number(),
})

export const WatchlistSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  items: z.array(WatchlistItemSchema).optional(),
  items_count: z.number().optional(),
})

export type WatchlistItem = z.infer<typeof WatchlistItemSchema>
export type Watchlist = z.infer<typeof WatchlistSchema>
