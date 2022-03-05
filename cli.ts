#!/usr/bin/env node

const fse = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const colorette = require("colorette");
const prettier = require("prettier");
const esformatter = require("esformatter");
const { Select, Confirm, prompt: questionnaire } = require("enquirer");

async function Run(projectDir: string, lang: "ts" | "js") {
  !fse.existsSync(projectDir + "/app/routes/resources") &&
    fse.mkdirSync(projectDir + "/app/routes/resources", { recursive: true });

  !fse.existsSync(projectDir + "/public/icons") && fse.mkdirSync(projectDir + "/public/icons", { recursive: true });

  !fse.existsSync(projectDir + "/app/utils/server") &&
    fse.mkdirSync(projectDir + "/app/utils/server", { recursive: true });

  !fse.existsSync(projectDir + "/app/utils/client") &&
    fse.mkdirSync(projectDir + "/app/utils/client", { recursive: true });

  const publicDir = path.resolve(__dirname, "..", "templates", lang, "public");
  const appDir = path.resolve(__dirname, "..", "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  fse.readdirSync(`${publicDir}/icons`).map((file: string) => {
    const fileContent = fse.readFileSync(publicDir + "/icons/" + file);
    fse.writeFileSync(projectDir + `/public/icons/${file}`, fileContent);
  });

  // Check if manifest file exist and if not, create `manifest.json` file && service worker entry point
  const fileContent = fse.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`).toString();
  fse.existsSync(projectDir + "/app/routes/resources/manifest[.]json." + lang)
    ? null
    : fse.writeFileSync(projectDir + `/app/routes/resources/manifest[.]json.${lang}`, fileContent);

  // Create resource route for push notifications
  const subscribeContent = fse.readFileSync(appDir + `/routes/resources/subscribe.${lang}`).toString();
  fse.existsSync(projectDir + "/app/routes/resources/subscribe." + lang)
    ? null
    : fse.writeFileSync(projectDir + `/app/routes/resources/subscribe.${lang}`, subscribeContent);

  // Register worker in `entry.client.tsx`
  const remoteClientContent: string = fse.readFileSync(projectDir + "/app/entry.client." + lang + "x").toString();
  const ClientContent = fse.readFileSync(appDir + "/entry.client." + lang).toString();

  remoteClientContent.includes(ClientContent)
    ? null
    : fse.appendFileSync(projectDir + "/app/entry.client." + lang + "x", `\n${ClientContent}`);

  // Acknowledge SW in the browser
  const RootDir = projectDir + "/app/root." + lang + "x";

  const RootDirContent = fse.readFileSync(RootDir).toString();
  const localeRootDir = fse.readFileSync(appDir + "/root." + lang).toString();

  const RootDirNull: string = RootDirContent.replace(/\s\s+/g, " ");
  const rootRegex: RegExp = /return \( <html/g;
  const index = RootDirNull.search(rootRegex);
  const parser = lang === "ts" ? "-ts" : "";
  const NewContent = RootDirContent.includes(localeRootDir)
    ? RootDirContent
    : RootDirNull.slice(0, index - 1) + "\n" + localeRootDir + "\n" + RootDirNull.slice(index);
  const formatted: string = prettier.format(NewContent, { parser: `babel${parser}` });
  const cleanRegex: RegExp = /{" "}/g;
  const newFormatted: string = formatted.replace(cleanRegex, " ");
  fse.writeFileSync(RootDir, newFormatted);

  /* End of `root` meddling */

  // Create and write pwa-utils client file
  const ClientUtils = fse.readFileSync(appDir + "/utils/client/pwa-utils.client." + lang).toString();
  fse.writeFileSync(projectDir + "/app/utils/client/pwa-utils.client." + lang, ClientUtils);

  // Create and write pwa-utils server file
  const ServerUtils = fse.readFileSync(appDir + "/utils/server/pwa-utils.server." + lang).toString();
  fse.writeFileSync(projectDir + "/app/utils/server/pwa-utils.server." + lang, ServerUtils);

  try {
    fse.readdirSync(appDir).map((worker: string) => {
      if (!worker.includes(lang)) {
        return false;
      } else if (worker.includes("entry.worker")) {
        const workerDir = path.resolve(projectDir, `app/${worker}`);
        const fileContent = fse.readFileSync(`${appDir}/${worker}`);
        fse.existsSync(workerDir) && workerDir.includes(fileContent)
          ? null
          : fse.writeFileSync(path.resolve(projectDir, `app/${worker}`), fileContent.toString());
      }
    });
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
      type: "confirm",
      name: "question",
      message: 'Do you want to immediately run "npm install"?',
      initial: true,
    },
  ]);

  async function Setup(questions: any) {
    let lang: "ts" | "js";
    questions.lang === "TypeScript" ? (lang = "ts") : (lang = "js");

    await Promise.all([Run(projectDir, lang)]);
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
      execSync("npm install", {
        cwd: process.cwd(),
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
