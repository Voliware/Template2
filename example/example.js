/////////////////////////////////////////
////////// Table Examples //////////////
///////////////////////////////////////

let tableData1 =  [
    {
        id: 0,
        column1: "Some data 1",
        column2: "More data 1",
        column3: "Last data 1",
    },
    {
        id: 1,
        column1: "Some data 2",
        column2: "More data 2",
        column3: "Last data 2",
    },
    {
        id: 2,
        column1: "Some data 3",
        column2: "More data 3",
        column3: "Last data 3",
    }
];
let tableData2 = [
    {
        id: 0,
        column1: "Some data 1",
        column2: "More data 1",
        column3: "Last data 1",
    },
    {
        id: 1,
        column1: "Some new data 2",
        column2: "More new data 2",
        column3: "Last new data 2",
    }
];

// table captured from DOM
let table1 = Template.selectFirst("#tableExample");
table1.render(tableData1);
setTimeout(function(){
    table1.render(tableData2);
}, 1000);

/////////////////////////////////////////
////////// Form Examples ///////////////
///////////////////////////////////////

let formData = {
    name: "Billy Bones",
    age: 142,
    location: "somewhere",
    personality: "b",
    hobbies: {
        dancing: true,
        partying: true,
        learning: false
    },
    job: {
        performance: 1,
        skills: {
            math: 10,
            language: 9,
            suaveness: 100
        }
    }
};
function submitRequest(data){
    console.log(data);
    return Promise.resolve();
}
function getRequest(){
    return Promise.resolve(formData);
}
function validateRequest(data){
    return Promise.resolve(true);
}

let form1 = Template.selectFirst('#formExample');
form1.setSubmitRequest(submitRequest);
form1.setGetRequest(getRequest);
form1.setValidateRequest(validateRequest);
form1.render(formData);

/////////////////////////////////////////
///////// Wizard Examples //////////////
///////////////////////////////////////

let wizard = Template.selectFirst('#wizardExample');
wizard.setSubmitRequest(submitRequest);
wizard.setGetRequest(getRequest);
wizard.setValidateRequest(validateRequest);
wizard.render(formData);

/////////////////////////////////////////
////////// Popup Examples //////////////
///////////////////////////////////////

let popup = Template.selectFirst('#popupExample');
let popupButton = Template.selectFirst('#popupExampleButton');
popupButton.addEventListener('click', function(){
    popup.open();
});

/////////////////////////////////////////
////////// Status Examples /////////////
///////////////////////////////////////

let status1 = Template.selectFirst('#statusExample1');
status1.renderSuccess("You did it!");
let status2 = Template.selectFirst('#statusExample2');
status2.renderError("You failed!");
let status3 = Template.selectFirst('#statusExample3');
status3.renderInfo("You're doing it!");

/////////////////////////////////////////
////////// Feedack Examples ////////////
///////////////////////////////////////

let feedback1 = Template.selectFirst('#feedbackExample1');
feedback1.renderSuccess("You did it!");
let feedback2 = Template.selectFirst('#feedbackExample2');
feedback2.renderError("You failed!");
let feedback3 = Template.selectFirst('#feedbackExample3');
feedback3.renderProcessing("You're doing it!");

//////////////////////////////////////////////////
////////// ElementManager Examples //////////////
//////////////////////////////////////////////////

class TestTemplate extends Template {
}
customElements.define('template-test', TestTemplate);

let element_manager_wrapper = Template.selectFirst('#elementManagerExample');
let element_manager_template = Template.selectFirst('#elementManagerTemplate')
let element_manager = new ElementManager({template: element_manager_template});
element_manager.appendTo(element_manager_wrapper);
element_manager.render({
    0: {text: "Entry 0"},
    1: {text: "Entry 1"},
    2: {text: "Entry 2"}
});