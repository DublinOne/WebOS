import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { integrations } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const integrationsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    // Note: In a real app, we would get the userId from the session context
    const userId = 'guest_user';
    
    const results = await ctx.db.select({
      id: integrations.id,
      type: integrations.type,
      metadata: integrations.metadata,
      updatedAt: integrations.updatedAt,
    })
    .from(integrations)
    .where(eq(integrations.userId, userId));
    
    return results;
  }),
  
  save: publicProcedure
    .input(z.object({
      type: z.enum(['alza_gemini', 'github', 'soundcloud', 'user_secret']),
      secretValue: z.string(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = 'guest_user';
      
      // Upsert logic: check if integration of this type already exists for the user
      const existing = await ctx.db.select()
        .from(integrations)
        .where(and(
          eq(integrations.userId, userId),
          eq(integrations.type, input.type)
        ))
        .limit(1);
        
      if (existing.length > 0) {
        return await ctx.db.update(integrations)
          .set({
            secretValue: input.secretValue,
            metadata: input.metadata,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, existing[0].id));
      } else {
        return await ctx.db.insert(integrations)
          .values({
            userId,
            type: input.type,
            secretValue: input.secretValue,
            metadata: input.metadata,
          });
      }
    }),
    
  remove: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = 'guest_user';
      return await ctx.db.delete(integrations)
        .where(and(
          eq(integrations.id, input.id),
          eq(integrations.userId, userId)
        ));
    }),
});
