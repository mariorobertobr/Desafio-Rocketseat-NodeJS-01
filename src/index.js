const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsTodos(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const todoExists = user.todos.find((todo) => todo.id === id);
  if (todoExists) {
    next()
  }
  else {
    return response.status(404).json({ error: 'todo  not found' })
  }
}

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const user = users.find((user => user.username === username));

  if (!user) {
    return response.status(400).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' })
  }


  users.push(user)
  return response.status(201).json(user)
});

app.get('/users', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user)
});
app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;
  const { todos } = user;

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'todo not found' });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);



  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;


  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: 'todo not found' });
  }
  todo.done = true;


  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;



  const todoExists = user.todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "todo not found" })
  }

  user.todos.splice(todoExists, 1)
  return response.status(204).send()

});

module.exports = app;