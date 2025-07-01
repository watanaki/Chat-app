import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity)
      throw new ConvexError("Unauthorized");

    if (args.email === identity.email)
      throw new ConvexError("Can't send a request to yourself");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser)
      throw new ConvexError("User not found");

    //Get the receiver from convex db using the email
    const receiver = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", args.email)).unique();

    if (!receiver)
      throw new ConvexError("Receiver not found");

    const requestAlreadySent = await ctx.db.query("requests")
      .withIndex("by_receiver_sender", q =>
        q.eq("receiver", receiver._id)
          .eq("sender", currentUser._id)).unique();

    if (requestAlreadySent)
      throw new ConvexError("Request already exists");

    const requestAlreadyReceived = await ctx.db.query("requests")
      .withIndex("by_receiver_sender", q =>
        q.eq("receiver", currentUser._id)
          .eq("sender", receiver._id)).unique();

    if (requestAlreadyReceived)
      throw new ConvexError("This user has already sent you a request");

    const friend1 = await ctx.db.query("friends")
      .withIndex("by_user1", q => q.eq("user1", currentUser._id))
      .collect();

    const friend2 = await ctx.db.query("friends")
      .withIndex("by_user2", q => q.eq("user2", currentUser._id))
      .collect();

    if (
      friend1.some(friend => friend.user2 === receiver._id) ||
      friend2.some(friend => friend.user1 === receiver._id)
    )
      throw new ConvexError("You are already friends with this user");

    //Add data
    const request = await ctx.db.insert("requests", {
      sender: currentUser._id,
      receiver: receiver._id
    });

    return request;
  }
});

export const deny = mutation({
  args: {
    id: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity)
      throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser)
      throw new ConvexError("User not found");

    const request = await ctx.db.get(args.id);

    if (!request || request.receiver !== currentUser._id)
      throw new ConvexError("Error occurred while denying this request");

    await ctx.db.delete(request._id);
  }
});

export const accept = mutation({
  args: {
    id: v.id("requests")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity)
      throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser)
      throw new ConvexError("User not found");

    const request = await ctx.db.get(args.id);

    if (!(request && request.receiver == currentUser._id))
      throw new ConvexError("Error occurred while accepting this request");

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false
    });

    await ctx.db.insert("friends", {
      user1: currentUser._id,
      user2: request.sender,
      conversationId
    });

    await ctx.db.insert("conversationMembers", {
      memberId: currentUser._id,
      conversationId
    });
    await ctx.db.insert("conversationMembers", {
      memberId: request.sender,
      conversationId
    });

    await ctx.db.delete(request._id);
  }
})