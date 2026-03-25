const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── In-memory store (replace with DB later) ───────────────────────────────────
let items = [
  { id: uuidv4(), name: 'Sample Item 1', description: 'First seeded item', createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Sample Item 2', description: 'Second seeded item', createdAt: new Date().toISOString() },
];

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /health
 * Returns service health, uptime, and memory usage.
 * Used by Azure App Service health checks and CI smoke tests.
 */
app.get('/health', (req, res) => {
  const memoryMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  res.status(200).json({
    status: 'ok',
    uptime: `${process.uptime().toFixed(2)}s`,
    memoryUsed: `${memoryMB} MB`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/items
 * Returns all items. Supports optional ?name= query filter.
 */
app.get('/api/items', (req, res) => {
  const { name } = req.query;
  const result = name
    ? items.filter(i => i.name.toLowerCase().includes(name.toLowerCase()))
    : items;
  res.status(200).json({ success: true, count: result.length, data: result });
});

/**
 * POST /api/items
 * Creates a new item. Requires { name, description } in request body.
 */
app.post('/api/items', (req, res) => {
  const { name, description } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'name is required and must be a non-empty string' });
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ success: false, error: 'description is required and must be a non-empty string' });
  }

  const newItem = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ── Export for testing ────────────────────────────────────────────────────────
// We export both `app` (for supertest) and a reset helper (for test isolation)
app.resetItems = () => {
  items = [
    { id: uuidv4(), name: 'Sample Item 1', description: 'First seeded item', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Sample Item 2', description: 'Second seeded item', createdAt: new Date().toISOString() },
  ];
};

module.exports = app;
