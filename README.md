# TaskFlow - Gestionnaire de Tâches Collaboratif

Une application web complète de gestion de tâches collaboratives développée avec Node.js, Express, PostgreSQL et Tailwind CSS.

## 🚀 Fonctionnalités

### ✅ Système d'authentification complet
- Inscription et connexion des utilisateurs
- Système de sessions avec JWT
- Gestion des rôles (utilisateur/administrateur)
- Profil utilisateur modifiable

### 🎨 Interface utilisateur moderne
- Design responsive (mobile & desktop)
- Interface élégante avec Tailwind CSS
- Navigation fluide entre les sections
- Animations et transitions

### 📊 Gestion de contenu CRUD
- **Projets** : Créer, lire, modifier, supprimer
- **Tâches** : Gestion complète avec statuts et priorités
- **Commentaires** : Système de commentaires sur les tâches

### 💾 Base de données PostgreSQL
- Structure relationnelle cohérente
- Sauvegarde sécurisée des données
- Relations optimisées avec index

### 👤 Tableau de bord personnalisé
- Vue d'ensemble des projets et tâches
- Statistiques en temps réel
- Accès rapide aux éléments récents

### 🤝 Aspect collaboratif
- Assignation de tâches aux utilisateurs
- Système de commentaires
- Partage de projets

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express.js
- **Base de données** : PostgreSQL
- **Frontend** : HTML5, CSS3 (Tailwind CSS), JavaScript
- **Authentification** : JWT (JSON Web Tokens)
- **Sécurité** : bcryptjs pour le hashage des mots de passe

## 📋 Prérequis

- Node.js (version 14 ou plus récente)
- PostgreSQL (version 12 ou plus récente)
- npm ou yarn

## ⚙️ Installation

### 1. Cloner le projet
```bash
cd C:\prjt\fsRabat
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de PostgreSQL
1. Installez PostgreSQL depuis [postgresql.org](https://www.postgresql.org/download/)
2. Créez une base de données :
```sql
CREATE DATABASE task_manager;
```

### 4. Configuration de la base de données
1. Ouvrez `server.js` et modifiez les paramètres de connexion PostgreSQL :
```javascript
const pool = new Pool({
  user: 'votre_nom_utilisateur',
  host: 'localhost',
  database: 'task_manager',
  password: 'votre_mot_de_passe',
  port: 5432,
});
```

2. Exécutez le script SQL pour créer les tables :
```bash
# Connectez-vous à PostgreSQL et exécutez le contenu de database.sql
psql -U postgres -d task_manager -f database.sql
```

### 5. Configurer les variables d'environnement
Dans `server.js`, modifiez :
```javascript
const JWT_SECRET = 'votre_secret_jwt_super_securise_changez_moi';
```

## 🚀 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Utilisation

### Premiers pas
1. Accédez à `http://localhost:3000`
2. Créez un compte ou utilisez le compte de test :
   - Email : `admin@taskflow.com`
   - Mot de passe : `password123`

### Fonctionnalités principales
- **Tableau de bord** : Vue d'ensemble de vos projets et tâches
- **Projets** : Créez et gérez vos projets
- **Tâches** : Organisez vos tâches par statut (À faire, En cours, Terminé)
- **Collaboration** : Assignez des tâches et ajoutez des commentaires

## 🗄️ Structure de la base de données

### Tables principales
- `users` : Informations des utilisateurs
- `projects` : Projets créés par les utilisateurs
- `tasks` : Tâches liées aux projets
- `comments` : Commentaires sur les tâches
- `project_members` : Membres des projets (collaboration)

## 🎯 API Endpoints

### Authentification
- `POST /api/register` : Inscription
- `POST /api/login` : Connexion
- `GET /api/profile` : Profil utilisateur
- `PUT /api/profile` : Mise à jour du profil

### Projets
- `GET /api/projects` : Liste des projets
- `POST /api/projects` : Créer un projet
- `PUT /api/projects/:id` : Modifier un projet
- `DELETE /api/projects/:id` : Supprimer un projet

### Tâches
- `GET /api/projects/:id/tasks` : Tâches d'un projet
- `POST /api/projects/:id/tasks` : Créer une tâche
- `PUT /api/tasks/:id` : Modifier une tâche
- `DELETE /api/tasks/:id` : Supprimer une tâche

### Commentaires
- `GET /api/tasks/:id/comments` : Commentaires d'une tâche
- `POST /api/tasks/:id/comments` : Ajouter un commentaire

## 🔒 Sécurité

- Mots de passe hashés avec bcryptjs
- Authentification JWT
- Protection CORS
- Validation des entrées
- Requêtes SQL paramétrées (protection contre l'injection SQL)

## 📱 Responsive Design

L'application s'adapte automatiquement à tous les types d'écrans :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)

## 🎨 Caractéristiques UI/UX

- Interface moderne avec gradients et ombres
- Animations fluides
- Feedback visuel pour toutes les actions
- Notifications en temps réel
- Loading states
- Gestion d'erreurs élégante

## 🚀 Fonctionnalités avancées

- Filtrage des tâches par statut
- Système de priorités (Basse, Moyenne, Haute)
- Recherche et tri
- Raccourcis clavier
- Sauvegarde automatique
- Mode hors ligne (en cours de développement)

## 🐛 Dépannage

### Erreur de connexion à la base de données
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les paramètres de connexion dans `server.js`
3. Assurez-vous que la base de données `task_manager` existe

### Erreur "Port already in use"
```bash
# Trouvez le processus utilisant le port 3000
netstat -ano | findstr :3000
# Tuez le processus
taskkill /PID <PID> /F
```

## 🔄 Mises à jour futures

- [ ] Notifications en temps réel (WebSockets)
- [ ] Système de fichiers attachés
- [ ] API REST complète
- [ ] Tests automatisés
- [ ] Docker containerisation
- [ ] Déploiement cloud

## 👥 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur le repository.

---

**TaskFlow** - Gérez vos projets avec efficacité et collaboration ! 🚀