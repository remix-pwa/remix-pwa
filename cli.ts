#!/usr/bin/env node

const coreJs = require("core-js/proposals");
const fse = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const colorette = require("colorette");
const prettier = require("prettier");
const esformatter = require("esformatter");
const { Select, Confirm, prompt: questionnaire, Input } = require("enquirer");

async function Run(projectDir: string, lang: "ts" | "js", dir: string, cache: string, features: string[]) {
  const publicDir = path.resolve(__dirname, "..", "templates", lang, "public");
  const appDir = path.resolve(__dirname, "..", "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  if (features.includes("icons")) {
    !fse.existsSync(projectDir + "/public/icons") && fse.mkdirSync(projectDir + "/public/icons", { recursive: true });

    fse.readdirSync(`${publicDir}/icons`).map((file: string) => {
      const fileContent = fse.readFileSync(publicDir + "/icons/" + file);
      fse.writeFileSync(projectDir + `/public/icons/${file}`, fileContent);
    });
  }

  // Check if manifest file exist and if not, create `manifest.json` file && service worker entry point
  if (features.includes("manifest")) {
    !fse.existsSync(projectDir + `/${dir}/routes/resources`) &&
      fse.mkdirSync(projectDir + `/${dir}/routes/resources`, { recursive: true });

    const fileContent = fse.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`).toString();
    fse.existsSync(projectDir + `/${dir}/routes/resources/manifest[.]webmanifest.` + lang)
      ? null
      : fse.writeFileSync(projectDir + `/${dir}/routes/resources/manifest[.]webmanifest.${lang}`, fileContent);
  }

  // Create resource route for push notifications
  if (features.includes("push")) {
    !fse.existsSync(projectDir + `/${dir}/routes/resources`) &&
      fse.mkdirSync(projectDir + `/${dir}/routes/resources`, { recursive: true });

    const subscribeContent = fse.readFileSync(appDir + `/routes/resources/subscribe.${lang}`).toString();
    fse.existsSync(projectDir + `/${dir}/routes/resources/subscribe.` + lang)
      ? null
      : fse.writeFileSync(projectDir + `/${dir}/routes/resources/subscribe.${lang}`, subscribeContent);
  }

  // Register worker in `entry.client.tsx`
  const remoteClientContent: string = fse.readFileSync(projectDir + `/${dir}/entry.client.` + lang + "x").toString();
  const ClientContent = fse.readFileSync(appDir + "/entry.client." + lang).toString();
  const PushContent = fse.readFileSync(appDir + "/push.entry.client." + lang).toString();

  if (features.includes("sw")) {
    remoteClientContent.includes(ClientContent)
      ? null
      : fse.appendFileSync(projectDir + `/${dir}/entry.client.` + lang + "x", `\n${ClientContent}`);
  }

  if (features.includes("push")) {
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

  if (!RootDirContent.includes("React")) {
    RootDirContent = "import React from 'react';\n" + RootDirContent.slice(0, RootDirContent.length - 1);
  }

  if (!RootDirContent.includes("useLocation") && !RootDirContent.includes("useMatches")) {
    "import { useLocation, useMatches } from '@remix-run/react';\n" +
      RootDirContent.slice(0, RootDirContent.length - 1);
  }

  const rootArray: string[] = RootDirContent.split("\n");

  let totalImportCount = 0;

  for (let index = 0; index < rootArray.length; index++) {
    if (rootArray[index].includes("import")) {
      totalImportCount = index;
    }
  }

  rootArray.splice(totalImportCount + 1, 0, "let isMount = true;");
  rootArray.join("\n");

  const NewContent = RootDirContent.includes(localeRootDir)
    ? RootDirContent
    : RootDirNull.slice(0, index - 1) + "\n" + localeRootDir + "\n" + RootDirNull.slice(index);
  const formatted: string = prettier.format(NewContent, { parser: `babel${parser}` });
  const cleanRegex: RegExp = /{" "}/g;
  const newFormatted: string = formatted.replace(cleanRegex, " ");
  fse.writeFileSync(RootDir, newFormatted);

  /* End of `root` meddling */

  // Create and write pwa-utils client file
  if (features.includes("utils")) {
    !fse.existsSync(projectDir + `/${dir}/utils/client`) &&
      fse.mkdirSync(projectDir + `/${dir}/utils/client`, { recursive: true });

    const ClientUtils = fse.readFileSync(appDir + "/utils/client/pwa-utils.client." + lang).toString();
    fse.writeFileSync(projectDir + `/${dir}/utils/client/pwa-utils.client.` + lang, ClientUtils);
  }

  // Create and write pwa-utils server file
  if (features.includes("push")) {
    !fse.existsSync(projectDir + `/${dir}/utils/server`) &&
      fse.mkdirSync(projectDir + `/${dir}/utils/server`, { recursive: true });

    const ServerUtils = fse.readFileSync(appDir + "/utils/server/pwa-utils.server." + lang).toString();
    fse.writeFileSync(projectDir + `/${dir}/utils/server/pwa-utils.server.` + lang, ServerUtils);
  }

  try {
    if (features.includes("sw")) {
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

async function cli() {
  console.log(colorette.bold(colorette.magenta("Welcome to Remix PWA!")));
  console.log();

  await new Promise((res) => setTimeout(res, 1000));

  const projectDir = process.cwd();

  const questions = await questionnaire([
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
  },
  {
    name: "feat",
    type: "multiselect",
    hint: '(Use <space> to select, <return> to submit)',
    message: "What features of remix-pwa do you need? Don't be afraid to pick all!",
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
  {
    name: "dir",
    type: "input",
    message: "What is the location of your Remix app?",
    initial: "app",
  },
  {
    type: "confirm",
    name: "question",
    message: 'Do you want to immediately run "npm install"?',
    initial: true,
  },
  ]);

  async function Setup(questions: any) {
    let lang: "ts" | "js";
    questions.lang === "TypeScript" ? (lang = "ts") : (lang = "js");

    const dir = questions.dir;
    const cache = questions.cache;
    const features = questions.feat;

    await Promise.all([Run(projectDir, lang, dir, cache, features)]);
    console.log(
      colorette.green(
        "PWA Service workers successfully integrated into Remix! Check out the docs for additional info.",
      ),
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
    json.dependencies["dotenv"] = "^16.0.0";

    json.devDependencies["@types/node-persist"] = "^3.1.2";

    json.scripts["build"] = "npm-run-all -p build:*";
    json.scripts["build:remix"] = "cross-env NODE_ENV=production remix build";
    json.scripts[
      "build:worker"
    ] = `esbuild ./app/entry.worker.${lang} --outfile=./public/entry.worker.js --minify --bundle --format=esm --define:process.env.NODE_ENV='\"production\"'`;
    json.scripts["dev"] = "npm-run-all -p dev:*";
    json.scripts["dev:remix"] = "cross-env NODE_ENV=development remix dev";
    json.scripts[
      "dev:worker"
    ] = `esbuild ./app/entry.worker.${lang} --outfile=./public/entry.worker.js --bundle --format=esm --define:process.env.NODE_ENV='\"development\"' --watch`;

    saveFile(pkgJsonPath, JSON.stringify(json, null, 2));
    console.log(colorette.green("Successfully ran postinstall scripts!"));

    await new Promise((res) => setTimeout(res, 1250));

    if (questions.question) {
      console.log(colorette.blueBright("Running npm install...."));
      execSync("npm install --loglevel silent", {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      console.log(colorette.green("Successfully ran npm install!"));
    } else {
      console.log(colorette.red("Skipping npm install...."));
      console.log(colorette.red("Don't forget to run npm install!"));
    }
  }

  await Setup(questions).catch((err) => console.error(err));
}

cli();