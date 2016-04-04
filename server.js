var express = require('express');
var bodyParser = require('body-parser');
var _ =require('underscore');
var db = require('./db.js')
var app = express();
var port = 3000;
var newTodoId = 4;
var todos = [{
    id: 1,
    description:"Meet dad for lunch",
    completed:false
},
{
    id: 2,
    description:"Go Grocery shopping",
    completed:false
},
{
    id: 3,
    description:"Clean The House",
    completed:true
}];

app.use(bodyParser.json());//this is like a filter which adds the json data to req.body

app.get('/', function(req, resp){
    resp.send('Todo API Root');
});

app.get('/todos',function(req, resp){
   // resp.json(todos);
    db.todo.findAll().then(function(todos){
        resp.json(todos);
    },function(e){
        resp.status(400).json(e);
    });
});

app.get('/todosByStatus',function(req, resp){
    var params = req.query;//returns a query params object
    var filteredTodos;
    //check if params has completed property
//     if(params.hasOwnProperty('completed')){
//        if(params.completed === 'true'){
//            filteredTodos = _.where(todos,{completed: true});
//        }
//         else if(params.completed === 'false'){
//             filteredTodos = _.where(todos,{completed: false});
//        }
//        else{
//            return resp.status(404).json({"error":"Invalid Expecting true or false"});
//        }
//         return resp.send(filteredTodos);
    if(params.hasOwnProperty('completed')){
        if(params.completed === 'true'){
            db.todo.findAll({
                where:{
                    completed : true
                }
            }).then(function(todos){
                if(todos){
                    resp.json(todos);
                }else{
                    resp.status(200).json({"error":" No todo items found with status "+params.completed});
                }
            });
        }    
        else if(params.completed === 'false'){
           db.todo.findAll({
                where:{
                    completed : false
                }
            }).then(function(todos){
                if(todos){
                    resp.json(todos);
                }else{
                    resp.status(200).json({"error":" No todo items found with status "+params.completed});
                }
            }); 
        }
        else{
            return resp.status(404).json({"error":"Invalid Expecting true or false"});
        }
    }
});

app.get('/todosByStatusContainingDesc',function(req, resp){
    var params = req.query;//returns a query params object
    var filteredTodos;
    //check if params has completed property
     if(params.hasOwnProperty('completed')){
        if(params.completed === 'true'){
            filteredTodos = _.filter(todos, function(todo){
                return todo.completed === true && todo.description.contains(params.q); 
            });
        }
         else if(params.completed === 'false'){
             filteredTodos = _.filter(todos,function(todo){
                return todo.completed === false && todo.description.indexOf(params.q) > -1;
             });
        }
        else{
            return resp.status(404).json({"error":"Invalid Expecting true or false"});
        }
         return resp.send(filteredTodos);
     }
});

app.get('/todos/:id',function(req,resp){
    //var matchedTodo;
//    todos.forEach(function(todoitem){
//        if(todoitem.id == req.params.id){
//            matchedTodo = todoitem;
//            //resp.json(todoitem);
//        }
//    });
   //var matchedTodo =  _.findWhere(todos,{id:parseInt(req.params.id,10)});
//    if(matchedTodo){
//        resp.json(matchedTodo);
//    }else{
//        resp.status(404).send();
//    }

    db.todo.findById(parseInt(req.params.id,10)).then(function(todo){
        if (todo){
            resp.json(todo.toJSON());
        }else{
             resp.status(200).json({"error":" No todo item found with id "+req.params.id});
        }
    });
 });

app.delete('/todos/:id',function(req,resp){
//    var matchedTodo =  _.findWhere(todos,{id:parseInt(req.params.id,10)});
//    if (matchedTodo){
//        todos = _.without(todos, matchedTodo);
//        console.log("After deleted todos is "+todos);
//        resp.send(todos);
//    }else{
//        resp.status(404).json({"error":" No todo item found with id "+req.params.id});
//    }
    db.todo.destroy({
        where :{
            id:parseInt(req.params.id,10)
        }
    }).then(function(){
        resp.status(200).send();
    },function(e){
        resp.status(400).json(e);
    });
});

app.post('/todos',function(req,resp){
    //console.log(req.body);
    var obj = _.pick(req.body,'id','description','completed');
    if(_.isString(obj.description) && _.isBoolean(obj.completed) && obj.description.trim().length > 0){
//         req.body.id = newTodoId;
          //
//        todos.push(obj);
//        newTodoId++;
        db.todo.create(obj).then(function(todo){
            console.log("Todo item registered in the database");
            resp.status(200).send(todo.toJSON());            
        },function(e){
           resp.status(400).json(e); 
        });
        
    }else{
        resp.status(400).send();
    }
   
});

app.put('/todos/:id',function(req,resp){
    var todoObj = req.body;
    var validObj = {};
//    var matchedTodo =  _.findWhere(todos,{id:parseInt(req.params.id,10)});
//    if (!matchedTodo){
//         return resp.status(404).json({"error":" No todo item found with id "+req.params.id});
//    }
    db.todo.findById(parseInt(req.params.id,10)).then(function(todo){
        if (todo){
            //resp.json(todo.toJSON());
            if (todoObj.hasOwnProperty('completed') && _.isBoolean(todoObj.completed)){
                validObj.completed = req.body.completed;
            }else if(todoObj.hasOwnProperty('completed')){
                return resp.status(404).json({"error":"Invalid format for completed"});
            }
            if (todoObj.hasOwnProperty('description') && _.isString(todoObj.description)){
                validObj.description = req.body.description;
            }else if(todoObj.hasOwnProperty('completed')){
                return resp.status(404).json({"error":"Invalid format for description"});
            }
            db.todo.update(validObj, {where:{id:parseInt(req.params.id,10)}}).then(function(){
               return resp.status(200).json("success", "Todo item updated successfully");
            },function(e){
                return resp.status(404).json(e);           
            });
            

        }else{
            resp.status(200).json({"error":" No todo item found with id "+req.params.id});
        }
    });

    //perform some validation for the updated object
//    if (todoObj.hasOwnProperty('completed') && _.isBoolean(todoObj.completed)){
//        validObj.completed = req.body.completed;
//    }else if(todoObj.hasOwnProperty('completed')){
//        return resp.status(404).json({"error":"Invalid format for completed"});
//    }
//    if (todoObj.hasOwnProperty('description') && _.isString(todoObj.description)){
//        validObj.description = req.body.description;
//    }else if(todoObj.hasOwnProperty('completed')){
//        return resp.status(404).json({"error":"Invalid format for description"});
//    }
//    _.extend(matchedTodo,validObj);        
//     return resp.status(200).json("success", "Todo item updated successfully");
});

db.sequelize.sync().then(function(){
    app.listen(port,function(){
        console.log("express listening on port 3000");
    });
});

