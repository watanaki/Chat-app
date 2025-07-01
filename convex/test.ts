import { ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { request } from "http";

export const createFriends = mutation({
  args: {},
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const friendships = [];

    for (let i = 0; i < users.length; i++) {
      const friend1 = await ctx.db.query("friends")
        .withIndex("by_user1", q => q.eq("user1", users[i]._id))
        .collect();
      const friend2 = await ctx.db.query("friends")
        .withIndex("by_user2", q => q.eq("user2", users[i]._id))
        .collect();

      for (let j = i + 1; j < users.length; j++) {

        // 检查是否已是朋友关系
        if (
          friend1.some(friend => friend.user2 === users[j]._id) ||
          friend2.some(friend => friend.user1 === users[j]._id)
        ) {
          console.log(`${users[i].username} 和 ${users[j].username} 已是朋友`);
          continue;
        }

        // 检查二人间是否已存在request
        const requestSent = await ctx.db.query("requests")
          .withIndex("by_receiver_sender", q =>
            q.eq("receiver", users[j]._id)
              .eq("sender", users[i]._id)
          ).unique();

        const requestReceived = await ctx.db.query("requests")
          .withIndex("by_receiver_sender", q =>
            q.eq("receiver", users[i]._id)
              .eq("sender", users[j]._id)
          ).unique();

        if (requestSent || requestReceived) {
          console.log(`${users[i].username} 和 ${users[j].username} 之间已存在好友请求`);
          continue;
        }

        friendships.push([
          { id: users[i]._id, name: users[i].username },
          { id: users[j]._id, name: users[j].username }
        ]);
      }
    }
    // console.log(friendships.length);
    await Promise.all(friendships.map(async friendship => {
      const [user1, user2] = friendship;

      const request = await ctx.db.insert("requests", {
        sender: user1.id,
        receiver: user2.id
      });

      const conversationId = await ctx.db.insert("conversations", { isGroup: false });

      await Promise.all([
        ctx.db.insert("friends", {
          user1: user1.id,
          user2: user2.id,
          conversationId
        }),
        ctx.db.insert("conversationMembers", {
          memberId: user1.id,
          conversationId
        }),
        ctx.db.insert("conversationMembers", {
          memberId: user2.id,
          conversationId
        }),
        ctx.db.delete(request)
      ]);
    }));

  }
});