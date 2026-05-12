# DeePat Studio

Site officiel de DeePat Studio, studio indépendant à Montréal fondé par Patrick Séguin.

Le site est construit avec Astro + React et déployé sur GitHub Pages avec le domaine `deepatstudio.com`.

## Développement

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

La build statique est générée dans `dist/`.

## Déploiement

Le workflow `.github/workflows/deploy.yml` publie automatiquement le site sur GitHub Pages lors des pushes sur `main`.

Le fichier `public/CNAME` conserve le domaine personnalisé.
