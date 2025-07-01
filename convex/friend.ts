import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const remove = mutation({
  args: {
    id: v.id('conversations')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser)
      throw new ConvexError("User not found");

    const conversation = await ctx.db.get(args.id);
    if (!conversation) throw new ConvexError("Conversation not found");

    const memberships = await ctx.db.query("conversationMembers")
      .withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();

    if (!memberships || memberships.length !== 2)
      throw new ConvexError("This conversation doesn't have any members");

    const friendship = await ctx.db.query("friends")
      .withIndex("by_conversationId", q => q.eq("conversationId", args.id)).unique();

    if (!friendship)
      throw new ConvexError("Friend could not be found.");

    const messages = await ctx.db.query("messages")
      .withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();

    await ctx.db.delete(args.id);
    await ctx.db.delete(friendship._id);
    await Promise.all(messages.map(msg => ctx.db.delete(msg._id)));
    await Promise.all(memberships.map(e => ctx.db.delete(e._id)));

  }
})