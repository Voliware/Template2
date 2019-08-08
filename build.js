const uglify = require('uglify-es');
const fs = require('fs');

const src = [
    './src/js/eventSystem.js',
    './src/js/template2.js'
];
const templates = [
    './templates/feedback.js',
    './templates/form.js',
    './templates/pager.js',    
    './templates/popup.js',
    './templates/status.js',
    './templates/table.js',
    './templates/wizard.js',
];
const base = './dist/template2.1.0.0.min.js';
const bundle = './dist/template2-bundle.1.0.0.min.js';

function readCode(files){
    let code = "";
    for(let i = 0; i < files.length; i++){
        code += fs.readFileSync(files[i])
        if(!code){
            console.error("Failed to read file");
        }
    }
    return code;
}

function printFiles(files){
    let text = "";
    for(let i = 0; i < files.length; i++){
        text += `  ${files[i]}`
        if(i + 1 !== files.length){
            text += "\n";
        }
    }
    return text;
}

function buildBase(){
    let code = readCode(src);
    let result = uglify.minify(code.toString());
    return new Promise(function(resolve, reject){
        fs.writeFile(base, result.code, function(err){
            let status = "OK";
            if(err){
                status = "ERR";
                console.error(err);
            } 
            console.log(`\r\n\\\\     \/\/ \/\/\/\/\/\/ \/\/     \/\/ \\\\           \/\/ \/\/\\ \\\\\\\\\\\\ \\\\\\\\\\\\\\\r\n \\\\   \/\/ \/\/  \/\/ \/\/     \/\/   \\\\   \/\/\\   \/\/ \/\/ \\\\ \\\\  \\\\ \\\\___\r\n  \\\\ \/\/ \/\/  \/\/ \/\/     \/\/     \\\\ \/\/ \\\\ \/\/ \/\/   \\\\ \\\\\\\\\\  \\\\\r\n   \\\\\/ \/\/\/\/\/\/ \/\/\/\/\/\/ \/\/       \\\\\/   \\\\\/ \/\/     \\\\ \\\\  \\\\ \\\\\\\\\\\\`);
            console.log('\r\n');
            console.log('TEMPLATE2 - V1.0.0');
            console.log('\r\n');
            console.log('BUILD: base');
            console.log(`- ${(new Date()).toLocaleString()}`)
            console.log('- INPUT');
            console.log(`${printFiles(src)}`);
            console.log(`- OUTPUT: ${base}`);
            console.log(`- STATUS: ${status}`);
            resolve();
        });
    });
}

function buildBundle(){
    let code = readCode(src) + readCode(templates);
    let result = uglify.minify(code.toString());
    return new Promise(function(resolve, reject){
        fs.writeFile(bundle, result.code, function(err){
            let status = "OK";
            if(err){
               status = "ERR";
               console.error(err);
            } 
            console.log('\r\n');
            console.log('BUILD: bundle');
            console.log(`- ${(new Date()).toLocaleString()}`)
            console.log('- INPUT');
            console.log(`${printFiles(src)}`);
            console.log(`${printFiles(templates)}`);
            console.log(`- OUTPUT: ${bundle}`);
            console.log(`- STATUS: ${status}`);
            resolve();
        });
    });
}

buildBase().then(buildBundle)