#!/usr/bin/env node
import { recordAllCode } from './src/recorder.js';
import { getFilePath, getServerChoice } from './src/cli.js';


const server = await getServerChoice();
//const savePath = getFilePath();

// recordAllCode(server, savePath);
