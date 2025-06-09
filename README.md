# Application de Prise de Notes

Une application moderne de prise de notes développée avec Next.js et Tailwind CSS, offrant une interface intuitive et des fonctionnalités avancées pour organiser vos idées.

## 🚀 Fonctionnalités

### Interface Utilisateur
- ✨ Design minimaliste et intuitif
- 🌙 Mode sombre/clair avec détection automatique du système
- 📱 Interface responsive pour tous les appareils
- 🔄 Navigation fluide entre les notes
- 📋 Vue liste et vue grille des notes

### Fonctionnalités Essentielles
- ✏️ Création, modification et suppression de notes
- 🎨 Formatage de texte riche (Markdown)
  - Gras, italique, souligné
  - Listes à puces et numérotées
  - Citations et code
  - Liens et images
- 🔍 Recherche rapide dans les notes
- 🏷️ Système de catégories et tags
- ⭐ Option de favoris
- 🔒 Protection par mot de passe

### Organisation
- 📅 Classement par date, titre ou catégorie
- 📁 Système de dossiers et catégories
- 📦 Fonction d'archivage
- 🔄 Tri personnalisable
- 🎯 Filtres avancés

### Sauvegarde et Export
- 💾 Sauvegarde automatique
- 🌐 Stockage local (localStorage)
- 📄 Exportation en différents formats :
  - PDF
  - TXT
  - Markdown
- 📥 Importation de fichiers texte

### Fonctionnalités Avancées
- 📎 Support des pièces jointes
- 👁️ Mode aperçu Markdown en temps réel
- 📊 Statistiques de contenu (caractères, mots, lignes)
- ⚡ Auto-sauvegarde intelligente
- 🎨 Éditeur avec barre d'outils de formatage

## 🛠️ Technologies Utilisées

- **Framework**: Next.js 14 avec App Router
- **Styling**: Tailwind CSS avec mode sombre
- **Language**: TypeScript
- **Icons**: Lucide React
- **Markdown**: React Markdown avec support GFM
- **Date**: date-fns avec localisation française
- **State Management**: React Context API
- **Storage**: localStorage pour la persistance

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd app-prise-de-notes
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

4. **Ouvrir l'application**
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Structure du Projet

```
app-prise-de-notes/
├── app/                    # App Router de Next.js
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── layout/           # Composants de mise en page
│   │   ├── Header.tsx    # En-tête avec recherche
│   │   └── Sidebar.tsx   # Barre latérale
│   ├── notes/            # Composants liés aux notes
│   │   ├── NoteCard.tsx  # Carte de note
│   │   ├── NoteEditor.tsx # Éditeur de note
│   │   └── NotesList.tsx # Liste des notes
│   ├── providers/        # Providers React Context
│   │   ├── NotesProvider.tsx # Gestion des notes
│   │   └── ThemeProvider.tsx # Gestion du thème
│   └── ui/               # Composants UI réutilisables
│       ├── Button.tsx    # Bouton personnalisé
│       └── DropdownMenu.tsx # Menu déroulant
├── hooks/                # Hooks personnalisés
│   ├── useNotes.ts      # Hook pour les notes
│   └── useTheme.ts      # Hook pour le thème
├── lib/                  # Utilitaires
│   └── utils.ts         # Fonctions utilitaires
└── public/              # Fichiers statiques
```

## 🎯 Utilisation

### Créer une Note
1. Cliquez sur "Nouvelle note" dans la barre latérale
2. Donnez un titre à votre note
3. Rédigez le contenu en utilisant la syntaxe Markdown
4. Ajoutez des tags et sélectionnez une catégorie
5. La note est sauvegardée automatiquement

### Organiser les Notes
- **Catégories** : Organisez vos notes par thème (Personnel, Travail, Projets, Idées)
- **Tags** : Ajoutez des mots-clés pour faciliter la recherche
- **Favoris** : Marquez les notes importantes avec l'étoile
- **Archive** : Archivez les notes anciennes sans les supprimer

### Recherche et Filtres
- Utilisez la barre de recherche pour trouver des notes par titre, contenu ou tags
- Filtrez par catégorie, favoris ou notes archivées
- Triez par date de création, modification, titre ou catégorie

### Formatage du Texte
L'éditeur supporte la syntaxe Markdown :
- `**gras**` pour le **gras**
- `*italique*` pour l'*italique*
- `# Titre` pour les titres
- `- item` pour les listes
- `> citation` pour les citations
- `` `code` `` pour le code inline

### Thèmes
- **Clair** : Thème par défaut avec fond blanc
- **Sombre** : Thème sombre pour réduire la fatigue oculaire
- **Système** : Suit automatiquement les préférences du système

## 🔧 Personnalisation

### Ajouter de Nouvelles Catégories
Modifiez le tableau `defaultCategories` dans `components/providers/NotesProvider.tsx`

### Modifier les Couleurs
Personnalisez les couleurs dans `tailwind.config.js`

### Ajouter des Fonctionnalités
Les composants sont modulaires et peuvent être facilement étendus

## 🚀 Déploiement

### Build de Production
```bash
npm run build
npm start
```

### Déploiement sur Vercel
1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement Next.js
3. Déployez en un clic

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Si vous rencontrez des problèmes ou avez des questions :
1. Vérifiez les issues existantes
2. Créez une nouvelle issue avec une description détaillée
3. Incluez les étapes pour reproduire le problème

## 🔮 Roadmap

- [ ] Synchronisation cloud (Google Drive, Dropbox)
- [ ] Collaboration en temps réel
- [ ] Application mobile (React Native)
- [ ] Plugin pour navigateurs
- [ ] API REST pour intégrations
- [ ] Chiffrement end-to-end
- [ ] Rappels et notifications
- [ ] Templates de notes
- [ ] Système de versions
- [ ] Intégration avec calendriers

---

**Développé avec ❤️ en utilisant Next.js et Tailwind CSS**