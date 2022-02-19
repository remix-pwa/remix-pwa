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

  const publicDir = path.resolve(process.cwd(), "templates", lang, "public");
  const appDir = path.resolve(process.cwd(), "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  fse.readdirSync(`${publicDir}/icons`).map((file: string) => {
    const fileContent = fs.readFileSync(publicDir + "/icons/" + file);
    fse.writeFileSync(projectDir + `/public/icons/${file}`, fileContent);
  });

  // Create `manifest.json` file && service worker entry point
  const fileContent = fse.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`).toString();
  fse.writeFileSync(projectDir + `/app/routes/resources/manifest[.]json.${lang}`, fileContent);

  // Register worker in `entry.client.tsx`
  const ClientContent = fse.readFileSync(appDir + "/entry.client." + lang).toString();
  fse.appendFileSync(projectDir + "/app/entry.client." + lang + "x", ClientContent);

  // Acknowledge SW in the browser
  const RootDir = projectDir + "/app/root." + lang + "x";

  const RootDirContent = fse.readFileSync(RootDir).toString();
  const localeRootDir = fse.readFileSync(appDir + "/root." + lang).toString();

  const RootDirNull = RootDirContent.replace(/\s\s+/g, " ");
  const rootRegex = /return \( <html/g;
  const index = RootDirNull.search(rootRegex);
  const NewContent = RootDirNull.slice(0, index - 1) + localeRootDir + RootDirNull.slice(index - 1);
  const formatted = prettier.format(NewContent, { parser: "babel" });
  fse.writeFileSync(RootDir, formatted);

  /* TODO: Turn this root operation into a function */

  try {
    fse.readdirSync(appDir).map((worker: string) => {
      if (!worker.includes(lang)) {
        return false;
      } else if (worker.includes("entry.worker")) {
        const fileContent = fse.readFileSync(`${appDir}/${worker}`);
        fse.writeFileSync(path.resolve(projectDir, `app/${worker}`), fileContent.toString());
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

  const projectDir = path.resolve("../../../");

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

  await Run(projectDir, answer.lang);

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
