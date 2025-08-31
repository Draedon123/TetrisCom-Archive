// @ts-check

const fs = require("fs");
const path = require("path");
const minify = require("./minify.cjs");

const SOURCE = path.resolve(__dirname, "../src");
const BUILD = path.resolve(__dirname, "../build");
const MINIFY_FILES = true;

async function build() {
  const start = Date.now();

  console.log("Copying source directory");

  copyDirectory(SOURCE, BUILD);

  console.log("Finished copying source directory");

  if (MINIFY_FILES) {
    console.log("Minifying build directory");
    await minify(BUILD);
  }

  const end = Date.now();
  const elapsedMilliseconds = end - start;
  const elapsedSeconds = (elapsedMilliseconds / 1000).toFixed(2);

  console.log(`Took ${elapsedSeconds}s to build`);
}

/**
 * @param { string } source
 * @param { string } destination
 */
function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    throw new Error("Could not find source directory");
  }

  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true });
  }

  fs.cpSync(source, destination, { recursive: true });
}

build();
