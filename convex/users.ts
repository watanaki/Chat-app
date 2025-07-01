import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const create = internalMutation({
  args: {
    username: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", args);
  }
});

export const update = internalMutation({
  args: {
    id: v.id("users"),
    newData: v.object({
      email: v.optional(v.string()),
      username: v.optional(v.string()),
      imageUrl: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const { id, newData } = args;
    await ctx.db.patch(id, newData);
  }
})

export const get = internalQuery({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    return ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});