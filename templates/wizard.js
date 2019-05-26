/**
 * Wizard Template
 * @extends {FormTemplate}
 */
class WizardTemplate extends FormTemplate {

    /**
     * Constructor
     * @param {object} options 
     * @return {WizardTemplate}
     */
    constructor(options){
        let defaults = {
            elements: {
				navs: '.wizard-navs',
                tabs: '.wizard-tabs',
                pager: 'template-pager'
            }
        };
        super(Object.extend(defaults, options));
        this.tabCount = 0;
        this.tab = 0;
        return this;
    }

    /**
     * Connected callback.
     * Count the tabs.
     * Set up the pager.
     * Attach handlers.
     * Go to the first tab.
     */
    connectedCallback(){
        super.connectedCallback();
        this.tabCount = this.elements.tabs.children.length;
        this.elements.pager.setPage(1);
        this.elements.pager.setPageCount(this.tabCount);
        this.attachNavHandlers();
        this.attachPagerHanders();
        this.goToFirstTab();
    }

    /**
     * Determine if a tab index is valid.
     * @param {number} index 
     * @return {boolean} true if it is, false otherwise
     */
    isValidTabIndex(index){
        return index > -1 && index < this.tabCount;
    }

    /**
     * Show or hide a tab by its index.
     * @param {number} tabIndex - tab index
     * @param {boolean} state - true to show, false to hide
     * @return {WizardTemplate}
     */
    displayTab(tabIndex, state){
        if(this.isValidTabIndex(tabIndex)){
            let tab = this.elements.tabs.children[tabIndex];
            Template.display(tab, state);
        }
        return this;
    }

    /**
     * Hide all tabs.
     * @return {WizardTemplate}
     */
    hideTabs(){
        for(let i = 0; i < this.tabCount; i++){
            this.displayTab(i, false);
        }
        return this;
    }

    /**
     * Go to a tab based on its index.
     * @param {number} tabIndex 
     * @return {WizardTemplate}
     */
    goToTab(tabIndex){
        if(this.isValidTabIndex(tabIndex)){
            this.hideTabs();
            this.displayTab(tabIndex, true);
            this.tab = tabIndex;
            this.elements.pager.setPage(tabIndex + 1);
        }
        return this;
    }

    /**
     * Go to the first tab.
     * @return {WizardTemplate}
     */
    goToFirstTab(){
        this.goToTab(0);
        return this;
    }

    /**
     * Go to the last tab.
     * @return {WizardTemplate}
     */
    goToLastTab(){
        this.goToTab(this.tabCount - 1);
        return this;
    }

    /**
     * Go to the next tab.
     * @return {WizardTemplate}
     */
    goToNextTab(){
        if(this.tab < this.tabCount - 1){
            this.tab++;
            this.goToTab(this.tab);
        }
        return this;
    }

    /**
     * Go to the previous tab.
     * @return {WizardTemplate}
     */
    goToPreviousTab(){
        if(this.tab > 0){
            this.tab--;
            this.goToTab(this.tab);
        }
        return this;
    }

    /**
     * Attach handlers to the pager.
     * @return {WizardTemplate}
     */
    attachPagerHanders(){
        let self = this;
        this.elements.pager.on("next", function(){
            self.goToNextTab();
        });
        this.elements.pager.on("previous", function(){
            self.goToPreviousTab();
        });
        this.elements.pager.on("page", function(page){
            self.goToTab(page - 1);
        });
    }

    /**
     * Attach handlers to the navs.
     * @return {WizardTemplate}
     */
    attachNavHandlers(){
        let self = this;
        for(let i = 0; i < this.tabCount; i++){
            let nav = this.elements.navs.children[i];
            Template.on(nav, "click.wizard", function(){
                self.goToTab(i);
            });
        }
        return this;
    }

    /**
     * Render the pager.
     * @return {WizardTemplate}
     */
    renderPager(){
        this.elements.pager.setPage(this.tab + 1);
        this.elements.pager.setPageCount(this.tabCount);
        return this;
    }

    /**
     * Validate a tab by index.
     * @return {WizardTemplate}
     */
    validateTab(tabIndex){
        if(this.isValidTabIndex(tabIndex)){
        }
        return this;
    }
}
customElements.define('template-wizard', WizardTemplate);