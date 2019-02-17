/////////////////////////////////////////
////////// Table Examples //////////////
///////////////////////////////////////

let tableData =  [
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

// table captured from DOM
let table1 = document.getElementById("tableExample");
table1.render(tableData);

// table that does not exist in DOM
// must have columns defined to match the tableData
let table2 = document.createElement('template-table');
table2.setSchema({
    primaryKey: "id",
    columns: ["column1", "column2", "column3"],
    // optional, if you want the header to have different names
    columnTitles: ["Column Uno", "Column Dos", "Column Tres"]
});
table2.appendTo(document.getElementById('tableExampleNoHtml'));
table2.render(tableData);

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

let form1 = document.getElementById('formExample');
form1.setOptions({
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