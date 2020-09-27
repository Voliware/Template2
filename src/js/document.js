/**
 * Get a set of matching elements by data-name attribute
 * @param {String} data_name - the data-name attribute value
 * @returns {HTMLElement[]}
 */
document.getElementsByDataName = function(data_name){
    return document.querySelectorAll(`[data-name="${data_name}"]`);
};

/**
 * Get the first matching element by data-name attribute
 * @param {String} data_name - the data-name attribute value
 * @returns {HTMLElement}
 */
document.getElementByDataName = function(data_name){
    let elements = document.getElementsByDataName(data_name);
    if(elements.length){
        return elements[0];
    }
    return null;
};