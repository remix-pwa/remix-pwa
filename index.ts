import * as path from "path";
import fse from "fs-extra";

export async function Run(projectDir: string, lang: "ts" | "js") {
  !fse.existsSync(projectDir + "/app/routes/resources") &&
    fse.mkdirSync(projectDir + "/app/routes/resources", { recursive: true });

  !fse.existsSync(projectDir + "/public/icons") &&
    fse.mkdirSync(projectDir + "/public/icons", { recursive: true });

  const publicDir = path.resolve(__dirname, "templates", lang, "public");
  const appDir = path.resolve(__dirname, "templates", lang, "app");

  // Create `public/icons` and store PWA icons
  fse.existsSync(projectDir + "/public/icons")
    ? fse.readdirSync(`${publicDir}/icons`).forEach((file) => {
        const fileContent = fse.readFileSync(publicDir + "/icons/" + file);
        fse.writeFile(projectDir + `/public/icons/${file}`, fileContent);
      })
    : console.error("Error ocurred while creating necessary directories!");

  // Create `manifest.json` file && service worker entry point
  if (fse.existsSync(projectDir + "/app/routes/resources")) {
    fse.readdirSync(`${appDir}/routes/resources`).forEach((manifest) => {
      const fileContent = fse.readFileSync(
        appDir + "/routes/resources/" + manifest
      );
      fse.writeFile(
        projectDir + `/app/routes/resources/${manifest}`,
        fileContent
      );
    });

    fse.readdirSync(appDir).forEach((worker: string) => {
      if (!worker.includes(".tsx") || worker.includes(".jsx")) {
        return false;
      } else if(worker.includes("entry.worker")) {
        const fileContent = fse.readFileSync(`${appDir}/${worker}`);
        return fse.writeFile(projectDir + `/app/${worker}`, fileContent);
      } else {
        const output = fse.createWriteStream(projectDir + `/app/${worker}`, { flags: "a" });
        const input = fse.createReadStream(`${appDir}/${worker}`);

        output.on("close", () => {
          console.log("File created successfully!");
        })

        input.pipe(output);
      }
    });
  } else {
    console.error(
      "Error ocurred creating files. Could not create `entry.worker` file."
    );
    process.exit(1);
  }
}
