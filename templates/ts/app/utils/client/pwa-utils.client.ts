/* 
  Project Fugu APIs 
  & 
  other client-side Service Worker methods & APIs for PWAs  
*/

/* 
  ⚠ Except you understand & know the implication of what you're what you are doing, don't modify this file! ⚠
*/

/**
 * Response Object returned by Client APIs. It serves as a good debugging
 * and error-checking method.
 */

interface ResponseObject {
  status: "success" | "bad";
  message: string;
}

// Clipboard Copy API

/**
 * Copies text to the clipboard of the device.
 *
 * @param {string} text - The text to copy to the device
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function copyText(text: string): Promise<ResponseObject> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return {
        status: "success",
        message: "Copied to clipboard",
      };
    } else {
      return {
        status: "bad",
        message: "Your browser does not support clipboard API",
      };
    }
  } catch (err) {
    console.debug(err);
    throw new Error("Unable to copy text to clipboard!");
  }
}

// Handle connectivity check and return one of the specifics

/**
 * Check wether the device is currently online and execute some function with respect to the user's device connectivity state.
 *
 * @param {() => void} online - A function to be invoked if the device is online.
 * @param {() => void} offline - A function to be invoked if the device is not connected to an internet network.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function checkConnectivity(online: () => void, offline: () => void): Promise<ResponseObject> {
  try {
    if (navigator.onLine) {
      online();
      return {
        status: "success",
        message: "Connected to the internet",
      };
    } else {
      offline();
      return {
        status: "bad",
        message: "No internet connection available",
      };
    }
  } catch (err) {
    console.debug(err);
    throw new Error("Unable to check network connectivity!");
  }
}

// Keep device awake for a determined period of time

/**
 * Trigger the WakeLock API to keep the device's screen on.
 *
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function WakeLock(): Promise<ResponseObject> {
  try {
    if ("wakeLock" in navigator) {
      // This is an experimental feature!

      //@ts-ignore
      const wakelock = navigator.wakeLock.request("screen");
      if (wakelock) {
        return {
          status: "success",
          message: "WakeLock activated!",
        };
      } else {
        return {
          status: "bad",
          message: "WakeLock activation failed!",
        };
      }
    } else {
      return {
        status: "bad",
        message: "Your browser does not support WakeLock API!",
      };
    }
  } catch (err) {
    console.debug(err);
    throw new Error("Error activating WakeLock!");
  }
}

// Badge creator

/**
 * Display a notification badge with a number count on the app's icon.
 *
 * @param {number} numberCount - The number of notifications that would be displayed on the App's Badge.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function addBadge(numberCount: number): Promise<ResponseObject> {
  try {
    //@ts-ignore
    if (navigator.setAppBadge) {
      //@ts-ignore
      await navigator.setAppBadge(numberCount);
      return {
        status: "success",
        message: "Badge successfully added",
      };
    } else {
      return {
        status: "bad",
        message: "Badging API not supported",
      };
    }
  } catch (err) {
    console.debug(err);
    throw new Error("Error adding badge!");
  }
}

// remove Badges

/**
 * Remove all notification badges from the App.
 *
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function removeBadge(): Promise<ResponseObject> {
  try {
    //@ts-ignore
    if (navigator.clearAppBadge) {
      //@ts-ignore
      await navigator.clearAppBadge();
      return {
        status: "success",
        message: "Cleared badges",
      };
    } else {
      return {
        status: "bad",
        message: "Badging API not supported in this browser!",
      };
    }
  } catch (error) {
    console.debug(error);
    throw new Error("Error removing badge!");
  }
}

// Enable Full-Screen mode for an app

/**
 * Trigger full-screen mode on an element/page.
 *
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function EnableFullScreenMode(): Promise<ResponseObject> {
  try {
    if (document.fullscreenEnabled) {
      document.documentElement.requestFullscreen();
      return {
        status: "success",
        message: "Fullscreen mode activated",
      };
    } else {
      return {
        status: "bad",
        message: "Fullscreen mode not supported",
      };
    }
  } catch (err) {
    console.debug(err);
    throw new Error("Error activating fullscreen mode!");
  }
}

// Exit fullscreen mode

/**
 * Exit full-screen mode on an element/page.
 *
 * @return {RPromise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function ExitFullScreenMode(): Promise<ResponseObject> {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      return {
        status: "success",
        message: "Fullscreen mode deactivated",
      };
    } else {
      return {
        status: "bad",
        message: "Fullscreen mode not supported",
      };
    }
  } catch (err) {
    console.debug(err);
    throw new Error("Error deactivating fullscreen mode!");
  }
}

// Send a client notification to the user

interface NotificationOptions {
  body: string | "Notification body";
  badge?: string;
  icon?: string;
  image?: string;
  silent: boolean | false;
}

/**
 * Trigger a notification client-side based on anything!
 *
 * @param {string} title - The main title (header) of the notification
 * @param {NotificationOptions} options - An object consisting of the notification's body, badge, icon, image, and silent options. Refer to https://github.com/ShafSpecs/remix-pwa#client-notification-api for additional info.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function SendNotification(title: string, options: NotificationOptions): Promise<ResponseObject> {
  try {
    if ("Notification" in window) {
      const permissions = await (await navigator.permissions.query({ name: "notifications" })).state;
      navigator.permissions.query({ name: "notifications" }).then((permissionStatus) => {
        if (permissionStatus.state === "granted") {
          return;
        } else {
          return Notification.requestPermission();
        }
      });

      if (permissions === "granted") {
        await navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, options);
          return {
            status: "success",
            message: "Sent Notification to user successfully",
          };
        });
      } else {
        return {
          status: "bad",
          message: "Denied access to sending notifications!",
        };
      }
    } else {
      return {
        status: "bad",
        message: "Notification API not supported",
      };
    }
  } catch (error) {
    console.debug(error);
    throw new Error("Error sending notification!");
  }
}

// Page focus

/**
 * Check wether an element is currently visible or not.
 *
 * @param {() => void} isVisible - A function to be invoked if the element is currently visible on the page.
 * @param {() => void} notVisible - A function to be invoked if the element is not visible on the current page.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function Visibility(isVisible: () => void, notVisible: () => void): Promise<ResponseObject> {
  try {
    if (document.visibilityState) {
      const visibleState = document.visibilityState;

      if (visibleState === "visible") {
        isVisible();
        return {
          status: "success",
          message: "Page is focused and being viewed!",
        };
      } else {
        notVisible();
        return {
          status: "bad",
          message: "Page is not currently being viewed!",
        };
      }
    }

    return {
      status: "bad",
      message: "Page focus API not supported",
    };
  } catch (err) {
    console.debug(err);
    throw new Error("Error checking page visibility!");
  }
}

// Copying Image to the clipboard

/**
 * Copy an image to a device's clipboard.
 *
 * @param {string} url - The url of the string to be copied.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function copyImage(url: string): Promise<ResponseObject> {
  try {
    if (navigator.clipboard) {
      const data = await fetch(url);
      const fileBlob = await data.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [fileBlob.type]: fileBlob,
        }),
      ]);
      return {
        status: "success",
        message: "Image copied successfully successfully!",
      };
    } else {
      return {
        status: "bad",
        message: "Copy Image API not supported on your device!",
      };
    }
  } catch (err) {
    throw new Error("Error occured while copying image to clipboard!");
  }
}

// Sharing information straight to other apps from PWA.

/**
 * Share info/links/random stuffs from your PWA to other apps.
 *
 * @param {any} data - The data to be shared.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function WebShare(data: any): Promise<ResponseObject> {
  try {
    if (navigator.share && navigator.canShare(data)) {
      await navigator.share(data);
      return {
        status: "success",
        message: "Shared links accordingly!",
      };
    } else {
      return {
        status: "bad",
        message: "Web Share API not supported",
      };
    }
  } catch (err) {
    throw new Error("Failed to share for some weird reason 🤷‍♂️!");
  }
}

// Custom handler to share link to other apps from your app

/**
 * Share a link to other apps from your app.
 *
 * @param {string} url - The URL of the link to be shared.
 * @param {string} title - The title of the shared link embed.
 * @param {string} text - An accompanying text alongside the header.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function WebShareLink(url: string, title: string, text: string): Promise<ResponseObject> {
  try {
    if (navigator.canShare({ url })) {
      await navigator.share({
        title: title,
        text: text,
        url: url,
      });
      return {
        status: "success",
        message: "Shared link accordingly!",
      };
    } else {
      return {
        status: "bad",
        message: "Web Share API not supported",
      };
    }
  } catch (err) {
    throw new Error("Failed to share for some weird reason 🤷‍♂️!");
  }
}

// Special Web Share API for sharing files to your App.

/**
 * Share a file (or array of files) to other apps directly from your PWA.
 *
 * @param {string} title - The title of the shared link embed.
 * @param {any} data - An array of the files to be shared (e.g Images, PDFs, etc).
 * @param {string} text - An accompanying text alongside the header.
 * @return {Promise<ResponseObject>} An object consisting of two properties: A status to indicate the status of the invocation and also an accompanying message.
 */
export async function WebShareFile(title: string, data: any[], text: string): Promise<ResponseObject> {
  let filesArray = [...data];
  try {
    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
      await navigator.share({
        files: filesArray,
        title: title,
        text: text,
      });
      return {
        status: "success",
        message: "Shared file accordingly!",
      };
    } else {
      return {
        status: "bad",
        message: "Web Share API not supported",
      };
    }
  } catch (error) {
    throw new Error("Error occured sharing file!");
  }
}
