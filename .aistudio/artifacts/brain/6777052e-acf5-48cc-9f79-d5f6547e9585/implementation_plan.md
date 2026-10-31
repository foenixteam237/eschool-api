# Audit de Sécurité, Durcissement RBAC et Vérification des Routes (MINESEC ERP)

Plan de durcissement technique et de tests automatisés pour l'API eSchool, garantissant l'intégrité des données scolaires camerounaises, le respect strict des prérogatives selon les profils (SuperAdmin, Admin/Proviseur, Enseignant, Élève, Parent) et l'absence de failles exploitables avant présentation au MINESEC.

## Décisions Validées et Choix Critiques

> [!IMPORTANT]
> Les choix suivants ont été confirmés lors de la phase de cadrage :
> - **Périmètre** : Audit de sécurité approfondi combiné à une suite de vérification automatisée couvrant 100 % des routes de l'API.
> - **Priorité de sécurité** : Contrôle d'accès basé sur les rôles (RBAC) et séparation stricte des privilèges (empêcher l'élévation de privilèges, la modification frauduleuse de notes ou l'accès aux finances par des élèves/tiers).
> - **Action** : Application directe des correctifs et renforcements identifiés dans le codebase.

- **Décision confirmée 1** : Mise en place d'un décorateur `@Roles(...)` et d'un `RolesGuard` universel pour protéger les endpoints sensibles (création/suppression de classes, saisie de notes réservée aux enseignants/admins, validation de paiements réservée à l'intendance).
- **Décision confirmée 2** : Masquage systématique des hachages de mots de passe (`password`) dans toutes les réponses API (actuellement renvoyés dans certains expands de relations).
- **Décision confirmée 3** : Rétablissement d'une configuration `.env` saine et résiliente suite à la suppression du fichier par l'utilisateur.

---

## 1. Vue d'ensemble & Objectifs de Sécurité

### Objectifs
1. **Zéro faille d'autorisation (BOLA / IDOR)** : Un élève ne doit pouvoir consulter que ses propres notes et paiements ; un enseignant ne doit pouvoir modifier que les notes de ses classes assignées ; seul le proviseur/intendant peut valider les opérations financières et structurelles.
2. **Confidentialité des identifiants** : Élimination totale des fuites de hashes bcrypt dans les requêtes de profils et listes d'utilisateurs.
3. **Disponibilité & Résilience** : Protection contre les requêtes abusives (Rate Limiting / Throttling), assainissement strict des entrées (ValidationPipe avec whitelist), et gestion uniforme des exceptions sans divulgation de traces de pile internes (stack traces).
4. **Vérification systématique** : Exécution d'un script de test automatisé validant le code HTTP attendu (200, 201, 401, 403, 404) pour chaque route de l'application.

---

## 2. Matrice des Rôles & Permissions (RBAC MINESEC)

| Module / Ressource | Élève (STUDENT) | Enseignant (TEACHER) | Administration (ADMIN) | Visiteur (PUBLIC) |
| :--- | :---: | :---: | :---: | :---: |
| **Authentification** (`/auth/*`) | Connexion, Profil propre | Connexion, Profil propre | Inscription, Gestion comptes | Connexion, Doc Swagger |
| **Établissements** (`/schools/*`) | Lecture seule | Lecture seule | Création, Modification, Stats | Aucun |
| **Classes** (`/classes/*`) | Lecture seule | Lecture classe assignée | CRUD complet | Aucun |
| **Matières** (`/subjects/*`) | Lecture seule | Lecture | CRUD complet | Aucun |
| **Élèves** (`/students/*`) | Fiche & Relevé propres | Liste de ses classes | Inscription, Modification, Suppression | Aucun |
| **Notes & Bulletins** (`/grades/*`) | Consultation relevé propre | Saisie & modification de notes | Validation PV, Délibération, Stats | Aucun |
| **Assiduité** (`/attendance/*`) | Consultation propre | Appel & pointage | Justification, Rapports classe | Aucun |
| **Finances & MoMo** (`/payments/*`) | Consultation due, Paiement MoMo | Aucun accès | Émission de frais, Reçus, Rapprochement | Aucun |
| **Vie Scolaire** (`/discipline/*`) | Consultation billets propres | Signalement d'incidents | Délivrance de billets, Sanctions | Aucun |

---

## 3. Analyse des Vulnérabilités Détectées & Correctifs

### Faille 1 : Absence de vérification des rôles (`RolesGuard`)
- **Constat** : Tous les contrôleurs utilisent actuellement `@UseGuards(JwtAuthGuard)` sans vérifier si le rôle de l'utilisateur connecté (`ADMIN`, `TEACHER`, `STUDENT`) a le droit d'exécuter l'action. N'importe quel élève muni d'un token JWT pouvait appeler `DELETE /api/v1/classes/:id` ou `POST /api/v1/grades`.
- **Correctif** :
  - Création du décorateur `@Roles(...roles: Role[])` dans `src/auth/decorators/roles.decorator.ts`.
  - Création de `RolesGuard` dans `src/auth/guards/roles.guard.ts` vérifiant `req.user.role`.
  - Application du guard sur les contrôleurs sensibles (`SchoolsController`, `ClassesController`, `GradesController`, `PaymentsController`, `DisciplineController`).

### Faille 2 : Fuite des hashes de mots de passe
- **Constat** : Dans `PrismaService` et `StudentsService`, l'inclusion de `user: true` renvoie l'objet utilisateur complet contenant `password: "$2a$10$..."`.
- **Correctif** : Assainissement automatique dans `TransformInterceptor` ou exclusion explicite des champs `password` pour ne renvoyer que `{ id, email, firstName, lastName, role, phone }`.

### Faille 3 : Validation et assainissement des entrées
- **Constat** : `ValidationPipe` est déjà configuré avec `whitelist: true` et `forbidNonWhitelisted: true`, ce qui empêche l'injection de propriétés malveillantes (Mass Assignment).
- **Renforcement** : Ajout de limites de taille de payload sur Express (`express.json({ limit: '10mb' })`) et configuration des en-têtes HTTP de sécurité.

### Faille 4 : Environnement `.env` supprimé
- **Constat** : Le fichier `.env` a été supprimé par l'utilisateur.
- **Correctif** : Recréation immédiate d'un `.env` sécurisé contenant les secrets JWT et configurations locales nécessaires.

---

## 4. Architecture & Flux de Contrôle d'Accès

```
Requête Client (ex: DELETE /api/v1/classes/cls_1)
   │
   ▼
┌────────────────────────────────────────────────────────┐
│ Express Ingress (Port 3000)                            │
│ ├─ En-têtes CORS stricts & Payload Limiter            │
│ └─ Global Exception Filter (Pas de fuite stack trace) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ NestJS Pipeline                                        │
│ ├─ ValidationPipe (Whitelist & type checking)          │
│ ├─ JwtAuthGuard (Validation signature & expiration)    │
│ └─ RolesGuard (Vérification @Roles('ADMIN'))          │
└──────────────────────────┬─────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
       [Non Autorisé]                [Autorisé]
            │                             │
            ▼                             ▼
   HTTP 403 Forbidden             Contrôleur & Service
                                          │
                                          ▼
                                TransformInterceptor
                             (Masquage hashes & métadonnées)
                                          │
                                          ▼
                                   HTTP 200 / 201 OK
```

---

## 5. Plan de Test et de Validation Automatisée

Une suite de tests automatisée sous forme de script de vérification (`scripts/verify-all-routes.sh` ou test Jest e2e) sera exécutée pour vérifier :
1. **Test des routes publiques** :
   - `GET /` -> Redirection 302 vers Swagger UI
   - `GET /api/v1/docs` -> 200 OK (Swagger interactif)
   - `POST /api/v1/auth/login` -> 200 OK avec JWT
2. **Test des rejets sans authentification (401 Unauthorized)** sur l'ensemble des 8 modules protégés.
3. **Test du contrôle d'accès RBAC (403 Forbidden)** :
   - Un compte `STUDENT` tentant de créer une classe (`POST /classes`) -> rejeté en 403.
   - Un compte `STUDENT` tentant de modifier une note (`PATCH /grades/:id`) -> rejeté en 403.
   - Un compte `TEACHER` saisissant une note -> accepté en 200.
   - Un compte `ADMIN` administrant les établissements -> accepté en 200.
4. **Vérification de l'absence de fuite de mots de passe** dans toutes les réponses JSON.
