import inquirer from 'inquirer';
import { spawnSync } from 'child_process';


function uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

function parseOutput (output) {
    const parsed = [];
    var decodedArray = uintToString(output).split("\n");
    decodedArray.forEach((line) => {
        if (line.slice(0, 4) === "http") {
            parsed.push(line.split(" ")[0]);
        }
    });
    return parsed;
}

function getJupyterServers() {
    const jupyter = spawnSync('jupyter', ['notebook', 'list']);
    var parsed = parseOutput(jupyter.stdout)
    return parsed;
}

export function getServerChoice() {

    // Blocks here until return since function is sync
    const servers = getJupyterServers(); 

    console.log(`List of servers: ${servers}`)

    const allChoices = [new inquirer.Separator(' = server options = '), { name: 'New server' }];
    servers.forEach(element => {
        allChoices.push({
            name: element.toString()
        });

    });
    inquirer
        .prompt([
            {
                type: 'checkbox',
                message: 'Select your server',
                name: 'server',
                choices: allChoices,
            }
        ])
        .then(answers => {
            return answers;
        })
        .catch(error => {
            if (error.isTtyError) {
                console.log("Prompt couldn't be rendered in the current environment.")
            } else {
                console.log("Something went wrong.")
            }
        });
}

export function getFilePath() {

    const question = [
        {
          type: 'input',
          name: 'file_path',
          message: "Where do you want to save your files?",
        },
    ]

    inquirer.prompt(question).then((answer) => {
        return answer.file_path;
    });
}