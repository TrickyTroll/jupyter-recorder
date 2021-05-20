#!/usr/bin/env node
import { recordAllCode } from './src/recorder.js';
import { getFilePath, getServerChoice } from './src/cli.cjs'

const server = getServerChoice();
const savePath = getFilePath();

recordAllCode(server, savePath);
