/**
 * Table Template.
 * Builds rows of data with the render() function.
 * @extends {Template}
 */
class TableTemplate extends Template {

    /**
     * Constructor
     * @param {object} [options={}] 
     * @param {boolean} [options.alwaysRebuild=false] - whether to always wipe
     * and then rebuild the table@param {object} [options.elements] - the table elements
     * @param {string} [options.elements.table="table"] - the table element selector
     * @param {string} [options.elements.thead="thead"] - the thead element selector
     * @param {string} [options.elements.theadTr="theadTr"] - the thead row element selector
     * @param {string} [options.elements.tbody="tbody"] - the thead element selector
     * @param {string} [options.elements.tfoot="tfoot"] - the tfoot element selector
     * @param {string} [options.elements.tr="tr"] - the tbody row element selector
     * @param {object} [optinos.schema={}]
     * @param {string} [options.schema.primaryKey="id"] - the table's primary key
     * @param {string[]} [options.schema.columns=[]] - array of column names, required for a
     * table that is not defined first in HTML
     * @param {string[]} [options.schema.columnTitles=[]] - array of column titles, optional if
     * you want the header to display a different title for each column instead of its name
     * @returns {TableTemplate}
     */
    constructor(options = {}){
        let defaults = {
            alwaysRebuild: false,
            elements: {
                table: 'table',
                thead: 'thead',
                theadTr: 'thead > tr',
                tbody: 'tbody',
                tfoot: 'tfoot',
                tr: 'tbody > tr'
            },
            schema: {
                primaryKey: 'id',
                columns: [],
                columnTitles: []
            }
        };
        super(Object.extend(defaults, options));
        this.rowManager = null;
        return this;
    }

    /**
     * Called when the element is 
     * connected to the DOM.
     */
    connectedCallback(){
        super.connectedCallback();
        if(this.elements && this.elements.tr instanceof HTMLElement){
            this.columnCount = this.elements.tr.querySelectorAll('td').length;
            // remove the default row, it will be used as a template
            this.elements.tr.remove();
        }
        this.createRowManager();
    }

    /**
     * Create the row manager.
     * If the tbody does not exist, this
     * manager will exist only virtually
     * until it is appended somewhere.
     * @returns {ElementManager}
     */
    createRowManager(){
        let wrapper = (this.elements && this.elements.tbody instanceof HTMLElement)
            ? this.elements.tbody
            : document.createElement('div');
        return this.rowManager = new ElementManager(wrapper, this.elements.tr);
    }

    /**
     * Create HTML. In the very least,
     * we have a table and a tbody.
     * @returns {TableTemplate}
     */
    createHtml(){
        this.innerHTML = '<table><tbody></tbody></table>';
        return this;
    }

    /**
     * Render the table.
     * Essentially, pass the data to rowManager
     * who will take care of rendering the rows.
     * @param {object} data 
     * @returns {TableTemplate}
     */
    render(data){
        this.cacheData(data);
        this.processRenderData(data);

        // empty the table if the option is set
        // or if the data is an array and there is no primary key
        // without a primary key, we don't know how to manage rows
        if(this.options.alwaysRebuild){
            this.empty();
        }
        else if(Array.isArray(this.renderData)){
            if(typeof this.renderData[0][this.options.primaryKey] === 'undefined'){
                this.empty();
            }
        }

        this.rowManager.render(this.renderData);
        return this;
    }

    /**
     * Empty the table tbody
     * @returns {TableTemplate}
     */
    empty(){
        this.rowManager.empty();
        return this;
    }

    // header

    /**
     * Create a header element
     * @returns {HTMLElement}
     */
    createHeader(){
        return document.createElement('thead');
    }

    /**
     * Create a header column element
     * @returns {HTMLElement}
     */
    createHeaderColumn(){
        return document.createElement('th');
    }

    /**
     * Add a header element
     * @param {HTMLElement} header
     * @returns {TableTemplate}
     */
    addHeader(header){
        Template.prepend(header, this.elements.table);
        return this;
    }

    /**
     * Generate the header with a row of th columns.
     * The header is generated from the column names
     * set in this.options.columns
     * @param {string[]} columnNames - a string array of column names
     * @param {string[]} [columnTitles] - a string array of column titles
     * @returns {TableTemplate}
     */
    generateHeader(columnNames, columnTitles){
        this.elements.thead = this.createHeader();
        let row = this.createRow();
        for(let i = 0; i < columnNames.length; i++){
            let col = this.createHeaderColumn();
            col.innerHTML = columnTitles ? columnTitles[i] : columnNames[i];
            row.appendChild(col);
        }
        this.elements.thead.appendChild(row);
        this.addHeader(this.elements.thead);
        return this;
    }

    // row

    /**
     * Create a row element
     * @returns {HTMLElement}
     */
    createRow(){
        return document.createElement('tr');
    }

    /**
     * Create a row by cloning the tbody tr.
     * @returns {HTMLElement}
     */
    cloneRow(){
        return this.elements.tr.cloneNode(true);
    }

    /**
     * Append a row to the tobdy.
     * @param {HTMLElement} row
     * @returns {TableTemplate}
     */
    appendRow(row){
        this.elements.tbody.appendChild(row);
        return this;
    }

    /**
     * Remove a row
     * @param {HTMLElement} row 
     * @returns {TableTemplate}
     */
    removeRow(row){

    }

    /**
     * Generate the cloneable row that all other
     * rows in the table are cloned from. This is not
     * used to create a new row to add to the table.
     * Each column in this row has it's data-name attribute
     * set to the name of the column in this.options.columns.
     * @returns {TableTemplate}
     */
    generateRow(){
        this.elements.tr = this.createRow();
        for(let i = 0; i < this.options.schema.columns.length; i++){
            let col = this.createColumn();
            col.setAttribute("data-name", this.options.schema.columns[i]);
            this.elements.tr.appendChild(col);
        }
        this.elements.tbody.appendChild(this.elements.tr);
        return this;
    }

    // column

    /**
     * Create a column
     * @returns {HTMLElement}
     */
    createColumn(){
        return document.createElement('td');
    }

    /**
     * Append a column to a row
     * @param {HTMLElement} row
     * @param {HTMLElement} column
     * @returns {TableTemplate}
     */
    appendColumnToRow(row, column){
        row.appendChild(column);
        return this;
    }

    /**
     * Reset the DOM object.
     * This walks through the extracted DOM object
     * and removes each element. Then, it resets
     * the DOM object to a blank object. 
     * @returns {TableTemplate}
     */
    resetDom(){
        if(this.elements){
            for(let k in this.elements){
                let el = this.elements[k];
                if(el instanceof HTMLElement){
                    el.remove();
                }
            }
        }
        this.elements = {};
        return this;
    }

    /**
     * Set the table's schema.
     * Wipe the entire table and rebuild
     * the header and the main tr.
     * @param {object} schema
     * @param {string[]} schema.columns
     * @param {string[]} [schema.columnTitles]
     * @param {string} [schema.primaryKey]
     * @returns {TableTemplate} 
     */
    setSchema(schema){
        this.options.schema = schema;
        this.resetDom();
        this.createHtml();
        this.findNamedElements();
        this.findElements(this.options.elements);
        this.generateHeader(this.options.schema.columns, this.options.schema.columnTitles);
        this.generateRow();
        return this;
    }
}
customElements.define('template-table', TableTemplate);