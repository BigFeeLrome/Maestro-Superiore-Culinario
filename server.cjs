// Backend server (Express + JWT + PostgreSQL) serving Angular dist
// Runs on Railway as a single service: serves static Angular app and /api routes

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Headers per Google Sign-In (COOP/COEP)
// Permette al popup di Google di comunicare con la finestra principale
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Database pool
const isInternalRailway = (process.env.DATABASE_URL || '').includes('railway.internal');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway/managed PG typically requires SSL for public hostnames.
  // For internal hostnames (postgres.railway.internal), SSL is not required.
  ssl: process.env.PGSSL === 'false' ? false : (isInternalRailway ? false : { rejectUnauthorized: false }),
});

// Ensure DB schema exists on startup (idempotent)
const ensureSchema = async () => {
  const createUsers = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(255),
    data_creazione TIMESTAMP DEFAULT NOW()
  );`;

  const createStoricoDocumenti = `
  CREATE TABLE IF NOT EXISTS storico_documenti (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nome_documento VARCHAR(255),
    tipo VARCHAR(50),
    url TEXT,
    data_creazione TIMESTAMP DEFAULT NOW()
  );`;

  await pool.query(createUsers);
  await pool.query(createStoricoDocumenti);
};

// JWT config
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, nome } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e password sono obbligatori' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, nome) VALUES ($1, $2, $3) RETURNING id, email, nome, data_creazione',
      [email, hashedPassword, nome || null]
    );
    const user = result.rows[0];
    const token = signToken({ id: user.id });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Email già registrata' });
    }
    res.status(500).json({ error: err.message || 'Errore server' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e password sono obbligatori' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Utente non trovato' });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Password errata' });

    const token = signToken({ id: user.id });
    res.json({ token, user: { id: user.id, email: user.email, nome: user.nome, data_creazione: user.data_creazione } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore server' });
  }
});

// Token verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ error: 'Token mancante' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token non valido' });
    req.userId = decoded.id;
    next();
  });
};

// Storico documenti routes
app.post('/api/storico/documento', verifyToken, async (req, res) => {
  const { nome_documento, tipo, url } = req.body || {};
  if (!nome_documento) return res.status(400).json({ error: 'nome_documento è obbligatorio' });

  try {
    const result = await pool.query(
      'INSERT INTO storico_documenti (user_id, nome_documento, tipo, url, data_creazione) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [req.userId, nome_documento, tipo || null, url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore server' });
  }
});

app.get('/api/storico', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM storico_documenti WHERE user_id = $1 ORDER BY data_creazione DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore server' });
  }
});

// Serve Angular static files
const distDir = path.join(__dirname, 'dist', 'maestro-superiore-alcolico');
app.use(express.static(distDir));

// Health check (also verifies DB connectivity)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'db_error', error: e.message });
  }
});

// SPA fallback (for non-API routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
ensureSchema()
  .then(() => console.log('Database schema ensured'))
  .catch((err) => console.error('Error ensuring DB schema:', err))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server in ascolto su porta ${PORT}`);
    });
  });
