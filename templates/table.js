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
     * and then rebuild the table
     * @param {object} [options.elements] - the table elements
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

        this.rowManager = new ElementManager(this.elements.tbody, this.elements.tr);;
        this.elements.tr.remove();
    }

    /**
     * Render the table.
     * Essentially, pass the data to rowManager
     * who will take care of rendering the rows.
     * @param {object} data 
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
    }

    /**
     * Empty the table tbody
     */
    empty(){
        this.rowManager.empty();
    }
}
customElements.define('template-table', TableTemplate);