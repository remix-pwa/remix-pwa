<div align="center">

&NewLine;
<img src="./links/remix-pwa-logo.png" alt="logo" width="300" />
&NewLine;

# Remix PWA

[![stars](https://img.shields.io/github/stars/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/stargazers)
[![issues](https://img.shields.io/github/issues/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/issues)
[![License](https://img.shields.io/github/license/ShafSpecs/remix-pwa)](https://github.com/ShafSpecs/remix-pwa/blob/main/LICENSE.md)

</div>

Remix PWA is a PWA framework that seamlessly integrates Progressive Web App (PWA) features into Remix including offline support, caching, installability on Native devices and more.

**Remix PWA v3.0 is finally out! Check out the full release notes [here](https://github.com/remix-pwa/remix-pwa/releases/tag/v3.0)**

## Features

- Integrates Progressive Web App (PWA) features into Remix including offline support, caching, installability on Native devices and more.
- Automatic caching for `build` files and static files.
- Safely handles uncached loader calls without affecting other sections of the site (i.e Throws user to nearest Error boundary without disrupting Service Workers)

Check out the new [documentation](https://remix-pwa-docs.vercel.app) for the full list of features and more!

## Table Of Content

- [Remix PWA](#remix-pwa)
  - [Features](#features)
  - [Table Of Content](#table-of-content)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Upgrade Guide](#upgrade-guide)
  - [Setting up Remix for PWA](#setting-up-remix-for-pwa)
  - [API Documentation](#api-documentation)
  - [Contributing](#contributing)
  - [Support](#support)
  - [FAQ](#faq)
  - [Ecosystem](#ecosystem)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

### Installation

To integrate PWA features into your Remix App with `remix-pwa`, run the following command to get started with PWA goodness:

```sh
npx remix-pwa@latest init
```

> **To check out `remix-pwa` flags, run:**
> ```sh
> npx remix-pwa@latest -h
> ```
> *to view the commands*

Refer to [the docs](https://remix-pwa.run/docs/installation) for a detailed explanation of the CLI installation process.

### Upgrade Guide

To upgrade to the latest v2 version of `remix-pwa`, check out the [upgrade guide](https://remix-pwa.run/docs/upgrade-guide) in the docs.

## Setting up Remix for PWA

Check out the [quickstart guide](https://remix-pwa-docs.vercel.app/pwa/quickstart) in the docs for a detailed walkthrough on how to set up your Remix app for PWA.

If you want to lay your hands on demo icons and favicons for your PWA, `remix-pwa` got you covered with sample icons. Simply delete the `favicon.ico` in your `public` folder and add the [following links](https://github.com/ShafSpecs/remix-pwa/blob/main/links/pwa-links.ts#L9) to your `root` file, above the `<Links />` tag.

## API Documentation

The API documentation for Remix PWA v3.0 is now available [here](https://remix-pwa.run)

*To view old docs for `remix-pwa` v2.x.x, check [here](https://remix-pwa-docs.vercel.app)*

*To view the old docs for `remix-pwa` v1.1.10 and below, check [here]("./archive/README.md")*

## Contributing

Thank you for your interest in contributing 🙂. Check out the [contributing guide](https://remix-pwa.run/docs/contribute) to ensure you follow the right steps in contributing to `remix-pwa`.

> You can also help out with the docs too which is definitely a great way to contribute to the project and also help with it's completion

## Support

If you want to get help on an issue or have a question, you could either [open an issue](https://github.com/ShafSpecs/remix-pwa/issues/new/choose) or you could ask your questions in the [Official Remix's Discord Server](https://discord.gg/TTVwU2wZca) where there are a lot of helpful people to help you out.

Check out the [docs](https://remix-pwa.run/docs/community) for more info on community support.

## FAQ

Check out the [FAQ](https://remix-pwa.run/docs/faq) section of the docs for answers to frequently asked questions.

## Ecosystem

Check out https://github.com/remix-pwa/monorepo for the full Remix PWA v3.0 source code.

## Authors

- Abdur-Rahman (aka [@ShafSpecs](https://github.com/ShafSpecs))

- Juan Pablo Garcia Ripa ([Sarabadu](https://github.com/Sarabadu))

- Luciano Fantone ([lfantone](https://github.com/lfantone))

- Afzal Ansari ([dev-afzalansari](https://github.com/dev-afzalansari))

- Douglas Muhone ([theeomm](https://github.com/theeomm))

- Mokhtar ([mokhtar](https://github.com/m5r))

- Tom ([pumpitbetter](https://github.com/pumpitbetter))

- Brock Donahue ([Brocktho](https://github.com/Brocktho/))

- Special thanks to [jacob-ebey](https://github.com/jacob-ebey) for his contribution and help with the creation of `remix-pwa`!

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.
