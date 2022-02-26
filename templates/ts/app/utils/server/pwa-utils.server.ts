const storage = require("node-persist");
const webPush = require("web-push");

export async function SaveSubscription(sub: PushSubscription) {
  await storage.init();
  await storage.setItem("subscription", sub);
}

export async function PushNotification(content: string, delay: number = 0) {
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

  const subscription = await storage.getItem("subscription");

  setTimeout(() => {
    webPush
      .sendNotification(subscription, content)
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
