#!/usr/bin/env node
import { recordAllCode } from './src/recorder.js';
import { getInfo } from './src/cli.js';

const allInfo = getInfo();

recordAllCode(allInfo.server , allInfo.filePath);
