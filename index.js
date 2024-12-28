const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = 3000;

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tasks_db',
    password: '1234', // Replace with your actual PostgreSQL password
    port: 5432,
});

app.use(express.json());

// Temporary test route to verify database connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /tasks - Get all tasks from the database
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /tasks - Add a new task
app.post('/tasks', async (request, response) => {
    const { id, description, status } = request.body;

    // Validate input
    if (!id || !description || !status) {
        return response.status(400).json({ error: 'All fields (id, description, status) are required' });
    }

    try {
        // Insert into the database
        const query = 'INSERT INTO tasks (id, description, status) VALUES ($1, $2, $3)';
        await pool.query(query, [id, description, status]);

        response.status(201).json({ message: 'Task added successfully' });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;

    // Validate input
    if (!status) {
        return response.status(400).json({ error: 'Status is required' });
    }

    try {
        // Update the task's status in the database
        const query = 'UPDATE tasks SET status = $1 WHERE id = $2';
        const result = await pool.query(query, [status, taskId]);

        if (result.rowCount === 0) {
            return response.status(404).json({ error: 'Task not found' });
        }

        response.json({ message: 'Task updated successfully' });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);

    try {
        // Delete the task from the database
        const query = 'DELETE FROM tasks WHERE id = $1';
        const result = await pool.query(query, [taskId]);

        if (result.rowCount === 0) {
            return response.status(404).json({ error: 'Task not found' });
        }

        response.json({ message: 'Task deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
