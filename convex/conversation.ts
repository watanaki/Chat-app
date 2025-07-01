import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const get = query({
  args: {
    id: v.id("conversations")
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

    const membership = await ctx.db.query("conversationMembers")
      .withIndex("by_memberId_conversationId", q =>
        q.eq("memberId", currentUser._id)
          .eq("conversationId", conversation._id)).unique();

    if (!membership) throw new ConvexError("You are not a member of this conversation");

    const allConversationMemberships = await ctx.db.query("conversationMembers")
      .withIndex("by_conversationId", q => q.eq("conversationId", conversation._id)).collect();

    if (!conversation.isGroup) {
      const otherMember = allConversationMemberships.filter(
        member => member.memberId !== currentUser._id)[0];

      const otherMemberWithDetail = await ctx.db.get(otherMember.memberId);

      return {
        ...conversation,
        otherMember: {
          ...otherMemberWithDetail,
          lastSeenMessageId: otherMember.lastSeenMessage
        },
        otherMembers: null
      };
    }
    else {
      const otherMembers = await Promise.all(allConversationMemberships.filter(
        member => member.memberId !== currentUser._id).map(async membership => {
          const member = await ctx.db.get(membership.memberId);
          if (!member)
            throw new ConvexError("Member could not be found");

          return {
            _id: member._id,
            username: member.username
          };
        }));

      return {
        ...conversation,
        otherMember: null,
        otherMembers
      }

    }
  }
})

export const createGroup = mutation({
  args: {
    members: v.array(v.id('users')),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser)
      throw new ConvexError("User not found");

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
    });

    await Promise.all([...args.members, currentUser._id].map(async memberId => {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        memberId,
      });
    }));
  }
})

export const removeGroup = mutation({
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

    if (!memberships || memberships.length <= 1)
      throw new ConvexError("This conversation doesn't have any members");

    const messages = await ctx.db.query("messages")
      .withIndex("by_conversationId", q => q.eq("conversationId", args.id)).collect();

    await ctx.db.delete(args.id);
    await Promise.all(messages.map(async msg => await ctx.db.delete(msg._id)));
    await Promise.all(memberships.map(async e => await ctx.db.delete(e._id)));

  }
})

export const leaveGroup = mutation({
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

    const membership = await ctx.db.query("conversationMembers")
      .withIndex("by_memberId_conversationId", q => q
        .eq("memberId", currentUser._id)
        .eq("conversationId", args.id))
      .unique();

    if (!membership)
      throw new ConvexError("You are not a member of this group");

    await ctx.db.delete(membership._id);

  }
})

export const markRead = mutation({
  args: {
    conversationId: v.id('conversations'),
    messageId: v.id('messages')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser)
      throw new ConvexError("User not found");

    const membership = await ctx.db.query("conversationMembers")
      .withIndex("by_memberId_conversationId", q => q
        .eq("memberId", currentUser._id)
        .eq("conversationId", args.conversationId))
      .unique();

    if (!membership)
      throw new ConvexError("You are not a member of this group");

    const lastMessage = await ctx.db.get(args.messageId);

    await ctx.db.patch(membership._id, {
      lastSeenMessage: lastMessage ? lastMessage._id : undefined
    });
  }
})