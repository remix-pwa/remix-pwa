<div align="center">

<img src="https://ucarecdn.com/ab502fed-46f6-4db0-866a-42d82b5d296d/UntitledDesign3.png" width="250" alt="remix-pwa"/>

# Remix PWA

**PWA integration & support for Remix**

[![stars](https://img.shields.io/github/stars/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/stargazers)
[![issues](https://img.shields.io/github/issues/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/issues)
[![License](https://img.shields.io/github/license/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/blob/main/LICENSE.md)

</div>

Remix PWA is a lightweight, standalone npm package that adds full Progressive Web App support to Remix 💿.

> New "Major" upgrade v0.5.0 released! Checkout the [release changelog]() for full details !

## Features

- Integrates Progressive Web App (PWA) features into Remix including offline support, caching, installability on Native devices and more.
- Automatic caching for `build` files and static files.
- Implements a network-first strategy for loader calls (i.e Gets a fresh request each time when online, and proceeds to an older fallback when offline)
- Auto-caching loader calls to allow offline client-side transitioning between pages
- Safely handles uncached loader calls without affecting other sections of the site (i.e Throws user to nearest Error boundary without disrupting Service Workers)

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

## Setting up your PWA

> v0.3.0 update: _`remix-pwa` automatically updates scripts now, so you don't need to do any editing to the `package.json` file._

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

All Client APIs all return an object (type `ReturnObject`) that consists of two properties: `status` and `message`. The `status` key is a string that would either be "success" or "bad". `remix-pwa` is set up by default, with error-catching procedures for these APIs. You can still set up your custom responses (to display a particluar UI for example, if the particular API isn't supported in the user's browser) in case of an error or a successful request with the `status` response. The `message` key is a default message string that accompanies the status in case of a pass or fail.

```ts
interface ReturnObject {
  status: "success" | "bad",
  message: string;
}
```

### Check Connectivity
#### `checkConnectivity(online: () => any, offline: () => any): Promise<ReturnObject>`

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

```tsx
import { addBadge, removeBadge } from "~utils/client/pwa-utils.client";

// used to clear away all notification badges
removeBadge()

//used to add a badge to the installed App
addBadge(3); // sets a new notification badge with 3 indicated notifications 
```

> **⚠ Hang On tight! We are working on bringing more to you amazing folks. ⚠**

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

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details
