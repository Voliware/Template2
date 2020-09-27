/**
 * Popup Template
 * @extends {Template}
 */
class PopupTemplate extends Template {

    /**
     * Constructor
     * @param {Object} [params={}] 
     * @param {Boolean} [params.show_header=true]
     * @param {Boolean} [params.show_close=true]
     * @param {Boolean} [params.show_footer=true]
     * @param {Object} [params.elements]
     * @param {String} [params.elements.header=".popup-header"]
     * @param {String} [params.elements.title=".popup-title"]
     * @param {String} [params.elements.close=".template-popupcloseBtn"]
     * @param {String} [params.elements.body=".popup-body"]
     * @param {String} [params.elements.footer=".popup-footer"]
     */
    constructor({
        display_block = false,
        show_header = true,
        show_close = true,
        show_footer = true,
        elements = {
            header: '.popup-header',
            title: '.popup-title',
            close: '.popup-close',
            body: '.popup-body',
            footer: '.popup-footer'
        }
    } = {})
    {
        super({display_block, elements});

        /**
         * Whether to show the header
         * @type {Boolean}
         */
        this.show_header = show_header;

        /**
         * Whether to show the close button
         * @type {Boolean}
         */
        this.show_close = show_close;

        /**
         * Whether to show the footer
         * @type {Boolean}
         */
        this.show_footer = show_footer;
    }

    /**
     * Attach button handlers.
     */
    onConnected(){
        this.applyOptions();
        this.attachButtonHandlers();
    }

    /**
     * Create the inner html
     * @returns {String}
     */
    createHtml(){
        return `<div class="popup-content">
                    <div class="popup-header">
                        <div class="popup-title"></div>
                        <button type="button" class="btn-none popup-close">X</button>
                    </div>
                    <div class="popup-body"></div>
                    <div class="popup-footer"></div>
                </div>`;
    }

    /**
     * Attach button handlers
     */
    attachButtonHandlers(){
        this.elements.close.addEventListener('click', (e) => {
            this.close();
        });
    }

    /**
     * Apply params to the PopupTemplate
     */
    applyOptions(){
        if(!this.show_header && this.elements.header){
            this.elements.header.remove();
        }
        if(!this.show_close && this.elements.close){
            this.elements.close.remove();
        }
        if(!this.show_footer && this.elements.footer){
            this.elements.footer.remove();
        }
    }

    /**
     * Open the popup by adding the 'popup-open' class.
     * Fade in the PopupTemplate.
     */
    open(){
        document.body.classList.add('popup-open');
        this.show();
    }

    /**
     * Close the popup by removing the 'popup-open' class
     * Fadeout in the PopupTemplate.
     */
    close(){
        document.body.classList.remove('popup-open');
        this.hide();
    }

    /**
     * Render the title
     * @param {String} html 
     */
    renderTitle(html){
        this.elements.title.innerHTML = html;
    }

    /**
     * Render the body
     * @param {String} html 
     */
    renderBody(html){
        this.elements.body.innerHTML = html;
    }

    /**
     * Render the footer
     * @param {String} html 
     */
    renderFooter(html){
        this.elements.footer.innerHTML = html;
    }
}
customElements.define('template-popup', PopupTemplate);