/**
 * Get a set of matching elements by data-name attribute
 * @param {string} dataname - the data-name attribute value
 * @return {HTMLElement[]}
 */
document.getElementsByDataName = function(dataName){
    return document.querySelectorAll(`[data-name="${dataName}"]`);
};

/**
 * Get the first matching element by data-name attribute
 * @param {string} dataname - the data-name attribute value
 * @return {HTMLElement}
 */
document.getElementByDataName = function(dataName){
    let elements = document.getElementsByDataName(dataName);
    if(elements.length){
        return elements[0];
    }
    return null;
};