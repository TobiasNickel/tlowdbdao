const low = require('lowdb');
const newPromise = require('./lib/newPromise');
const first = require('./lib/promiseFirst');
const prepareFetchMethod = require('./lib/prepareFetchMethod');
const valueIn = require('./lib/valueIn');
//var prepareConditionalMethod = require('./lib/prepareConditionalMethod');

module.exports = function(params) {
    var db = low(params.path);

    const database = {
        db: db,
        daos: params.daos || {},
        defaultPrimaryName: 'id',

        newPromise: params.newPromise || newPromise,

        getBy: function(tableName, fieldName, value /*, order */ ) {
            if (!Array.isArray(value)) value = [value];
            const filter = {};
            filter[fieldName] = value;
            return Promise.resolve(clone(database.db.get(tableName).filter(function(item) {
                return value.indexOf(item[fieldName]) !== -1;
            }).value()));
        },

        getOneBy: function(tableName, fieldName, value /*, order */ ) {
            return first(database.getBy(tableName, fieldName, value));
        },

        where: function(tableName, obj, page, pageSize) {
            if (!pageSize) pageSize = 10;
            var collection = database.db.get(tableName);
            var result = collection.filter(obj);
            if (page) {
                collection.slice(page * pageSize, page * pageSize + pageSize)
            }
            return Promise.resolve(clone(collection.value()));
        },

        remove: function() {},

        createTable: function() {},

        /**
         * @param {object} dao
         */
        prepareDao: function(dao) {
            var tableName = dao.tableName;
            database.daos[dao.tableName] = dao;

            var IDKeys = [];

            if (typeof dao.map !== 'function') {
                dao.map = function(item) { return item; };
            }
            if (typeof dao.inputMap !== 'function') {
                dao.inputMap = function(item) { return item; };
            }
            dao.inputMapAll = function(items) {
                if (Array.isArray(items)) {
                    return items.map(function(item) {
                        return dao.inputMap(item)
                    });
                } else {
                    return dao.inputMap(items);
                }
            }

            dao.promiseMap = function(p) {
                return p.then(function(items) {
                    if (typeof items !== 'object') return items;
                    if (Array.isArray(items)) {
                        var res = items.map(dao.map);
                        res.resultCount = items.resultCount;
                        res.pageCount = items.pageCount;
                        return res;
                    } else {
                        //one item
                        return dao.map(items)
                    }
                });
            };

            dao.insert = function(object) {
                console.assert(typeof object === 'object', 'object need to be an object')
                console.log('insert', object);
                var copy = clone(object);
                for (var i in copy) {
                    if (typeof copy[i] == 'object') {
                        delete copy[i];
                    }
                }
                database.db.get(tableName).push(copy).write();
                return Promise.resolve();
            };

            dao.save = function(objs, connection) {
                if (!Array.isArray(objs)) objs = [objs];
                var tasks = objs.map(obj => dao.saveOne(obj));
                return Promise.all(tasks);
            };
            dao.saveOne = function(obj) {
                var search = {};
                var copy = JSON.parse(JSON.stringify(obj));
                for (var i in copy) {
                    if (typeof copy[i] == 'object') {
                        delete copy[i];
                    }
                }
                IDKeys.forEach(function(key) {
                    search[key] = obj[key];
                });
                database.db.get('posts')
                    .find(search)
                    .assign(obj)
                    .write();
                return Promise.resolve();
            }


            dao.set = function(update, objs) { return Promise.resolve(); }

            dao.getAll = function() {
                var all = database.db.get(tableName).value() || [];
                console.log('getAll', all)
                return Promise.resolve(clone(all));
            }
            dao.findWhere = function(obj, page, pageSize) {
                var promise = database.where(tableName, obj, page, pageSize);
                return dao.promiseMap(promise);
            };
            dao.findOneWhere = function(obj, page, pageSize) {
                var promise = database.where(tableName, obj);
                return dao.promiseMap(promise);
            };
            dao.where = function(where, params, page, pageSize, connection) {
                var promise = database.db.where(tableName, where, params, page, pageSize, connection).value();
                return dao.promiseMap(promise);
            };
            dao.oneWhere = function(where, params, page, pageSize, connection) {
                var promise = database.db.where(tableName, where, params, page, pageSize, connection);
                return dao.promiseMap(promise);
            };
            dao.remove = function(obj, connection) {
                return database.remove(tableName, IDKeys, obj, connection);
                //this.db.resolve();
            };
            dao.dropTable = function() { return Promise.resolve(); };
            dao.createTable = function() {
                //todo, if not exists
                console.log('create table', tableName)
                database.db.set(tableName, []).write();
                return Promise.resolve();
            };
            var fieldNames = Object.keys(dao.fields);
            fieldNames.forEach(function(name) {

                var filterCreator = valueIn(name);

                var definition = dao.fields[name];
                var addName = name[0].toUpperCase() + name.slice(1).toLowerCase();

                dao['getBy' + addName] = function(value /*, page, pageSize, connection*/ ) {
                    var valueFilter = filterCreator(value);
                    var result = database.db.get(tableName).filter(valueFilter).value();
                    var promise = Promise.resolve(clone(result));
                    //var promise = this.db.getBy(tableName, name, value, page, pageSize, connection);
                    return promise; //dao.promiseMap(promise);
                };

                dao['getOneBy' + addName] = function(value) {
                    var valueFilter = filterCreator(value);
                    return first(this['getBy' + addName](clone(value)));
                };

                dao['removeBy' + addName] = function(value, connection) {
                    var valueFilter = filterCreator(value);
                    database.db.remove(not(valueFilter)).write();
                    return Promise.resolve();
                    //return this.db.remove(tableName, name, value, connection);
                };
                if (definition.mapTo) {
                    prepareFetchMethod(database, dao, tableName, name, definition);
                }
                if (definition.primary) { IDKeys.push(name); }
            });
            if (dao.has) {
                for (var name in dao.has) {
                    prepareFetchMethod(database, dao, tableName, name, { mapTo: dao.has[name] });
                }
            }
            // if (dao.conditionals) {
            //     for (var name in dao.conditionals) {
            //         prepareConditionalMethod(database, dao, tableName, name, dao.conditionals[name]);
            //     }
            // }

            return dao;
        }
    };

    return database;
}

function not(f) {
    return function(v) {
        return !f(v)
    }
}

function clone(data) {
    return JSON.parse(JSON.stringify(data))
}