# Mise en production — ouverture aux particuliers

Guide opérationnel pour distribuer « Mon Kap Pat » au grand public.
Complète `SECURITE-RGPD.md` (qui détaille les fondations déjà en place).

- **Service** : Mon Kap Pat
- **Éditeur / responsable de traitement** : Seine Gestion Privée, représentée par M. Julien DANIEL (Président)

Les étapes ci-dessous se règlent dans vos tableaux de bord (Supabase / Vercel /
prestataires) : elles ne peuvent pas être faites depuis le code.

---

## A. Juridique & RGPD — *obligatoire avant ouverture*

1. **Compléter les pages légales** intégrées à l'app (écran « Confidentialité / CGU /
   Mentions légales »). Remplir toutes les zones `⟨entre chevrons⟩` :
   - forme juridique, capital, SIREN/SIRET, RCS, adresse du siège, n° TVA ;
   - hébergeurs (adresses officielles) ;
   - médiateur de la consommation (obligatoire si vente à des particuliers) ;
   - durées de conservation ;
   - modèle tarifaire (gratuit / payant).
2. **Faire valider ces textes par un juriste**, puis **retirer le bandeau d'avertissement**
   (dans `src/components/Legal.jsx`).
3. **DPIA / AIPD** (analyse d'impact) : un traitement de données financières à grande
   échelle l'exige très probablement (modèle CNIL disponible sur cnil.fr).
4. **Accord de sous-traitance (DPA)** signé/accepté avec **Supabase** et **Vercel**
   (et le prestataire e-mail). Vérifier la **région UE** de la base Supabase.
5. **Registre des traitements** (art. 30 RGPD) tenu par Seine Gestion Privée.
6. **Procédure de violation de données** : savoir notifier la CNIL sous **72 h**.
7. **Contact data** : confirmer l'adresse de contact RGPD affichée dans l'app
   (`j.daniel@hexa-patrimoine.com`) — l'aligner avec l'entité si besoin.

> Ligne à ne pas franchir : tant que l'app reste un **outil de suivi** (saisie manuelle,
> aucune recommandation personnalisée, aucune connexion bancaire), vous **n'êtes pas**
> soumis au statut CIF/AMF ni à la DSP2. Ne pas ajouter de conseil personnalisé ni
> d'agrégation bancaire sans le cadre réglementaire correspondant.

---

## B. Supabase — passage en production

Tableau de bord Supabase → projet :

- **Plan payant** (Settings → Billing) : la formule gratuite **met le projet en pause**
  après inactivité — inacceptable pour du public.
- **Sauvegardes** (Database → Backups) : vérifier la rétention, idéalement le
  *Point-in-Time Recovery*. **Tester une restauration** au moins une fois.
- **Région UE** : confirmer (Settings → General). Si le projet n'est pas en UE, en recréer
  un en UE et migrer.
- **Politique de mot de passe** (Authentication → Policies) : longueur min. 12, et activer
  **« Leaked password protection »** (refus des mots de passe compromis).
- **MFA / 2FA** (Authentication → Settings) : activer TOTP.
- **Rate limits** (Authentication → Rate Limits) : conserver des limites raisonnables sur
  l'inscription et l'envoi d'e-mails.
- **URL de redirection** (Authentication → URL Configuration) — *indispensable pour la
  confirmation d'e-mail et le « mot de passe oublié »* :
  - **Site URL** = votre domaine de production (voir section E) ;
  - **Redirect URLs** = ce même domaine (+ `http://localhost:5173` pour le développement).
- **Revue des règles RLS** par une personne compétente avant ouverture.

---

## C. E-mails fiables (SMTP dédié) — *fortement recommandé*

L'envoi d'e-mails par défaut de Supabase est **plafonné (quelques mails/heure)** et finit
souvent en spam : bloquant pour les confirmations d'inscription et le « mot de passe oublié ».

1. Créer un compte chez un fournisseur : **Resend**, **Brevo**, **Postmark** ou SendGrid.
2. **Authentifier votre domaine** (enregistrements DNS SPF + DKIM) côté fournisseur.
3. Supabase → Authentication → **Emails → SMTP Settings** : renseigner hôte, port,
   identifiant, mot de passe, et l'**adresse expéditrice** (ex. `no-reply@monkappat.fr`).
4. Personnaliser les modèles d'e-mails (Authentication → Emails → Templates) : confirmation,
   réinitialisation de mot de passe.

---

## D. Anti-robots à l'inscription (captcha)

Pour éviter les créations de comptes en masse :

1. Créer un site **hCaptcha** ou **Cloudflare Turnstile** (gratuit) → récupérer la *site key*
   et la *secret key*.
2. Supabase → Authentication → **Settings → Bot and Abuse Protection** : activer le captcha,
   coller la *secret key*.
3. Côté app : ajouter le widget captcha sur le formulaire d'inscription et transmettre le
   token à `signUp` (`options: { captchaToken }`). *(Petit ajout de code — je peux le faire
   une fois vos clés obtenues.)*

---

## E. Nom de domaine + diffusion

- **Acheter un domaine** (ex. `monkappat.fr`) et le brancher sur Vercel :
  Project → Settings → **Domains** → *Add* → suivre les enregistrements DNS.
- Mettre à jour **Site URL / Redirect URLs** dans Supabase (section B) avec ce domaine.
- **Installation par les utilisateurs** (PWA, déjà fonctionnel) :
  - iPhone : Safari → Partager → *Sur l'écran d'accueil* ;
  - Android : Chrome → menu → *Installer l'application*.
- Stores (optionnel, plus tard) : la PWA peut être empaquetée pour Google Play (PWABuilder).
  L'App Store d'Apple est plus exigeant ; commencer par le web/PWA.

---

## F. Performance & supervision

- **Bundle** déjà découpé (react / recharts / supabase en chunks séparés). Gain
  supplémentaire possible : chargement différé de la librairie de graphiques (recharts)
  uniquement sur l'onglet d'analyse.
- **Suivi des erreurs** : brancher **Sentry** (gratuit pour un petit volume).
- **Disponibilité** : une sonde *uptime* (UptimeRobot, Better Stack…).

---

## G. Checklist finale avant ouverture

- [ ] Pages légales complétées, validées juridiquement, bandeau retiré
- [ ] DPIA réalisée · DPA Supabase & Vercel · registre art. 30 · procédure violation 72 h
- [ ] Supabase : plan payant · région UE · backups testés · politique mdp + leaked protection · MFA
- [ ] Site URL / Redirect URLs configurées (confirmation + reset de mot de passe testés)
- [ ] SMTP dédié configuré et e-mails reçus hors spam
- [ ] Captcha activé à l'inscription
- [ ] Domaine de production branché (HTTPS)
- [ ] Sentry + sonde uptime
- [ ] Bêta privée avec quelques utilisateurs réels → puis ouverture au public
