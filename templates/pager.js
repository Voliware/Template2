/**
 * Pager Template.
 * Controls pagination to navigate between pages of things. Controls a previous
 * button, next button, current page display, and a text input that also allows
 * manual paging.
 * @extends {Template}
 */
class PagerTemplate extends Template {

    /**
     * Constructor
     * @param {Object} [params]
     * @param {Object} [params.elements]
     * @param {String} [params.elements.page="[name='age']"]
     * @param {String} [params.elements.previous="[name='previous']"]
     * @param {String} [params.elements.page_count="[data-name='page_count']"]
     * @param {String} [params.elements.next="[name='next']"]
     */
    constructor({
        elements = {
            page: '[name="page"]',
            previous: '[name="previous"]',
            page_count: '[data-name="pageCount"]',
            next: '[name="next"]'
        }
    } = {})
    {
        super({elements});

        /**
         * The current page. 1 is minimum.
         * @type {Number}
         */
        this.page = 1;

        /**
         * The page count. 1 is minimum.
         * @type {Number}
         */
        this.page_count = 1;
    }

    /**
     * Attach button handlers.
     */
    onConnected(){
        this.attachButtonHandlers();
    }

    /**
     * Create the inner html
     * @returns {String}
     */
    createHtml(){
        return `<button name="previous" type="button">Previous</button>
                    <div class="pager-input">
                        <input name="page" type="number" class="pager-page">
                        <span>/</span>
                        <span data-name="pageCount"></span>
                    </div>
                <button name="next" type="button">Next</button>`;
    }

    /**
     * Set the current page count. Render the pager.
     * @param {Number} page_count 
     */
    setPageCount(page_count){
        this.page_count = page_count;
        this.render();
    }

    /**
     * Set the current page. Render the pager.
     * @param {Number} page_count 
     */
    setPage(page){
        this.page = page;
        this.render();
    }

    /**
     * Render the pager. If no data is passed, used the internal properties.
     * @param {Object} [data={}] 
     */
    render(data = {}){
        if(typeof data.page_count === "undefined"){
            data.page_count = this.page_count;
        }
        if(typeof data.page === "undefined"){
            data.page = this.page;
        }
        super.render(data);
        if(data.page_count <= 1){
            this.disableNextButton()
            this.disablePreviousButton();
        }
        else {
            if(data.page === data.page_count){
                this.disableNextButton();
                this.enablePreviousButton();
            }
            else if(data.page === 1){
                this.disablePreviousButton();
                this.enableNextButton();
            }
            else {
                this.enableNextButton();
                this.enablePreviousButton();
            }
        }
    }

    /**
     * Show or hide the next button.
     * @param {Boolean} state - true to show, false to hide
     */
    displayNextButton(state){
        Template.display(this.elements.next, state);
    }

    /**
     * Show or hide the previous button.
     * @param {Boolean} state - true to show, false to hide
     */
    displayPreviousButton(){
        Template.display(this.elements.previous, state);
    }

    /**
     * Enable the next button.
     */
    enableNextButton(){
        Template.enable(this.elements.next);
    }

    /**
     * Disable the next button.
     */
    disableNextButton(){
        Template.disable(this.elements.next);
    }

    /**
     * Enable the previous button.
     */
    enablePreviousButton(){
        Template.enable(this.elements.previous);
    }

    /**
     * Disable the previous button.
     */
    disablePreviousButton(){
        Template.disable(this.elements.previous);
    }

    /**
     * Attach button handlers
     */
    attachButtonHandlers(){
        Template.on(this.elements.next, "click.pager", () => {
            this.setPage(this.page + 1);
            this.emit("next");
        });
        Template.on(this.elements.previous, "click.pager", () => {
            this.setPage(this.page - 1);
            this.emit("previous");
        });
        let debounce = null;
        Template.on(this.elements.page, "input.pager", () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                let value = parseInt(this.elements.page.value);
                if(value && value <= this.page_count){
                    this.page = value;
                    this.emit("page", this.page);
                }
            }, 150);
        });
    }
}
customElements.define('template-pager', PagerTemplate);