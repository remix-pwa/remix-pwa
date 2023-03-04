#!/usr/bin/env node

import * as fse from "fs-extra";
const path = require("path");
const { execSync } = require("child_process");
const colorette = require("colorette");
const prettier = require("prettier");
const { prompt: questionnaire } = require("enquirer");
const chalk = require("chalk");
const arg = require("arg");
import { PackageManager, Language, CacheStrategy } from "./types";

let publicDir: string; // location of the `public` folder in the Remix app
let appDir: string; // location of the `app` folder in the Remix app
let packageManager: PackageManager = null; // package manager user is utilising ('npm', 'yarn', 'pnpm')

function integrateIcons(projectDir: string) {
  if (!fse.existsSync(projectDir + "/public/icons")) {
    fse.mkdirSync(projectDir + "/public/icons", { recursive: true });
  }

  fse.readdirSync(`${publicDir}/icons`).map((file: string) => {
    const fileContent = fse.readFileSync(publicDir + "/icons/" + file);
    fse.writeFileSync(projectDir + `/public/icons/${file}`, fileContent);
  });
}

function integrateManifest(projectDir: string, lang: Language, dir: string) {
  if (!fse.existsSync(projectDir + `/${dir}/routes/resources`)) {
    fse.mkdirSync(projectDir + `/${dir}/routes/resources`, { recursive: true });
  }

  const fileContent = fse.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`).toString();

  fse.existsSync(projectDir + `/${dir}/routes/resources/manifest[.]webmanifest.` + lang)
    ? null
    : fse.writeFileSync(projectDir + `/${dir}/routes/resources/manifest[.]webmanifest.${lang}`, fileContent);
}

function integratePushNotifications(projectDir: string, lang: Language, dir: string) {
  // `/resources/subscribe`
  if (!fse.existsSync(projectDir + `/${dir}/routes/resources`)) {
    fse.mkdirSync(projectDir + `/${dir}/routes/resources`, { recursive: true });
  }

  const subscribeContent = fse.readFileSync(appDir + `/routes/resources/subscribe.${lang}`).toString();

  fse.existsSync(projectDir + `/${dir}/routes/resources/subscribe.` + lang)
    ? null
    : fse.writeFileSync(projectDir + `/${dir}/routes/resources/subscribe.${lang}`, subscribeContent);

  // `/utils/server/pwa-utils.server.ts`
  if (!fse.existsSync(projectDir + `/${dir}/utils/server`)) {
    fse.mkdirSync(projectDir + `/${dir}/utils/server`, { recursive: true });
  }

  const ServerUtils = fse.readFileSync(appDir + "/utils/server/pwa-utils.server." + lang).toString();
  fse.writeFileSync(projectDir + `/${dir}/utils/server/pwa-utils.server.` + lang, ServerUtils);
}

function Run(projectDir: string, lang: Language, dir: string, cache: string, features: string[]) {
  publicDir = path.resolve(__dirname, "..", "templates", lang, "public");
  appDir = path.resolve(__dirname, "..", "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  if (features.includes("Development Icons")) {
    integrateIcons(projectDir);
  }

  // Check if manifest file exist and if not, create `manifest.json` file && service worker entry point
  if (features.includes("Web Manifest")) {
    integrateManifest(projectDir, lang, dir);
  }

  // Register worker in `entry.client.tsx`
  const remoteClientContent: string = fse.readFileSync(projectDir + `/${dir}/entry.client.` + lang + "x").toString();
  const ClientContent = fse.readFileSync(appDir + "/entry.client." + lang).toString();

  if (features.includes("Service Workers")) {
    remoteClientContent.includes(ClientContent)
      ? null
      : fse.appendFileSync(projectDir + `/${dir}/entry.client.` + lang + "x", `\n${ClientContent}`);
  }

  if (features.includes("Push Notifications")) {
    integratePushNotifications(projectDir, lang, dir);

    const PushContent = fse.readFileSync(appDir + "/push.entry.client." + lang).toString();
    remoteClientContent.includes(PushContent)
      ? null
      : fse.appendFileSync(projectDir + `/${dir}/entry.client.` + lang + "x", `\n${PushContent}`);
  }

  // Acknowledge SW in the browser
  const RootDir = projectDir + `/${dir}/root.` + lang + "x";

  let RootDirContent: string = fse.readFileSync(RootDir).toString();
  const localeRootDir = fse.readFileSync(appDir + "/root." + lang).toString();

  const RootDirNull: string = RootDirContent.replace(/\s\s+/g, " ");
  const rootRegex: RegExp = /return \( <html/g;
  const index = RootDirNull.search(rootRegex);
  const parser = lang === "ts" ? "-ts" : "";

  const NewContent = RootDirContent.includes(localeRootDir)
    ? RootDirContent
    : RootDirNull.replace(/\s\s+/g, " ").slice(0, index - 1) +
      "\n" +
      localeRootDir +
      "\n" +
      RootDirNull.replace(/\s\s+/g, " ").slice(index);

  const formatted: string = prettier.format(NewContent, { parser: `babel${parser}` });
  const cleanRegex: RegExp = /{" "}/g;
  const newFormatted: string = formatted.replace(cleanRegex, " ");

  const rootArray: string[] = newFormatted.split("\n");

  const lastIndexOf = (arr: any[], item: any, start: number = arr.length - 1) => {
    for (let i = start; i >= 0; i--) {
      if (arr[i].includes(item)) {
        return i;
      }
    }
    return -1;
  };

  let totalImportCount = lastIndexOf(rootArray, "} from", 40);

  rootArray.splice(totalImportCount + 1, 0, "let isMount = true;");
  rootArray.unshift("import { useLocation, useMatches } from '@remix-run/react';");
  rootArray.unshift("import React from 'react';");

  const extraFormatted = rootArray.join("\n");
  const newText = extraFormatted.replace(cleanRegex, " ");

  fse.writeFileSync(RootDir, newText);

  // Create and write pwa-utils client file
  if (features.includes("PWA Client Utilities")) {
    !fse.existsSync(projectDir + `/${dir}/utils/client`) &&
      fse.mkdirSync(projectDir + `/${dir}/utils/client`, { recursive: true });

    const ClientUtils = fse.readFileSync(appDir + "/utils/client/pwa-utils.client." + lang).toString();
    fse.writeFileSync(projectDir + `/${dir}/utils/client/pwa-utils.client.` + lang, ClientUtils);
  }

  try {
    if (features.includes("Service Workers")) {
      fse.readdirSync(appDir).map((worker: string) => {
        if (!worker.includes(lang)) {
          return false;
        } else if (worker.includes("entry.worker") && cache == "jit") {
          const workerDir = path.resolve(projectDir, `${dir}/${worker}`);
          const fileContent = fse.readFileSync(`${appDir}/${worker}`);
          fse.existsSync(workerDir) && workerDir.includes(fileContent)
            ? null
            : fse.writeFileSync(workerDir, fileContent.toString());
        } else if (worker.includes("precache.worker") && cache == "pre") {
          const workerDir = path.resolve(projectDir, `${dir}/entry.worker.${lang}`);
          const fileContent = fse.readFileSync(`${appDir}/${worker}`);
          fse.existsSync(workerDir) && workerDir.includes(fileContent)
            ? null
            : fse.writeFileSync(workerDir, fileContent.toString());
        }
      });
    }
  } catch (error) {
    console.error(colorette.red("Error ocurred creating files. Could not create Service Worker files."));
  }
}

async function Setup(questions: any) {
  const projectDir = process.cwd();

  let lang: Language;
  questions.lang === "TypeScript" ? (lang = "ts") : (lang = "js");

  const dir = questions.dir;
  let cache: CacheStrategy;
  questions.cache === "Precaching" ? (cache = "pre") : (cache = "jit");
  const features = questions.feat;

  Run(projectDir, lang, dir, cache, features);

  await new Promise((res) => setTimeout(res, 500));

  console.log(
    colorette.green("PWA Service workers successfully integrated into Remix! Check out the docs for additional info."),
  );
  console.log();
  console.log(colorette.blue("Running postinstall scripts...."));

  const saveFile = fse.writeFileSync;

  //@ts-ignore
  const pkgJsonPath = path.resolve(process.cwd(), "package.json");
  const json = require(pkgJsonPath);

  if (!json.hasOwnProperty("dependencies")) {
    json.dependencies = {};
  }

  if (!json.hasOwnProperty("devDependencies")) {
    json.devDependencies = {};
  }

  if (!json.hasOwnProperty("scripts")) {
    json.scripts = {};
  }

  json.dependencies["node-persist"] = "^3.1.0";
  json.dependencies["web-push"] = "^3.4.5";
  json.dependencies["npm-run-all"] = "^4.1.5";
  json.dependencies["cross-env"] = "^7.0.3";
  json.dependencies["dotenv"] = "^16.0.3";

  json.devDependencies["@types/node-persist"] = "^3.1.2";

  json.scripts["build"] = "run-s build:*";
  json.scripts["build:remix"] = "cross-env NODE_ENV=production remix build";
  json.scripts[
    "build:worker"
  ] = `esbuild ./app/entry.worker.${lang} --outfile=./public/entry.worker.js --minify --bundle --format=esm --define:process.env.NODE_ENV='\"production\"'`;
  json.scripts["dev"] = "run-p dev:*";
  json.scripts["dev:remix"] = "cross-env NODE_ENV=development remix dev";
  json.scripts[
    "dev:worker"
  ] = `esbuild ./app/entry.worker.${lang} --outfile=./public/entry.worker.js --bundle --format=esm --define:process.env.NODE_ENV='\"development\"' --watch`;

  saveFile(pkgJsonPath, JSON.stringify(json, null, 2));
  console.log(colorette.green("Successfully ran postinstall scripts!"));

  await new Promise((res) => setTimeout(res, 1250));

  if (questions.question) {
    console.log(colorette.blueBright(`Running ${packageManager} install....`));
    execSync(`${packageManager} install --loglevel silent`, {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    console.log(colorette.green(`Successfully ran ${packageManager} install!`));
  } else {
    console.log(colorette.red(`Skipping ${packageManager ? `${packageManager} install....` : "installation...."}`));
    console.log(
      colorette.red(
        `Don't forget to ${packageManager ? `run ${packageManager} install!` : "install your dependencies"}`,
      ),
    );
  }
}

const helpText = `
${colorette.bold(colorette.magenta("REMIX-PWA"))}

  Usage:  npx remix-pwa@latest [OPTIONS]

  A stand-alone package for integrating PWA solutions into Remix application.
  
  ${colorette.underline(colorette.whiteBright("Options:"))}
  --typescript, --ts        Create project with typescript template
  --no-typescript, --no-ts  Create project with javascript template
  --install                 Install dependencies after creating the project
  --no-install              Skip the installation process
  --package-manager, --pm   Preferred package manager if your project is not using any
  --cache                   Preferred \`Caching Strategy\` for the service worker. Either \`jit\` or \`pre\`
  --features, --feat        \`Remix-Pwa\` features you want to include
                            ${colorette.underline(colorette.whiteBright("Example:"))}${colorette.whiteBright(
  ` 'sw, manifest, utils'`,
)}
                            - 'sw' for Service Workers
                            - 'manifest' for Web Manifest
                            - 'push' for Push Notifications
                            - 'utils' for PWA Client Utilities
                            - 'icons' for Development Icons
  --dir                     The location of your Remix \`app\` directory
  --help, -h                Print this help message and exit
  --version, -v             Print the CLI version and exit`;

const getCliVersion = () => {
  const version = require("../package.json").version;
  return version;
};

const featLookup = {
  sw: "Service Workers",
  manifest: "Web Manifest",
  push: "Push Notifications",
  utils: "PWA Client Utilities",
  icons: "Development Icons",
};

async function cli() {
  const args = arg({
    "--help": Boolean,
    "--version": Boolean,
    "--typescript": Boolean,
    "--no-typescript": Boolean,
    "--install": Boolean,
    "--no-install": Boolean,
    "--cache": String,
    "--features": String,
    "--dir": String,
    "--package-manager": String,
    // Aliases for aboves
    "-h": "--help",
    "-v": "--version",
    "--ts": "--typescript",
    "--feat": "--features",
    "--no-ts": "--no-typescript",
    "--pm": "--package-manager",
  });

  // If help option is passed log help and return
  if (args["--help"]) {
    console.log(helpText);
    return;
  }

  // If version option is passed log cli verion and return
  if (args["--version"]) {
    console.log(getCliVersion());
    return;
  }

  console.log(colorette.bold(colorette.magenta("Welcome to Remix PWA!")));
  console.log();

  const projectDir = process.cwd();

  // Look if any lock file exists so we can identify the preferred package manager.
  packageManager = await (async () => {
    const [isNpm, isYarn, isPnpm] = await Promise.all([
      fse.pathExists(path.resolve(projectDir, "package-lock.json")),
      fse.pathExists(path.resolve(projectDir, "yarn.lock")),
      fse.pathExists(path.resolve(projectDir, "pnpm-lock.yaml")),
    ]);

    if (isNpm) {
      return "npm";
    } else if (isYarn) {
      return "yarn";
    } else if (isPnpm) {
      return "pnpm";
    }

    return null;
  })();

  const lang = (args["--typescript"] && "TypeScript") || (args["--no-typescript"] && "JavaScript") || null;
  const cache =
    (args["--cache"] === "pre" && "Precaching") || (args["--cache"] === "jit" && "Just-In-Time Caching") || null;
  const dir = (typeof args["--dir"] === "string" && args["--dir"]) || null;
  const question = args["--install"] || (args["--no-install"] ? false : null);
  const pm = (typeof args["--package-manager"] === "string" && args["--package-manager"]) || null;

  const feat =
    (args["--features"] &&
      args["--features"]
        .replace(/,\s/g, ",")
        .split(",")
        // @ts-ignore
        .filter((elem: string) => typeof featLookup[elem] !== "undefined")
        // @ts-ignore
        .map((feat: string) => featLookup[feat])) ||
    null;

  await new Promise((res) => setTimeout(res, 1000));

  const promptAnswers = await questionnaire([
    {
      name: "lang",
      type: "select",
      message: "Is this a TypeScript or JavaScript project? Pick the opposite for chaos!",
      choices: [
        {
          name: "TypeScript",
          value: "ts",
        },
        {
          name: "JavaScript",
          value: "js",
        },
      ],
      skip: lang !== null,
    },
    {
      name: "cache",
      type: "select",
      message: "What caching strategy do you want to use? Check out the docs for more info.",
      choices: [
        {
          name: "Precaching",
          value: "pre",
        },
        {
          name: "Just-In-Time Caching",
          value: "jit",
        },
      ],
      skip: cache !== null,
    },
    /*
      Passing skip option to multiselect throws an error below is the workaround
      until this get resolved https://github.com/enquirer/enquirer/issues/339
    */
    ...(feat === null
      ? [
          {
            name: "feat",
            type: "multiselect",
            hint: "(Use <space> to select, <return> to submit)",
            message: "What features of remix-pwa do you need? Don't be afraid to pick all!",
            //@ts-ignore
            indicator(state: any, choice: any) {
              return choice.enabled ? " " + chalk.green("✔") : " " + chalk.gray("o");
            },
            choices: [
              {
                name: "Service Workers",
                value: "sw",
              },
              {
                name: "Web Manifest",
                value: "manifest",
              },
              {
                name: "Push Notifications",
                value: "push",
              },
              {
                name: "PWA Client Utilities",
                value: "utils",
              },
              {
                name: "Development Icons",
                value: "icons",
              },
            ],
          },
        ]
      : []),
    {
      name: "dir",
      type: "input",
      message: "What is the location of your Remix app?",
      initial: "app",
      skip: dir !== null,
    },
    {
      type: "confirm",
      name: "question",
      message: `Do you want to immediately ${
        packageManager ? `run "${packageManager} install"?` : "install dependencies?"
      }`,
      initial: true,
      skip: question !== null,
    },
  ]);

  /*
    Currently there is a bug in `enquirer` https://github.com/enquirer/enquirer/issues/340
    where if a question is skipped instead of returning falsy value it returns
    default or first option's value.
    Following is the workaround for now.
  */
  // 1) We create an Ojbect from initial cli options with truthy or appropriate values only
  let initialChoices = {
    ...(lang ? { lang } : {}),
    ...(cache ? { cache } : {}),
    ...(feat ? { feat } : {}),
    ...(dir ? { dir } : {}),
    ...(question !== null ? { question } : {}),
  };

  // 2) We merge answers from the prompt with initial choices made from cli
  //    So the skipped question's answers get overriden by the initial choices.
  const questions = { ...promptAnswers, ...initialChoices };

  // We will prompt for package manager only if there is no detected package manager
  // and the user wants to install dependencies after creating the project.
  const forPackageManager = await questionnaire([
    {
      type: "input",
      name: "packageManager",
      message: "Which package manager you want to use?",
      skip: () => {
        if (packageManager) return true;

        if (!packageManager && questions.question === false) {
          return true;
        } else if (!packageManager && questions.question === true) {
          if (pm) {
            return true;
          } else {
            return false;
          }
        }
      },
    },
  ]);

  // Our final packageManager. Note: it still can be null.
  packageManager = packageManager || pm || forPackageManager?.packageManager || null;

  await Setup(questions).catch((err) => console.error(err));
}

cli();
