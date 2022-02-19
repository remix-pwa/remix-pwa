declare const fs: any;
declare const fse: any;
declare const path: any;
declare const inquirer: any;
declare const colorette: any;
declare const prettier: any;
declare function Run(projectDir: string, lang: "ts" | "js"): Promise<void>;
declare function cli(): Promise<void>;
