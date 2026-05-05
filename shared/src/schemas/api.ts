import { z } from 'zod'

export const apiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  })
