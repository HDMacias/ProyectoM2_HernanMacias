const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/db/pool', () => {
  const mockPool = { query: jest.fn() };
  return mockPool;
});

const pool = require('../src/db/pool');

describe('Posts endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /posts ───────────────────────────────────────────────
  describe('GET /posts', () => {
    it('should return list of posts with status 200', async () => {
      const mockPosts = [
        { id: 1, title: 'Intro a Node.js', content: 'Contenido...', author_id: 1, published: true, author_name: 'Ana García' },
        { id: 2, title: 'PostgreSQL vs MySQL', content: 'Contenido...', author_id: 2, published: true, author_name: 'Carlos Ruiz' },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockPosts });

      const res = await request(app).get('/posts');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  // ─── GET /posts/:id ───────────────────────────────────────────
  describe('GET /posts/:id', () => {
    it('should return a single post with status 200', async () => {
      const mockPost = { id: 1, title: 'Intro a Node.js', content: 'Contenido...', author_id: 1, published: true };
      pool.query.mockResolvedValueOnce({ rows: [mockPost] });

      const res = await request(app).get('/posts/1');

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Intro a Node.js');
    });

    it('should return 404 if post not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/posts/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });
  });

  // ─── GET /posts/author/:authorId ──────────────────────────────
  describe('GET /posts/author/:authorId', () => {
    it('should return posts for a given author', async () => {
      const mockPosts = [
        { id: 1, title: 'Intro a Node.js', author_id: 1, author_name: 'Ana García' },
        { id: 3, title: 'APIs RESTful', author_id: 1, author_name: 'Ana García' },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockPosts });

      const res = await request(app).get('/posts/author/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].author_name).toBe('Ana García');
    });

    it('should return empty array if author has no posts', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/posts/author/999');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ─── POST /posts ──────────────────────────────────────────────
  describe('POST /posts', () => {
    it('should create a post and return 201', async () => {
      const newPost = { id: 6, title: 'Nuevo Post', content: 'Contenido nuevo', author_id: 1, published: false, created_at: new Date() };
      pool.query.mockResolvedValueOnce({ rows: [newPost] });

      const res = await request(app)
        .post('/posts')
        .send({ title: 'Nuevo Post', content: 'Contenido nuevo', author_id: 1 });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Nuevo Post');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ content: 'Contenido', author_id: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('title is required');
    });

    it('should return 400 when content is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Titulo', author_id: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('content is required');
    });

    it('should return 400 when author_id is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Titulo', content: 'Contenido' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('author_id is required');
    });

    it('should return 400 when author_id does not exist (FK violation)', async () => {
      const fkError = new Error('foreign key constraint');
      fkError.code = '23503';
      pool.query.mockRejectedValueOnce(fkError);

      const res = await request(app)
        .post('/posts')
        .send({ title: 'Titulo', content: 'Contenido', author_id: 9999 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('author_id does not exist');
    });
  });

  // ─── DELETE /posts/:id ────────────────────────────────────────
  describe('DELETE /posts/:id', () => {
    it('should delete a post and return 204', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app).delete('/posts/1');

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existing post', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).delete('/posts/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });
  });
});
