var tdao = require('../index', { format: function(data) { return JSON.stringify(data, null, '  '); } });

var db = tdao({ path: __dirname + '/testdb.json' });

var userDao = db.prepareDao({
    tableName: 'users',
    fields: {
        id: { type: 'INT AUTO_INCREMENT', primary: true },
        name: { type: 'varchar(30)' },
        mail: { type: 'varchar(255)' },
        password: { type: 'char(34)' },
        registered: { type: 'INT' }
    },
    has: {
        images: { tableName: 'images', foreignKey: 'owner', localField: 'id', multiple: true },
    },
    // conditionals: {
    //     new: { condition: 'TO_DAYS(registered) > (TO_DAYS(NOW())-10)', multiple: true } // to provide a getNew method that return the users registered in the last 10 days
    // },
    // queries: {
    //     withoutPicture: 'SELECT * FROM users WHERE id NOT IN (SELECT distinct owner FROM images)',
    //     byPassword: 'SELECT * FROM users WHERE password = ?'
    // }
});
var imageDao = db.prepareDao({
    tableName: 'images',
    fields: {
        id: { type: 'INT AUTO_INCREMENT', primary: true },
        name: { type: 'varchar(30)' },
        path: { type: 'varchar(255)' },
        owner: { type: 'int', mapTo: { tableName: 'users', foreignKey: 'id' } },
        uploadTime: { type: 'datetime' }
    },
    has: {
        likes: { tableName: 'likes', foreignKey: 'image', localField: 'id', multiple: false },
    },
    // conditionals: {
    //     newest: { condition: 'not exists (SELECT * from images as i where i.uploadTime>uploadTime )', multiple: false },
    //     new: { condition: 'TO_DAYS(uploadTime) > (TO_DAYS(NOW())-10)', multiple: true } // to provide a getNew method that return the users registered in the last 10 days
    // }
});
var likeDao = db.prepareDao({
    tableName: 'likes',
    fields: {
        user: { type: 'INT', primary: true, mapTo: { tableName: 'users', foreignKey: 'id' } },
        image: { type: 'INT', primary: true, mapTo: { tableName: 'images', foreignKey: 'id' } },
        time: { type: 'datetime' }
    },
    // conditionals: {
    //     new: { condition: 'TO_DAYS(time) > (TO_DAYS(NOW())-10)' } // to provide a getNew method that return the users registered in the last 10 days
    // }
});

db.logQueries = false;

console.log('prepare dao: DONE');
var users = null;
var objs = null;

likeDao.dropTable()
    .then(function(newImages) {
        return userDao.dropTable();
    })
    .then(function(images) {
        return imageDao.dropTable();
    })
    .then(function(images) {
        return userDao.createTable();
    })
    .then(function() {
        console.log('createTable: DONE')
        return imageDao.createTable();
    })
    .then(function() {
        return likeDao.createTable();
    })
    .then(function() {
        console.log('createTable: DONE')
        return userDao.insert({ name: 'tobias', mail: 'business@tnickel.de', password: 'kvckxchlksjfhliu', registered: 1 });
    })
    .then(function() {
        console.log('insert object: DONE')
        return likeDao.insert({ user: 0, image: 0, time: new Date() });
    })
    .then(function() {
        console.log('insert object: DONE')
        return userDao.getAll();
    })
    .then(function(_users) {
        users = _users;
        var user1 = users[0];
        console.log(db.db.getState())
        return imageDao.insert({ name: 'superman.jpg', path: 'images/1/superman.jpg', owner: user1.id, uploadTime: new Date() })
    })
    .then(function() {
        users[0].name = 'Tobias';
        return userDao.save(users[0])
    })
    .then(function() {
        return likeDao.fetchImage(users[0])
    })
    .then(function() {
        return userDao.saveOne(users[0])
    })
    .then(function() {
        return userDao.getOneById(0)
    })
    .then(function() {
        return userDao.findWhere({ id: 0 })
    })
    .then(function() {
        return userDao.getById(0)
    })
    .then(function() {
        console.log('get all object: DONE');
        return userDao.fetchImages(users);
    })
    .then(function(_users) {
        return userDao.fetchImages('0', 'some param', 'second useless param');
    })
    .then(function() {
        return userDao.fetchImages([]);
    })
    // .then(function() {
    //     console.log('get all object: DONE');
    //     return imageDao.getNewest();
    // })
    // .then(function() {
    //     console.log('get all object: DONE');
    //     return imageDao.getNew();
    // })
    .then(function(newImages) {
        //console.log('load conditional Images: DONE', newImages.length == 1);
        //console.log(JSON.stringify(users,null,'  '))
        return imageDao.remove(newImages);
    })
    .then(function() {
        return imageDao.removeById(4);
    })
    .then(function(connection) {
        return likeDao.remove({ user: 0, image: 0 });
    })
    // .then(function(connection) {
    //     return db.save('usas', 'id', { name: 'unchanges' }).catch(function(err) {
    //         console.log('catched Error: DONE')
    //     });
    // })
    // .then(function(connection) {
    //     //selectPaged: function (sql, values, page, pagesize, connection)
    //     return db.selectPaged('SELECT * FROM usas', 0, 1).catch(function(err) {
    //         console.log('catched Error: DONE')
    //     });
    // })
    .then(function(newImages) {
        return imageDao.findOneWhere({ name: 'superman.jpg' });
    })
    // .then(function(newImages) {
    //     return userDao.withoutPicture();
    // })
    // .then(function(newImages) {
    //     return userDao.withoutPicture(0, 2);
    // })
    .then(function(newImages) {
        return userDao.set({ registered: 1 }, [1]);
    })
    .then(function(newImages) {
        return likeDao.set({ time: 1 }, { user: 1, image: 1 });
    })
    .then(function(newImages) {
        return userDao.dropTable();
    })
    .then(function(images) {
        return imageDao.dropTable();
    })
    .then(function(images) {
        return likeDao.dropTable()
            .then(function() {
                //require('./arrayTest')();
                //require('./countMysqlParameterTest')();
                //require('./isConnectionTest')();
                // return require('./prepareFetchMethodTest')()
                //     .then(function() {
                //         process.exit()
                //     });
            });
    })
    .catch(function(err) {
        console.log('failed:', err, err.stack);
    });