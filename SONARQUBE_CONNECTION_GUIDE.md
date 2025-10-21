# 🔧 Guide de Résolution - Problème de Connexion SonarQube

## 🚨 Problème Identifié

**Erreur** : `SonarQube server [localhost:9000] can not be reached`
**Cause** : Le runner GitHub Actions ne peut pas accéder à votre SonarQube local

## 📋 Diagnostic

L'erreur `java.net.ConnectException: Connection refused` indique que :
- ✅ Les secrets GitHub sont correctement configurés
- ❌ Le serveur SonarQube à `localhost:9000` n'est pas accessible depuis GitHub Actions
- ❌ GitHub Actions s'exécute sur des serveurs distants, pas sur votre machine locale

## 🎯 Solutions Disponibles

### 🌟 **Solution 1: SonarCloud (RECOMMANDÉE)**

**Avantages** :
- ✅ Gratuit pour projets publics
- ✅ Aucune configuration serveur
- ✅ Intégration GitHub native
- ✅ Analyses illimitées
- ✅ Fonctionne immédiatement avec GitHub Actions

**Configuration** :
1. Créer un compte sur [sonarcloud.io](https://sonarcloud.io)
2. Connecter avec GitHub
3. Importer le projet `pisonar`
4. Récupérer le token SonarCloud
5. Mettre à jour les secrets GitHub

### 🏢 **Solution 2: SonarQube Accessible Publiquement**

**Prérequis** :
- Serveur SonarQube avec IP publique ou domaine
- Port 9000 ouvert et accessible depuis Internet

**Configuration** :
```
SONAR_HOST_URL=http://votre-ip-publique:9000
# ou
SONAR_HOST_URL=http://votre-domaine.com:9000
```

### 🖥️ **Solution 3: Self-Hosted Runner**

**Configuration** :
- Installer un runner GitHub Actions sur votre machine locale
- Le runner aura accès à `localhost:9000`
- Plus complexe à configurer

## 🚀 Migration vers SonarCloud (Recommandée)

### Étape 1: Création du Compte
1. Allez sur [sonarcloud.io](https://sonarcloud.io)
2. Cliquez sur "Log in" puis "With GitHub"
3. Autorisez SonarCloud à accéder à vos dépôts

### Étape 2: Import du Projet
1. Cliquez sur "+" puis "Analyze new project"
2. Sélectionnez votre organisation GitHub
3. Choisissez le dépôt `pisonar`
4. Cliquez sur "Set up"

### Étape 3: Configuration des Secrets
Remplacez vos secrets GitHub actuels :

| Secret | Nouvelle Valeur |
|--------|-----------------|
| `SONAR_TOKEN` | Token généré par SonarCloud |
| `SONAR_HOST_URL` | `https://sonarcloud.io` |

### Étape 4: Mise à Jour de la Configuration
Modifiez `sonar-project.properties` :
```properties
sonar.host.url=https://sonarcloud.io
sonar.organization=votre-nom-utilisateur-github
sonar.projectKey=votre-nom-utilisateur-github_pisonar
```

## 🔍 Vérification

Après configuration, votre pipeline devrait :
1. ✅ Passer la validation des secrets
2. ✅ Se connecter au serveur SonarQube/SonarCloud
3. ✅ Exécuter l'analyse avec succès
4. ✅ Afficher les résultats dans l'interface

## 📞 Support

Si vous choisissez SonarCloud, je peux vous aider à :
- Configurer automatiquement les fichiers
- Mettre à jour les secrets
- Tester le pipeline

**Quelle solution préférez-vous ?**