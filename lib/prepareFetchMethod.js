var array = require('./utils/array');
//var isConnection = require('./isConnection')

/**
 * extent the crontroller with methods to fetch related data.
 */
module.exports = function prepareFetchMethod(db, dao, tableName, name, definition) {
    var addName = name[0].toUpperCase() + name.slice(1).toLowerCase();
    var fetchName = definition.fatchName || (name);

    var condition = definition.condition ? definition.condition : function() { return true };
    definition.mapTo.localField = definition.mapTo.localField || name;
    var foreignKey = (definition.mapTo.foreignKey || db.defaultPrimaryName);
    var getMethodName = 'getBy' + foreignKey[0].toUpperCase() + foreignKey.slice(1).toLowerCase();

    dao['fetch' + addName] = function(objs, order, page, pageSize, connection) {
        if (!Array.isArray(objs)) { objs = [objs]; }
        if (!objs.length) {
            return db.newPromise(function(resolve, reject) {
                resolve([]);
            });
        }
        var params = [];
        arguments = array.slice(arguments);
        arguments.shift(); //remove objs from arguments;
        var arg = arguments.shift();
        // while (arg != undefined && !isConnection(arg)) {
        //     params.push(arg);
        //     arg = arguments.shift();
        // }
        connection = arg;
        var objsByKey = {};
        var keys = objs.map(function(obj) {
            var key;
            if (typeof obj == 'string') {
                key = obj;
                obj = {};
                obj[name] = key;
            } else {
                key = obj[definition.mapTo.localField];
            }
            if (!objsByKey[key]) objsByKey[key] = [];
            objsByKey[key].push(obj);
            return key;
        });
        var foreignKey = (definition.mapTo.foreignKey || db.defaultPrimaryName);

        var promise;
        if (db.daos[definition.mapTo.tableName]) {
            promise = db.daos[definition.mapTo.tableName][getMethodName](keys, order, page, pageSize, connection);
        } else {
            throw new Error('no default fetch implemented, use related daos');
            //promise = db.queryPaged('SELECT * FROM ' + definition.mapTo.tableName + ' WHERE ' + foreignKey + ' IN (?)' + condition, [keys], order, page, pageSize, connection);
        }
        promise.then(function(list) {
            list.forEach(function(item) {
                var key = item[foreignKey];
                var objs = objsByKey[key];
                objs.forEach(function(obj) {
                    if (definition.mapTo.multiple) {
                        if (!obj[fetchName]) obj[fetchName] = [];
                        obj[fetchName].push(item);
                    } else {
                        obj[fetchName] = item;
                    }
                });
            });
            return list;
        });
        // var otherDao = db.daos[definition.mapTo.tableName];
        // if(otherDao) {
        //     promise = otherDao.promiseMap(promise); 
        // }
        return promise;
    }
}