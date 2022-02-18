<div align="center">

<img src="https://ucarecdn.com/ab502fed-46f6-4db0-866a-42d82b5d296d/UntitledDesign3.png" width="250" alt="remix-pwa"/>

# Remix PWA

**PWA integration & support for Remix**

[![stars](https://img.shields.io/github/stars/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/stargazers)
[![issues](https://img.shields.io/github/issues/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/issues)
[![License](https://img.shields.io/github/license/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/blob/main/LICENSE.md)

</div>

Remix PWA is a lightweight, standalone npm package that adds full Progressive Web App support to Remix 💿.

## Features

- Integrates Progressive Web App (PWA) features into Remix including offline support, caching, installability on Native devices and more.
- Automatic caching for `build` files and static files.
- Implements a network-first strategy for loader calls (i.e Gets a fresh request each time when online, and proceeds to an older fallback when offline)
- Auto-caching loader calls to allow offline client-side transitioning between pages
- Safely handles uncached loader calls without affecting other sections of the site (i.e Throws user to nearest Error boundary without disrupting Service Workers)

## Getting Started

### Prerequisites

> This package requires `esbuild` to be installed.

Install esbuild by running the following command:

```sh
npm install esbuild
```

### Installation

To install `remix-pwa` into your Remix project, run the following command:

```sh
npm install remix-pwa
```

During installation, you would be required to choose the current language you are using with your Remix project, JavaScript or TypeScript.

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

## Roadmap

Want to see proposed features and bug fixes? Or do you want to propose an idea/bug fix for `remix-pwa` and want to view the current roadmap? Check out `remix-pwa` [Roadmap](./ROADMAP.md) and see what lies in wait for us!

## Contributing

Thank you for your interest in contributing 🙂. The contribution guidelines and process of submitting Pull Requests are available in the [CONTRIBUTING.md](./CONTRIBUTING.md). Awaiting your PR 😉!

## Support 

If you want to get help on an issue or have a question, you could either [open an issue](https://github.com/ShafSpecs/remix-pwa/issues/new/choose) or you could ask your questions in the [Official Remix's Discord Server](https://discord.gg/TTVwU2wZca) where there are a lot of helpful people to help you out.

## Author

- Abdur-Rahman Fashola (aka [@ShafSpecs](https://github.com/ShafSpecs))

- Special thanks to [jacob-ebey](https://github.com/jacob-ebey) for making this whole endeavour possible!

See (todo: CONTRIBUTORS.md) for the list of awesome `remix-pwa` contributors!

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details
