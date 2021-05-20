import pkg from 'inquirer';
const { Separator, prompt } = pkg;
import { spawn } from 'child_process';
import { data } from 'autoprefixer';

const jupyter = spawn('jupyter', ['notebook', 'list']);
const output = [];

function uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

jupyter.stdout.on('data',
    function (data) {
        var decodedArray = uintToString(data).split("\n");
        decodedArray.forEach((line) => {
            console.log(line.slice(0, 4))
            if (line.slice(0,4) === "http") {
                output.push(line.split(" ")[0]);
            }
        });
    });

jupyter.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

jupyter.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});

// const allChoices = [new Separator(' = Kernel options = '), { name: 'New kernel' }];
// console.log(returnedOptions);
// returnedOptions.forEach(element => {
//     allChoices.push({
//         name: str(element)
//     });

// });

// prompt([
//     {
//         type: 'checkbox',
//         message: 'Select your Kernel',
//         name: 'kernel',
//         choices: allChoices,
//     }
// ]);