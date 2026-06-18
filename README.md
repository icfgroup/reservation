# PrendreUnRDV — Plateforme de Réservation de Rendez-vous en Ligne

Une application Web moderne, performante et hautement sécurisée pour planifier et gérer les rendez-vous en ligne de manière autonome. Ce projet est optimisé pour un déploiement continu sur **Netlify** et intègre une synchronisation fluide avec **Appwrite**.

---

## 🚀 Fonctionnalités Clés

### 👤 Espace Client
- **Landing Page Premium** : Page de présentation soignée avec hero header animé, présentation des fonctionnalités, statistiques d'utilisation et section témoignages.
- **Formulaire d'inscription & Connexion** : Validation stricte des données (adresses e-mail, numéros de téléphone français) et indicateur visuel en temps réel de la robustesse du mot de passe.
- **Wizard de réservation en 3 étapes** : Parcours fluide (sélection de la date → choix d'un créneau disponible → confirmation avec notes facultatives).
- **Dashboard Personnel** : Consultation des rendez-vous à venir, historique des interventions passées, modification du profil, changement de mot de passe sécurisé et droit à l'effacement (RGPD).

### 🛠️ Espace Administrateur
- **Indicateurs de Fréquentation & Statistiques enrichies** : Tableau de bord complet avec graphiques Recharts (évolution mensuelle, répartition des statuts) et indicateurs d'activité (taux de présence, fréquence moyenne, nouveaux inscrits, Top 5 des clients les plus réguliers).
- **Gestion du Planning & Disponibilités** : Paramétrage des jours ouvrés de la semaine via des checkboxes interactives, heures d'ouverture/fermeture de la journée, durée personnalisable des créneaux de consultation.
- **Fermetures Exceptionnelles & Congés** : Possibilité de bloquer des dates spécifiques ou d'enregistrer des périodes de vacances scolaires/jours fériés.
- **Registre & Exports** : Tableur complet des réservations avec filtres avancés (recherche textuelle, statut, date) et boutons d'export instantané au format **CSV**, **Microsoft Excel (XLS)** et **imprimable/PDF**.
- **Gestion d'Annuaire** : Consultation des fiches clients, suspension ou réactivation d'accès instantanée, et édition inline des informations de contact d'un client.
- **SMTP Simulé & Modèles d'Emails** : Éditeur d'e-mails HTML pour personnaliser les 5 types de courriels automatiques (inscription, confirmation, rappel, report, annulation).
- **Journal d'Audit** : Historique transparent et immuable de toutes les actions clés de sécurité.

---

## 🛠️ Stack Technique

- **Frontend** : React 19 (TypeScript), Vite 6, Tailwind CSS v4, Lucide React (Icônes), Recharts (Graphiques).
- **Backend / BaaS** : Appwrite (Gestion optionnelle des utilisateurs, réservations, configurations et logs d'audit).
- **Mode Démo** : Basculement automatique sur `localStorage` avec synchronisation locale si Appwrite n'est pas connecté.
- **Déploiement** : Prêt pour Netlify avec règles de réécriture SPA (`netlify.toml`) et en-têtes de sécurité renforcés.

---

## 💻 Installation & Lancement Local

### Prérequis
- [Node.js](https://nodejs.org/) (Version 18 ou supérieure recommandée)

### Instructions
1. **Cloner ou télécharger** le dossier du projet.
2. **Installer les dépendances** :
   ```bash
   npm install
   ```
3. **Configurer les variables d'environnement** :
   Renommez ou créez un fichier `.env` à la racine à partir du modèle `.env.example` :
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=votre_project_id
   ```
4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible localement à l'adresse : [http://localhost:3000](http://localhost:3000)

---

## 📤 Déploiement sur Netlify

Cette plateforme est entièrement configurée pour tourner sur Netlify comme une Application Single Page (SPA). 

### Fichier `netlify.toml`
Le fichier de configuration à la racine prend en charge :
- Le routing rewrite (`/* -> /index.html` avec statut 200) pour empêcher les erreurs 404 lors du rafraîchissement d'une page.
- La compilation via le script de build standard de Vite.
- L'injection d'en-têtes HTTP de sécurité (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

### Variables d'environnement Netlify
Pour coupler l'application à votre instance Appwrite de production, configurez les variables d'environnement suivantes dans les paramètres du site de votre console Netlify :
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`

---

## 🧪 Identifiants de Test (Mode Bac à Sable)

Pour tester rapidement l'application en mode local ou de démonstration, deux profils pré-configurés sont disponibles via le bandeau **Mode Test** de l'écran d'authentification :

* **Compte Client de Test** :
  - **Email** : `jean.dupont@gmail.com`
  - **Mot de passe** : `password123`
* **Compte Administrateur de Test** :
  - **Email** : `admin@rdv.fr`
  - **Mot de passe** : `admin`

---

## 📄 Licence & Conformité
- Conforme au **RGPD** (options d'effacement et de modification des données personnelles).
- Code distribué sous licence Apache-2.0.
