# 🐳 Configuration SonarQube WSL Docker pour GitHub Actions

## 📋 Situation Actuelle Détectée

✅ **SonarQube fonctionne parfaitement dans WSL Docker** :
- **Container** : `sonarqube:8.9.7-community` 
- **Status** : Running (Up 3 hours)
- **Port** : `9000` exposé sur `0.0.0.0:9000`
- **IP WSL** : `172.28.83.134`
- **Accessible depuis Windows** : ✅ Confirmé

## 🚨 Problème GitHub Actions

**Le problème** : GitHub Actions ne peut pas accéder à `localhost:9000` ou `172.28.83.134:9000` car :
- Les runners GitHub sont sur des serveurs distants
- Votre WSL/Docker n'est accessible que localement

## 🔧 Solutions Disponibles

### 🚀 **Solution 1: Ngrok (Recommandée - Rapide)**

**Avantages** :
- ✅ Configuration en 5 minutes
- ✅ Fonctionne immédiatement avec votre setup WSL
- ✅ Gratuit pour commencer
- ✅ Aucune modification de votre Docker

**Installation et Configuration** :

```bash
# 1. Installer ngrok (vous avez déjà Chocolatey)
choco install ngrok

# 2. Créer un compte gratuit sur https://ngrok.com
# 3. Récupérer votre authtoken depuis le dashboard

# 4. Configurer l'authentification
ngrok config add-authtoken VOTRE_TOKEN_ICI

# 5. Exposer votre SonarQube WSL
ngrok http 172.28.83.134:9000
```

**Résultat** :
```
Session Status                online
Account                       votre-email (Plan: Free)
Version                       3.x.x
Region                        Europe (eu)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://172.28.83.134:9000
```

### 🌐 **Solution 2: Port Forwarding + IP Publique**

**Si vous avez une IP publique fixe** :
```bash
# Configurer le port forwarding sur votre routeur
# Port externe: 9000 -> IP interne: 172.28.83.134:9000
```

**URL GitHub** : `http://VOTRE_IP_PUBLIQUE:9000`
- **Votre IP actuelle** : `196.176.15.75`
- **Attention** : Sécurité à considérer (firewall, authentification)

### 🏠 **Solution 3: Self-Hosted Runner**

**Installer un runner GitHub sur votre machine** :
- Accès direct à `http://172.28.83.134:9000`
- Pas de configuration réseau
- Machine doit rester allumée

### ☁️ **Solution 4: Migration Cloud**

**Déployer SonarQube sur le cloud** :
- **SonarCloud** : Gratuit pour projets publics
- **VPS** : DigitalOcean, AWS, Azure (5-10€/mois)

## 🎯 **Recommandation Immédiate**

### **Option A: Ngrok (Test Rapide)**

1. **Installez ngrok** :
   ```powershell
   choco install ngrok
   ```

2. **Configurez** :
   ```bash
   # Récupérez votre token sur https://ngrok.com
   ngrok config add-authtoken VOTRE_TOKEN
   ```

3. **Exposez SonarQube** :
   ```bash
   ngrok http 172.28.83.134:9000
   ```

4. **Mettez à jour GitHub Secrets** :
   - `SONAR_HOST_URL` = `https://votre-url.ngrok.io`
   - `SONAR_TOKEN` = `piweb` (déjà configuré)

### **Option B: Self-Hosted Runner (Production)**

1. **Téléchargez le runner** depuis GitHub Settings > Actions > Runners
2. **Installez sur votre machine Windows**
3. **Configurez** `SONAR_HOST_URL` = `http://172.28.83.134:9000`

## 📊 **Comparaison des Solutions**

| Solution | Temps Setup | Coût | Fiabilité | Sécurité |
|----------|-------------|------|-----------|----------|
| **Ngrok** | 5 min | Gratuit | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Port Forward** | 15 min | Gratuit | ⭐⭐⭐⭐ | ⭐⭐ |
| **Self-Runner** | 20 min | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cloud** | 30 min | 5€/mois | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 **Prochaines Étapes**

1. **Choisissez une solution** (Ngrok recommandé pour commencer)
2. **Configurez l'accès externe**
3. **Mettez à jour `SONAR_HOST_URL`** dans GitHub Secrets
4. **Testez le pipeline**

## 💡 **Notes Importantes**

- ✅ Votre SonarQube WSL Docker fonctionne parfaitement
- ✅ Le token `piweb` est déjà configuré
- ✅ Seul l'accès externe depuis GitHub Actions manque
- 🔄 Ngrok est parfait pour tester rapidement
- 🏭 Self-hosted runner est idéal pour la production

**Quelle solution préférez-vous ?**