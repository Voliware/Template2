/**
 * Table Template.
 * Builds rows of data with the render() function.
 * @extends {Template}
 */
class TableTemplate extends Template {

    /**
     * Constructor
     * @param {Object} [params] 
     * @param {Boolean} [params.always_rebuild=false] - Whether to always wipe
     * and then rebuild the table
     * @param {Object} [params.elements] - The table elements
     * @param {String} [params.elements.table="table"] - Table selector
     * @param {String} [params.elements.thead="thead"] - thead selector
     * @param {String} [params.elements.thead_tr="thead_tr"] - thead_tr selectr
     * @param {String} [params.elements.tbody="tbody"] - tbody selector
     * @param {String} [params.elements.tfoot="tfoot"] - tfoot selector
     * @param {String} [params.elements.tr="tr"] - tr selector
     * @param {Object} [params.schema={}]
     * @param {String} [params.schema.primary_key="id"] - Primary key
     * @param {String[]} [params.schema.columns=[]] - Array of column names
     * @param {String[]} [params.schema.column_titles=[]] - Array of column
     * titles, optional if you want the header to display a different title
     * for each column instead of its name.
     */
    constructor({
        always_rebuild = false,
        elements = {
            table: 'table',
            thead: 'thead',
            thead_tr: 'thead > tr',
            tbody: 'tbody',
            tfoot: 'tfoot',
            tr: 'tbody > tr'
        },
        schema = {
            primary_key: 'id',
            columns: [],
            column_titles: []
        }
    } = {})
    {
        super({elements});
        
        /**
         * Whether to always wipe and then rebuild the table
         * @type {Boolean}
         */
        this.always_rebuild = always_rebuild;

        /**
         * The table schema
         * @type {Object}
         */
        this.schema = {
            /**
             * The primary key
             * @type {String}
             */
            primary_key: schema.primary_key,
            
            /**
             * Array of column names
             * @type {String[]}
             */
            columns: schema.columns,

            /**
             * Array of column titles, optional if you want the header to 
             * display a different title for each column instead of its name.
             * @type {String[]}
             */
            column_titles: schema.column_titles
        }

        /**
         * Builds and updates rows in the table.
         * @type {ElementManager}
         */
        this.row_manager = null;
    }

    /**
     * Create the row manager now that the row template can be selected
     * and that the tbody can be used as the row manager wrapper.
     */
    onConnected(){
        this.row_manager = new ElementManager({
            wrapper: this.elements.tbody,
            template: this.elements.tr,
            primary_key: this.schema.primary_key
        });
        this.elements.tr.remove();
    }

    /**
     * Create the inner html
     * @returns {String}
     */
    createHtml(){
        return `<table>
                    <thead>
                        <tr></tr>
                    </thead>
                    <tbody>
                        <tr></tr>
                    </tbody>
                </table>`
    }

    /**
     * Render the table. Pass the data to row_manager who will take care of
     * rendering the rows.
     * @param {Object} data 
     */
    render(data){
        this.cached_data = this.cacheData(data);
        this.render_data = this.processRenderData(data);

        // Empty the table if the option is set or if the data is an array and
        // there is no primary key without a primary key, we don't know how to
        // manage rows
        if(this.always_rebuild){
            this.empty();
        }
        else if(Array.isArray(this.render_data)){
            if(typeof this.render_data[0][this.primary_key] === 'undefined'){
                this.empty();
            }
        }

        this.row_manager.render(this.render_data);
    }

    /**
     * Empty the table tbody
     */
    empty(){
        this.row_manager.empty();
    }
}
customElements.define('template-table', TableTemplate);