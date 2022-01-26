const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((item) => item.username === username);

  if (!user) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const [userAlreadyExists] = users.filter(
    (item) => item.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json({ success: "Todo created successfully!" });
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    create_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(200).json({ success: "Todo created successfully!" });
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((item) => item.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Mensagem de erro" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(204).json({ todo });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((item) => item.id === id);

  if (!todo) {
    return response.status(401).json({ error: "Todo not found!" });
  }

  todo.done = true;

  return response.status(201).json({ todo });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((item) => item.id === id);

  if (!todo) {
    return response.status(401).json({ error: "Todo not found!" });
  }

  user.todos.splice(todo, 1);

  return response.status(201).json({ user: user.todos });
});

module.exports = app;
