function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

navigator.serviceWorker.ready
  .then((registration) => {
    const subscription = registration.pushManager.getSubscription();
    return { subscription, registration };
  })
  .then(async (sub) => {
    if (await sub.subscription) {
      return sub.subscription;
    }

    const subInfo = await fetch("/resources/subscribe");
    const returnedSubscription = await subInfo.text();

    const convertedVapidKey = urlBase64ToUint8Array(returnedSubscription);
    return sub.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  })
  .then(async (subscription) => {
    await fetch("./resources/subscribe", {
      method: "POST",
      body: JSON.stringify({
        subscription: subscription,
        type: "POST_SUBSCRIPTION",
      }),
    });
  });
