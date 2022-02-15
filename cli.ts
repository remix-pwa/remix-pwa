import fse from "fs-extra";
import * as path from "path";
import inquirer from "inquirer";
import { red, blue, magenta } from "colorette";
import { Run } from "./index";

export default async function cli() {
  console.log(magenta("Welcome to Remix PWA!"));
  console.log();

  const projectDir = path.resolve(process.cwd());

  let answer = await inquirer.prompt<{
      lang: "ts" | "js";
  }>([
    {
      name: "lang",
      type: "list",
      message: "TypeScript or JavaScript project? Pick the opposite for chaos!",
      choices: [
        { name: "TypeScript", value: "ts" },
        { name: "JavaScript", value: "js"},
      ],
    },
  ]);

  await Run(projectDir, answer.lang);
}

cli();