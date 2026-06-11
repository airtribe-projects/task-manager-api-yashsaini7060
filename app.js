const express = require('express');
const app = express();
const port = 3000;
const data = require('./task.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PRIORITY_LEVELS = ['low', 'medium', 'high'];

let tasks = data.tasks.map((task, index) => ({
    ...task,
    priority: PRIORITY_LEVELS.includes(task.priority) ? task.priority : 'medium',
    createdAt: task.createdAt || new Date(Date.now() - (data.tasks.length - index) * 1000).toISOString(),
}));

const isValidPriority = (priority) => PRIORITY_LEVELS.includes(priority);

const isValidTask = (body) => {
    const { title, description, completed, priority } = body;
    return (
        typeof title === 'string' && title.trim() !== '' &&
        typeof description === 'string' && description.trim() !== '' &&
        typeof completed === 'boolean' &&
        (priority === undefined || isValidPriority(priority))
    );
};

if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}

app.get('/tasks', (req, res) => {
    try {
        const { completed, sort } = req.query;
        let result = [...tasks];

        if (completed !== undefined) {
            if (completed !== 'true' && completed !== 'false') {
                return res.status(400).json({ message: 'Invalid completed value, must be true or false' });
            }
            const isCompleted = completed === 'true';
            result = result.filter(task => task.completed === isCompleted);
        }

        if (sort !== undefined) {
            if (sort !== 'asc' && sort !== 'desc') {
                return res.status(400).json({ message: 'Invalid sort value, must be asc or desc' });
            }
            result = result.sort((a, b) => {
                const diff = new Date(a.createdAt) - new Date(b.createdAt);
                return sort === 'asc' ? diff : -diff;
            });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/tasks/priority/:level', (req, res) => {
    try {
        const level = req.params.level;
        if (!isValidPriority(level)) {
            return res.status(400).json({ message: 'Invalid priority level. Must be one of: low, medium, high' });
        }
        const filteredTasks = tasks.filter(task => task.priority === level);
        res.status(200).json(filteredTasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/tasks/:id', (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const foundTask = tasks.find(task => task.id === taskId);
        if (!foundTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(foundTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/tasks', (req, res) => {
    try {
        if (!isValidTask(req.body)) {
            return res.status(400).json({ message: 'Invalid task data' });
        }
        const { title, description, completed, priority } = req.body;
        const newTask = {
            id: tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1,
            title,
            description,
            completed,
            priority: priority || 'medium',
            createdAt: new Date().toISOString(),
        };
        tasks.push(newTask);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/tasks/:id', (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const foundTask = tasks.find(task => task.id === taskId);
        if (!foundTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (!isValidTask(req.body)) {
            return res.status(400).json({ message: 'Invalid task data' });
        }
        const { title, description, completed, priority } = req.body;
        foundTask.title = title;
        foundTask.description = description;
        foundTask.completed = completed;
        if (priority !== undefined) {
            foundTask.priority = priority;
        }
        res.status(200).json(foundTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/tasks/:id', (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const [deletedTask] = tasks.splice(taskIndex, 1);
        res.status(200).json(deletedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
