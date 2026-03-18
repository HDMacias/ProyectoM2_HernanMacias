const pool = require('../db/pool');

const getAll = async () => {
  const result = await pool.query(
    'SELECT id, name, email, bio, created_at FROM authors ORDER BY created_at DESC'
  );
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, bio, created_at FROM authors WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ name, email, bio }) => {
  const result = await pool.query(
    'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING id, name, email, bio, created_at',
    [name, email, bio || null]
  );
  return result.rows[0];
};

const update = async (id, { name, email, bio }) => {
  const result = await pool.query(
    `UPDATE authors
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         bio = COALESCE($3, bio)
     WHERE id = $4
     RETURNING id, name, email, bio, created_at`,
    [name || null, email || null, bio || null, id]
  );
  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query(
    'DELETE FROM authors WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { getAll, getById, create, update, remove };
