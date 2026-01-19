# 🎲 RPG Booking - Application de Réservation de Salles de JdR

**Réalisé par Pierre TONDEUX le 19/01/2026**

Ce projet est une application Frontend réalisée avec **React** et **TypeScript** permettant la gestion et la réservation de salles pour des associations de Jeux de Rôle.

Le projet utilise un **Backend Mocké** (simulation d'API) pour permettre une utilisation complète sans serveur distant, incluant la gestion des délais réseaux et la persistance de session.

## 🚀 Fonctionnalités Implémentées (Phase 1)

* **Authentification & Rôles** :
    * Simulation de connexion (JWT Mock).
    * Gestion des rôles : **Admin** (Responsable) vs **Joueur**.
    
* **Navigation** :
    
    * Barre de navigation contextuelle.
* **Réservation** :
    * Consultation des salles et de leurs équipements.
    * Calendrier des disponibilités (Vue hebdomadaire).
    * Prise de réservation via Modal.
* **Tableaux de bord** :
    * **Joueur** : Visualisation de "Mes parties" et leur statut.
    * **Admin** : Validation ou refus des demandes de réservation.

## 🛠️ Stack Technique

* **Core** : React 18, TypeScript, Vite.
* **Routing** : React Router DOM v6.
* **Styling** : CSS Modules / Pure CSS (Thème Dark, Responsive).
* **Data** : Service Mock asynchrone (Simulation CRUD & Latence).

## 📦 Installation et Lancement

1.  **Cloner le projet**
    ```bash
    git clone https://github.com/PierreTDX/JDRBook.git
    cd JDRBook
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement**
    ```bash
    npm run dev
    ```

4.  Ouvrir `http://localhost:5173` dans votre navigateur.

## 🔑 Comptes de Test (Mock)

L'application simule une base de données. Utilisez ces comptes pour tester les différents rôles :

| Rôle | Email | Mot de passe | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@test.com` | `admin123` | Admin de "L'Ordre du D20" + Joueur ailleurs. Accès au menu Admin. |
| **Joueur** | `player@test.com` | `player123` | Joueur simple. Ne voit pas le menu Admin. |

> **Note :** Le mot de passe importe peu dans le mock (tant qu'il fait > 3 caractères), mais l'email détermine le profil chargé.

## 📂 Structure du Projet

```text
src/
├── assets/          # Images et styles globaux
├── components/      # Composants réutilisables (Layout, Cards...)
├── contexts/        # (Optionnel) Contextes React
├── pages/           # Vues principales (Login, Dashboard, RoomDetails...)
├── services/        # Logique métier et Mock API (api.mock.ts)
├── utils/           # Fonctions utilitaires (dates...)
├── App.tsx          # Configuration du Router et Layout global
├── types.ts         # Définitions des interfaces TypeScript
└── index.css        # Variables CSS et Reset
```


## 🚧 Reste à faire (Roadmap)
Voici les tâches identifiées pour finaliser le projet ou passer à la phase suivante :

Fonctionnalités manquantes (UI)  
- Création de Salle (Admin) : Ajouter le formulaire pour qu'un responsable puisse créer une nouvelle salle et définir ses créneaux (POST /rooms).
- Annulation (Joueur) : Permettre à un joueur d'annuler sa propre réservation ("Se désister").
- Édition de profil : Page pour modifier son pseudo ou mot de passe.
-  Historique : Filtrer les parties passées vs futures dans le dashboard.

Améliorations UX/UI  
- Notifications (Toasts) : Remplacer les alert() et window.confirm() par des composants de notification non bloquants (Toast).
- Loader Squelette : Remplacer le texte "Chargement..." par des "Skeletons" pour une meilleure expérience visuelle.
- Gestion des erreurs : Afficher des messages d'erreur plus précis (ex: "Connexion perdue") dans l'UI.

Technique / Phase 2  
- Connexion API Réelle : Remplacer api.mock.ts par un service utilisant axios ou fetch pour communiquer avec le vrai Backend Java/Node.
- Tests : Ajouter des tests unitaires (Vitest) pour les utilitaires de date et le service de mock.