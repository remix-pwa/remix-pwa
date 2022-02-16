#!/usr/bin/env node

import * as fse from "fs-extra";
import * as path from "path";
import * as inquirer from "inquirer";
import { red, green, magenta } from "colorette";

async function Run(projectDir: string, lang: "ts" | "js") {
  !fse.existsSync(projectDir + "/app/routes/resources") &&
    fse.mkdirSync(projectDir + "/app/routes/resources", { recursive: true });

  !fse.existsSync(projectDir + "/public/icons") && fse.mkdirSync(projectDir + "/public/icons", { recursive: true });

  const publicDir = path.resolve(__dirname, "templates", lang, "public");
  const appDir = path.resolve(__dirname, "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  fse.existsSync(path.join(publicDir, "icons"))
    ? fse.readdirSync(`${publicDir}/icons`).forEach((file: string) => {
        const fileContent = fse.readFileSync(publicDir + "/icons/" + file);
        fse.writeFile(path.join(projectDir, `/public/icons/${file}`), fileContent);
      })
    : console.error("Error ocurred while creating necessary directories!");

  // Create `manifest.json` file && service worker entry point
  if (fse.existsSync(path.resolve(projectDir, "app"))) {
    fse.readdirSync(`${appDir}/routes/resources`).forEach((manifest: string) => {
      const fileContent = fse.readFileSync(appDir + "/routes/resources/" + manifest);
      fse.writeFile(path.resolve(projectDir, `app/routes/resources/${manifest}`), fileContent);
    });

    fse.readdirSync(appDir).forEach(async (worker: string) => {
      if (!worker.includes(".tsx") && !worker.includes(".jsx")) {
        return false;
      } else if (worker.includes("entry.worker")) {
        const fileContent = fse.readFileSync(`${appDir}/${worker}`);
        return fse.writeFile(path.resolve(projectDir, `app/${worker}`), fileContent);
      } else {
        const output = fse.createWriteStream(path.resolve(projectDir, `app/${worker}`), { flags: "a" });
        const input = fse.createReadStream(`${appDir}/${worker}`);

        output.on("close", () => {
          console.log("PWA Service Worker successfully created!");
        });

        input.pipe(output);
      }
    });
  } else {
    console.error(red("Error ocurred creating files. Could not create Service Worker files."));
    process.exit(1);
  }
}

export default async function cli() {
  console.log(magenta("Welcome to Remix PWA!"));
  console.log();

  await new Promise(res => setTimeout(res, 1500));

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
    console.log(green("PWA Service workers successfully integrated into Remix! Check out the docs for additional info."));
    console.log();
    process.exit(0);
  })
  .catch((err: Error) => {
    console.error(red(err.message));
    process.exit(1);
  });
