module.exports = {
    isArray: isArray,
    isEmptyArray: isEmptyArray,
    containsEmptyArray: containsEmptyArray,
    containsArray: containsArray,
    last: last,
    slice: slice,
    isStringArray: isStringArray,
    isNumberArray: isNumberArray,
    isObjectArray: isObjectArray
};

/**
 * test of object is an array
 * 
 * @param {any} obj
 * @returns
 */
function isArray(obj) {
    return Array.isArray(obj);
};

/**
 * test if object is an empry array
 * 
 * @param {any} obj
 * @returns

 */
function isEmptyArray(obj) {
    return isArray(obj) && obj.length == 0;
};

/**
 * test of an array contains empty arrays
 * 
 * @param {*[]} arr
 * @returns
 */
function containsEmptyArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (isEmptyArray(arr[i])) return true;
    }
    return false;
};

/**
 * 
 * 
 * @param {*[]} arr
 * @returns
 */
function containsArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (isArray(arr[i])) return true;
    }
    return false;
};

/**
 * return the last item
 * 
 * @param {*[]} arr
 * @returns
 */
function last(arr) {
    return arr[arr.length - 1];
};
/**
 * copy the array
 * 
 * @param {any} args
 * @returns
 */
function slice(args) {
    return Array.prototype.slice.apply(args);
};

/**
 * test of the array only contains strings
 * 
 * @param {*[]} arr
 * @returns
 */
function isStringArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== 'string') return false;
    }
    return true;
};

/**
 * test of the array only contains numbers
 * 
 * @param {*[]} arr
 * @returns
 */
function isNumberArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== 'number') return false;
    }
    return true;
};

/**
 * test of the array only contains objects
 * 
 * @param {*[]} arr
 * @returns
 */
function isObjectArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== 'object') return false;
    }
    return true;
};