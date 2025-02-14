CREATE DATABASE IF NOT EXISTS db_unesco;

use db_unesco;

CREATE TABLE t_user(
   user_id INT AUTO_INCREMENT,
   username VARCHAR(50),
   prenom VARCHAR(50) NOT NULL,
   nom VARCHAR(50) NOT NULL,
   email VARCHAR(50) NOT NULL,
   password VARCHAR(256) NOT NULL,
   salt VARCHAR(50) NOT NULL,
   dateCreation DATETIME,
   PRIMARY KEY(user_id),
   UNIQUE(email)
);

CREATE TABLE t_publication(
   publication_id INT AUTO_INCREMENT,
   contenu TEXT,
   datePublication DATETIME NOT NULL,
   nbLikes INT NOT NULL,
   sujet VARCHAR(256) NOT NULL,
   user_id INT NOT NULL,
   PRIMARY KEY(publication_id),
   FOREIGN KEY(user_id) REFERENCES t_user(user_id)
);

CREATE TABLE t_liste_favoris(
   liste_favoris_id INT AUTO_INCREMENT,
   titre VARCHAR(256),
   user_id INT NOT NULL,
   PRIMARY KEY(liste_favoris_id),
   FOREIGN KEY(user_id) REFERENCES t_user(user_id)
);

CREATE TABLE t_historique(
   historique_id INT AUTO_INCREMENT,
   siteConsulte VARCHAR(256),
   user_id INT NOT NULL,
   PRIMARY KEY(historique_id),
   FOREIGN KEY(user_id) REFERENCES t_user(user_id)
);

CREATE TABLE SITES(
   site_id INT AUTO_INCREMENT,
   nom VARCHAR(100),
   description TEXT,
   lon DECIMAL(5,5),
   lat DECIMAL(5,5),
   categorie VARCHAR(50),
   PRIMARY KEY(site_id)
);

CREATE TABLE contenir(
   historique_id INT,
   site_id INT,
   PRIMARY KEY(historique_id, site_id),
   FOREIGN KEY(historique_id) REFERENCES t_historique(historique_id),
   FOREIGN KEY(site_id) REFERENCES SITES(site_id)
);

CREATE TABLE avoir(
   liste_favoris_id INT,
   site_id INT,
   PRIMARY KEY(liste_favoris_id, site_id),
   FOREIGN KEY(liste_favoris_id) REFERENCES t_liste_favoris(liste_favoris_id),
   FOREIGN KEY(site_id) REFERENCES SITES(site_id)
);
