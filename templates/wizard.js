/**
 * Wizard Template
 * @extends {FormTemplate}
 */
class WizardTemplate extends FormTemplate {

    /**
     * Constructor
     * @param {object} [options] 
     */
    constructor(options = {}){
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
     * @returns {boolean} true if it is, false otherwise
     */
    isValidTabIndex(index){
        return index > -1 && index < this.tabCount;
    }

    /**
     * Show or hide a tab by its index.
     * @param {number} tabIndex - tab index
     * @param {boolean} state - true to show, false to hide
     */
    displayTab(tabIndex, state){
        if(this.isValidTabIndex(tabIndex)){
            let tab = this.elements.tabs.children[tabIndex];
            Template.display(tab, state);
        }
    }

    /**
     * Hide all tabs.
     */
    hideTabs(){
        for(let i = 0; i < this.tabCount; i++){
            this.displayTab(i, false);
        }
    }

    /**
     * Go to a tab based on its index.
     * @param {number} tabIndex 
     */
    goToTab(tabIndex){
        if(this.isValidTabIndex(tabIndex)){
            this.hideTabs();
            this.displayTab(tabIndex, true);
            this.tab = tabIndex;
            this.elements.pager.setPage(tabIndex + 1);
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
        this.goToTab(this.tabCount - 1);
    }

    /**
     * Go to the next tab.
     */
    goToNextTab(){
        if(this.tab < this.tabCount - 1){
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
     */
    attachNavHandlers(){
        let self = this;
        for(let i = 0; i < this.tabCount; i++){
            let nav = this.elements.navs.children[i];
            Template.on(nav, "click.wizard", function(){
                self.goToTab(i);
            });
        }
    }

    /**
     * Render the pager.
     */
    renderPager(){
        this.elements.pager.setPage(this.tab + 1);
        this.elements.pager.setPageCount(this.tabCount);
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