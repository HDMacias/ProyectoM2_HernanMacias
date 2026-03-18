const express = require('express');
const router = express.Router();
const postsService = require('../services/posts.service');

// GET /posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await postsService.getAll();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /posts/author/:authorId  ← debe ir ANTES de /:id para no colisionar
router.get('/author/:authorId', async (req, res, next) => {
  try {
    const posts = await postsService.getByAuthorId(req.params.authorId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const post = await postsService.getById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /posts
router.post('/', async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'content is required' });
    }
    if (!author_id) {
      return res.status(400).json({ error: 'author_id is required' });
    }

    const post = await postsService.create({
      title: title.trim(),
      content: content.trim(),
      author_id,
      published,
    });
    res.status(201).json(post);
  } catch (err) {
    // FK violation: author no existe
    if (err.code === '23503') {
      return res.status(400).json({ error: 'author_id does not exist' });
    }
    next(err);
  }
});

// PUT /posts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;

    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ error: 'title cannot be empty' });
    }
    if (content !== undefined && content.trim() === '') {
      return res.status(400).json({ error: 'content cannot be empty' });
    }

    const post = await postsService.update(req.params.id, { title, content, author_id, published });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'author_id does not exist' });
    }
    next(err);
  }
});

// DELETE /posts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const post = await postsService.remove(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
