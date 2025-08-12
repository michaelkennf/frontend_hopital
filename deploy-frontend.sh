#!/bin/bash

# Script de déploiement du frontend en production
# Usage: ./deploy-frontend.sh [production|staging]

set -e  # Arrêter en cas d'erreur

# Configuration
ENVIRONMENT=${1:-production}
BUILD_DIR="dist"
DEPLOY_DIR="/var/www/hopital-apotres/frontend"
BACKUP_DIR="/var/www/hopital-apotres/backups/frontend"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ]; then
        error "Ce script doit être exécuté depuis le répertoire frontend"
        exit 1
    fi
    
    success "Prérequis vérifiés"
}

# Installation des dépendances
install_dependencies() {
    log "📦 Installation des dépendances..."
    
    # Supprimer node_modules existant
    if [ -d "node_modules" ]; then
        log "Suppression de node_modules existant..."
        rm -rf node_modules
    fi
    
    # Supprimer package-lock.json
    if [ -f "package-lock.json" ]; then
        log "Suppression de package-lock.json existant..."
        rm -f package-lock.json
    fi
    
    # Installer les dépendances
    npm install
    
    success "Dépendances installées"
}

# Construction de l'application
build_application() {
    log "🔨 Construction de l'application pour $ENVIRONMENT..."
    
    # Nettoyer le répertoire de build
    if [ -d "$BUILD_DIR" ]; then
        log "Nettoyage du répertoire de build..."
        rm -rf "$BUILD_DIR"
    fi
    
    # Construire l'application
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build
    else
        npm run build:staging
    fi
    
    # Vérifier que le build a réussi
    if [ ! -d "$BUILD_DIR" ] || [ ! -f "$BUILD_DIR/index.html" ]; then
        error "La construction a échoué"
        exit 1
    fi
    
    success "Application construite"
}

# Création de la sauvegarde
create_backup() {
    log "💾 Création de la sauvegarde..."
    
    # Créer le répertoire de sauvegarde s'il n'existe pas
    sudo mkdir -p "$BACKUP_DIR"
    
    # Créer la sauvegarde avec timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_NAME="frontend_backup_$TIMESTAMP.tar.gz"
    
    if [ -d "$DEPLOY_DIR" ]; then
        log "Création de la sauvegarde: $BACKUP_NAME"
        sudo tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$DEPLOY_DIR" .
        success "Sauvegarde créée: $BACKUP_NAME"
    else
        warning "Répertoire de déploiement non trouvé, pas de sauvegarde nécessaire"
    fi
}

# Déploiement de l'application
deploy_application() {
    log "🚀 Déploiement de l'application..."
    
    # Créer le répertoire de déploiement s'il n'existe pas
    sudo mkdir -p "$DEPLOY_DIR"
    
    # Copier les fichiers construits
    log "Copie des fichiers vers $DEPLOY_DIR..."
    sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"
    
    # Définir les bonnes permissions
    log "Configuration des permissions..."
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR"
    
    success "Application déployée"
}

# Nettoyage des anciennes sauvegardes
cleanup_old_backups() {
    log "🧹 Nettoyage des anciennes sauvegardes..."
    
    # Garder seulement les 10 dernières sauvegardes
    cd "$BACKUP_DIR"
    BACKUP_COUNT=$(ls -1 *.tar.gz 2>/dev/null | wc -l)
    
    if [ "$BACKUP_COUNT" -gt 10 ]; then
        log "Suppression des anciennes sauvegardes..."
        ls -1t *.tar.gz | tail -n +11 | xargs -r sudo rm -f
        success "Anciennes sauvegardes supprimées"
    else
        log "Nombre de sauvegardes correct ($BACKUP_COUNT/10)"
    fi
}

# Vérification du déploiement
verify_deployment() {
    log "🔍 Vérification du déploiement..."
    
    # Vérifier que les fichiers sont présents
    if [ ! -f "$DEPLOY_DIR/index.html" ]; then
        error "Fichier index.html non trouvé après déploiement"
        exit 1
    fi
    
    # Vérifier que le serveur web peut accéder aux fichiers
    if ! sudo -u www-data test -r "$DEPLOY_DIR/index.html"; then
        error "Le serveur web ne peut pas accéder aux fichiers"
        exit 1
    fi
    
    success "Déploiement vérifié"
}

# Redémarrage des services
restart_services() {
    log "🔄 Redémarrage des services..."
    
    # Redémarrer Nginx
    if command -v nginx &> /dev/null; then
        log "Redémarrage de Nginx..."
        sudo systemctl reload nginx
        success "Nginx redémarré"
    fi
    
    # Redémarrer Apache (si utilisé)
    if command -v apache2 &> /dev/null; then
        log "Redémarrage d'Apache..."
        sudo systemctl reload apache2
        success "Apache redémarré"
    fi
}

# Affichage des informations de déploiement
show_deployment_info() {
    log "📊 Informations de déploiement:"
    echo "   Environnement: $ENVIRONMENT"
    echo "   Répertoire de déploiement: $DEPLOY_DIR"
    echo "   Taille du build: $(du -sh $BUILD_DIR | cut -f1)"
    echo "   Fichiers déployés: $(find $BUILD_DIR -type f | wc -l)"
    
    if [ -d "$BACKUP_DIR" ]; then
        echo "   Sauvegardes disponibles: $(ls -1 $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l)"
    fi
}

# Fonction principale
main() {
    log "🚀 DÉBUT DU DÉPLOIEMENT FRONTEND - $ENVIRONMENT"
    log "================================================"
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Installation des dépendances
    install_dependencies
    
    # Construction de l'application
    build_application
    
    # Création de la sauvegarde
    create_backup
    
    # Déploiement de l'application
    deploy_application
    
    # Vérification du déploiement
    verify_deployment
    
    # Nettoyage des anciennes sauvegardes
    cleanup_old_backups
    
    # Redémarrage des services
    restart_services
    
    # Affichage des informations
    show_deployment_info
    
    success "🎉 DÉPLOIEMENT FRONTEND TERMINÉ AVEC SUCCÈS !"
    log "L'application est maintenant accessible en production"
}

# Gestion des erreurs
trap 'error "Erreur survenue à la ligne $LINENO. Arrêt du déploiement."; exit 1' ERR

# Exécution du script
main "$@" 