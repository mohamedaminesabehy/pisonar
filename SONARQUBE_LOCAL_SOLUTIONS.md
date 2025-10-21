# 🔧 Solutions SonarQube Local pour GitHub Actions

## 🎯 Objectif
Rendre votre SonarQube local (`localhost:9000`) accessible depuis GitHub Actions.

## 🚀 Solution 1: Ngrok (Recommandée - Simple et Rapide)

### Installation et Configuration

1. **Télécharger ngrok** :
   ```bash
   # Téléchargez depuis https://ngrok.com/download
   # Ou via chocolatey (Windows)
   choco install ngrok
   ```

2. **Créer un compte gratuit** sur [ngrok.com](https://ngrok.com)

3. **Authentifier ngrok** :
   ```bash
   ngrok config add-authtoken VOTRE_TOKEN_NGROK
   ```

4. **Exposer SonarQube** :
   ```bash
   # Assurez-vous que SonarQube fonctionne sur localhost:9000
   ngrok http 9000
   ```

5. **Récupérer l'URL publique** :
   ```
   Forwarding    https://abc123.ngrok.io -> http://localhost:9000
   ```

### Configuration GitHub Secrets
```
SONAR_TOKEN=ef622d298994cca3241983d4a95284bc2190f06b
SONAR_HOST_URL=https://abc123.ngrok.io
```

### ⚠️ Limitations Ngrok Gratuit
- URL change à chaque redémarrage
- Limite de 2 heures de session
- Bande passante limitée

## 🌐 Solution 2: Serveur SonarQube Public

### Option A: VPS/Cloud
1. **Déployer SonarQube** sur un VPS (DigitalOcean, AWS, etc.)
2. **Configurer le firewall** pour ouvrir le port 9000
3. **Utiliser l'IP publique** : `http://VOTRE_IP:9000`

### Option B: Docker + Port Forwarding
```bash
# Si vous avez un routeur avec IP publique
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```
Puis configurer le port forwarding sur votre routeur.

## 🏠 Solution 3: Self-Hosted Runner

### Installation Runner GitHub
1. **Aller dans Settings** > Actions > Runners
2. **Cliquer "New self-hosted runner"**
3. **Suivre les instructions** pour votre OS
4. **Installer sur votre machine** locale

### Avantages
- ✅ Accès direct à `localhost:9000`
- ✅ Pas de configuration réseau
- ✅ Contrôle total

### Inconvénients
- ❌ Machine doit rester allumée
- ❌ Configuration plus complexe
- ❌ Maintenance requise

## 🔄 Solution 4: Tunnel SSH Reverse

### Configuration
```bash
# Sur un serveur avec IP publique
ssh -R 9000:localhost:9000 user@votre-serveur-public.com

# Puis utiliser
SONAR_HOST_URL=http://votre-serveur-public.com:9000
```

## 📋 Comparaison des Solutions

| Solution | Complexité | Coût | Fiabilité | Recommandation |
|----------|------------|------|-----------|----------------|
| **Ngrok** | ⭐ Facile | Gratuit/Payant | ⭐⭐⭐ | 🥇 **Meilleure pour tests** |
| **VPS Cloud** | ⭐⭐⭐ Moyenne | 5-20€/mois | ⭐⭐⭐⭐⭐ | 🥈 **Meilleure pour production** |
| **Self-Hosted Runner** | ⭐⭐⭐⭐ Complexe | Gratuit | ⭐⭐⭐ | 🥉 **Si contrôle nécessaire** |
| **Tunnel SSH** | ⭐⭐⭐⭐⭐ Très complexe | Variable | ⭐⭐ | ❌ **Non recommandé** |

## 🎯 Ma Recommandation pour Vous

### Pour Commencer Rapidement: **Ngrok**
```bash
# 1. Installer ngrok
# 2. Démarrer SonarQube local
# 3. Exposer avec ngrok
ngrok http 9000

# 4. Mettre à jour le secret GitHub
SONAR_HOST_URL=https://votre-url-ngrok.ngrok.io
```

### Pour Production: **VPS + SonarQube**
- Plus stable et professionnel
- URL fixe
- Performances optimales

## 🚀 Étapes Immédiates avec Ngrok

1. **Téléchargez ngrok** : https://ngrok.com/download
2. **Créez un compte gratuit**
3. **Installez et authentifiez** ngrok
4. **Démarrez SonarQube** sur votre machine
5. **Exposez avec** : `ngrok http 9000`
6. **Copiez l'URL HTTPS** générée
7. **Mettez à jour** le secret `SONAR_HOST_URL` sur GitHub
8. **Relancez** le pipeline GitHub Actions

Voulez-vous que je vous guide étape par étape avec ngrok ?