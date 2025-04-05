const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // biar bisa akses todos.html, style.css, dll

const todosFile = './data/todos.json';

// Fungsi untuk membaca data dari file
const readTodosFromFile = () => {
  try {
    const data = fs.readFileSync(todosFile);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading todos file:', error);
    return [];
  }
};

// Fungsi untuk menulis data ke file
const writeTodosToFile = (data) => {
  try {
    fs.writeFileSync(todosFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to todos file:', error);
  }
};

// Serve halaman tampilan todo
app.get('/todos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'todos.html'));
});

// API: Ambil semua todos
app.get('/api/todos', (req, res) => {
  const data = readTodosFromFile();
  res.json(data);
});

// API: Tambah todo baru
app.post('/api/todos', (req, res) => {
  const data = readTodosFromFile();
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
  };
  data.push(newTodo);
  writeTodosToFile(data);
  res.status(201).json(newTodo);
});

// API: Update todo
app.put('/api/todos/:id', (req, res) => {
  const data = readTodosFromFile();
  const todo = data.find(t => t.id == req.params.id);
  if (todo) {
    todo.completed = req.body.completed;
    todo.text = req.body.text || todo.text;
    writeTodosToFile(data);
    res.json(todo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

// API: Hapus todo
app.delete('/api/todos/:id', (req, res) => {
  let data = readTodosFromFile();
  const initialLength = data.length;
  data = data.filter(t => t.id != req.params.id);
  if (data.length < initialLength) {
    writeTodosToFile(data);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

// Mulai server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
