#!/usr/bin/env node

require = require("esm")(module);
import screenshot from "./src/screenshot";
import { recordAllCode } from "./src/recorder";

var args = process.argv.slice(2); // Removing 'node' and the name
// of the program.

console.log(`Running with args ${args}`);
recordAllCode(args[0], args[1]);
