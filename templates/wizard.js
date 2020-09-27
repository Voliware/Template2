/**
 * Wizard Template
 * @extends {FormTemplate}
 */
class WizardTemplate extends FormTemplate {

    /**
     * Constructor
     * @param {Object} [param] 
     * @param {Object} [param.elements] 
     * @param {String} [param.elements.navs=".wizard-navs"] 
     * @param {String} [param.elements.tabs=".wizard-tabs"] 
     * @param {String} [param.elements.pager="template-pager"] 
     */
    constructor({
        elements = {
            navs: '.wizard-navs',
            tabs: '.wizard-tabs',
            pager: 'template-pager'
        }
    } = {})
    {
        super({elements});

        /**
         * Total number of tabs
         * @type {Number}
         */
        this.tab_count = 0;

        /**
         * The current tab
         * @type {Number}
         */
        this.tab = 0;
    }

    /**
     * Attach handlers. Go to the first tab.
     */
    onConnected(){
        this.tab_count = this.elements.tabs.children.length;
        this.elements.pager.setPage(1);
        this.elements.pager.setPageCount(this.tab_count);
        this.attachNavHandlers();
        this.attachPagerHandlers();
        this.goToFirstTab();
    }

    /**
     * Create the inner html
     * @returns {String}
     */
    createHtml(){
        return `<div class="wizard-navs"></div>
                <div class="wizard-form">
                    <form>
                        <div class="form-header"></div>
                        <div class="form-body">
                            <div class="wizard-tabs"></div>
                        </div>
                        <div class="form-footer">
                            <button name="reset" type="reset">Reset</button>
                            <button name="submit" type="submit">Submit</button>
                        </div>
                    </form>
                </div>
                <div class="wizard-pager">
                    <template-pager></template-pager>
                </div>`
    }

    /**
     * Determine if a tab index is valid.
     * @param {Number} index 
     * @returns {Boolean} true if it is, false otherwise
     */
    isValidTabIndex(index){
        return index > -1 && index < this.tab_count;
    }

    /**
     * Show or hide a tab by its index.
     * @param {Number} tab_index - Tab index
     * @param {Boolean} state - True to show, false to hide
     */
    displayTab(tab_index, state){
        if(this.isValidTabIndex(tab_index)){
            let tab = this.elements.tabs.children[tab_index];
            Template.display(tab, state);
        }
    }

    /**
     * Hide all tabs.
     */
    hideTabs(){
        for(let i = 0; i < this.tab_count; i++){
            this.displayTab(i, false);
        }
    }

    /**
     * Go to a tab based on its index.
     * @param {Number} tab_index 
     */
    goToTab(tab_index){
        if(this.isValidTabIndex(tab_index)){
            this.hideTabs();
            this.displayTab(tab_index, true);
            this.tab = tab_index;
            this.elements.pager.setPage(tab_index + 1);
            this.emit("tab.show", tab_index);
        }
    }

    /**
     * Go to the first tab.
     */
    goToFirstTab(){
        this.goToTab(0);
    }

    /**
     * Go to the last tab.
     */
    goToLastTab(){
        this.goToTab(this.tab_count - 1);
    }

    /**
     * Go to the next tab.
     */
    goToNextTab(){
        if(this.tab < this.tab_count - 1){
            this.tab++;
            this.goToTab(this.tab);
        }
    }

    /**
     * Go to the previous tab.
     */
    goToPreviousTab(){
        if(this.tab > 0){
            this.tab--;
            this.goToTab(this.tab);
        }
    }

    /**
     * Attach handlers to the pager.
     */
    attachPagerHandlers(){
        this.elements.pager.on("next", () => {
            this.goToNextTab();
        });
        this.elements.pager.on("previous", () => {
            this.goToPreviousTab();
        });
        this.elements.pager.on("page", (page) => {
            this.goToTab(page - 1);
        });
    }

    /**
     * Attach handlers to the navs.
     */
    attachNavHandlers(){
        for(let i = 0; i < this.tab_count; i++){
            let nav = this.elements.navs.children[i];
            Template.on(nav, "click.wizard", () => {
                this.goToTab(i);
            });
        }
    }

    /**
     * Render the pager.
     */
    renderPager(){
        this.elements.pager.setPage(this.tab + 1);
        this.elements.pager.setPageCount(this.tab_count);
    }

    /**
     * Validate a tab by index.
     */
    validateTab(tabIndex){
        if(this.isValidTabIndex(tabIndex)){
        }
    }
}
customElements.define('template-wizard', WizardTemplate);