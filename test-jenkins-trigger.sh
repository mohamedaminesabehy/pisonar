#!/bin/bash

# 🧪 Script de Test - Déclenchement Pipeline Jenkins
# Usage: ./test-jenkins-trigger.sh [JENKINS_URL]

set -e

# Configuration
JENKINS_URL=${1:-"http://localhost:8080"}
WEBHOOK_URL="${JENKINS_URL}/github-webhook/"
REPO_URL="https://github.com/mohamedaminesabehy/pisonar.git"

echo "🚀 Test de déclenchement Jenkins Pipeline"
echo "📍 Jenkins URL: $JENKINS_URL"
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo ""

# Test 1: Vérification de la connectivité Jenkins
echo "🔍 Test 1: Connectivité Jenkins..."
if curl -s -I "$JENKINS_URL" | grep -q "200\|302"; then
    echo "✅ Jenkins accessible"
else
    echo "❌ Jenkins non accessible à $JENKINS_URL"
    echo "💡 Vérifiez que Jenkins est démarré et accessible"
    exit 1
fi

# Test 2: Test du webhook GitHub
echo ""
echo "🔍 Test 2: Webhook GitHub..."
WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: push" \
    -d '{
        "ref": "refs/heads/main",
        "after": "test123456789",
        "repository": {
            "clone_url": "'$REPO_URL'",
            "full_name": "mohamedaminesabehy/pisonar"
        },
        "pusher": {
            "name": "test-user"
        }
    }' -o /tmp/webhook_response.txt)

HTTP_CODE="${WEBHOOK_RESPONSE: -3}"
RESPONSE_BODY=$(cat /tmp/webhook_response.txt)

echo "📊 Code de réponse: $HTTP_CODE"
echo "📄 Réponse: $RESPONSE_BODY"

if [[ "$HTTP_CODE" == "200" ]]; then
    echo "✅ Webhook accepté par Jenkins"
elif [[ "$HTTP_CODE" == "302" ]]; then
    echo "✅ Webhook redirigé (probablement OK)"
else
    echo "❌ Webhook échoué (Code: $HTTP_CODE)"
    echo "💡 Vérifiez la configuration du plugin GitHub dans Jenkins"
fi

# Test 3: Vérification de l'API Jenkins
echo ""
echo "🔍 Test 3: API Jenkins..."
API_RESPONSE=$(curl -s -w "%{http_code}" "$JENKINS_URL/api/json" -o /tmp/api_response.txt)
API_CODE="${API_RESPONSE: -3}"

if [[ "$API_CODE" == "200" ]]; then
    echo "✅ API Jenkins accessible"
    # Extraire la version Jenkins si possible
    if command -v jq &> /dev/null; then
        JENKINS_VERSION=$(cat /tmp/api_response.txt | jq -r '.version // "unknown"')
        echo "📋 Version Jenkins: $JENKINS_VERSION"
    fi
elif [[ "$API_CODE" == "403" ]]; then
    echo "⚠️ API Jenkins accessible mais authentification requise"
else
    echo "❌ API Jenkins non accessible (Code: $API_CODE)"
fi

# Test 4: Vérification des jobs
echo ""
echo "🔍 Test 4: Recherche du job pisonar..."
JOBS_RESPONSE=$(curl -s "$JENKINS_URL/api/json?tree=jobs[name]")
if echo "$JOBS_RESPONSE" | grep -q "pisonar"; then
    echo "✅ Job pisonar trouvé"
else
    echo "⚠️ Job pisonar non trouvé"
    echo "💡 Créez un job Pipeline nommé 'pisonar-pipeline' ou similaire"
fi

# Test 5: Test de connectivité GitHub
echo ""
echo "🔍 Test 5: Connectivité GitHub..."
if curl -s -I "https://api.github.com/repos/mohamedaminesabehy/pisonar" | grep -q "200"; then
    echo "✅ Repository GitHub accessible"
else
    echo "❌ Repository GitHub non accessible"
    echo "💡 Vérifiez l'URL du repository"
fi

# Résumé
echo ""
echo "📋 RÉSUMÉ DES TESTS"
echo "=================="
echo "Jenkins accessible: $(curl -s -I "$JENKINS_URL" | grep -q "200\|302" && echo "✅" || echo "❌")"
echo "Webhook fonctionnel: $([[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "302" ]] && echo "✅" || echo "❌")"
echo "API Jenkins: $([[ "$API_CODE" == "200" || "$API_CODE" == "403" ]] && echo "✅" || echo "❌")"
echo "GitHub accessible: $(curl -s -I "https://api.github.com/repos/mohamedaminesabehy/pisonar" | grep -q "200" && echo "✅" || echo "❌")"

echo ""
echo "🔧 ACTIONS RECOMMANDÉES"
echo "======================="

if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "302" ]]; then
    echo "1. Vérifiez que le plugin GitHub est installé dans Jenkins"
    echo "2. Configurez un job Pipeline avec le repository GitHub"
    echo "3. Activez 'GitHub hook trigger for GITScm polling'"
fi

if ! echo "$JOBS_RESPONSE" | grep -q "pisonar"; then
    echo "4. Créez un job Pipeline pour le projet pisonar"
fi

echo "5. Configurez le webhook dans GitHub:"
echo "   URL: $WEBHOOK_URL"
echo "   Content-Type: application/json"
echo "   Events: Push events"

echo ""
echo "📚 DOCUMENTATION"
echo "==============="
echo "Guide complet: jenkins-webhook-setup.md"
echo "Dépannage: jenkins-troubleshooting.md"

# Nettoyage
rm -f /tmp/webhook_response.txt /tmp/api_response.txt

echo ""
echo "🎯 Test terminé!"