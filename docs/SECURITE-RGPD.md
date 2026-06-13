# Sécurité & conformité RGPD — à lire avant la production

Ce socle est nettement plus sûr que le prototype initial (auth réelle, base
cloisonnée, registre de consentement). Mais avant de l'utiliser avec des
**données de clients réels**, plusieurs points relèvent de votre responsabilité
de CIF et ne peuvent pas être réglés par le seul code.

## Ce que ce socle apporte déjà

- **Authentification serveur** via Supabase Auth : mots de passe hachés, jamais
  stockés ni manipulés côté navigateur.
- **Cloisonnement par Row Level Security** : appliqué au niveau de la base. Un
  client ne voit que ses données ; un conseiller ne voit que ses clients. Même
  une faille applicative ne contourne pas cette barrière.
- **Registre de consentement** horodaté, versionné et immuable (table `consents`).
- **Journal d'accès** (table `access_logs`) pour tracer les consultations.
- **Transport chiffré** (HTTPS) automatique chez Supabase et les hébergeurs front.
- **Hébergement UE** si vous choisissez une région européenne à la création.

## Ce qui reste à mettre en place avant la production

### Sécurité
- **Activer la 2FA (MFA)** dans Supabase Auth — fortement recommandé vu la
  sensibilité patrimoniale.
- **Renseigner l'adresse IP des consentements** côté serveur : le client ne peut
  pas fournir une IP fiable. Prévoir une *Edge Function* Supabase qui insère le
  consentement avec l'IP réelle de la requête.
- **Politique de mots de passe** : imposer la longueur minimale côté Supabase Auth.
- **Sauvegardes** : vérifier la rétention dans Database > Backups.
- **Revue des règles RLS** par une personne compétente avant ouverture.

### Conformité RGPD / réglementaire
- **Politique de confidentialité et CGU** réelles, rédigées ou validées
  juridiquement. Les textes de l'app sont des placeholders.
- **Registre des traitements** (article 30 RGPD) tenu par le cabinet.
- **Procédures effectives** pour les droits : accès, rectification, effacement,
  portabilité, retrait du consentement. Prévoir les requêtes/fonctions
  correspondantes (export JSON des données d'un client, suppression en cascade).
- **Mention du responsable de traitement** et, le cas échéant, du DPO.
- **Information AMF / statut CIF** : l'analyse de risques et les simulations TRI
  sont présentées comme *informatives*. Dès qu'une recommandation personnalisée
  d'investissement est délivrée, le cadre du conseil réglementé s'applique
  (questionnaire d'adéquation, DER, traçabilité). Ne pas franchir cette ligne
  sans le cadrage correspondant.

### Agrégation bancaire (si ajoutée plus tard)
- Ne **jamais** collecter ni stocker les identifiants bancaires des clients.
- Passer par un **prestataire agréé** DSP2/AIS (Powens, Bridge, Tink) qui détient
  l'agrément et gère la connexion. Vous ne stockez que des références de connexion.

## Limite honnête

Ce dépôt est un socle de démarrage sérieux, pas un produit certifié. La mise en
production avec des données client engage votre responsabilité professionnelle.
Pour cette étape, faire valider l'architecture (RLS, chiffrement, conformité) par
un développeur expérimenté et, pour le volet réglementaire, par votre conformité
ou un conseil juridique spécialisé.
