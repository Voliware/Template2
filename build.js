const Build = require('@voliware/node-build').Build;
const version = require('./package.json').version;

// base
const jsBaseInput = [
    './src/js/eventSystem.js',
    './src/js/template2.js'
];
const jsBaseOutput = './dist/template2.min.js';
const jsBaseConfig = {
    name: "Template JS [base]",
    version: version,
    input: jsBaseInput,
    output: jsBaseOutput
};

// bundle
const jsBundleInput = [
    './src/js/eventSystem.js',
    './src/js/template2.js',
    './templates/feedback.js',
    './templates/form.js',
    './templates/pager.js',    
    './templates/popup.js',
    './templates/status.js',
    './templates/table.js',
    './templates/wizard.js',
];
const jsBundleOutput = './dist/template2-bundle.min.js';
const jsBundleConfig = {
    name: "Template JS [bundle]",
    version: version,
    input: jsBundleInput,
    output: jsBundleOutput
};

// css
const cssInput = './src/css/template2.css';
const cssOutput = './dist/template2.min.css';
const cssConfig = {
    name: "Template CSS",
    version: version,
    input: cssInput,
    output: cssOutput
};

// build
let configs = [jsBaseConfig, jsBundleConfig, cssConfig];
new Build(configs).run();