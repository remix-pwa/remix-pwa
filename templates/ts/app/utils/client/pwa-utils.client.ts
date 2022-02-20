/* 
  Project Fugu APIs 
  & 
  other client-side Service Worker methods & APIs  
*/

/* 
  ⚠ Except you understand what you're what you are doing, don't modify this file! ⚠
*/

// Clipboard Copy API

export async function copyText(text: string) {
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
    throw new Error("Unable to copy text to clipboard!");
  }
}

// Handle connectivity check and return one of the specifics

export async function checkConnectivity(online: () => any, offline: () => any) {
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
    throw new Error("Unable to check network connectivity!");
  }
}

// Keep device awake for a determined period of time

export async function WakeLock() {
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
    throw new Error("Error activating WakeLock!");
  }
}

// Badge creator

export async function addBadge(numberCount: number) {
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
    throw new Error("Error adding badge!");
  }
}

// remove Badges

export async function removeBadge() {
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
    throw new Error("Error occured while removing badge!");
  }
}
