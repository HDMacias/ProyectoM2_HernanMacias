const express = require('express');
const router = express.Router();
const authorsService = require('../services/authors.service');

// GET /authors
router.get('/', async (req, res, next) => {
  try {
    const authors = await authorsService.getAll();
    res.json(authors);
  } catch (err) {
    next(err);
  }
});

// GET /authors/:id
router.get('/:id', async (req, res, next) => {
  try {
    const author = await authorsService.getById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (err) {
    next(err);
  }
});

// POST /authors
router.post('/', async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'email is required' });
    }

    const author = await authorsService.create({ name: name.trim(), email: email.trim(), bio });
    res.status(201).json(author);
  } catch (err) {
    // Unique constraint violation (email duplicado)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'email already exists' });
    }
    next(err);
  }
});

// PUT /authors/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;

    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: 'name cannot be empty' });
    }
    if (email !== undefined && email.trim() === '') {
      return res.status(400).json({ error: 'email cannot be empty' });
    }

    const author = await authorsService.update(req.params.id, { name, email, bio });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'email already exists' });
    }
    next(err);
  }
});

// DELETE /authors/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const author = await authorsService.remove(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
