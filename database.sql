-- Script de création de la base de données PostgreSQL pour le gestionnaire de tâches
-- Connectez-vous d'abord à PostgreSQL et créez la base de données :
-- CREATE DATABASE task_manager;

-- Puis connectez-vous à la base task_manager et exécutez ce script

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des projets
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tâches
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commentaires
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des membres de projet (pour la collaboration)
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'manager')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Fonction pour mettre à jour automatiquement le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données d'exemple (optionnel)
-- Mot de passe pour tous les utilisateurs d'exemple : "password123"
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@taskflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('john_doe', 'john@taskflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('marie_martin', 'marie@taskflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Projets d'exemple
INSERT INTO projects (name, description, owner_id) VALUES 
('Application TaskFlow', 'Développement complet de l''application de gestion de tâches', 1),
('Refonte Site Web', 'Mise à jour complète du site web de l''entreprise', 2),
('Formation Équipe', 'Programme de formation pour la nouvelle équipe', 1);

-- Tâches d'exemple
INSERT INTO tasks (title, description, priority, project_id, assigned_to, created_by) VALUES 
('Configuration Base de Données', 'Créer et configurer toutes les tables PostgreSQL', 'high', 1, 1, 1),
('Développement Backend API', 'Créer toutes les routes API avec Express.js', 'high', 1, 2, 1),
('Interface Utilisateur', 'Développer l''interface responsive avec Tailwind CSS', 'medium', 1, 3, 1),
('Tests et Débogage', 'Effectuer tous les tests nécessaires', 'medium', 1, 2, 1),
('Analyse des Besoins', 'Analyser les besoins pour la refonte', 'high', 2, 2, 2),
('Design Mockups', 'Créer les maquettes du nouveau design', 'medium', 2, 3, 2);

-- Commentaires d'exemple
INSERT INTO comments (content, task_id, user_id) VALUES 
('Base de données configurée avec succès ! Toutes les tables sont prêtes.', 1, 1),
('Excellente progression sur l''API. Les routes d''authentification fonctionnent parfaitement.', 2, 3),
('L''interface commence à prendre forme. Très bon travail !', 3, 1),
('J''ai quelques suggestions pour améliorer l''expérience utilisateur.', 3, 2);

-- Ajouter quelques membres aux projets
INSERT INTO project_members (project_id, user_id, role) VALUES 
(1, 2, 'manager'),
(1, 3, 'member'),
(2, 3, 'member');