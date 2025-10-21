# Configuration Jenkins pour SonarQube - Guide d'Installation

## 📋 Prérequis

### 1. Jenkins
- Jenkins 2.400+ avec les plugins suivants :
  - SonarQube Scanner
  - GitHub Integration
  - Pipeline
  - Credentials Binding
  - Build Timeout
  - Timestamper

### 2. SonarQube
- SonarQube 9.0+ en cours d'exécution
- Token d'authentification généré

### 3. Node.js
- Node.js 20+ installé sur l'agent Jenkins

## 🔧 Configuration Jenkins

### 1. Installation des Plugins Requis

```bash
# Via Jenkins CLI ou interface web
jenkins-plugin-cli --plugins sonar:2.15 github:1.37.0 pipeline-stage-view:2.25
```

### 2. Configuration SonarQube Scanner

1. **Aller dans** : `Manage Jenkins` > `Global Tool Configuration`
2. **Ajouter SonarQube Scanner** :
   - Name: `SonarQubeScanner`
   - Install automatically: ✅
   - Version: Latest

### 3. Configuration du Serveur SonarQube

1. **Aller dans** : `Manage Jenkins` > `Configure System`
2. **Section SonarQube servers** :
   - Name: `SonarQube`
   - Server URL: `http://localhost:9000` (ou votre URL SonarQube)
   - Server authentication token: Utiliser les credentials

### 4. Configuration des Credentials

#### Token SonarQube
1. **Aller dans** : `Manage Jenkins` > `Manage Credentials`
2. **Ajouter** : `Secret text`
   - ID: `sonar-token`
   - Secret: Votre token SonarQube
   - Description: `SonarQube Authentication Token`

#### Token GitHub (optionnel pour webhooks)
1. **Ajouter** : `Secret text`
   - ID: `github-token`
   - Secret: Votre token GitHub
   - Description: `GitHub Personal Access Token`

### 5. Configuration du Job Pipeline

1. **Créer un nouveau job** : `New Item` > `Pipeline`
2. **Configuration** :
   - Name: `pisonar-sonarqube-analysis`
   - Pipeline script from SCM: ✅
   - SCM: Git
   - Repository URL: `https://github.com/mohamedaminesabehy/pisonar.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

### 6. Configuration des Déclencheurs

#### GitHub Webhooks
1. **Dans GitHub** : Repository > Settings > Webhooks
2. **Ajouter webhook** :
   - Payload URL: `http://your-jenkins-url/github-webhook/`
   - Content type: `application/json`
   - Events: `Push`, `Pull requests`

#### Polling SCM (fallback)
Dans la configuration du job :
- Build Triggers: ✅ `Poll SCM`
- Schedule: `H/5 * * * *` (toutes les 5 minutes)

## 🔒 Configuration de Sécurité

### 1. Permissions Jenkins
```groovy
// Exemple de configuration de sécurité
jenkins.model.Jenkins.instance.getAuthorizationStrategy().add(
    hudson.security.Permission.fromId("hudson.model.Item.BUILD"),
    "github-user"
)
```

### 2. Variables d'Environnement Sécurisées
- Utiliser `credentials()` dans le Jenkinsfile
- Ne jamais exposer les tokens dans les logs
- Utiliser des credentials Jenkins pour tous les secrets

### 3. Isolation des Builds
- Utiliser des agents dédiés si possible
- Nettoyer l'espace de travail après chaque build
- Limiter les permissions des processus

## 📊 Configuration SonarQube

### 1. Quality Gates
Créer un Quality Gate personnalisé :
```
Coverage: > 80%
Duplicated Lines: < 3%
Maintainability Rating: A
Reliability Rating: A
Security Rating: A
```

### 2. Règles de Qualité
- Activer les règles JavaScript/TypeScript
- Configurer les seuils selon vos besoins
- Exclure les fichiers générés automatiquement

### 3. Intégration GitHub
1. **Dans SonarQube** : Administration > Configuration > Pull Requests
2. **Configurer** :
   - Provider: GitHub
   - GitHub App ID et Private Key
   - Webhook URL: `http://your-sonarqube-url/api/alm_integration/github/webhook`

## 🚀 Déploiement et Test

### 1. Test Initial
```bash
# Tester la connexion SonarQube
curl -u your-token: http://localhost:9000/api/system/status

# Tester Jenkins CLI
java -jar jenkins-cli.jar -s http://localhost:8080/ version
```

### 2. Premier Build
1. Déclencher manuellement le pipeline
2. Vérifier les logs Jenkins
3. Contrôler les résultats dans SonarQube
4. Valider le Quality Gate

### 3. Test des Déclencheurs
1. Faire un push sur la branche main
2. Vérifier le déclenchement automatique
3. Tester avec une Pull Request

## 🔍 Dépannage

### Problèmes Courants

#### 1. SonarQube Scanner non trouvé
```bash
# Vérifier l'installation
which sonar-scanner
# Ou configurer le PATH
export PATH=$PATH:/path/to/sonar-scanner/bin
```

#### 2. Échec de connexion SonarQube
- Vérifier l'URL et le port
- Contrôler les credentials
- Tester la connectivité réseau

#### 3. Quality Gate timeout
- Augmenter le timeout dans le Jenkinsfile
- Vérifier les performances SonarQube
- Optimiser la configuration d'analyse

#### 4. Problèmes de permissions
```bash
# Vérifier les permissions Jenkins
ls -la /var/lib/jenkins/workspace/
# Ajuster si nécessaire
chown -R jenkins:jenkins /var/lib/jenkins/workspace/
```

### Logs Utiles
```bash
# Logs Jenkins
tail -f /var/log/jenkins/jenkins.log

# Logs SonarQube
tail -f /opt/sonarqube/logs/sonar.log

# Logs du build
# Disponibles dans l'interface Jenkins
```

## 📈 Optimisations

### 1. Performance
- Utiliser des agents parallèles
- Cache des dépendances npm
- Analyse incrémentale SonarQube

### 2. Monitoring
- Configurer des alertes sur les échecs
- Surveiller les métriques de qualité
- Dashboard de suivi des builds

### 3. Maintenance
- Nettoyage automatique des anciens builds
- Rotation des logs
- Mise à jour régulière des plugins

## 📚 Ressources

- [Documentation Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [SonarQube Scanner for Jenkins](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner-for-jenkins/)
- [GitHub Integration](https://plugins.jenkins.io/github/)

## 🆘 Support

En cas de problème :
1. Consulter les logs Jenkins et SonarQube
2. Vérifier la configuration des credentials
3. Tester les connexions réseau
4. Consulter la documentation officielle