#!/usr/bin/env node
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const colorette = require("colorette");
const { prompt: questionnaire } = require("enquirer");
const chalk = require("chalk");
const arg = require("arg");
const prependFile = require("prepend-file");

import type { PackageManager, Language, CacheStrategy, Option } from "./types";

let publicDir: string; // location of the `public` folder in the Remix app
let appDir: string; // location of the `app` folder in the Remix app
let packageManager: PackageManager = null; // package manager user is utilising ('npm', 'yarn', 'pnpm')
let v2_routeConvention: boolean = false; // if the user is using the v2 route convention

function integrateIcons(projectDir: string) {
  if (!fs.existsSync(projectDir + "/public/icons")) {
    fs.mkdirSync(projectDir + "/public/icons", { recursive: true });
  }

  fs.readdirSync(`${publicDir}/icons`).map((file: string) => {
    const fileContent = fs.readFileSync(publicDir + "/icons/" + file);
    fs.writeFileSync(projectDir + `/public/icons/${file}`, fileContent);
  });
}

function integrateManifest(projectDir: string, lang: Language, dir: string) {
  if (v2_routeConvention) {
    const fileContent = fs.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`).toString();

    fs.existsSync(projectDir + `/${dir}/routes/resources.manifest[.]webmanifest.` + lang)
      ? null
      : fs.writeFileSync(projectDir + `/${dir}/routes/resources.manifest[.]webmanifest.${lang}`, fileContent);

    return;
  }

  if (!fs.existsSync(projectDir + `/${dir}/routes/resources`)) {
    fs.mkdirSync(projectDir + `/${dir}/routes/resources`, { recursive: true });
  }

  const fileContent = fs.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`).toString();

  fs.existsSync(projectDir + `/${dir}/routes/resources/manifest[.]webmanifest.` + lang)
    ? null
    : fs.writeFileSync(projectDir + `/${dir}/routes/resources/manifest[.]webmanifest.${lang}`, fileContent);
}

function Run(projectDir: string, lang: Language, dir: string, cache: string, features: string[], workbox: boolean) {
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

  // Create and write pwa-utils client file
  if (features.includes("PWA Client Utilities")) {
    !fs.existsSync(projectDir + `/${dir}/utils/client`) &&
      fs.mkdirSync(projectDir + `/${dir}/utils/client`, { recursive: true });

    const ClientUtils = fs.readFileSync(appDir + "/utils/client/pwa-utils.client." + lang).toString();
    fs.writeFileSync(projectDir + `/${dir}/utils/client/pwa-utils.client.` + lang, ClientUtils);
  }

  try {
    if (features.includes("Service Workers")) {
      if (!fs.existsSync(projectDir + `/${dir}/entry.client.${lang}x`)) {
        execSync(`npx remix reveal`, {
          cwd: process.cwd(),
          stdio: "inherit",
        });
      }

      (async () =>
        await prependFile(
          projectDir + `/${dir}/entry.client.${lang}x`,
          "import { loadServiceWorker } from '@remix-pwa/sw';\n",
        ))();

      fs.appendFileSync(projectDir + `/${dir}/entry.client.${lang}x`, "\nloadServiceWorker();\n");

      let workerDir: string = "";

      fs.readdirSync(appDir).map((worker: string) => {
        if (!worker.includes(lang)) {
          return false;
        } else if (worker.includes("entry.worker") && cache == "jit" && !workbox) {
          workerDir = path.resolve(projectDir, `${dir}/${worker}`);
          const fileContent = fs.readFileSync(`${appDir}/${worker}`).toString();
          fs.existsSync(workerDir) && workerDir.includes(fileContent)
            ? null
            : fs.writeFileSync(workerDir, fileContent.toString());
        } else if (worker.includes("precache.worker") && cache == "pre" && !workbox) {
          workerDir = path.resolve(projectDir, `${dir}/entry.worker.${lang}`);
          const fileContent = fs.readFileSync(`${appDir}/${worker}`).toString();
          fs.existsSync(workerDir) && workerDir.includes(fileContent)
            ? null
            : fs.writeFileSync(workerDir, fileContent.toString());
        } else if (worker.includes("entry.workbox") && workbox) {
          workerDir = path.resolve(projectDir, `${dir}/entry.workbox.${lang}`);
          const fileContent = fs.readFileSync(`${appDir}/${worker}`).toString();
          fs.existsSync(workerDir) && workerDir.includes(fileContent)
            ? null
            : fs.writeFileSync(workerDir, fileContent.toString());
        } else if (worker.includes("precache.workbox") && workbox) {
          workerDir = path.resolve(projectDir, `${dir}/entry.workbox.${lang}`);
          const fileContent = fs.readFileSync(`${appDir}/${worker}`).toString();
          fs.existsSync(workerDir) && workerDir.includes(fileContent)
            ? null
            : fs.writeFileSync(workerDir, fileContent.toString());
        }
      });

      if (features.includes("Push Notifications")) {
        const fileContent = `\n/******** Push Event ********/\nclass PushHandler extends Push {
  async handlePush(event: PushEvent): Promise<void> {}

  async handleNotificationClick(event: NotificationEvent): Promise<void> {}

  async handleNotificationClose(event: NotificationEvent): Promise<void> {}

  async handleError(error: ErrorEvent): Promise<void> {}
}

const pushHandler = new PushHandler();

self.addEventListener("push", (event: PushEvent) => {
  pushHandler.handlePush(event);
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  pushHandler.handleNotificationClick(event);
});

self.addEventListener("notificationclose", (event: NotificationEvent) => {
  pushHandler.handleNotificationClose(event);
});

self.addEventListener("error", (error: ErrorEvent) => {
  pushHandler.handleError(error);
});\n`;
        fs.existsSync(workerDir) && workerDir.includes(fileContent)
          ? null
          : fs.appendFileSync(workerDir, fileContent.toString());
      }
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

  Run(projectDir, lang, dir, cache, features, questions.workbox);

  await new Promise((res) => setTimeout(res, 750));

  console.log(
    colorette.green("PWA Service workers successfully integrated into Remix! Check out the docs for additional info."),
  );
  console.log();
  console.log(colorette.blue("Running postinstall scripts...."));

  const saveFile = fs.writeFileSync;

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

  json.dependencies["npm-run-all"] = "^4.1.5";
  json.dependencies["cross-env"] = "^7.0.3";
  json.dependencies["dotenv"] = "^16.0.3";
  questions.feat.includes("Push Notifications") ? (json.dependencies["web-push"] = "^3.6.1") : null;
  questions.feat.includes("Push Notifications") ? (json.dependencies["@remix-pwa/sw"] = "*") : null;
  questions.feat.includes("Service Workers") || questions.feat.includes("Push Notifications")
    ? (json.dependencies["@remix-pwa/push"] = "*")
    : null;
  questions.workbox ? (json.dependencies["workbox-background-sync"] = "^6.5.4") : null;
  questions.workbox ? (json.dependencies["workbox-routing"] = "^6.5.4") : null;
  questions.workbox ? (json.dependencies["workbox-strategies"] = "^6.5.4") : null;

  json.scripts["build"] = "run-s build:*";
  json.scripts["build:remix"] = "cross-env NODE_ENV=production remix build";

  json.scripts["build:worker"] = `esbuild ./app/entry.${
    questions.workbox ? "workbox" : "worker"
  }.${lang} --outfile=./public/entry.${
    questions.workbox ? "workbox" : "worker"
  }.js --minify --bundle --platform=node --format=esm --define:process.env.NODE_ENV='\"production\"'`;

  json.scripts["dev"] = "run-p dev:*";
  json.scripts["dev:remix"] = "cross-env NODE_ENV=development remix dev";

  json.scripts["dev:worker"] = `esbuild ./app/entry.${
    questions.workbox ? "workbox" : "worker"
  }.${lang} --outfile=./public/entry.${
    questions.workbox ? "workbox" : "worker"
  }.js --bundle --platform=node --format=esm --define:process.env.NODE_ENV='\"development\"' --watch`;

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
${colorette.bold(
  colorette.magenta(`______               _       ______ _    _  ___  
| ___ \\             (_)      | ___ \\ |  | |/ _ \\ 
| |_/ /___ _ __ ___  ___  __ | |_/ / |  | / /_\\ \\
|    // _ \\ '_ \` _ \\| \\ \\/ / |  __/| |/\\| |  _  |
| |\\ \\  __/ | | | | | |>  <  | |   \\  /\\  / | | |
\\_| \\_\\___|_| |_| |_|_/_/\\_\\ \\_|    \\/  \\/\\_| |_/
`),
)}

Usage:  npx remix-pwa@latest [OPTIONS]

A stand-alone package for integrating PWA solutions into Remix application.
  
${colorette.underline(colorette.whiteBright("Options:"))}
--typescript, --ts              Create project with typescript template
--no-typescript, --no-ts, --js  Create project with javascript template
--workbox                       Integrate workbox into your project
--no-workbox                    Skip integrating workbox into your project  
--install                       Install dependencies after creating the project
--no-install                    Skip the installation process
--package-manager, --pm         Preferred package manager if your project is not using any
--cache                         Preferred \`Caching Strategy\` for the service worker. Either \`jit\` or \`pre\`
--features, --feat              \`Remix-Pwa\` features you want to include:
                                - 'sw' for Service Workers
                                - 'manifest' for Web Manifest
                                - 'push' for Push Notifications
                                - 'utils' for PWA Client Utilities
                                - 'icons' for Development Icons
--dir                           The location of your Remix \`app\` directory
--help, -h                      Print this help message and exit
--version, -v                   Print the CLI version and exit
--docs                          Print the link to the remix-pwa docs and exit`;

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
    "--workbox": Boolean,
    "--no-workbox": Boolean,
    "--install": Boolean,
    "--no-install": Boolean,
    "--docs": Boolean,
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
    "--js": "--no-typescript",
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

  // If docs option is passed log docs link and return
  if (args["--docs"]) {
    console.log("https://remix-pwa-docs.vercel.app");
    return;
  }

  const remixConfig = require(path.join(process.cwd(), "remix.config.js")); // remix.config.js file

  if (remixConfig.future && remixConfig.future.v2_routeConvention == true) {
    v2_routeConvention = true;
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

  const lang: Option<string> =
    (args["--typescript"] && "TypeScript") || (args["--no-typescript"] && "JavaScript") || null;

  const cache: Option<string> =
    (args["--cache"] === "pre" && "Precaching") || (args["--cache"] === "jit" && "Just-In-Time Caching") || null;

  const dir: Option<string> = (typeof args["--dir"] === "string" && args["--dir"]) || null;
  const question: Option<boolean> = args["--install"] || (args["--no-install"] ? false : null);
  const pm: Option<string> = (typeof args["--package-manager"] === "string" && args["--package-manager"]) || null;
  const workbox: Option<boolean> = (args["--workbox"] && true) || (args["--no-workbox"] ? false : null);

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
    /*
      Passing skip option to multiselect throws an error below is the workaround
      until this get resolved https://github.com/enquirer/enquirer/issues/339
    */
    ...(feat === null
      ? [
          {
            name: "feat",
            type: "multiselect",
            // @ts-ignore
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
      name: "cache",
      // @ts-ignore
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
      // @ts-ignore
      skip: cache !== null || (feat && !feat.includes("Service Workers")),
    },
    {
      name: "workbox",
      // @ts-ignore
      type: "confirm",
      message: "Do you want to use Workbox?",
      initial: false,
      // @ts-ignore
      skip: workbox !== null || (feat && !feat.includes("Service Workers")),
    },
    {
      name: "dir",
      // @ts-ignore
      type: "input",
      message: "What is the location of your Remix app?",
      initial: "app",
      // @ts-ignore
      skip: dir !== null,
    },
    {
      // @ts-ignore
      type: "confirm",
      name: "question",
      message: `Do you want to immediately ${
        packageManager ? `run "${packageManager} install"?` : "install dependencies?"
      }`,
      initial: true,
      // @ts-ignore
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
    ...(feat ? { feat } : {}),
    ...(cache ? { cache } : {}),
    ...(workbox ? { workbox } : {}),
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
      // @ts-ignore
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
  // @ts-ignore
  packageManager = packageManager || pm || forPackageManager?.packageManager || null;

  await Setup(questions).catch((err) => console.error(err));
}

cli();
