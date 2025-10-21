# 🔗 Configuration Webhook GitHub → Jenkins

## 🎯 Objectif
Configurer le déclenchement automatique du pipeline Jenkins lors des push sur la branche `main`.

## 📋 Prérequis
- Jenkins accessible depuis Internet (ou ngrok pour test local)
- Repository GitHub : `https://github.com/mohamedaminesabehy/pisonar.git`
- Droits d'administration sur le repository GitHub
- Accès administrateur à Jenkins

## 🛠️ Configuration Jenkins

### 1. Installation des Plugins Requis
Dans Jenkins, allez dans **Manage Jenkins** → **Manage Plugins** :
```
✅ GitHub Plugin
✅ GitHub Branch Source Plugin
✅ Generic Webhook Trigger Plugin
✅ Pipeline: GitHub Groovy Libraries
✅ Git Plugin
```

### 2. Configuration des Credentials
**Manage Jenkins** → **Manage Credentials** → **Global** :

#### Token GitHub
- **Kind** : Secret text
- **Secret** : Votre Personal Access Token GitHub
- **ID** : `github-token`
- **Description** : GitHub Token for pisonar

#### Token SonarQube
- **Kind** : Secret text  
- **Secret** : Votre token SonarQube
- **ID** : `sonar-token`
- **Description** : SonarQube Token

### 3. Configuration du Job Pipeline
1. **New Item** → **Pipeline** → Nom : `pisonar-pipeline`
2. **Pipeline** section :
   - **Definition** : Pipeline script from SCM
   - **SCM** : Git
   - **Repository URL** : `https://github.com/mohamedaminesabehy/pisonar.git`
   - **Credentials** : Sélectionnez `github-token`
   - **Branch Specifier** : `*/main`
   - **Script Path** : `Jenkinsfile`

3. **Build Triggers** :
   - ✅ **GitHub hook trigger for GITScm polling**
   - ✅ **Poll SCM** : `H/2 * * * *`

## 🌐 Configuration GitHub

### 1. Webhook GitHub Standard
Dans votre repository GitHub :

1. **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL** : `http://VOTRE_JENKINS_URL/github-webhook/`
   - Exemple : `http://jenkins.example.com/github-webhook/`
   - Pour test local : `http://your-ngrok-url.ngrok.io/github-webhook/`
3. **Content type** : `application/json`
4. **Secret** : (optionnel, mais recommandé)
5. **Events** : 
   - ✅ **Just the push event**
   - Ou ✅ **Send me everything** pour plus de flexibilité
6. ✅ **Active**

### 2. Secrets GitHub Actions (Optionnel)
Dans **Settings** → **Secrets and variables** → **Actions** :

```
JENKINS_WEBHOOK_URL = http://votre-jenkins-url
JENKINS_API_URL = http://votre-jenkins-url
JENKINS_USER = votre-username-jenkins
JENKINS_API_TOKEN = votre-api-token-jenkins
JENKINS_JOB_NAME = pisonar-pipeline
JENKINS_GENERIC_WEBHOOK_URL = http://votre-jenkins-url/generic-webhook-trigger/invoke?token=pisonar-token
```

## 🧪 Tests de Validation

### 1. Test Manuel du Webhook
```bash
# Testez le webhook GitHub
curl -X POST http://VOTRE_JENKINS_URL/github-webhook/ \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "ref": "refs/heads/main",
    "after": "abc123",
    "repository": {
      "clone_url": "https://github.com/mohamedaminesabehy/pisonar.git",
      "full_name": "mohamedaminesabehy/pisonar"
    },
    "pusher": {
      "name": "testuser"
    }
  }'
```

### 2. Test avec un Push Réel
1. Faites un petit changement dans le repository
2. Commitez et pushez sur `main`
3. Vérifiez dans Jenkins que le build se déclenche

### 3. Vérification des Logs
- **Jenkins** → **Manage Jenkins** → **System Log**
- **Job** → **Console Output**
- **GitHub** → **Settings** → **Webhooks** → Cliquez sur votre webhook → **Recent Deliveries**

## 🔧 Solutions de Dépannage

### Problème : Webhook non reçu
```bash
# Vérifiez la connectivité
curl -I http://VOTRE_JENKINS_URL/github-webhook/

# Vérifiez les logs Jenkins
tail -f /var/log/jenkins/jenkins.log
```

### Problème : Jenkins derrière un firewall
Utilisez ngrok pour exposer Jenkins temporairement :
```bash
# Installez ngrok
ngrok http 8080

# Utilisez l'URL ngrok dans GitHub webhook
# Exemple: https://abc123.ngrok.io/github-webhook/
```

### Problème : Authentification
Vérifiez que le token GitHub a les permissions :
- `repo` (accès complet au repository)
- `admin:repo_hook` (gestion des webhooks)

## 📊 Monitoring

### Vérifications Régulières
1. **GitHub Webhooks** : Vérifiez les "Recent Deliveries"
2. **Jenkins Logs** : Surveillez les erreurs de déclenchement
3. **Pipeline Status** : Vérifiez que les builds se déclenchent

### Métriques à Surveiller
- Taux de succès des webhooks GitHub
- Temps de réponse Jenkins
- Fréquence des déclenchements

## 🚀 Optimisations

### Performance
- Utilisez le polling SCM comme fallback uniquement
- Configurez des timeouts appropriés
- Limitez les branches surveillées

### Sécurité
- Utilisez HTTPS pour les webhooks
- Configurez un secret webhook
- Limitez les permissions des tokens

## 📞 Support
Si les problèmes persistent :
1. Vérifiez les logs détaillés Jenkins et GitHub
2. Testez la connectivité réseau
3. Validez les permissions et credentials
4. Consultez la documentation officielle Jenkins/GitHub