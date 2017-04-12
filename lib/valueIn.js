/**
 * 
 * 
 * @param {string} fieldName
 * @returns
 */
module.exports = function valueIn(fieldName) {
    /**
     * 
     * @param {any} values
     * @returns
     */
    function filterCreator(values) {
        if (!Array.isArray(values)) values = [values];

        /**
         * the filter function
         * 
         * @param {object} object
         * @returns
         */
        function filter(object) {
            return values.indexOf(object[fieldName]) !== -1;
        }
        return filter;
    }
    return filterCreator;
}