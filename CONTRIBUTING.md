# Contributing to Remix PWA

Thank you for your interest in contributing 😊😝!

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code and proposing changes
- Submitting a fix
- Proposing new features
- More test cases (we love tests 😍)

## 💻 Setup

Before you can contribute to `remix-pwa` codebase, you will need to fork the repo.

1. **Fork the repo**: To fork the repo, simply click the <kbd>Fork</kbd> button on the top right of [`monorepo`](https://github.com/remix-pwa/monorepo) page. If you want to edit the docs, you can fork the [docs repo](https:/github.com/ShafSpecs/remix-pwa-docs) instead.

2. **Clone your fork locally**: After that, clone your forked repo using the command:

```sh
# in a terminal, cd to parent directory where you want your clone to be, then
git clone https://github.com/<your_github_username>/monorepo.git

cd remix-pwa
```

1. **Install dependencies**: `remix-pwa` uses npm. To download the dependencies, build packages and run tests, run the following command:

```sh
npm run postclone
```

We have everything wrapped up in a single command for you.

Pull Requests should be made to different branches based on their context. When making a PR, make sure to create it to the latest working branch that isn't `main`
or `dev`.

We also use [commitlint](https://commitlint.js.org/), so ensure that your commit messages are compliant.

> *"We request to avoid pushing to those two as we follow a semantic release process, changes merged to `main` are published immediately and `dev` are bumped automatically."*

## 🐛 Found a Bug?

If you think you found a bug that you can fix, clone the repo, make your changes and then submit a PR to the latest working branch. If you can't fix it, then create an issue and we'll look into it.

## 🛠 Suggesting a New Feature or Improving one?

If you feel you have a great idea for `remix-pwa` or you can improve an existing one, don't hesitate to work on it! No matter how small, we love it! Fork the repo and then, when you want to merge, create a PR to the `dev` branch. We would review it and if it passes all tests and scrutiny would be merged directly to `main`.

## 📬 Neglected Issue?

If you happen to come across an issue that you think is important but neglected, you can fork the repo and after you're done, if it involves changes to `remix-pwa` itself including the CLI and compiler, create a PR to the `dev` branch.

## 😄 First PR?

Looking to make your first PR to Open Source? Then you can do so by simply correcting stuffs like typo in the README or even here in the contribution guide, it could also be explaining a particular topic or section more (in the README or here). Any PR of this type should be submitted to the a non-`main` or `dev` branch.

## 📃 License

By contributing, you agree that your contributions will be licensed under its MIT License.
