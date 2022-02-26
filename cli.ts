#!/usr/bin/env node

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const colorette = require("colorette");
const prettier = require("prettier");

async function Run(projectDir: string, lang: "ts" | "js") {
  !fse.existsSync(projectDir + "/app/routes/resources") &&
    fse.mkdirSync(projectDir + "/app/routes/resources", { recursive: true });

  !fse.existsSync(projectDir + "/public/icons") && fse.mkdirSync(projectDir + "/public/icons", { recursive: true });

  !fse.existsSync(projectDir + "/app/utils/server") && fse.mkdirSync(projectDir + "/app/utils/server", { recursive: true });
  
  !fse.existsSync(projectDir + "/app/utils/client") && fse.mkdirSync(projectDir + "/app/utils/client", { recursive: true });

  const publicDir = path.resolve(process.cwd(), "templates", lang, "public");
  const appDir = path.resolve(process.cwd(), "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  fse.readdirSync(`${publicDir}/icons`).map((file: string) => {
    const fileContent = fs.readFileSync(publicDir + "/icons/" + file);
    fse.writeFileSync(projectDir + `/public/icons/${file}`, fileContent);
  });

  // Check if manifest file exist and if not, create `manifest.json` file && service worker entry point
  const fileContent = fse.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`).toString();
  fse.existsSync(projectDir + "/app/routes/resources/manifest[.]json." + lang) ? null : fse.writeFileSync(projectDir + `/app/routes/resources/manifest[.]json.${lang}`, fileContent);

  // Create resource route for push notifications 
  const subscribeContent = fse.readFileSync(appDir + `/routes/resources/subscribe.${lang}`).toString();
  fse.existsSync(projectDir + "/app/routes/resources/subscribe." + lang) ? null : fse.writeFileSync(projectDir + `/app/routes/resources/subscribe.${lang}`, subscribeContent);

  // Register worker in `entry.client.tsx`
  const remoteClientContent: string = fse.readFileSync(projectDir + "/app/entry.client." + lang + "x").toString();
  const ClientContent = fse.readFileSync(appDir + "/entry.client." + lang).toString();
  const lastClient = "hydrate(<RemixBrowser />, document);"
  let lastWordFinder: RegExp = /[a-z0-9](?=\W*$)/gi;
  lastWordFinder.exec(lastClient)
  const indexOfLast = lastWordFinder.lastIndex - 1;
  remoteClientContent.includes(ClientContent) ? null : remoteClientContent.slice(0, indexOfLast + 1) + "\n" + ClientContent + "\n" + remoteClientContent.slice(indexOfLast + 1);

  // Acknowledge SW in the browser
  const RootDir = projectDir + "/app/root." + lang + "x";

  const RootDirContent = fse.readFileSync(RootDir).toString();
  const localeRootDir = fse.readFileSync(appDir + "/root." + lang).toString();

  const RootDirNull: string = RootDirContent.replace(/\s\s+/g, " ");
  const rootRegex: RegExp = /return \( <html/g;
  const index = RootDirNull.search(rootRegex);
  const NewContent = RootDirContent.includes(localeRootDir) ? RootDirContent : RootDirNull.slice(0, index - 1) + localeRootDir + RootDirNull.slice(index - 1);
  const formatted: string = prettier.format(NewContent, { parser: "babel" });
  const cleanRegex: RegExp = /{" "}/g;
  const newFormatted: string = formatted.replace(cleanRegex, " ");
  fse.writeFileSync(RootDir, newFormatted);

  /* End of `root` meddling */

  // Create and write pwa-utils client file
  const ClientUtils = fse.readFileSync(appDir + "/utils/client/pwa-utils.client." + lang).toString()
  fse.writeFileSync(projectDir + "/app/utils/client/pwa-utils.client." + lang, ClientUtils);
  
  // Create and write pwa-utils server file
  const ServerUtils = fse.readFileSync(appDir + "/utils/server/pwa-utils.server." + lang).toString()
  fse.writeFileSync(projectDir + "/app/utils/server/pwa-utils.server." + lang, ServerUtils);

  try {
    fse.readdirSync(appDir).map((worker: string) => {
      if (!worker.includes(lang)) {
        return false;
      } else if (worker.includes("entry.worker")) {
        const workerDir = path.resolve(projectDir, `app/${worker}`);
        const fileContent = fse.readFileSync(`${appDir}/${worker}`);
        (fse.existsSync(workerDir) && workerDir.includes(fileContent)) ? null : fse.writeFileSync(path.resolve(projectDir, `app/${worker}`), fileContent.toString());
      }
    });
    //@ts-ignore
  } catch (error) {
    console.error(colorette.red("Error ocurred creating files. Could not create Service Worker files."));
    process.exit(1);
  }
}

async function cli() {
  console.log();
  console.log(colorette.magenta("Welcome to Remix PWA!"));
  console.log();

  await new Promise((res) => setTimeout(res, 1500));

  const projectDir = path.resolve("../../");

  /* Debugging purposes ONLY: Uncomment 👇 */
  // const projectDir = process.cwd();

  let answer = await inquirer.prompt([
    {
      name: "lang",
      type: "list",
      message: "Is this a TypeScript or JavaScript project? Pick the opposite for chaos!",
      choices: [
        { name: "TypeScript", value: "ts" },
        { name: "JavaScript", value: "js" },
      ],
    },
  ]);

  await Promise.all([Run(projectDir, answer.lang)]).catch((err: Error) => console.log(err))

  console.log(
    colorette.green("PWA Service workers successfully integrated into Remix! Check out the docs for additional info."),
  );

  console.log();
  console.log(colorette.blue("Running postinstall scripts...."));

  const saveFile = fse.writeFileSync;

  //@ts-ignore
  const pkgJsonPath = require.main.paths[0].split("node_modules")[0] + "package.json";
  const json = require(pkgJsonPath);

  if (!json.hasOwnProperty("scripts")) {
    json.scripts = {};
  }

  json.scripts["build"] = "run-p build:*";
  json.scripts["build:remix"] = "cross-env NODE_ENV=production remix build";
  json.scripts[
    "build:worker"
  ] = `esbuild ./app/entry.worker.${answer.lang} --outfile=./public/entry.worker.js --minify --bundle --format=esm --define:process.env.NODE_ENV='\"production\"'`;
  json.scripts["dev"] = "run-p dev:*";
  json.scripts["dev:remix"] = "cross-env NODE_ENV=development remix dev";
  json.scripts[
    "dev:worker"
  ] = `esbuild ./app/entry.worker.${answer.lang} --outfile=./public/entry.worker.js --bundle --format=esm --define:process.env.NODE_ENV='\"development\"' --watch`;

  saveFile(pkgJsonPath, JSON.stringify(json, null, 2));
}

cli()
  .then(() => {
    console.log(colorette.green("Successfully ran postinstall scripts!"));
  })
  .catch((err: Error) => {
    console.error(colorette.red(err.message));
    process.exit(1);
  });
