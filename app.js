#!/usr/bin/env node
import { recordFromArgs } from "./src/cli.js";
import { lookpath } from "lookpath";

let path = await lookpath("jupyter");
if (!path) {
  throw new Error("\x1b[31mCould no find jupyter in your path.");
}

recordFromArgs();
