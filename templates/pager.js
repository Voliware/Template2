/**
 * Pager Template.
 * Controls pagination to navigate between 
 * pages of things. Controls a previous button,
 * next button, current page display, and 
 * a text input that also allows manual paging.
 * @extends {Template}
 */
class PagerTemplate extends Template {

    /**
     * Constructor
     * @param {object} options 
     * @returns {PagerTemplate}
     */
    constructor(options){
        super(options);
        this.page = 1;
        this.pageCount = 1;
        this.attachButtonHandlers();
    }

    /**
     * Set the current page count.
     * Render the pager.
     * @param {number} pageCount 
     * @returns {PagerTemplate}
     */
    setPageCount(pageCount){
        this.pageCount = pageCount;
        this.render();
        return this;
    }

    /**
     * Set the current page.
     * Render the pager.
     * @param {number} pageCount 
     * @returns {PagerTemplate}
     */
    setPage(page){
        this.page = page;
        this.render();
        return this;
    }

    /**
     * Render the pager.
     * If no data is passed, used the 
     * internal properties.
     * @param {object} [data={}] 
     * @returns {PagerTemplate}
     */
    render(data = {}){
        if(typeof data.pageCount === "undefined"){
            data.pageCount = this.pageCount;
        }
        if(typeof data.page === "undefined"){
            data.page = this.page;
        }
        super.render(data);
        if(data.pageCount <= 1){
            this.disableNextButton()
            this.disablePreviousButton();
        }
        else {
            if(data.page === data.pageCount){
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
        return this;
    }

    /**
     * Show or hide the next button.
     * @param {boolean} state - true to show, false to hide
     * @returns {PagerTemplate}
     */
    displayNextButton(state){
        Template.display(this.elements.next, state);
        return this;
    }

    /**
     * Show or hide the previous button.
     * @param {boolean} state - true to show, false to hide
     * @returns {PagerTemplate}
     */
    displayPreviousButton(){
        Template.display(this.elements.previous, state);
        return this;
    }

    /**
     * Enable the next button.
     * @returns {PagerTemplate}
     */
    enableNextButton(){
        Template.enable(this.elements.next);
        return this;
    }

    /**
     * Disable the next button.
     * @returns {PagerTemplate}
     */
    disableNextButton(){
        Template.disable(this.elements.next);
        return this;
    }

    /**
     * Enable the previous button.
     * @returns {PagerTemplate}
     */
    enablePreviousButton(){
        Template.enable(this.elements.previous);
        return this;
    }

    /**
     * Disable the previous button.
     * @returns {PagerTemplate}
     */
    disablePreviousButton(){
        Template.disable(this.elements.previous);
        return this;
    }

    /**
     * Attach button handlers
     * @returns {PagerTemplate}
     */
    attachButtonHandlers(){
        let self = this;
        Template.on(this.elements.next, "click.pager", function(){
            self.setPage(self.page + 1);
            self.emit("next");
        });
        Template.on(this.elements.previous, "click.pager", function(){
            self.setPage(self.page - 1);
            self.emit("previous");
        });
        let debounce = null;
        Template.on(this.elements.page, "input.pager", function(){
            clearTimeout(debounce);
            debounce = setTimeout(function(){
                let value = parseInt(self.elements.page.value);
                if(value && value <= self.pageCount){
                    self.page = value;
                    self.emit("page", self.page);
                }
            }, 150);

        });
        return this;
    }
}
customElements.define('template-pager', PagerTemplate);