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
let table1 = Template.select("#tableExample");
table1.render(tableData1);

// table that does not exist in DOM
// must have columns defined to match the tableData1
let table2 = document.createElement('template-table');
table2.setSchema({
    primaryKey: "id",
    columns: ["column1", "column2", "column3"],
    // optional, if you want the header to have different names
    columnTitles: ["Column Uno", "Column Dos", "Column Tres"]
});
table2.appendTo(Template.select('#tableExampleNoHtml'));
table2.render(tableData1);
setTimeout(function(){
    table2.render(tableData2);
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

let form1 = Template.select('#formExample', {
    submitRequest: function(data){
        console.log(data);
        return Promise.resolve();
    },
    getRequest: function(){
        return Promise.resolve(formData);
    },
    validateRequest(data){
        return Promise.resolve(true);
    }
})
form1.render(formData);

/////////////////////////////////////////
///////// Wizard Examples //////////////
///////////////////////////////////////

let wizard = Template.select('#wizardExample', {
    submitRequest: function(data){
        console.log(data);
        return Promise.resolve();
    },
    getRequest: function(){
        return Promise.resolve(formData);
    },
    validateRequest(data){
        return Promise.resolve(true);
    }
});
wizard.render(formData);

/////////////////////////////////////////
////////// Popup Examples //////////////
///////////////////////////////////////

let popup = Template.select('#popupExample');
let popupButton = Template.select('#popupExampleButton');
popupButton.addEventListener('click', function(){
    popup.open();
});

/////////////////////////////////////////
////////// Status Examples /////////////
///////////////////////////////////////

let status1 = Template.select('#statusExample1');
status1.renderSuccess("You did it!");
let status2 = Template.select('#statusExample2');
status2.renderError("You failed!");
let status3 = Template.select('#statusExample3');
status3.renderInfo("You're doing it!");

/////////////////////////////////////////
////////// Feedack Examples ////////////
///////////////////////////////////////

let feedback1 = Template.select('#feedbackExample1');
feedback1.renderSuccess("You did it!");
let feedback2 = Template.select('#feedbackExample2');
feedback2.renderError("You failed!");
let feedback3 = Template.select('#feedbackExample3');
feedback3.renderProcessing("You're doing it!");