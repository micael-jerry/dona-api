# Checklist de suivi — Projet Dona

> Cette checklist suit un ordre de priorité logique : chaque phase s'appuie sur la précédente.
> Coche au fur et à mesure (`[x]`) et ajoute des notes si besoin.

---

## Phase 0 — Cadrage d'équipe

- [ ] Rôles assignés (PO, PM/Scrum Master, Tech Lead, Développeurs)
- [ ] Outil de suivi des tâches choisi (Trello, GitHub Issues, etc.)
- [ ] Canal de communication d'équipe choisi (Discord, Slack, etc.)
- [ ] Rythme de réunion défini (hebdo / bi-hebdo)
- [ ] Liste finale des modules choisis validée par toute l'équipe
- [ ] Répartition initiale des modules par membre

---

## Phase 1 — Fondations : Authentification & Compte utilisateur

*Rien ne peut être testé sérieusement sans ça, c'est la priorité absolue.*

- [ ] Inscription (email + mot de passe)
- [ ] Connexion / déconnexion
- [ ] Sécurisation des mots de passe (hash + salage)
- [ ] Validation des champs (frontend + backend)
- [ ] Page de profil basique (voir ses infos)
- [ ] Modification des informations de profil
- [ ] Upload d'avatar (avec avatar par défaut)
- [ ] Connexion via OAuth (Google / GitHub / 42)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Pages Politique de confidentialité et Conditions d'utilisation (accessibles, contenu réel)

---

## Phase 2 — Cœur de l'application : Carte & Signalements

*Le produit "Dona" prend forme ici.*

- [ ] Affichage de la carte
- [ ] Localisation en temps réel de l'utilisateur
- [ ] Mise à jour en direct de la position sur la carte (autres utilisateurs visibles)
- [ ] Création d'un signalement (choix d'une catégorie prédéfinie)
- [ ] Ajout de photo / pièce jointe à un signalement
- [ ] Affichage des signalements sur la carte
- [ ] Détails d'un signalement (catégorie, heure, auteur, photo)
- [ ] Suppression / modification d'un signalement (par son auteur)

---

## Phase 3 — Interaction sociale autour des signalements

- [ ] Système d'amis (ajouter / retirer / liste d'amis)
- [ ] Statut en ligne visible sur le profil
- [ ] Canal de discussion public rattaché à chaque signalement
- [ ] Envoi / réception de messages en temps réel dans ce canal
- [ ] Réactions sur un signalement (like, confirmation, etc.)
- [ ] Historique des messages conservé
- [ ] Indicateur "en train d'écrire" / accusés de lecture (option avancée)
- [ ] Possibilité de bloquer un utilisateur
- [ ] Invitation / notification depuis le chat

---

## Phase 4 — Fiabilité de l'information (le cœur différenciant de Dona)

- [ ] Calcul de la véracité d'un signalement selon le nombre de confirmations
- [ ] Affichage visuel du niveau de fiabilité (couleur, badge, pourcentage…)
- [ ] Système de notoriété : score qui augmente quand un utilisateur publie des signalements confirmés vrais
- [ ] Affichage de la notoriété sur le profil
- [ ] Expiration / archivage automatique des signalements trop anciens ou invalidés

---

## Phase 5 — Gestion des utilisateurs avancée

- [ ] Rôles (utilisateur, modérateur, administrateur)
- [ ] Vue et actions différentes selon le rôle
- [ ] CRUD complet des utilisateurs (vue admin)
- [ ] Création d'organisations (mairie, police, société de transport, etc.)
- [ ] Ajout / retrait d'utilisateurs dans une organisation
- [ ] Actions spécifiques pour une organisation (créer, consulter, valider un signalement officiellement)

---

## Phase 6 — Notifications & recherche

- [ ] Notifications pour un signalement proche du trajet de l'utilisateur
- [ ] Notifications pour les réactions / messages reçus
- [ ] Recherche de signalements avec filtres (catégorie, date, zone)
- [ ] Tri et pagination des résultats de recherche

---

## Phase 7 — Intelligence Artificielle

- [ ] Reconnaissance d'image : vérifier que la photo correspond à la catégorie déclarée
- [ ] Modération automatique de contenu (signalements/messages abusifs ou suspects)
- [ ] Système de recommandation d'itinéraire évitant les zones à risque confirmées

---

## Phase 8 — Données & conformité

- [ ] Tableau de bord analytique (zones à risque, heatmap, statistiques d'usage)
- [ ] Export de données (CSV/JSON)
- [ ] Fonctionnalités RGPD : demande de ses données, suppression de compte, export lisible

---

## Phase 9 — Sécurité & infrastructure

- [ ] Protection des accès et des secrets (clés API, identifiants)
- [ ] Surveillance de l'application (tableau de bord de monitoring)
- [ ] Page de statut / vérification de bon fonctionnement + sauvegardes automatiques

---

## Phase 10 — Accessibilité & international

- [ ] Support multilingue (au moins 3 langues, ex: français, malgache, anglais)
- [ ] Sélecteur de langue dans l'interface
- [ ] Vérification de la compatibilité sur plusieurs navigateurs
- [ ] Vérification de l'accessibilité (navigation clavier, lecteurs d'écran)

---

## Phase 11 — Fonctionnalité phare additionnelle (module de choix)

- [ ] Recalcul d'itinéraire en temps réel qui évite les zones à forte densité de signalements confirmés
- [ ] Justification rédigée de cette fonctionnalité pour le README

---

## Phase 12 — Finalisation

- [ ] Vérification : aucune erreur/warning dans la console navigateur
- [ ] Test avec plusieurs utilisateurs simultanés (pas de bug de concurrence)
- [ ] Lancement de l'application via une seule commande
- [ ] Rédaction complète du README.md (description, instructions, ressources, équipe, modules, contributions individuelles)
- [ ] Répétition de la présentation orale / démonstration des modules
- [ ] Vérification finale de la liste des modules retenus vs points visés

---

## Suivi des points de modules (à mettre à jour au fil du projet)

| Module | Type | Points | Statut |
|---|---|---|---|
| | | | ⬜ À faire / 🟨 En cours / ✅ Fait |

**Total points visé :** ___ / 14 minimum