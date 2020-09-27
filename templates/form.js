/**
 * Form Template
 * @extends {Template}
 */
class FormTemplate extends Template {

    /**
     * Constructor
     * @param {Object} [params] 
     * @param {Function} [params.get_request] - Function to call when 
     * submitting the form
     * @param {Function} [params.submit_request] - Function to call to load 
     * data and populate the form
     * @param {Function} [params.validate_request] - Function to call to 
     * validate the form's input data
     * @param {Number} [params.checkbox_mode] - How to serialize checkboxes
     * @param {Number} [params.serialize_mode] - How to serialize inputs
     * @param {String[]} [params.excluded_fields=["disabled"]] - Field names to
     *  exclude from serialization
     * @param {Object} [params.elements]
     * @param {String} [params.elements.form="form"]
     * @param {String} [params.elements.header=".form-header"]
     * @param {String} [params.elements.body=".form-body"]
     * @param {String} [params.elements.footer=".form-footer"]
     * @param {String} [params.elements.reset="[type='reset']"]
     * @param {String} [params.elements.submit="[type='submit']"]
     */
    constructor({
        get_request = null,
        submit_request = null,
        validate_request = null,
        checkbox_mode = FormTemplate.checkbox_mode.number,
        serialize_mode = FormTemplate.serialize_mode.to_object,
        excluded_fields = ['disabled'],
        elements = {
            form: 'form',
            header: '.form-header',
            body: '.form-body',
            footer: '.form-footer',
            reset: '[type="reset"]',
            submit: '[type="submit"]'
        }
    } = {})
    {
        super({elements});

        /**
         * Function to call when submitting the form.
         * @type {Function}
         */
        this.get_request = get_request;

        /**
         * Function to call to load data and populate the form.
         * @type {Function}
         */
        this.submit_request = submit_request;

        /**
         * Function to call to validate the form's input data.
         * @type {Function}
         */
        this.validate_request = validate_request;

        /**
         * How to serialize checkboxes.
         * @type {FormTemplate.checkbox_mode}
         */
        this.checkbox_mode = checkbox_mode;

        /**
         * How to serialize inputs.
         * @type {FormTemplate.serialize_mode}
         */
        this.serialize_mode = serialize_mode;

        /**
         * Field names to exclude from serialization
         * @type {String[]}
         */
        this.excluded_fields = excluded_fields;

        /**
         * Raw serialized data. Each key is an input name.
         * @type {Object}
         */
        this.serialized_data = {};

        /**
         * Formatted serialized data.
         * @type {Object|String}
         */
        this.formatted_serialized_data = null;
    }

    /**
     * Attach button handlers.
     */
    onConnected(){
        this.attachFormHandlers();
    }

    /**
     * Create the inner html
     * @returns {String}
     */
    createHtml(){
        return `<form>
                    <div class="form-header"></div>
                    <div class="form-body"></div>
                    <div class="form-footer">
                        <button type="reset">Reset</button>
                        <button type="submit">Submit</button>
                    </div>
                </form>`;
    }

    /**
     * Attach handlers to the default form events.
     */
    attachFormHandlers(){
        this.elements.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.submit();
        });
        this.elements.form.addEventListener('reset', (event) => {
            event.preventDefault();
            this.reload();
        });
    }

    /**
     * Toggle the display of the footer.
     * @param {Boolean} state
     */
    displayFooter(state){
        Template.display(this.elements.footer, state);
    }

    /**
     * Set the form submit function.
     * @param {Function} func
     */
    setSubmitRequest(func){
        this.submit_request = func;
    }

    /**
     * Set the form get data function.
     * @param {Function} func
     */
    setGetRequest(func){
        this.get_request = func;
    }

    /**
     * Set the form validate function.
     * @param {Function} func
     */
    setValidateRequest(func){
        this.validate_request = func;
    }

    /**
     * Reset the form
     */
    reset(){
        this.elements.form.reset();
    }

    /**
     * Reload the form.
     */
    reload(){
        if(!Object.isEmpty(this.cached_data)){
            this.render(this.cached_data);
        }
        else {
            this.reset();
        }
    }

    /**
     * Validate the form.
     * @returns {Boolean}
     */
    validate(){
        return true;
    }

    /**
     * Convert a checkbox into a boolean, string, or number.
     * @param {HTMLElement} checkbox 
     * @param {Number} mode 
     * @returns {Boolean|String|Number}
     */
    convertCheckbox(checkbox, mode){
		let checked = checkbox.checked
		switch(mode){
			case FormTemplate.checkbox_mode.boolean:
                return checked;
			case FormTemplate.checkbox_mode.string:
				return checked ? '1' : '0';
			case FormTemplate.checkbox_mode.on_off:
				return checked ? 'on' : 'off';
            default:
            case FormTemplate.checkbox_mode.number:
                return checked ? 1 : 0;
		}
    }
    
    /**
     * Determine if a field is not excluded
     * @param {String} field 
     * @returns {Boolean}
     */
    isNotExcluded(field){
        for(let i = 0; i < this.excluded_fields.length; i++){
            let attribute = this.excluded_fields[i];
            if(attribute === "disabled"){
                if(field.hasAttribute("disabled")){
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Serialize the form 
     * @returns {Object}
     */
    serialize(){
        this.serialized_data = {};
        
        let inputs = Array.from(this.getElementsByTagName('input'));
        let selects = Array.from(this.getElementsByTagName('select'));
        let textareas = Array.from(this.getElementsByTagName('textarea'));
        let all = inputs.concat(selects, textareas);
        for (let i = 0; i < all.length; i++) {
            if(this.isNotExcluded(all[i])){
                this.serializeInput(all[i]);
            }
        }

        return this.serialized_data;
    }

    /**
     * Serialize an input
     * @param {HTMLElement} input 
     * @returns {Object}
     */
    serializeInput(input){
        let name = input.getAttribute('name');
        let type = input.getAttribute('type');
        let val = null;
        switch(type){
            case 'checkbox':
                val = this.convertCheckbox(input, this.checkbox_mode);
                break;
            case 'radio':
                if(input.checked){
                    val = input.value;
                }
                // Need to return here to prevent empty radios from setting data
                else {
                    return null;
                }
                break;
            case 'file':
                if (input.files.length > 0) {
                    val = input.files[0];
                }
                break;
            case 'number':
                val = Number(input.value);
                break;
            default:
                val = input.value;
                break;
        }

        return this.serialized_data[name] = val;
    }

    /**
     * Serialize a textarea
     * @param {HTMLElement} input 
     * @returns {Object}
     */
    serializeTextarea(textarea){
        return this.serializeSelect(textarea);        
    }

    /**
     * Serialize a select
     * @param {HTMLElement} input 
     * @returns {Object}
     */
    serializeSelect(select){
        let name = select.getAttribute('name');
        return this.serialized_data[name] = select.value;
    }

    /**
     * Format the already serialized data
     * into a string or an object
     * @param {Object} data 
     * @param {Number} mode
     * @returns {String|object}
     */
    formatSerializedData(data, mode){
		switch(mode){
			case FormTemplate.serialize_mode.to_string:
				return this.serializedDataToString(data);
            default:
            case FormTemplate.serialize_mode.to_object:
                this.serialized_data = Object.unflatten(this.serialized_data);
                return this.serialized_data;
		}
    }

    /**
     * Serialize data into a string
     * @param {Object} data 
     * @returns {String}
     */
	serializedDataToString(data){
		let str = "";
		let c = 0;
		let len = Object.keys(data).length;
		for(let k in data){
			str += k + "=" + data[k];
			if(c++ < len - 1){
                str += "&";
            }
		}
		return str;
	}

    /**
     * Submit the form. Serialize data and pass the data to the submit_request
     * function.
     * @returns {Promise}
     */
    async submit(){
        this.serialized_data = this.serialize();
        this.formatted_serialized_data = this.formatSerializedData(
            this.serialized_data, 
            this.serialize_mode
        );
        try {
            let response = await this.submit_request(
                this.formatted_serialized_data
            );
            if(response.status && response.status === 200){
                this.emit('success', response.body);
            }
            else {
                this.emit('fail', response.body);
            }
        }
        catch(error){
            this.emit('error', error);
        }
    }
}

/**
 * Modes to serialize a checkbox
 * @type {Object}
 */
FormTemplate.checkbox_mode = {
	boolean : 0,
	number : 1,
	string : 2,
	on_off : 3
};

/**
 * Modes to serialize inputs
 * @type {Object}
 */
FormTemplate.serialize_mode = {
	to_string : 0,
	to_ordered_string : 1,
	to_object : 2,
	to_value : 3
};
customElements.define('template-form', FormTemplate);