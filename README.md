# Seine Gestion Privée — Espace patrimonial

Application web installable (PWA) de suivi de patrimoine pour family office, avec
authentification réelle, base de données sécurisée et back-office cabinet.

Stack : React + Vite (front) · Supabase (auth + PostgreSQL en UE) · PWA installable.

---

## 1. Prérequis

- **Node.js** version LTS (https://nodejs.org)
- Un compte **Supabase** gratuit (https://supabase.com)

## 2. Créer le projet Supabase

1. Sur supabase.com : **New project**.
2. **Important** : choisir une **région en Union européenne** (ex. *West EU (Frankfurt)*) — exigence RGPD.
3. Noter le mot de passe de la base.
4. Une fois le projet créé, aller dans **SQL Editor > New query**, coller le contenu de
   `supabase/schema.sql`, puis **Run**. Cela crée les tables, le cloisonnement (RLS),
   le registre de consentement et le journal d'accès.
5. Dans **Authentication > Providers**, garder *Email* activé. Pour la sécurité, activer
   la **2FA (MFA)** dans **Authentication > Settings**.

> **Base déjà créée ?** Exécutez les migrations du dossier `supabase/` qui ne sont pas
> encore appliquées, notamment `migration-historique.sql` (table `net_worth_snapshots`)
> qui alimente la **courbe de progression du patrimoine**. Sans cette table, l'app
> fonctionne mais la courbe se limite au point du jour.

## 3. Récupérer les clés

Dans **Project Settings > API**, copier :
- *Project URL*
- *anon public key* (la clé publique — sa sécurité repose sur les règles RLS, pas sur le secret)

Ne **jamais** utiliser la clé `service_role` côté navigateur.

## 4. Configurer le projet en local

```bash
cp .env.example .env
```

Éditer `.env` et coller vos deux valeurs :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

## 5. Lancer en local

```bash
npm install
npm run dev
```

Ouvrir l'URL affichée (http://localhost:5173). Créez un compte : il apparaît dans
Supabase sous **Authentication > Users**, et un profil est créé automatiquement.

## 6. Déployer gratuitement (Vercel)

1. Pousser le dossier sur un dépôt GitHub.
2. Sur https://vercel.com : **Add New > Project**, importer le dépôt.
3. Dans **Environment Variables**, ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
4. **Deploy**. Vercel fournit une URL `https://...vercel.app` en HTTPS.

(Netlify et Cloudflare Pages fonctionnent à l'identique.)

## 7. Installer sur le téléphone

- **iPhone** : ouvrir l'URL dans Safari → Partager → *Sur l'écran d'accueil*.
- **Android** : ouvrir dans Chrome → menu → *Installer l'application*.

L'app s'ouvre en plein écran, avec icône, comme une app native.

---

## Définir un compte conseiller (back-office)

Par défaut, tout nouveau compte a le rôle `client`. Pour activer votre vue cabinet :

1. Créez votre compte via l'app.
2. Dans Supabase, **Table Editor > profiles**, passez votre ligne `role` à `advisor`.
3. Pour rattacher des clients à vous : sur chaque profil client, renseignez
   `advisor_id` avec votre identifiant (`id`).

Une fois conseiller, une bascule **Vue client / Mes clients** apparaît en haut de l'app.

---

## Structure

```
seine-gestion/
├─ supabase/schema.sql          Schéma base de données (à exécuter dans Supabase)
├─ src/
│  ├─ lib/
│  │  ├─ supabase.js            Client Supabase
│  │  └─ data.js                Accès données : auth, actifs, consentements
│  ├─ components/
│  │  ├─ Auth.jsx               Connexion + inscription (consentements RGPD)
│  │  ├─ ClientApp.jsx          App patrimoine (patrimoine, actifs, TRI, analyse)
│  │  └─ BackOffice.jsx         Vue cabinet : clients + patrimoine consolidé
│  ├─ App.jsx                   Session, routage par rôle, en-tête
│  └─ main.jsx
├─ docs/SECURITE-RGPD.md        Guide sécurité & conformité
└─ index.html
```

Voir `docs/SECURITE-RGPD.md` pour les obligations avant toute mise en production
avec des données client réelles.
