var Sequelize = require('sequelize');
var sequelize = new Sequelize('javatraining','root','',
    {
        host:'localhost',
        port:'3306',
        dialect: 'mysql'
    }
);