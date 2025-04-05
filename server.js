const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

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

// GET semua todo
app.get('/todos', (req, res) => {
    const data = readTodosFromFile();
    res.json(data);
});

// POST todo baru
app.post('/todos', (req, res) => {
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

// PUT update todo
app.put('/todos/:id', (req, res) => {
    const data = readTodosFromFile();
    const todo = data.find(t => t.id == req.params.id);
    if (todo) {
        todo.completed = req.body.completed;
        writeTodosToFile(data);
        res.json(todo);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
});

// DELETE todo
app.delete('/todos/:id', (req, res) => {
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