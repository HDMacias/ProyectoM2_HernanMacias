require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authorsRoutes = require('./routes/authors.routes');
const postsRoutes = require('./routes/posts.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/authors', authorsRoutes);
app.use('/posts', postsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API 🚀' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
