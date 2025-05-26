# P_Dev-426

## Démarrage avec Docker

Utilisez le fichier `docker-compose.yml` pour lancer le projet.

### Commande :

```bash
docker-compose up -d
```
Cette commande va démarrer les services définis dans le fichier docker-compose.yml en mode détaché.

Remarque :
Assurez-vous d’être positionné dans le dossier où se trouve le fichier docker-compose.yml avant d’exécuter la commande.

---

## Base de Données

Vous trouverez la base de données à l’emplacement suivant : `\app\BaseDonnée\db_unesco.sql`.


Vous pouvez ensuite l’ouvrir et la gérer à l’aide de votre gestionnaire de base de données préféré, comme :

- **DBeaver**
- **phpMyAdmin**
- **MySQL Workbench**
- ou tout autre outil compatible.

---

## démarrer l'application

executer ces commandes

```
git clone https://github.com/Dtnexo/P_Dev-426.git
cd ./P_Dev-426/app/
npm i
cd ./static
copy map-key.js.example map-key.js
```

ensuite aller sur `https://cloud.maptiler.com/account/keys/` et créer un compte, si il n'y en a pas, créer une clé, sinon copier la clé dans `map-key.js`

Ensuite pour démarrer l'application

```
cd ..
npm start
```

l'application est accesible sur `http://localhost:3003`
