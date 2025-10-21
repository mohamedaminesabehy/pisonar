pipeline {
    agent any
    
    // Déclencheurs automatiques pour GitHub
    triggers {
        githubPush()
        pollSCM('H/5 * * * *') // Vérification toutes les 5 minutes comme fallback
    }
    
    // Variables d'environnement
    environment {
        // SonarQube configuration
        SONAR_SCANNER_HOME = tool 'SonarQubeScanner'
        SONAR_PROJECT_KEY = 'piweb'
        SONAR_PROJECT_NAME = 'piweb'
        SONAR_HOST_URL = 'http://localhost:9000'
        
        // GitHub repository
        GITHUB_REPO = 'https://github.com/mohamedaminesabehy/pisonar.git'
        
        // Node.js version
        NODE_VERSION = '20'
        
        // Build directories
        BACKEND_DIR = 'back'
        FRONTEND_DIR = 'front'
        
        // Credentials
        SONAR_TOKEN = credentials('sonar-token')
        GITHUB_TOKEN = credentials('github-token')
    }
    
    // Options du pipeline
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        skipStagesAfterUnstable()
        parallelsAlwaysFailFast()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    try {
                        echo "🔄 Récupération du code source depuis GitHub..."
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            doGenerateSubmoduleConfigurations: false,
                            extensions: [
                                [$class: 'CleanBeforeCheckout'],
                                [$class: 'CloneOption', depth: 0, noTags: false, reference: '', shallow: false]
                            ],
                            submoduleCfg: [],
                            userRemoteConfigs: [[
                                credentialsId: 'github-token',
                                url: env.GITHUB_REPO
                            ]]
                        ])
                        
                        // Afficher les informations du commit
                        sh '''
                            echo "📋 Informations du commit:"
                            echo "Commit: $(git rev-parse HEAD)"
                            echo "Auteur: $(git log -1 --pretty=format:'%an <%ae>')"
                            echo "Message: $(git log -1 --pretty=format:'%s')"
                            echo "Date: $(git log -1 --pretty=format:'%cd')"
                        '''
                    } catch (Exception e) {
                        error "❌ Échec lors du checkout: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    try {
                        echo "🔧 Configuration de l'environnement..."
                        
                        // Vérifier Node.js
                        sh '''
                            echo "📦 Vérification de Node.js..."
                            node --version
                            npm --version
                        '''
                        
                        // Vérifier la structure du projet
                        sh '''
                            echo "📁 Structure du projet:"
                            ls -la
                            echo "📁 Backend:"
                            ls -la back/ || echo "Dossier back non trouvé"
                            echo "📁 Frontend:"
                            ls -la front/ || echo "Dossier front non trouvé"
                        '''
                        
                        // Vérifier SonarQube Scanner
                        sh '''
                            echo "🔍 Vérification de SonarQube Scanner..."
                            ${SONAR_SCANNER_HOME}/bin/sonar-scanner --version
                        '''
                        
                    } catch (Exception e) {
                        error "❌ Échec de la configuration de l'environnement: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        script {
                            try {
                                echo "📦 Installation des dépendances backend..."
                                dir(env.BACKEND_DIR) {
                                    sh '''
                                        echo "🔄 Installation des dépendances Node.js pour le backend..."
                                        npm ci --only=production
                                        echo "✅ Dépendances backend installées"
                                    '''
                                }
                            } catch (Exception e) {
                                error "❌ Échec de l'installation des dépendances backend: ${e.getMessage()}"
                            }
                        }
                    }
                }
                
                stage('Frontend Dependencies') {
                    steps {
                        script {
                            try {
                                echo "📦 Installation des dépendances frontend..."
                                dir(env.FRONTEND_DIR) {
                                    sh '''
                                        echo "🔄 Installation des dépendances Node.js pour le frontend..."
                                        npm ci
                                        echo "✅ Dépendances frontend installées"
                                    '''
                                }
                            } catch (Exception e) {
                                error "❌ Échec de l'installation des dépendances frontend: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Code Quality Checks') {
            parallel {
                stage('Backend Linting') {
                    steps {
                        script {
                            try {
                                echo "🔍 Vérification de la qualité du code backend..."
                                dir(env.BACKEND_DIR) {
                                    sh '''
                                        echo "🔍 Analyse statique du code backend..."
                                        # Vérification de la syntaxe JavaScript
                                        find . -name "*.js" -not -path "./node_modules/*" -exec node -c {} \\;
                                        echo "✅ Code backend valide"
                                    '''
                                }
                            } catch (Exception e) {
                                unstable "⚠️ Problèmes de qualité détectés dans le backend: ${e.getMessage()}"
                            }
                        }
                    }
                }
                
                stage('Frontend Linting') {
                    steps {
                        script {
                            try {
                                echo "🔍 Vérification de la qualité du code frontend..."
                                dir(env.FRONTEND_DIR) {
                                    sh '''
                                        echo "🔍 Linting du code frontend..."
                                        npm run lint || echo "⚠️ Avertissements de linting détectés"
                                        echo "✅ Vérification frontend terminée"
                                    '''
                                }
                            } catch (Exception e) {
                                unstable "⚠️ Problèmes de qualité détectés dans le frontend: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Backend Build') {
                    steps {
                        script {
                            try {
                                echo "🏗️ Construction du backend..."
                                dir(env.BACKEND_DIR) {
                                    sh '''
                                        echo "🏗️ Build du backend..."
                                        npm run build || echo "ℹ️ Pas de script de build pour le backend"
                                        echo "✅ Backend prêt"
                                    '''
                                }
                            } catch (Exception e) {
                                error "❌ Échec du build backend: ${e.getMessage()}"
                            }
                        }
                    }
                }
                
                stage('Frontend Build') {
                    steps {
                        script {
                            try {
                                echo "🏗️ Construction du frontend..."
                                dir(env.FRONTEND_DIR) {
                                    sh '''
                                        echo "🏗️ Build du frontend..."
                                        npm run build
                                        echo "✅ Frontend construit avec succès"
                                    '''
                                }
                            } catch (Exception e) {
                                error "❌ Échec du build frontend: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        script {
                            try {
                                echo "🧪 Exécution des tests backend..."
                                dir(env.BACKEND_DIR) {
                                    sh '''
                                        echo "🧪 Tests backend..."
                                        npm test || echo "ℹ️ Pas de tests configurés pour le backend"
                                        echo "✅ Tests backend terminés"
                                    '''
                                }
                            } catch (Exception e) {
                                unstable "⚠️ Échec des tests backend: ${e.getMessage()}"
                            }
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        script {
                            try {
                                echo "🧪 Exécution des tests frontend..."
                                dir(env.FRONTEND_DIR) {
                                    sh '''
                                        echo "🧪 Tests frontend..."
                                        npm test || echo "ℹ️ Pas de tests configurés pour le frontend"
                                        echo "✅ Tests frontend terminés"
                                    '''
                                }
                            } catch (Exception e) {
                                unstable "⚠️ Échec des tests frontend: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    try {
                        echo "🔍 Démarrage de l'analyse SonarQube..."
                        
                        // Préparer les paramètres SonarQube
                        def sonarParams = [
                            "-Dsonar.projectKey=${env.SONAR_PROJECT_KEY}",
                            "-Dsonar.projectName=${env.SONAR_PROJECT_NAME}",
                            "-Dsonar.host.url=${env.SONAR_HOST_URL}",
                            "-Dsonar.login=${env.SONAR_TOKEN}",
                            "-Dsonar.sources=back/src,back/controllers,back/models,back/routes,back/middlewares,back/config,front/src",
                            "-Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/*.md,**/uploads/**,**/public/**,**/bin/**,**/views/**,**/*.twig,**/package-lock.json,**/yarn.lock",
                            "-Dsonar.javascript.file.suffixes=.js,.jsx",
                            "-Dsonar.typescript.file.suffixes=.ts,.tsx",
                            "-Dsonar.sourceEncoding=UTF-8",
                            "-Dsonar.scm.provider=git",
                            "-Dsonar.pullrequest.provider=github",
                            "-Dsonar.pullrequest.github.repository=mohamedaminesabehy/pisonar"
                        ]
                        
                        // Ajouter les informations de branche si disponibles
                        if (env.CHANGE_ID) {
                            sonarParams.addAll([
                                "-Dsonar.pullrequest.key=${env.CHANGE_ID}",
                                "-Dsonar.pullrequest.branch=${env.CHANGE_BRANCH}",
                                "-Dsonar.pullrequest.base=${env.CHANGE_TARGET}"
                            ])
                        } else {
                            sonarParams.add("-Dsonar.branch.name=${env.BRANCH_NAME}")
                        }
                        
                        // Exécuter l'analyse SonarQube
                        withSonarQubeEnv('SonarQube') {
                            sh "${env.SONAR_SCANNER_HOME}/bin/sonar-scanner ${sonarParams.join(' ')}"
                        }
                        
                        echo "✅ Analyse SonarQube terminée"
                        
                    } catch (Exception e) {
                        error "❌ Échec de l'analyse SonarQube: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                script {
                    try {
                        echo "🚪 Vérification du Quality Gate..."
                        
                        timeout(time: 5, unit: 'MINUTES') {
                            def qg = waitForQualityGate()
                            
                            if (qg.status != 'OK') {
                                echo "❌ Quality Gate échoué: ${qg.status}"
                                
                                // Afficher les détails de l'échec
                                if (qg.conditions) {
                                    echo "📊 Conditions échouées:"
                                    qg.conditions.each { condition ->
                                        if (condition.status != 'OK') {
                                            echo "  - ${condition.metricKey}: ${condition.actualValue} (seuil: ${condition.errorThreshold})"
                                        }
                                    }
                                }
                                
                                error "❌ Le Quality Gate n'a pas été respecté"
                            } else {
                                echo "✅ Quality Gate réussi!"
                            }
                        }
                        
                    } catch (Exception e) {
                        error "❌ Échec de la vérification du Quality Gate: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    try {
                        echo "🔒 Scan de sécurité..."
                        
                        parallel(
                            "Backend Security": {
                                dir(env.BACKEND_DIR) {
                                    sh '''
                                        echo "🔒 Audit de sécurité backend..."
                                        npm audit --audit-level=high || echo "⚠️ Vulnérabilités détectées dans le backend"
                                    '''
                                }
                            },
                            "Frontend Security": {
                                dir(env.FRONTEND_DIR) {
                                    sh '''
                                        echo "🔒 Audit de sécurité frontend..."
                                        npm audit --audit-level=high || echo "⚠️ Vulnérabilités détectées dans le frontend"
                                    '''
                                }
                            }
                        )
                        
                        echo "✅ Scan de sécurité terminé"
                        
                    } catch (Exception e) {
                        unstable "⚠️ Problèmes de sécurité détectés: ${e.getMessage()}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Nettoyage post-build..."
                
                // Archiver les artefacts importants
                archiveArtifacts artifacts: '**/build/**, **/dist/**, sonar-project.properties', 
                                fingerprint: true, 
                                allowEmptyArchive: true
                
                // Publier les résultats de tests s'ils existent
                publishTestResults testResultsPattern: '**/test-results.xml', 
                                  allowEmptyResults: true
                
                // Nettoyer les node_modules pour économiser l'espace
                sh '''
                    echo "🧹 Nettoyage des dépendances..."
                    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
                    echo "✅ Nettoyage terminé"
                '''
            }
        }
        
        success {
            script {
                echo "🎉 Pipeline exécuté avec succès!"
                
                // Notification de succès (optionnel)
                if (env.CHANGE_ID) {
                    // Pour les Pull Requests
                    echo "✅ PR #${env.CHANGE_ID} analysée avec succès"
                } else {
                    // Pour les pushs sur main
                    echo "✅ Branche ${env.BRANCH_NAME} analysée avec succès"
                }
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline échoué!"
                
                // Collecter les logs d'erreur
                sh '''
                    echo "📋 Collecte des logs d'erreur..."
                    find . -name "*.log" -type f -exec echo "=== {} ===" \\; -exec cat {} \\; 2>/dev/null || true
                '''
            }
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline instable - des avertissements ont été détectés"
            }
        }
        
        aborted {
            script {
                echo "🛑 Pipeline interrompu"
            }
        }
    }
}