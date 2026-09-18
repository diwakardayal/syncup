import { z } from "zod";

export const slugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const createChannelBodySchema = z.object({
  name: z.string().min(1),
  isPrivate: z.boolean().default(false),
});

export const channelParamsSchema = z.object({
  channelId: z.coerce.number()
})
 