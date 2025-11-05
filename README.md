# AI WeSmart - Action Trigger Interface

Interface web pour déclencher les workflows GitHub Actions depuis les emails de recommandations des agents IA.

## 🎯 Objectif

Permettre aux utilisateurs de valider des recommandations d'agents IA en cliquant sur un bouton dans leurs emails. Cette interface :
1. Reçoit les paramètres `report` et `finding` depuis l'URL
2. Déclenche le workflow GitHub Actions correspondant
3. Affiche le statut d'exécution

## 🚀 Installation

```bash
npm install
```

## 🔧 Configuration

1. Créer un GitHub Personal Access Token :
   - Aller sur https://github.com/settings/tokens
   - Créer un token avec la permission `workflow`
   - Copier le token

2. Créer le fichier `.env` :
   ```bash
   cp .env.example .env
   ```

3. Ajouter votre token dans `.env` :
   ```
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 💻 Développement Local

```bash
npm run dev
```

Ouvrir http://localhost:5173/?report=RPT-2025-11-05-abcd1234&finding=CM-005

## 📦 Déploiement sur Netlify

1. Créer un nouveau site sur Netlify
2. Connecter le repository GitHub
3. Configurer les variables d'environnement :
   - `GITHUB_TOKEN` : Votre token GitHub

4. Configurer le domaine personnalisé :
   - Aller dans Domain settings
   - Ajouter le domaine `ai.wesmart.com`
   - Configurer le DNS avec les nameservers Netlify
