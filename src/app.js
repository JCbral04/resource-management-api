const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const loggingMiddleware = require('./middleware/logging');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globales
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(loggingMiddleware);

// Rutas
app.use('/api/v1/resources', resourceRoutes);

// Endpoint Hello API
app.get('/api/v1/hello', (req, res) => {
  res.status(200).json({
    message: 'Hello API - Resource Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    author: 'Juan Esteban Cabral Bautista'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/v1/hello`);
});

module.exports = app;