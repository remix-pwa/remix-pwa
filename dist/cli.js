"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var inquirer = require("inquirer");
var colorette = require("colorette");
var prettier = require("prettier");
function Run(projectDir, lang) {
    return __awaiter(this, void 0, void 0, function () {
        var publicDir, appDir, fileContent, ClientContent, RootDir, RootDirContent, localeRootDir, RootDirNull, rootRegex, index, NewContent, formatted;
        return __generator(this, function (_a) {
            !fse.existsSync(projectDir + "/app/routes/resources") &&
                fse.mkdirSync(projectDir + "/app/routes/resources", { recursive: true });
            !fse.existsSync(projectDir + "/public/icons") && fse.mkdirSync(projectDir + "/public/icons", { recursive: true });
            publicDir = path.resolve(process.cwd(), "templates", lang, "public");
            appDir = path.resolve(process.cwd(), "templates", lang, "app");
            // Create `public/icons` and store PWA icons
            fse.readdirSync("".concat(publicDir, "/icons")).map(function (file) {
                var fileContent = fs.readFileSync(publicDir + "/icons/" + file);
                fse.writeFileSync(projectDir + "/public/icons/".concat(file), fileContent);
            });
            fileContent = fse.readFileSync(appDir + "/routes/resources/manifest[.]json.".concat(lang)).toString();
            fse.writeFileSync(projectDir + "/app/routes/resources/manifest[.]json.".concat(lang), fileContent);
            ClientContent = fse.readFileSync(appDir + "/entry.client." + lang).toString();
            fse.appendFileSync(projectDir + "/app/entry.client." + lang + "x", ClientContent);
            RootDir = projectDir + "/app/root." + lang + "x";
            RootDirContent = fse.readFileSync(RootDir).toString();
            localeRootDir = fse.readFileSync(appDir + "/root." + lang).toString();
            RootDirNull = RootDirContent.replace(/\s\s+/g, " ");
            rootRegex = /return \( <html/g;
            index = RootDirNull.search(rootRegex);
            NewContent = RootDirNull.slice(0, index - 1) + localeRootDir + RootDirNull.slice(index - 1);
            formatted = prettier.format(NewContent, { parser: "babel" });
            fse.writeFileSync(RootDir, formatted);
            /* TODO: Turn this root operation into a function */
            try {
                fse.readdirSync(appDir).map(function (worker) {
                    if (!worker.includes(lang)) {
                        return false;
                    }
                    else if (worker.includes("entry.worker")) {
                        var fileContent_1 = fse.readFileSync("".concat(appDir, "/").concat(worker));
                        fse.writeFileSync(path.resolve(projectDir, "app/".concat(worker)), fileContent_1.toString());
                    }
                });
                //@ts-ignore
            }
            catch (error) {
                console.error(colorette.red("Error ocurred creating files. Could not create Service Worker files."));
                process.exit(1);
            }
            return [2 /*return*/];
        });
    });
}
function cli() {
    return __awaiter(this, void 0, void 0, function () {
        var projectDir, answer, saveFile, pkgJsonPath, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log();
                    console.log(colorette.magenta("Welcome to Remix PWA!"));
                    console.log();
                    return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 1500); })];
                case 1:
                    _a.sent();
                    projectDir = path.resolve("../../");
                    return [4 /*yield*/, inquirer.prompt([
                            {
                                name: "lang",
                                type: "list",
                                message: "Is this a TypeScript or JavaScript project? Pick the opposite for chaos!",
                                choices: [
                                    { name: "TypeScript", value: "ts" },
                                    { name: "JavaScript", value: "js" },
                                ],
                            },
                        ])];
                case 2:
                    answer = _a.sent();
                    return [4 /*yield*/, Run(projectDir, answer.lang).then(function () {
                            console.log(colorette.green("PWA Service workers successfully integrated into Remix! Check out the docs for additional info."));
                        })];
                case 3:
                    _a.sent();
                    console.log();
                    console.log(colorette.blue("Running postinstall scripts...."));
                    saveFile = fse.writeFileSync;
                    pkgJsonPath = require.main.paths[0].split("node_modules")[0] + "package.json";
                    json = require(pkgJsonPath);
                    if (!json.hasOwnProperty("scripts")) {
                        json.scripts = {};
                    }
                    json.scripts["build"] = "run-p build:*";
                    json.scripts["build:remix"] = "cross-env NODE_ENV=production remix build";
                    json.scripts["build:worker"] = "esbuild ./app/entry.worker.".concat(answer.lang, " --outfile=./public/entry.worker.js --minify --bundle --format=esm --define:process.env.NODE_ENV='\"production\"'");
                    json.scripts["dev"] = "run-p dev:*";
                    json.scripts["dev:remix"] = "cross-env NODE_ENV=development remix dev";
                    json.scripts["dev:worker"] = "esbuild ./app/entry.worker.".concat(answer.lang, " --outfile=./public/entry.worker.js --bundle --format=esm --define:process.env.NODE_ENV='\"development\"' --watch");
                    saveFile(pkgJsonPath, JSON.stringify(json, null, 2));
                    return [2 /*return*/];
            }
        });
    });
}
cli()
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, console.log(colorette.green("Successfully ran postinstall scripts!"))];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (err) {
    console.error(colorette.red(err.message));
    process.exit(1);
});
