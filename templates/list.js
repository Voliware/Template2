/**
 * Displays items in a list with horizontal or vertical scrolling
 * @extends {Template}
 */
class ListTemplate extends Template {

    /**
     * Constructor
     * @param {Object} params
     * @param {String} [params.direction="horizontal"] - Horizontal or vertical
     * @param {HTMLLIElement|Template} params.item_template - A cloneable HTMLElement
     * to populate the list with
     */
    constructor({
        direction = "horizontal",
        item_template = null,
        elements = {
            next: '.list-next',
            previous: '.list-previous',
            list: '.list-items'
        }
    } = {})
    {
        super({elements});

        // This template simply cannot work without a cloneable HTMLElement
        if(!(item_template instanceof HTMLElement)){
            throw new Error("item_template must be an HTMLElement");
        }

        /**
         * Which way the arrows display and the items move
         * "horizontal" - arrows are on the left/right, items move left/right
         * "vertical" - arrows on the top/bottom, items moves up/down
         * @type {String}
         */
        this.direction = direction.toLowerCase();

        /**
         * The list item template
         * @type {HTMLElement|Template}
         */
        this.item_template = item_template;

        /**
         * Item element manager
         * @type {ElementManager}
         */
        this.items = new ElementManager({template: this.item_template});
    }

    /**
     * Attach button handlers.
     */
    onConnected(){
        this.items.appendTo(this.elements.list);
        this.attachButtonHandlers();
    }

    /**
     * Attach button handlers
     */
    attachButtonHandlers(){
        this.elements.next.addEventListener('click', () => {
            this.next();
        });
        this.elements.previous.addEventListener('click', () => {
            this.previous();
        });
    }

    /**
     * Go to the next item
     */
    next(){

    }
    
    /**
     * Go to the previous item
     */
    previous(){

    }

    /**
     * Go to a specific item
     */
    goTo(){

    }
}

customElements.define('template-list', ListTemplate);