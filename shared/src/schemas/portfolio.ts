import { z } from 'zod'

export const PortfolioItemSchema = z.object({
  id: z.number(),
  portfolio_id: z.number(),
  symbol: z.string(),
  quantity: z.number(),
  average_cost: z.number(),
  currency: z.string().default('USD'),
  purchased_at: z.string().nullable().optional(),
  notes: z.string().nullable(),
})

export const PortfolioSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  items: z.array(PortfolioItemSchema).optional(),
  items_count: z.number().optional(),
})

export type PortfolioItem = z.infer<typeof PortfolioItemSchema>
export type Portfolio = z.infer<typeof PortfolioSchema>

export type AddHoldingInput = {
  symbol: string
  quantity: number
  average_cost: number
  currency?: string
  purchased_at?: string
  notes?: string
}
