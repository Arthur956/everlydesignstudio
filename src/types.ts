import { z } from 'zod'

export const personTypeEnum = z.enum(['adult', 'teen', 'child', 'baby'])
export const fontEnum = z.enum(['speels', 'klassiek', 'handgeschreven'])

export const personSchema = z.object({
  type: personTypeEnum,
  skin: z.number().int().min(0).max(5),
  hair: z.string().min(1),
  hairColor: z.string().min(1),
  glasses: z.boolean(),
  name: z.string().max(12),
})

export const designSchema = z.object({
  product: z.string().min(1),
  color: z.string().min(1),
  people: z.array(personSchema).min(1).max(6),
  line: z.string().max(32),
  font: fontEnum,
})

export type PersonType = z.infer<typeof personTypeEnum>
export type FontId = z.infer<typeof fontEnum>
export type Person = z.infer<typeof personSchema>
export type Design = z.infer<typeof designSchema>
