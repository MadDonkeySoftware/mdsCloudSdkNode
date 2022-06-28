import fs from 'fs';

/*
https://newbedev.com/how-to-npm-publish-specific-folder-but-as-package-root

DO NOT DELETE THIS FILE
This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
It will not be included in the npm package.
*/

interface PackageJson {
  version: string;
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
  main: string;
  types: string;
}

function main() {
  const source = fs
    .readFileSync(__dirname + '/../package.json')
    .toString('utf-8');
  const sourceObj = JSON.parse(source) as PackageJson;
  sourceObj.scripts = {};
  sourceObj.devDependencies = {};

  if (sourceObj.main.startsWith('dist/')) {
    sourceObj.main = sourceObj.main.slice(5);
  }
  if (sourceObj.types.startsWith('dist/')) {
    sourceObj.types = sourceObj.types.slice(5);
  }

  let outFile = `${__dirname}/package.json`;
  console.log(`Writing ${outFile}...`);
  fs.writeFileSync(
    outFile,
    Buffer.from(JSON.stringify(sourceObj, null, 2), 'utf-8'),
  );
  // fs.writeFileSync(__dirname + "/version.txt", Buffer.from(sourceObj.version, "utf-8") );

  outFile = `${__dirname}/.npmignore`;
  fs.copyFileSync(__dirname + '/../.npmignore', outFile);
  console.log(`Copying file to ${outFile}...`);
}

main();
