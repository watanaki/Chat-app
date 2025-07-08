import { ConvexError } from "convex/values";
import { MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { Id } from "./_generated/dataModel";
import { Brackets } from "lucide-react";

export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser)
      throw new ConvexError("User not found");

    // 从conversationMembers表中找到所有memberId为当前用户的项
    const conversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", q => q.eq("memberId", currentUser._id))
      .collect();

    // 找到所有当前用户参与的对话
    const conversations = await Promise.all(conversationMemberships?.map(
      async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);

        if (!conversation)
          throw new ConvexError("Conversation could not be found");

        return conversation;
      }
    ));

    const conversationsWithDetails = await Promise.all(conversations.map(
      async (conversation, index) => {
        // 找到每个对话的所有membership
        const allConversationMemberships = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", q => q.eq("conversationId", conversation._id))
          .collect();

        const lastMessage = await getLastMessageDetails({ ctx, id: conversation.lastMessageId });
        const LSMId = conversationMemberships[index].lastSeenMessage;
        const lastSeenMessage = LSMId ? await ctx.db.get(LSMId) : null;

        const lastSeenMessageTime = lastSeenMessage ? lastSeenMessage?._creationTime : -1;
        const unseenMessages = await ctx.db.query("messages")
          .withIndex("by_conversationId", q => q.eq("conversationId", conversation._id))
          .filter(q => q.gt(q.field("_creationTime"), lastSeenMessageTime))
          .filter(q => q.neq(q.field("senderId"), currentUser._id))
          .collect();

        if (conversation.isGroup)
          return { conversation, lastMessage, unseenCount: unseenMessages.length };
        else {
          const otherMembership = allConversationMemberships.filter(member => member.memberId !== currentUser._id)
          if (otherMembership.length > 1) throw new ConvexError("Multiple memberships in a non-group conversation");
          const otherMember = await ctx.db.get(otherMembership[0].memberId);

          return { conversation, otherMember, lastMessage, unseenCount: unseenMessages.length };
        }
      }
    ));

    return conversationsWithDetails;
  }
})

const getLastMessageDetails = async ({ ctx, id }: { ctx: QueryCtx | MutationCtx, id: Id<"messages"> | undefined }) => {
  if (!id) return null;

  const message = await ctx.db.get(id);
  if (!message) return null;

  const sender = await ctx.db.get(message.senderId);
  if (!sender) return null;

  const content = getMessageContent(message.type, message.content as unknown as string);

  return {
    content,
    sender: sender.username
  };
}

const getMessageContent = (type: string, content: string) => {
  switch (type) {
    case "text":
      return content;
      break;
    case "image":
      return "[Image]";
      break;
    case "file":
      return "[File]"
      break;
    default:
      return "[No-text]";
  }
}