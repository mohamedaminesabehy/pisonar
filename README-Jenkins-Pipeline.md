# 🚀 Pipeline Jenkins pour Analyse SonarQube

Ce repository contient un pipeline Jenkins complet pour automatiser l'analyse SonarQube du projet **piweb** hébergé sur GitHub.

## 📋 Vue d'ensemble

Le pipeline automatise les étapes suivantes :
- ✅ Récupération du code source depuis GitHub
- ✅ Installation des dépendances (Backend Node.js + Frontend React)
- ✅ Vérification de la qualité du code (linting)
- ✅ Construction des applications
- ✅ Exécution des tests
- ✅ Analyse SonarQube complète
- ✅ Vérification du Quality Gate
- ✅ Scan de sécurité
- ✅ Nettoyage automatique

## 🏗️ Architecture

```
GitHub Repository (mohamedaminesabehy/pisonar)
    ↓ (webhook/polling)
Jenkins Pipeline
    ↓ (analysis)
SonarQube Server
    ↓ (quality gate)
Results & Reports
```

## 📁 Fichiers du Pipeline

| Fichier | Description |
|---------|-------------|
| `Jenkinsfile` | Pipeline principal avec toutes les étapes |
| `sonar-project.properties` | Configuration SonarQube optimisée |
| `.github/workflows/jenkins-trigger.yml` | Déclencheur GitHub Actions |
| `jenkins-setup.md` | Guide d'installation détaillé |
| `docker-compose.jenkins.yml` | Stack Docker complète |
| `jenkins-plugins.txt` | Liste des plugins requis |
| `nginx.conf` | Configuration reverse proxy |

## 🚀 Démarrage Rapide

### Option 1: Docker Compose (Recommandé)

```bash
# Cloner le repository
git clone https://github.com/mohamedaminesabehy/pisonar.git
cd pisonar

# Démarrer la stack complète
docker-compose -f docker-compose.jenkins.yml up -d

# Accéder aux services
# Jenkins: http://localhost:8080 (admin/admin123)
# SonarQube: http://localhost:9000 (admin/admin)
```

### Option 2: Installation Manuelle

1. **Installer Jenkins** avec les plugins requis
2. **Configurer SonarQube** et générer un token
3. **Importer le pipeline** depuis ce repository
4. **Configurer les credentials** Jenkins

Voir le guide détaillé dans [`jenkins-setup.md`](jenkins-setup.md)

## ⚙️ Configuration

### Variables d'Environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `SONAR_HOST_URL` | URL du serveur SonarQube | `http://localhost:9000` |
| `SONAR_PROJECT_KEY` | Clé du projet | `piweb` |
| `GITHUB_REPO` | URL du repository | `https://github.com/mohamedaminesabehy/pisonar.git` |
| `NODE_VERSION` | Version Node.js | `20` |

### Credentials Requis

- `sonar-token` : Token d'authentification SonarQube
- `github-token` : Token GitHub (optionnel, pour webhooks)

## 🔄 Déclencheurs

Le pipeline se déclenche automatiquement :

1. **Push sur main** : Analyse complète
2. **Pull Request** : Analyse de branche avec comparaison
3. **Polling SCM** : Vérification toutes les 5 minutes (fallback)
4. **Webhook GitHub** : Déclenchement immédiat

## 📊 Métriques SonarQube

### Quality Gate Configuré

- **Coverage** : > 80%
- **Duplicated Lines** : < 3%
- **Maintainability Rating** : A
- **Reliability Rating** : A
- **Security Rating** : A

### Fichiers Analysés

- **Backend** : `back/src`, `back/controllers`, `back/models`, `back/routes`, `back/middlewares`, `back/config`
- **Frontend** : `front/src`

### Exclusions

- `node_modules`, `dist`, `build`, `coverage`
- `uploads`, `public`, `bin`, `views`
- Fichiers de configuration (`package-lock.json`, `*.twig`)

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

- ✅ Utilisation de credentials Jenkins
- ✅ Pas de secrets dans le code
- ✅ Isolation des builds
- ✅ Nettoyage automatique
- ✅ Timeouts configurés
- ✅ Audit de sécurité npm

### Permissions

- Accès en lecture seule au repository GitHub
- Token SonarQube avec permissions d'analyse
- Isolation des agents Jenkins

## 📈 Monitoring et Logs

### Logs Disponibles

- **Jenkins** : Interface web + `/var/log/jenkins/`
- **SonarQube** : Interface web + `/opt/sonarqube/logs/`
- **Build** : Console output dans Jenkins

### Métriques

- Temps de build
- Couverture de code
- Nombre de bugs/vulnérabilités
- Historique des Quality Gates

## 🛠️ Maintenance

### Nettoyage Automatique

- Conservation des 10 derniers builds
- Suppression des `node_modules` après build
- Rotation des logs

### Mises à Jour

- Plugins Jenkins : Automatique via `jenkins-plugins.txt`
- SonarQube : Mise à jour manuelle recommandée
- Node.js : Version fixée dans le pipeline

## 🔧 Personnalisation

### Modifier les Étapes

Éditer le `Jenkinsfile` pour :
- Ajouter des étapes de déploiement
- Modifier les tests
- Changer les notifications

### Ajuster SonarQube

Modifier `sonar-project.properties` pour :
- Changer les exclusions
- Ajouter des langages
- Configurer les tests

## 🆘 Dépannage

### Problèmes Courants

1. **Build échoue** : Vérifier les logs Jenkins
2. **SonarQube inaccessible** : Contrôler l'URL et les credentials
3. **Quality Gate échoue** : Analyser les métriques dans SonarQube
4. **Webhook ne fonctionne pas** : Vérifier la configuration GitHub

### Commandes Utiles

```bash
# Vérifier les services Docker
docker-compose -f docker-compose.jenkins.yml ps

# Voir les logs Jenkins
docker logs jenkins-sonar

# Voir les logs SonarQube
docker logs sonarqube-server

# Redémarrer un service
docker-compose -f docker-compose.jenkins.yml restart jenkins
```

## 📚 Documentation

- [Guide d'installation](jenkins-setup.md)
- [Configuration Docker](docker-compose.jenkins.yml)
- [Workflow GitHub](.github/workflows/jenkins-trigger.yml)

## 🤝 Contribution

1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Créer une Pull Request

Le pipeline analysera automatiquement votre PR !

## 📞 Support

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Documentation** : Guides dans ce repository
- **Logs** : Consulter Jenkins et SonarQube pour le debug

---

**Projet** : piweb  
**Repository** : https://github.com/mohamedaminesabehy/pisonar  
**SonarQube Project Key** : piweb  
**Token Hash** : ef622d298994cca3241983d4a95284bc2190f06b