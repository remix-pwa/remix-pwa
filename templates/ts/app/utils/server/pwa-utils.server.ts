const storage = require("node-persist");
const webPush = require("web-push");

interface PushObject {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  dir?: string;
  image?: string;
  silent?: boolean;
}

export async function SaveSubscription(sub: PushSubscription): Promise<void> {
  await storage.init();
  await storage.setItem("subscription", sub);
}

export async function PushNotification(content: PushObject, delay: number = 0) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log(
      "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
        "environment variables. You can use the following ones:"
    );
    console.log(webPush.generateVAPIDKeys());
    return;
  }

  webPush.setVapidDetails(
    "https://serviceworke.rs/",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  await storage.init();
  const subscription = await storage.getItem("subscription");

  setTimeout(() => {
    webPush
      .sendNotification(subscription, JSON.stringify(content))
      .then(() => {
        return new Response("success", {
          status: 200,
        });
      })
      .catch((e: Error) => {
        console.log(e);
        return new Response("Failed!", {
          status: 500,
        });
      });
  }, delay * 1000);
}
