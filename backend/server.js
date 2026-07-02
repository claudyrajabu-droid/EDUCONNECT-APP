require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'educonnect_default_secret_badilisha_hii';

app.use(cors());
app.use(express.json());

function signToken(user) {
  return jwt.sign({ id: user.id, jukumu: user.jukumu, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Hakuna token' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token batili' });
  }
}

function genCode() {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EDU-${part()}-${part()}`;
}

app.get('/', (req, res) => {
  res.json({ message: 'EduConnect API iko live 🚀' });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 + 1 AS result');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/sajili', async (req, res) => {
  try {
    const { jina, email, nywila, jukumu, simu } = req.body;
    if (!jina || !email || !nywila || !jukumu) {
      return res.status(400).json({ error: 'Jaza taarifa zote muhimu' });
    }
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Barua pepe tayari imesajiliwa' });
    }
    const hash = await bcrypt.hash(nywila, 10);
    const result = await pool.query(
      `INSERT INTO users (jina, email, nywila_hash, jukumu, simu)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, jina, email, jukumu, simu`,
      [jina, email.toLowerCase(), hash, jukumu, simu || null]
    );
    const mtumiaji = result.rows[0];
    const token = signToken(mtumiaji);
    res.json({ token, mtumiaji });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/ingia', async (req, res) => {
  try {
    const { email, nywila } = req.body;
    if (!email || !nywila) return res.status(400).json({ error: 'Jaza barua pepe na nywila' });
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Akaunti haipo' });
    const user = result.rows[0];
    const match = await bcrypt.compare(nywila, user.nywila_hash);
    if (!match) return res.status(400).json({ error: 'Nywila si sahihi' });
    const mtumiaji = { id: user.id, jina: user.jina, email: user.email, jukumu: user.jukumu, simu: user.simu };
    const token = signToken(mtumiaji);
    res.json({ token, mtumiaji });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/taarifa', authMiddleware, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*)::int AS c FROM wanafunzi');
    const hapo = await pool.query(`SELECT COUNT(*)::int AS c FROM mahudhurio WHERE tarehe = CURRENT_DATE AND hali='hapo'`);
    const hayupo = await pool.query(`SELECT COUNT(*)::int AS c FROM mahudhurio WHERE tarehe = CURRENT_DATE AND hali='hayupo'`);
    res.json({ total: total.rows[0].c, hapo: hapo.rows[0].c, hayupo: hayupo.rows[0].c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/wanafunzi/madarasa', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM madarasa ORDER BY jina');
    res.json({ madarasa: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/wanafunzi', authMiddleware, async (req, res) => {
  try {
    const { darasa_jina } = req.query;
    let result;
    if (darasa_jina) {
      result = await pool.query(
        `SELECT w.* FROM wanafunzi w JOIN madarasa m ON w.darasa_id=m.id WHERE m.jina=$1 ORDER BY w.jina`,
        [darasa_jina]
      );
    } else {
      result = await pool.query('SELECT * FROM wanafunzi ORDER BY jina');
    }
    res.json({ wanafunzi: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wanafunzi', authMiddleware, async (req, res) => {
  try {
    let { jina, namba_usajili, darasa_id, darasa_jina } = req.body;
    if (!darasa_id && darasa_jina) {
      let d = await pool.query('SELECT id FROM madarasa WHERE jina=$1', [darasa_jina]);
      if (d.rows.length === 0) {
        d = await pool.query('INSERT INTO madarasa (jina, created_by) VALUES ($1,$2) RETURNING id', [darasa_jina, req.user.id]);
      }
      darasa_id = d.rows[0].id;
    }
    const result = await pool.query(
      'INSERT INTO wanafunzi (jina, namba_usajili, darasa_id) VALUES ($1,$2,$3) RETURNING *',
      [jina, namba_usajili || null, darasa_id]
    );
    res.json({ mwanafunzi: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/masomo', authMiddleware, async (req, res) => {
  try {
    const { darasa_jina } = req.query;
    let result;
    if (darasa_jina) {
      result = await pool.query(
        `SELECT s.* FROM masomo s JOIN madarasa m ON s.darasa_id=m.id WHERE m.jina=$1 ORDER BY s.jina`,
        [darasa_jina]
      );
    } else {
      result = await pool.query('SELECT * FROM masomo ORDER BY jina');
    }
    res.json({ masomo: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/masomo', authMiddleware, async (req, res) => {
  try {
    const { jina, kifupi, darasa_id } = req.body;
    const result = await pool.query(
      'INSERT INTO masomo (jina, kifupi, darasa_id) VALUES ($1,$2,$3) RETURNING *',
      [jina, kifupi || null, darasa_id]
    );
    res.json({ somo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mahudhurio', authMiddleware, async (req, res) => {
  try {
    const { darasa_jina, tarehe } = req.query;
    const siku = tarehe || new Date().toISOString().slice(0, 10);
    const result = await pool.query(
      `SELECT w.id AS mwanafunzi_id, w.jina, mh.hali
       FROM wanafunzi w
       JOIN madarasa m ON w.darasa_id = m.id
       LEFT JOIN mahudhurio mh ON mh.mwanafunzi_id = w.id AND mh.tarehe = $2
       WHERE m.jina = $1 ORDER BY w.jina`,
      [darasa_jina, siku]
    );
    res.json({ mahudhurio: result.rows, tarehe: siku });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mahudhurio/batch', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { tarehe, rekodi } = req.body;
    const siku = tarehe || new Date().toISOString().slice(0, 10);
    await client.query('BEGIN');
    for (const r of rekodi || []) {
      await client.query(
        `INSERT INTO mahudhurio (mwanafunzi_id, tarehe, hali) VALUES ($1,$2,$3)
         ON CONFLICT (mwanafunzi_id, tarehe) DO UPDATE SET hali = EXCLUDED.hali`,
        [r.mwanafunzi_id, siku, r.hali]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/matokeo', authMiddleware, async (req, res) => {
  try {
    const { darasa_jina, mwanafunzi_id } = req.query;
    let result;
    if (mwanafunzi_id) {
      result = await pool.query(
        `SELECT mt.*, s.jina AS somo_jina FROM matokeo mt JOIN masomo s ON mt.somo_id=s.id WHERE mt.mwanafunzi_id=$1 ORDER BY mt.tarehe DESC`,
        [mwanafunzi_id]
      );
    } else if (darasa_jina) {
      result = await pool.query(
        `SELECT mt.*, w.jina AS mwanafunzi_jina, s.jina AS somo_jina
         FROM matokeo mt
         JOIN wanafunzi w ON mt.mwanafunzi_id = w.id
         JOIN masomo s ON mt.somo_id = s.id
         JOIN madarasa m ON w.darasa_id = m.id
         WHERE m.jina = $1 ORDER BY mt.tarehe DESC`,
        [darasa_jina]
      );
    } else {
      result = await pool.query('SELECT * FROM matokeo ORDER BY tarehe DESC LIMIT 200');
    }
    res.json({ matokeo: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/matokeo', authMiddleware, async (req, res) => {
  try {
    const { mwanafunzi_id, somo_id, alama, mtihani } = req.body;
    const result = await pool.query(
      'INSERT INTO matokeo (mwanafunzi_id, somo_id, alama, mtihani) VALUES ($1,$2,$3,$4) RETURNING *',
      [mwanafunzi_id, somo_id, alama, mtihani || null]
    );
    res.json({ tokeo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ujumbe', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ujumbe ORDER BY tarehe DESC LIMIT 100');
    res.json({ ujumbe: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ujumbe', authMiddleware, async (req, res) => {
  try {
    const { aina, tuma_kwa, maudhui } = req.body;
    const result = await pool.query(
      'INSERT INTO ujumbe (aina, tuma_kwa, maudhui, mtumaji_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [aina || null, tuma_kwa || null, maudhui, req.user.id]
    );
    res.json({ ujumbe: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/malipo', authMiddleware, async (req, res) => {
  try {
    const { hali } = req.query;
    let result;
    if (hali) {
      result = await pool.query('SELECT * FROM malipo WHERE user_id=$1 AND hali=$2 ORDER BY tarehe DESC', [req.user.id, hali]);
    } else {
      result = await pool.query('SELECT * FROM malipo WHERE user_id=$1 ORDER BY tarehe DESC', [req.user.id]);
    }
    res.json({ malipo: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/malipo', authMiddleware, async (req, res) => {
  try {
    const { njia, namba_muamala, simu } = req.body;
    const code = genCode();
    const result = await pool.query(
      `INSERT INTO malipo (user_id, njia, namba_muamala, simu, hali, code)
       VALUES ($1,$2,$3,$4,'pending',$5) RETURNING *`,
      [req.user.id, njia, namba_muamala, simu, code]
    );
    res.json({ malipo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/malipo/angalia-code', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await pool.query('SELECT * FROM malipo WHERE code=$1', [code]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Code si sahihi' });
    const rekodi = result.rows[0];
    if (rekodi.hali !== 'confirmed') return res.status(400).json({ error: 'Code bado halijathibitishwa' });
    await pool.query(`UPDATE malipo SET user_id=$1 WHERE code=$2`, [req.user.id, code]);
    res.json({ ok: true, malipo: rekodi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/malipo/:id/thibitisha', authMiddleware, async (req, res) => {
  try {
    if (req.user.jukumu !== 'admin') return res.status(403).json({ error: 'Hairuhusiwi' });
    const { id } = req.params;
    const muda = new Date();
    muda.setMonth(muda.getMonth() + 1);
    const result = await pool.query(
      `UPDATE malipo SET hali='confirmed', tarehe_kuisha=$1 WHERE id=$2 RETURNING *`,
      [muda, id]
    );
    res.json({ malipo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EduConnect Server inafanya kazi: http://localhost:${PORT}`);
  console.log('📦 Mazingira: production');
});
