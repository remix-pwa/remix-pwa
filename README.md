<div align="center">

&NewLine;
<img src="./links/remix-pwa-logo.png" alt="logo" width="300" />
&NewLine;

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
- Safely handles uncached loader calls without affecting other sections of the site (i.e Throws user to nearest Error boundary without disrupting Service Workers)

Check out the new [documentation](https://remix-pwa-docs.vercel.app) for the full list of features and more!

**`remix-pwa` pre-release is here! Hold tight for a full list of feature overhaul 🚀!** 

## Table Of Content

- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Remix PWA Roadmap](#roadmap)
- [Contributing Doc](#contributing)
- [Support](#support)
- [FAQ](#faq)
- [Authors](#authors)
- [License](#license)  

## Getting Started

### Installation

To integrate PWA features into your Remix App with `remix-pwa`, run the following command to get started with PWA goodness:

```sh
npx remix-pwa@latest
```

> **To check out `remix-pwa` flags, run:**
> ```sh
> npx remix-pwa@latest -h
> ```
> *to view the commands* 

Refer to [the docs](https://remix-pwa-docs.vercel.app/pwa/installation#cli-usage) for a detailed explanation of the CLI installation process.

> If you want to install the stable version of `remix-pwa` (v1.1.10) without any of v2 features attached to it, run the following command:
> ```sh
> npx remix-pwa@1.1.10
> ```

### Upgrade Guide

To upgrade to the latest v2 pre-release version of `remix-pwa`, check out the [upgrade guide](https://remix-pwa-docs.vercel.app/sw/upgrade-guide) in the docs.

> Still a Work-In-Progress but stable enough.

## Setting up Remix for PWA

Check out the [quickstart guide](https://remix-pwa-docs.vercel.app/pwa/quickstart) in the docs for a detailed walkthrough on how to set up your Remix app for PWA.

If you want to lay your hands on demo icons and favicons for your PWA, `remix-pwa` got you covered with sample icons. Simply delete the `favicon.ico`
in your `public` folder and add the [following links](https://github.com/ShafSpecs/remix-pwa/blob/main/links/pwa-links.ts#L9) to your `root` file, above the `<Links />` tag.

# API Documentation

The API documentation for `remix-pwa` is now available [here](https://remix-pwa-docs.vercel.app)

*To view the old docs for `remix-pwa` v1.1.10 and below, check [here]("./archive/README.md")*

## Roadmap

Want to see proposed features and bug fixes? Or do you want to propose an idea/bug fix for `remix-pwa` and want to view the current roadmap? Check out `remix-pwa` [roadmap](https://remix-pwa-docs.vercel.app/pwa/roadmap) and see what lies in wait for us!

## Contributing

Thank you for your interest in contributing 🙂. Check out the [contributing guide](https://remix-pwa-docs.vercel.app/pwa/contribute) to ensure you follow the right steps in contributing to `remix-pwa`.

## Support 

If you want to get help on an issue or have a question, you could either [open an issue](https://github.com/ShafSpecs/remix-pwa/issues/new/choose) or you could ask your questions in the [Official Remix's Discord Server](https://discord.gg/TTVwU2wZca) where there are a lot of helpful people to help you out.

Check out the [docs](https://remix-pwa-docs.vercel.app/pwa/community) for a more detailed walkthrough.

## FAQ

Check out the [FAQ](https://remix-pwa-docs.vercel.app/pwa/faq) section of the docs for answers to frequently asked questions.

## Authors

- Abdur-Rahman (aka [@ShafSpecs](https://github.com/ShafSpecs))

- Afzal Ansari ([dev-afzalansari](https://github.com/dev-afzalansari))

- Douglas Muhone ([theeomm](https://github.com/theeomm))

- Mokhtar ([mokhtar](https://github.com/m5r))

- Tom ([pumpitbetter](https://github.com/pumpitbetter))

- Brock Donahue ([Brocktho](https://github.com/Brocktho/))

- Special thanks to [jacob-ebey](https://github.com/jacob-ebey) for his contribution and help with the creation of `remix-pwa`!

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.
