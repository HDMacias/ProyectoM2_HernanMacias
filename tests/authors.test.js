const request = require('supertest');
const app = require('../src/app');

// Mock del pool de base de datos para que los tests sean unitarios
// (no necesitan una DB real corriendo)
jest.mock('../src/db/pool', () => {
  const mockPool = { query: jest.fn() };
  return mockPool;
});

const pool = require('../src/db/pool');

describe('Authors endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /authors ───────────────────────────────────────────
  describe('GET /authors', () => {
    it('should return list of authors with status 200', async () => {
      const mockAuthors = [
        { id: 1, name: 'Ana García', email: 'ana@example.com', bio: 'Dev', created_at: new Date() },
        { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com', bio: 'Writer', created_at: new Date() },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockAuthors });

      const res = await request(app).get('/authors');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Ana García');
    });

    it('should return empty array when no authors', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/authors');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ─── GET /authors/:id ────────────────────────────────────────
  describe('GET /authors/:id', () => {
    it('should return a single author with status 200', async () => {
      const mockAuthor = { id: 1, name: 'Ana García', email: 'ana@example.com', bio: 'Dev', created_at: new Date() };
      pool.query.mockResolvedValueOnce({ rows: [mockAuthor] });

      const res = await request(app).get('/authors/1');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('ana@example.com');
    });

    it('should return 404 if author not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/authors/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Author not found');
    });
  });

  // ─── POST /authors ───────────────────────────────────────────
  describe('POST /authors', () => {
    it('should create an author and return 201', async () => {
      const newAuthor = { id: 4, name: 'Luis Torres', email: 'luis@example.com', bio: null, created_at: new Date() };
      pool.query.mockResolvedValueOnce({ rows: [newAuthor] });

      const res = await request(app)
        .post('/authors')
        .send({ name: 'Luis Torres', email: 'luis@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Luis Torres');
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/authors')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name is required');
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/authors')
        .send({ name: 'Test User' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email is required');
    });

    it('should return 400 when email already exists', async () => {
      const duplicateError = new Error('duplicate key value');
      duplicateError.code = '23505';
      pool.query.mockRejectedValueOnce(duplicateError);

      const res = await request(app)
        .post('/authors')
        .send({ name: 'Ana Otra', email: 'ana@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('email already exists');
    });
  });

  // ─── PUT /authors/:id ────────────────────────────────────────
  describe('PUT /authors/:id', () => {
    it('should update an author and return 200', async () => {
      const updated = { id: 1, name: 'Ana Updated', email: 'ana@example.com', bio: 'Updated bio', created_at: new Date() };
      pool.query.mockResolvedValueOnce({ rows: [updated] });

      const res = await request(app)
        .put('/authors/1')
        .send({ name: 'Ana Updated', bio: 'Updated bio' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Ana Updated');
    });

    it('should return 404 when author to update does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put('/authors/999')
        .send({ name: 'Nobody' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /authors/:id ─────────────────────────────────────
  describe('DELETE /authors/:id', () => {
    it('should delete an author and return 204', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app).delete('/authors/1');

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existing author', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).delete('/authors/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Author not found');
    });
  });
});
