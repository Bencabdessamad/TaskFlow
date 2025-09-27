const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'task_manager',
  password: 'root', // Remplacez par votre mot de passe
  port: 5432,
});

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erreur de connexion à la base de données:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = 'votre_secret_jwt_super_securise_changez_moi';

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes d'authentification
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role]
    );
    
    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: newUser.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Identifiants invalides' });
    }
    
    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Identifiants invalides' });
    }
    
    // Créer le token JWT
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username, role: user.rows[0].role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        role: user.rows[0].role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes des projets
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await pool.query(
      `SELECT p.*, u.username as owner_name, 
       (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
       FROM projects p 
       JOIN users u ON p.owner_id = u.id 
       WHERE p.owner_id = $1 OR p.id IN 
       (SELECT project_id FROM project_members WHERE user_id = $1)
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(projects.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProject = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const projectId = req.params.id;
    
    const updatedProject = await pool.query(
      'UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING *',
      [name, description, projectId, req.user.id]
    );
    
    if (updatedProject.rows.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé ou non autorisé' });
    }
    
    res.json(updatedProject.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const deletedProject = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING *',
      [projectId, req.user.id]
    );
    
    if (deletedProject.rows.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé ou non autorisé' });
    }
    
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes des tâches
app.get('/api/projects/:projectId/tasks', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const tasks = await pool.query(
      `SELECT t.*, u.username as assigned_to_name, c.username as created_by_name
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       JOIN users c ON t.created_by = c.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );
    res.json(tasks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/projects/:projectId/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority = 'medium', assigned_to } = req.body;
    const projectId = req.params.projectId;
    
    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, priority, status, project_id, assigned_to, created_by) 
       VALUES ($1, $2, $3, 'todo', $4, $5, $6) RETURNING *`,
      [title, description, priority, projectId, assigned_to, req.user.id]
    );
    
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, status, assigned_to } = req.body;
    const taskId = req.params.id;
    
    const updatedTask = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4, assigned_to = $5 
       WHERE id = $6 RETURNING *`,
      [title, description, priority, status, assigned_to, taskId]
    );
    
    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const deletedTask = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
    
    if (deletedTask.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes des commentaires
app.get('/api/tasks/:taskId/comments', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const comments = await pool.query(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.task_id = $1 
       ORDER BY c.created_at DESC`,
      [taskId]
    );
    res.json(comments.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/tasks/:taskId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const taskId = req.params.taskId;
    
    const newComment = await pool.query(
      'INSERT INTO comments (content, task_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [content, taskId, req.user.id]
    );
    
    res.status(201).json(newComment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir les utilisateurs
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await pool.query('SELECT id, username, email FROM users ORDER BY username');
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour le profil utilisateur
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const updatedUser = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, role',
      [username, email, req.user.id]
    );
    
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Servir le fichier HTML principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  console.log('📊 Tableau de bord disponible après connexion');
});

module.exports = app;