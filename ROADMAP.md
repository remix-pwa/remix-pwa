# 🗺 Remix PWA Roadmap

This file documents the roadmap and changes for Remix PWA. It includes proposed features, changes, ideas and features that are already in the  works.

### Notes about the Roadmap

1. Not every single idea might be fitted in here, we would try our best to list all of them but it is highly possible they might not all get listed.
2. Ideas and proposals presented in the roadmap are not only from the maintainers but also from the users. If you want to propose an idea, submit an issue and if it gets approved, we would add it and give attribution.
3. Features that have been implemented would be erased from here. Those would be listed in a changelog file.
4. You can decide to work on any feature/fixes in the roadmap if you think you know how to tackle & implement it.

### How to use the Roadmap

- The section **In the Works** contains proposals that are currently being worked on.
- The section **Draft** contains ideas that are currently being reviewed and possibly implemented.
- The section **Proposals** contains ideas that are recently submitted and are awaiting full review from maintainers.
- Sections marked with a 😐 emoji are sections that are currently empty.

### Reason for the Roadmap

1. Allow users to keep track of `remix-pwa` progress and also it's plans for the future.
2. Allow for better PRs and better proposals due to a publicized roadmap that details what, where and how we plan to implement future changes. 
3. Reduce possible, duplicate issues and bug reports from users.
4. Creates a sharper sense of vision and progress for the community.
5. Allow users to become more involved and also attract users with varying knowledge and experience to become Open Source contributors.

## Goal

The goal of `remix-pwa` is to create a standalone PWA package that would be used in Remix applications and allow Remix, a full-stack framework, to have the ability to create unparalelled PWAs like any other browser framework out there without any hindrance or problems.

<h2> Features </h2>

### In the Works

- **Create a custom download utility**: Create a custom handler for downloading the PWA onto the user's device.
- **Improve mounting of Service Worker**: Minor (but major) tweaks to the mounting Service Worker code. 
- **Precaching**: Allow option for precaching entire modules and routes at once.

### Draft

- **Possible enhancement to customization proposal**: Improve the above point (In the works no. 4) by allowing a user to choose what PWA features he/she wants during CLI installation instead of downloading all PWA features.
- **API Analytics**: Add analytics tooling API to allow you to set up a personal, custom Analytic service for your site without losing client's data to companies
- **Background Sync**: Create a background sync API utility

### Proposals

- Create sample PWA apps under `example/` directory
- Migrate manifest files from `.json` to `.webmanifest` files.

## Bug Fixes & Improvements

### In the Works

- Create a stable standalone Push API package to make integrating API faster, easier and flexible across all browsers.

### Draft

#### 😐

### Proposals

#### 😐
