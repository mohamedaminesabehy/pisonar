# 🔧 Guide de Dépannage Jenkins - Pipeline Non Déclenché

## 🚨 Problème : Le pipeline ne se déclenche pas lors des push sur main

### ✅ Solutions à Vérifier

#### 1. Configuration Jenkins - Plugins Requis
Vérifiez que ces plugins sont installés dans Jenkins :
```
- GitHub Plugin
- GitHub Branch Source Plugin  
- Pipeline: GitHub Groovy Libraries
- Generic Webhook Trigger Plugin
- Git Plugin
- Pipeline Plugin
```

#### 2. Configuration du Job Jenkins
Dans votre job Jenkins :

1. **Source Code Management** :
   - Repository URL : `https://github.com/mohamedaminesabehy/pisonar.git`
   - Credentials : Configurez un token GitHub
   - Branch Specifier : `*/main`

2. **Build Triggers** :
   - ✅ Cochez "GitHub hook trigger for GITScm polling"
   - ✅ Cochez "Poll SCM" avec `H/2 * * * *`

#### 3. Configuration GitHub Webhook
Dans votre repository GitHub :

1. Allez dans **Settings** → **Webhooks**
2. Cliquez **Add webhook**
3. **Payload URL** : `http://VOTRE_JENKINS_URL/github-webhook/`
4. **Content type** : `application/json`
5. **Events** : Sélectionnez "Just the push event"
6. ✅ Cochez "Active"

#### 4. Credentials Jenkins
Configurez les credentials dans Jenkins :

1. **Manage Jenkins** → **Manage Credentials**
2. Ajoutez :
   - `github-token` : Personal Access Token GitHub
   - `sonar-token` : Token SonarQube

#### 5. Vérification des Logs Jenkins
Consultez les logs dans :
- **Manage Jenkins** → **System Log**
- **Job** → **Console Output**
- **Job** → **Git Polling Log**

### 🔍 Commandes de Diagnostic

#### Test du Webhook GitHub
```bash
# Testez manuellement le webhook
curl -X POST http://VOTRE_JENKINS_URL/github-webhook/ \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "clone_url": "https://github.com/mohamedaminesabehy/pisonar.git"
    }
  }'
```

#### Vérification de la Connectivité
```bash
# Depuis Jenkins, testez l'accès à GitHub
curl -I https://api.github.com/repos/mohamedaminesabehy/pisonar

# Testez l'accès au repository
git ls-remote https://github.com/mohamedaminesabehy/pisonar.git
```

### 🛠️ Solutions Alternatives

#### Option 1 : Déclenchement Manuel Temporaire
```groovy
// Dans le Jenkinsfile, ajoutez un trigger périodique
triggers {
    cron('H/15 * * * *') // Toutes les 15 minutes
}
```

#### Option 2 : Generic Webhook Trigger
```groovy
triggers {
    GenericTrigger(
        genericVariables: [
            [key: 'ref', value: '$.ref']
        ],
        causeString: 'Triggered on $ref',
        token: 'pisonar-webhook-token',
        printContributedVariables: true,
        printPostContent: true,
        silentResponse: false,
        regexpFilterText: '$ref',
        regexpFilterExpression: 'refs/heads/main'
    )
}
```

#### Option 3 : GitHub Actions + Jenkins API
Utilisez le workflow GitHub Actions existant avec l'URL webhook correcte :
```yaml
# Dans .github/workflows/jenkins-trigger.yml
- name: Trigger Jenkins
  run: |
    curl -X POST "http://VOTRE_JENKINS_URL/job/VOTRE_JOB_NAME/build" \
      --user "USERNAME:API_TOKEN"
```

### 📋 Checklist de Vérification

- [ ] Plugins Jenkins installés
- [ ] Webhook GitHub configuré
- [ ] Credentials Jenkins configurés
- [ ] Job Jenkins configuré avec les bons triggers
- [ ] Firewall/réseau permet l'accès GitHub → Jenkins
- [ ] URL Jenkins accessible depuis GitHub
- [ ] Token GitHub a les permissions nécessaires
- [ ] Branch `main` existe et contient le Jenkinsfile

### 🆘 Support Supplémentaire

Si le problème persiste :
1. Vérifiez les logs Jenkins détaillés
2. Testez le webhook manuellement
3. Utilisez le polling SCM comme solution temporaire
4. Contactez l'administrateur Jenkins pour vérifier la configuration réseau

### 📞 Contacts Utiles
- Documentation Jenkins : https://www.jenkins.io/doc/
- GitHub Webhooks : https://docs.github.com/en/developers/webhooks-and-events/webhooks