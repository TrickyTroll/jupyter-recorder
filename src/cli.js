import { spawn } from 'child_process';

const jupyter = spawn('jupyter', ['kernelspec', 'list']);

