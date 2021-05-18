#!/usr/bin/env node

require = require("esm")(module);
const screenshot = require("./src/screenshot");
const recorder = require("./src/recorder");

var args = process.argv.slice(2); // Removing 'node' and the name
// of the program.

console.log(`Running with args ${args}`);
recorder.recordAllCode(args[0], args[1]);
