<div align="center">

<img src="https://ucarecdn.com/ab502fed-46f6-4db0-866a-42d82b5d296d/UntitledDesign3.png" width="250" alt="remix-pwa"/>

# Remix PWA

**PWA integration & support for Remix**

[![issues](https://img.shields.io/github/issues/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/issues)
[![License](https://img.shields.io/github/license/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/blob/main/LICENSE.md)

</div>

Remix PWA is a lightweight, standalone npm package that adds full Progressive Web App support to Remix 💿.

## Features

- Automatic caching for `build` files and static files.
- Implements a network-first strategy for loader calls (i.e Gets a fresh request each time when online, and proceeds to an older fallback when offline)
- Auto-caching loader calls to allow offline client-side transitioning between pages
- Safely handles uncached loader calls without affecting other sections of the site (i.e Throws user to nearest Error boundary)

## Installation

```sh
npm install remix-pwa
```

During installation, you would be required to choose the current language you are using with your Remix project, JavaScript or TypeScript.

> This package requires `esbuild` to be installed.

## Setting up your PWA

After installing `remix-pwa`, replace your `build` and `dev` scripts with the following:

```js
"build": "run-p build:*",
"build:remix": "cross-env NODE_ENV=production remix build",
"build:worker": "esbuild ./app/entry.worker.ts --outfile=./public/entry.worker.js --minify --bundle --format=esm --define:process.env.NODE_ENV='\"production\"'",
"dev": "run-p dev:*",
"dev:remix": "cross-env NODE_ENV=development remix dev",
"dev:worker": "esbuild ./app/entry.worker.ts --outfile=./public/entry.worker.js --bundle --format=esm --define:process.env.NODE_ENV='\"development\"' --watch",
```

If you are using JavaScript instead of TypeScript, replace the `build:worker` and `dev:worker` scripts with the following:
```js
"build:worker": "esbuild ./app/entry.worker.js --outfile=./public/entry.worker.js --minify --bundle --format=esm --define:process.env.NODE_ENV='\"production\"'",
"dev:worker": "esbuild ./app/entry.worker.js --outfile=./public/entry.worker.js --bundle --format=esm --define:process.env.NODE_ENV='\"development\"' --watch",
```

To run your app, simply run the command:
```sh
npm run dev
```

Add the `manifest` file in order to get installability feature of PWA as well as app characteristics and other features, simply add the following block of code to the head in your `root` file above the `<Links />` tag:
```jsx
<link rel="manifest" href="/resources/manifest.json" />
```

And voila! You are now ready to use your PWA! If you want to lay you hands on demo icons and favicons for your PWA, `remix-pwa` got you covered with sample icons. Simply delete the `favicon.ico`
in your `public` folder and add the [following links](https://github.com/ShafSpecs/remix-pwa/blob/main/examples/pwa-links.ts#L9) to your `root` file, above the `<Links />` tag.

## Contributing

todo: CONTRIBUTING.md
