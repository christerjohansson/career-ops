# Mode : pipeline -- Inbox d'URLs (Second Brain)

Traite les URLs d'offres accumulees dans `data/pipeline.md`. Le candidat ajoute des URLs quand il veut et lance ensuite `/career pipeline` pour toutes les traiter d'un coup.

## Workflow

1. **Lire** `data/pipeline.md` -> trouver les items `- [ ]` dans la section "En attente" / "Pending" / "Pendientes"
2. **Pour chaque URL en attente** :
   a. **Extraire l'offre** avec Playwright (`browser_navigate` + `browser_snapshot`) -> WebFetch -> WebSearch
   b. Si l'URL n'est pas accessible -> marquer comme `- [!]` avec une note et continuer
   c. **Sauvegarder/Normaliser l'offre** : Sauvegarder le contenu extrait dans le dossier `jds/` avec un nom descriptif (ex: `jds/entreprise-role.md`). Si c'est deja un prefixe `local:`, verifier simplement que le fichier existe.
   d. **Deplacer de "En attente" vers "Traitees"** : `- [x] local:jds/fichier.md | Entreprise | Role`
3. **Si plusieurs URLs en attente**, lancer des agents en parallele (Agent tool avec `run_in_background`) pour maximiser la vitesse.
4. **A la fin**, afficher un tableau recapitulatif :

```
| Entreprise | Role | Fichier Local | Statut |
```

## Format de pipeline.md

```markdown
## En attente
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company SAS | Senior PM
- [!] https://private.url/job -- Erreur : login requis

## Traitees
- [x] local:jds/acme-sas-ai-pm.md | Acme SAS | AI PM
- [x] local:jds/bigco-sa.md | BigCo | SA
```

> Note : Les en-tetes de section peuvent etre en EN ("Pending"/"Processed"), ES ("Pendientes"/"Procesadas"), DE ("Offen"/"Verarbeitet") ou FR ("En attente"/"Traitees"). Etre flexible a la lecture, fidele au style existant a l'ecriture.

## Detection intelligente de l'offre depuis l'URL

1. **Playwright (prefere) :** `browser_navigate` + `browser_snapshot`. Fonctionne avec toutes les SPAs.
2. **WebFetch (fallback) :** Pour les pages statiques ou quand Playwright n'est pas disponible.
3. **WebSearch (dernier recours) :** Chercher sur des portails secondaires qui indexent l'offre.

**Cas particuliers :**
- **LinkedIn** : Peut necessiter un login -> marquer `[!]` et demander au candidat de coller le texte
- **PDF** : Si l'URL pointe vers un PDF, le lire directement avec le Read tool
- **Prefixe `local:`** : Lire le fichier local. Exemple : `local:jds/linkedin-pm-ai.md` -> lire `jds/linkedin-pm-ai.md`
- **Welcome to the Jungle / Indeed FR / APEC** : Portails francophones courants. Playwright gere bien les cookie banners
- **France Travail (ex-Pole emploi)** : Offres structurees, bien lisibles par machine. WebFetch suffit generalement

