const request = require('supertest');
const app = require('../src/app');

// Reset in-memory store before each test for isolation
beforeEach(() => {
  app.resetItems();
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /health
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('returns uptime as a string ending in "s"', async () => {
    const res = await request(app).get('/health');
    expect(res.body.uptime).toMatch(/s$/);
  });

  test('returns memoryUsed in MB', async () => {
    const res = await request(app).get('/health');
    expect(res.body.memoryUsed).toMatch(/MB$/);
  });

  test('returns a valid ISO timestamp', async () => {
    const res = await request(app).get('/health');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/items
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/items', () => {
  test('returns 200 with array of items', async () => {
    const res = await request(app).get('/api/items');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('returns seeded items on fresh start', async () => {
    const res = await request(app).get('/api/items');

    expect(res.body.count).toBe(2);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('description');
    expect(res.body.data[0]).toHaveProperty('createdAt');
  });

  test('filters items by ?name= query', async () => {
    const res = await request(app).get('/api/items?name=Sample Item 1');

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].name).toBe('Sample Item 1');
  });

  test('returns empty array when no name match', async () => {
    const res = await request(app).get('/api/items?name=doesnotexist');

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  test('filter is case-insensitive', async () => {
    const res = await request(app).get('/api/items?name=sample item 1');
    expect(res.body.count).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/items
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/items', () => {
  test('creates a new item and returns 201', async () => {
    const payload = { name: 'New Item', description: 'A test item' };
    const res = await request(app).post('/api/items').send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Item');
    expect(res.body.data.description).toBe('A test item');
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
  });

  test('newly created item appears in GET /api/items', async () => {
    await request(app)
      .post('/api/items')
      .send({ name: 'Persistent Item', description: 'Should appear in list' });

    const res = await request(app).get('/api/items');
    const names = res.body.data.map(i => i.name);
    expect(names).toContain('Persistent Item');
  });

  test('trims whitespace from name and description', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: '  Trimmed  ', description: '  Also trimmed  ' });

    expect(res.body.data.name).toBe('Trimmed');
    expect(res.body.data.description).toBe('Also trimmed');
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ description: 'Missing name' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/name/i);
  });

  test('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Missing desc' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/description/i);
  });

  test('returns 400 when name is empty string', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: '   ', description: 'Some desc' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when body is completely empty', async () => {
    const res = await request(app).post('/api/items').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 404 fallback
// ─────────────────────────────────────────────────────────────────────────────
describe('404 fallback', () => {
  test('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
