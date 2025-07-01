import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix"
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";
import { any, string } from "zod";
import { use } from "react";

const generateUsername = (first: string | null, last: string | null) => {
  if (!(first || last))
    return "Default username";
  else return `${first || ""}${first && last ? " " : ""}${last || ""}`
}

async function validatePayload(req: Request): Promise<WebhookEvent | undefined> {
  const payload = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  try {
    const event = webhook.verify(payload, svixHeaders) as WebhookEvent;
    return event;
  } catch (e) {
    console.error("Clerk webhook request could not be veriifed!");
    return;
  }
}

const handleClerkWebhook = httpAction(async (ctx, req) => {
  const event = await validatePayload(req);
  if (!event)
    return new Response("Could not validate clerk payload", { status: 400 });

  const user = await ctx.runQuery(
    internal.users.get, { clerkId: event.data.id! });

  switch (event.type) {
    case "user.created": {
      if (user)
        throw new ConvexError(`User with clerkId ${event.data.id} already exists`);

      await ctx.runMutation(internal.users.create, {
        username: generateUsername(event.data.first_name, event.data.last_name),
        imageUrl: event.data.image_url,
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address
      });

      break;
    }
    case "user.updated": {
      if (!user)
        throw new ConvexError("User to update not found");

      console.log(`Updating User:${event.data.id}`);
      console.log(event.data);

      const updatedData = {
        username: generateUsername(event.data.first_name, event.data.last_name),
        email: event.data.email_addresses[0].email_address,
        imageUrl: event.data.image_url,
      };

      const newData = {};

      for (const key in updatedData) {
        user.imageUrl
        if ((user as any)[key] !== (updatedData as any)[key])
          (newData as any)[key] = (updatedData as any)[key];
      }

      // const newData = {
      //   ...(event.data.email_addresses[0].email_address === user.email ? {}
      //     : { email: event.data.email_addresses[0].email_address }),
      // };

      await ctx.runMutation(internal.users.update, {
        id: user._id,
        newData
      });

      break;
    }
    default: {
      console.log("Clerk webhook event not supported", event.type);
    }
  }
  return new Response(null, { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook
});

export default http;