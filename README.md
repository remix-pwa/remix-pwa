<div align="center">

<img src="https://ucarecdn.com/ab502fed-46f6-4db0-866a-42d82b5d296d/UntitledDesign3.png" width="250" alt="remix-pwa"/>

# Remix PWA

**PWA integration & support for Remix**

[![stars](https://img.shields.io/github/stars/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/stargazers)
[![issues](https://img.shields.io/github/issues/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/issues)
[![License](https://img.shields.io/github/license/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/blob/main/LICENSE.md)

</div>

Remix PWA is a lightweight, standalone npm package that adds full Progressive Web App support to Remix 💿.

> New "Major" upgrade v0.5.0 released! Checkout the [release changelog](https://github.com/ShafSpecs/remix-pwa/releases/tag/v0.5.0) for full details !

## Features

- Integrates Progressive Web App (PWA) features into Remix including offline support, caching, installability on Native devices and more.
- Automatic caching for `build` files and static files.
- Implements a network-first strategy for loader calls (i.e Gets a fresh request each time when online, and proceeds to an older fallback when offline)
- Auto-caching loader calls to allow offline client-side transitioning between pages
- Safely handles uncached loader calls without affecting other sections of the site (i.e Throws user to nearest Error boundary without disrupting Service Workers)
- PWA client-side utilities that comes bundled with your App to give you more options and freedom while building the PWA of tomorrow.

## Table Of Content

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Deployment](#deployment)
  - [Upgrading Guide](#upgrade-guide)
  - [Setting Up your PWA](#setting-up-your-pwa)
- [API Documentation](#api-documentation)
  - [Client APIs](#client-apis)
    - [Type Annonations and Return Object](#type-annonations)
    - [Check Connection Status of User](#check-connectivity)
    - [Clipboard API](#copy-text-to-clipboard)
    - [WakeLock API](#wakelock-api)
    - [App Notification Badges](#app-badges)
    - [FullScreen Toggle Utility](#fullscreen-toggle)
    - [Notification API](#client-notification-api)
    - [Document Visibility](#visibility-state)
  - [Server APIs](#server-api)
- [Remix PWA Roadmap](#roadmap)
- [Contributing Doc](#contributing)
- [Help Support](#support)
- [Authors](#authors)
- [License](#license)  

## Getting Started

### Installation

To install `remix-pwa` into your Remix project, run the following command:

```sh
npm install --save-dev remix-pwa@latest
```

During installation, you would be required to choose the current language you are using with your Remix project, JavaScript or TypeScript.

### Deployment

To build and deploy your Remix PWA App, simply run the command:

```sh
npm run build
```

at build time and then, you can host it on any hosting providers you prefer.

### Upgrade Guide

To upgrade to a newer version of `remix-pwa`, simply re-run 
```sh
npm i --save-dev remix-pwa@latest
```
and you can continue with your PWA

> For users coming from pre-0.5.0, delete the following file `entry.worker.[t/j]s`from your project, make sure there are no duplicate code blocks in your `entry.client` and `root` file, then delete `remix-pwa` with the command `npm uninstall remix-pwa` and finally, run `npm i --save-dev remix-pwa@latest` again.

## Setting up your PWA

After installing `remix-pwa`, link the `manifest` file in order to get installability feature of PWA as well as app characteristics and other features. To do that, simply add the following block of code to the head in your `root` file above the `<Links />` tag:

```jsx
<link rel="manifest" href="/resources/manifest.json" />
```

To run your app, simply run the command:

```sh
npm run dev
```

And voila! You are now ready to use your PWA! 

If you want to lay you hands on demo icons and favicons for your PWA, `remix-pwa` got you covered with sample icons. Simply delete the `favicon.ico`
in your `public` folder and add the [following links](https://github.com/ShafSpecs/remix-pwa/blob/main/examples/pwa-links.ts#L9) to your `root` file, above the `<Links />` tag.

# API Documentation

## Client APIs

> Client APIs are a set of asynchronous functions that are to be run on the client **only** and never on the server. 

They can be triggered by DOM events (click, hover, keypress, etc.) like other functions, but in order to trigger window events that happen at the start of a page lifecycle, e.g page "load" event, it is **highly recommended** to use these functions in a React's `useEffect` hook.

#### <u>Type annonations</u>:

Almost all Client APIs return a promise object (type `ReturnObject`) that consists of two properties: `status` and `message`. The `status` key is a string that would either be "success" or "bad". `remix-pwa` is set up by default, with error-catching procedures for these APIs. You can still set up your custom responses (to display a particluar UI for example, if the particular API isn't supported in the user's browser) in case of an error or a successful request with the `status` response. The `message` key is a default message string that accompanies the status in case of a pass or fail.

```ts
interface ReturnObject {
  status: "success" | "bad",
  message: string;
}
```

### Check Connectivity
#### `checkConnectivity(online: () => void, offline: () => void): Promise<ReturnObject>`

This function is used to check wether a user is online or offline and execute a function accordingly. It could be used to update a state,
display a particular UI or send a particular response to the server.

```ts
import { checkConnectivity } from "~utils/client/pwa-utils.client";

const online = () => {
  //..Do something for online state
}

const offline = () => {
  //..Do something for offline state
}

useEffect(() => {
  // The `console.log` method returns an object with a status of "success" if online and a pass message or a status of "bad" and a fail message if offline
  checkConnectivity(online, offline).then(data => console.log(data)) 
}, [])
```

### Copy text to Clipboard
#### `copyText(text: string) => Promise<ReturnObject>`

The Clipboard API is a method used to access the clipboard of a device, native or web, and write to it. This function can be triggered by DOM events, i.e "click", "hover", etc. or window events i.e "load", "scroll", etc. 

```tsx
import { copyText } from "~utils/client/pwa-utils.client";

<button onClick={() => copyText("Test String")}>Copy to Clipboard</button>
```

### WakeLock API
#### `WakeLock() => Promise<ReturnObject>`

> **🚨 This is still an experimental feature! Some browsers like FireFox would not work with this feature! 🚨**

The WakeLock API is a function that when fired, is used to keep the screen of a device on at all times even when idle. It is usually fired when an app is started or when a particular route that needs screen-time is loaded (e.g A video app that has a `watch-video` route)

```tsx
import { WakeLock } from "~utils/client/pwa-utils.client";

useEffect(() => {
  WakeLock() // triggers the Wakelock api
}, [])
```

### App Badges
#### `addBadge(numberCount: number) => Promise<ReturnObject>`

#### `removeBadge() => Promise<ReturnObject>`

The badge API is used by installed web apps to set an application-wide badge, shown in an "operating-system-specific" place associated with the application (such as the shelf or home screen or taskbar).

The badge API makes it easy to silently notify the user that there is new activity that might require their attention, or to indicate a small amount of information, such as an unread count (e.g unread messages).

The `addBadge` function takes a number as an argument (displays the number of notification) while the `removeBadge` function doesn't take any argument.

```tsx
import { addBadge, removeBadge } from "~utils/client/pwa-utils.client";

// used to clear away all notification badges
removeBadge()

//used to add a badge to the installed App
addBadge(3); // sets a new notification badge with 3 indicated notifications 
```

### FullScreen Toggle
#### `EnableFullScreenMode() => Promise<ReturnObject>`

#### `ExitFullScreenMode() => Promise<ReturnObject>`

The Full Screen feature is an additional utility you can integrate into your app while building your PWA, `EnableFullScreenMode()` enables an App to cover the entire breadth and width of the scree at the tap of a button and the `ExitFullScreenMode()` exits full-screen mode. They both don't take any arguments and can be invoked like any other normal function.

```tsx
import { EnableFullScreenMode, ExitFullScreenMode } from "~/utils/client/pwa-utils.client";

// Enable full-screen at the click of a button
<button onClick={EnableFullScreenMode}>Enable Full-Screen mode</button>

//Exit full-screen mode
<button onClick={ExitFullScreenMode}>Exit Full-Screen Mode</button>
```

### (Client) Notification API
#### `SendNotification(title: string, option: NotificationOptions) => Promise<ReturnObject>`

```ts
// Interface `NotificationOptions`
interface NotificationOptions {
  body: string | "Notification body";
  badge?: string;
  icon?: string;
  silent?: boolean | false;
}
```

The `SendNotification` API is a client-only function driven only by the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notification), it is different from the Push API which is another API handled and executed by the server (arriving to `remix-pwa` soon). The `SendNotification` function is executed by the client and takes in two arguments, one is the title of the notification and that's the top header (Title) of the notification your user would see. The second option is an object that would contain additional options for the API.

The first key for the `NotificationsObject` argument is the `body` and that is a required argument. The body is the main content of your notification that would contain the details of what you want to pass to the user. The `badge` argument is an optional argument and it's the image URL string of the Notification badge, and it's what the user would see when there is no space for the Notifivcation content to show. It is recommended to use a 96px by 96px square image for the badge. The next argument is the `icon` argument which is the image that would be displayed alongside your Notification. The final argument is the silent parameter and it's a boolean argument (**true** or **false**), it is used to determine wether a notification should be sent silently regardless of the device's settings, it is by default set to false.

The Notification API can take values from the server (e.g `loader`) or from the client but it must be called and executed on the client side. We are working on adding the Push API that allows you to execute a Notification API together with the Push API on the server side in response to anything (for example, when a message is sent to a user in a messaging App).

> This API is fully stable and is setup comepletely for your use cases including Notification permissions, however, we are working on adding more API options so that you can have the maximum custom experience!

```tsx
import { SendNotification } from "~/utils/client/pwa-utils.client";

const options = {
  body: "Hello, take a break and drink some water! 💧",
  badge: "/icons/notification-badge.png", // not required
  icon: "/icons/app-icon.png", // not required
  silent: false // not required
}

let minutes = 30

// executed in several ways
setTimeout(() => {
  SendNotification("Workout App", options)
}, minutes * 60 * 1000)

// another method of execution
<button onClick={() => SendNotification("Exercise Tracker App", options)}>Take a break!</button>
```

### Visibility State
#### `Visibility (isVisible: () => void, notVisible: () => void): Promise<ResponseObject>`

This utility is used to get wether a document is visible or is minimized (or in the background, etc). It takes two functions as its parameter, one for a visible state, and the other for an invisible state. A common use case for this is to stop a process (e.g video playing, downloading process, etc) when the app is minimized or to run a process *only* when the App is minimized.

```tsx
import { Visibility } from "~/utils/client/pwa-utils.client"

const documentVisible = () => {
  //..do something
}

const documentInvisible = () => {
  //..do something else
}

const state = document.visibilityState

// Monitor visibility and keep firing the function on visibility change
useEffect(() => {
  Visibiliy(documentVisible, documentInvisible)
}, [state])
```

## Server API

#### 🚧 Still Working on these set of APIs 🚧

> **⚠ Hang On tight! We are working on bringing more awesome features to you amazing folks. ⚠**

## Roadmap

Want to see proposed features and bug fixes? Or do you want to propose an idea/bug fix for `remix-pwa` and want to view the current roadmap? Check out `remix-pwa` [Roadmap](./ROADMAP.md) and see what lies in wait for us!

## Contributing

Thank you for your interest in contributing 🙂. The contribution guidelines and process of submitting Pull Requests are available in the [CONTRIBUTING.md](./CONTRIBUTING.md). Awaiting your PR 😉!

## Support 

If you want to get help on an issue or have a question, you could either [open an issue](https://github.com/ShafSpecs/remix-pwa/issues/new/choose) or you could ask your questions in the [Official Remix's Discord Server](https://discord.gg/TTVwU2wZca) where there are a lot of helpful people to help you out.

## Authors

- Abdur-Rahman Fashola (aka [@ShafSpecs](https://github.com/ShafSpecs))

- Special thanks to [jacob-ebey](https://github.com/jacob-ebey) for his contribution and help with the creation of `remix-pwa`!

See (todo: CONTRIBUTORS.md) for the list of awesome `remix-pwa` contributors!

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.