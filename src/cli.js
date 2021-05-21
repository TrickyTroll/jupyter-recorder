import inquirer from 'inquirer';
import fs from 'fs';
import { recordAllCode } from './recorder.js';
import { spawnSync } from 'child_process';

function uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

function parseOutput(output) {
    const parsed = { servers: [], paths: [] };
    var decodedArray = uintToString(output).split('\n');
    decodedArray.forEach((line) => {
        if (line.slice(0, 4) === 'http') {
            let splitted = line.split(' ');
            parsed.servers.push(splitted[0]);
            parsed.paths.push(splitted.pop());
        }
    });
    return parsed;
}

function getJupyterServers() {
    const jupyter = spawnSync('jupyter', ['notebook', 'list']);
    var parsed = parseOutput(jupyter.stdout);
    return parsed.servers;
}

function getFilesForServer(serverChoice) {
    const jupyter = spawnSync('jupyter', ['notebook', 'list']);
    const parsed = parseOutput(jupyter.stdout);
    const index = parsed.servers.indexOf(serverChoice);
    let path = parsed.paths[index];
    let allFiles = fs.readdirSync(path, function (err, items) {
        if (err) {
            throw new Error(`Could not read the contents of ${path}.`);
        } else {
            // Not taking dotfiles into account.
            return items;
        }
    });
    allFiles = allFiles.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
    // Only returning notebooks.
    allFiles = allFiles.filter((item) => item.split('.').pop() === 'ipynb');
    return allFiles;
}

export function recordFromArgs() {
    // Blocks here until return since function is sync
    const servers = getJupyterServers();

    const allChoices = [
        new inquirer.Separator(' = server options = '),
        { name: 'New server' },
    ];
    servers.forEach((element) => {
        allChoices.push({
            name: element.toString(), // Adding every running server as an option.
        });
    });

    function promptUser() {
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'Select your server',
                    name: 'server',
                    choices: allChoices,
                },
                {
                    type: 'input',
                    name: 'savePath',
                    message: 'Where do you want to save your files?',
                },
            ])
            .then((answers) => {
                inquirer
                    .prompt([
                        {
                            type: 'list',
                            message: 'Which notebook do you want to record?',
                            name: 'file',
                            choices: getFilesForServer(answers.server),
                        },
                    ])
                    .then((fileAns) => {
                        console.log(
                            `Using:\n\t* Server: ${answers.server}\n\t* Saving at: ${answers.savePath}\n\t* Using file: ${fileAns.file}`
                        );
                        recordAllCode(
                            answers.server,
                            answers.savePath,
                            fileAns.file
                        );
                    });
            })
            .catch((error) => {
                if (error.isTtyError) {
                    console.log(
                        "Prompt couldn't be rendered in the current environment."
                    );
                } else {
                    console.log(`Something went wrong.\n${error}`);
                }
            });
    }
    promptUser();
}
