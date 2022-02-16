#!/usr/bin/env node

import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import * as inquirer from "inquirer";
import { red, green, magenta } from "colorette";

async function Run(projectDir: string, lang: "ts" | "js") {
  !fse.existsSync(projectDir + "/app/routes/resources") &&
    fse.mkdirSync(projectDir + "/app/routes/resources", { recursive: true });

  !fse.existsSync(projectDir + "/public/icons") && 
    fse.mkdirSync(projectDir + "/public/icons", { recursive: true });

  const publicDir = path.resolve(process.cwd(), "templates", lang, "public");
  const appDir = path.resolve(process.cwd(), "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  fse.readdirSync(`${publicDir}/icons`).map((file: string) => {
    const fileContent = fs.readFileSync(publicDir + "/icons/" + file);
    fse.writeFileSync(projectDir + `/public/icons/${file}`, fileContent);
  });

  // Create `manifest.json` file && service worker entry point
  const fileContent = fse.readFileSync(appDir + `/routes/resources/manifest[.]json.${lang}`);
  fse.writeFileSync(projectDir + `/app/routes/resources/manifest[.]json.${lang}`, fileContent.toString());
  
  // Register worker in `entry.client.tsx`
  const ClientContent = fse.readFileSync(appDir + "/entry.client." + lang)
  fse.appendFileSync(projectDir + "/app/entry.client." + lang + "x", ClientContent.toString())

  // Acknowledge SW in the browser
  const ServiceWorkerRegistrar = fse.readFileSync(appDir + "/root." + lang)
  const RootDir = projectDir + "/app/root." + lang + "x"
  const RootDirContent = fse.readFileSync(RootDir).toString()
  const localeRootDir = fse.readFileSync(appDir + "/root." + lang).toString()
  const RootDirNull = RootDirContent.replace(/\s\s+/g, ' ')
  const rootRegex = /return \( <html/g
  const index = RootDirNull.search(rootRegex)
  const NewContent = RootDirNull.slice(0, index - 1) + localeRootDir + RootDirNull.slice(index - 1)
  fse.writeFileSync(RootDir, NewContent)

  /* TODO: Find a way to avoid messing up `root.[t/j]sx` */

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
    console.error(red("Error ocurred creating files. Could not create Service Worker files."));
    process.exit(1);
  }
}

export default async function cli() {
  console.log(magenta("Welcome to Remix PWA!"));
  console.log();

  await new Promise((res) => setTimeout(res, 1500));

  const projectDir = path.resolve("../../");

  /* Debugging purposes ONLY: Uncomment 👇 */
  // const projectDir = process.cwd();

  let answer = await inquirer.prompt<{
    lang: "ts" | "js";
  }>([
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
}

cli()
  .then(() => {
    console.log(
      green("PWA Service workers successfully integrated into Remix! Check out the docs for additional info."),
    );
    process.exit(0);
  })
  .catch((err: Error) => {
    console.error(red(err.message));
    process.exit(1);
  });