#!/usr/bin/env node
import { recordAllCode } from './src/recorder.js';

var args = process.argv.slice(2); // Removing 'node' and the name
// of the program.

console.log(`Running with args ${args}`);
recordAllCode(args[0], args[1]);
