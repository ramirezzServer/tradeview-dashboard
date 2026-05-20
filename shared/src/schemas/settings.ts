import { z } from 'zod'

const NotificationsSchema = z.object({
  price_alerts:       z.boolean(),
  news_updates:       z.boolean(),
  portfolio_changes:  z.boolean(),
  earnings_reminders: z.boolean(),
}).partial()

const WatchlistPrefsSchema = z.object({
  live_price_updates: z.boolean(),
  flash_animations:   z.boolean(),
  show_sparklines:    z.boolean(),
  sort_by:            z.string(),
}).partial()

const DashboardPrefsSchema = z.object({
  ai_predictions: z.boolean(),
  market_movers:  z.boolean(),
  daily_range:    z.boolean(),
  volume_bars:    z.boolean(),
}).partial()

const AppearancePrefsSchema = z.object({
  accent_color: z.string(),
  chart_style:  z.string(),
  glow_effects: z.boolean(),
  animations:   z.boolean(),
}).partial()

export const UserSettingsSchema = z.object({
  id:                       z.number().optional(),
  user_id:                  z.number().optional(),
  theme:                    z.enum(['dark', 'light']),
  currency:                 z.string(),
  default_resolution:       z.enum(['1', '5', '15', '30', '60', 'D', 'W', 'M']),
  default_symbol:           z.string(),
  preferred_news_category:  z.enum(['general', 'forex', 'crypto', 'merger']),
  dashboard_layout:         z.record(z.unknown()).nullable().optional(),
  density:                  z.enum(['Compact', 'Normal', 'Relaxed']).optional(),
  font_size:                z.enum(['Small', 'Medium', 'Large']).optional(),
  chart_timeframe:          z.enum(['1D', '1W', '1M', '3M']).optional(),
  notifications:            NotificationsSchema.nullable().optional(),
  watchlist_prefs:          WatchlistPrefsSchema.nullable().optional(),
  dashboard_prefs:          DashboardPrefsSchema.nullable().optional(),
  appearance_prefs:         AppearancePrefsSchema.nullable().optional(),
})

export type UserSettings    = z.infer<typeof UserSettingsSchema>
export type PartialSettings = Partial<Omit<UserSettings, 'id' | 'user_id'>>
