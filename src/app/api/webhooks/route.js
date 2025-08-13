import { createOrUpdateUser } from "@/lib/actions/user";
import { clerkClient } from "@clerk/nextjs/dist/types/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Webhook payload:", evt.data);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const {
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username,
      } = evt?.data;
      const user = await createOrUpdateUser(
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username
      );
      if (user || evt.type === "user.created") {
        try {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: { userMongoId: user._id },
          });
        } catch (error) {
          console.error("Error updating user metadata:", error);
        }
      }
      console.log("userId created:", id);
    }
    if (evt.type === "user.deleted") {
      const user = await deleteUser(id);
      console.log("userId deleted:", id);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  return new Response("Webhook received", { status: 200 });
}
