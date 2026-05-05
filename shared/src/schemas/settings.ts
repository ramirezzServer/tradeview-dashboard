import { z } from 'zod'

export const UserSettingsSchema = z.object({
  id: z.number().optional(),
  user_id: z.number().optional(),
  theme: z.enum(['dark', 'light']),
  currency: z.string(),
  default_resolution: z.enum(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
  default_symbol: z.string(),
  preferred_news_category: z.enum(['general', 'forex', 'crypto', 'merger']),
  dashboard_layout: z.record(z.unknown()).nullable().optional(),
})

export type UserSettings = z.infer<typeof UserSettingsSchema>
export type PartialSettings = Partial<Omit<UserSettings, 'id' | 'user_id'>>
