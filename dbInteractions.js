var Sequelize = require('sequelize');
//var sequelize = new Sequelize('database', 'username', 'password');
var sequelize = new Sequelize(undefined, undefined, undefined,
    {
     dialect : 'sqlite',
     storage : __dirname + '/todo-database.sqlite'
    }
);

var Todo = sequelize.define('Todo',{
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
        
    }
});
//force:true recreates the in memory database everytime
sequelize.sync({force:false}).then(function(){
//    Todo.create({
//        description: 'Meet Dad for Lunch',
//        completed: true       
//    }).then(function(todo){
//        console.log('Completed');
//        console.log(todo);
//    }).catch(function(e){
//        console.log(e);
//    })
    //return Todo.findById(1).then(function(todo){
        //if(todo)
      //  console.log(todo.toJSON());
    //});
    return Todo.findAll({
        description :{
            $like : '%Meet%'
        }
    }).then(function(todos){
        todos.forEach(function(todo){
            console.log(todo.toJSON());
        });
    });
    
});